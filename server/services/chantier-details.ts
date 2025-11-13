import { storage } from "../storage";
import type { Chantier } from "@shared/schema";

export interface ChantierDetailsResponse {
  // Base chantier info
  chantier: Chantier;
  
  // Responsable enriched
  responsable: {
    nom: string;
    prenom: string;
  } | null;
  
  // Budget analysis
  budgetAnalysis: {
    ecartGlobal: number;
    ecartMainDoeuvre: number;
    ecartMateriaux: number;
    ecartEquipement: number;
    pourcentageRealise: number;
  };
  
  // Affectations enriched
  affectationsSalaries: Array<{
    id: string;
    salarieNom: string;
    salariePrenom: string;
    dateDebut: string;
    dateFin: string;
    heuresParJour: string;
    tauxHoraire: string | null;
    coutEstime: number;
    notes: string | null;
  }>;
  
  affectationsEquipements: Array<{
    id: string;
    equipementNom: string;
    modele: string | null;
    dateDebut: string;
    dateFin: string;
    coutJournalier: string | null;
    coutEstime: number;
    notes: string | null;
  }>;
  
  // Costs summary
  coutsSummary: {
    totalSalaries: number;
    totalEquipements: number;
    totalAffecte: number;
  };
  
  // Project stages
  etapes: Array<{
    id: string;
    nom: string;
    description: string | null;
    dateDebut: string | null;
    dateFin: string | null;
    statut: string;
    progression: number;
    ordre: number;
  }>;
  
  // Documents
  documents: Array<{
    id: string;
    nom: string;
    categorie: string;
    typeMime: string | null;
    taille: number | null;
    uploadePar: string | null;
    description: string | null;
    createdAt: Date;
  }>;
  
  // Completeness indicators
  completeness: {
    hasResponsable: boolean;
    hasBudgetReel: boolean;
    hasAffectations: boolean;
    hasDates: boolean;
    hasEtapes: boolean;
    hasDocuments: boolean;
    score: number;
  };
}

