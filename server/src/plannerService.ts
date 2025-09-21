import { db } from './database';
import { PlannerEntry, Outfit, InventoryItem } from './types';

export class PlannerService {
	// Ensure planner table exists
	private static ensurePlannerTableExists(): void {
		try {
			const tableExists = db
				.prepare(
					"SELECT name FROM sqlite_master WHERE type='table' AND name='planner_entries'"
				)
				.get();

			if (!tableExists) {
				console.log('Creating planner_entries table...');

				// Create table without foreign key constraint to avoid issues
				const createPlannerTable = db.prepare(`
					CREATE TABLE planner_entries (
						id INTEGER PRIMARY KEY AUTOINCREMENT,
						date TEXT NOT NULL,
						outfitId INTEGER NOT NULL,
						notes TEXT,
						createdAt TEXT NOT NULL,
						updatedAt TEXT
					)
				`);

				createPlannerTable.run();

				// Create indexes for better performance
				try {
					const createDateIndex = db.prepare(`
						CREATE INDEX IF NOT EXISTS idx_planner_date ON planner_entries(date)
					`);

					const createOutfitIdIndex = db.prepare(`
						CREATE INDEX IF NOT EXISTS idx_planner_outfit_id ON planner_entries(outfitId)
					`);

					createDateIndex.run();
					createOutfitIdIndex.run();
				} catch (indexError) {
					console.warn('Could not create indexes:', indexError);
				}

				console.log('Planner entries table created successfully');
			} else {
				console.log('Planner entries table already exists');
			}
		} catch (error) {
			console.error(
				'Error ensuring planner entries table exists:',
				error
			);
			// Don't throw error to prevent breaking the service
		}
	}
	// Create a new planner entry
	static createEntry(
		date: string,
		outfitId: number,
		notes?: string
	): PlannerEntry {
		this.ensurePlannerTableExists();
		const now = new Date().toISOString();

		try {
			const stmt = db.prepare(`
				INSERT INTO planner_entries (date, outfitId, notes, createdAt)
				VALUES (?, ?, ?, ?)
			`);

			const result = stmt.run(date, outfitId, notes || null, now);

			return {
				id: result.lastInsertRowid as number,
				date,
				outfitId,
				notes,
				createdAt: now,
			};
		} catch (error: any) {
			// Handle unique constraint error (if table was created with old schema)
			if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
				// Check if entry already exists
				const existingEntry = db
					.prepare(
						'SELECT * FROM planner_entries WHERE date = ? AND outfitId = ?'
					)
					.get(date, outfitId) as PlannerEntry | undefined;

				if (existingEntry) {
					// If notes are provided, update the existing entry
					if (notes && notes !== existingEntry.notes) {
						return this.updateEntry(existingEntry.id, { notes });
					}
					// Return existing entry if no update needed
					return existingEntry;
				}
			}
			// Re-throw other errors
			throw error;
		}
	}

	// Get all planner entries for a date range
	static getEntriesForDateRange(
		startDate: string,
		endDate: string
	): PlannerEntry[] {
		this.ensurePlannerTableExists();
		const stmt = db.prepare(`
			SELECT * FROM planner_entries
			WHERE date BETWEEN ? AND ?
			ORDER BY date ASC
		`);

		return stmt.all(startDate, endDate) as PlannerEntry[];
	}

	// Get planner entries with outfit details for a date range
	static getEntriesWithOutfitsForDateRange(
		startDate: string,
		endDate: string
	): (PlannerEntry & { outfit: Outfit })[] {
		try {
			this.ensurePlannerTableExists();

			// First get planner entries
			const entriesStmt = db.prepare(`
				SELECT * FROM planner_entries
				WHERE date BETWEEN ? AND ?
				ORDER BY date ASC
			`);

			const entries = entriesStmt.all(
				startDate,
				endDate
			) as PlannerEntry[];

			// Then get outfit details for each entry
			const result: (PlannerEntry & { outfit: Outfit })[] = [];

			for (const entry of entries) {
				try {
					// Get outfit details
					const outfitStmt = db.prepare(
						'SELECT * FROM outfits WHERE id = ?'
					);
					const outfitData = outfitStmt.get(entry.outfitId) as any;

					if (outfitData) {
						// Get outfit items
						const outfitItems = this.getOutfitItems(entry.outfitId);

						const outfit: Outfit = {
							id: outfitData.id,
							name: outfitData.name,
							items: outfitItems,
							createdAt: outfitData.createdAt,
							updatedAt: outfitData.updatedAt,
						};

						result.push({
							...entry,
							outfit,
						});
					} else {
						console.warn(
							`Outfit with ID ${entry.outfitId} not found for planner entry ${entry.id}`
						);
					}
				} catch (outfitError) {
					console.error(
						`Error fetching outfit ${entry.outfitId} for planner entry ${entry.id}:`,
						outfitError
					);
				}
			}

			return result;
		} catch (error) {
			console.error('Error fetching planner entries:', error);
			// Return empty array if table doesn't exist yet
			return [];
		}
	}

	// Get entries for a specific date
	static getEntriesForDate(date: string): PlannerEntry[] {
		const stmt = db.prepare(`
			SELECT * FROM planner_entries
			WHERE date = ?
			ORDER BY id ASC
		`);

		return stmt.all(date) as PlannerEntry[];
	}

	// Update a planner entry
	static updateEntry(
		id: number,
		updates: { date?: string; outfitId?: number; notes?: string }
	): PlannerEntry {
		const now = new Date().toISOString();

		// Build dynamic update query
		const fields = [];
		const values = [];

		if (updates.date !== undefined) {
			fields.push('date = ?');
			values.push(updates.date);
		}

		if (updates.outfitId !== undefined) {
			fields.push('outfitId = ?');
			values.push(updates.outfitId);
		}

		if (updates.notes !== undefined) {
			fields.push('notes = ?');
			values.push(updates.notes);
		}

		if (fields.length === 0) {
			throw new Error('No fields to update');
		}

		fields.push('updatedAt = ?');
		values.push(now);
		values.push(id);

		const stmt = db.prepare(`
			UPDATE planner_entries
			SET ${fields.join(', ')}
			WHERE id = ?
		`);

		const result = stmt.run(...values);

		if (result.changes === 0) {
			throw new Error('Planner entry not found');
		}

		// Return updated entry
		return this.getEntryById(id);
	}

	// Delete a planner entry
	static deleteEntry(id: number): boolean {
		const stmt = db.prepare('DELETE FROM planner_entries WHERE id = ?');
		const result = stmt.run(id);
		return result.changes > 0;
	}

	// Delete all entries for a specific date
	static deleteEntriesForDate(date: string): number {
		const stmt = db.prepare('DELETE FROM planner_entries WHERE date = ?');
		const result = stmt.run(date);
		return result.changes;
	}

	// Get a specific entry by ID
	static getEntryById(id: number): PlannerEntry {
		const stmt = db.prepare('SELECT * FROM planner_entries WHERE id = ?');
		const entry = stmt.get(id) as PlannerEntry | undefined;

		if (!entry) {
			throw new Error('Planner entry not found');
		}

		return entry;
	}

	// Helper method to get outfit items
	private static getOutfitItems(outfitId: number): InventoryItem[] {
		try {
			const stmt = db.prepare(`
				SELECT i.* FROM inventory i
				INNER JOIN outfit_items oi ON i.id = oi.inventory_id
				WHERE oi.outfit_id = ?
				ORDER BY oi.id
			`);

			return stmt.all(outfitId) as InventoryItem[];
		} catch (error) {
			console.error(
				`Error fetching items for outfit ${outfitId}:`,
				error
			);
			return [];
		}
	}

	// Move an outfit from one date to another
	static moveOutfit(entryId: number, newDate: string): PlannerEntry {
		return this.updateEntry(entryId, { date: newDate });
	}

	// Check if a date has any entries
	static hasEntriesForDate(date: string): boolean {
		const stmt = db.prepare(
			'SELECT COUNT(*) as count FROM planner_entries WHERE date = ?'
		);
		const result = stmt.get(date) as { count: number };
		return result.count > 0;
	}
}
