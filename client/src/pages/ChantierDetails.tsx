import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "wouter";

export default function ChantierDetails() {
  const params = useParams();
  const chantierId = params.id;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Détails du Chantier #{chantierId}</h1>
        <p className="text-muted-foreground">Informations détaillées du chantier</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails - En construction</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Vue détaillée du chantier à développer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
