import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function Equipements() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('nav.equipements')}</h1>
        <p className="text-muted-foreground">Gestion des équipements</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Équipements - En construction</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Module de gestion des équipements à développer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
