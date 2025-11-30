import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('nav.dashboard')}</h1>
          <p className="text-muted-foreground">
            Bienvenue sur votre tableau de bord
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tableau de bord - En construction</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Cette page sera développée progressivement selon vos besoins.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
