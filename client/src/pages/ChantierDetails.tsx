import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ChantierDetailsResponse {
  chantier: {
    id: string;
    codeProjet?: string;
    name: string;
    beneficiaire?: string;
    status: string;
    dateDebut?: string;
    dateFin?: string;
    budget: number;
    budgetReel: number;
  };
  responsable?: {
    nom: string;
    prenom: string;
  };
  budget: {
    prevu: {
      total: number;
      mainDoeuvre: number;
      materiaux: number;
      equipement: number;
    };
    reel: {
      total: number;
      mainDoeuvre: number;
      materiaux: number;
      equipement: number;
    };
    ecarts: {
      total: number;
      mainDoeuvre: number;
      materiaux: number;
      equipement: number;
      pourcentageRealise: number;
    };
  };
  affectationsSalaries: Array<{
    id: string;
    salarieNom: string;
    salariePrenom: string;
    dateDebut?: string;
    dateFin?: string;
    heuresParJour?: string;
    tauxHoraire?: string;
    coutEstime: number;
    notes?: string;
  }>;
  affectationsEquipements: Array<{
    id: string;
    equipementNom: string;
    modele?: string;
    dateDebut?: string;
    dateFin?: string;
    coutJournalier?: string;
    coutEstime: number;
    notes?: string;
  }>;
  etapes: Array<{
    id: string;
    nom: string;
    dateDebut?: string;
    dateFin?: string;
    statut: string;
    progression: number;
    ordre: number;
  }>;
  documents: Array<{
    id: string;
    nom: string;
    categorie: string;
    tailleFichier?: number;
    cheminFichier?: string;
    uploadePar?: string;
    dateUpload?: string;
  }>;
  couts: {
    salaries: number;
    equipements: number;
  };
  completude: {
    hasResponsable: boolean;
    hasBudget: boolean;
    hasSalaries: boolean;
    hasEquipements: boolean;
    hasEtapes: boolean;
    hasDocuments: boolean;
    score: number;
  };
}

export default function ChantierDetails() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/chantiers/:id");

  const { data, isLoading, error } = useQuery<ChantierDetailsResponse>({
    queryKey: ["/api/chantiers", params?.id, "details"],
    enabled: !!params?.id,
  });

  if (!match || !params?.id) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/chantiers")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t("common.loading")}</h1>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/chantiers")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-destructive">Error loading project</h1>
          </div>
        </div>
      </div>
    );
  }

  const { chantier, responsable } = data;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/chantiers")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold" data-testid="text-chantier-name">{chantier.name}</h1>
            {chantier.codeProjet && (
              <span className="text-sm font-mono text-muted-foreground" data-testid="text-code-projet">
                {chantier.codeProjet}
              </span>
            )}
          </div>
          {chantier.beneficiaire && (
            <p className="text-muted-foreground" data-testid="text-beneficiaire">
              {t("chantiers.beneficiary")}: {chantier.beneficiaire}
            </p>
          )}
          {responsable && (
            <p className="text-sm text-muted-foreground" data-testid="text-responsable">
              {t("chantiers.projectManager")}: {responsable.prenom} {responsable.nom}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">{t("chantiers.overview")}</TabsTrigger>
          <TabsTrigger value="planning" data-testid="tab-planning">{t("chantiers.planning")}</TabsTrigger>
          <TabsTrigger value="phases" data-testid="tab-phases">{t("chantiers.phases")}</TabsTrigger>
          <TabsTrigger value="documents" data-testid="tab-documents">{t("chantiers.documents")}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("chantiers.projectInfo")}</CardTitle>
              <CardDescription>{t("chantiers.overview")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t("common.inDevelopment")}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Planning Tab */}
        <TabsContent value="planning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("chantiers.employeeAssignments")}</CardTitle>
              <CardDescription>{t("chantiers.planning")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t("common.inDevelopment")}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Phases Tab */}
        <TabsContent value="phases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("chantiers.phases")}</CardTitle>
              <CardDescription>{t("chantiers.phaseDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t("common.inDevelopment")}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("chantiers.documents")}</CardTitle>
              <CardDescription>{t("chantiers.documentDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t("common.inDevelopment")}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
