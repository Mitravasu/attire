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
				INSERT INTO inventory (title, frontImgUrl, backImgUrl, tags, status, color, type, createdAt)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?)
			`);
		}
		return this._insertStatement;
	}

	private static get selectAllStatement() {
		if (!this._selectAllStatement) {
			this._selectAllStatement = db.prepare(`
				SELECT id, title, frontImgUrl, backImgUrl, tags, status, color, type, createdAt, updatedAt
				FROM inventory
				ORDER BY createdAt DESC
			`);
		}
		return this._selectAllStatement;
	}

	private static get selectByIdStatement() {
		if (!this._selectByIdStatement) {
			this._selectByIdStatement = db.prepare(`
				SELECT id, title, frontImgUrl, backImgUrl, tags, status, color, type, createdAt, updatedAt
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

	private static _updateItemStatement: any = null;
	private static get updateItemStatement() {
		if (!this._updateItemStatement) {
			this._updateItemStatement = db.prepare(`
				UPDATE inventory
				SET title = ?, frontImgUrl = ?, backImgUrl = ?, tags = ?, status = ?, color = ?, type = ?, updatedAt = ?
				WHERE id = ?
			`);
		}
		return this._updateItemStatement;
	}

	// Create a new inventory item
	static createItem(
		title: string,
		frontImgUrl: string,
		backImgUrl: string | null,
		tags: string[],
		status: ValidStatus,
		color: string,
		type: string
	): InventoryItem {
		try {
			const createdAt = new Date().toISOString();
			const tagsJson = JSON.stringify(tags);

			const result = this.insertStatement.run(
				title,
				frontImgUrl,
				backImgUrl,
				tagsJson,
				status,
				color,
				type,
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

	// Update entire inventory item (except image URLs if not provided)
	static updateItem(
		id: number,
		title?: string,
		frontImgUrl?: string,
		backImgUrl?: string | null,
		tags?: string[],
		status?: ValidStatus,
		color?: string,
		type?: string
	): InventoryItem | null {
		try {
			// Get current item to preserve existing values
			const currentItem = this.getItemById(id);
			if (!currentItem) {
				return null;
			}

			// Use provided values or keep current ones
			const updatedTitle =
				title !== undefined ? title : currentItem.title;
			const updatedFrontImgUrl =
				frontImgUrl !== undefined
					? frontImgUrl
					: currentItem.frontImgUrl;
			const updatedBackImgUrl =
				backImgUrl !== undefined ? backImgUrl : currentItem.backImgUrl;
			const updatedTags = tags !== undefined ? tags : currentItem.tags;
			const updatedStatus =
				status !== undefined ? status : currentItem.status;
			const updatedColor =
				color !== undefined ? color : currentItem.color;
			const updatedType = type !== undefined ? type : currentItem.type;
			const updatedAt = new Date().toISOString();

			const result = this.updateItemStatement.run(
				updatedTitle,
				updatedFrontImgUrl,
				updatedBackImgUrl,
				JSON.stringify(updatedTags),
				updatedStatus,
				updatedColor,
				updatedType,
				updatedAt,
				id
			);

			if (result.changes > 0) {
				return this.getItemById(id);
			}

			return null; // Item not found
		} catch (error) {
			console.error('Error updating inventory item:', error);
			throw new Error('Database error while updating inventory item');
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
			frontImgUrl: row.frontImgUrl,
			backImgUrl: row.backImgUrl || undefined, // Handle null/undefined back images
			tags: JSON.parse(row.tags),
			status: row.status as ValidStatus,
			color: row.color || 'unknown',
			type: row.type || 'other',
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
				SELECT id, title, frontImgUrl, backImgUrl, tags, status, color, type, createdAt, updatedAt
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

	// Get filtered items based on multiple criteria
	static getFilteredItems(filters: {
		status?: ValidStatus;
		color?: string;
		type?: string;
		tags?: string[];
	}): InventoryItem[] {
		try {
			let query = `
				SELECT id, title, frontImgUrl, backImgUrl, tags, status, color, type, createdAt, updatedAt
				FROM inventory
				WHERE 1=1
			`;
			const params: any[] = [];

			// Add status filter
			if (filters.status) {
				query += ` AND status = ?`;
				params.push(filters.status);
			}

			// Add color filter
			if (filters.color) {
				query += ` AND LOWER(color) = LOWER(?)`;
				params.push(filters.color);
			}

			// Add type filter
			if (filters.type) {
				query += ` AND LOWER(type) = LOWER(?)`;
				params.push(filters.type);
			}

			// Add tags filter (contains any of the specified tags)
			if (filters.tags && filters.tags.length > 0) {
				const tagConditions = filters.tags
					.map(() => `JSON_EXTRACT(tags, '$') LIKE ?`)
					.join(' OR ');
				query += ` AND (${tagConditions})`;
				filters.tags.forEach((tag) => {
					params.push(`%"${tag}"%`);
				});
			}

			query += ` ORDER BY createdAt DESC`;

			const statement = db.prepare(query);
			const rows = statement.all(...params) as any[];
			return rows.map(this.mapRowToInventoryItem);
		} catch (error) {
			console.error('Error fetching filtered inventory items:', error);
			throw new Error(
				'Database error while fetching filtered inventory items'
			);
		}
	}

	// Get unique values for filter dropdowns
	static getUniqueFilterValues(): {
		colors: string[];
		types: string[];
		statuses: ValidStatus[];
	} {
		try {
			const colorsResult = db
				.prepare(
					`
				SELECT DISTINCT color FROM inventory WHERE color IS NOT NULL AND color != ''
				ORDER BY color
			`
				)
				.all() as any[];

			const typesResult = db
				.prepare(
					`
				SELECT DISTINCT type FROM inventory WHERE type IS NOT NULL AND type != ''
				ORDER BY type
			`
				)
				.all() as any[];

			const colors = colorsResult.map((row) => row.color);
			const types = typesResult.map((row) => row.type);
			const statuses: ValidStatus[] = ['dirty', 'washed', 'ironed'];

			return { colors, types, statuses };
		} catch (error) {
			console.error('Error fetching unique filter values:', error);
			throw new Error(
				'Database error while fetching unique filter values'
			);
		}
	}
}
