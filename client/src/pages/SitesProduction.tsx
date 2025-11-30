import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function SitesProduction() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('nav.usines')}</h1>
        <p className="text-muted-foreground">Gestion des usines et sites de production</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sites de Production - En construction</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Module de gestion des usines à développer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
