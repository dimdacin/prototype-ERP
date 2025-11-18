import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import moment from 'moment';
import 'moment/locale/fr';
import {
  Calendar,
  Clock,
  User,
  Truck,
  Building,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Save,
  X,
  Search,
  CalendarDays
} from 'lucide-react';

// Imports des composants shadcn/ui
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";

// Imports des types et hooks
import { 
  PlanningResource, 
  PlanningEvent,
  EVENT_STATUSES,
  RESOURCE_TYPES,
  getResourceColor,
  getEventStatusConfig,
} from '@shared/planning-types';
import { usePlanning } from '@/hooks/usePlanning';

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

// Interface pour les chantiers
interface Chantier {
  id: string;
  nom: string;
  statut: 'planifie' | 'en_cours' | 'termine' | 'suspendu';
  dateDebut: Date;
  dateFin: Date;
}

// Props du composant AffectationDialog
interface AffectationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEvent?: CalendarEvent;
  draggedResource?: PlanningResource;
  initialDate?: Date;
}

// Schéma de validation Zod pour le formulaire
const affectationSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(100, 'Le titre est trop long'),
  chantierId: z.string().min(1, 'Le chantier est requis'),
  resourceId: z.string().min(1, 'La ressource est requise'),
  resourceType: z.enum(['salarie', 'equipement']),
  startDate: z.date({ required_error: 'La date de début est requise' }),
  endDate: z.date({ required_error: 'La date de fin est requise' }),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM requis'),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM requis'),
  pourcentageTemps: z.number().min(1, 'Minimum 1%').max(200, 'Maximum 200%'),
  status: z.enum(['planifie', 'en_cours', 'termine', 'annule']),
  notes: z.string().optional(),
}).refine((data) => {
  // Validation que la date de fin est après la date de début
  const start = moment(`${moment(data.startDate).format('YYYY-MM-DD')} ${data.startTime}`);
  const end = moment(`${moment(data.endDate).format('YYYY-MM-DD')} ${data.endTime}`);
  return end.isAfter(start);
}, {
  message: 'La date de fin doit être après la date de début',
  path: ['endDate']
});

type FormData = z.infer<typeof affectationSchema>;

// Hook personnalisé pour la vérification de disponibilité
const useResourceAvailability = (
  resourceId: string,
  startDate: Date,
  endDate: Date,
  excludeEventId?: string
) => {
  const { events } = usePlanning();
  const [availability, setAvailability] = useState<{
    isAvailable: boolean;
    conflictingEvents: CalendarEvent[];
    totalUtilization: number;
  }>({ isAvailable: true, conflictingEvents: [], totalUtilization: 0 });

  useEffect(() => {
    if (!resourceId || !startDate || !endDate) {
      setAvailability({ isAvailable: true, conflictingEvents: [], totalUtilization: 0 });
      return;
    }

    const relevantEvents = events.filter(event => 
      event.resourceId === resourceId && 
      event.id !== excludeEventId &&
      moment(event.end).isAfter(startDate) &&
      moment(event.start).isBefore(endDate)
    );

    const totalUtilization = relevantEvents.reduce((sum, event) => sum + event.pourcentageTemps, 0);
    
    setAvailability({
      isAvailable: totalUtilization < 100,
      conflictingEvents: relevantEvents.map(event => ({
        ...event,
        resource: { 
          id: event.resourceId, 
          nom: '', 
          type: event.resourceType,
          disponible: true,
          competences: [],
          tauxHoraire: 0,
          coutJournalier: 0,
          localisation: '',
          status: ''
        } as PlanningResource
      })) as CalendarEvent[],
      totalUtilization
    });
  }, [resourceId, startDate, endDate, excludeEventId, events]);

  return availability;
};

