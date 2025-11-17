import ProjectsTable from '../ProjectsTable';

export default function ProjectsTableExample() {
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
    }
  ];

  return (
    <ProjectsTable
      projects={projects}
    />
  );
}
