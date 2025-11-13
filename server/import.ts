import * as XLSX from 'xlsx';
import type { InsertEquipement } from '@shared/schema';

export interface ExcelMapping {
  equipID?: string;
  categorie?: string;
  modele?: string;
  immatriculation?: string;
  annee?: string;
  statut?: string;
  uniteCompteur?: string;
  typeCarburant?: string;
  conso100kmL?: string;
  consoHL?: string;
  coutCarbHLei?: string;
  coutCarb100kmLei?: string;
  entretienAnnuelLei?: string;
  kmTravailAnn?: string;
  entretien100kmLei?: string;
  heuresTravailAnn?: string;
  entretienHLei?: string;
  valeurComptableLei?: string;
  dureeVieAns?: string;
  valeurResiduelleLei?: string;
  baseAmortissableLei?: string;
  tauxAmortAnn?: string;
  amortTotalLei?: string;
  amortHLei?: string;
  coutUsage1hLei?: string;
  coutUsage100kmLei?: string;
  tauxHoraireOperateurLei?: string;
}

function parseNumber(value: any): string | null {
  if (value === undefined || value === null || value === '') return null;
  const str = String(value).replace(',', '.').replace(/[^\d.-]/g, '');
  const num = parseFloat(str);
  return !isNaN(num) ? String(num) : null;
}

function parseInt32(value: any): number | null {
  if (value === undefined || value === null || value === '') return null;
  const num = parseInt(String(value).replace(/[^\d-]/g, ''));
  return !isNaN(num) ? num : null;
}

