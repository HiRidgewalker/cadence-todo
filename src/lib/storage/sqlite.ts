import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

let databasePromise: Promise<SQLiteDatabase> | undefined;

const schema = `
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('month', 'week', 'day')),
  period_key TEXT NOT NULL,
  title TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0 CHECK (done IN (0, 1)),
  parent_id TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS tasks_level_period ON tasks (level, period_key);
CREATE INDEX IF NOT EXISTS tasks_parent ON tasks (parent_id);
`;

export function getDatabase() {
  if (!databasePromise) {
    databasePromise = openDatabaseAsync("notebook.db")
      .then(async (database) => {
        await database.execAsync(schema);
        return database;
      })
      .catch((error: unknown) => {
        databasePromise = undefined;
        throw error;
      });
  }

  return databasePromise;
}
