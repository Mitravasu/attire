import { db } from './database';

// Migration script to make backImgUrl optional
export const migrateBackImgUrlOptional = (): void => {
	try {
		console.log('Starting migration to make backImgUrl optional...');

		// Check current table schema
		const tableInfo = db
			.prepare('PRAGMA table_info(inventory)')
			.all() as any[];
		const backImgUrlColumn = tableInfo.find(
			(col) => col.name === 'backImgUrl'
		);

		if (!backImgUrlColumn) {
			console.log('backImgUrl column not found. Skipping migration.');
			return;
		}

		// Check if the column is already nullable
		if (backImgUrlColumn.notnull === 0) {
			console.log('backImgUrl is already optional. Skipping migration.');
			return;
		}

		console.log('Making backImgUrl column optional...');

		// Begin transaction
		db.exec('BEGIN TRANSACTION');

		try {
			// Step 1: Create new table with updated schema
			db.exec(`
                CREATE TABLE inventory_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    frontImgUrl TEXT NOT NULL,
                    backImgUrl TEXT, -- Now optional
                    tags TEXT NOT NULL,
                    status TEXT NOT NULL CHECK(status IN ('dirty', 'washed', 'ironed')),
                    createdAt TEXT NOT NULL,
                    updatedAt TEXT
                )
            `);

			// Step 2: Copy data from old table to new table
			db.exec(`
                INSERT INTO inventory_new (id, title, frontImgUrl, backImgUrl, tags, status, createdAt, updatedAt)
                SELECT id, title, frontImgUrl, backImgUrl, tags, status, createdAt, updatedAt
                FROM inventory
            `);

			// Step 3: Drop old table
			db.exec('DROP TABLE inventory');

			// Step 4: Rename new table to original name
			db.exec('ALTER TABLE inventory_new RENAME TO inventory');

			// Commit transaction
			db.exec('COMMIT');

			console.log('Successfully made backImgUrl optional!');
		} catch (error) {
			// Rollback on error
			db.exec('ROLLBACK');
			throw error;
		}
	} catch (error) {
		console.error('Error during backImgUrl optional migration:', error);
		throw error;
	}
};

// Run migration if this file is executed directly
if (require.main === module) {
	try {
		migrateBackImgUrlOptional();
		console.log('Migration completed successfully!');
	} catch (error) {
		console.error('Migration failed:', error);
		process.exit(1);
	}
}
