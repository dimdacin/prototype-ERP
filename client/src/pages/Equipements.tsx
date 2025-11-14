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
import CategoryFamilyCards from "@/components/CategoryFamilyCards";
import { formatCurrency } from "@/lib/utils";
import ColumnSelector from "@/components/ColumnSelector";
import CategoryFilter from "@/components/CategoryFilter";
import { useColumnVisibility, type ColumnDef } from "@/hooks/useColumnVisibility";

const FAMILY_CATEGORIES: Record<string, string[]> = {
  engins_chantier: ["Compactoare", "Incarcatoare frontale", "Finisoare", "Excavatoare", "Autogredere", "Tractoare", "Freze"],
  transport_lourd: ["S/REMOCI", "Parcul auto", "S/REMOCI Trall"],
  transport_leger: ["Autoparc intern", "Autoturizme", "Microbuse", "Personnel"],
  specialises: ["Tehnica specializata", "Automacarale", "Reciclator"],
  petite_mecanisation: ["м. механизация"]
};

const COLUMN_DEFINITIONS: ColumnDef[] = [
  { id: 'id', labelKey: 'equipements.id', mandatory: true, defaultVisible: true },
  { id: 'category', labelKey: 'equipements.category', defaultVisible: true },
  { id: 'model', labelKey: 'equipements.model', defaultVisible: true },
  { id: 'year', labelKey: 'equipements.year', defaultVisible: true },
  { id: 'plateNumber', labelKey: 'equipements.plateNumber', defaultVisible: true },
  { id: 'fuelType', labelKey: 'equipements.fuelType', defaultVisible: false },
  { id: 'driver', labelKey: 'equipements.driver', defaultVisible: true },
  { id: 'gpsUnit', labelKey: 'equipements.gpsUnit', defaultVisible: false },
  { id: 'hourlyRate', labelKey: 'equipements.hourlyRate', defaultVisible: true },
  { id: 'fuelConsumption', labelKey: 'equipements.fuelConsumption', defaultVisible: false },
  { id: 'maintenanceCost', labelKey: 'equipements.maintenanceCost', defaultVisible: false },
  { id: 'status', labelKey: 'equipements.status', defaultVisible: true },
  { id: 'actions', labelKey: 'equipements.actions', mandatory: true, defaultVisible: true },
];

export default function Equipements() {
  const { t, i18n } = useTranslation();
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { columnVisibility, setColumnVisibility, resetToDefaults } = useColumnVisibility(
    COLUMN_DEFINITIONS, 
    'equipements-column-visibility'
  );
  
  const { data: allEquipements, isLoading } = useQuery<Equipement[]>({
    queryKey: ["/api/equipements"],
  });

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

  const renderCell = (columnId: string, equipement: Equipement) => {
    switch (columnId) {
      case 'id':
        return (
          <td className="p-3" key="id">
            <div className="font-medium font-mono">{equipement.numeroSerie || equipement.nom}</div>
          </td>
        );
      case 'category':
        return (
          <td className="p-3 text-sm" key="category">
            {equipement.categorie || <span className="text-muted-foreground">-</span>}
          </td>
        );
      case 'model':
        return <td className="p-3 text-sm" key="model">{equipement.modele || "-"}</td>;
      case 'year':
        return (
          <td className="p-3 text-sm" key="year">
            {equipement.year || <span className="text-muted-foreground">-</span>}
          </td>
        );
      case 'plateNumber':
        return <td className="p-3 text-sm font-mono" key="plateNumber">{equipement.immatriculation || "-"}</td>;
      case 'fuelType':
        return (
          <td className="p-3 text-sm" key="fuelType">
            {equipement.fuelType || <span className="text-muted-foreground">-</span>}
          </td>
        );
      case 'driver':
        return (
          <td className="p-3 text-sm" key="driver">
            {equipement.operatorName || <span className="text-muted-foreground">-</span>}
          </td>
        );
      case 'gpsUnit':
        return (
          <td className="p-3 text-xs text-muted-foreground" key="gpsUnit">
            {equipement.gpsUnit && <div>GPS: {equipement.gpsUnit}</div>}
            {equipement.meterUnit && <div>Cpt: {equipement.meterUnit}</div>}
            {!equipement.gpsUnit && !equipement.meterUnit && "-"}
          </td>
        );
      case 'hourlyRate':
        return (
          <td className="p-3 text-sm font-mono" key="hourlyRate">
            {formatCurrency(equipement.hourlyRate, { locale: i18n.language })}
          </td>
        );
      case 'fuelConsumption':
        return (
          <td className="p-3 text-sm" key="fuelConsumption">
            {equipement.fuelConsumption !== undefined && equipement.fuelConsumption !== null 
              ? `${equipement.fuelConsumption} L/100km` 
              : <span className="text-muted-foreground">-</span>}
          </td>
        );
      case 'maintenanceCost':
        return (
          <td className="p-3 text-sm" key="maintenanceCost">
            {formatCurrency(equipement.maintenanceCost, { locale: i18n.language })}
          </td>
        );
      case 'status':
        return <td className="p-3" key="status">{getStatutBadge(equipement.statut)}</td>;
      case 'actions':
        return (
          <td className="p-3" key="actions">
            <Button variant="ghost" size="sm" data-testid={`button-edit-${equipement.id}`}>
              {t('common.edit')}
            </Button>
          </td>
        );
      default:
        return null;
    }
  };

  const visibleColumns = COLUMN_DEFINITIONS.filter(col => columnVisibility[col.id] !== false);

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
                columns={COLUMN_DEFINITIONS}
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
                      {col.id === 'gpsUnit' ? (
                        `${t('equipements.gpsUnit')}/${t('equipements.meterUnit')}`
                      ) : (
                        t(col.labelKey)
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {equipements?.map((equipement) => (
                  <tr key={equipement.id} className="border-b hover-elevate" data-testid={`equipement-row-${equipement.id}`}>
                    {visibleColumns.map(col => renderCell(col.id, equipement))}
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
