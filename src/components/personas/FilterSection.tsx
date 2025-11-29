
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, X, Filter, MapPin, Briefcase } from "lucide-react";
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
  selectedOccupation?: string;
  onOccupationChange?: (occupation: string) => void;
}

const tagOptions = [
  "crypto", "marketing", "governance", "technology", "finance", 
  "healthcare", "education", "retail", "entertainment", "politics"
];

// Real US states and regions for location filtering
const locationOptions = [
  { value: "", label: "Any location" },
  { value: "california", label: "California" },
  { value: "texas", label: "Texas" },
  { value: "florida", label: "Florida" },
  { value: "new york", label: "New York" },
  { value: "illinois", label: "Illinois" },
  { value: "pennsylvania", label: "Pennsylvania" },
  { value: "ohio", label: "Ohio" },
  { value: "georgia", label: "Georgia" },
  { value: "michigan", label: "Michigan" },
  { value: "north carolina", label: "North Carolina" },
  { value: "washington", label: "Washington" },
  { value: "arizona", label: "Arizona" },
  { value: "colorado", label: "Colorado" },
  { value: "massachusetts", label: "Massachusetts" },
  { value: "oregon", label: "Oregon" },
];

// Common occupations for filtering
const occupationOptions = [
  { value: "", label: "Any occupation" },
  { value: "engineer", label: "Engineer" },
  { value: "teacher", label: "Teacher" },
  { value: "nurse", label: "Nurse / Healthcare" },
  { value: "manager", label: "Manager" },
  { value: "developer", label: "Developer" },
  { value: "designer", label: "Designer" },
  { value: "sales", label: "Sales" },
  { value: "marketing", label: "Marketing" },
  { value: "analyst", label: "Analyst" },
  { value: "consultant", label: "Consultant" },
  { value: "retired", label: "Retired" },
  { value: "student", label: "Student" },
];

// Better age range options
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
  selectedTags,
  onTagsChange,
  selectedAge,
  onAgeChange,
  selectedRegion,
  onRegionChange,
  selectedIncome,
  onIncomeChange,
  selectedSourceType,
  onSourceTypeChange,
  selectedOccupation = "",
  onOccupationChange
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

  const hasActiveFilters = searchQuery || selectedTags.length > 0 || selectedAge || selectedRegion || selectedOccupation;

  return (
    <div className="bg-card border rounded-lg p-6 mb-6">
      <div className="space-y-4">
        {/* Search Bar Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Enhanced Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name, occupation, location, or traits..."
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
              {hasActiveFilters && !searchQuery && (
                <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5">
                  {[selectedAge, selectedRegion, selectedOccupation, ...selectedTags].filter(Boolean).length}
                </span>
              )}
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
              <span className="bg-accent text-accent-foreground px-2 py-1 rounded-md flex items-center gap-1">
                Age: {selectedAge}
              </span>
            )}
            {selectedRegion && (
              <span className="bg-accent text-accent-foreground px-2 py-1 rounded-md flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {locationOptions.find(l => l.value === selectedRegion)?.label || selectedRegion}
              </span>
            )}
            {selectedOccupation && (
              <span className="bg-accent text-accent-foreground px-2 py-1 rounded-md flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {occupationOptions.find(o => o.value === selectedOccupation)?.label || selectedOccupation}
              </span>
            )}
          </div>
        )}

        {/* Advanced Filters */}
        <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
          <CollapsibleContent className="space-y-4 pt-2">
            {/* Demographics Filters - Primary Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  Age Range
                </h4>
                <Select value={selectedAge} onValueChange={onAgeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any age" />
                  </SelectTrigger>
                  <SelectContent>
                    {ageOptions.map(age => (
                      <SelectItem key={age.value} value={age.value || "any"}>{age.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  Location
                </h4>
                <Select value={selectedRegion} onValueChange={onRegionChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationOptions.map(location => (
                      <SelectItem key={location.value} value={location.value || "any"}>{location.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  Occupation
                </h4>
                <Select value={selectedOccupation} onValueChange={onOccupationChange || (() => {})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any occupation" />
                  </SelectTrigger>
                  <SelectContent>
                    {occupationOptions.map(occ => (
                      <SelectItem key={occ.value} value={occ.value || "any"}>{occ.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Interest Tags</h4>
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
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
                    >
                      {tag}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
