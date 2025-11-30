import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function Employes() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('nav.salaries')}</h1>
        <p className="text-muted-foreground">Gestion des employés</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employés - En construction</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Module de gestion des employés à développer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
