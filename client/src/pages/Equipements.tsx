import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download, Wrench, Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Equipement } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { useState, useMemo } from "react";
import ImportEquipmentDialog from "@/components/ImportEquipmentDialog";
import EditEquipmentDialog from "@/components/EditEquipmentDialog";
import CategoryFamilyCards from "@/components/CategoryFamilyCards";
import { formatCurrency } from "@/lib/utils";
import ColumnSelector from "@/components/ColumnSelector";
import CategoryFilter from "@/components/CategoryFilter";
import { useColumnVisibility, type ColumnDef } from "@/hooks/useColumnVisibility";
import type { EquipementColumnDef } from "@shared/equipement-columns";
import { formatColumnValue, getColumnValue } from "@/lib/equipmentFormatter";

const FAMILY_CATEGORIES: Record<string, string[]> = {
  engins_chantier: ["Compactoare", "Incarcatoare frontale", "Finisoare", "Excavatoare", "Autogredere", "Tractoare", "Freze"],
  transport_lourd: ["S/REMOCI", "Parcul auto", "S/REMOCI Trall"],
  transport_leger: ["Autoparc intern", "Autoturizme", "Microbuse", "Personnel"],
  specialises: ["Tehnica specializata", "Automacarale", "Reciclator"],
  petite_mecanisation: ["м. механизация"]
};

