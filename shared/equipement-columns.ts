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
  /** Colonne calculée (non stockée en DB) avec raison */
  calculatedReason?: 'pending_calculation' | 'formula_based' | 'external_data';
  /** Colonne UI uniquement (pas de données métier) */
  uiOnly?: boolean;
  /** Visible par défaut */
  defaultVisible?: boolean;
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
    translationKey: 'equipements.id',
    mandatory: true,
    defaultVisible: true,
  },
  {
    id: 'category',
    excelHeader: 'category',
    dbField: 'categorie',
    dataType: 'text',
    translationKey: 'equipements.category',
    defaultVisible: true,
  },
  {
    id: 'model',
    excelHeader: 'model',
    dbField: 'modele',
    dataType: 'text',
    translationKey: 'equipements.model',
    defaultVisible: true,
  },
  {
    id: 'plate_number',
    excelHeader: 'plate_number',
    dbField: 'immatriculation',
    dataType: 'text',
    translationKey: 'equipements.plateNumber',
    defaultVisible: true,
  },
  {
    id: 'year',
    excelHeader: 'year',
    dbField: 'year',
    dataType: 'number',
    translationKey: 'equipements.year',
    format: 'integer',
    defaultVisible: true,
  },
  {
    id: 'status',
    excelHeader: 'status',
    dbField: 'statut',
    dataType: 'enum',
    translationKey: 'equipements.status',
    defaultVisible: true,
  },
  {
    id: 'operator_name',
    excelHeader: 'operator_name',
    dbField: 'operatorName',
    dataType: 'text',
    translationKey: 'equipements.driver',
    defaultVisible: true,
  },
  
  // Colonnes techniques
  {
    id: 'gps_unit',
    excelHeader: 'gps_unit',
    dbField: 'gpsUnit',
    dataType: 'text',
    translationKey: 'equipements.gpsUnit',
    defaultVisible: false,
  },
  {
    id: 'meter_unit',
    excelHeader: 'meter_unit',
    dbField: 'meterUnit',
    dataType: 'text',
    translationKey: 'equipements.meterUnit',
    defaultVisible: false,
  },
  {
    id: 'fuel_type',
    excelHeader: 'fuel_type',
    dbField: 'fuelType',
    dataType: 'text',
    translationKey: 'equipements.fuelType',
    defaultVisible: false,
  },
  
  // Colonnes financières - Taux horaires
  {
    id: 'hourly_sal_rate_lei',
    excelHeader: 'hourly_sal_rate_lei',
    dbField: 'hourlyRate',
    dataType: 'decimal',
    translationKey: 'equipements.hourlySalRateLei',
    format: 'currency',
    decimals: 2,
    defaultVisible: true,
  },
  {
    id: 'hourly_sal_allin_lei',
    excelHeader: 'hourly_sal_allin_lei',
    dataType: 'decimal',
    translationKey: 'equipements.hourlySalAllinLei',
    format: 'currency',
    decimals: 2,
    calculatedReason: 'formula_based',
    defaultVisible: false,
  },
  {
    id: 'total_salary_lei_hut',
    excelHeader: 'total_salary_lei_hut',
    dataType: 'decimal',
    translationKey: 'equipements.totalSalaryLeiHut',
    format: 'currency',
    decimals: 2,
    calculatedReason: 'formula_based',
    defaultVisible: false,
  },
  
  // Colonnes de consommation et maintenance
  {
    id: 'fuel_consumption_100km',
    excelHeader: 'fuel_consumption_100km',
    dbField: 'fuelConsumption',
    dataType: 'decimal',
    translationKey: 'equipements.fuelConsumption',
    format: 'decimal',
    decimals: 2,
    defaultVisible: true,
  },
  {
    id: 'annual_maintenance_cost_lei',
    excelHeader: 'annual_maintenance_cost_lei',
    dbField: 'maintenanceCost',
    dataType: 'decimal',
    translationKey: 'equipements.maintenanceCost',
    format: 'currency',
    decimals: 2,
    defaultVisible: true,
  },
  
  // Colonnes de coûts d'utilisation
  {
    id: 'usage_workcost_lei_h',
    excelHeader: 'usage_workcost_lei_h',
    dataType: 'decimal',
    translationKey: 'equipements.usageWorkcostLeiH',
    format: 'currency',
    decimals: 2,
    calculatedReason: 'formula_based',
    defaultVisible: false,
  },
  {
    id: 'usage_cost_allin_h',
    excelHeader: 'usage_cost_allin_h',
    dataType: 'decimal',
    translationKey: 'equipements.usageCostAllinH',
    format: 'currency',
    decimals: 2,
    calculatedReason: 'formula_based',
    defaultVisible: false,
  },
  {
    id: 'usage_cost_allin_100km',
    excelHeader: 'usage_cost_allin_100km',
    dataType: 'decimal',
    translationKey: 'equipements.usageCostAllin100km',
    format: 'currency',
    decimals: 2,
    calculatedReason: 'formula_based',
    defaultVisible: false,
  },
  {
    id: 'fuel_price_lei_l',
    excelHeader: 'fuel_price_lei_l',
    dataType: 'decimal',
    translationKey: 'equipements.fuelPriceLeiL',
    format: 'currency',
    decimals: 2,
    calculatedReason: 'external_data',
    defaultVisible: false,
  },
  
  // Colonnes de dépréciation
  {
    id: 'balance_value_lei',
    excelHeader: 'balance_value_lei',
    dataType: 'decimal',
    translationKey: 'equipements.balanceValueLei',
    format: 'currency',
    decimals: 2,
    calculatedReason: 'formula_based',
    defaultVisible: false,
  },
  {
    id: 'useful_life_years',
    excelHeader: 'useful_life_years',
    dataType: 'number',
    translationKey: 'equipements.usefulLifeYears',
    format: 'integer',
    calculatedReason: 'pending_calculation',
    defaultVisible: false,
  },
  {
    id: 'residual_value_lei',
    excelHeader: 'residual_value_lei',
    dataType: 'decimal',
    translationKey: 'equipements.residualValueLei',
    format: 'currency',
    decimals: 2,
    calculatedReason: 'formula_based',
    defaultVisible: false,
  },
  {
    id: 'depreciable_value_lei',
    excelHeader: 'depreciable_value_lei',
    dataType: 'decimal',
    translationKey: 'equipements.depreciableValueLei',
    format: 'currency',
    decimals: 2,
    calculatedReason: 'formula_based',
    defaultVisible: false,
  },
  {
    id: 'annual_depreciation_rate',
    excelHeader: 'annual_depreciation_rate',
    dataType: 'decimal',
    translationKey: 'equipements.annualDepreciationRate',
    format: 'percentage',
    decimals: 2,
    calculatedReason: 'formula_based',
    defaultVisible: false,
  },
  {
    id: 'total_depreciation_lei',
    excelHeader: 'total_depreciation_lei',
    dataType: 'decimal',
    translationKey: 'equipements.totalDepreciationLei',
    format: 'currency',
    decimals: 2,
    calculatedReason: 'formula_based',
    defaultVisible: false,
  },
  
  // Colonne notes
  {
    id: 'notes',
    excelHeader: 'notes',
    dataType: 'text',
    translationKey: 'equipements.notes',
    calculatedReason: 'pending_calculation',
    defaultVisible: false,
  },
  
  // Colonne UI uniquement (actions)
  {
    id: 'actions',
    excelHeader: '',
    dataType: 'text',
    translationKey: 'equipements.actions',
    uiOnly: true,
    mandatory: true,
    defaultVisible: true,
  },
];

/**
 * Colonnes visibles par défaut au chargement initial
 * (dérivé automatiquement des colonnes avec defaultVisible: true)
 */
export const DEFAULT_VISIBLE_COLUMNS = EQUIPEMENT_COLUMNS
  .filter(col => col.defaultVisible)
  .map(col => col.id);
