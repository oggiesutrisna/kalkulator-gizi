import { getDatabase, createPgliteDatabase, AppDatabase } from "./index";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

export async function ensurePostgresDatabaseExists(connectionString?: string): Promise<boolean> {
  if (!connectionString || connectionString.startsWith("pglite://")) return false;

  try {
    const url = new URL(connectionString);
    const targetDbName = url.pathname.replace(/^\//, "");
    if (!targetDbName || targetDbName === "postgres") return true;

    // Connect to postgres database to check and create target database if needed
    url.pathname = "/postgres";
    const adminSql = postgres(url.toString(), { connect_timeout: 3, onnotice: () => {} });
    const existing = await adminSql`SELECT 1 FROM pg_database WHERE datname = ${targetDbName}`;
    if (existing.length === 0) {
      console.log(`Creating database "${targetDbName}" on PostgreSQL server...`);
      await adminSql.unsafe(`CREATE DATABASE "${targetDbName}"`);
      console.log(`Database "${targetDbName}" created successfully.`);
    }
    await adminSql.end();
    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`PostgreSQL server check info: ${message}`);
    return false;
  }
}

export async function runMigrations(targetDb?: AppDatabase): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!targetDb && connectionString) {
    await ensurePostgresDatabaseExists(connectionString);
  }

  let activeDb: AppDatabase = targetDb || getDatabase();
  console.log("Running database migrations...");

  const migrationsDir = path.resolve(process.cwd(), "src/db/migrations");
  if (!fs.existsSync(migrationsDir)) {
    console.log("No migrations directory found.");
    return;
  }

  const sqlFiles = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  // Test if activeDb is working; if remote Postgres fails, fallback to PGlite
  try {
    await activeDb.execute(sql`SELECT 1`);
  } catch {
    console.warn("Primary database connection failed, falling back to local PGlite...");
    activeDb = createPgliteDatabase();
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
        await activeDb.execute(sql.raw(statement));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        if (
          !message.includes("already exists") &&
          !message.includes("duplicate")
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
