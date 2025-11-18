import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Button,
} from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DisponibiliteBadge } from "./PlanDeChargeTable";
import { GripVertical, User, Truck, Building, MapPin } from "lucide-react";

interface AffectationItem {
  id: string;
  nom: string;
  type: 'salarie' | 'engin' | 'usine';
  disponible: boolean;
  details?: any;
}

interface Destination {
  id: string;
  nom: string;
  type: 'chantier' | 'usine';
  localisation?: string;
  affectations?: AffectationItem[];
}

interface AffectationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemToAffect?: any;
  destinations: Destination[];
  availableItems: AffectationItem[];
  onConfirm: (destinationId: string, items: AffectationItem[]) => void;
}

function SortableItem({ id, item }: { id: string; item: AffectationItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getIcon = () => {
    switch (item.type) {
      case 'salarie': return <User className="h-4 w-4" />;
      case 'engin': return <Truck className="h-4 w-4" />;
      case 'usine': return <Building className="h-4 w-4" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        flex items-center justify-between p-3 bg-white rounded-md border shadow-sm cursor-move
        ${isDragging ? 'opacity-50' : 'hover:shadow-md'}
      `}
    >
      <div className="flex items-center space-x-2">
        <GripVertical className="h-4 w-4 text-gray-400" />
        {getIcon()}
        <span className="font-medium">{item.nom}</span>
      </div>
      <div className="flex items-center space-x-2">
        <DisponibiliteBadge disponible={item.disponible} />
        <Badge variant="outline">{item.type}</Badge>
      </div>
    </div>
  );
}

function DropZone({ 
  destination, 
  items, 
  onDrop 
}: { 
  destination: Destination; 
  items: AffectationItem[];
  onDrop: (destinationId: string, items: AffectationItem[]) => void;
}) {
  return (
    <Card className="w-full min-h-[200px]">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>{destination.nom}</span>
          <Badge variant="secondary">{destination.type}</Badge>
        </CardTitle>
        {destination.localisation && (
          <p className="text-sm text-muted-foreground">{destination.localisation}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm font-medium text-gray-700">
          Affectations actuelles ({items.length})
        </div>
        <div className="space-y-2 min-h-[100px] p-2 border-2 border-dashed border-gray-200 rounded-md">
          {items.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              Glissez des ressources ici
            </div>
          ) : (
            <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
              {items.map((item) => (
                <SortableItem key={item.id} id={item.id} item={item} />
              ))}
            </SortableContext>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function AffectationModal({
  open,
  onOpenChange,
  itemToAffect,
  destinations,
  availableItems,
  onConfirm
}: AffectationModalProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [affectations, setAffectations] = useState<Record<string, AffectationItem[]>>(() => {
    const initial: Record<string, AffectationItem[]> = {};
    destinations.forEach(dest => {
      initial[dest.id] = dest.affectations || [];
    });
    return initial;
  });
  const [disponibles, setDisponibles] = useState<AffectationItem[]>(availableItems);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Trouver l'item qui est déplacé
    let movedItem: AffectationItem | undefined;
    let sourceContainer: string | 'disponibles' = 'disponibles';

    // Chercher dans les disponibles
    movedItem = disponibles.find(item => item.id === activeId);
    
    // Chercher dans les affectations
    if (!movedItem) {
      Object.keys(affectations).forEach(destId => {
        const item = affectations[destId].find(item => item.id === activeId);
        if (item) {
          movedItem = item;
          sourceContainer = destId;
        }
      });
    }

    if (!movedItem) return;

    // Déterminer la destination
    let targetContainer: string | 'disponibles' = 'disponibles';
    
    // Si c'est droppé sur une destination
    if (destinations.find(dest => dest.id === overId)) {
      targetContainer = overId;
    }
    // Si c'est droppé sur un item dans une destination
    else {
      Object.keys(affectations).forEach(destId => {
        if (affectations[destId].find(item => item.id === overId)) {
          targetContainer = destId;
        }
      });
    }

    // Effectuer le déplacement
    if (sourceContainer === targetContainer) return;

    setAffectations(prev => {
      const newAffectations = { ...prev };
      
      // Retirer de la source
      if (sourceContainer !== 'disponibles') {
        newAffectations[sourceContainer] = newAffectations[sourceContainer].filter(
          item => item.id !== activeId
        );
      }
      
      // Ajouter à la destination
      if (targetContainer !== 'disponibles') {
        newAffectations[targetContainer] = [...newAffectations[targetContainer], movedItem!];
      }
      
      return newAffectations;
    });

    // Mettre à jour les disponibles
    if (sourceContainer === 'disponibles' && targetContainer !== 'disponibles') {
      setDisponibles(prev => prev.filter(item => item.id !== activeId));
    } else if (sourceContainer !== 'disponibles' && targetContainer === 'disponibles') {
      setDisponibles(prev => [...prev, movedItem!]);
    }
  };

  const handleConfirm = () => {
    // Logique de confirmation avec toutes les affectations
    Object.keys(affectations).forEach(destinationId => {
      if (affectations[destinationId].length > 0) {
        onConfirm(destinationId, affectations[destinationId]);
      }
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Affecter les ressources</DialogTitle>
          <DialogDescription>
            Glissez et déposez les ressources (salariés, engins, usines) vers leurs destinations.
          </DialogDescription>
        </DialogHeader>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Zone des ressources disponibles */}
            <div className="space-y-4">
              <h3 className="font-semibold">Ressources disponibles</h3>
              <Card>
                <CardContent className="p-4 space-y-2">
                  <SortableContext items={disponibles.map(item => item.id)} strategy={verticalListSortingStrategy}>
                    {disponibles.map((item) => (
                      <SortableItem key={item.id} id={item.id} item={item} />
                    ))}
                  </SortableContext>
                  {disponibles.length === 0 && (
                    <div className="text-center text-gray-400 py-8">
                      Aucune ressource disponible
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Zones de destination */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-semibold">Destinations</h3>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {destinations.map((destination) => (
                  <DropZone
                    key={destination.id}
                    destination={destination}
                    items={affectations[destination.id] || []}
                    onDrop={(destId, items) => {
                      setAffectations(prev => ({
                        ...prev,
                        [destId]: items
                      }));
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="p-3 bg-white rounded-md border shadow-lg">
                {/* Affichage de l'item en cours de déplacement */}
                <div className="flex items-center space-x-2">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <span>Item en cours de déplacement...</span>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleConfirm}>
            Confirmer les affectations
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}