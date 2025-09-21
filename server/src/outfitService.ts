import { db } from './database';
import { Outfit, InventoryItem } from './types';

export class OutfitService {
	// Get all outfits with their items
	static getAllOutfits(): Outfit[] {
		try {
			const outfits = db
				.prepare(
					`
					SELECT id, name, createdAt, updatedAt 
					FROM outfits 
					ORDER BY createdAt DESC
				`
				)
				.all() as Omit<Outfit, 'items'>[];

			// Get items for each outfit
			const outfitsWithItems: Outfit[] = outfits.map((outfit) => {
				const items = this.getOutfitItems(outfit.id);
				return { ...outfit, items };
			});

			return outfitsWithItems;
		} catch (error) {
			console.error('Error fetching outfits:', error);
			throw new Error('Failed to fetch outfits');
		}
	}

	// Get a specific outfit by ID
	static getOutfitById(id: number): Outfit | null {
		try {
			const outfit = db
				.prepare(
					`
					SELECT id, name, createdAt, updatedAt 
					FROM outfits 
					WHERE id = ?
				`
				)
				.get(id) as Omit<Outfit, 'items'> | undefined;

			if (!outfit) {
				return null;
			}

			const items = this.getOutfitItems(outfit.id);
			return { ...outfit, items };
		} catch (error) {
			console.error('Error fetching outfit:', error);
			throw new Error('Failed to fetch outfit');
		}
	}

	// Get items for a specific outfit
	static getOutfitItems(outfitId: number): InventoryItem[] {
		try {
			const items = db
				.prepare(
					`
					SELECT i.* 
					FROM inventory i
					INNER JOIN outfit_items oi ON i.id = oi.inventory_id
					WHERE oi.outfit_id = ?
					ORDER BY oi.id
				`
				)
				.all(outfitId) as any[];

			return items.map((item) => ({
				...item,
				tags: item.tags ? JSON.parse(item.tags) : [],
			}));
		} catch (error) {
			console.error('Error fetching outfit items:', error);
			throw new Error('Failed to fetch outfit items');
		}
	}

	// Create a new outfit
	static createOutfit(name: string, itemIds: number[]): Outfit {
		const transaction = db.transaction(() => {
			try {
				// Insert outfit
				const insertOutfit = db.prepare(`
					INSERT INTO outfits (name, createdAt)
					VALUES (?, ?)
				`);

				const now = new Date().toISOString();
				const result = insertOutfit.run(name, now);
				const outfitId = result.lastInsertRowid as number;

				// Insert outfit items
				if (itemIds.length > 0) {
					const insertOutfitItem = db.prepare(`
						INSERT INTO outfit_items (outfit_id, inventory_id)
						VALUES (?, ?)
					`);

					for (const itemId of itemIds) {
						insertOutfitItem.run(outfitId, itemId);
					}
				}

				// Return the created outfit
				const createdOutfit = this.getOutfitById(outfitId);
				if (!createdOutfit) {
					throw new Error('Failed to retrieve created outfit');
				}

				return createdOutfit;
			} catch (error) {
				console.error('Error creating outfit:', error);
				throw new Error('Failed to create outfit');
			}
		});

		return transaction();
	}

	// Update an existing outfit
	static updateOutfit(
		id: number,
		name?: string,
		itemIds?: number[]
	): Outfit | null {
		const transaction = db.transaction(() => {
			try {
				// Check if outfit exists
				const existingOutfit = this.getOutfitById(id);
				if (!existingOutfit) {
					return null;
				}

				// Update outfit name if provided
				if (name !== undefined) {
					const updateOutfit = db.prepare(`
						UPDATE outfits 
						SET name = ?, updatedAt = ?
						WHERE id = ?
					`);
					updateOutfit.run(name, new Date().toISOString(), id);
				}

				// Update outfit items if provided
				if (itemIds !== undefined) {
					// Delete existing outfit items
					const deleteOutfitItems = db.prepare(`
						DELETE FROM outfit_items WHERE outfit_id = ?
					`);
					deleteOutfitItems.run(id);

					// Insert new outfit items
					if (itemIds.length > 0) {
						const insertOutfitItem = db.prepare(`
							INSERT INTO outfit_items (outfit_id, inventory_id)
							VALUES (?, ?)
						`);

						for (const itemId of itemIds) {
							insertOutfitItem.run(id, itemId);
						}
					}
				}

				// Return the updated outfit
				const updatedOutfit = this.getOutfitById(id);
				return updatedOutfit;
			} catch (error) {
				console.error('Error updating outfit:', error);
				throw new Error('Failed to update outfit');
			}
		});

		return transaction();
	}

	// Delete an outfit
	static deleteOutfit(id: number): boolean {
		try {
			const deleteOutfit = db.prepare(`DELETE FROM outfits WHERE id = ?`);
			const result = deleteOutfit.run(id);
			return result.changes > 0;
		} catch (error) {
			console.error('Error deleting outfit:', error);
			throw new Error('Failed to delete outfit');
		}
	}
}
