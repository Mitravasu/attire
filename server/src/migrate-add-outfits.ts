import { db } from './database';

export const migrateAddOutfits = (): void => {
	try {
		// Check if outfits table already exists
		const outfitsTableExists = db
			.prepare(
				"SELECT name FROM sqlite_master WHERE type='table' AND name='outfits'"
			)
			.get();

		if (!outfitsTableExists) {
			// Create outfits table
			const createOutfitsTable = db.prepare(`
				CREATE TABLE outfits (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					name TEXT NOT NULL,
					createdAt TEXT NOT NULL,
					updatedAt TEXT
				)
			`);

			createOutfitsTable.run();
			console.log('Created outfits table');
		}

		// Check if outfit_items table already exists
		const outfitItemsTableExists = db
			.prepare(
				"SELECT name FROM sqlite_master WHERE type='table' AND name='outfit_items'"
			)
			.get();

		if (!outfitItemsTableExists) {
			// Create junction table for outfit items
			const createOutfitItemsTable = db.prepare(`
				CREATE TABLE outfit_items (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					outfit_id INTEGER NOT NULL,
					inventory_id INTEGER NOT NULL,
					FOREIGN KEY (outfit_id) REFERENCES outfits (id) ON DELETE CASCADE,
					FOREIGN KEY (inventory_id) REFERENCES inventory (id) ON DELETE CASCADE,
					UNIQUE (outfit_id, inventory_id)
				)
			`);

			createOutfitItemsTable.run();
			console.log('Created outfit_items table');

			// Create indexes for better performance
			const createOutfitItemsIndexes = [
				db.prepare(
					`CREATE INDEX idx_outfit_items_outfit_id ON outfit_items (outfit_id)`
				),
				db.prepare(
					`CREATE INDEX idx_outfit_items_inventory_id ON outfit_items (inventory_id)`
				),
			];

			createOutfitItemsIndexes.forEach((stmt) => stmt.run());
			console.log('Created outfit_items indexes');
		}

		console.log('Outfit tables migration completed');
	} catch (error) {
		console.error('Error during outfit tables migration:', error);
		throw error;
	}
};
