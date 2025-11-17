import DashboardStats from "@/components/DashboardStats";
import ProjectsTable from "@/components/ProjectsTable";
import BudgetChart from "@/components/BudgetChart";
import ResourceList from "@/components/ResourceList";
import WorkloadCalendar from "@/components/WorkloadCalendar";
import { Building2, Users, Wrench, DollarSign } from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      title: "Chantiers Actifs",
      value: "12",
      trend: { value: "+2 ce mois", isPositive: true },
      icon: <Building2 className="h-4 w-4" />
    },
    {
      title: "Salariés Affectés",
      value: "48",
      trend: { value: "92% utilisation", isPositive: true },
      icon: <Users className="h-4 w-4" />
    },
    {
      title: "Équipements en Service",
      value: "35",
      trend: { value: "3 en maintenance", isPositive: false },
      icon: <Wrench className="h-4 w-4" />
    },
    {
      title: "Budget Global",
      value: "€2.4M",
      trend: { value: "+8.2% réalisé", isPositive: false },
      icon: <DollarSign className="h-4 w-4" />
    }
  ];

  const projects = [
    {
      id: "1",
      name: "Construction Immeuble A",
      status: "en_cours" as const,
      budget: 450000,
      spent: 385000,
      progress: 75,
      deadline: "15/12/2025"
    },
    {
      id: "2",
      name: "Rénovation Usine Nord",
      status: "retard" as const,
      budget: 280000,
      spent: 295000,
      progress: 82,
      deadline: "30/11/2025"
    },
    {
      id: "3",
      name: "Extension Entrepôt Sud",
      status: "planifie" as const,
      budget: 520000,
      spent: 0,
      progress: 0,
      deadline: "20/01/2026"
    },
    {
      id: "4",
      name: "Bureau Est - Aménagement",
      status: "en_cours" as const,
      budget: 180000,
      spent: 165000,
      progress: 88,
      deadline: "10/12/2025"
    }
  ];

  const budgetData = [
    { name: 'Immeuble A', previsionnel: 450000, realise: 385000 },
    { name: 'Usine Nord', previsionnel: 280000, realise: 295000 },
    { name: 'Entrepôt Sud', previsionnel: 520000, realise: 125000 },
    { name: 'Bureau Est', previsionnel: 180000, realise: 165000 },
  ];

  const resources = [
    { id: "1", name: "Jean Dupont", role: "Chef de chantier", status: "affecte" as const, project: "Immeuble A" },
    { id: "2", name: "Marie Martin", role: "Ingénieur", status: "affecte" as const, project: "Usine Nord" },
    { id: "3", name: "Pierre Durand", role: "Électricien", status: "disponible" as const },
    { id: "4", name: "Sophie Bernard", role: "Maçon", status: "conge" as const },
    { id: "5", name: "Luc Petit", role: "Plombier", status: "disponible" as const },
  ];

  const assignments = [
    {
      id: "1",
      resource: "Jean Dupont",
      project: "Construction Immeuble A",
      startDate: "01/12/2025",
      endDate: "15/12/2025",
      hoursPerDay: 8
    },
    {
      id: "2",
      resource: "Marie Martin",
      project: "Rénovation Usine Nord",
      startDate: "01/12/2025",
      endDate: "30/12/2025",
      hoursPerDay: 7
    },
    {
      id: "3",
      resource: "Pierre Durand",
      project: "Extension Entrepôt Sud",
      startDate: "10/12/2025",
      endDate: "20/12/2025",
      hoursPerDay: 5
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble de votre activité</p>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Chantiers en cours</h2>
            <ProjectsTable
              projects={projects}
            />
          </div>

          <BudgetChart data={budgetData} />
        </div>

        <div className="space-y-6">
          <ResourceList
            title="Salariés"
            resources={resources}
            onAdd={() => console.log('Add resource')}
          />
          
          <WorkloadCalendar assignments={assignments} />
        </div>
      </div>
    </div>
  );
}
