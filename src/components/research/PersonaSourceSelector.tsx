import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Folder, Globe, Check, AlertCircle, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { getProjectCollections } from '@/services/collections/projectCollectionOperations';
import { Collection } from '@/services/collections/types';

interface PersonaSourceSelectorProps {
  projectId?: string;
  selectedPersonas: string[];
  onPersonaSelectionChange: (personaIds: string[]) => void;
  maxPersonas?: number;
}

type PersonaSource = 'project-collections' | 'my-personas' | 'public-personas';

interface SearchResult {
  persona_id: string;
  name: string;
  age: number;
  gender: string;
  ethnicity: string;
  occupation: string;
  profile_thumbnail_url: string | null;
  profile_image_url: string | null;
  total_count: number;
}

const ETHNICITY_OPTIONS = [
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

const GENDER_OPTIONS = ['male', 'female', 'non-binary'];

export const PersonaSourceSelector: React.FC<PersonaSourceSelectorProps> = ({
  projectId,
  selectedPersonas,
  onPersonaSelectionChange,
  maxPersonas = 10
}) => {
  const { user } = useAuth();
  const [selectedSource, setSelectedSource] = useState<PersonaSource | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [projectCollections, setProjectCollections] = useState<Collection[]>([]);
  const [collectionsError, setCollectionsError] = useState<string | null>(null);
  const [collectionsLoading, setCollectionsLoading] = useState(false);

  // Search state
  const [nameQuery, setNameQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [selectedEthnicity, setSelectedEthnicity] = useState<string>('');
  const [ageMin, setAgeMin] = useState<string>('');
  const [ageMax, setAgeMax] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Results state
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load project collections on mount
  useEffect(() => {
    if (projectId) loadProjectCollections();
  }, [projectId]);

  // Trigger search whenever filters or source/collection changes
  useEffect(() => {
    if (!selectedSource) return;
    if (selectedSource === 'project-collections' && !selectedCollection) return;

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setPage(1);
      runSearch(1);
    }, 300);

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [nameQuery, selectedGender, selectedEthnicity, ageMin, ageMax, selectedSource, selectedCollection]);

  // Re-run search when page changes
  useEffect(() => {
    if (!selectedSource) return;
    if (selectedSource === 'project-collections' && !selectedCollection) return;
    runSearch(page);
  }, [page]);

  const loadProjectCollections = async () => {
    if (!projectId || !user) return;
    setCollectionsLoading(true);
    setCollectionsError(null);
    try {
      const collections = await getProjectCollections(projectId);
      setProjectCollections(collections);
      if (collections.length === 0) setCollectionsError('No collections found for this project');
    } catch {
      setCollectionsError('Failed to load project collections');
    } finally {
      setCollectionsLoading(false);
    }
  };

  const runSearch = useCallback(async (pageNum: number) => {
    if (!selectedSource) return;
    if (selectedSource === 'project-collections' && !selectedCollection) return;

    setIsSearching(true);
    try {
      const params: Record<string, unknown> = {
        p_limit: PAGE_SIZE,
        p_offset: (pageNum - 1) * PAGE_SIZE,
        p_name_contains: nameQuery.trim() || null,
        p_genders: selectedGender ? [selectedGender] : null,
        p_age_min: ageMin ? parseInt(ageMin) : null,
        p_age_max: ageMax ? parseInt(ageMax) : null,
      };

      // Ethnicity search via occupation_contains as text search fallback
      // The RPC has p_ethnicities which matches the stored ethnicity column
      if (selectedEthnicity) {
        (params as Record<string, unknown>).p_ethnicities = [selectedEthnicity];
      }

      if (selectedSource === 'project-collections') {
        params.p_collection_ids = [selectedCollection];
        params.p_public_only = false;
        params.p_user_id = null;
      } else if (selectedSource === 'my-personas') {
        params.p_public_only = false;
        params.p_user_id = user?.id ?? null;
      } else {
        params.p_public_only = true;
      }

      const { data, error } = await supabase.rpc('search_personas_unified', params);
      if (error) throw error;

      setResults((data as SearchResult[]) ?? []);
      setTotalCount((data as SearchResult[])?.[0]?.total_count ?? 0);
    } catch (err) {
      console.error('PersonaSourceSelector search error:', err);
      setResults([]);
      setTotalCount(0);
    } finally {
      setIsSearching(false);
    }
  }, [selectedSource, selectedCollection, nameQuery, selectedGender, selectedEthnicity, ageMin, ageMax, user]);

  const handleSourceSelect = (source: PersonaSource) => {
    setSelectedSource(source);
    setSelectedCollection('');
    setResults([]);
    setTotalCount(0);
    setPage(1);
    onPersonaSelectionChange([]);
  };

  const handleCollectionSelect = (collectionId: string) => {
    setSelectedCollection(collectionId);
    setResults([]);
    setPage(1);
  };

  const clearFilters = () => {
    setNameQuery('');
    setSelectedGender('');
    setSelectedEthnicity('');
    setAgeMin('');
    setAgeMax('');
  };

  const hasActiveFilters = nameQuery || selectedGender || selectedEthnicity || ageMin || ageMax;

  const togglePersona = (personaId: string) => {
    const isSelected = selectedPersonas.includes(personaId);
    if (isSelected) {
      onPersonaSelectionChange(selectedPersonas.filter(id => id !== personaId));
    } else if (selectedPersonas.length < maxPersonas) {
      onPersonaSelectionChange([...selectedPersonas, personaId]);
    }
  };

  const isProjectCollectionsDisabled = !projectId || (collectionsError !== null) || (projectCollections.length === 0 && !collectionsLoading);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Select Personas
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose up to {maxPersonas} personas from different sources
        </p>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Source Selection */}
        <div>
          <h4 className="text-sm font-medium mb-2">Choose Persona Source</h4>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'project-collections' as PersonaSource, label: 'Project Collections', icon: <Folder className="w-4 h-4" />, disabled: isProjectCollectionsDisabled },
              { id: 'my-personas' as PersonaSource, label: 'My Personas', icon: <Users className="w-4 h-4" />, disabled: false },
              { id: 'public-personas' as PersonaSource, label: 'Public Personas', icon: <Globe className="w-4 h-4" />, disabled: false },
            ].map((option) => (
              <Button
                key={option.id}
                variant={selectedSource === option.id ? 'default' : 'outline'}
                onClick={() => !option.disabled && handleSourceSelect(option.id)}
                disabled={option.disabled}
                className="justify-start h-auto p-3"
              >
                <div className="flex items-start gap-3 text-left w-full">
                  {option.id === 'project-collections' && collectionsError
                    ? <AlertCircle className="w-4 h-4 text-destructive" />
                    : option.icon}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{option.label}</div>
                    {option.id === 'project-collections' && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {collectionsLoading ? 'Loading...' : collectionsError ?? 'Choose from collections linked to this project'}
                      </div>
                    )}
                  </div>
                  {selectedSource === option.id && <Check className="w-4 h-4" />}
                  {option.id === 'project-collections' && collectionsLoading && (
                    <div className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin" />
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Collection picker */}
        {selectedSource === 'project-collections' && projectCollections.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Choose Collection</h4>
            <Select value={selectedCollection} onValueChange={handleCollectionSelect}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select a collection..." />
              </SelectTrigger>
              <SelectContent>
                {projectCollections.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Search + Filters */}
        {selectedSource && (selectedSource !== 'project-collections' || selectedCollection) && (
          <div className="space-y-3">
            {/* Name search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {nameQuery && (
                <button onClick={() => setNameQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Filters
                {hasActiveFilters && <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">active</span>}
              </button>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground">
                  Clear all
                </button>
              )}
            </div>

            {/* Filter panel */}
            {showFilters && (
              <div className="grid grid-cols-2 gap-3 p-3 border rounded-lg bg-muted/30">
                {/* Gender */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Gender</label>
                  <Select value={selectedGender || '__any__'} onValueChange={(v) => setSelectedGender(v === '__any__' ? '' : v)}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__any__">Any</SelectItem>
                      {GENDER_OPTIONS.map(g => (
                        <SelectItem key={g} value={g} className="capitalize">{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Age range */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Age range</label>
                  <div className="flex items-center gap-1">
                    <Input
                      placeholder="Min"
                      value={ageMin}
                      onChange={(e) => setAgeMin(e.target.value.replace(/\D/g, ''))}
                      className="h-8 text-sm w-16"
                      maxLength={3}
                    />
                    <span className="text-muted-foreground text-sm">–</span>
                    <Input
                      placeholder="Max"
                      value={ageMax}
                      onChange={(e) => setAgeMax(e.target.value.replace(/\D/g, ''))}
                      className="h-8 text-sm w-16"
                      maxLength={3}
                    />
                  </div>
                </div>

                {/* Ethnicity — full width */}
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Ethnicity</label>
                  <Select value={selectedEthnicity || '__any__'} onValueChange={(v) => setSelectedEthnicity(v === '__any__' ? '' : v)}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Any ethnicity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__any__">Any ethnicity</SelectItem>
                      {ETHNICITY_OPTIONS.map(e => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Results */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {isSearching ? 'Searching...' : `${totalCount.toLocaleString()} personas`}
                </span>
                <Badge variant="secondary">{selectedPersonas.length}/{maxPersonas} selected</Badge>
              </div>

              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="text-sm text-muted-foreground">Searching...</p>
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No personas match your search</p>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-xs text-primary mt-1 hover:underline">Clear filters</button>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {results.map((persona) => {
                    const isSelected = selectedPersonas.includes(persona.persona_id);
                    const canSelect = selectedPersonas.length < maxPersonas || isSelected;
                    return (
                      <div
                        key={persona.persona_id}
                        onClick={() => canSelect && togglePersona(persona.persona_id)}
                        className={`flex items-center gap-3 p-2.5 border rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : canSelect
                            ? 'border-border hover:border-primary/50 hover:bg-muted/40'
                            : 'border-border opacity-40 cursor-not-allowed'
                        }`}
                      >
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-muted overflow-hidden flex-shrink-0">
                          {persona.profile_thumbnail_url || persona.profile_image_url ? (
                            <img
                              src={persona.profile_thumbnail_url || persona.profile_image_url || ''}
                              alt={persona.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-medium text-muted-foreground">
                              {persona.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{persona.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {[
                              persona.age ? `${persona.age}y` : null,
                              persona.gender ? persona.gender.charAt(0).toUpperCase() + persona.gender.slice(1) : null,
                              persona.occupation || null,
                            ].filter(Boolean).join(' · ')}
                          </div>
                        </div>

                        {/* Checkbox */}
                        <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                          isSelected ? 'bg-primary border-primary' : 'border-border'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || isSearching}
                    className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ← Prev
                  </button>
                  <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || isSearching}
                    className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
