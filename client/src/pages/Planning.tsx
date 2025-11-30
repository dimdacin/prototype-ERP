import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function Planning() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('nav.planning')}</h1>
        <p className="text-muted-foreground">Planning des ressources</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Planning - En construction</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Module de planning à développer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
