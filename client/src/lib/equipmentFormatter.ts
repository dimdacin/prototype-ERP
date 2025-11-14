import type { EquipementColumnDef } from '@shared/equipement-columns';
import type { Equipement } from '@shared/schema';

/**
 * Formate une valeur selon le type de colonne et le format spécifié
 */
export function formatColumnValue(
  value: any,
  column: EquipementColumnDef,
  locale: string = 'fr-FR'
): string {
  // Gérer les colonnes calculées qui n'ont pas encore de valeur EN PREMIER
  // AVANT le guard général pour les valeurs vides
  if (column.calculatedReason && (value === null || value === undefined || value === '')) {
    switch (column.calculatedReason) {
      case 'pending_calculation':
        return 'N/A';
      case 'formula_based':
        return 'À calculer';
      case 'external_data':
        return 'Non disponible';
      default:
        return '-';
    }
  }

  // Si la valeur est null, undefined ou vide (pour colonnes non calculées)
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  // Formater selon le dataType et format
  switch (column.dataType) {
    case 'decimal':
    case 'number':
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return '-';

      switch (column.format) {
        case 'currency':
          // Format lei (MDL)
          return new Intl.NumberFormat(locale, {
            minimumFractionDigits: column.decimals ?? 2,
            maximumFractionDigits: column.decimals ?? 2,
          }).format(numValue) + ' lei';

        case 'percentage':
          return new Intl.NumberFormat(locale, {
            minimumFractionDigits: column.decimals ?? 2,
            maximumFractionDigits: column.decimals ?? 2,
          }).format(numValue) + ' %';

        case 'decimal':
          return new Intl.NumberFormat(locale, {
            minimumFractionDigits: column.decimals ?? 2,
            maximumFractionDigits: column.decimals ?? 2,
          }).format(numValue);

        case 'integer':
          return Math.round(numValue).toString();

        default:
          return numValue.toString();
      }

    case 'text':
    case 'enum':
    case 'date':
    default:
      return String(value);
  }
}

/**
 * Récupère la valeur d'une colonne depuis un équipement
 * Gère le mapping entre dbField et l'objet Equipement
 */
export function getColumnValue(
  equipement: Equipement,
  column: EquipementColumnDef
): any {
  // Si c'est une colonne UI uniquement, retourner null
  if (column.uiOnly) {
    return null;
  }

  // Si le champ DB est spécifié, l'utiliser
  if (column.dbField) {
    return equipement[column.dbField];
  }

  // Pour les colonnes calculées sans dbField, retourner undefined
  // (undefined permettra à formatColumnValue de détecter calculatedReason)
  return undefined;
}
