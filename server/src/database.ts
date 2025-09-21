import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { migrateDatabase } from './migrate-database';
import { migrateBackImgUrlOptional } from './migrate-back-img-optional';
import { migrateAddColorType } from './migrate-add-color-type';
import { migrateAddFavorites } from './migrate-add-favorites';
import { migrateAddIndexes } from './migrate-add-indexes';
import { migrateAddOutfits } from './migrate-add-outfits';
import { migrateAddPlanner } from './migrate-add-planner';

// Database setup
const dbDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dbDir, 'inventory.db');

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
	fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database connection
const db: DatabaseType = new Database(dbPath);

// Enable foreign keys and WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create inventory table
const createInventoryTable = db.prepare(`
	CREATE TABLE IF NOT EXISTS inventory (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		title TEXT NOT NULL,
		frontImgUrl TEXT NOT NULL,
		backImgUrl TEXT, -- Optional back image
		tags TEXT NOT NULL, -- JSON string of tags array
		status TEXT NOT NULL CHECK(status IN ('dirty', 'washed', 'ironed')),
		createdAt TEXT NOT NULL,
		updatedAt TEXT
	)
`);

// Initialize database tables
export const initializeDatabase = (): void => {
	try {
		// First, try to create the table (this handles fresh installs)
		createInventoryTable.run();

		// Then run migration for existing databases
		migrateDatabase();

		// Make backImgUrl optional
		migrateBackImgUrlOptional();

		// Add color and type columns
		migrateAddColorType();

		// Add isFavorite column
		migrateAddFavorites();

		// Add database indexes for performance
		migrateAddIndexes();

		// Add outfit tables
		migrateAddOutfits();

		// Add planner tables
		migrateAddPlanner();

		console.log('Database tables initialized successfully');
	} catch (error) {
		console.error('Error initializing database:', error);
		throw error;
	}
};

// Close database connection gracefully
export const closeDatabase = (): void => {
	db.close();
};

// Export database instance
export { db };

// Graceful shutdown
process.on('SIGINT', () => {
	console.log('Received SIGINT, closing database...');
	closeDatabase();
	process.exit(0);
});

process.on('SIGTERM', () => {
	console.log('Received SIGTERM, closing database...');
	closeDatabase();
	process.exit(0);
});
