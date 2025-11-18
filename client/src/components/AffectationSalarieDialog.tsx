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
import { Calendar, Clock, Users } from "lucide-react";
import type { Salarie, Chantier, InsertAffectationSalarie } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface AffectationSalarieDialogProps {
  salarie: Salarie;
  chantiers: Chantier[];
  trigger?: React.ReactNode;
}

export default function AffectationSalarieDialog({ 
  salarie, 
  chantiers, 
  trigger 
}: AffectationSalarieDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    chantierId: "",
    dateDebut: "",
    dateFin: "",
    heuresParJour: "8.00",
    notes: "",
  });

  const createAffectationMutation = useMutation({
    mutationFn: async (data: InsertAffectationSalarie) => {
      const response = await fetch("/api/affectations/salaries", {
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
      queryClient.invalidateQueries({ queryKey: ["/api/affectations/salaries"] });
      setOpen(false);
      setFormData({
        chantierId: "",
        dateDebut: "",
        dateFin: "",
        heuresParJour: "8.00",
        notes: "",
      });
      toast({
        title: "Succès",
        description: `${salarie.prenom} ${salarie.nom} a été affecté(e) au chantier`,
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
      salarieId: salarie.id,
      dateDebut: formData.dateDebut,
      dateFin: formData.dateFin,
      heuresParJour: formData.heuresParJour,
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
            <Users className="mr-2 h-4 w-4" />
            Affecter
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Affecter un salarié au chantier
            </DialogTitle>
            <DialogDescription>
              Créer une nouvelle affectation pour {salarie.prenom} {salarie.nom}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Informations du salarié */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Salarié sélectionné</Label>
              <div className="p-3 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{salarie.prenom} {salarie.nom}</p>
                    <p className="text-sm text-muted-foreground">{salarie.poste}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {salarie.services}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {salarie.coastCenter}
                      </Badge>
                      {salarie.tauxHoraire && (
                        <Badge variant="outline" className="text-xs">
                          {salarie.tauxHoraire} Lei/h
                        </Badge>
                      )}
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

            {/* Heures par jour */}
            <div className="space-y-2">
              <Label htmlFor="heuresParJour" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Heures par jour
              </Label>
              <Select
                value={formData.heuresParJour}
                onValueChange={(value) => setFormData({ ...formData, heuresParJour: value })}
              >
                <SelectTrigger id="heuresParJour">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4.00">4h (Mi-temps)</SelectItem>
                  <SelectItem value="6.00">6h</SelectItem>
                  <SelectItem value="8.00">8h (Temps plein)</SelectItem>
                  <SelectItem value="10.00">10h (Heures supplémentaires)</SelectItem>
                  <SelectItem value="12.00">12h (Double équipe)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Informations complémentaires sur cette affectation..."
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