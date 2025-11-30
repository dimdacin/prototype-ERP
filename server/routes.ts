import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExempleSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ========== ROUTES EXEMPLE (À DÉVELOPPER) ==========
  app.get("/api/exemples", async (req, res) => {
    const exemples = await storage.getAllExemples();
    res.json(exemples);
  });

  app.post("/api/exemples", async (req, res) => {
    try {
      const validated = insertExempleSchema.parse(req.body);
      const exemple = await storage.createExemple(validated);
      res.json(exemple);
    } catch (error) {
      res.status(400).json({ error: "Validation failed" });
    }
  });

  // ========== HEALTH CHECK ==========
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
