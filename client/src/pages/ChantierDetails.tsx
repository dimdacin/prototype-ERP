import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ChantierOverview from "@/components/ChantierOverview";

interface ChantierDetailsResponse {
  chantier: {
    id: string;
    codeProjet?: string;
    nom: string;
    beneficiaire?: string;
    statut: string;
    dateDebut?: string;
    dateLimite?: string;
    budgetPrevisionnel?: string;
    budgetRealise?: string;
    budgetMainDoeuvre?: string;
    budgetReelMainDoeuvre?: string;
    budgetMateriaux?: string;
    budgetReelMateriaux?: string;
    budgetEquipement?: string;
    budgetReelEquipement?: string;
  };
  responsable: {
    nom: string;
    prenom: string;
  } | null;
  budgetAnalysis: {
    ecartGlobal: number;
    ecartMainDoeuvre: number;
    ecartMateriaux: number;
    ecartEquipement: number;
    pourcentageRealise: number;
  };
  affectationsSalaries: Array<{
    id: string;
    salarieNom: string;
    salariePrenom: string;
    dateDebut: string;
    dateFin: string;
    heuresParJour: string;
    tauxHoraire: string | null;
    coutEstime: number;
    notes: string | null;
  }>;
  affectationsEquipements: Array<{
    id: string;
    equipementNom: string;
    modele: string | null;
    dateDebut: string;
    dateFin: string;
    coutJournalier: string | null;
    coutEstime: number;
    notes: string | null;
  }>;
  coutsSummary: {
    totalSalaries: number;
    totalEquipements: number;
    totalAffecte: number;
  };
  etapes: Array<{
    id: string;
    nom: string;
    description: string | null;
    dateDebut: string | null;
    dateFin: string | null;
    statut: string;
    progression: number;
    ordre: number;
  }>;
  documents: Array<{
    id: string;
    nom: string;
    categorie: string;
    typeMime: string | null;
    taille: number | null;
    uploadePar: string | null;
    description: string | null;
    createdAt: Date;
  }>;
  completeness: {
    hasResponsable: boolean;
    hasBudgetReel: boolean;
    hasAffectations: boolean;
    hasDates: boolean;
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

  const { chantier, responsable, budgetAnalysis, completeness } = data;

  // Parse budget values from chantier
  const budgetPrevTotal = parseFloat(chantier.budgetPrevisionnel || "0");
  const budgetReelTotal = parseFloat(chantier.budgetRealise || "0");
  const budgetMDOPrev = parseFloat(chantier.budgetMainDoeuvre || "0");
  const budgetMDOReel = parseFloat(chantier.budgetReelMainDoeuvre || "0");
  const budgetMatPrev = parseFloat(chantier.budgetMateriaux || "0");
  const budgetMatReel = parseFloat(chantier.budgetReelMateriaux || "0");
  const budgetEqPrev = parseFloat(chantier.budgetEquipement || "0");
  const budgetEqReel = parseFloat(chantier.budgetReelEquipement || "0");

  // Build budget structure for ChantierOverview
  const budget = {
    prevu: {
      total: budgetPrevTotal,
      mainDoeuvre: budgetMDOPrev,
      materiaux: budgetMatPrev,
      equipement: budgetEqPrev,
    },
    reel: {
      total: budgetReelTotal,
      mainDoeuvre: budgetMDOReel,
      materiaux: budgetMatReel,
      equipement: budgetEqReel,
    },
    ecarts: {
      total: budgetAnalysis.ecartGlobal,
      mainDoeuvre: budgetAnalysis.ecartMainDoeuvre,
      materiaux: budgetAnalysis.ecartMateriaux,
      equipement: budgetAnalysis.ecartEquipement,
      pourcentageRealise: budgetAnalysis.pourcentageRealise,
    },
  };

  // Map completeness to completude (French naming for frontend)
  const completude = {
    hasResponsable: completeness.hasResponsable,
    hasBudget: completeness.hasBudgetReel,
    hasSalaries: completeness.hasAffectations,
    hasEquipements: completeness.hasAffectations,
    hasEtapes: completeness.hasEtapes,
    hasDocuments: completeness.hasDocuments,
    score: completeness.score,
  };

  // Transform chantier data to match ChantierOverview expectations
  const chantierData = {
    codeProjet: chantier.codeProjet,
    name: chantier.nom,
    beneficiaire: chantier.beneficiaire,
    status: chantier.statut,
    dateDebut: chantier.dateDebut,
    dateFin: chantier.dateLimite,
    budget: budgetPrevTotal,
    budgetReel: budgetReelTotal,
  };

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
            <h1 className="text-3xl font-bold" data-testid="text-chantier-name">{chantier.nom}</h1>
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
          <ChantierOverview
            chantier={chantierData}
            responsable={responsable || undefined}
            budget={budget}
            completude={completude}
          />
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
