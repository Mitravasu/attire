import fs from 'fs';
import path from 'path';
import { initializeDatabase } from './database';
import { InventoryService } from './inventoryService';
import { ValidStatus } from './types';

interface ImportConfig {
	sourceDirectory: string;
	defaultTags: string[];
	defaultStatus: ValidStatus;
	dryRun: boolean;
	generateTitlesFromFilenames: boolean;
	defaultColor?: string;
	defaultType?: string;
}

class BulkImporter {
	private config: ImportConfig;
	private uploadsDir: string;

	constructor(config: ImportConfig) {
		this.config = config;
		this.uploadsDir = path.join(__dirname, '..', 'uploads');

		// Ensure uploads directory exists
		if (!fs.existsSync(this.uploadsDir)) {
			fs.mkdirSync(this.uploadsDir, { recursive: true });
		}
	}

	/**
	 * Generate a clean title from filename
	 */
	private generateTitle(filename: string): string {
		// Remove extension and clean up the name
		const nameWithoutExt = path.parse(filename).name;

		// Replace underscores and dashes with spaces, remove numbers/timestamps
		let cleanName = nameWithoutExt
			.replace(/[-_]/g, ' ')
			.replace(/\d{4,}/g, '') // Remove long numbers (likely timestamps)
			.replace(/\s+/g, ' ') // Replace multiple spaces with single space
			.trim();

		// If the cleaned name is too short or empty, use a generic title
		if (cleanName.length < 3) {
			cleanName = 'Clothing Item';
		}

		// Capitalize first letter of each word
		return cleanName
			.split(' ')
			.map(
				(word) =>
					word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
			)
			.join(' ');
	}

	/**
	 * Check if file is a valid image
	 */
	private isValidImage(filename: string): boolean {
		const validExtensions = [
			'.jpg',
			'.jpeg',
			'.png',
			'.gif',
			'.bmp',
			'.webp',
		];
		const ext = path.extname(filename).toLowerCase();
		return validExtensions.includes(ext);
	}

	/**
	 * Generate unique filename for uploads directory
	 */
	private generateUniqueFilename(originalFilename: string): string {
		const ext = path.extname(originalFilename);
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		return `image-${uniqueSuffix}${ext}`;
	}

	/**
	 * Copy file to uploads directory
	 */
	private copyFileToUploads(
		sourcePath: string,
		targetFilename: string
	): string {
		const targetPath = path.join(this.uploadsDir, targetFilename);
		fs.copyFileSync(sourcePath, targetPath);
		return `/uploads/${targetFilename}`;
	}

	/**
	 * Process a single image file
	 */
	private async processImage(filepath: string): Promise<boolean> {
		try {
			const filename = path.basename(filepath);
			console.log(`Processing: ${filename}`);

			// Generate title
			const title = this.config.generateTitlesFromFilenames
				? this.generateTitle(filename)
				: 'Clothing Item';

			// Generate unique filename for uploads
			const uniqueFilename = this.generateUniqueFilename(filename);

			if (this.config.dryRun) {
				console.log(`  [DRY RUN] Would create item:`);
				console.log(`    Title: ${title}`);
				console.log(`    Image: ${uniqueFilename}`);
				console.log(`    Tags: ${this.config.defaultTags.join(', ')}`);
				console.log(`    Status: ${this.config.defaultStatus}`);
				return true;
			}

			// Copy file to uploads directory
			const imgUrl = this.copyFileToUploads(filepath, uniqueFilename);

			// Create database entry (using same image for front and back for bulk import)
			const newItem = InventoryService.createItem(
				title,
				imgUrl,
				imgUrl, // Using same image for both front and back
				this.config.defaultTags,
				this.config.defaultStatus,
				'unknown', // Default color
				'clothing' // Default type
			);

			console.log(`  ✓ Created item with ID: ${newItem.id}`);
			return true;
		} catch (error) {
			console.error(
				`  ✗ Error processing ${path.basename(filepath)}:`,
				error
			);
			return false;
		}
	}

