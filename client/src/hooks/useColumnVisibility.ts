import { useState } from 'react';

export interface ColumnDef {
  id: string;
  labelKey: string;
  mandatory?: boolean;
  defaultVisible?: boolean;
}

export function useColumnVisibility(columns: ColumnDef[], storageKey: string) {
  const [columnVisibility, setColumnVisibilityState] = useState<Record<string, boolean>>(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {};
      }
    }
    const defaults: Record<string, boolean> = {};
    columns.forEach(col => {
      defaults[col.id] = col.defaultVisible ?? true;
    });
    return defaults;
  });

  const setColumnVisibility = (id: string, visible: boolean) => {
    setColumnVisibilityState(prev => {
      const updated = { ...prev, [id]: visible };
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  };

  const resetToDefaults = () => {
    const defaults: Record<string, boolean> = {};
    columns.forEach(col => {
      defaults[col.id] = col.defaultVisible ?? true;
    });
    setColumnVisibilityState(defaults);
    localStorage.setItem(storageKey, JSON.stringify(defaults));
  };

  return { columnVisibility, setColumnVisibility, resetToDefaults };
}
