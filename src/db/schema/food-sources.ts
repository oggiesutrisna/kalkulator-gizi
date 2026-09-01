import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

export const foodSources = sqliteTable(
  "food_sources",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    version: text("version").notNull(),
    description: text("description"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("food_sources_name_version_idx").on(table.name, table.version),
  ]
);

export type FoodSource = typeof foodSources.$inferSelect;
export type NewFoodSource = typeof foodSources.$inferInsert;
