import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Truck } from "lucide-react";
import type { Equipement, Chantier, InsertAffectationEquipement } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface AffectationEquipementDialogProps {
  equipement: Equipement;
  chantiers: Chantier[];
  trigger?: React.ReactNode;
}

export default function AffectationEquipementDialog({ 
  equipement, 
  chantiers, 
  trigger 
}: AffectationEquipementDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    chantierId: "",
    dateDebut: "",
    dateFin: "",
    notes: "",
  });

  const createAffectationMutation = useMutation({
    mutationFn: async (data: InsertAffectationEquipement) => {
      const response = await fetch("/api/affectations/equipements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de l'affectation");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/affectations/equipements"] });
      setOpen(false);
      setFormData({
        chantierId: "",
        dateDebut: "",
        dateFin: "",
        notes: "",
      });
      toast({
        title: "Succès",
        description: `${equipement.nom} a été affecté au chantier`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.chantierId || !formData.dateDebut || !formData.dateFin) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    if (new Date(formData.dateFin) <= new Date(formData.dateDebut)) {
      toast({
        title: "Erreur",
        description: "La date de fin doit être postérieure à la date de début",
        variant: "destructive",
      });
      return;
    }

    createAffectationMutation.mutate({
      chantierId: formData.chantierId,
      equipementId: equipement.id,
      dateDebut: formData.dateDebut,
      dateFin: formData.dateFin,
      notes: formData.notes || undefined,
    });
  };

  const selectedChantier = chantiers.find(c => c.id === formData.chantierId);

  const chantiersActifs = chantiers.filter(c => 
    c.statut !== "termine" && c.statut !== "annule"
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <Truck className="mr-2 h-4 w-4" />
            Affecter
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Affecter un équipement au chantier
            </DialogTitle>
            <DialogDescription>
              Créer une nouvelle affectation pour {equipement.nom}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Informations de l'équipement */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Équipement sélectionné</Label>
              <div className="p-3 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{equipement.nom}</p>
                    <p className="text-sm text-muted-foreground">{equipement.modele}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {equipement.categorie}
                      </Badge>
                      {equipement.immatriculation && (
                        <Badge variant="outline" className="text-xs">
                          {equipement.immatriculation}
                        </Badge>
                      )}
                      {equipement.coutUsage1hLei && (
                        <Badge variant="outline" className="text-xs">
                          {equipement.coutUsage1hLei} Lei/h
                        </Badge>
                      )}
                      <Badge variant={equipement.statut === "disponible" ? "default" : "secondary"} className="text-xs">
                        {equipement.statut}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sélection du chantier */}
            <div className="space-y-2">
              <Label htmlFor="chantier">Chantier *</Label>
              <Select
                value={formData.chantierId}
                onValueChange={(value) => setFormData({ ...formData, chantierId: value })}
                required
              >
                <SelectTrigger id="chantier">
                  <SelectValue placeholder="Sélectionner un chantier" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {chantiersActifs.map((chantier) => (
                    <SelectItem key={chantier.id} value={chantier.id}>
                      <div className="flex items-center gap-2">
                        <span>{chantier.nom}</span>
                        {chantier.codeProjet && (
                          <Badge variant="outline" className="text-xs">
                            {chantier.codeProjet}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedChantier && (
                <div className="p-3 border rounded-lg bg-blue-50/50 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-900">{selectedChantier.nom}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {selectedChantier.statut}
                        </Badge>
                        {selectedChantier.beneficiaire && (
                          <Badge variant="outline" className="text-xs">
                            {selectedChantier.beneficiaire}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Période d'affectation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateDebut" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date de début *
                </Label>
                <Input
                  id="dateDebut"
                  type="date"
                  value={formData.dateDebut}
                  onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFin" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date de fin *
                </Label>
                <Input
                  id="dateFin"
                  type="date"
                  value={formData.dateFin}
                  onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                  min={formData.dateDebut}
                  required
                />
              </div>
            </div>

            {/* Coûts estimés */}
            {equipement.coutUsage1hLei && formData.dateDebut && formData.dateFin && (
              <div className="p-3 border rounded-lg bg-yellow-50/50 border-yellow-200">
                <Label className="text-sm font-medium text-yellow-800">Estimation de coût</Label>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Coût horaire : {equipement.coutUsage1hLei} Lei/h</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Le coût total dépendra du nombre d'heures d'utilisation effective
                  </p>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Informations complémentaires sur cette affectation (utilisation prévue, restrictions, etc.)..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={createAffectationMutation.isPending}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={createAffectationMutation.isPending}
            >
              {createAffectationMutation.isPending ? "Affectation..." : "Affecter au chantier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}