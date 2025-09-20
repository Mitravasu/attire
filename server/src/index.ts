import express, { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer, { StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';
import {
	InventoryItem,
	InventoryRequest,
	StatusUpdateRequest,
	DeleteRequest,
	MulterError,
	ValidStatus,
} from './types';
import { initializeDatabase } from './database';
import { InventoryService } from './inventoryService';

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '3001', 10);

// Ensure uploads directory exists
const uploadsDir: string = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage: StorageEngine = multer.diskStorage({
	destination: function (
		req: Request,
		file: Express.Multer.File,
		cb: (error: Error | null, destination: string) => void
	) {
		cb(null, uploadsDir);
	},
	filename: function (
		req: Request,
		file: Express.Multer.File,
		cb: (error: Error | null, filename: string) => void
	) {
		// Create unique filename with timestamp
		const uniqueSuffix: string =
			Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(
			null,
			file.fieldname +
				'-' +
				uniqueSuffix +
				path.extname(file.originalname)
		);
	},
});

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit
	},
	fileFilter: (
		req: Request,
		file: Express.Multer.File,
		cb: multer.FileFilterCallback
	) => {
		// Accept only image files
		if (file.mimetype.startsWith('image/')) {
			cb(null, true);
		} else {
			cb(new Error('Only image files are allowed!') as MulterError);
		}
	},
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Initialize database
initializeDatabase();

// Validation function for status
const isValidStatus = (status: string): status is ValidStatus => {
	const validStatuses: ValidStatus[] = ['dirty', 'washed', 'ironed'];
	return validStatuses.includes(status.toLowerCase() as ValidStatus);
};

// Basic health check route
app.get('/', (req: Request, res: Response) => {
	res.json({ message: 'Attire Inventory Server is running!' });
});

// Get all inventory items
app.get('/api/inventory', (req: Request, res: Response) => {
	try {
		const items = InventoryService.getAllItems();
		res.json(items);
	} catch (error) {
		console.error('Error fetching inventory items:', error);
		res.status(500).json({
			error: 'Internal server error while fetching inventory items',
		});
	}
});

// Add new inventory item
app.post(
	'/api/inventory',
	upload.single('image'),
	(req: InventoryRequest, res: Response): void => {
		try {
			const { title, tags, status } = req.body;

			// Validation
			if (!title || typeof title !== 'string' || title.trim() === '') {
				res.status(400).json({
					error: 'Title is required and must be a non-empty string',
				});
				return;
			}

			if (!req.file) {
				res.status(400).json({
					error: 'Image file is required',
				});
				return;
			}

			if (!tags) {
				res.status(400).json({
					error: 'Tags are required',
				});
				return;
			}

			// Parse tags - handle both string and array inputs
			let parsedTags: string[];
			try {
				if (typeof tags === 'string') {
					// If tags is a comma-separated string, split it
					parsedTags = tags
						.split(',')
						.map((tag: string) => tag.trim())
						.filter((tag: string) => tag !== '');
				} else if (Array.isArray(tags)) {
					parsedTags = tags
						.map((tag: any) => tag.toString().trim())
						.filter((tag: string) => tag !== '');
				} else {
					throw new Error('Invalid tags format');
				}
			} catch (error) {
				res.status(400).json({
					error: 'Tags must be a comma-separated string or an array',
				});
				return;
			}

			if (!status || !isValidStatus(status)) {
				res.status(400).json({
					error: 'Status is required and must be one of: dirty, washed, ironed',
				});
				return;
			}

			// Create image URL relative to server
			const imgUrl: string = `/uploads/${req.file.filename}`;

			// Create new inventory item using database service
			const newItem: InventoryItem = InventoryService.createItem(
				title.trim(),
				imgUrl,
				parsedTags,
				status.toLowerCase() as ValidStatus
			);

			res.status(201).json({
				message: 'Inventory item added successfully',
				item: newItem,
			});
		} catch (error) {
			console.error('Error adding inventory item:', error);
			res.status(500).json({
				error: 'Internal server error while adding inventory item',
			});
		}
	}
);

// Delete inventory item by ID
app.delete('/api/inventory/:id', (req: DeleteRequest, res: Response): void => {
	try {
		const id: number = parseInt(req.params.id, 10);

		// Get the item before deleting to return it in response
		const itemToDelete: InventoryItem | null =
			InventoryService.getItemById(id);

		if (!itemToDelete) {
			res.status(404).json({
				error: 'Inventory item not found',
			});
			return;
		}

		const deleted: boolean = InventoryService.deleteItem(id);

		if (deleted) {
			res.json({
				message: 'Inventory item deleted successfully',
				item: itemToDelete,
			});
		} else {
			res.status(404).json({
				error: 'Inventory item not found',
			});
		}
	} catch (error) {
		console.error('Error deleting inventory item:', error);
		res.status(500).json({
			error: 'Internal server error while deleting inventory item',
		});
	}
});

// Update inventory item status
app.patch(
	'/api/inventory/:id/status',
	(req: StatusUpdateRequest, res: Response): void => {
		try {
			const id: number = parseInt(req.params.id, 10);
			const { status } = req.body;

			if (!status || !isValidStatus(status)) {
				res.status(400).json({
					error: 'Status is required and must be one of: dirty, washed, ironed',
				});
				return;
			}

			const updatedItem: InventoryItem | null =
				InventoryService.updateItemStatus(
					id,
					status.toLowerCase() as ValidStatus
				);

			if (!updatedItem) {
				res.status(404).json({
					error: 'Inventory item not found',
				});
				return;
			}

			res.json({
				message: 'Inventory item status updated successfully',
				item: updatedItem,
			});
		} catch (error) {
			console.error('Error updating inventory item status:', error);
			res.status(500).json({
				error: 'Internal server error while updating inventory item status',
			});
		}
	}
);

// Error handling middleware
app.use(
	(
		err: MulterError,
		req: Request,
		res: Response,
		next: NextFunction
	): void => {
		console.error(err.stack);
		if (err.message === 'Only image files are allowed!') {
			res.status(400).json({ error: err.message });
			return;
		}
		res.status(500).json({ error: 'Something went wrong!' });
	}
);

// 404 handler
app.use('*', (req: Request, res: Response) => {
	res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	console.log(`Health check: http://localhost:${PORT}`);
	console.log(`API endpoints:`);
	console.log(`  GET    /api/inventory     - Get all inventory items`);
	console.log(`  POST   /api/inventory     - Add new inventory item`);
	console.log(`  DELETE /api/inventory/:id - Delete inventory item`);
	console.log(`  PATCH  /api/inventory/:id/status - Update item status`);
});

export default app;
