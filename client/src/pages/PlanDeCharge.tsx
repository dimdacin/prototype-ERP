import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PlanDeChargeTable, DisponibiliteBadge } from '../components/PlanDeChargeTable';
import { AffectationModal } from '../components/AffectationModal';
import { Building, Calendar, MapPin, Users, Wrench, Truck } from 'lucide-react';

// Types pour le Plan de Charge
interface Chantier {
  id: string;
  nom: string;
  localisation: string;
  status: 'en_cours' | 'planifie' | 'termine';
  dateDebut: string;
  dateFin?: string;
  budget: number;
  responsable: string;
  disponible: boolean;
}

interface Usine {
  id: string;
  nom: string;
  localisation: string;
  type: string;
  capacite: number;
  utilisation: number;
  disponible: boolean;
}

interface Engin {
  id: string;
  nom: string;
  type: string;
  modele: string;
  status: 'disponible' | 'en_maintenance' | 'affecte';
  localisation: string;
  coutJournalier: number;
  disponible: boolean;
}

interface Salarie {
  id: string;
  nom: string;
  prenom: string;
  poste: string;
  departement: string;
  tauxHoraire: number;
  disponible: boolean;
  competences: string[];
}

export default function PlanDeCharge() {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Requêtes pour récupérer les données
  const { data: chantiers = [], isLoading: loadingChantiers } = useQuery<Chantier[]>({
    queryKey: ['chantiers'],
    queryFn: async (): Promise<Chantier[]> => {
      const response = await fetch('/api/chantiers');
      if (!response.ok) throw new Error('Erreur lors du chargement des chantiers');
      return response.json();
    },
  });

  const { data: usines = [], isLoading: loadingUsines } = useQuery<Usine[]>({
    queryKey: ['usines'],
    queryFn: async (): Promise<Usine[]> => {
      const response = await fetch('/api/usines');
      if (!response.ok) throw new Error('Erreur lors du chargement des usines');
      return response.json();
    },
  });

  const { data: equipements = [], isLoading: loadingEquipements } = useQuery<Engin[]>({
    queryKey: ['equipements'],
    queryFn: async (): Promise<Engin[]> => {
      const response = await fetch('/api/equipements');
      if (!response.ok) throw new Error('Erreur lors du chargement des équipements');
      return response.json();
    },
  });

  const { data: salaries = [], isLoading: loadingSalaries } = useQuery<Salarie[]>({
    queryKey: ['salaries'],
    queryFn: async (): Promise<Salarie[]> => {
      const response = await fetch('/api/salaries');
      if (!response.ok) throw new Error('Erreur lors du chargement des salariés');
      return response.json();
    },
  });

  // Colonnes pour les Chantiers
  const chantiersColumns: ColumnDef<Chantier>[] = [
    {
      accessorKey: 'nom',
      header: 'Chantier',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Building className="h-4 w-4" />
          <span className="font-medium">{row.getValue('nom')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'localisation',
      header: 'Localisation',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span>{row.getValue('localisation')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const statusConfig = {
          en_cours: { label: 'En cours', variant: 'default' as const },
          planifie: { label: 'Planifié', variant: 'secondary' as const },
          termine: { label: 'Terminé', variant: 'outline' as const },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || { label: status || 'Inconnu', variant: 'outline' as const };
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      accessorKey: 'dateDebut',
      header: 'Date début',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>{new Date(row.getValue('dateDebut')).toLocaleDateString('fr-FR')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'budget',
      header: 'Budget',
      cell: ({ row }) => (
        <span className="font-mono">{new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR'
        }).format(row.getValue('budget'))}</span>
      ),
    },
    {
      accessorKey: 'responsable',
      header: 'Responsable',
    },
    {
      accessorKey: 'disponible',
      header: 'Disponibilité',
      cell: ({ row }) => <DisponibiliteBadge disponible={row.getValue('disponible')} />,
    },
  ];

  // Colonnes pour les Usines
  const usinesColumns: ColumnDef<Usine>[] = [
    {
      accessorKey: 'nom',
      header: 'Usine',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Building className="h-4 w-4" />
          <span className="font-medium">{row.getValue('nom')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'localisation',
      header: 'Localisation',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span>{row.getValue('localisation')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <Badge variant="outline">{row.getValue('type')}</Badge>,
    },
    {
      accessorKey: 'capacite',
      header: 'Capacité',
      cell: ({ row }) => (
        <span className="font-mono">{row.getValue('capacite')} t/h</span>
      ),
    },
    {
      accessorKey: 'utilisation',
      header: 'Utilisation',
      cell: ({ row }) => {
        const utilisation = row.getValue('utilisation') as number;
        const capacite = row.original.capacite;
        const pourcentage = Math.round((utilisation / capacite) * 100);
        
        return (
          <div className="flex items-center space-x-2">
            <span className="font-mono">{utilisation} t/h</span>
            <Badge variant={pourcentage > 80 ? 'destructive' : 'secondary'}>
              {pourcentage}%
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'disponible',
      header: 'Disponibilité',
      cell: ({ row }) => <DisponibiliteBadge disponible={row.getValue('disponible')} />,
    },
  ];

  // Colonnes pour les Engins
  const enginsColumns: ColumnDef<Engin>[] = [
    {
      accessorKey: 'nom',
      header: 'Engin',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Truck className="h-4 w-4" />
          <span className="font-medium">{row.getValue('nom')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <Badge variant="outline">{row.getValue('type')}</Badge>,
    },
    {
      accessorKey: 'modele',
      header: 'Modèle',
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const statusConfig = {
          disponible: { label: 'Disponible', variant: 'default' as const },
          en_maintenance: { label: 'En maintenance', variant: 'destructive' as const },
          affecte: { label: 'Affecté', variant: 'secondary' as const },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || { label: status || 'Inconnu', variant: 'outline' as const };
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      accessorKey: 'localisation',
      header: 'Localisation',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span>{row.getValue('localisation')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'coutJournalier',
      header: 'Coût/jour',
      cell: ({ row }) => (
        <span className="font-mono">{new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR'
        }).format(row.getValue('coutJournalier'))}</span>
      ),
    },
    {
      accessorKey: 'disponible',
      header: 'Disponibilité',
      cell: ({ row }) => <DisponibiliteBadge disponible={row.getValue('disponible')} />,
    },
  ];

  // Colonnes pour les Salariés
  const salariesColumns: ColumnDef<Salarie>[] = [
    {
      accessorKey: 'nom',
      header: 'Nom',
      cell: ({ row }) => {
        const salarie = row.original;
        const prenom = salarie.prenom || '';
        const nom = salarie.nom || 'Nom manquant';
        return (
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span className="font-medium">{prenom} {nom}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'prenom',
      header: 'Prénom',
    },
    {
      accessorKey: 'poste',
      header: 'Poste',
      cell: ({ row }) => <Badge variant="outline">{row.getValue('poste')}</Badge>,
    },
    {
      accessorKey: 'departement',
      header: 'Département',
    },
    {
      accessorKey: 'tauxHoraire',
      header: 'Taux horaire',
      cell: ({ row }) => (
        <span className="font-mono">{new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR'
        }).format(row.getValue('tauxHoraire'))}/h</span>
      ),
    },
    {
      accessorKey: 'competences',
      header: 'Compétences',
      cell: ({ row }) => {
        const competences = (row.getValue('competences') as string[]) || [];
        if (competences.length === 0) {
          return <span className="text-muted-foreground text-sm">Aucune</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {competences.slice(0, 2).map((comp, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {comp}
              </Badge>
            ))}
            {competences.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{competences.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'disponible',
      header: 'Disponibilité',
      cell: ({ row }) => <DisponibiliteBadge disponible={row.getValue('disponible')} />,
    },
  ];

  // Transformation des données pour le modal
  const destinations = [
    ...chantiers.map((c: Chantier) => ({ 
      id: c.id, 
      nom: c.nom, 
      type: 'chantier' as const, 
      localisation: c.localisation 
    })),
    ...usines.map((u: Usine) => ({ 
      id: u.id, 
      nom: u.nom, 
      type: 'usine' as const, 
      localisation: u.localisation 
    }))
  ];

  const availableItems = [
    ...salaries.filter((s: Salarie) => s.disponible).map((s: Salarie) => ({
      id: s.id,
      nom: `${s.prenom} ${s.nom}`,
      type: 'salarie' as const,
      disponible: s.disponible,
      details: s
    })),
    ...equipements.filter((e: Engin) => e.status === 'disponible').map((e: Engin) => ({
      id: e.id,
      nom: e.nom,
      type: 'engin' as const,
      disponible: e.disponible || e.status === 'disponible',
      details: e
    })),
    ...usines.filter((u: Usine) => u.disponible).map((u: Usine) => ({
      id: u.id,
      nom: u.nom,
      type: 'usine' as const,
      disponible: u.disponible,
      details: u
    }))
  ];

  const handleAffecter = (item: any) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleConfirmAffectation = (destinationId: string, items: any[]) => {
    console.log('Affectation confirmée:', { destinationId, items });
    // Ici vous pourriez faire un appel API pour enregistrer les affectations
  };

  const isLoading = loadingChantiers || loadingUsines || loadingEquipements || loadingSalaries;

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Chargement du plan de charge...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plan de Charge</h1>
          <p className="text-muted-foreground">
            Gestion et affectation des ressources (chantiers, usines, engins, salariés)
          </p>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chantiers actifs</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chantiers.filter((c: Chantier) => c.status === 'en_cours').length}</div>
            <p className="text-xs text-muted-foreground">
              sur {chantiers.length} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usines opérationnelles</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usines.filter((u: Usine) => u.disponible).length}</div>
            <p className="text-xs text-muted-foreground">
              sur {usines.length} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engins disponibles</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{equipements.filter((e: Engin) => e.status === 'disponible').length}</div>
            <p className="text-xs text-muted-foreground">
              sur {equipements.length} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salariés disponibles</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salaries.filter((s: Salarie) => s.disponible).length}</div>
            <p className="text-xs text-muted-foreground">
              sur {salaries.length} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tableaux par ressource */}
      <Tabs defaultValue="chantiers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chantiers" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Chantiers</span>
          </TabsTrigger>
          <TabsTrigger value="usines" className="flex items-center space-x-2">
            <Wrench className="h-4 w-4" />
            <span>Usines</span>
          </TabsTrigger>
          <TabsTrigger value="engins" className="flex items-center space-x-2">
            <Truck className="h-4 w-4" />
            <span>Engins</span>
          </TabsTrigger>
          <TabsTrigger value="salaries" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Salariés</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chantiers">
          <Card>
            <CardHeader>
              <CardTitle>Chantiers</CardTitle>
              <CardDescription>
                Gestion des chantiers et affectation des ressources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlanDeChargeTable
                data={chantiers}
                columns={chantiersColumns}
                searchPlaceholder="Rechercher un chantier..."
                searchKey="nom"
                onAffecter={handleAffecter}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usines">
          <Card>
            <CardHeader>
              <CardTitle>Usines</CardTitle>
              <CardDescription>
                Suivi des usines et de leur capacité de production
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlanDeChargeTable
                data={usines}
                columns={usinesColumns}
                searchPlaceholder="Rechercher une usine..."
                searchKey="nom"
                onAffecter={handleAffecter}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engins">
          <Card>
            <CardHeader>
              <CardTitle>Engins</CardTitle>
              <CardDescription>
                Gestion du parc d'engins et équipements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlanDeChargeTable
                data={equipements}
                columns={enginsColumns}
                searchPlaceholder="Rechercher un engin..."
                searchKey="nom"
                onAffecter={handleAffecter}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salaries">
          <Card>
            <CardHeader>
              <CardTitle>Salariés</CardTitle>
              <CardDescription>
                Gestion des ressources humaines et affectations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlanDeChargeTable
                data={salaries}
                columns={salariesColumns}
                searchPlaceholder="Rechercher un salarié..."
                searchKey="nom"
                onAffecter={handleAffecter}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal d'affectation */}
      <AffectationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        itemToAffect={selectedItem}
        destinations={destinations}
        availableItems={availableItems}
        onConfirm={handleConfirmAffectation}
      />
    </div>
  );
}