export async function getChantierDetails(chantierId: string): Promise<ChantierDetailsResponse | null> {
  // Fetch all data in parallel
  const [
    chantier,
    affectationsSalariesRaw,
    affectationsEquipementsRaw,
    etapes,
    documents
  ] = await Promise.all([
    storage.getChantier(chantierId),
    storage.getAffectationsSalariesEnriched(chantierId),
    storage.getAffectationsEquipementsEnriched(chantierId),
    storage.getEtapesByChantier(chantierId),
    storage.getDocumentsByChantier(chantierId)
  ]);

  if (!chantier) {
    return null;
  }

  // Get responsable info if exists
  const responsable = chantier.responsableId 
    ? (await storage.getResponsableInfo(chantier.responsableId)) || null
    : null;

  // Calculate budget analysis with null safety
  const budgetPrev = parseFloat(chantier.budgetPrevisionnel || "0");
  const budgetReel = parseFloat(chantier.budgetRealise || "0");
  const budgetMDOPrev = parseFloat(chantier.budgetMainDoeuvre || "0");
  const budgetMDOReel = parseFloat(chantier.budgetReelMainDoeuvre || "0");
  const budgetMatPrev = parseFloat(chantier.budgetMateriaux || "0");
  const budgetMatReel = parseFloat(chantier.budgetReelMateriaux || "0");
  const budgetEqPrev = parseFloat(chantier.budgetEquipement || "0");
  const budgetEqReel = parseFloat(chantier.budgetReelEquipement || "0");

  const budgetAnalysis = {
    ecartGlobal: budgetReel - budgetPrev,
    ecartMainDoeuvre: budgetMDOReel - budgetMDOPrev,
    ecartMateriaux: budgetMatReel - budgetMatPrev,
    ecartEquipement: budgetEqReel - budgetEqPrev,
    pourcentageRealise: budgetPrev > 0 ? (budgetReel / budgetPrev) * 100 : 0
  };

  // Process affectations salaries with cost calculation (with null safety)
  const affectationsSalaries = affectationsSalariesRaw.map(aff => {
    let coutEstime = 0;
    
    // Only calculate cost if we have valid dates and rates
    if (aff.dateDebut && aff.dateFin && aff.heuresParJour) {
      const dateDebut = new Date(aff.dateDebut);
      const dateFin = new Date(aff.dateFin);
      
      // Validate dates are valid
      if (!isNaN(dateDebut.getTime()) && !isNaN(dateFin.getTime())) {
        const jours = Math.max(1, Math.ceil((dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        const tauxHoraire = parseFloat(aff.tauxHoraire || "0");
        const heuresParJour = parseFloat(aff.heuresParJour);
        
        // Only calculate if we have valid numbers
        if (!isNaN(tauxHoraire) && !isNaN(heuresParJour)) {
          coutEstime = jours * heuresParJour * tauxHoraire;
        }
      }
    }

    return {
      id: aff.id,
      salarieNom: aff.salarieNom,
      salariePrenom: aff.salariePrenom,
      dateDebut: aff.dateDebut,
      dateFin: aff.dateFin,
      heuresParJour: aff.heuresParJour,
      tauxHoraire: aff.tauxHoraire,
      coutEstime,
      notes: aff.notes
    };
  });

  // Process affectations equipements with cost calculation (with null safety)
  const affectationsEquipements = affectationsEquipementsRaw.map(aff => {
    let coutEstime = 0;
    
    // Only calculate cost if we have valid dates
    if (aff.dateDebut && aff.dateFin) {
      const dateDebut = new Date(aff.dateDebut);
      const dateFin = new Date(aff.dateFin);
      
      // Validate dates are valid
      if (!isNaN(dateDebut.getTime()) && !isNaN(dateFin.getTime())) {
        const jours = Math.max(1, Math.ceil((dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        const coutJournalier = parseFloat(aff.coutJournalier || "0");
        
        // Only calculate if we have a valid number
        if (!isNaN(coutJournalier)) {
          coutEstime = jours * coutJournalier;
        }
      }
    }

    return {
      id: aff.id,
      equipementNom: aff.equipementNom,
      modele: aff.modele,
      dateDebut: aff.dateDebut,
      dateFin: aff.dateFin,
      coutJournalier: aff.coutJournalier,
      coutEstime,
      notes: aff.notes
    };
  });

  // Calculate costs summary
  const totalSalaries = affectationsSalaries.reduce((sum, aff) => sum + aff.coutEstime, 0);
  const totalEquipements = affectationsEquipements.reduce((sum, aff) => sum + aff.coutEstime, 0);

  const coutsSummary = {
    totalSalaries,
    totalEquipements,
    totalAffecte: totalSalaries + totalEquipements
  };

  // Calculate completeness score
  const hasResponsable = !!chantier.responsableId;
  const hasBudgetReel = budgetReel > 0;
  const hasAffectations = affectationsSalaries.length > 0 || affectationsEquipements.length > 0;
  const hasDates = !!chantier.dateDebut && !!chantier.dateLimite;
  const hasEtapes = etapes.length > 0;
  const hasDocuments = documents.length > 0;

  const completenessItems = [hasResponsable, hasBudgetReel, hasAffectations, hasDates, hasEtapes, hasDocuments];
  const score = Math.round((completenessItems.filter(Boolean).length / completenessItems.length) * 100);

  return {
    chantier,
    responsable,
    budgetAnalysis,
    affectationsSalaries,
    affectationsEquipements,
    coutsSummary,
    etapes: etapes.map(e => ({
      id: e.id,
      nom: e.nom,
      description: e.description,
      dateDebut: e.dateDebut,
      dateFin: e.dateFin,
      statut: e.statut,
      progression: e.progression,
      ordre: e.ordre
    })),
    documents: documents.map(d => ({
      id: d.id,
      nom: d.nom,
      categorie: d.categorie,
      typeMime: d.typeMime,
      taille: d.taille,
      uploadePar: d.uploadePar,
      description: d.description,
      createdAt: d.createdAt
    })),
    completeness: {
      hasResponsable,
      hasBudgetReel,
      hasAffectations,
      hasDates,
      hasEtapes,
      hasDocuments,
      score
    }
  };
}
