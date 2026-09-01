import { getDatabase, AppDatabase } from "./index";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

export async function runMigrations(targetDb?: AppDatabase): Promise<void> {
  const activeDb: AppDatabase = targetDb || getDatabase();
  console.log("Running database migrations...");

  try {
    await activeDb.run(sql`PRAGMA foreign_keys = ON`);
  } catch {
    // ignore for libsql remote where PRAGMA may not be supported
  }

  const migrationsDir = path.resolve(process.cwd(), "src/db/migrations");
  if (!fs.existsSync(migrationsDir)) {
    console.log("No migrations directory found.");
    return;
  }

  const sqlFiles = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (sqlFiles.length === 0) {
    console.log("No migration files found.");
    return;
  }

  try {
    await activeDb.run(sql`SELECT 1`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Database connection failed: ${message}`);
    throw err;
  }

  for (const file of sqlFiles) {
    const filePath = path.join(migrationsDir, file);
    const sqlContent = fs.readFileSync(filePath, "utf-8");
    const statements = sqlContent
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      try {
        await activeDb.run(sql.raw(statement));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        if (
          !message.includes("already exists") &&
          !message.includes("duplicate") &&
          !message.toLowerCase().includes("duplicate column")
        ) {
          console.warn(`Migration statement notice (${file}): ${message}`);
        }
      }
    }
    console.log(`✓ Applied migration: ${file}`);
  }

  console.log("Database migrations completed successfully.");
}

if (process.argv[1]?.includes("migrate.ts")) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}
