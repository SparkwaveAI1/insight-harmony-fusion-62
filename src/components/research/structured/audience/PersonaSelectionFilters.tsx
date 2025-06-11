
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PersonaSelectionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const PersonaSelectionFilters: React.FC<PersonaSelectionFiltersProps> = ({
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Search Personas</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by demographics: age, occupation, location..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="text-xs text-muted-foreground">
        Try: "millennial", "tech", "high income", "college", "manager", "urban", "25-35"
      </div>
    </div>
  );
};
