import { drizzle as drizzlePg, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle as drizzlePglite, PgliteDatabase } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import postgres from "postgres";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

export type AppDatabase = PostgresJsDatabase<typeof schema> | PgliteDatabase<typeof schema>;

let dbInstance: AppDatabase | null = null;

export function createPgliteDatabase(customDataDir?: string): PgliteDatabase<typeof schema> {
  const targetDir = customDataDir || path.resolve(process.cwd(), ".pgdata");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const client = new PGlite(targetDir);
  return drizzlePglite(client, { schema });
}

export function getDatabase(): AppDatabase {
  if (dbInstance) {
    return dbInstance;
  }

  const driver = process.env.DATABASE_DRIVER?.toLowerCase();
  const connectionString = process.env.DATABASE_URL;

  if (driver === "pglite" || !connectionString || connectionString.startsWith("pglite://")) {
    dbInstance = createPgliteDatabase();
    return dbInstance;
  }

  try {
    const client = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 2,
      onnotice: () => {},
    });
    dbInstance = drizzlePg(client, { schema });
    return dbInstance;
  } catch {
    dbInstance = createPgliteDatabase();
    return dbInstance;
  }
}

export const db = new Proxy({} as AppDatabase, {
  get(_target, prop: keyof AppDatabase) {
    const instance = getDatabase();
    const value = instance[prop];
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(instance);
    }
    return value;
  },
});
