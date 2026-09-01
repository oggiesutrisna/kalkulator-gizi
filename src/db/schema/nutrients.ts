import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const nutrients = sqliteTable("nutrients", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  unit: text("unit").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Nutrient = typeof nutrients.$inferSelect;
export type NewNutrient = typeof nutrients.$inferInsert;
