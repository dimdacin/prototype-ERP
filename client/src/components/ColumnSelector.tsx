import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";
import type { ColumnDef } from "@/hooks/useColumnVisibility";

interface ColumnSelectorProps {
  columns: ColumnDef[];
  columnVisibility: Record<string, boolean>;
  onColumnToggle: (columnId: string, visible: boolean) => void;
  onReset: () => void;
}

export default function ColumnSelector({ 
  columns, 
  columnVisibility, 
  onColumnToggle, 
  onReset 
}: ColumnSelectorProps) {
  const { t } = useTranslation();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" data-testid="button-column-selector">
          <Settings2 className="h-4 w-4 mr-2" />
          {t('equipements.columns')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">{t('equipements.selectColumns')}</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onReset}
              data-testid="button-reset-columns"
            >
              {t('common.reset')}
            </Button>
          </div>
          <div className="space-y-2">
            {columns.map(column => (
              <div key={column.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`column-${column.id}`}
                  checked={columnVisibility[column.id] ?? true}
                  onCheckedChange={(checked) => onColumnToggle(column.id, checked as boolean)}
                  disabled={column.mandatory}
                  data-testid={`checkbox-column-${column.id}`}
                />
                <label
                  htmlFor={`column-${column.id}`}
                  className="text-sm font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t(column.labelKey)}
                  {column.mandatory && (
                    <span className="text-muted-foreground text-xs ml-1">({t('common.required')})</span>
                  )}
                </label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
