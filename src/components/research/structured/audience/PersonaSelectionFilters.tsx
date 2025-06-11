
import React from 'react';
import { Search, Users, FolderOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collection } from '@/services/collections/types';

interface PersonaSelectionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCollection: string;
  onCollectionChange: (value: string) => void;
  collections: Collection[];
  isLoadingCollections: boolean;
}

export const PersonaSelectionFilters: React.FC<PersonaSelectionFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCollection,
  onCollectionChange,
  collections,
  isLoadingCollections
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Collections Dropdown */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Filter by Collection</label>
        <Select value={selectedCollection} onValueChange={onCollectionChange} disabled={isLoadingCollections}>
          <SelectTrigger>
            <SelectValue placeholder="Select a collection" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                All Personas
              </div>
            </SelectItem>
            {collections.map((collection) => (
              <SelectItem key={collection.id} value={collection.id}>
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  {collection.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Enhanced Search */}
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
    </div>
  );
};
