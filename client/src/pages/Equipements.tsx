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
  
  const { data: allEquipements, isLoading } = useQuery<Equipement[]>({
    queryKey: ["/api/equipements"],
  });

  const equipements = useMemo(() => {
    if (!selectedFamily || !allEquipements) return allEquipements;
    
    const familyCategories = FAMILY_CATEGORIES[selectedFamily];
    return allEquipements.filter(eq => 
      familyCategories.some(cat => 
        cat.toLowerCase().trim() === (eq.categorie || '').toLowerCase().trim()
      )
    );
  }, [selectedFamily, allEquipements]);

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
        <CardHeader>
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
                  <th className="text-left p-3 font-medium">{t('equipements.id')}</th>
                  <th className="text-left p-3 font-medium">{t('equipements.model')}</th>
                  <th className="text-left p-3 font-medium">{t('equipements.year')}</th>
                  <th className="text-left p-3 font-medium">{t('equipements.plateNumber')}</th>
                  <th className="text-left p-3 font-medium">{t('equipements.fuelType')}</th>
                  <th className="text-left p-3 font-medium">{t('equipements.driver')}</th>
                  <th className="text-left p-3 font-medium">{t('equipements.gpsUnit')}/{t('equipements.meterUnit')}</th>
                  <th className="text-left p-3 font-medium">{t('equipements.hourlyRate')}</th>
                  <th className="text-left p-3 font-medium">{t('equipements.fuelConsumption')}</th>
                  <th className="text-left p-3 font-medium">{t('equipements.maintenanceCost')}</th>
                  <th className="text-left p-3 font-medium">{t('equipements.status')}</th>
                  <th className="text-left p-3 font-medium">{t('equipements.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {equipements?.map((equipement) => (
                  <tr key={equipement.id} className="border-b hover-elevate" data-testid={`equipement-row-${equipement.id}`}>
                    <td className="p-3">
                      <div className="font-medium font-mono">{equipement.numeroSerie || equipement.nom}</div>
                      <div className="text-sm text-muted-foreground">{equipement.type}</div>
                    </td>
                    <td className="p-3 text-sm">{equipement.modele || "-"}</td>
                    <td className="p-3 text-sm">{equipement.year || <span className="text-muted-foreground">-</span>}</td>
                    <td className="p-3 text-sm font-mono">{equipement.immatriculation || "-"}</td>
                    <td className="p-3 text-sm">{equipement.fuelType || <span className="text-muted-foreground">-</span>}</td>
                    <td className="p-3 text-sm">
                      {equipement.operatorName || <span className="text-muted-foreground">-</span>}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {equipement.gpsUnit && <div>GPS: {equipement.gpsUnit}</div>}
                      {equipement.meterUnit && <div>Cpt: {equipement.meterUnit}</div>}
                      {!equipement.gpsUnit && !equipement.meterUnit && "-"}
                    </td>
                    <td className="p-3 text-sm font-mono">
                      {formatCurrency(equipement.hourlyRate, { locale: i18n.language })}
                    </td>
                    <td className="p-3 text-sm">
                      {equipement.fuelConsumption !== undefined && equipement.fuelConsumption !== null ? `${equipement.fuelConsumption} L/100km` : <span className="text-muted-foreground">-</span>}
                    </td>
                    <td className="p-3 text-sm">
                      {formatCurrency(equipement.maintenanceCost, { locale: i18n.language })}
                    </td>
                    <td className="p-3">{getStatutBadge(equipement.statut)}</td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm" data-testid={`button-edit-${equipement.id}`}>
                        {t('common.edit')}
                      </Button>
                    </td>
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
