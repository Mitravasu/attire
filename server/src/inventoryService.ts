import { db } from './database';
import { InventoryItem, ValidStatus } from './types';

// Database service interface for inventory operations
export class InventoryService {
	// Lazy-loaded prepared statements
	private static _insertStatement: any = null;
	private static _selectAllStatement: any = null;
	private static _selectByIdStatement: any = null;
	private static _updateStatusStatement: any = null;
	private static _deleteStatement: any = null;

	// Get prepared statements (lazy initialization)
	private static get insertStatement() {
		if (!this._insertStatement) {
			this._insertStatement = db.prepare(`
				INSERT INTO inventory (title, imgUrl, tags, status, createdAt)
				VALUES (?, ?, ?, ?, ?)
			`);
		}
		return this._insertStatement;
	}

	private static get selectAllStatement() {
		if (!this._selectAllStatement) {
			this._selectAllStatement = db.prepare(`
				SELECT id, title, imgUrl, tags, status, createdAt, updatedAt
				FROM inventory
				ORDER BY createdAt DESC
			`);
		}
		return this._selectAllStatement;
	}

	private static get selectByIdStatement() {
		if (!this._selectByIdStatement) {
			this._selectByIdStatement = db.prepare(`
				SELECT id, title, imgUrl, tags, status, createdAt, updatedAt
				FROM inventory
				WHERE id = ?
			`);
		}
		return this._selectByIdStatement;
	}

	private static get updateStatusStatement() {
		if (!this._updateStatusStatement) {
			this._updateStatusStatement = db.prepare(`
				UPDATE inventory
				SET status = ?, updatedAt = ?
				WHERE id = ?
			`);
		}
		return this._updateStatusStatement;
	}

	private static get deleteStatement() {
		if (!this._deleteStatement) {
			this._deleteStatement = db.prepare(`
				DELETE FROM inventory
				WHERE id = ?
			`);
		}
		return this._deleteStatement;
	}

	// Create a new inventory item
	static createItem(
		title: string,
		imgUrl: string,
		tags: string[],
		status: ValidStatus
	): InventoryItem {
		try {
			const createdAt = new Date().toISOString();
			const tagsJson = JSON.stringify(tags);

			const result = this.insertStatement.run(
				title,
				imgUrl,
				tagsJson,
				status,
				createdAt
			);

			if (result.lastInsertRowid) {
				const newItem = this.getItemById(
					Number(result.lastInsertRowid)
				);
				if (newItem) {
					return newItem;
				}
			}

			throw new Error('Failed to create inventory item');
		} catch (error) {
			console.error('Error creating inventory item:', error);
			throw new Error('Database error while creating inventory item');
		}
	}

	// Get all inventory items
	static getAllItems(): InventoryItem[] {
		try {
			const rows = this.selectAllStatement.all() as any[];
			return rows.map(this.mapRowToInventoryItem);
		} catch (error) {
			console.error('Error fetching all inventory items:', error);
			throw new Error('Database error while fetching inventory items');
		}
	}

	// Get a single inventory item by ID
	static getItemById(id: number): InventoryItem | null {
		try {
			const row = this.selectByIdStatement.get(id) as any;
			return row ? this.mapRowToInventoryItem(row) : null;
		} catch (error) {
			console.error('Error fetching inventory item by ID:', error);
			throw new Error('Database error while fetching inventory item');
		}
	}

	// Update inventory item status
	static updateItemStatus(
		id: number,
		status: ValidStatus
	): InventoryItem | null {
		try {
			const updatedAt = new Date().toISOString();
			const result = this.updateStatusStatement.run(
				status,
				updatedAt,
				id
			);

			if (result.changes > 0) {
				return this.getItemById(id);
			}

			return null; // Item not found
		} catch (error) {
			console.error('Error updating inventory item status:', error);
			throw new Error(
				'Database error while updating inventory item status'
			);
		}
	}

	// Delete inventory item by ID
	static deleteItem(id: number): boolean {
		try {
			const result = this.deleteStatement.run(id);
			return result.changes > 0;
		} catch (error) {
			console.error('Error deleting inventory item:', error);
			throw new Error('Database error while deleting inventory item');
		}
	}

	// Helper method to map database row to InventoryItem interface
	private static mapRowToInventoryItem(row: any): InventoryItem {
		return {
			id: row.id,
			title: row.title,
			imgUrl: row.imgUrl,
			tags: JSON.parse(row.tags),
			status: row.status as ValidStatus,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt || undefined,
		};
	}

	// Get count of items (useful for statistics)
	static getItemCount(): number {
		try {
			const result = db
				.prepare('SELECT COUNT(*) as count FROM inventory')
				.get() as any;
			return result.count;
		} catch (error) {
			console.error('Error getting inventory count:', error);
			throw new Error('Database error while getting inventory count');
		}
	}

	// Get items by status (useful for filtering)
	static getItemsByStatus(status: ValidStatus): InventoryItem[] {
		try {
			const statement = db.prepare(`
				SELECT id, title, imgUrl, tags, status, createdAt, updatedAt
				FROM inventory
				WHERE status = ?
				ORDER BY createdAt DESC
			`);
			const rows = statement.all(status) as any[];
			return rows.map(this.mapRowToInventoryItem);
		} catch (error) {
			console.error('Error fetching inventory items by status:', error);
			throw new Error(
				'Database error while fetching inventory items by status'
			);
		}
	}
}
