import { db } from './database';

export const migrateAddFavorites = (): void => {
	try {
		// Check if the column already exists
		const tableInfo = db.prepare('PRAGMA table_info(inventory)').all() as {
			name: string;
		}[];
		const columnNames = tableInfo.map((col) => col.name);

		// Add isFavorite column if it doesn't exist
		if (!columnNames.includes('isFavorite')) {
			console.log('Adding isFavorite column to inventory table...');
			db.prepare(
				'ALTER TABLE inventory ADD COLUMN isFavorite INTEGER DEFAULT 0'
			).run();
			console.log('isFavorite column added successfully');
		} else {
			console.log(
				'isFavorite column already exists. Skipping migration.'
			);
		}

		console.log('Favorites migration completed successfully');
	} catch (error) {
		console.error('Error adding isFavorite column:', error);
		throw error;
	}
};

// Run migration if this file is executed directly
if (require.main === module) {
	try {
		migrateAddFavorites();
		console.log('Migration completed successfully!');
	} catch (error) {
		console.error('Migration failed:', error);
		process.exit(1);
	}
}
