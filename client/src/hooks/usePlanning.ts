import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import {
  PlanningEvent,
  PlanningResource,
  CreatePlanningEventData,
  UpdatePlanningEventData,
  PlanningFiltersData,
  ResourceAvailability,
  PlanningApiResponse,
  UsePlanningOptions,
  UsePlanningReturn,
  calculateResourceUtilization,
  isResourceAvailable,
  planningEventSchema,
  updatePlanningEventSchema,
  planningFiltersSchema,
} from '@shared/planning-types';

// ===== API FUNCTIONS =====

const planningApi = {
  // Récupérer tous les événements de planning
  getEvents: async (filters?: PlanningFiltersData): Promise<PlanningEvent[]> => {
    const searchParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    const response = await fetch(`/api/planning/events?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Erreur lors du chargement des événements: ${response.statusText}`);
    }
    
    const result: PlanningApiResponse<PlanningEvent[]> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Erreur lors du chargement des événements');
    }
    
    // Convertir les dates string en Date objects
    return (result.data || []).map(event => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt),
    }));
  },

  // Récupérer toutes les ressources disponibles
  getResources: async (): Promise<PlanningResource[]> => {
    const response = await fetch('/api/planning/resources');
    if (!response.ok) {
      throw new Error(`Erreur lors du chargement des ressources: ${response.statusText}`);
    }
    
    const result: PlanningApiResponse<PlanningResource[]> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Erreur lors du chargement des ressources');
    }
    
    return result.data || [];
  },

  // Créer un nouvel événement
  createEvent: async (data: CreatePlanningEventData): Promise<PlanningEvent> => {
    // Validation côté client
    const validatedData = planningEventSchema.parse(data);
    
    const response = await fetch('/api/planning/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la création de l'événement: ${response.statusText}`);
    }
    
    const result: PlanningApiResponse<PlanningEvent> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la création de l\'événement');
    }
    
    if (!result.data) {
      throw new Error('Aucune donnée retournée lors de la création');
    }
    
    return {
      ...result.data,
      start: new Date(result.data.start),
      end: new Date(result.data.end),
      createdAt: new Date(result.data.createdAt),
      updatedAt: new Date(result.data.updatedAt),
    };
  },

  // Mettre à jour un événement
  updateEvent: async (data: UpdatePlanningEventData): Promise<PlanningEvent> => {
    // Validation côté client
    const validatedData = updatePlanningEventSchema.parse(data);
    
    const response = await fetch(`/api/planning/events/${validatedData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la mise à jour de l'événement: ${response.statusText}`);
    }
    
    const result: PlanningApiResponse<PlanningEvent> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la mise à jour de l\'événement');
    }
    
    if (!result.data) {
      throw new Error('Aucune donnée retournée lors de la mise à jour');
    }
    
    return {
      ...result.data,
      start: new Date(result.data.start),
      end: new Date(result.data.end),
      createdAt: new Date(result.data.createdAt),
      updatedAt: new Date(result.data.updatedAt),
    };
  },

  // Supprimer un événement
  deleteEvent: async (id: string): Promise<void> => {
    const response = await fetch(`/api/planning/events/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la suppression de l'événement: ${response.statusText}`);
    }
    
    const result: PlanningApiResponse = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la suppression de l\'événement');
    }
  },

  // Récupérer la disponibilité d'une ressource
  getResourceAvailability: async (resourceId: string, dateDebut: string, dateFin: string): Promise<ResourceAvailability[]> => {
    const searchParams = new URLSearchParams({
      resourceId,
      dateDebut,
      dateFin,
    });
    
    const response = await fetch(`/api/planning/availability?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Erreur lors du chargement de la disponibilité: ${response.statusText}`);
    }
    
    const result: PlanningApiResponse<ResourceAvailability[]> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Erreur lors du chargement de la disponibilité');
    }
    
    return result.data || [];
  },
};

// ===== HOOK PRINCIPAL =====

export function usePlanning(options: UsePlanningOptions = {}): UsePlanningReturn {
  const {
    enabled = true,
    refetchInterval = 30000, // 30 secondes
    filters,
  } = options;

  const queryClient = useQueryClient();
  const [localFilters, setLocalFilters] = useState<PlanningFiltersData>(filters || {});

  // Query pour les événements
  const {
    data: events = [],
    isLoading: eventsLoading,
    error: eventsError,
    refetch: refetchEvents,
  } = useQuery({
    queryKey: ['planning', 'events', localFilters],
    queryFn: () => planningApi.getEvents(localFilters),
    enabled,
    refetchInterval,
    staleTime: 10000, // 10 secondes
  });

  // Query pour les ressources
  const {
    data: resources = [],
    isLoading: resourcesLoading,
    error: resourcesError,
  } = useQuery({
    queryKey: ['planning', 'resources'],
    queryFn: planningApi.getResources,
    enabled,
    staleTime: 60000, // 1 minute (les ressources changent moins souvent)
  });

  // Query pour les chantiers
  const {
    data: chantiers = [],
    isLoading: chantiersLoading,
    error: chantiersError,
  } = useQuery({
    queryKey: ['chantiers'],
    queryFn: () => fetch('/api/chantiers').then(res => res.json()),
    enabled,
    staleTime: 60000, // 1 minute
  });

  // Mutation pour créer un événement
  const createEventMutation = useMutation({
    mutationFn: planningApi.createEvent,
    onSuccess: (newEvent) => {
      // Invalider les queries pour forcer le refresh
      queryClient.invalidateQueries({ queryKey: ['planning', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['planning', 'availability'] });
      
      toast({
        title: "Événement créé",
        description: `"${newEvent.title}" a été ajouté au planning`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la création",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation pour mettre à jour un événement
  const updateEventMutation = useMutation({
    mutationFn: planningApi.updateEvent,
    onSuccess: (updatedEvent) => {
      queryClient.invalidateQueries({ queryKey: ['planning', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['planning', 'availability'] });
      
      toast({
        title: "Événement modifié",
        description: `"${updatedEvent.title}" a été mis à jour`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la modification",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation pour supprimer un événement
  const deleteEventMutation = useMutation({
    mutationFn: planningApi.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planning', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['planning', 'availability'] });
      
      toast({
        title: "Événement supprimé",
        description: "L'événement a été retiré du planning",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la suppression",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // État de chargement global
  const isLoading = eventsLoading || resourcesLoading || chantiersLoading ||
    createEventMutation.isPending || 
    updateEventMutation.isPending || 
    deleteEventMutation.isPending;

  // Erreur globale
  const error = eventsError || resourcesError || chantiersError;

  // Fonctions pour les actions
  const createEvent = useCallback(async (data: CreatePlanningEventData) => {
    await createEventMutation.mutateAsync(data);
  }, [createEventMutation]);

  const updateEvent = useCallback(async (data: UpdatePlanningEventData) => {
    await updateEventMutation.mutateAsync(data);
  }, [updateEventMutation]);

  const deleteEvent = useCallback(async (id: string) => {
    await deleteEventMutation.mutateAsync(id);
  }, [deleteEventMutation]);

  // Fonction pour mettre à jour les filtres
  const updateFilters = useCallback((newFilters: PlanningFiltersData) => {
    const validatedFilters = planningFiltersSchema.parse(newFilters);
    setLocalFilters(validatedFilters);
  }, []);

  // Fonction de refetch global
  const refetch = useCallback(() => {
    refetchEvents();
    queryClient.invalidateQueries({ queryKey: ['planning', 'resources'] });
  }, [refetchEvents, queryClient]);

  // Utilitaires memoized avec les données actuelles
  const utilities = useMemo(() => ({
    calculateResourceUtilization: (resourceId: string, date: Date) => 
      calculateResourceUtilization(events, resourceId, date),
    
    isResourceAvailable: (resourceId: string, start: Date, end: Date, excludeEventId?: string) =>
      isResourceAvailable(events, resourceId, start, end, excludeEventId),
    
    getResourceEvents: (resourceId: string) =>
      events.filter(event => event.resourceId === resourceId),
    
    getChantierEvents: (chantierId: string) =>
      events.filter(event => event.chantierId === chantierId),
    
    getEventsInRange: (start: Date, end: Date) =>
      events.filter(event => event.start >= start && event.end <= end),
  }), [events]);

  return {
    events,
    resources,
    chantiers,
    isLoading,
    error,
    refetch,
    createEvent,
    updateEvent,
    deleteEvent,
    updateFilters,
    filters: localFilters,
    utilities,
    // Mutations pour accès direct si nécessaire
    createEventMutation,
    updateEventMutation,
    deleteEventMutation,
  };
}

// ===== HOOK POUR LA DISPONIBILITÉ DES RESSOURCES =====

export function useResourceAvailability(resourceId?: string, dateDebut?: string, dateFin?: string) {
  return useQuery({
    queryKey: ['planning', 'availability', resourceId, dateDebut, dateFin],
    queryFn: () => {
      if (!resourceId || !dateDebut || !dateFin) {
        return Promise.resolve([]);
      }
      return planningApi.getResourceAvailability(resourceId, dateDebut, dateFin);
    },
    enabled: Boolean(resourceId && dateDebut && dateFin),
    staleTime: 30000, // 30 secondes
  });
}

// ===== PROVIDER POUR LE CONTEXTE GLOBAL (optionnel) =====

export const PLANNING_QUERY_KEYS = {
  all: ['planning'] as const,
  events: (filters?: PlanningFiltersData) => ['planning', 'events', filters] as const,
  resources: () => ['planning', 'resources'] as const,
  availability: (resourceId?: string, dateDebut?: string, dateFin?: string) => 
    ['planning', 'availability', resourceId, dateDebut, dateFin] as const,
} as const;

// Utilitaires pour les query keys
export const planningQueryKeys = PLANNING_QUERY_KEYS;