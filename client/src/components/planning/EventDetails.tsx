import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/fr';
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  Clock,
  User,
  Truck,
  Building,
  FileText,
  History,
  AlertTriangle,
  Save,
  X
} from 'lucide-react';

// Imports des composants shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

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

// Interface pour l'édition en ligne
interface EditingState {
  title?: string;
  notes?: string;
  pourcentageTemps?: number;
  status?: PlanningEvent['status'];
}

// Props du composant EventDetails
interface EventDetailsProps {
  event: CalendarEvent | null;
  isVisible: boolean;
  onToggle: () => void;
  onEdit?: (event: CalendarEvent) => void;
}

// Hook personnalisé pour l'édition inline
const useInlineEdit = (event: CalendarEvent | null, updateEvent: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState<EditingState>({});
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = useCallback(() => {
    if (!event) return;
    setEditingData({
      title: event.title,
      notes: event.notes || '',
      pourcentageTemps: event.pourcentageTemps,
      status: event.status
    });
    setIsEditing(true);
  }, [event]);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditingData({});
  }, []);

  const saveEdit = useCallback(async () => {
    if (!event) return;
    
    setIsSaving(true);
    try {
      await updateEvent({
        id: event.id,
        ...editingData,
        updatedAt: new Date()
      });
      
      setIsEditing(false);
      setEditingData({});
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setIsSaving(false);
    }
  }, [event, editingData, updateEvent]);

  const updateField = useCallback((field: keyof EditingState, value: any) => {
    setEditingData(prev => ({ ...prev, [field]: value }));
  }, []);

  return {
    isEditing,
    editingData,
    isSaving,
    startEdit,
    cancelEdit,
    saveEdit,
    updateField
  };
};

// Composant pour l'affichage des métadonnées
const EventMetadata: React.FC<{
  event: CalendarEvent;
  className?: string;
}> = ({ event, className = "" }) => {
  const { t } = useTranslation();

  return (
    <div className={`space-y-2 text-sm ${className}`}>
      <div className="flex items-center text-muted-foreground">
        <History className="h-3 w-3 mr-1" />
        <span>{t('planning.eventDetails.created')}: </span>
        <span className="font-mono ml-1">
          {event.createdAt ? moment(event.createdAt).format('DD/MM/YYYY HH:mm') : t('planning.eventDetails.unknown')}
        </span>
      </div>
      
      {event.updatedAt && event.updatedAt !== event.createdAt && (
        <div className="flex items-center text-muted-foreground">
          <Edit3 className="h-3 w-3 mr-1" />
          <span>{t('planning.eventDetails.lastModified')}: </span>
          <span className="font-mono ml-1">
            {moment(event.updatedAt).format('DD/MM/YYYY HH:mm')}
          </span>
        </div>
      )}
    </div>
  );
};

// Composant pour l'affichage d'un champ en lecture seule
const ReadOnlyField: React.FC<{
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}> = ({ label, value, icon, className = "" }) => (
  <div className={`space-y-1 ${className}`}>
    <div className="flex items-center text-sm text-muted-foreground">
      {icon && <span className="mr-1">{icon}</span>}
      {label}:
    </div>
    <div className="font-medium">{value}</div>
  </div>
);

// Composant pour l'édition d'un champ texte
const EditableTextField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  multiline?: boolean;
  placeholder?: string;
}> = ({ label, value, onChange, icon, multiline = false, placeholder }) => (
  <div className="space-y-1">
    <div className="flex items-center text-sm text-muted-foreground">
      {icon && <span className="mr-1">{icon}</span>}
      <Label>{label}:</Label>
    </div>
    {multiline ? (
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
      />
    ) : (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    )}
  </div>
);

