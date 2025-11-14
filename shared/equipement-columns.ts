/**
 * Configuration des colonnes du module Équipements
 * Basé sur la structure du fichier Excel "Meca"
 * Source de vérité pour l'affichage et la gestion des colonnes
 */

export interface EquipementColumnDef {
  /** Identifiant unique de la colonne */
  id: string;
  /** Nom de la colonne dans le fichier Excel */
  excelHeader: string;
  /** Nom du champ dans la base de données (si mappé) */
  dbField?: keyof import('./schema').Equipement;
  /** Type de données */
  dataType: 'text' | 'number' | 'decimal' | 'date' | 'enum';
  /** Clé de traduction i18n */
  translationKey: string;
  /** Colonne obligatoire (toujours visible) */
  mandatory?: boolean;
  /** Format d'affichage pour les nombres */
  format?: 'currency' | 'percentage' | 'decimal' | 'integer';
  /** Nombre de décimales pour l'affichage */
  decimals?: number;
  /** Colonne calculée (non stockée en DB) */
  calculated?: boolean;
}

/**
 * Définition complète des colonnes basées sur le fichier Excel
 * Ordre respecté selon la structure Excel
 */
export const EQUIPEMENT_COLUMNS: EquipementColumnDef[] = [
  // Colonnes d'identification
  {
    id: 'id',
    excelHeader: 'id',
    dbField: 'numeroSerie',
    dataType: 'text',
    translationKey: 'equipements.columns.id',
    mandatory: true,
  },
  {
    id: 'category',
    excelHeader: 'category',
    dbField: 'categorie',
    dataType: 'text',
    translationKey: 'equipements.columns.category',
  },
  {
    id: 'model',
    excelHeader: 'model',
    dbField: 'modele',
    dataType: 'text',
    translationKey: 'equipements.columns.model',
  },
  {
    id: 'plate_number',
    excelHeader: 'plate_number',
    dbField: 'immatriculation',
    dataType: 'text',
    translationKey: 'equipements.columns.plateNumber',
  },
  {
    id: 'year',
    excelHeader: 'year',
    dbField: 'year',
    dataType: 'number',
    translationKey: 'equipements.columns.year',
    format: 'integer',
  },
  {
    id: 'status',
    excelHeader: 'status',
    dbField: 'statut',
    dataType: 'enum',
    translationKey: 'equipements.columns.status',
  },
  {
    id: 'operator_name',
    excelHeader: 'operator_name',
    dbField: 'operatorName',
    dataType: 'text',
    translationKey: 'equipements.columns.driver',
  },
  
  // Colonnes techniques
  {
    id: 'gps_unit',
    excelHeader: 'gps_unit',
    dbField: 'gpsUnit',
    dataType: 'text',
    translationKey: 'equipements.columns.gpsUnit',
  },
  {
    id: 'meter_unit',
    excelHeader: 'meter_unit',
    dbField: 'meterUnit',
    dataType: 'text',
    translationKey: 'equipements.columns.meterUnit',
  },
  {
    id: 'fuel_type',
    excelHeader: 'fuel_type',
    dbField: 'fuelType',
    dataType: 'text',
    translationKey: 'equipements.columns.fuelType',
  },
  
  // Colonnes financières - Taux horaires
  {
    id: 'hourly_sal_rate_lei',
    excelHeader: 'hourly_sal_rate_lei',
    dbField: 'hourlyRate',
    dataType: 'decimal',
    translationKey: 'equipements.columns.hourlySalRateLei',
    format: 'currency',
    decimals: 2,
  },
  {
    id: 'hourly_sal_allin_lei',
    excelHeader: 'hourly_sal_allin_lei',
    dataType: 'decimal',
    translationKey: 'equipements.columns.hourlySalAllinLei',
    format: 'currency',
    decimals: 2,
    calculated: true,
  },
  {
    id: 'total_salary_lei_hut',
    excelHeader: 'total_salary_lei_hut',
    dataType: 'decimal',
    translationKey: 'equipements.columns.totalSalaryLeiHut',
    format: 'currency',
    decimals: 2,
    calculated: true,
  },
  
  // Colonnes de consommation et maintenance
  {
    id: 'fuel_consumption_100km',
    excelHeader: 'fuel_consumption_100km',
    dbField: 'fuelConsumption',
    dataType: 'decimal',
    translationKey: 'equipements.columns.fuelConsumption',
    format: 'decimal',
    decimals: 2,
  },
  {
    id: 'annual_maintenance_cost_lei',
    excelHeader: 'annual_maintenance_cost_lei',
    dbField: 'maintenanceCost',
    dataType: 'decimal',
    translationKey: 'equipements.columns.maintenanceCost',
    format: 'currency',
    decimals: 2,
  },
  
  // Colonnes de coûts d'utilisation
  {
    id: 'usage_workcost_lei_h',
    excelHeader: 'usage_workcost_lei_h',
    dataType: 'decimal',
    translationKey: 'equipements.columns.usageWorkcostLeiH',
    format: 'currency',
    decimals: 2,
    calculated: true,
  },
  {
    id: 'usage_cost_allin_h',
    excelHeader: 'usage_cost_allin_h',
    dataType: 'decimal',
    translationKey: 'equipements.columns.usageCostAllinH',
    format: 'currency',
    decimals: 2,
    calculated: true,
  },
  {
    id: 'usage_cost_allin_100km',
    excelHeader: 'usage_cost_allin_100km',
    dataType: 'decimal',
    translationKey: 'equipements.columns.usageCostAllin100km',
    format: 'currency',
    decimals: 2,
    calculated: true,
  },
  {
    id: 'fuel_price_lei_l',
    excelHeader: 'fuel_price_lei_l',
    dataType: 'decimal',
    translationKey: 'equipements.columns.fuelPriceLeiL',
    format: 'currency',
    decimals: 2,
    calculated: true,
  },
  
  // Colonnes de dépréciation
  {
    id: 'balance_value_lei',
    excelHeader: 'balance_value_lei',
    dataType: 'decimal',
    translationKey: 'equipements.columns.balanceValueLei',
    format: 'currency',
    decimals: 2,
    calculated: true,
  },
  {
    id: 'useful_life_years',
    excelHeader: 'useful_life_years',
    dataType: 'number',
    translationKey: 'equipements.columns.usefulLifeYears',
    format: 'integer',
    calculated: true,
  },
  {
    id: 'residual_value_lei',
    excelHeader: 'residual_value_lei',
    dataType: 'decimal',
    translationKey: 'equipements.columns.residualValueLei',
    format: 'currency',
    decimals: 2,
    calculated: true,
  },
  {
    id: 'depreciable_value_lei',
    excelHeader: 'depreciable_value_lei',
    dataType: 'decimal',
    translationKey: 'equipements.columns.depreciableValueLei',
    format: 'currency',
    decimals: 2,
    calculated: true,
  },
  {
    id: 'annual_depreciation_rate',
    excelHeader: 'annual_depreciation_rate',
    dataType: 'decimal',
    translationKey: 'equipements.columns.annualDepreciationRate',
    format: 'percentage',
    decimals: 2,
    calculated: true,
  },
  {
    id: 'total_depreciation_lei',
    excelHeader: 'total_depreciation_lei',
    dataType: 'decimal',
    translationKey: 'equipements.columns.totalDepreciationLei',
    format: 'currency',
    decimals: 2,
    calculated: true,
  },
  
  // Colonne notes
  {
    id: 'notes',
    excelHeader: 'notes',
    dataType: 'text',
    translationKey: 'equipements.columns.notes',
    calculated: true,
  },
];

/**
 * Colonnes visibles par défaut au chargement initial
 */
export const DEFAULT_VISIBLE_COLUMNS = [
  'id',
  'category',
  'model',
  'plate_number',
  'year',
  'operator_name',
  'hourly_sal_rate_lei',
  'fuel_consumption_100km',
  'annual_maintenance_cost_lei',
  'status',
];
