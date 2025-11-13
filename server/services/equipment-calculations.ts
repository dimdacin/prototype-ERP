import type { Equipement } from '@shared/schema';

export interface CalculationInputs {
  consoHeureLitres?: string | null;
  conso100kmLitres?: string | null;
  prixCarburantLitre?: string | null;
  maintenanceCost?: string | null;
  kmTravailAnnuel?: number | null;
  heuresTravailAnnuel?: number | null;
  amortTotalLei?: string | null;
  hourlyRate?: string | null;
}

export interface CalculatedCosts {
  coutCarbHeureLei?: string | null;
  coutCarb100kmLei?: string | null;
  entretien100kmLei?: string | null;
  entretienHeureLei?: string | null;
  amortHeureLei?: string | null;
  amort100kmLei?: string | null;
  coutUsage1hLei?: string | null;
  coutUsage100kmLei?: string | null;
}

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? null : num;
}

function toString(value: number | null): string | null {
  return value !== null ? value.toFixed(2) : null;
}

export function calculateCoutCarbHeure(
  consoHeureLitres: string | number | null | undefined,
  prixCarburantLitre: string | number | null | undefined
): string | null {
  const conso = toNumber(consoHeureLitres);
  const prix = toNumber(prixCarburantLitre);
  
  if (conso === null || prix === null) return null;
  
  return toString(conso * prix);
}

export function calculateCoutCarb100km(
  conso100kmLitres: string | number | null | undefined,
  prixCarburantLitre: string | number | null | undefined
): string | null {
  const conso = toNumber(conso100kmLitres);
  const prix = toNumber(prixCarburantLitre);
  
  if (conso === null || prix === null) return null;
  
  return toString(conso * prix);
}

export function calculateEntretien100km(
  maintenanceCost: string | number | null | undefined,
  kmTravailAnnuel: number | null | undefined
): string | null {
  const maintenance = toNumber(maintenanceCost);
  const km = kmTravailAnnuel;
  
  if (maintenance === null || km === null || km === undefined || km === 0) return null;
  
  return toString((maintenance / km) * 100);
}

export function calculateEntretienHeure(
  maintenanceCost: string | number | null | undefined,
  heuresTravailAnnuel: number | null | undefined
): string | null {
  const maintenance = toNumber(maintenanceCost);
  const heures = heuresTravailAnnuel;
  
  if (maintenance === null || heures === null || heures === undefined || heures === 0) return null;
  
  return toString(maintenance / heures);
}

export function calculateAmortHeure(
  amortTotalLei: string | number | null | undefined,
  heuresTravailAnnuel: number | null | undefined
): string | null {
  const amort = toNumber(amortTotalLei);
  const heures = heuresTravailAnnuel;
  
  if (amort === null || heures === null || heures === undefined || heures === 0) return null;
  
  return toString(amort / heures);
}

export function calculateAmort100km(
  amortTotalLei: string | number | null | undefined,
  kmTravailAnnuel: number | null | undefined
): string | null {
  const amort = toNumber(amortTotalLei);
  const km = kmTravailAnnuel;
  
  if (amort === null || km === null || km === undefined || km === 0) return null;
  
  return toString((amort / km) * 100);
}

export function calculateCoutUsage1h(
  coutCarbHeureLei: string | number | null | undefined,
  entretienHeureLei: string | number | null | undefined,
  amortHeureLei: string | number | null | undefined,
  hourlyRate: string | number | null | undefined
): string | null {
  const carb = toNumber(coutCarbHeureLei) || 0;
  const entretien = toNumber(entretienHeureLei) || 0;
  const amort = toNumber(amortHeureLei) || 0;
  const operateur = toNumber(hourlyRate) || 0;
  
  const total = carb + entretien + amort + operateur;
  
  return total > 0 ? toString(total) : null;
}

export function calculateCoutUsage100km(
  coutCarb100kmLei: string | number | null | undefined,
  entretien100kmLei: string | number | null | undefined,
  amort100kmLei: string | number | null | undefined
): string | null {
  const carb = toNumber(coutCarb100kmLei) || 0;
  const entretien = toNumber(entretien100kmLei) || 0;
  const amort = toNumber(amort100kmLei) || 0;
  
  const total = carb + entretien + amort;
  
  return total > 0 ? toString(total) : null;
}

export function recalculateEquipmentCosts(inputs: CalculationInputs): CalculatedCosts {
  const coutCarbHeureLei = calculateCoutCarbHeure(inputs.consoHeureLitres, inputs.prixCarburantLitre);
  const coutCarb100kmLei = calculateCoutCarb100km(inputs.conso100kmLitres, inputs.prixCarburantLitre);
  
  const entretien100kmLei = calculateEntretien100km(inputs.maintenanceCost, inputs.kmTravailAnnuel);
  const entretienHeureLei = calculateEntretienHeure(inputs.maintenanceCost, inputs.heuresTravailAnnuel);
  
  const amortHeureLei = calculateAmortHeure(inputs.amortTotalLei, inputs.heuresTravailAnnuel);
  const amort100kmLei = calculateAmort100km(inputs.amortTotalLei, inputs.kmTravailAnnuel);
  
  const coutUsage1hLei = calculateCoutUsage1h(coutCarbHeureLei, entretienHeureLei, amortHeureLei, inputs.hourlyRate);
  const coutUsage100kmLei = calculateCoutUsage100km(coutCarb100kmLei, entretien100kmLei, amort100kmLei);
  
  return {
    coutCarbHeureLei,
    coutCarb100kmLei,
    entretien100kmLei,
    entretienHeureLei,
    amortHeureLei,
    amort100kmLei,
    coutUsage1hLei,
    coutUsage100kmLei,
  };
}
