import { sqliteTable, text, real, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { foodSources } from "./food-sources";

export const foods = sqliteTable(
  "foods",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sourceId: text("source_id")
      .notNull()
      .references(() => foodSources.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    sourceDescription: text("source_description"),
    bddPercent: real("bdd_percent"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("foods_source_code_idx").on(table.sourceId, table.code),
    index("foods_code_idx").on(table.code),
    index("foods_name_idx").on(table.name),
  ]
);

export type Food = typeof foods.$inferSelect;
export type NewFood = typeof foods.$inferInsert;
