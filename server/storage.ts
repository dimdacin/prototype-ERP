import { db } from "./db";
import { exempleTable, type Exemple, type InsertExemple } from "@shared/schema";

export interface IStorage {
  // Méthodes à développer progressivement
  getAllExemples(): Promise<Exemple[]>;
  createExemple(exemple: InsertExemple): Promise<Exemple>;
}

export class DbStorage implements IStorage {
  async getAllExemples(): Promise<Exemple[]> {
    return await db.select().from(exempleTable);
  }

  async createExemple(exemple: InsertExemple): Promise<Exemple> {
    const [newExemple] = await db.insert(exempleTable).values(exemple).returning();
    return newExemple;
  }
}

export const storage = new DbStorage();
