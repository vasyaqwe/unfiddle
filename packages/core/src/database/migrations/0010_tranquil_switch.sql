-- This is a 100% harmless SQL migration file for Drizzle ORM,
-- specifically designed for SQLite databases.
-- It creates a dummy table if it doesn't exist, which is a no-op if it does.

-- Up migration
CREATE TABLE IF NOT EXISTS _drizzle_dummy_migration_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Down migration
DROP TABLE IF EXISTS _drizzle_dummy_migration_table;
