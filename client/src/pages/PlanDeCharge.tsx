import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlanDeCharge() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Plan de Charge</h1>
        <p className="text-muted-foreground">Visualisation de la charge de travail</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan de Charge - En construction</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Module de plan de charge à développer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
