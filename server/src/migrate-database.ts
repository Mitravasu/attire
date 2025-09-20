import { db } from './database';
import fs from 'fs';
import path from 'path';

// Migration script to update existing database schema from single imgUrl to frontImgUrl and backImgUrl
export const migrateDatabase = (): void => {
	try {
		console.log('Starting database migration...');

		// First, check if the new columns already exist
		const tableInfo = db
			.prepare('PRAGMA table_info(inventory)')
			.all() as any[];
		const hasNewColumns = tableInfo.some(
			(col) => col.name === 'frontImgUrl' || col.name === 'backImgUrl'
		);

		if (hasNewColumns) {
			console.log('Database already migrated. Skipping migration.');
			return;
		}

		// Check if old column exists
		const hasOldColumn = tableInfo.some((col) => col.name === 'imgUrl');

		if (!hasOldColumn) {
			console.log(
				'Old imgUrl column not found. This might be a fresh database.'
			);
			return;
		}

		// Begin transaction
		db.exec('BEGIN TRANSACTION');

		try {
			// Step 1: Create new table with updated schema
			db.exec(`
                CREATE TABLE inventory_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    frontImgUrl TEXT NOT NULL,
                    backImgUrl TEXT NOT NULL,
                    tags TEXT NOT NULL,
                    status TEXT NOT NULL CHECK(status IN ('dirty', 'washed', 'ironed')),
                    createdAt TEXT NOT NULL,
                    updatedAt TEXT
                )
            `);

			// Step 2: Copy data from old table to new table
			// For existing records, we'll use the same image for both front and back
			db.exec(`
                INSERT INTO inventory_new (id, title, frontImgUrl, backImgUrl, tags, status, createdAt, updatedAt)
                SELECT id, title, imgUrl, imgUrl, tags, status, createdAt, updatedAt
                FROM inventory
            `);

			// Step 3: Drop old table
			db.exec('DROP TABLE inventory');

			// Step 4: Rename new table to original name
			db.exec('ALTER TABLE inventory_new RENAME TO inventory');

			// Commit transaction
			db.exec('COMMIT');

			console.log('Database migration completed successfully!');
			console.log(
				'Note: Existing items now use the same image for both front and back views.'
			);
			console.log(
				'You may want to update these items with separate front and back images.'
			);
		} catch (error) {
			// Rollback on error
			db.exec('ROLLBACK');
			throw error;
		}
	} catch (error) {
		console.error('Error during database migration:', error);
		throw error;
	}
};

// Run migration if this file is executed directly
if (require.main === module) {
	try {
		migrateDatabase();
		console.log('Migration completed successfully!');
	} catch (error) {
		console.error('Migration failed:', error);
		process.exit(1);
	}
}
