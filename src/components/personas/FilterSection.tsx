
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
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
  return (
    <div className="bg-card border rounded-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, keyword, or tag..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Filter Placeholder - Will be expanded in Step 3 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">More filters coming soon</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onResetFilters}
          >
            Reset All Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
