import { drizzle, LibSQLDatabase } from "drizzle-orm/libsql";
import { createClient, Client } from "@libsql/client";
import * as schema from "./schema";

export type AppDatabase = LibSQLDatabase<typeof schema>;

let dbInstance: AppDatabase | null = null;
let clientInstance: Client | null = null;

function getDatabaseUrl(): string {
  return process.env.DATABASE_URL || "file:./dev.db";
}

function getAuthToken(): string | undefined {
  return process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN || undefined;
}

export function getDatabase(): AppDatabase {
  if (dbInstance) {
    return dbInstance;
  }

  const url = getDatabaseUrl();
  const authToken = getAuthToken();

  clientInstance = createClient({
    url,
    authToken,
  });

  dbInstance = drizzle(clientInstance, { schema });

  try {
    void clientInstance.execute("PRAGMA foreign_keys = ON");
  } catch {
    // ignore for remote
  }

  return dbInstance;
}

export function resetDatabase(): void {
  dbInstance = null;
  if (clientInstance) {
    try {
      clientInstance.close();
    } catch {
      // ignore
    }
    clientInstance = null;
  }
}

export const db = new Proxy({} as AppDatabase, {
  get(_target, prop: keyof AppDatabase) {
    const instance = getDatabase();
    const value = instance[prop as keyof AppDatabase];
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(instance);
    }
    return value;
  },
});