export function parseExcelToEquipements(fileBuffer: Buffer, mapping?: ExcelMapping): InsertEquipement[] {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  
  const sheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('machine') || 
    name.toLowerCase().includes('equip')
  ) || workbook.SheetNames[0];
  
  const worksheet = workbook.Sheets[sheetName];
  const data: any[] = XLSX.utils.sheet_to_json(worksheet);
  
  if (data.length === 0) {
    throw new Error('Le fichier Excel est vide');
  }

  const firstRow = data[0];
  const columnNames = Object.keys(firstRow);
  
  console.log('Colonnes détectées:', columnNames);
  console.log('Première ligne:', firstRow);
  
  const autoMapping: ExcelMapping = {
    equipID: columnNames.find(col => 
      /^equip\s*id$/i.test(col.trim()) || 
      /^id$/i.test(col.trim())
    ),
    categorie: columnNames.find(col => 
      /^categorie$/i.test(col.trim()) || 
      /^category$/i.test(col.trim())
    ),
    modele: columnNames.find(col => 
      /^modele$/i.test(col.trim()) || 
      /^model$/i.test(col.trim())
    ),
    immatriculation: columnNames.find(col => 
      /^immatriculation$/i.test(col.trim()) || 
      /^plaque$/i.test(col.trim())
    ),
    annee: columnNames.find(col => 
      /^annee$/i.test(col.trim()) || 
      /^year$/i.test(col.trim())
    ),
    statut: columnNames.find(col => 
      /^statut$/i.test(col.trim()) || 
      /^status$/i.test(col.trim())
    ),
    uniteCompteur: columnNames.find(col => 
      /^unite\s*compteur$/i.test(col.trim()) || 
      /^meter\s*unit$/i.test(col.trim())
    ),
    typeCarburant: columnNames.find(col => 
      /^type\s*carburant$/i.test(col.trim()) || 
      /^fuel\s*type$/i.test(col.trim())
    ),
    conso100kmL: columnNames.find(col => 
      /^conso.*100.*km.*l$/i.test(col.trim().replace(/[_\s-]/g, ''))
    ),
    consoHL: columnNames.find(col => 
      /^conso.*h.*l$/i.test(col.trim().replace(/[_\s-]/g, ''))
    ),
    coutCarbHLei: columnNames.find(col => 
      /^cout.*carb.*h.*lei$/i.test(col.trim().replace(/[_\s-]/g, ''))
    ),
    coutCarb100kmLei: columnNames.find(col => 
      /^cout.*carb.*100.*km.*lei$/i.test(col.trim().replace(/[_\s-]/g, ''))
    ),
    entretienAnnuelLei: columnNames.find(col => 
      /^entretien.*annuel.*lei$/i.test(col.trim().replace(/[_\s-]/g, ''))
    ),
    kmTravailAnn: columnNames.find(col => 
      /^km.*travail.*ann$/i.test(col.trim().replace(/[_\s-]/g, ''))
    ),
    entretien100kmLei: columnNames.find(col => 
      /^entretien.*100.*km.*lei$/i.test(col.trim().replace(/[_\s-]/g, ''))
    ),
    heuresTravailAnn: columnNames.find(col => 
      /^heures.*travail.*ann$/i.test(col.trim().replace(/[_\s-]/g, ''))
    ),
    entretienHLei: columnNames.find(col => 
      /^entretien.*h.*lei$/i.test(col.trim().replace(/[_\s-]/g, ''))
    ),
    valeurComptableLei: columnNames.find(col => 
      /^valeur.*comptable.*lei$/i.test(col.trim().replace(/[_\s-]/g, ''))
    ),
    dureeVieAns: columnNames.find(col => 
      /^duree.*vie.*ans$/i.test(col.trim().replace(/[_\s-]/g, ''))
    ),
    valeurResiduelleLei: columnNames.find(col => 
      /^valeur.*residuelle.*lei$/i.test(col.trim().replace(/[_\s-]/g, ''))
    ),
    baseAmortissableLei: columnNames.find(col => 
      /^base.*amortissable.*lei$/i.test(col.trim().replace(/[_\s-]/g, ''))
    ),
    tauxAmortAnn: columnNames.find(col => 
      /^taux.*amort.*ann$/i.test(col.trim().replace(/[_\s-]/g, ''))
    ),
    amortTotalLei: columnNames.find(col => 
      /^amort.*total.*lei$/i.test(col.trim().replace(/[_\s-]/g, ''))
    ),
    amortHLei: columnNames.find(col => 
      /^amort.*h.*lei$/i.test(col.trim().replace(/[_\s-]/g, ''))
    ),
    coutUsage1hLei: columnNames.find(col => 
      /^cout.*usage.*1.*h.*lei$/i.test(col.trim().replace(/[_\s-]/g, ''))
    ),
    coutUsage100kmLei: columnNames.find(col => 
      /^cout.*usage.*100.*km.*lei$/i.test(col.trim().replace(/[_\s-]/g, ''))
    ),
    tauxHoraireOperateurLei: columnNames.find(col => 
      /^taux.*horaire.*operateur.*lei$/i.test(col.trim().replace(/[_\s-]/g, ''))
    ),
  };

  const finalMapping = { ...autoMapping, ...mapping };
  
  console.log('Final mapping:', finalMapping);

  const equipements: InsertEquipement[] = data.map((row, index) => {
    try {
      const equipID = finalMapping.equipID ? String(row[finalMapping.equipID] || '').trim() : '';
      const categorie = finalMapping.categorie ? String(row[finalMapping.categorie] || '').trim() : '';
      const modele = finalMapping.modele ? String(row[finalMapping.modele] || '').trim() : '';
      const immatriculation = finalMapping.immatriculation ? String(row[finalMapping.immatriculation] || '').trim() : '';
      const uniteCompteur = finalMapping.uniteCompteur ? String(row[finalMapping.uniteCompteur] || '').trim() : '';
      const typeCarburant = finalMapping.typeCarburant ? String(row[finalMapping.typeCarburant] || '').trim() : '';
      
      const annee = finalMapping.annee ? parseInt32(row[finalMapping.annee]) : null;
      
      const statusRaw = finalMapping.statut ? String(row[finalMapping.statut] || '').toLowerCase() : 'actif';
      let statut = 'disponible';
      if (statusRaw.includes('hs') || statusRaw.includes('hors')) {
        statut = 'hors_service';
      } else if (statusRaw.includes('réparation') || statusRaw.includes('maintenance')) {
        statut = 'maintenance';
      } else if (statusRaw.includes('actif') || statusRaw.includes('active')) {
        statut = 'disponible';
      }
      
      const consoHeureLitres = finalMapping.consoHL ? parseNumber(row[finalMapping.consoHL]) : null;
      const conso100kmLitres = finalMapping.conso100kmL ? parseNumber(row[finalMapping.conso100kmL]) : null;
      const coutCarbHeureLei = finalMapping.coutCarbHLei ? parseNumber(row[finalMapping.coutCarbHLei]) : null;
      const coutCarb100kmLei = finalMapping.coutCarb100kmLei ? parseNumber(row[finalMapping.coutCarb100kmLei]) : null;
      
      const maintenanceCost = finalMapping.entretienAnnuelLei ? parseNumber(row[finalMapping.entretienAnnuelLei]) : null;
      const kmTravailAnnuel = finalMapping.kmTravailAnn ? parseInt32(row[finalMapping.kmTravailAnn]) : null;
      const heuresTravailAnnuel = finalMapping.heuresTravailAnn ? parseInt32(row[finalMapping.heuresTravailAnn]) : null;
      const entretien100kmLei = finalMapping.entretien100kmLei ? parseNumber(row[finalMapping.entretien100kmLei]) : null;
      const entretienHeureLei = finalMapping.entretienHLei ? parseNumber(row[finalMapping.entretienHLei]) : null;
      
      const valeurComptableLei = finalMapping.valeurComptableLei ? parseNumber(row[finalMapping.valeurComptableLei]) : null;
      const dureeVieAns = finalMapping.dureeVieAns ? parseInt32(row[finalMapping.dureeVieAns]) : null;
      const valeurResiduelleLei = finalMapping.valeurResiduelleLei ? parseNumber(row[finalMapping.valeurResiduelleLei]) : null;
      const baseAmortissableLei = finalMapping.baseAmortissableLei ? parseNumber(row[finalMapping.baseAmortissableLei]) : null;
      const tauxAmortAnnuel = finalMapping.tauxAmortAnn ? parseNumber(row[finalMapping.tauxAmortAnn]) : null;
      const amortTotalLei = finalMapping.amortTotalLei ? parseNumber(row[finalMapping.amortTotalLei]) : null;
      const amortHeureLei = finalMapping.amortHLei ? parseNumber(row[finalMapping.amortHLei]) : null;
      
      const coutUsage1hLei = finalMapping.coutUsage1hLei ? parseNumber(row[finalMapping.coutUsage1hLei]) : null;
      const coutUsage100kmLei = finalMapping.coutUsage100kmLei ? parseNumber(row[finalMapping.coutUsage100kmLei]) : null;
      const hourlyRate = finalMapping.tauxHoraireOperateurLei ? parseNumber(row[finalMapping.tauxHoraireOperateurLei]) : null;

      const nom = equipID || modele || `Équipement ${index + 1}`;

      const equipement: InsertEquipement = {
        nom,
        type: categorie || 'Autre',
        categorie: categorie || null,
        marque: null,
        modele: modele || null,
        numeroSerie: equipID || null,
        immatriculation: immatriculation || null,
        statut,
        localisation: null,
        dateAchat: null,
        coutJournalier: null,
        
        consommationGasoilHeure: consoHeureLitres,
        fuelConsumption: conso100kmLitres,
        salaireHoraireOperateur: hourlyRate,
        
        operatorId: null,
        operatorName: null,
        year: annee,
        fuelType: typeCarburant || null,
        gpsUnit: null,
        meterUnit: uniteCompteur || null,
        hourlyRate,
        maintenanceCost,
        
        consoHeureLitres,
        conso100kmLitres,
        coutCarbHeureLei,
        coutCarb100kmLei,
        prixCarburantLitre: null,
        
        kmTravailAnnuel,
        heuresTravailAnnuel,
        entretien100kmLei,
        entretienHeureLei,
        
        valeurComptableLei,
        dureeVieAns,
        valeurResiduelleLei,
        baseAmortissableLei,
        tauxAmortAnnuel,
        amortTotalLei,
        amortHeureLei,
        
        coutUsage1hLei,
        coutUsage100kmLei,
        
        tagsUsage: null,
      };

      return equipement;
    } catch (error) {
      console.error(`Erreur ligne ${index + 1}:`, error);
      throw new Error(`Erreur à la ligne ${index + 1}: ${error}`);
    }
  });

  return equipements.filter(eq => eq.nom && eq.nom.trim() !== '');
}
