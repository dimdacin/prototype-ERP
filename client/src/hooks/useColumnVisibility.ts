import { useState, useEffect, useRef } from 'react';

export interface ColumnDef {
  id: string;
  labelKey: string;
  mandatory?: boolean;
  defaultVisible?: boolean;
}

export function useColumnVisibility(columns: ColumnDef[], storageKey: string) {
  const hasInitialized = useRef(false);
  
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

  // Synchroniser avec les colonnes quand elles arrivent pour la première fois
  useEffect(() => {
    // Initialiser une seule fois quand columns devient non-vide
    if (columns.length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      
      const stored = localStorage.getItem(storageKey);
      let newVisibility: Record<string, boolean>;
      
      if (stored) {
        try {
          newVisibility = JSON.parse(stored);
        } catch {
          newVisibility = {};
          columns.forEach(col => {
            newVisibility[col.id] = col.defaultVisible ?? true;
          });
        }
      } else {
        newVisibility = {};
        columns.forEach(col => {
          newVisibility[col.id] = col.defaultVisible ?? true;
        });
      }
      
      setColumnVisibilityState(newVisibility);
    }
  }, [columns, storageKey]);

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