// Composant principal EventDetails
export default function EventDetails({ 
  event, 
  isVisible, 
  onToggle, 
  onEdit 
}: EventDetailsProps) {
  const { t } = useTranslation();
  const { updateEvent, deleteEvent } = usePlanning();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAffectationDialog, setShowAffectationDialog] = useState(false);

  const {
    isEditing,
    editingData,
    isSaving,
    startEdit,
    cancelEdit,
    saveEdit,
    updateField
  } = useInlineEdit(event, updateEvent);

  // Gestion de la suppression
  const handleDelete = useCallback(async () => {
    if (!event) return;
    
    setIsDeleting(true);
    try {
      await deleteEvent(event.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [event, deleteEvent]);

  // Calcul de la durée
  const duration = event ? moment(event.end).diff(moment(event.start), 'hours', true) : 0;

  // Vue réduite (sidebar fermée)
  if (!isVisible) {
    return (
      <div className="w-16 border-l bg-background">
        <div className="p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        {event && (
          <div className="px-2 space-y-2">
            <div className="text-center">
              {event.resourceType === 'salarie' ? (
                <User className="h-6 w-6 mx-auto text-blue-500" />
              ) : (
                <Truck className="h-6 w-6 mx-auto text-orange-500" />
              )}
              <div className="text-xs font-medium mt-1">
                {event.pourcentageTemps}%
              </div>
            </div>
            <div className="text-center">
              <Badge 
                className="text-xs"
                style={{
                  backgroundColor: getEventStatusConfig(event.status).bgColor,
                  color: getEventStatusConfig(event.status).color,
                }}
              >
                {getEventStatusConfig(event.status).label.substring(0, 3)}
              </Badge>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="w-80 border-l bg-background flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t('planning.eventDetails.title')}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Contenu principal */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {event ? (
              <div className="space-y-6">
                {/* En-tête de l'événement */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {event.resourceType === 'salarie' ? (
                          <User className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Truck className="h-5 w-5 text-orange-500" />
                        )}
                        <Badge 
                          style={{
                            backgroundColor: getEventStatusConfig(event.status).bgColor,
                            color: getEventStatusConfig(event.status).color,
                          }}
                        >
                          {getEventStatusConfig(event.status).label}
                        </Badge>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={startEdit}
                          disabled={isEditing}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDeleteDialog(true)}
                          disabled={isEditing}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Titre */}
                    {isEditing ? (
                      <EditableTextField
                        label={t('planning.eventDetails.eventTitle')}
                        value={editingData.title || ''}
                        onChange={(value) => updateField('title', value)}
                        icon={<FileText className="h-4 w-4" />}
                        placeholder={t('planning.eventDetails.enterTitle')}
                      />
                    ) : (
                      <ReadOnlyField
                        label={t('planning.eventDetails.eventTitle')}
                        value={<h3 className="text-lg font-semibold">{event.title}</h3>}
                        icon={<FileText className="h-4 w-4" />}
                      />
                    )}

                    <Separator />

                    {/* Détails de la ressource */}
                    <ReadOnlyField
                      label={t('planning.eventDetails.resource')}
                      value={
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{event.resource.nom}</span>
                          <Badge variant="outline">
                            {RESOURCE_TYPES[event.resourceType].label}
                          </Badge>
                        </div>
                      }
                      icon={event.resourceType === 'salarie' ? <User className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                    />

                    {/* Chantier */}
                    <ReadOnlyField
                      label={t('planning.eventDetails.worksite')}
                      value={event.chantierNom}
                      icon={<Building className="h-4 w-4" />}
                    />
                  </CardContent>
                </Card>

                {/* Détails temporels */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-base">
                      <Calendar className="h-4 w-4 mr-2" />
                      {t('planning.eventDetails.timing')}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <ReadOnlyField
                        label={t('planning.eventDetails.start')}
                        value={moment(event.start).format('DD/MM/YYYY HH:mm')}
                        icon={<Clock className="h-4 w-4" />}
                      />
                      <ReadOnlyField
                        label={t('planning.eventDetails.end')}
                        value={moment(event.end).format('DD/MM/YYYY HH:mm')}
                        icon={<Clock className="h-4 w-4" />}
                      />
                    </div>

                    <ReadOnlyField
                      label={t('planning.eventDetails.duration')}
                      value={`${duration.toFixed(1)}h`}
                    />

                    {/* Pourcentage de temps */}
                    {isEditing ? (
                      <div className="space-y-1">
                        <Label className="flex items-center text-sm text-muted-foreground">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {t('planning.eventDetails.timePercentage')}:
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            min="0"
                            max="200"
                            value={editingData.pourcentageTemps || 0}
                            onChange={(e) => updateField('pourcentageTemps', parseInt(e.target.value))}
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      </div>
                    ) : (
                      <ReadOnlyField
                        label={t('planning.eventDetails.timePercentage')}
                        value={
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${
                              event.pourcentageTemps > 100 ? 'text-red-600' : 
                              event.pourcentageTemps > 80 ? 'text-orange-600' : 'text-green-600'
                            }`}>
                              {event.pourcentageTemps}%
                            </span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-24">
                              <div 
                                className={`h-2 rounded-full ${
                                  event.pourcentageTemps > 100 ? 'bg-red-500' : 
                                  event.pourcentageTemps > 80 ? 'bg-orange-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(event.pourcentageTemps, 100)}%` }}
                              />
                            </div>
                          </div>
                        }
                        icon={<AlertTriangle className="h-4 w-4" />}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Statut et notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {t('planning.eventDetails.additionalInfo')}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Statut */}
                    {isEditing ? (
                      <div className="space-y-1">
                        <Label className="text-sm text-muted-foreground">
                          {t('planning.eventDetails.status')}:
                        </Label>
                        <Select
                          value={editingData.status || event.status}
                          onValueChange={(value) => updateField('status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
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
                      </div>
                    ) : (
                      <ReadOnlyField
                        label={t('planning.eventDetails.status')}
                        value={
                          <Badge 
                            style={{
                              backgroundColor: getEventStatusConfig(event.status).bgColor,
                              color: getEventStatusConfig(event.status).color,
                            }}
                          >
                            {getEventStatusConfig(event.status).label}
                          </Badge>
                        }
                      />
                    )}

                    {/* Notes */}
                    {isEditing ? (
                      <EditableTextField
                        label={t('planning.eventDetails.notes')}
                        value={editingData.notes || ''}
                        onChange={(value) => updateField('notes', value)}
                        icon={<FileText className="h-4 w-4" />}
                        multiline
                        placeholder={t('planning.eventDetails.enterNotes')}
                      />
                    ) : (
                      <ReadOnlyField
                        label={t('planning.eventDetails.notes')}
                        value={event.notes || t('planning.eventDetails.noNotes')}
                        icon={<FileText className="h-4 w-4" />}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Métadonnées */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-base">
                      <History className="h-4 w-4 mr-2" />
                      {t('planning.eventDetails.history')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EventMetadata event={event} />
                  </CardContent>
                </Card>

                {/* Boutons d'action en mode édition */}
                {isEditing && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={saveEdit}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      {isSaving ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{t('planning.eventDetails.saving')}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Save className="h-4 w-4" />
                          <span>{t('planning.eventDetails.save')}</span>
                        </div>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={cancelEdit}
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Bouton d'édition complète */}
                {!isEditing && onEdit && (
                  <Button
                    onClick={() => onEdit(event)}
                    variant="outline"
                    className="w-full"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    {t('planning.eventDetails.editComplete')}
                  </Button>
                )}
              </div>
            ) : (
              /* État vide - aucun événement sélectionné */
              <div className="text-center py-12 text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">{t('planning.eventDetails.noSelection')}</h3>
                <p className="text-sm">{t('planning.eventDetails.selectEventPrompt')}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>{t('planning.eventDetails.confirmDelete')}</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('planning.eventDetails.deleteWarning', { title: event?.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t('planning.eventDetails.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('planning.eventDetails.deleting')}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Trash2 className="h-4 w-4" />
                  <span>{t('planning.eventDetails.delete')}</span>
                </div>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog d'affectation (future amélioration) */}
      <Dialog open={showAffectationDialog} onOpenChange={setShowAffectationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('planning.eventDetails.editAffectation')}</DialogTitle>
            <DialogDescription>
              {t('planning.eventDetails.editAffectationDescription')}
            </DialogDescription>
          </DialogHeader>
          {/* TODO: Implémenter le contenu du dialog d'affectation */}
          <div className="text-center py-8 text-muted-foreground">
            <p>{t('planning.eventDetails.comingSoon')}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}