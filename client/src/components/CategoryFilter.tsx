import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useTranslation } from "react-i18next";
import { useState } from "react";

interface CategoryFilterProps {
  availableCategories: string[];
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

export default function CategoryFilter({ 
  availableCategories, 
  selectedCategories, 
  onCategoriesChange 
}: CategoryFilterProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  const clearAll = () => {
    onCategoriesChange([]);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" data-testid="button-category-filter">
            <Filter className="h-4 w-4 mr-2" />
            {t('equipements.filterByCategory')}
            {selectedCategories.length > 0 && (
              <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
                {selectedCategories.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <Command>
            <CommandInput placeholder={t('equipements.searchCategory')} />
            <CommandList>
              <CommandEmpty>{t('equipements.noCategoryFound')}</CommandEmpty>
              <CommandGroup>
                {availableCategories.map(category => (
                  <CommandItem
                    key={category}
                    onSelect={() => toggleCategory(category)}
                    data-testid={`category-option-${category}`}
                  >
                    <div className="flex items-center w-full">
                      <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center ${
                        selectedCategories.includes(category) ? 'bg-primary border-primary' : 'border-input'
                      }`}>
                        {selectedCategories.includes(category) && (
                          <div className="w-2 h-2 bg-primary-foreground rounded-sm" />
                        )}
                      </div>
                      <span className="flex-1">{category}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedCategories.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {selectedCategories.map(category => (
            <Badge 
              key={category} 
              variant="secondary" 
              className="gap-1"
              data-testid={`badge-category-${category}`}
            >
              {category}
              <button
                onClick={() => toggleCategory(category)}
                className="hover-elevate rounded-full"
                data-testid={`button-remove-category-${category}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            data-testid="button-clear-category-filter"
          >
            {t('common.clearAll')}
          </Button>
        </div>
      )}
    </div>
  );
}
