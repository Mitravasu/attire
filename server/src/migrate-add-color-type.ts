import { db } from './database';

export const migrateAddColorType = (): void => {
	try {
		// Check if the columns already exist
		const tableInfo = db.prepare('PRAGMA table_info(inventory)').all() as {
			name: string;
		}[];
		const columnNames = tableInfo.map((col) => col.name);

		// Add color column if it doesn't exist
		if (!columnNames.includes('color')) {
			console.log('Adding color column to inventory table...');
			db.prepare(
				'ALTER TABLE inventory ADD COLUMN color TEXT DEFAULT "unknown"'
			).run();
		}

		// Add type column if it doesn't exist
		if (!columnNames.includes('type')) {
			console.log('Adding type column to inventory table...');
			db.prepare(
				'ALTER TABLE inventory ADD COLUMN type TEXT DEFAULT "other"'
			).run();
		}

		console.log('Color and type columns migration completed successfully');
	} catch (error) {
		console.error('Error adding color and type columns:', error);
		throw error;
	}
};
