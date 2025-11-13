import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

interface Project {
  id: string;
  codeProjet?: string;
  name: string;
  beneficiaire?: string;
  responsable?: {
    nom: string;
    prenom: string;
  };
  status: "en_cours" | "planifie" | "termine" | "retard";
  budget: number;
  budgetMainDoeuvre?: number;
  budgetMateriaux?: number;
  budgetEquipement?: number;
  spent: number;
  spentMainDoeuvre?: number;
  spentMateriaux?: number;
  spentEquipement?: number;
  progress: number;
  deadline: string;
}

interface ProjectsTableProps {
  projects: Project[];
}

export default function ProjectsTable({ projects }: ProjectsTableProps) {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const statusConfig = {
    en_cours: { label: t('chantiers.inProgress'), variant: "default" as const },
    planifie: { label: t('chantiers.planned'), variant: "secondary" as const },
    termine: { label: t('chantiers.statusCompleted'), variant: "outline" as const },
    retard: { label: t('chantiers.delayed'), variant: "destructive" as const },
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('chantiers.code')}</TableHead>
            <TableHead>{t('chantiers.siteName')}</TableHead>
            <TableHead>{t('chantiers.beneficiary')}</TableHead>
            <TableHead>{t('chantiers.projectManager')}</TableHead>
            <TableHead>{t('chantiers.status')}</TableHead>
            <TableHead className="text-right">{t('chantiers.budgetVariance')}</TableHead>
            <TableHead className="text-right">{t('chantiers.progress')}</TableHead>
            <TableHead>{t('chantiers.dateLimit')}</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const variance = project.budget > 0 ? ((project.spent - project.budget) / project.budget) * 100 : 0;
            const varianceAmount = project.spent - project.budget;
            return (
              <TableRow key={project.id} data-testid={`row-project-${project.id}`}>
                <TableCell className="font-mono text-sm font-medium" data-testid={`text-code-${project.id}`}>
                  {project.codeProjet || <span className="text-muted-foreground">{t('common.noData')}</span>}
                </TableCell>
                <TableCell className="font-medium" data-testid={`text-name-${project.id}`}>{project.name}</TableCell>
                <TableCell className="text-sm" data-testid={`text-beneficiaire-${project.id}`}>
                  {project.beneficiaire || <span className="text-muted-foreground">{t('common.noData')}</span>}
                </TableCell>
                <TableCell className="text-sm" data-testid={`text-responsable-${project.id}`}>
                  {project.responsable ? (
                    `${project.responsable.prenom} ${project.responsable.nom}`
                  ) : (
                    <span className="text-muted-foreground">{t('chantiers.notAssigned')}</span>
                  )}
                </TableCell>
                <TableCell data-testid={`badge-status-${project.id}`}>
                  <Badge variant={statusConfig[project.status].variant}>
                    {statusConfig[project.status].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right" data-testid={`text-variance-${project.id}`}>
                  <div className={`font-medium ${varianceAmount > 0 ? 'text-destructive' : varianceAmount < 0 ? 'text-green-600 dark:text-green-400' : ''}`}>
                    {formatCurrency(varianceAmount)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
                  </div>
                </TableCell>
                <TableCell className="text-right" data-testid={`text-progress-${project.id}`}>{project.progress}%</TableCell>
                <TableCell data-testid={`text-deadline-${project.id}`}>{project.deadline}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocation(`/chantiers/${project.id}`)}
                    data-testid={`button-details-${project.id}`}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {t('chantiers.details')}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