	/**
	 * Import all images from source directory
	 */
	async importImages(): Promise<void> {
		console.log(
			`Starting bulk import from: ${this.config.sourceDirectory}`
		);
		console.log(`Dry run mode: ${this.config.dryRun ? 'ON' : 'OFF'}`);
		console.log('');

		// Check if source directory exists
		if (!fs.existsSync(this.config.sourceDirectory)) {
			throw new Error(
				`Source directory does not exist: ${this.config.sourceDirectory}`
			);
		}

		// Get all files from source directory
		const files = fs.readdirSync(this.config.sourceDirectory);
		const imageFiles = files.filter((file) => this.isValidImage(file));

		console.log(
			`Found ${imageFiles.length} image files out of ${files.length} total files`
		);
		console.log('');

		if (imageFiles.length === 0) {
			console.log('No valid image files found in source directory.');
			return;
		}

		// Process each image
		let successCount = 0;
		let errorCount = 0;

		for (const imageFile of imageFiles) {
			const filepath = path.join(this.config.sourceDirectory, imageFile);
			const success = await this.processImage(filepath);

			if (success) {
				successCount++;
			} else {
				errorCount++;
			}
		}

		console.log('');
		console.log('=== Import Summary ===');
		console.log(`Total files processed: ${imageFiles.length}`);
		console.log(`Successful imports: ${successCount}`);
		console.log(`Failed imports: ${errorCount}`);

		if (this.config.dryRun) {
			console.log('');
			console.log('This was a dry run. No files were actually imported.');
			console.log(
				'Remove the --dry-run flag to perform the actual import.'
			);
		}
	}
}

// Command line interface
async function main() {
	const args = process.argv.slice(2);

	// Debug: log all arguments
	console.log('Arguments received:', args);

	// Parse command line arguments
	let sourceDirectory = '';
	let defaultTags = ['clothing'];
	let defaultStatus: ValidStatus = 'dirty';
	let dryRun = false;
	let generateTitlesFromFilenames = true;

	// Handle case where first argument is a path (common when run via npm)
	if (
		args.length > 0 &&
		!args[0].startsWith('--') &&
		fs.existsSync(args[0])
	) {
		sourceDirectory = args[0];
		// Check remaining args for flags
		for (let i = 1; i < args.length; i++) {
			const arg = args[i];
			if (arg === '--dry-run') {
				dryRun = true;
			} else if (arg === '--no-title-generation') {
				generateTitlesFromFilenames = false;
			} else if (arg === '--tags' || arg === '-t') {
				defaultTags = args[++i]
					?.split(',')
					.map((tag) => tag.trim()) || ['clothing'];
			} else if (arg === '--status') {
				const status = args[++i] as ValidStatus;
				if (['dirty', 'washed', 'ironed'].includes(status)) {
					defaultStatus = status;
				}
			}
		}
	} else {
		// Parse arguments in the traditional way
		for (let i = 0; i < args.length; i++) {
			const arg = args[i];
			switch (arg) {
				case '--source':
				case '-s':
					sourceDirectory = args[++i];
					break;
				case '--tags':
				case '-t':
					defaultTags = args[++i]
						?.split(',')
						.map((tag) => tag.trim()) || ['clothing'];
					break;
				case '--status':
					const status = args[++i] as ValidStatus;
					if (['dirty', 'washed', 'ironed'].includes(status)) {
						defaultStatus = status;
					} else {
						console.error(
							'Invalid status. Must be: dirty, washed, or ironed'
						);
						process.exit(1);
					}
					break;
				case '--dry-run':
					dryRun = true;
					break;
				case '--no-title-generation':
					generateTitlesFromFilenames = false;
					break;
				case '--help':
				case '-h':
					printHelp();
					process.exit(0);
			}
		}
	}

	// Validate required arguments
	if (!sourceDirectory) {
		console.error('Error: Source directory is required');
		printHelp();
		process.exit(1);
	}
	// Create and run importer
	const config: ImportConfig = {
		sourceDirectory,
		defaultTags,
		defaultStatus,
		dryRun,
		generateTitlesFromFilenames,
		defaultColor: 'unknown',
		defaultType: 'clothing',
	};

	const importer = new BulkImporter(config);

	try {
		await importer.importImages();
	} catch (error) {
		console.error('Import failed:', error);
		process.exit(1);
	}
}

function printHelp() {
	console.log(`
Bulk Import Tool for Attire Inventory

Usage: npm run bulk-import -- --source <directory> [options]

Required:
  --source, -s <directory>    Directory containing photos to import

Options:
  --tags, -t <tags>          Comma-separated list of default tags (default: "clothing")
  --status <status>          Default status: dirty, washed, or ironed (default: "dirty")
  --dry-run                  Preview what would be imported without making changes
  --no-title-generation      Don't generate titles from filenames (use generic titles)
  --help, -h                 Show this help message

Examples:
  # Dry run to preview what would be imported
  npm run bulk-import -- --source "C:\\Photos\\Clothes" --dry-run

  # Import all photos with default settings
  npm run bulk-import -- --source "C:\\Photos\\Clothes"

  # Import with custom tags and status
  npm run bulk-import -- --source "C:\\Photos\\Clothes" --tags "summer,casual,shirts" --status "washed"
`);
}

// Run if called directly
if (require.main === module) {
	main().catch(console.error);
}

export { BulkImporter, ImportConfig };
