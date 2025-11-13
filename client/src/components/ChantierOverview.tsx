import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CheckCircle2, XCircle } from "lucide-react";

interface BudgetData {
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
}

interface CompletudeData {
  hasResponsable: boolean;
  hasBudget: boolean;
  hasSalaries: boolean;
  hasEquipements: boolean;
  hasEtapes: boolean;
  hasDocuments: boolean;
  score: number;
}

interface ChantierData {
  codeProjet?: string;
  name: string;
  beneficiaire?: string;
  status: string;
  dateDebut?: string;
  dateFin?: string;
  budget: number;
  budgetReel: number;
}

interface ResponsableData {
  nom: string;
  prenom: string;
}

interface ChantierOverviewProps {
  chantier: ChantierData;
  responsable?: ResponsableData;
  budget: BudgetData;
  completude: CompletudeData;
}

export default function ChantierOverview({ chantier, responsable, budget, completude }: ChantierOverviewProps) {
  const { t, i18n } = useTranslation();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Prepare chart data
  const chartData = [
    {
      category: t('chantiers.labor'),
      [t('dashboard.planned')]: budget.prevu.mainDoeuvre,
      [t('dashboard.actual')]: budget.reel.mainDoeuvre,
    },
    {
      category: t('chantiers.materials'),
      [t('dashboard.planned')]: budget.prevu.materiaux,
      [t('dashboard.actual')]: budget.reel.materiaux,
    },
    {
      category: t('chantiers.equipment'),
      [t('dashboard.planned')]: budget.prevu.equipement,
      [t('dashboard.actual')]: budget.reel.equipement,
    },
  ];

  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    en_cours: { label: t('chantiers.inProgress'), variant: "default" },
    planifie: { label: t('chantiers.planned'), variant: "secondary" },
    termine: { label: t('chantiers.statusCompleted'), variant: "outline" },
    retard: { label: t('chantiers.delayed'), variant: "destructive" },
  };

  const completenessIndicators = [
    { key: 'hasResponsable', label: t('chantiers.hasManager'), value: completude.hasResponsable },
    { key: 'hasBudget', label: t('chantiers.hasBudget'), value: completude.hasBudget },
    { key: 'hasSalaries', label: t('chantiers.hasEmployees'), value: completude.hasSalaries },
    { key: 'hasEquipements', label: t('chantiers.hasEquipment'), value: completude.hasEquipements },
    { key: 'hasEtapes', label: t('chantiers.hasPhases'), value: completude.hasEtapes },
    { key: 'hasDocuments', label: t('chantiers.hasDocuments'), value: completude.hasDocuments },
  ];

  return (
    <div className="space-y-6">
      {/* Project Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('chantiers.projectInfo')}</CardTitle>
          <CardDescription>{t('chantiers.overview')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('chantiers.code')}</p>
              <p className="font-medium font-mono" data-testid="text-code-projet-overview">
                {chantier.codeProjet || t('common.noData')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('chantiers.beneficiary')}</p>
              <p className="font-medium" data-testid="text-beneficiaire-overview">
                {chantier.beneficiaire || t('common.noData')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('chantiers.projectManager')}</p>
              <p className="font-medium" data-testid="text-responsable-overview">
                {responsable ? `${responsable.prenom} ${responsable.nom}` : t('chantiers.notAssigned')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('chantiers.status')}</p>
              <div data-testid="badge-status-overview">
                <Badge variant={statusConfig[chantier.status]?.variant || "default"}>
                  {statusConfig[chantier.status]?.label || chantier.status}
                </Badge>
              </div>
            </div>
            {chantier.dateDebut && (
              <div>
                <p className="text-sm text-muted-foreground">{t('chantiers.startDate')}</p>
                <p className="font-medium" data-testid="text-date-debut">{chantier.dateDebut}</p>
              </div>
            )}
            {chantier.dateFin && (
              <div>
                <p className="text-sm text-muted-foreground">{t('chantiers.endDate')}</p>
                <p className="font-medium" data-testid="text-date-fin">{chantier.dateFin}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Budget Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t('chantiers.budgetBreakdown')}</CardTitle>
          <CardDescription>
            {t('dashboard.planned')} vs {t('dashboard.actual')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="category" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                <Legend />
                <Bar dataKey={t('dashboard.planned')} fill="hsl(var(--chart-1))" />
                <Bar dataKey={t('dashboard.actual')} fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t('chantiers.totalBudget')}</p>
              <p className="text-2xl font-bold" data-testid="text-budget-total">{formatCurrency(budget.prevu.total)}</p>
              <p className="text-sm text-muted-foreground" data-testid="text-budget-reel">
                {t('dashboard.actual')}: {formatCurrency(budget.reel.total)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t('chantiers.budgetVariance')}</p>
              <p
                className={`text-2xl font-bold ${budget.ecarts.total > 0 ? 'text-destructive' : budget.ecarts.total < 0 ? 'text-green-600 dark:text-green-400' : ''}`}
                data-testid="text-budget-ecart"
              >
                {formatCurrency(budget.ecarts.total)}
              </p>
              <p className="text-sm text-muted-foreground">
                {budget.ecarts.total > 0 ? '+' : ''}{((budget.ecarts.total / budget.prevu.total) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t('dashboard.realized')}</p>
              <p className="text-2xl font-bold" data-testid="text-budget-percentage">
                {budget.ecarts.pourcentageRealise.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completeness Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>{t('chantiers.completeness')}</CardTitle>
          <CardDescription>
            {t('chantiers.completenessScore')}: {completude.score}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completenessIndicators.map((indicator) => (
              <div
                key={indicator.key}
                className="flex items-center gap-3 p-3 rounded-lg border"
                data-testid={`indicator-${indicator.key}`}
              >
                {indicator.value ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
                <span className={`text-sm ${indicator.value ? 'font-medium' : 'text-muted-foreground'}`}>
                  {indicator.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
