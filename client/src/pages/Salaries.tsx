import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download, Users, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Salarie, InsertSalarie } from "@shared/schema";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSalarieSchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const editSalarieSchema = insertSalarieSchema.partial().extend({
  id: z.string(),
});

export default function Salaries() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [coastCenterFilter, setCoastCenterFilter] = useState<string>("all");
  const [editingSalarie, setEditingSalarie] = useState<Salarie | null>(null);

  const { data: salaries, isLoading } = useQuery<Salarie[]>({
    queryKey: ["/api/salaries"],
  });

  const form = useForm<z.infer<typeof editSalarieSchema>>({
    resolver: zodResolver(editSalarieSchema),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<InsertSalarie> }) => {
      return await apiRequest("PATCH", `/api/salaries/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/salaries"] });
      toast({
        title: t('achats.success'),
        description: t('salaries.employeeUpdated'),
      });
      setEditingSalarie(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: t('achats.error'),
        description: t('salaries.errorUpdating'),
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "disponible":
        return <Badge variant="default" className="bg-green-600">{t('salaries.statusAvailable')}</Badge>;
      case "affecte":
        return <Badge variant="secondary">{t('salaries.statusAssigned')}</Badge>;
      case "conge":
        return <Badge variant="outline" className="border-orange-600 text-orange-600">{t('salaries.statusLeave')}</Badge>;
      default:
        return <Badge>{statut}</Badge>;
    }
  };

  const handleEdit = (salarie: Salarie) => {
    setEditingSalarie(salarie);
    form.reset({
      id: salarie.id,
      nom: salarie.nom,
      prenom: salarie.prenom,
      poste: salarie.poste,
      telephone: salarie.telephone || "",
      email: salarie.email || "",
      statut: salarie.statut,
      tauxHoraire: salarie.tauxHoraire || "",
      coastCenter: salarie.coastCenter || "",
      division: salarie.division || "",
      services: salarie.services || "",
      codeFonction: salarie.codeFonction || "",
      inNum: salarie.inNum || "",
      salaryMonth: salarie.salaryMonth || "",
      acordSup: salarie.acordSup || "",
    });
  };

  const onSubmit = (data: z.infer<typeof editSalarieSchema>) => {
    const { id, ...updates } = data;
    if (id) {
      updateMutation.mutate({ id, updates });
    }
  };

  // Get unique values for filters
  const divisions = Array.from(new Set(salaries?.map(s => s.division).filter(Boolean))) as string[];
  const services = Array.from(new Set(salaries?.map(s => s.services).filter(Boolean))) as string[];
  const coastCenters = Array.from(new Set(salaries?.map(s => s.coastCenter).filter(Boolean))) as string[];

  // Filter salaries
  const filteredSalaries = salaries?.filter(salarie => {
    const matchesSearch = searchQuery === "" || 
      `${salarie.nom} ${salarie.prenom}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      salarie.poste.toLowerCase().includes(searchQuery.toLowerCase()) ||
      salarie.inNum?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDivision = divisionFilter === "all" || salarie.division === divisionFilter;
    const matchesService = serviceFilter === "all" || salarie.services === serviceFilter;
    const matchesCoastCenter = coastCenterFilter === "all" || salarie.coastCenter === coastCenterFilter;

    return matchesSearch && matchesDivision && matchesService && matchesCoastCenter;
  }) || [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const salariesDisponibles = salaries?.filter(s => s.statut === "disponible").length || 0;
  const salariesAffectes = salaries?.filter(s => s.statut === "affecte").length || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t('salaries.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('salaries.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button data-testid="button-nouveau-salarie">
            <Plus className="h-4 w-4 mr-2" />
            {t('salaries.newEmployee')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('salaries.totalEmployees')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salaries?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('salaries.available')}</CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-600"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salariesDisponibles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('salaries.assigned')}</CardTitle>
            <div className="h-2 w-2 rounded-full bg-blue-600"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salariesAffectes}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <CardTitle>{t('salaries.employeeList')}</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder={t('salaries.searchPlaceholder')}
                    className="pl-10 w-[300px]"
                    data-testid="input-recherche-salarie"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm" data-testid="button-exporter">
                  <Download className="h-4 w-4 mr-2" />
                  {t('common.export')}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t('salaries.filterBy')}</span>
              
              <Select value={divisionFilter} onValueChange={setDivisionFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-division">
                  <SelectValue placeholder={t('salaries.division')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('salaries.allDivisions')}</SelectItem>
                  {divisions.map(div => (
                    <SelectItem key={div} value={div}>{div}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-service">
                  <SelectValue placeholder={t('salaries.service')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('salaries.allServices')}</SelectItem>
                  {services.map(svc => (
                    <SelectItem key={svc} value={svc}>{svc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={coastCenterFilter} onValueChange={setCoastCenterFilter}>
                <SelectTrigger className="w-[200px]" data-testid="select-coast-center">
                  <SelectValue placeholder={t('salaries.costCenter')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('salaries.allCostCenters')}</SelectItem>
                  {coastCenters.map(cc => (
                    <SelectItem key={cc} value={cc}>{cc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(divisionFilter !== "all" || serviceFilter !== "all" || coastCenterFilter !== "all") && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setDivisionFilter("all");
                    setServiceFilter("all");
                    setCoastCenterFilter("all");
                  }}
                  data-testid="button-clear-filters"
                >
                  {t('salaries.resetFilters')}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">{t('salaries.name')}</th>
                  <th className="text-left p-3 font-medium">{t('salaries.function')}</th>
                  <th className="text-left p-3 font-medium">{t('salaries.division')}</th>
                  <th className="text-left p-3 font-medium">{t('salaries.service')}</th>
                  <th className="text-left p-3 font-medium">{t('salaries.costCenter')}</th>
                  <th className="text-left p-3 font-medium">{t('salaries.hourlyRate')}</th>
                  <th className="text-left p-3 font-medium">{t('salaries.status')}</th>
                  <th className="text-left p-3 font-medium">{t('salaries.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredSalaries.map((salarie) => (
                  <tr key={salarie.id} className="border-b hover-elevate" data-testid={`salarie-row-${salarie.id}`}>
                    <td className="p-3">
                      <div className="font-medium">{salarie.nom} {salarie.prenom}</div>
                      {salarie.inNum && <div className="text-xs text-muted-foreground font-mono">{salarie.inNum}</div>}
                    </td>
                    <td className="p-3 text-sm">
                      <div>{salarie.poste}</div>
                      {salarie.codeFonction && <div className="text-xs text-muted-foreground">{salarie.codeFonction}</div>}
                    </td>
                    <td className="p-3 text-sm">{salarie.division || <span className="text-muted-foreground">-</span>}</td>
                    <td className="p-3 text-sm">{salarie.services || <span className="text-muted-foreground">-</span>}</td>
                    <td className="p-3 text-sm text-muted-foreground">{salarie.coastCenter || "-"}</td>
                    <td className="p-3 text-sm font-mono">
                      {salarie.tauxHoraire ? formatCurrency(parseFloat(salarie.tauxHoraire)) : "-"}
                    </td>
                    <td className="p-3">{getStatutBadge(salarie.statut)}</td>
                    <td className="p-3">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(salarie)}
                        data-testid={`button-edit-${salarie.id}`}
                      >
                        {t('salaries.edit')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredSalaries.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Aucun salarié trouvé</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery || divisionFilter !== "all" || serviceFilter !== "all" || coastCenterFilter !== "all"
                  ? "Essayez de modifier vos filtres ou votre recherche"
                  : "Commencez par ajouter votre premier salarié"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingSalarie} onOpenChange={(open) => !open && setEditingSalarie(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('salaries.editEmployee')}</DialogTitle>
            <DialogDescription>
              {t('salaries.editDescription')} {editingSalarie?.nom} {editingSalarie?.prenom}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <input type="hidden" {...form.register("id")} />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('salaries.name')}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-nom" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prenom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('salaries.firstName')}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-prenom" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="poste"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('salaries.function')}</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-poste" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="division"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('salaries.division')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} data-testid="input-division" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="services"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('salaries.service')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} data-testid="input-services" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="coastCenter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('salaries.costCenter')}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} data-testid="input-coast-center" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tauxHoraire"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('salaries.hourlyRate')} (€)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          {...field} 
                          value={field.value || ""} 
                          data-testid="input-taux-horaire" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('salaries.monthlySalary')} (€)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          {...field} 
                          value={field.value || ""} 
                          data-testid="input-salary-month" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="statut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('salaries.status')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-statut">
                          <SelectValue placeholder={t('salaries.status')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="disponible">{t('salaries.statusAvailable')}</SelectItem>
                        <SelectItem value="affecte">{t('salaries.statusAssigned')}</SelectItem>
                        <SelectItem value="conge">{t('salaries.statusLeave')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="telephone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('salaries.phone')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} data-testid="input-telephone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('salaries.email')}</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} value={field.value || ""} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingSalarie(null)}
                  data-testid="button-cancel"
                >
                  {t('common.cancel')}
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  data-testid="button-save"
                >
                  {updateMutation.isPending ? t('common.loading') : t('salaries.saveChanges')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
