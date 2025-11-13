import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import * as XLSX from 'xlsx';
import { parseExcelToEquipements } from "./import";
import { 
  insertChantierSchema, insertSalarieSchema, insertEquipementSchema,
  insertAffectationSalarieSchema, insertAffectationEquipementSchema, insertDepenseSchema,
  insertEtapeChantierSchema, insertDocumentChantierSchema
} from "@shared/schema";
import { getChantierDetails } from "./services/chantier-details";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ========== CHANTIERS ROUTES ==========
  app.get("/api/chantiers", async (req, res) => {
    try {
      const chantiers = await storage.getAllChantiers();
      res.json(chantiers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chantiers" });
    }
  });

  app.get("/api/chantiers/:id", async (req, res) => {
    try {
      const chantier = await storage.getChantier(req.params.id);
      if (!chantier) {
        return res.status(404).json({ error: "Chantier not found" });
      }
      res.json(chantier);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chantier" });
    }
  });

  app.get("/api/chantiers/:id/details", async (req, res) => {
    try {
      const details = await getChantierDetails(req.params.id);
      if (!details) {
        return res.status(404).json({ error: "Chantier not found" });
      }
      res.json(details);
    } catch (error) {
      console.error("Error fetching chantier details:", error);
      res.status(500).json({ error: "Failed to fetch chantier details" });
    }
  });

  app.post("/api/chantiers", async (req, res) => {
    try {
      const validated = insertChantierSchema.parse(req.body);
      const chantier = await storage.createChantier(validated);
      res.status(201).json(chantier);
    } catch (error) {
      res.status(400).json({ error: "Invalid chantier data" });
    }
  });

  app.patch("/api/chantiers/:id", async (req, res) => {
    try {
      const chantier = await storage.updateChantier(req.params.id, req.body);
      if (!chantier) {
        return res.status(404).json({ error: "Chantier not found" });
      }
      res.json(chantier);
    } catch (error) {
      res.status(400).json({ error: "Failed to update chantier" });
    }
  });

  app.delete("/api/chantiers/:id", async (req, res) => {
    try {
      await storage.deleteChantier(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete chantier" });
    }
  });

  // ========== SALARIÉS ROUTES ==========
  app.get("/api/salaries", async (req, res) => {
    try {
      const salaries = await storage.getAllSalaries();
      res.json(salaries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch salaries" });
    }
  });

  app.get("/api/salaries/:id", async (req, res) => {
    try {
      const salarie = await storage.getSalarie(req.params.id);
      if (!salarie) {
        return res.status(404).json({ error: "Salarie not found" });
      }
      res.json(salarie);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch salarie" });
    }
  });

  app.post("/api/salaries", async (req, res) => {
    try {
      const validated = insertSalarieSchema.parse(req.body);
      const salarie = await storage.createSalarie(validated);
      res.status(201).json(salarie);
    } catch (error) {
      res.status(400).json({ error: "Invalid salarie data" });
    }
  });

  app.patch("/api/salaries/:id", async (req, res) => {
    try {
      const salarie = await storage.updateSalarie(req.params.id, req.body);
      if (!salarie) {
        return res.status(404).json({ error: "Salarie not found" });
      }
      res.json(salarie);
    } catch (error) {
      res.status(400).json({ error: "Failed to update salarie" });
    }
  });

  app.delete("/api/salaries/:id", async (req, res) => {
    try {
      await storage.deleteSalarie(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete salarie" });
    }
  });

  // ========== ÉQUIPEMENTS ROUTES ==========
  app.get("/api/equipements", async (req, res) => {
    try {
      const equipements = await storage.getAllEquipements();
      res.json(equipements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch equipements" });
    }
  });

  app.get("/api/equipements/:id", async (req, res) => {
    try {
      const equipement = await storage.getEquipement(req.params.id);
      if (!equipement) {
        return res.status(404).json({ error: "Equipement not found" });
      }
      res.json(equipement);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch equipement" });
    }
  });

  app.post("/api/equipements", async (req, res) => {
    try {
      const validated = insertEquipementSchema.parse(req.body);
      const equipement = await storage.createEquipement(validated);
      res.status(201).json(equipement);
    } catch (error) {
      res.status(400).json({ error: "Invalid equipement data" });
    }
  });

  app.patch("/api/equipements/:id", async (req, res) => {
    try {
      const equipement = await storage.updateEquipement(req.params.id, req.body);
      if (!equipement) {
        return res.status(404).json({ error: "Equipement not found" });
      }
      res.json(equipement);
    } catch (error) {
      res.status(400).json({ error: "Failed to update equipement" });
    }
  });

  app.delete("/api/equipements/:id", async (req, res) => {
    try {
      await storage.deleteEquipement(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete equipement" });
    }
  });

  app.delete("/api/equipements", async (req, res) => {
    try {
      await storage.deleteAllEquipements();
      res.status(200).json({ message: "All equipment deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete all equipements" });
    }
  });

  // ========== AFFECTATIONS SALARIÉS ROUTES ==========
  app.get("/api/affectations/salaries", async (req, res) => {
    try {
      const chantierId = req.query.chantierId as string | undefined;
      const affectations = chantierId 
        ? await storage.getAffectationsSalariesByChantier(chantierId)
        : await storage.getAllAffectationsSalaries();
      res.json(affectations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch affectations" });
    }
  });

  app.post("/api/affectations/salaries", async (req, res) => {
    try {
      const validated = insertAffectationSalarieSchema.parse(req.body);
      const affectation = await storage.createAffectationSalarie(validated);
      res.status(201).json(affectation);
    } catch (error) {
      res.status(400).json({ error: "Invalid affectation data" });
    }
  });

  app.delete("/api/affectations/salaries/:id", async (req, res) => {
    try {
      await storage.deleteAffectationSalarie(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete affectation" });
    }
  });

  // ========== AFFECTATIONS ÉQUIPEMENTS ROUTES ==========
  app.get("/api/affectations/equipements", async (req, res) => {
    try {
      const chantierId = req.query.chantierId as string | undefined;
      const affectations = chantierId 
        ? await storage.getAffectationsEquipementsByChantier(chantierId)
        : await storage.getAllAffectationsEquipements();
      res.json(affectations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch affectations" });
    }
  });

  app.post("/api/affectations/equipements", async (req, res) => {
    try {
      const validated = insertAffectationEquipementSchema.parse(req.body);
      const affectation = await storage.createAffectationEquipement(validated);
      res.status(201).json(affectation);
    } catch (error) {
      res.status(400).json({ error: "Invalid affectation data" });
    }
  });

  app.delete("/api/affectations/equipements/:id", async (req, res) => {
    try {
      await storage.deleteAffectationEquipement(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete affectation" });
    }
  });

  // ========== DÉPENSES ROUTES ==========
  app.get("/api/depenses", async (req, res) => {
    try {
      const chantierId = req.query.chantierId as string | undefined;
      const depenses = chantierId 
        ? await storage.getDepensesByChantier(chantierId)
        : await storage.getAllDepenses();
      res.json(depenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch depenses" });
    }
  });

  app.post("/api/depenses", async (req, res) => {
    try {
      const validated = insertDepenseSchema.parse(req.body);
      const depense = await storage.createDepense(validated);
      res.status(201).json(depense);
    } catch (error) {
      res.status(400).json({ error: "Invalid depense data" });
    }
  });

  app.delete("/api/depenses/:id", async (req, res) => {
    try {
      await storage.deleteDepense(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete depense" });
    }
  });

  app.patch("/api/depenses/:id/reception", async (req, res) => {
    try {
      const { dateReception, operateurReception, photoFacturePath } = req.body;
      
      if (!dateReception || !operateurReception) {
        return res.status(400).json({ error: "Date de réception et opérateur requis" });
      }

      const depense = await storage.updateDepenseReception(req.params.id, {
        dateReception,
        operateurReception,
        photoFacturePath
      });

      if (!depense) {
        return res.status(404).json({ error: "Depense not found" });
      }

      res.json(depense);
    } catch (error) {
      res.status(500).json({ error: "Failed to update depense reception" });
    }
  });

  app.post("/api/upload-facture", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Aucun fichier fourni" });
      }

      // Sanitize filename: remove path separators and special characters
      const originalName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const timestamp = Date.now();
      const filename = `facture_${timestamp}_${originalName}`;
      const filePath = `/uploads/factures/${filename}`;

      // Store file buffer in base64 for demo purposes
      // In production, save to disk or cloud storage (S3, Cloudinary, etc.)
      const base64Data = req.file.buffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${base64Data}`;

      res.json({ 
        success: true, 
        path: dataUrl,  // Return data URL for display
        filename: filename
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to upload invoice photo" });
    }
  });

  // ========== ÉTAPES CHANTIER ROUTES ==========
  app.get("/api/chantiers/:id/etapes", async (req, res) => {
    try {
      const etapes = await storage.getEtapesByChantier(req.params.id);
      res.json(etapes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch etapes" });
    }
  });

  app.post("/api/chantiers/:id/etapes", async (req, res) => {
    try {
      const validated = insertEtapeChantierSchema.parse({
        ...req.body,
        chantierId: req.params.id
      });
      const etape = await storage.createEtapeChantier(validated);
      res.status(201).json(etape);
    } catch (error) {
      res.status(400).json({ error: "Invalid etape data" });
    }
  });

  app.patch("/api/etapes/:id", async (req, res) => {
    try {
      // Validate partial update with Zod
      const partialSchema = insertEtapeChantierSchema.partial();
      const validated = partialSchema.parse(req.body);
      
      const etape = await storage.updateEtapeChantier(req.params.id, validated);
      if (!etape) {
        return res.status(404).json({ error: "Etape not found" });
      }
      res.json(etape);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid etape data" });
      }
      res.status(500).json({ error: "Failed to update etape" });
    }
  });

  app.delete("/api/etapes/:id", async (req, res) => {
    try {
      await storage.deleteEtapeChantier(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete etape" });
    }
  });

  // ========== DOCUMENTS CHANTIER ROUTES ==========
  app.get("/api/chantiers/:id/documents", async (req, res) => {
    try {
      const documents = await storage.getDocumentsByChantier(req.params.id);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.post("/api/chantiers/:id/documents", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Aucun fichier fourni" });
      }

      const { categorie, description, uploadePar } = req.body;
      if (!categorie) {
        return res.status(400).json({ error: "Catégorie requise" });
      }

      const originalName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const timestamp = Date.now();
      const filename = `doc_${timestamp}_${originalName}`;
      
      // Store file as base64 data URL (for demo - in production use cloud storage)
      const base64Data = req.file.buffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${base64Data}`;

      const validated = insertDocumentChantierSchema.parse({
        chantierId: req.params.id,
        nom: req.file.originalname,
        categorie,
        cheminFichier: dataUrl,
        typeMime: req.file.mimetype,
        taille: req.file.size,
        uploadePar,
        description
      });

      const document = await storage.createDocumentChantier(validated);
      res.status(201).json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      await storage.deleteDocumentChantier(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // ========== USINES ROUTES ==========
  app.get("/api/usines", async (req, res) => {
    try {
      const usines = await storage.getAllUsines();
      res.json(usines);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch usines" });
    }
  });

  app.post("/api/usines", async (req, res) => {
    try {
      const { insertUsineSchema } = await import("@shared/schema");
      const validated = insertUsineSchema.parse(req.body);
      const usine = await storage.createUsine(validated);
      res.status(201).json(usine);
    } catch (error) {
      res.status(400).json({ error: "Invalid usine data" });
    }
  });

  app.delete("/api/usines/:id", async (req, res) => {
    try {
      await storage.deleteUsine(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete usine" });
    }
  });

  // ========== STOCK ITEMS ROUTES ==========
  app.get("/api/stock-items", async (req, res) => {
    try {
      const stockItems = await storage.getAllStockItems();
      res.json(stockItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock items" });
    }
  });

  app.post("/api/stock-items", async (req, res) => {
    try {
      const { insertStockItemSchema } = await import("@shared/schema");
      const validated = insertStockItemSchema.parse(req.body);
      const stockItem = await storage.createStockItem(validated);
      res.status(201).json(stockItem);
    } catch (error) {
      res.status(400).json({ error: "Invalid stock item data" });
    }
  });

  app.patch("/api/stock-items/:id", async (req, res) => {
    try {
      const { insertStockItemSchema } = await import("@shared/schema");
      const validated = insertStockItemSchema.partial().parse(req.body);
      const stockItem = await storage.updateStockItem(req.params.id, validated);
      if (!stockItem) {
        return res.status(404).json({ error: "Stock item not found" });
      }
      res.json(stockItem);
    } catch (error) {
      res.status(400).json({ error: "Invalid stock item data" });
    }
  });

  app.delete("/api/stock-items/:id", async (req, res) => {
    try {
      await storage.deleteStockItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete stock item" });
    }
  });

  // ========== DEBUG EXCEL ROUTE ==========
  app.post("/api/equipements/debug-excel", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Aucun fichier fourni" });
      }

      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('machine')) || workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data: any[] = XLSX.utils.sheet_to_json(worksheet);
      
      const firstRow = data[0] || {};
      const columnNames = Object.keys(firstRow);
      
      return res.status(200).json({
        sheetName,
        columnNames,
        firstRow,
        totalRows: data.length
      });
    } catch (error: any) {
      console.error('Erreur debug Excel:', error);
      return res.status(500).json({ error: error.message || 'Erreur inconnue' });
    }
  });

  // ========== IMPORT EXCEL ROUTE ==========
  app.post("/api/equipements/import", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: "Aucun fichier fourni" });
      }

      console.log('Fichier reçu:', req.file.originalname, 'Taille:', req.file.size);
      
      const equipements = parseExcelToEquipements(req.file.buffer);
      console.log('Équipements détectés:', equipements.length);
      
      // Importer les équipements dans la base de données
      const imported = [];
      const errors = [];
      
      for (const equipement of equipements) {
        try {
          const created = await storage.createEquipement(equipement);
          imported.push(created);
        } catch (error: any) {
          console.error('Erreur lors de l\'import d\'un équipement:', error);
          errors.push({ equipement: equipement.nom, error: error.message });
        }
      }

      console.log('Import terminé:', imported.length, 'importés sur', equipements.length);
      
      return res.status(200).json({ 
        success: true, 
        imported: imported.length,
        total: equipements.length,
        errors: errors.length > 0 ? errors : undefined,
        equipements: imported
      });
    } catch (error: any) {
      console.error('Erreur lors de l\'import Excel:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || 'Erreur inconnue lors de l\'import' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
