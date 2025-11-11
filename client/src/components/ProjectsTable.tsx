import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

interface Project {
  id: string;
  codeProjet?: string;
  name: string;
  beneficiaire?: string;
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
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default function ProjectsTable({ projects, onView, onEdit }: ProjectsTableProps) {
  const { t, i18n } = useTranslation();
  
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
            <TableHead>{t('chantiers.status')}</TableHead>
            <TableHead className="text-right">{t('chantiers.totalBudget')}</TableHead>
            <TableHead className="text-right">{t('chantiers.labor')}</TableHead>
            <TableHead className="text-right">{t('chantiers.materials')}</TableHead>
            <TableHead className="text-right">{t('chantiers.equipment')}</TableHead>
            <TableHead className="text-right">{t('chantiers.progress')}</TableHead>
            <TableHead>{t('chantiers.dateLimit')}</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const variance = ((project.spent - project.budget) / project.budget) * 100;
            return (
              <TableRow key={project.id} data-testid={`row-project-${project.id}`}>
                <TableCell className="font-mono text-sm font-medium">{project.codeProjet || t('common.noData')}</TableCell>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell className="text-sm">{project.beneficiaire || <span className="text-muted-foreground">{t('common.noData')}</span>}</TableCell>
                <TableCell>
                  <Badge variant={statusConfig[project.status].variant}>
                    {statusConfig[project.status].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="font-medium">{formatCurrency(project.budget)}</div>
                  <div className="text-xs text-muted-foreground">
                    <span className={variance > 0 ? "text-chart-4" : ""}>
                      {formatCurrency(project.spent)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm">
                  {project.budgetMainDoeuvre !== undefined && project.budgetMainDoeuvre !== null ? (
                    <>
                      <div>{formatCurrency(Number(project.budgetMainDoeuvre))}</div>
                      {project.spentMainDoeuvre !== undefined && project.spentMainDoeuvre !== null && (
                        <div className="text-xs text-muted-foreground">{formatCurrency(Number(project.spentMainDoeuvre))}</div>
                      )}
                    </>
                  ) : <span className="text-muted-foreground">{t('common.noData')}</span>}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {project.budgetMateriaux !== undefined && project.budgetMateriaux !== null ? (
                    <>
                      <div>{formatCurrency(Number(project.budgetMateriaux))}</div>
                      {project.spentMateriaux !== undefined && project.spentMateriaux !== null && (
                        <div className="text-xs text-muted-foreground">{formatCurrency(Number(project.spentMateriaux))}</div>
                      )}
                    </>
                  ) : <span className="text-muted-foreground">{t('common.noData')}</span>}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {project.budgetEquipement !== undefined && project.budgetEquipement !== null ? (
                    <>
                      <div>{formatCurrency(Number(project.budgetEquipement))}</div>
                      {project.spentEquipement !== undefined && project.spentEquipement !== null && (
                        <div className="text-xs text-muted-foreground">{formatCurrency(Number(project.spentEquipement))}</div>
                      )}
                    </>
                  ) : <span className="text-muted-foreground">{t('common.noData')}</span>}
                </TableCell>
                <TableCell className="text-right">{project.progress}%</TableCell>
                <TableCell>{project.deadline}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-actions-${project.id}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView?.(project.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        {t('chantiers.viewDetails')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit?.(project.id)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        {t('chantiers.editProject')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
