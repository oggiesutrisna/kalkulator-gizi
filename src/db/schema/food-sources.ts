import { pgTable, uuid, varchar, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const foodSources = pgTable(
  "food_sources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    version: varchar("version", { length: 50 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("food_sources_name_version_idx").on(table.name, table.version),
  ]
);

export type FoodSource = typeof foodSources.$inferSelect;
export type NewFoodSource = typeof foodSources.$inferInsert;
