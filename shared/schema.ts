import { sql } from "drizzle-orm";
import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================
// TABLE EXEMPLE (À DÉVELOPPER PROGRESSIVEMENT)
// ============================================

export const exempleTable = pgTable("exemple_table", {
  id: varchar("id", { length: 50 }).primaryKey().default(sql`gen_random_uuid()`),
  nom: varchar("nom", { length: 200 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schémas Zod pour validation
export const insertExempleSchema = createInsertSchema(exempleTable).omit({ 
  id: true, 
  createdAt: true 
});
export const selectExempleSchema = createSelectSchema(exempleTable);

// Types TypeScript
export type Exemple = z.infer<typeof selectExempleSchema>;
export type InsertExemple = z.infer<typeof insertExempleSchema>;
