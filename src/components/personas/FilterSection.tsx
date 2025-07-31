
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface FilterSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onResetFilters: () => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  selectedAge: string;
  onAgeChange: (age: string) => void;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  selectedIncome: string;
  onIncomeChange: (income: string) => void;
  selectedSourceType: string;
  onSourceTypeChange: (sourceType: string) => void;
}

const tagOptions = [
  "crypto", "marketing", "governance", "technology", "finance", 
  "healthcare", "education", "retail", "entertainment", "politics"
];

const demographicOptions = {
  age: ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"],
  region: ["urban", "suburban", "rural"],
  income: ["low", "middle", "high"]
};

const sourceTypes = ["simulated", "interview-based", "user-prompted"];

export default function FilterSection({ 
  searchQuery, 
  onSearchChange, 
  onResetFilters,
  selectedTags,
  onTagsChange,
  selectedAge,
  onAgeChange,
  selectedRegion,
  onRegionChange,
  selectedIncome,
  onIncomeChange,
  selectedSourceType,
  onSourceTypeChange
}: FilterSectionProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleClearSearch = () => {
    onSearchChange("");
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag) 
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    onTagsChange(newTags);
  };

  const hasActiveFilters = searchQuery || selectedTags.length > 0 || selectedAge || selectedRegion || selectedIncome || selectedSourceType;

  return (
    <div className="bg-card border rounded-lg p-6 mb-6">
      <div className="space-y-4">
        {/* Search Bar Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Enhanced Search Bar - Now wider and responsive */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search: traits (openness, extraversion), demographics (programmer, San Francisco), or keywords..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-10 w-full"
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
          
          {/* Filter Toggle and Reset */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onResetFilters}
              disabled={!hasActiveFilters}
            >
              Reset All
            </Button>
          </div>
        </div>

        {/* Active Filters Indicator */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <span>Active filters:</span>
            {searchQuery && (
              <span className="bg-accent text-accent-foreground px-2 py-1 rounded-md">
                Search: "{searchQuery}"
              </span>
            )}
            {selectedTags.map(tag => (
              <span key={tag} className="bg-accent text-accent-foreground px-2 py-1 rounded-md">
                {tag}
              </span>
            ))}
            {selectedAge && (
              <span className="bg-accent text-accent-foreground px-2 py-1 rounded-md">
                Age: {selectedAge}
              </span>
            )}
            {selectedRegion && (
              <span className="bg-accent text-accent-foreground px-2 py-1 rounded-md">
                Region: {selectedRegion}
              </span>
            )}
            {selectedIncome && (
              <span className="bg-accent text-accent-foreground px-2 py-1 rounded-md">
                Income: {selectedIncome}
              </span>
            )}
            {selectedSourceType && (
              <span className="bg-accent text-accent-foreground px-2 py-1 rounded-md">
                Source: {selectedSourceType}
              </span>
            )}
          </div>
        )}

        {/* Advanced Filters */}
        <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
          <CollapsibleContent className="space-y-4">
            {/* Tags Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Use Case Tags</h4>
              <div className="flex flex-wrap gap-2">
                {tagOptions.map(tag => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={tag}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => handleTagToggle(tag)}
                    />
                    <label
                      htmlFor={tag}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                    >
                      {tag}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Demographics Filter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Age Range</h4>
                <Select value={selectedAge} onValueChange={onAgeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    {demographicOptions.age.map(age => (
                      <SelectItem key={age} value={age}>{age}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Region</h4>
                <Select value={selectedRegion} onValueChange={onRegionChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {demographicOptions.region.map(region => (
                      <SelectItem key={region} value={region} className="capitalize">{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Income Level</h4>
                <Select value={selectedIncome} onValueChange={onIncomeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select income level" />
                  </SelectTrigger>
                  <SelectContent>
                    {demographicOptions.income.map(income => (
                      <SelectItem key={income} value={income} className="capitalize">{income}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Source Type Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Source Type</h4>
              <Select value={selectedSourceType} onValueChange={onSourceTypeChange}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Select source type" />
                </SelectTrigger>
                <SelectContent>
                  {sourceTypes.map(type => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type.replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
