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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertEquipementSchema } from "@shared/schema";
import type { Equipement, Salarie } from "@shared/schema";

const editEquipmentFormSchema = insertEquipementSchema.partial().extend({
  year: z.union([z.string(), z.number()]).optional(),
  hourlyRate: z.string().optional(),
  fuelConsumption: z.string().optional(),
  maintenanceCost: z.string().optional(),
});

type EditEquipmentFormValues = z.infer<typeof editEquipmentFormSchema>;

interface EditEquipmentDialogProps {
  equipment: Equipement;
  children?: React.ReactNode;
}

export default function EditEquipmentDialog({ equipment, children }: EditEquipmentDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const { data: salaries = [] } = useQuery<Salarie[]>({
    queryKey: ['/api/salaries'],
    enabled: open,
  });

  const form = useForm<EditEquipmentFormValues>({
    resolver: zodResolver(editEquipmentFormSchema),
    defaultValues: {
      modele: equipment.modele ?? "",
      year: equipment.year?.toString() ?? "",
      immatriculation: equipment.immatriculation ?? "",
      fuelType: equipment.fuelType ?? "",
      operatorId: equipment.operatorId ?? "",
      hourlyRate: equipment.hourlyRate?.toString() ?? "",
      fuelConsumption: equipment.fuelConsumption?.toString() ?? "",
      maintenanceCost: equipment.maintenanceCost?.toString() ?? "",
      statut: equipment.statut ?? "disponible",
      categorie: equipment.categorie ?? "",
    },
  });

  const updateEquipmentMutation = useMutation({
    mutationFn: async (data: EditEquipmentFormValues) => {
      const submitData: any = {
        modele: data.modele || null,
        year: data.year ? parseInt(data.year.toString()) : null,
        immatriculation: data.immatriculation || null,
        fuelType: data.fuelType || null,
        operatorId: data.operatorId || null,
        hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate.toString()) : null,
        fuelConsumption: data.fuelConsumption ? parseFloat(data.fuelConsumption.toString()) : null,
        maintenanceCost: data.maintenanceCost ? parseFloat(data.maintenanceCost.toString()) : null,
        statut: data.statut,
        categorie: data.categorie || null,
      };
      
      if (data.operatorId) {
        const selectedSalarie = salaries.find(s => s.id === data.operatorId);
        if (selectedSalarie) {
          submitData.operatorName = `${selectedSalarie.nom} ${selectedSalarie.prenom}`;
        }
      } else {
        submitData.operatorName = null;
      }

      return apiRequest('PATCH', `/api/equipements/${equipment.id}`, submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/equipements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/equipements/stats-by-category'] });
      toast({
        title: t('common.success'),
        description: t('equipements.editSuccess'),
      });
      setOpen(false);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: t('equipements.editError'),
      });
    },
  });

  const onSubmit = (data: EditEquipmentFormValues) => {
    updateEquipmentMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" data-testid={`button-edit-${equipment.id}`}>
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{t('equipements.editTitle')}</DialogTitle>
              <DialogDescription>
                {t('equipements.editDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <FormField
                control={form.control}
                name="modele"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('equipements.model')}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} data-testid="input-modele" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('equipements.year')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        data-testid="input-year"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="immatriculation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('equipements.plateNumber')}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} data-testid="input-immatriculation" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fuelType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('equipements.fuelType')}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} data-testid="input-fuel-type" placeholder="Diesel, Essence..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="operatorId"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>{t('equipements.driver')}</FormLabel>
                    <Select
                      value={field.value || ""}
                      onValueChange={(value) => field.onChange(value || null)}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-operator">
                          <SelectValue placeholder={t('equipements.selectDriver')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">{t('equipements.noDriver')}</SelectItem>
                        {salaries.map((salarie) => (
                          <SelectItem key={salarie.id} value={salarie.id}>
                            {salarie.nom} {salarie.prenom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('equipements.hourlyRate')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        {...field} 
                        data-testid="input-hourly-rate"
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fuelConsumption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('equipements.fuelConsumption')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        {...field} 
                        data-testid="input-fuel-consumption"
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maintenanceCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('equipements.maintenanceCost')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        {...field} 
                        data-testid="input-maintenance-cost"
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="statut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('equipements.status')}</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="disponible">{t('equipements.available')}</SelectItem>
                        <SelectItem value="en_service">{t('equipements.inService')}</SelectItem>
                        <SelectItem value="maintenance">{t('equipements.maintenance')}</SelectItem>
                        <SelectItem value="hors_service">{t('equipements.outOfService')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                data-testid="button-cancel-edit"
              >
                {t('common.cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={updateEquipmentMutation.isPending}
                data-testid="button-save-edit"
              >
                {updateEquipmentMutation.isPending ? t('common.loading') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
