import { db } from './database';

export const migrateAddIndexes = (): void => {
	try {
		console.log('Starting index creation migration...');

		// Check existing indexes
		const existingIndexes = db
			.prepare(
				`
			SELECT name FROM sqlite_master 
			WHERE type = 'index' AND tbl_name = 'inventory'
		`
			)
			.all() as { name: string }[];

		const indexNames = existingIndexes.map((idx) => idx.name);

		// Create index on status (most commonly filtered)
		if (!indexNames.includes('idx_inventory_status')) {
			console.log('Creating index on status column...');
			db.prepare(
				'CREATE INDEX idx_inventory_status ON inventory(status)'
			).run();
		}

		// Create index on color
		if (!indexNames.includes('idx_inventory_color')) {
			console.log('Creating index on color column...');
			db.prepare(
				'CREATE INDEX idx_inventory_color ON inventory(color)'
			).run();
		}

		// Create index on type
		if (!indexNames.includes('idx_inventory_type')) {
			console.log('Creating index on type column...');
			db.prepare(
				'CREATE INDEX idx_inventory_type ON inventory(type)'
			).run();
		}

		// Create index on isFavorite
		if (!indexNames.includes('idx_inventory_favorite')) {
			console.log('Creating index on isFavorite column...');
			db.prepare(
				'CREATE INDEX idx_inventory_favorite ON inventory(isFavorite)'
			).run();
		}

		// Create index on createdAt (used for ordering)
		if (!indexNames.includes('idx_inventory_created_at')) {
			console.log('Creating index on createdAt column...');
			db.prepare(
				'CREATE INDEX idx_inventory_created_at ON inventory(createdAt DESC)'
			).run();
		}

		// Create composite index for common filter combinations
		if (!indexNames.includes('idx_inventory_status_color')) {
			console.log('Creating composite index on status and color...');
			db.prepare(
				'CREATE INDEX idx_inventory_status_color ON inventory(status, color)'
			).run();
		}

		// Create composite index for status and type
		if (!indexNames.includes('idx_inventory_status_type')) {
			console.log('Creating composite index on status and type...');
			db.prepare(
				'CREATE INDEX idx_inventory_status_type ON inventory(status, type)'
			).run();
		}

		// Create composite index for favorites with created date
		if (!indexNames.includes('idx_inventory_favorite_created')) {
			console.log(
				'Creating composite index on isFavorite and createdAt...'
			);
			db.prepare(
				'CREATE INDEX idx_inventory_favorite_created ON inventory(isFavorite, createdAt DESC)'
			).run();
		}

		console.log('Index creation migration completed successfully');
	} catch (error) {
		console.error('Error creating indexes:', error);
		throw error;
	}
};

// Run migration if this file is executed directly
if (require.main === module) {
	try {
		migrateAddIndexes();
		console.log('Index migration completed successfully!');
	} catch (error) {
		console.error('Index migration failed:', error);
		process.exit(1);
	}
}
