import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDrag } from 'react-dnd';
import { 
  Users, 
  Truck, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  MapPin,
  Clock,
  Award,
  Zap
} from 'lucide-react';

// Imports shadcn/ui
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Imports types et hooks
import { usePlanning } from '@/hooks/usePlanning';
import { PlanningResource, getResourceColor } from '@shared/planning-types';

// Interface pour les props du composant
interface ResourceSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onResourceDrag?: (resource: PlanningResource) => void;
}

// Interface pour l'item draggable
interface DragItem {
  type: string;
  resource: PlanningResource;
}

// Hook personnalisé pour le debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Composant ResourceCard avec drag & drop
const ResourceCard: React.FC<{
  resource: PlanningResource;
  utilization: number;
  onDragStart?: (resource: PlanningResource) => void;
}> = ({ resource, utilization, onDragStart }) => {
  const { t } = useTranslation();

  // Configuration du drag & drop
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'resource',
    item: { type: 'resource', resource } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
      if (onDragStart) {
        onDragStart(resource);
      }
    },
  }));

  const isOverloaded = utilization > 100;
  const statusColor = resource.disponible ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';
  const utilizationColor = isOverloaded ? 'text-red-600' : utilization > 80 ? 'text-orange-600' : 'text-green-600';
  const resourceColor = getResourceColor(resource.type);

  return (
    <Card 
      ref={drag}
      className={`cursor-move hover:shadow-lg transition-all duration-200 border-l-4 ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
      }`}
      style={{ 
        borderLeftColor: resourceColor,
        transform: isDragging ? 'rotate(2deg)' : 'none'
      }}
    >
      <CardContent className="p-3 space-y-2">
        {/* Header avec nom et statut */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            {resource.type === 'salarie' ? (
              <Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
            ) : (
              <Truck className="h-4 w-4 text-orange-600 flex-shrink-0" />
            )}
            <span className="font-medium text-sm truncate">{resource.nom}</span>
          </div>
          <Badge 
            className={`text-xs flex-shrink-0 ${statusColor}`}
            variant="outline"
          >
            {resource.disponible ? t('planning.available') : t('planning.unavailable')}
          </Badge>
        </div>

        {/* Utilisation du jour */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{t('planning.utilization')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-mono font-semibold ${utilizationColor}`}>
              {utilization.toFixed(0)}%
            </span>
            {isOverloaded && (
              <Zap className="h-3 w-3 text-red-500" />
            )}
          </div>
        </div>

        {/* Barre de progression */}
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              isOverloaded ? 'bg-red-500' : utilization > 80 ? 'bg-orange-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(utilization, 100)}%` }}
          />
        </div>

        {/* Compétences (pour salariés) */}
        {resource.type === 'salarie' && resource.competences && resource.competences.length > 0 && (
          <div className="flex items-center space-x-1">
            <Award className="h-3 w-3 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {resource.competences.slice(0, 2).map((comp, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5">
                  {comp}
                </Badge>
              ))}
              {resource.competences.length > 2 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  +{resource.competences.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Localisation */}
        {resource.localisation && (
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">
              {resource.localisation}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Composant principal ResourceSidebar
const ResourceSidebar: React.FC<ResourceSidebarProps> = ({
  isCollapsed,
  onToggle,
  onResourceDrag
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('salaries');

  // Debounce du terme de recherche
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Utilisation du hook planning
  const {
    resources,
    isLoading,
    error,
    utilities,
  } = usePlanning();

  // Calcul des utilisations avec date du jour
  const resourceUtilizations = useMemo(() => {
    const today = new Date();
    const utilizations: Record<string, number> = {};
    
    resources.forEach(resource => {
      utilizations[resource.id] = utilities.calculateResourceUtilization(resource.id, today);
    });
    
    return utilizations;
  }, [resources, utilities]);

  // Filtrage des ressources avec recherche
  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      // Filtre par terme de recherche
      const matchesSearch = !debouncedSearchTerm || 
        resource.nom.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        resource.localisation?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (resource.competences || []).some(comp => 
          comp.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );

      // Filtre par disponibilité (optionnel)
      const isAvailable = resource.disponible;

      return matchesSearch && isAvailable;
    });
  }, [resources, debouncedSearchTerm]);

  // Séparation par type
  const salaries = filteredResources.filter(r => r.type === 'salarie');
  const equipements = filteredResources.filter(r => r.type === 'equipement');

  // Gestionnaire de drag
  const handleResourceDrag = useCallback((resource: PlanningResource) => {
    if (onResourceDrag) {
      onResourceDrag(resource);
    }
  }, [onResourceDrag]);

  // Vue collapsed
  if (isCollapsed) {
    return (
      <div className="w-16 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-full p-2"
            title={t('planning.expandSidebar')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4 px-2">
          <div className="text-center">
            <Users className="h-6 w-6 mx-auto text-blue-500 mb-1" />
            <div className="text-xs font-medium">{salaries.length}</div>
          </div>
          <div className="text-center">
            <Truck className="h-6 w-6 mx-auto text-orange-500 mb-1" />
            <div className="text-xs font-medium">{equipements.length}</div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="w-80 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-32" />
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        
        <div className="p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-80 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('planning.resources')}</h2>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">{t('planning.errorLoadingResources')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            {t('planning.resources')}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            title={t('planning.collapseSidebar')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('planning.searchResourcesPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 h-10"
          />
        </div>
      </div>

      {/* Contenu avec onglets */}
      <ScrollArea className="h-[calc(100vh-160px)]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 py-2">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="salaries" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t('planning.employees')} ({salaries.length})
              </span>
              <span className="sm:hidden">
                {salaries.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="equipements" className="flex items-center space-x-2">
              <Truck className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t('planning.equipment')} ({equipements.length})
              </span>
              <span className="sm:hidden">
                {equipements.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Onglet Salariés */}
          <TabsContent value="salaries" className="space-y-3">
            {salaries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <h3 className="font-medium mb-1">
                  {debouncedSearchTerm 
                    ? t('planning.noEmployeesFound') 
                    : t('planning.noEmployeesAvailable')
                  }
                </h3>
                <p className="text-sm">
                  {debouncedSearchTerm
                    ? t('planning.tryDifferentSearch')
                    : t('planning.allEmployeesBusy')
                  }
                </p>
              </div>
            ) : (
              salaries.map(resource => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  utilization={resourceUtilizations[resource.id] || 0}
                  onDragStart={handleResourceDrag}
                />
              ))
            )}
          </TabsContent>

          {/* Onglet Équipements */}
          <TabsContent value="equipements" className="space-y-3">
            {equipements.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Truck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <h3 className="font-medium mb-1">
                  {debouncedSearchTerm 
                    ? t('planning.noEquipmentFound') 
                    : t('planning.noEquipmentAvailable')
                  }
                </h3>
                <p className="text-sm">
                  {debouncedSearchTerm
                    ? t('planning.tryDifferentSearch')
                    : t('planning.allEquipmentBusy')
                  }
                </p>
              </div>
            ) : (
              equipements.map(resource => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  utilization={resourceUtilizations[resource.id] || 0}
                  onDragStart={handleResourceDrag}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </ScrollArea>

      {/* Footer avec statistiques */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t('planning.totalResources')}: {filteredResources.length}</span>
          <span>
            {t('planning.averageUtilization')}: {
              filteredResources.length > 0 
                ? (Object.values(resourceUtilizations).reduce((a, b) => a + b, 0) / filteredResources.length).toFixed(0)
                : 0
            }%
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResourceSidebar;