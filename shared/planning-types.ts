import { z } from 'zod';

// ===== TYPES DE BASE =====

export interface PlanningResource {
  id: string;
  nom: string;
  type: 'salarie' | 'equipement';
  disponible: boolean;
  competences?: string[];
  tauxHoraire?: number;
  coutJournalier?: number;
  localisation?: string;
  status?: string;
}

export interface PlanningEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId: string;
  chantierId: string;
  chantierNom: string;
  resourceType: 'salarie' | 'equipement';
  pourcentageTemps: number; // 0-100%
  notes?: string;
  color?: string;
  status: 'planifie' | 'en_cours' | 'termine' | 'annule';
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarView {
  view: 'month' | 'week' | 'work_week' | 'day' | 'agenda';
  date: Date;
}

export interface ResourceAvailability {
  resourceId: string;
  date: string; // YYYY-MM-DD
  totalCapacity: number; // 100% en général
  usedCapacity: number;   // Pourcentage utilisé
  disponible: boolean;
}

export interface PlanningFilters {
  resourceTypes: ('salarie' | 'equipement')[];
  statuses: ('planifie' | 'en_cours' | 'termine' | 'annule')[];
  chantierIds: string[];
  dateDebut?: Date;
  dateFin?: Date;
  searchText?: string;
}

// ===== SCHEMAS ZOD VALIDATION =====

// Schema de base sans refinement pour permettre partial()
const basePlanningEventSchema = z.object({
  title: z.string().min(2, 'Le titre doit contenir au moins 2 caractères'),
  start: z.date(),
  end: z.date(),
  resourceId: z.string().min(1, 'ID de ressource requis'),
  chantierId: z.string().min(1, 'ID de chantier requis'),
  chantierNom: z.string().optional(),
  resourceType: z.enum(['salarie', 'equipement']),
  pourcentageTemps: z.number().min(1).max(200),
  notes: z.string().optional(),
  status: z.enum(['planifie', 'en_cours', 'termine', 'annule']).default('planifie'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const planningEventSchema = basePlanningEventSchema.refine((data) => data.end > data.start, {
  message: "La date de fin doit être après la date de début",
  path: ["end"],
});

export const updatePlanningEventSchema = basePlanningEventSchema.partial().extend({
  id: z.string().min(1, 'ID requis')
});

export const planningFiltersSchema = z.object({
  resourceTypes: z.array(z.enum(['salarie', 'equipement'])).optional(),
  statuses: z.array(z.enum(['planifie', 'en_cours', 'termine', 'annule'])).optional(),
  chantierIds: z.array(z.string().uuid()).optional(),
  dateDebut: z.string().datetime().optional(),
  dateFin: z.string().datetime().optional(),
  searchText: z.string().optional(),
});

export const resourceAvailabilityQuerySchema = z.object({
  resourceId: z.string().uuid(),
  dateDebut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  dateFin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
});

// ===== TYPES DÉRIVÉS =====

export type CreatePlanningEventData = z.infer<typeof planningEventSchema>;
export type UpdatePlanningEventData = z.infer<typeof updatePlanningEventSchema>;
export type PlanningFiltersData = z.infer<typeof planningFiltersSchema>;
export type ResourceAvailabilityQuery = z.infer<typeof resourceAvailabilityQuerySchema>;

// ===== CONSTANTES =====

export const RESOURCE_TYPES = {
  salarie: {
    label: 'Salarié',
    icon: 'Users',
    color: '#3b82f6'
  },
  equipement: {
    label: 'Équipement', 
    icon: 'Truck',
    color: '#f59e0b'
  }
} as const;

export const EVENT_STATUSES = {
  planifie: {
    label: 'Planifié',
    color: '#6b7280',
    bgColor: '#f3f4f6'
  },
  en_cours: {
    label: 'En cours',
    color: '#3b82f6',
    bgColor: '#dbeafe'
  },
  termine: {
    label: 'Terminé',
    color: '#10b981',
    bgColor: '#d1fae5'
  },
  annule: {
    label: 'Annulé',
    color: '#ef4444',
    bgColor: '#fee2e2'
  }
} as const;

export const CALENDAR_VIEWS = {
  month: 'Mois',
  week: 'Semaine', 
  work_week: 'Semaine de travail',
  day: 'Jour',
  agenda: 'Agenda'
} as const;

// ===== UTILITAIRES =====

export const getResourceColor = (resourceType: 'salarie' | 'equipement'): string => {
  return RESOURCE_TYPES[resourceType].color;
};

export const getEventStatusConfig = (status: PlanningEvent['status']) => {
  return EVENT_STATUSES[status];
};

export const calculateResourceUtilization = (events: PlanningEvent[], resourceId: string, date: Date): number => {
  const dayEvents = events.filter(event => 
    event.resourceId === resourceId &&
    event.start <= date &&
    event.end >= date &&
    event.status !== 'annule'
  );
  
  return dayEvents.reduce((total, event) => total + event.pourcentageTemps, 0);
};

export const isResourceAvailable = (events: PlanningEvent[], resourceId: string, start: Date, end: Date, excludeEventId?: string): boolean => {
  const conflictingEvents = events.filter(event =>
    event.resourceId === resourceId &&
    event.id !== excludeEventId &&
    event.status !== 'annule' &&
    (
      (start >= event.start && start < event.end) ||
      (end > event.start && end <= event.end) ||
      (start <= event.start && end >= event.end)
    )
  );
  
  const totalUtilization = conflictingEvents.reduce((total, event) => total + event.pourcentageTemps, 0);
  return totalUtilization < 100;
};

// ===== TYPES POUR L'API =====

export interface PlanningApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedPlanningResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===== HOOKS TYPES =====

export interface UsePlanningOptions {
  enabled?: boolean;
  refetchInterval?: number;
  filters?: PlanningFiltersData;
}

export interface UsePlanningReturn {
  events: PlanningEvent[];
  resources: PlanningResource[];
  chantiers: any[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  createEvent: (data: CreatePlanningEventData) => Promise<void>;
  updateEvent: (data: UpdatePlanningEventData) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  updateFilters: (filters: PlanningFiltersData) => void;
  filters: PlanningFiltersData;
  utilities: {
    calculateResourceUtilization: (resourceId: string, date: Date) => number;
    isResourceAvailable: (resourceId: string, start: Date, end: Date, excludeEventId?: string) => boolean;
    getResourceEvents: (resourceId: string) => PlanningEvent[];
    getChantierEvents: (chantierId: string) => PlanningEvent[];
    getEventsInRange: (start: Date, end: Date) => PlanningEvent[];
  };
  // Mutations pour accès direct
  createEventMutation: any;
  updateEventMutation: any;
  deleteEventMutation: any;
}