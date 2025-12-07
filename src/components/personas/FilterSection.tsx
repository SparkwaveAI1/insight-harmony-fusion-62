import React from "react";
import { Input } from "@/components/ui/input";
import { Search, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onResetFilters: () => void;
  selectedAge: string;
  onAgeChange: (age: string) => void;
  isSearching?: boolean;
}

// Age range options
const ageOptions = [
  { value: "", label: "Any age" },
  { value: "18-25", label: "18-25 (Gen Z)" },
  { value: "26-35", label: "26-35 (Millennial)" },
  { value: "36-50", label: "36-50 (Gen X)" },
  { value: "51-65", label: "51-65 (Boomer)" },
  { value: "65+", label: "65+ (Senior)" },
];

export default function FilterSection({ 
  searchQuery, 
  onSearchChange, 
  onResetFilters,
  selectedAge,
  onAgeChange,
  isSearching = false
}: FilterSectionProps) {

  const handleClearSearch = () => {
    onSearchChange("");
  };

  const hasActiveFilters = searchQuery || selectedAge;

  return (
    <div className="bg-card border rounded-lg p-6 mb-6">
      <div className="space-y-4">
        {/* Search Bar Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* AI-Powered Search Bar */}
          <div className="relative flex-1 w-full">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <Search className="text-muted-foreground h-4 w-4" />
            </div>
            <Input
              placeholder="AI search: try 'overweight from California' or 'nurses interested in crypto'..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-14 pr-10 w-full"
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
          
          {/* Age Filter and Reset */}
          <div className="flex items-center gap-2">
            <Select value={selectedAge} onValueChange={onAgeChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Any age" />
              </SelectTrigger>
              <SelectContent>
                {ageOptions.map(age => (
                  <SelectItem key={age.value} value={age.value || "any"}>{age.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={onResetFilters}
              disabled={!hasActiveFilters}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Active Filters & Search Status */}
        {(hasActiveFilters || isSearching) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            {isSearching && (
              <span className="text-primary animate-pulse">Searching...</span>
            )}
            {searchQuery && !isSearching && (
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-md flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                AI: "{searchQuery}"
              </span>
            )}
            {selectedAge && (
              <span className="bg-accent text-accent-foreground px-2 py-1 rounded-md">
                Age: {selectedAge}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
