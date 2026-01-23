// src/components/personas/PersonaFilterPanel.tsx

import { useState } from 'react';
import { ChevronDown, ChevronUp, X, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { PersonaFilters } from '@/types/personaFilters';
import { usePersonaFilterOptions, formatOptionLabel } from '@/hooks/usePersonaFilterOptions';

// Standard ethnicity categories for filtering
const ETHNICITIES = [
  'White (e.g., European descent)',
  'Black or African descent',
  'East Asian (e.g., Chinese, Korean, Japanese)',
  'South Asian (e.g., Indian, Pakistani, Sri Lankan)',
  'Southeast Asian (e.g., Filipino, Vietnamese, Thai)',
  'Middle Eastern or North African (MENA)',
  'Native American or Alaska Native',
  'Native Hawaiian or Pacific Islander',
  'Mixed / Multiracial',
  'Another race or ancestry',
];

// Standard income brackets (in order from lowest to highest)
const INCOME_BRACKETS = [
  'Under $25,000',
  '$25,000 - $50,000',
  '$50,000 - $75,000',
  '$75,000 - $100,000',
  '$100,000 - $150,000',
  '$150,000 - $200,000',
  '$200,000 - $350,000',
  '$350,000 - $500,000',
  'Over $500,000',
];

// 50 US States for State/Region filter
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
  'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
  'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

// Standard gender options (consolidated non-binary variants)
const GENDERS = ['male', 'female', 'non-binary'];

// Marital status options in preferred order (excluding engaged)
const MARITAL_STATUSES = [
  'single',
  'married',
  'divorced',
  'widowed',
  'separated',
  'in a relationship',
  'partnered',
  'cohabiting',
];

// Education levels in order with proper display names
const EDUCATION_LEVELS = [
  'high school',
  'some college',
  'associate',
  'bachelor',
  'master',
  'mba',
  'jd',
  'md',
  'phd',
  'doctorate',
];

// Custom labels for education levels
const EDUCATION_LABELS: Record<string, string> = {
  'high school': 'High School',
  'some college': 'Some College',
  'associate': 'Associate Degree',
  'bachelor': "Bachelor's Degree",
  'master': "Master's Degree",
  'mba': 'MBA',
  'jd': 'JD',
  'md': 'MD',
  'phd': 'PhD',
  'doctorate': 'Doctorate',
};

// Political lean options in spectrum order (left to right)
const POLITICAL_LEANS = [
  'far_left',
  'progressive',
  'liberal',
  'center_left',
  'moderate',
  'center_right',
  'conservative',
  'far_right',
  'libertarian',
  'apolitical',
];

// Custom labels for political leans
const POLITICAL_LEAN_LABELS: Record<string, string> = {
  'far_left': 'Far Left',
  'progressive': 'Progressive',
  'liberal': 'Liberal',
  'center_left': 'Center Left',
  'moderate': 'Moderate',
  'center_right': 'Center Right',
  'conservative': 'Conservative',
  'far_right': 'Far Right',
  'libertarian': 'Libertarian',
  'apolitical': 'Apolitical',
};

interface PersonaFilterPanelProps {
  filters: PersonaFilters;
  onChange: (filters: PersonaFilters) => void;
  onApply: () => void;
  onClear: () => void;
  isLoading?: boolean;
  resultCount?: number;
}

// Multi-select component for array fields
function MultiSelect({
  label,
  options,
  selected,
  onChange,
  placeholder = 'Select...',
  labelFormatter,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  labelFormatter?: (value: string) => string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const getLabel = (option: string) => labelFormatter ? labelFormatter(option) : formatOptionLabel(option);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium">{label}</Label>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between text-left font-normal h-10"
            type="button"
          >
            {selected.length > 0 ? (
              <span className="truncate">
                {selected.length} selected
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            {isOpen ? (
              <ChevronUp className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1">
          <div className="border rounded-md p-2 max-h-48 overflow-y-auto space-y-1 bg-background">
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center space-x-2 cursor-pointer hover:bg-muted p-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggleOption(option)}
                  className="rounded"
                />
                <span className="text-sm">
                  {getLabel(option)}
                </span>
              </label>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {selected.slice(0, 3).map((s) => (
            <Badge
              key={s}
              variant="secondary"
              className="text-xs cursor-pointer"
              onClick={() => toggleOption(s)}
            >
              {getLabel(s)}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {selected.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{selected.length - 3} more
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

export function PersonaFilterPanel({
  filters,
  onChange,
  onApply,
  onClear,
  isLoading,
  resultCount,
}: PersonaFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { options: filterOptions, isLoading: optionsLoading } = usePersonaFilterOptions();

  const activeFilterCount = [
    filters.ageMin !== null || filters.ageMax !== null,
    filters.genders.length > 0,
    filters.ethnicities.length > 0,
    filters.states.length > 0,
    filters.hasChildren !== null,
    filters.maritalStatuses.length > 0,
    filters.occupationContains !== '',
    filters.incomeBrackets.length > 0,
    filters.educationLevels.length > 0,
    filters.interestTagsAny.length > 0,
    filters.healthTagsAny.length > 0,
    filters.workRoleTagsAny.length > 0,
    filters.politicalLeans.length > 0,
    filters.textContains !== '',
    filters.textExcludes !== '',
    filters.nameContains !== '',
  ].filter(Boolean).length;

  return (
    <Card className="mb-4">
      {/* Header - always visible */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Advanced Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount} active</Badge>
          )}
          {resultCount !== undefined && (
            <span className="text-sm text-muted-foreground">
              ({resultCount.toLocaleString()} results)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear All
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" /> Hide
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" /> Show
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Expanded filter content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t pt-4">
          {/* Loading state for options */}
          {optionsLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading filter options...</span>
            </div>
          )}

          {!optionsLoading && (
            <>
          {/* Quick search row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label className="text-sm font-medium">Name Contains</Label>
              <Input
                placeholder="Search by name..."
                value={filters.nameContains}
                onChange={(e) =>
                  onChange({ ...filters, nameContains: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Profile Contains</Label>
              <Input
                placeholder="e.g., cooking, diabetes"
                value={filters.textContains}
                onChange={(e) =>
                  onChange({ ...filters, textContains: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Exclude Terms</Label>
              <Input
                placeholder="e.g., exclude certain terms"
                value={filters.textExcludes}
                onChange={(e) =>
                  onChange({ ...filters, textExcludes: e.target.value })
                }
              />
            </div>
          </div>

          {/* Demographics section */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
              Demographics
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* Age range */}
              <div>
                <Label className="text-sm font-medium">Age Range</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder="Min"
                    className="w-full"
                    value={filters.ageMin ?? ''}
                    onChange={(e) =>
                      onChange({
                        ...filters,
                        ageMin: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    className="w-full"
                    value={filters.ageMax ?? ''}
                    onChange={(e) =>
                      onChange({
                        ...filters,
                        ageMax: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                  />
                </div>
              </div>

              <MultiSelect
                label="Gender"
                options={GENDERS}
                selected={filters.genders}
                onChange={(genders) => onChange({ ...filters, genders })}
              />

              <MultiSelect
                label="Ethnicity"
                options={ETHNICITIES}
                selected={filters.ethnicities}
                onChange={(ethnicities) => onChange({ ...filters, ethnicities })}
                labelFormatter={(v) => v}
              />

              <MultiSelect
                label="State"
                options={US_STATES}
                selected={filters.states}
                onChange={(states) => onChange({ ...filters, states })}
              />

              <div>
                <Label className="text-sm font-medium">Has Children</Label>
                <Select
                  value={
                    filters.hasChildren === null
                      ? 'any'
                      : filters.hasChildren
                      ? 'yes'
                      : 'no'
                  }
                  onValueChange={(v) =>
                    onChange({
                      ...filters,
                      hasChildren: v === 'any' ? null : v === 'yes',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <MultiSelect
                label="Marital Status"
                options={MARITAL_STATUSES}
                selected={filters.maritalStatuses}
                onChange={(maritalStatuses) =>
                  onChange({ ...filters, maritalStatuses })
                }
              />
            </div>
          </div>

          {/* Professional section */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
              Professional
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium">Occupation Contains</Label>
                <Input
                  placeholder="e.g., nurse, engineer"
                  value={filters.occupationContains}
                  onChange={(e) =>
                    onChange({ ...filters, occupationContains: e.target.value })
                  }
                />
              </div>

              <MultiSelect
                label="Work Role"
                options={filterOptions.work_role_tags}
                selected={filters.workRoleTagsAny}
                onChange={(workRoleTagsAny) =>
                  onChange({ ...filters, workRoleTagsAny })
                }
              />

              <MultiSelect
                label="Income Bracket"
                options={INCOME_BRACKETS}
                selected={filters.incomeBrackets}
                onChange={(incomeBrackets) =>
                  onChange({ ...filters, incomeBrackets })
                }
              />

              <MultiSelect
                label="Education"
                options={EDUCATION_LEVELS}
                selected={filters.educationLevels}
                onChange={(educationLevels) =>
                  onChange({ ...filters, educationLevels })
                }
                labelFormatter={(v) => EDUCATION_LABELS[v] || formatOptionLabel(v)}
              />
            </div>
          </div>

          {/* Interests & Health section */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
              Interests & Health
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <MultiSelect
                label="Interests"
                options={filterOptions.interest_tags}
                selected={filters.interestTagsAny}
                onChange={(interestTagsAny) =>
                  onChange({ ...filters, interestTagsAny })
                }
              />

              <MultiSelect
                label="Health Conditions"
                options={filterOptions.health_tags}
                selected={filters.healthTagsAny}
                onChange={(healthTagsAny) =>
                  onChange({ ...filters, healthTagsAny })
                }
              />

              <MultiSelect
                label="Political Leaning"
                options={POLITICAL_LEANS}
                selected={filters.politicalLeans}
                onChange={(politicalLeans) =>
                  onChange({ ...filters, politicalLeans })
                }
                labelFormatter={(v) => POLITICAL_LEAN_LABELS[v] || formatOptionLabel(v)}
              />
            </div>
          </div>

          {/* Apply button */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={onClear}>
              Clear All
            </Button>
            <Button onClick={onApply} disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Apply Filters'}
            </Button>
          </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
