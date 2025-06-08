
import React from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onResetFilters: () => void;
}

export default function FilterSection({ 
  searchQuery, 
  onSearchChange, 
  onResetFilters 
}: FilterSectionProps) {
  const handleClearSearch = () => {
    onSearchChange("");
  };

  return (
    <div className="bg-card border rounded-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Enhanced Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, description, or traits..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Filter Actions */}
        <div className="flex items-center gap-2">
          {searchQuery && (
            <span className="text-sm text-muted-foreground">
              Searching for "{searchQuery}"
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={onResetFilters}
            disabled={!searchQuery}
          >
            Reset All Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