export default function Equipements() {
  const { t, i18n } = useTranslation();
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Charger les métadonnées des colonnes Excel
  const { data: columnMetadata, isLoading: isLoadingColumns } = useQuery<{
    columns: EquipementColumnDef[];
    defaultVisible: string[];
  }>({
    queryKey: ["/api/equipements/excel-columns"],
  });

  // Convertir les colonnes Excel en ColumnDef pour useColumnVisibility
  const columnDefinitions: ColumnDef[] = useMemo(() => {
    if (!columnMetadata) return [];
    return columnMetadata.columns.map(col => ({
      id: col.id,
      labelKey: col.translationKey,
      mandatory: col.mandatory,
      defaultVisible: col.defaultVisible,
    }));
  }, [columnMetadata]);

  const { columnVisibility, setColumnVisibility, resetToDefaults } = useColumnVisibility(
    columnDefinitions, 
    'equipements-column-visibility'
  );
  
  const { data: allEquipements, isLoading: isLoadingEquipements } = useQuery<Equipement[]>({
    queryKey: ["/api/equipements"],
  });

  const isLoading = isLoadingColumns || isLoadingEquipements;

  const availableCategories = useMemo(() => {
    if (!allEquipements) return [];
    const categories = new Set<string>();
    allEquipements.forEach(eq => {
      if (eq.categorie) categories.add(eq.categorie);
    });
    return Array.from(categories).sort();
  }, [allEquipements]);

  const equipements = useMemo(() => {
    if (!allEquipements) return allEquipements;
    
    let filtered = allEquipements;
    
    if (selectedFamily) {
      const familyCategories = FAMILY_CATEGORIES[selectedFamily];
      filtered = filtered.filter(eq => 
        familyCategories.some(cat => 
          cat.toLowerCase().trim() === (eq.categorie || '').toLowerCase().trim()
        )
      );
    }
    
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(eq => 
        selectedCategories.includes(eq.categorie || '')
      );
    }
    
    return filtered;
  }, [selectedFamily, selectedCategories, allEquipements]);

  const handleFamilyClick = (familyId: string) => {
    setSelectedFamily(prev => prev === familyId ? null : familyId);
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "disponible":
        return <Badge variant="default" className="bg-green-600">{t('equipements.available')}</Badge>;
      case "en_service":
        return <Badge variant="secondary">{t('equipements.inService')}</Badge>;
      case "maintenance":
        return <Badge variant="outline" className="border-orange-600 text-orange-600">{t('equipements.maintenance')}</Badge>;
      case "hors_service":
        return <Badge variant="destructive">{t('equipements.outOfService')}</Badge>;
      default:
        return <Badge>{statut}</Badge>;
    }
  };

  const renderCell = (column: EquipementColumnDef, equipement: Equipement) => {
    // Traitement spécial pour les colonnes UI ou avec rendu personnalisé
    if (column.id === 'status') {
      return <td className="p-3" key="status">{getStatutBadge(equipement.statut)}</td>;
    }
    
    if (column.id === 'actions') {
      return (
        <td className="p-3" key="actions">
          <EditEquipmentDialog equipment={equipement} />
        </td>
      );
    }

    // Rendu générique pour toutes les autres colonnes
    const value = getColumnValue(equipement, column);
    const formattedValue = formatColumnValue(value, column, i18n.language);
    
    // Styling selon le type de colonne
    const cellClass = column.format === 'currency' || column.format === 'decimal' 
      ? "p-3 text-sm font-mono" 
      : "p-3 text-sm";
    
    // Afficher les colonnes calculées avec un style spécial
    const isCalculated = !!column.calculatedReason;
    const displayValue = isCalculated && (value === null || value === undefined || value === '') 
      ? <span className="text-muted-foreground italic">{formattedValue}</span>
      : formattedValue;

    return (
      <td className={cellClass} key={column.id}>
        {displayValue}
      </td>
    );
  };

  const visibleColumns = useMemo(() => {
    if (!columnMetadata) return [];
    return columnMetadata.columns.filter(col => columnVisibility[col.id] !== false);
  }, [columnMetadata, columnVisibility]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  // Ne pas rendre si les colonnes ne sont pas chargées
  if (!columnMetadata) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-muted-foreground">
          <p>Erreur de chargement des colonnes</p>
        </div>
      </div>
    );
  }

  const equipementsDisponibles = equipements?.filter(e => e.statut === "disponible").length || 0;
  const equipementsEnService = equipements?.filter(e => e.statut === "en_service").length || 0;
  const equipementsMaintenance = equipements?.filter(e => e.statut === "maintenance").length || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t('equipements.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('equipements.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <ImportEquipmentDialog>
            <Button variant="outline" data-testid="button-import-excel">
              <Upload className="h-4 w-4 mr-2" />
              {t('equipements.importExcel')}
            </Button>
          </ImportEquipmentDialog>
          <Button data-testid="button-nouvel-equipement">
            <Plus className="h-4 w-4 mr-2" />
            {t('equipements.newEquipment')}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <CategoryFamilyCards onFamilyClick={handleFamilyClick} selectedFamily={selectedFamily} />
        {selectedFamily && (
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md">
            <span className="text-sm text-muted-foreground">
              Filtré par: <span className="font-medium">{t(`equipements.families.${selectedFamily}`)}</span>
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedFamily(null)}
              data-testid="button-clear-filter"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle>{t('equipements.equipmentList')}</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder={t('equipements.search')}
                  className="pl-10 w-[300px]"
                  data-testid="input-recherche-equipement"
                />
              </div>
              <CategoryFilter
                availableCategories={availableCategories}
                selectedCategories={selectedCategories}
                onCategoriesChange={setSelectedCategories}
              />
              <ColumnSelector
                columns={columnDefinitions}
                columnVisibility={columnVisibility}
                onColumnToggle={setColumnVisibility}
                onReset={resetToDefaults}
              />
              <Button variant="outline" size="sm" data-testid="button-exporter">
                <Download className="h-4 w-4 mr-2" />
                {t('equipements.export')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {visibleColumns.map(col => (
                    <th key={col.id} className="text-left p-3 font-medium">
                      {t(col.translationKey)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {equipements?.map((equipement) => (
                  <tr key={equipement.id} className="border-b hover-elevate" data-testid={`equipement-row-${equipement.id}`}>
                    {visibleColumns.map(col => renderCell(col, equipement))}
                  </tr>
                ))}
              </tbody>
            </table>
            {(!equipements || equipements.length === 0) && (
              <div className="text-center py-12 text-muted-foreground">
                <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('equipements.noEquipment')}</p>
                <p className="text-sm mt-1">{t('equipements.addFirstEquipment')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
