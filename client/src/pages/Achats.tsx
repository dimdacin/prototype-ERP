import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function Achats() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('nav.achats')}</h1>
        <p className="text-muted-foreground">Gestion des achats et commandes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Achats - En construction</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Module de gestion des achats à développer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
