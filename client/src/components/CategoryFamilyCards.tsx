import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Construction, Truck, Bus, Wrench, Cog } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CategoryStats {
  count: number;
  available: number;
  maintenance: number;
  outOfService: number;
  avgCostPerHour: number | null;
  avgCostPer100km: number | null;
}

interface CategoryFamilyCardsProps {
  onFamilyClick?: (familyId: string) => void;
  selectedFamily?: string | null;
}

const FAMILY_DEFINITIONS = {
  engins_chantier: {
    icon: Construction,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    categories: ["Compactoare", "Incarcatoare frontale", "Finisoare", "Excavatoare", "Autogredere", "Tractoare", "Freze"]
  },
  transport_lourd: {
    icon: Truck,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    categories: ["S/REMOCI", "Parcul auto", "S/REMOCI Trall"]
  },
  transport_leger: {
    icon: Bus,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950",
    categories: ["Autoparc intern", "Autoturizme", "Microbuse", "Personnel"]
  },
  specialises: {
    icon: Wrench,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    categories: ["Tehnica specializata", "Automacarale", "Reciclator"]
  },
  petite_mecanisation: {
    icon: Cog,
    color: "text-gray-600",
    bgColor: "bg-gray-50 dark:bg-gray-950",
    categories: ["м. механизация"]
  }
};

export default function CategoryFamilyCards({ onFamilyClick, selectedFamily }: CategoryFamilyCardsProps) {
  const { t } = useTranslation();
  
  const { data: statsByCategory, isLoading } = useQuery<Record<string, CategoryStats>>({
    queryKey: ["/api/equipements/stats-by-category"],
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-8 w-8 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-12 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const aggregateFamily = (familyId: string) => {
    const family = FAMILY_DEFINITIONS[familyId as keyof typeof FAMILY_DEFINITIONS];
    let totalCount = 0;
    let totalAvailable = 0;
    let totalMaintenance = 0;
    let totalOutOfService = 0;
    let sumCostPerHour = 0;
    let sumCostPer100km = 0;
    let countCostPerHour = 0;
    let countCostPer100km = 0;

    if (!statsByCategory) {
      return { count: 0, available: 0, maintenance: 0, outOfService: 0, avgCostPerHour: null, avgCostPer100km: null };
    }

    Object.keys(statsByCategory).forEach(category => {
      const normalizedCategory = category.toLowerCase().trim();
      const matchesFamily = family.categories.some(cat => 
        cat.toLowerCase().trim() === normalizedCategory
      );
      
      if (matchesFamily) {
        const stats = statsByCategory[category];
        totalCount += stats.count;
        totalAvailable += stats.available;
        totalMaintenance += stats.maintenance;
        totalOutOfService += stats.outOfService;
        
        if (stats.avgCostPerHour !== null) {
          sumCostPerHour += stats.avgCostPerHour;
          countCostPerHour++;
        }
        
        if (stats.avgCostPer100km !== null) {
          sumCostPer100km += stats.avgCostPer100km;
          countCostPer100km++;
        }
      }
    });

    return {
      count: totalCount,
      available: totalAvailable,
      maintenance: totalMaintenance,
      outOfService: totalOutOfService,
      avgCostPerHour: countCostPerHour > 0 ? sumCostPerHour / countCostPerHour : null,
      avgCostPer100km: countCostPer100km > 0 ? sumCostPer100km / countCostPer100km : null,
    };
  };

  return (
    <div className="grid gap-4 md:grid-cols-5">
      {Object.entries(FAMILY_DEFINITIONS).map(([familyId, familyDef]) => {
        const Icon = familyDef.icon;
        const stats = aggregateFamily(familyId);
        
        const isSelected = selectedFamily === familyId;
        
        return (
          <Card 
            key={familyId}
            className={`hover-elevate cursor-pointer ${familyDef.bgColor} ${isSelected ? 'ring-2 ring-primary' : ''}`}
            onClick={() => onFamilyClick?.(familyId)}
            data-testid={`family-card-${familyId}`}
          >
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t(`equipements.families.${familyId}`)}
              </CardTitle>
              <Icon className={`h-5 w-5 ${familyDef.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{stats.count}</div>
              <div className="text-xs space-y-0.5">
                {stats.avgCostPerHour !== null && (
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Coût/h:</span>
                    <span className="font-semibold">{stats.avgCostPerHour.toFixed(0)} lei</span>
                  </div>
                )}
                {stats.avgCostPer100km !== null && (
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Coût/100km:</span>
                    <span className="font-semibold">{stats.avgCostPer100km.toFixed(0)} lei</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('equipements.available')}</span>
                  <span className="font-medium text-green-600">{stats.available}</span>
                </div>
                {stats.maintenance > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('equipements.maintenance')}</span>
                    <span className="font-medium text-orange-600">{stats.maintenance}</span>
                  </div>
                )}
                {stats.outOfService > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('equipements.outOfService')}</span>
                    <span className="font-medium text-red-600">{stats.outOfService}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
