import { db } from './database';

export function migrateAddPlanner() {
	try {
		// Check if planner table already exists
		const tableExists = db
			.prepare(
				"SELECT name FROM sqlite_master WHERE type='table' AND name='planner_entries'"
			)
			.get();

		if (!tableExists) {
			// Create planner_entries table (without unique constraint to allow multiple outfits per day)
			const createPlannerTable = db.prepare(`
				CREATE TABLE planner_entries (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					date TEXT NOT NULL,
					outfitId INTEGER NOT NULL,
					notes TEXT,
					createdAt TEXT NOT NULL,
					updatedAt TEXT,
					FOREIGN KEY (outfitId) REFERENCES outfits(id) ON DELETE CASCADE
				)
			`);

			createPlannerTable.run();

			// Create indexes for better performance
			const createDateIndex = db.prepare(`
				CREATE INDEX IF NOT EXISTS idx_planner_date ON planner_entries(date)
			`);

			const createOutfitIdIndex = db.prepare(`
				CREATE INDEX IF NOT EXISTS idx_planner_outfit_id ON planner_entries(outfitId)
			`);

			createDateIndex.run();
			createOutfitIdIndex.run();

			console.log('Planner entries table created successfully');
		} else {
			console.log('Planner entries table already exists');

			// Check if the table has the old unique constraint and recreate if necessary
			try {
				const tableInfo = db
					.prepare(
						"SELECT sql FROM sqlite_master WHERE type='table' AND name='planner_entries'"
					)
					.get() as { sql: string } | undefined;

				if (
					tableInfo &&
					tableInfo.sql.includes('UNIQUE(date, outfitId)')
				) {
					console.log(
						'Recreating planner_entries table to remove unique constraint...'
					);

					// Backup existing data
					const existingData = db
						.prepare('SELECT * FROM planner_entries')
						.all() as any[];

					// Drop the old table
					db.prepare('DROP TABLE planner_entries').run();

					// Create new table without unique constraint
					const createPlannerTable = db.prepare(`
						CREATE TABLE planner_entries (
							id INTEGER PRIMARY KEY AUTOINCREMENT,
							date TEXT NOT NULL,
							outfitId INTEGER NOT NULL,
							notes TEXT,
							createdAt TEXT NOT NULL,
							updatedAt TEXT,
							FOREIGN KEY (outfitId) REFERENCES outfits(id) ON DELETE CASCADE
						)
					`);

					createPlannerTable.run();

					// Restore data
					if (existingData.length > 0) {
						const insertStmt = db.prepare(`
							INSERT INTO planner_entries (id, date, outfitId, notes, createdAt, updatedAt)
							VALUES (?, ?, ?, ?, ?, ?)
						`);

						for (const row of existingData) {
							insertStmt.run(
								row.id,
								row.date,
								row.outfitId,
								row.notes,
								row.createdAt,
								row.updatedAt
							);
						}
					}

					// Recreate indexes
					const createDateIndex = db.prepare(`
						CREATE INDEX IF NOT EXISTS idx_planner_date ON planner_entries(date)
					`);

					const createOutfitIdIndex = db.prepare(`
						CREATE INDEX IF NOT EXISTS idx_planner_outfit_id ON planner_entries(outfitId)
					`);

					createDateIndex.run();
					createOutfitIdIndex.run();

					console.log('Planner entries table recreated successfully');
				}
			} catch (constraintError) {
				console.log('Table schema check completed');
			}
		}
	} catch (error) {
		console.error('Error creating planner entries table:', error);
		throw error;
	}
}
