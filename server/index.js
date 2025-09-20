const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadsDir);
	},
	filename: function (req, file, cb) {
		// Create unique filename with timestamp
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
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
	fileFilter: (req, file, cb) => {
		// Accept only image files
		if (file.mimetype.startsWith('image/')) {
			cb(null, true);
		} else {
			cb(new Error('Only image files are allowed!'), false);
		}
	},
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// In-memory storage for inventory items (in a real app, you'd use a database)
let inventory = [];
let nextId = 1;

// Validation function for status
const isValidStatus = (status) => {
	const validStatuses = ['dirty', 'washed', 'ironed'];
	return validStatuses.includes(status.toLowerCase());
};

// Basic health check route
app.get('/', (req, res) => {
	res.json({ message: 'Attire Inventory Server is running!' });
});

// Get all inventory items
app.get('/api/inventory', (req, res) => {
	res.json(inventory);
});

// Add new inventory item
app.post('/api/inventory', upload.single('image'), (req, res) => {
	try {
		const { title, tags, status } = req.body;

		// Validation
		if (!title || typeof title !== 'string' || title.trim() === '') {
			return res.status(400).json({
				error: 'Title is required and must be a non-empty string',
			});
		}

		if (!req.file) {
			return res.status(400).json({
				error: 'Image file is required',
			});
		}

		if (!tags) {
			return res.status(400).json({
				error: 'Tags are required',
			});
		}

		// Parse tags - handle both string and array inputs
		let parsedTags;
		try {
			if (typeof tags === 'string') {
				// If tags is a comma-separated string, split it
				parsedTags = tags
					.split(',')
					.map((tag) => tag.trim())
					.filter((tag) => tag !== '');
			} else if (Array.isArray(tags)) {
				parsedTags = tags
					.map((tag) => tag.toString().trim())
					.filter((tag) => tag !== '');
			} else {
				throw new Error('Invalid tags format');
			}
		} catch (error) {
			return res.status(400).json({
				error: 'Tags must be a comma-separated string or an array',
			});
		}

		if (!status || !isValidStatus(status)) {
			return res.status(400).json({
				error: 'Status is required and must be one of: dirty, washed, ironed',
			});
		}

		// Create image URL relative to server
		const imgUrl = `/uploads/${req.file.filename}`;

		// Create new inventory item
		const newItem = {
			id: nextId++,
			title: title.trim(),
			imgUrl: imgUrl,
			tags: parsedTags,
			status: status.toLowerCase(),
			createdAt: new Date().toISOString(),
		};

		// Add to inventory
		inventory.push(newItem);

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
});

// Delete inventory item by ID
app.delete('/api/inventory/:id', (req, res) => {
	try {
		const id = parseInt(req.params.id);
		const itemIndex = inventory.findIndex((item) => item.id === id);

		if (itemIndex === -1) {
			return res.status(404).json({
				error: 'Inventory item not found',
			});
		}

		const deletedItem = inventory.splice(itemIndex, 1)[0];

		res.json({
			message: 'Inventory item deleted successfully',
			item: deletedItem,
		});
	} catch (error) {
		console.error('Error deleting inventory item:', error);
		res.status(500).json({
			error: 'Internal server error while deleting inventory item',
		});
	}
});

// Update inventory item status
app.patch('/api/inventory/:id/status', (req, res) => {
	try {
		const id = parseInt(req.params.id);
		const { status } = req.body;

		if (!status || !isValidStatus(status)) {
			return res.status(400).json({
				error: 'Status is required and must be one of: dirty, washed, ironed',
			});
		}

		const item = inventory.find((item) => item.id === id);

		if (!item) {
			return res.status(404).json({
				error: 'Inventory item not found',
			});
		}

		item.status = status.toLowerCase();
		item.updatedAt = new Date().toISOString();

		res.json({
			message: 'Inventory item status updated successfully',
			item: item,
		});
	} catch (error) {
		console.error('Error updating inventory item status:', error);
		res.status(500).json({
			error: 'Internal server error while updating inventory item status',
		});
	}
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
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

module.exports = app;