// Composant pour l'affichage de la disponibilité
const AvailabilityIndicator: React.FC<{
  availability: {
    isAvailable: boolean;
    conflictingEvents: CalendarEvent[];
    totalUtilization: number;
  };
  newPercentage: number;
}> = ({ availability, newPercentage }) => {
  const { t } = useTranslation();
  const totalAfterNew = availability.totalUtilization + newPercentage;
  
  const getIndicatorColor = () => {
    if (totalAfterNew <= 100) return 'text-green-600';
    if (totalAfterNew <= 150) return 'text-orange-600';
    return 'text-red-600';
  };

  const getIndicatorIcon = () => {
    if (totalAfterNew <= 100) return <CheckCircle className="h-4 w-4" />;
    if (totalAfterNew <= 150) return <AlertTriangle className="h-4 w-4" />;
    return <XCircle className="h-4 w-4" />;
  };

  return (
    <Card className={`border-l-4 ${
      totalAfterNew <= 100 ? 'border-l-green-500' : 
      totalAfterNew <= 150 ? 'border-l-orange-500' : 'border-l-red-500'
    }`}>
      <CardContent className="pt-4">
        <div className={`flex items-center space-x-2 ${getIndicatorColor()}`}>
          {getIndicatorIcon()}
          <div>
            <p className="font-medium">
              {t('planning.affectationDialog.utilizationAfter')}: {totalAfterNew}%
            </p>
            <p className="text-sm text-muted-foreground">
              {availability.conflictingEvents.length > 0 && (
                <>
                  {t('planning.affectationDialog.conflictsWith')} {availability.conflictingEvents.length} 
                  {t('planning.affectationDialog.otherEvents')}
                </>
              )}
            </p>
          </div>
        </div>
        
        {totalAfterNew > 100 && (
          <Alert className="mt-3" variant={totalAfterNew > 150 ? "destructive" : "default"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {totalAfterNew > 150 
                ? t('planning.affectationDialog.severOverload')
                : t('planning.affectationDialog.lightOverload')
              }
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

// Composant principal AffectationDialog
export default function AffectationDialog({
  open,
  onOpenChange,
  initialEvent,
  draggedResource,
  initialDate
}: AffectationDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { 
    createEvent,
    updateEvent,
    resources, 
    chantiers, 
    isLoading 
  } = usePlanning();
  
  const [chantiersSearch, setChantiersSearch] = useState('');
  const [resourcesSearch, setResourcesSearch] = useState('');
  const [selectedResourceType, setSelectedResourceType] = useState<'salarie' | 'equipement' | 'all'>('all');
  
  const isEditing = !!initialEvent;

  // Configuration du formulaire React Hook Form
  const form = useForm<FormData>({
    resolver: zodResolver(affectationSchema),
    defaultValues: {
      title: '',
      chantierId: '',
      resourceId: '',
      resourceType: 'salarie',
      startDate: initialDate || new Date(),
      endDate: initialDate || new Date(),
      startTime: '08:00',
      endTime: '17:00',
      pourcentageTemps: 100,
      status: 'planifie',
      notes: ''
    }
  });

  // Surveillance des valeurs du formulaire pour la vérification de disponibilité
  const watchedValues = form.watch();
  const startDateTime = moment(`${moment(watchedValues.startDate).format('YYYY-MM-DD')} ${watchedValues.startTime}`).toDate();
  const endDateTime = moment(`${moment(watchedValues.endDate).format('YYYY-MM-DD')} ${watchedValues.endTime}`).toDate();

  const availability = useResourceAvailability(
    watchedValues.resourceId,
    startDateTime,
    endDateTime,
    initialEvent?.id
  );

  // Initialisation du formulaire avec les données existantes
  useEffect(() => {
    if (initialEvent) {
      form.reset({
        title: initialEvent.title,
        chantierId: initialEvent.chantierId,
        resourceId: initialEvent.resource.id,
        resourceType: initialEvent.resourceType,
        startDate: initialEvent.start,
        endDate: initialEvent.end,
        startTime: moment(initialEvent.start).format('HH:mm'),
        endTime: moment(initialEvent.end).format('HH:mm'),
        pourcentageTemps: initialEvent.pourcentageTemps,
        status: initialEvent.status,
        notes: initialEvent.notes || ''
      });
    } else if (draggedResource) {
      form.setValue('resourceId', draggedResource.id);
      form.setValue('resourceType', draggedResource.type);
    }
  }, [initialEvent, draggedResource, form]);

  // Filtrage des chantiers
  const filteredChantiers = useMemo(() => {
    if (!chantiers) return [];
    return chantiers.filter((chantier: any) => 
      chantier.nom.toLowerCase().includes(chantiersSearch.toLowerCase()) &&
      chantier.statut !== 'termine'
    );
  }, [chantiers, chantiersSearch]);

  // Filtrage des ressources
  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = resource.nom.toLowerCase().includes(resourcesSearch.toLowerCase());
      const matchesType = selectedResourceType === 'all' || resource.type === selectedResourceType;
      return matchesSearch && matchesType && resource.disponible;
    });
  }, [resources, resourcesSearch, selectedResourceType]);

  // Soumission du formulaire
  const onSubmit = useCallback(async (data: FormData) => {
    try {
      const selectedResource = resources.find(r => r.id === data.resourceId);
      const selectedChantier = chantiers?.find((c: any) => c.id === data.chantierId);
      
      if (!selectedResource || !selectedChantier) {
        toast({
          title: t('planning.affectationDialog.error'),
          description: t('planning.affectationDialog.resourceOrSiteNotFound'),
          variant: "destructive",
        });
        return;
      }

      const startDateTime = moment(`${moment(data.startDate).format('YYYY-MM-DD')} ${data.startTime}`);
      const endDateTime = moment(`${moment(data.endDate).format('YYYY-MM-DD')} ${data.endTime}`);

      const eventData: Partial<PlanningEvent> = {
        title: data.title,
        resourceId: data.resourceId,
        resourceType: data.resourceType,
        chantierId: data.chantierId,
        chantierNom: selectedChantier.nom,
        start: startDateTime.toDate(),
        end: endDateTime.toDate(),
        pourcentageTemps: data.pourcentageTemps,
        status: data.status,
        notes: data.notes,
      };

      if (isEditing && initialEvent) {
        await updateEvent({
          id: initialEvent.id,
          ...eventData,
          updatedAt: new Date()
        });
        toast({
          title: t('planning.affectationDialog.success'),
          description: t('planning.affectationDialog.eventUpdated'),
        });
      } else {
        await createEvent({
          ...eventData,
          createdAt: new Date()
        } as PlanningEvent);
        toast({
          title: t('planning.affectationDialog.success'),
          description: t('planning.affectationDialog.eventCreated'),
        });
      }

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: t('planning.affectationDialog.error'),
        description: t('planning.affectationDialog.saveFailed'),
        variant: "destructive",
      });
    }
  }, [resources, chantiers, isEditing, initialEvent, createEvent, updateEvent, toast, t, onOpenChange, form]);

  // Réinitialisation du formulaire à la fermeture
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setChantiersSearch('');
      setResourcesSearch('');
      setSelectedResourceType('all');
    }
    onOpenChange(newOpen);
  }, [onOpenChange, form]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>
              {isEditing 
                ? t('planning.affectationDialog.editTitle') 
                : t('planning.affectationDialog.createTitle')
              }
            </span>
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? t('planning.affectationDialog.editDescription')
              : t('planning.affectationDialog.createDescription')
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Titre de l'événement */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>{t('planning.affectationDialog.eventTitle')}</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t('planning.affectationDialog.eventTitlePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sélection du chantier */}
              <FormField
                control={form.control}
                name="chantierId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center space-x-2">
                      <Building className="h-4 w-4" />
                      <span>{t('planning.affectationDialog.worksite')}</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="justify-between"
                          >
                            {field.value
                              ? chantiers?.find((chantier: any) => chantier.id === field.value)?.nom
                              : t('planning.affectationDialog.selectWorksite')
                            }
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput 
                            placeholder={t('planning.affectationDialog.searchWorksites')}
                            value={chantiersSearch}
                            onValueChange={setChantiersSearch}
                          />
                          <CommandList>
                            <CommandEmpty>{t('planning.affectationDialog.noWorksitesFound')}</CommandEmpty>
                            <CommandGroup>
                              {filteredChantiers.map((chantier: any) => (
                                <CommandItem
                                  value={chantier.nom}
                                  key={chantier.id}
                                  onSelect={() => {
                                    form.setValue("chantierId", chantier.id);
                                  }}
                                >
                                  <div className="flex items-center space-x-2">
                                    <Building className="h-4 w-4" />
                                    <span>{chantier.nom}</span>
                                    <Badge variant="outline">{chantier.statut}</Badge>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sélection de la ressource */}
              <FormField
                control={form.control}
                name="resourceId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{t('planning.affectationDialog.resource')}</span>
                    </FormLabel>
                    <div className="space-y-2">
                      {/* Filtre par type de ressource */}
                      <Select 
                        value={selectedResourceType} 
                        onValueChange={(value: any) => setSelectedResourceType(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('planning.allResources')}</SelectItem>
                          <SelectItem value="salarie">{t('planning.employees')}</SelectItem>
                          <SelectItem value="equipement">{t('planning.equipment')}</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Sélecteur de ressource */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="justify-between"
                            >
                              {field.value ? (() => {
                                const resource = resources.find(r => r.id === field.value);
                                return resource ? (
                                  <div className="flex items-center space-x-2">
                                    {resource.type === 'salarie' ? <User className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                                    <span>{resource.nom}</span>
                                  </div>
                                ) : t('planning.affectationDialog.selectResource');
                              })() : t('planning.affectationDialog.selectResource')}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput 
                              placeholder={t('planning.affectationDialog.searchResources')}
                              value={resourcesSearch}
                              onValueChange={setResourcesSearch}
                            />
                            <CommandList>
                              <CommandEmpty>{t('planning.affectationDialog.noResourcesFound')}</CommandEmpty>
                              <CommandGroup>
                                {filteredResources.map((resource) => (
                                  <CommandItem
                                    value={resource.nom}
                                    key={resource.id}
                                    onSelect={() => {
                                      form.setValue("resourceId", resource.id);
                                      form.setValue("resourceType", resource.type);
                                    }}
                                  >
                                    <div className="flex items-center space-x-2">
                                      {resource.type === 'salarie' ? 
                                        <User className="h-4 w-4 text-blue-500" /> : 
                                        <Truck className="h-4 w-4 text-orange-500" />
                                      }
                                      <span>{resource.nom}</span>
                                      <Badge variant="outline">
                                        {RESOURCE_TYPES[resource.type].label}
                                      </Badge>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Dates et heures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="flex items-center space-x-2">
                        <CalendarDays className="h-4 w-4" />
                        <span>{t('planning.affectationDialog.startDate')}</span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={"justify-start text-left font-normal"}
                            >
                              {field.value ? (
                                moment(field.value).format('DD/MM/YYYY')
                              ) : (
                                <span>{t('planning.affectationDialog.selectDate')}</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarPicker
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{t('planning.affectationDialog.startTime')}</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="flex items-center space-x-2">
                        <CalendarDays className="h-4 w-4" />
                        <span>{t('planning.affectationDialog.endDate')}</span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={"justify-start text-left font-normal"}
                            >
                              {field.value ? (
                                moment(field.value).format('DD/MM/YYYY')
                              ) : (
                                <span>{t('planning.affectationDialog.selectDate')}</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarPicker
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < watchedValues.startDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{t('planning.affectationDialog.endTime')}</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pourcentage de temps */}
              <FormField
                control={form.control}
                name="pourcentageTemps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{t('planning.affectationDialog.timePercentage')}</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input 
                          type="number" 
                          min="1" 
                          max="200" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      {t('planning.affectationDialog.timePercentageDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Statut */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('planning.affectationDialog.status')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(EVENT_STATUSES).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: config.bgColor }}
                              />
                              <span>{config.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>{t('planning.affectationDialog.notes')}</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('planning.affectationDialog.notesPlaceholder')}
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Indicateur de disponibilité */}
            {watchedValues.resourceId && watchedValues.pourcentageTemps && (
              <AvailabilityIndicator 
                availability={availability}
                newPercentage={watchedValues.pourcentageTemps}
              />
            )}

            <DialogFooter className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                <X className="h-4 w-4 mr-2" />
                {t('planning.affectationDialog.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={
                  isLoading || 
                  !form.formState.isValid || 
                  (availability.totalUtilization + watchedValues.pourcentageTemps > 200)
                }
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('planning.affectationDialog.saving')}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>
                      {isEditing 
                        ? t('planning.affectationDialog.updateEvent') 
                        : t('planning.affectationDialog.createEvent')
                      }
                    </span>
                  </div>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}