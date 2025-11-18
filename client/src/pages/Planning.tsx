import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, momentLocalizer, View, Event as BigCalendarEvent } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Imports des icônes Lucide
import { 
  Calendar as CalendarIcon, 
  Users, 
  Truck, 
  Plus,
  Loader2,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Imports des composants shadcn/ui
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Imports des types et hooks
import { 
  PlanningResource, 
  PlanningEvent, 
  RESOURCE_TYPES,
  EVENT_STATUSES,
  CALENDAR_VIEWS,
  getResourceColor,
  getEventStatusConfig,
} from '@shared/planning-types';
import { usePlanning } from '@/hooks/usePlanning';

// Imports des composants Planning
import ResourceSidebar from '@/components/planning/ResourceSidebar';
import EventDetails from '@/components/planning/EventDetails';
import AffectationDialog from '@/components/planning/AffectationDialog';

// Configuration de moment et localizer
moment.locale('fr');
const localizer = momentLocalizer(moment);

// Interface pour les événements du calendrier
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: PlanningResource;
  resourceType: 'salarie' | 'equipement';
  status: PlanningEvent['status'];
  pourcentageTemps: number;
  chantierId: string;
  chantierNom: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Composant principal Planning
export default function Planning() {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [draggedResource, setDraggedResource] = useState<PlanningResource | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(true);
  const [showAffectationDialog, setShowAffectationDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  // Utilisation du hook planning
  const {
    events,
    resources,
    isLoading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    utilities,
  } = usePlanning();

  // Calcul des utilisations de ressources
  const resourceUtilizations = useMemo(() => {
    const utilizations: Record<string, number> = {};
    resources.forEach(resource => {
      utilizations[resource.id] = utilities.calculateResourceUtilization(resource.id, currentDate);
    });
    return utilizations;
  }, [resources, utilities, currentDate]);

  // Transformation des événements pour react-big-calendar
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return events.map(event => {
      const resource = resources.find(r => r.id === event.resourceId);
      return {
        id: event.id,
        title: `${event.title} (${event.pourcentageTemps}%)`,
        start: event.start,
        end: event.end,
        resource: resource!,
        resourceType: event.resourceType,
        status: event.status,
        pourcentageTemps: event.pourcentageTemps,
        chantierId: event.chantierId,
        chantierNom: event.chantierNom,
        notes: event.notes,
      };
    }).filter(event => event.resource); // Filtrer les événements sans ressource
  }, [events, resources]);

  // Style des événements
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const baseColor = getResourceColor(event.resourceType);
    const statusConfig = getEventStatusConfig(event.status);
    const isOverloaded = event.pourcentageTemps > 100;
    
    return {
      style: {
        backgroundColor: isOverloaded ? '#fee2e2' : statusConfig.bgColor,
        borderLeft: `4px solid ${baseColor}`,
        color: isOverloaded ? '#dc2626' : statusConfig.color,
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px',
        padding: '2px 4px',
      }
    };
  }, []);

  // Gestionnaires d'événements
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
  }, []);

  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date }) => {
    setSelectedSlot(slotInfo);
    setEditingEvent(null);
    setShowAffectationDialog(true);
  }, []);

  const handleResourceDrag = useCallback((resource: PlanningResource) => {
    setDraggedResource(resource);
  }, []);

  const handleNavigate = useCallback((date: Date, view: View) => {
    setCurrentDate(date);
    setCurrentView(view);
  }, []);

  const handleEditEvent = useCallback((event: CalendarEvent) => {
    setEditingEvent(event);
    setSelectedSlot(null);
    setShowAffectationDialog(true);
  }, []);

  const handleCloseAffectationDialog = useCallback((open: boolean) => {
    setShowAffectationDialog(open);
    if (!open) {
      setEditingEvent(null);
      setSelectedSlot(null);
      setDraggedResource(null);
    }
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen">
        <div className="w-80 border-r p-4">
          <Skeleton className="h-8 w-32 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('planning.errorLoading')}: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen">
        {/* Sidebar des ressources */}
        <ResourceSidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onResourceDrag={handleResourceDrag}
        />

        {/* Zone principale du calendrier */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{t('planning.title')}</h1>
                <p className="text-muted-foreground">{t('planning.subtitle')}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Select value={currentView} onValueChange={(view: View) => setCurrentView(view)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CALENDAR_VIEWS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDate(new Date())}
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
                
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  {t('planning.addEvent')}
                </Button>
              </div>
            </div>
          </div>

          {/* Calendrier */}
          <div className="flex-1 p-4">
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              view={currentView}
              date={currentDate}
              onNavigate={handleNavigate}
              onView={setCurrentView}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              eventPropGetter={eventStyleGetter}
              style={{ height: 'calc(100vh - 200px)' }}
              messages={{
                next: t('planning.next'),
                previous: t('planning.previous'),
                today: t('planning.today'),
                month: t('planning.month'),
                week: t('planning.week'),
                day: t('planning.day'),
                agenda: t('planning.agenda'),
                date: t('planning.date'),
                time: t('planning.time'),
                event: t('planning.event'),
                noEventsInRange: t('planning.noEvents'),
                showMore: (count: number) => t('planning.showMore', { count }),
              }}
              formats={{
                timeGutterFormat: 'HH:mm',
                eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) => 
                  `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
                dayFormat: 'dd DD/MM',
                dayHeaderFormat: 'dddd DD/MM/YYYY',
                monthHeaderFormat: 'MMMM YYYY',
              }}
            />
          </div>
        </div>

        {/* Panel des détails */}
        <EventDetails
          event={selectedEvent}
          isVisible={detailsVisible}
          onToggle={() => setDetailsVisible(!detailsVisible)}
          onEdit={handleEditEvent}
        />
      </div>

      {/* Dialog d'affectation */}
      <AffectationDialog
        open={showAffectationDialog}
        onOpenChange={handleCloseAffectationDialog}
        initialEvent={editingEvent || undefined}
        draggedResource={draggedResource || undefined}
        initialDate={selectedSlot?.start}
      />
    </DndProvider>
  );
}