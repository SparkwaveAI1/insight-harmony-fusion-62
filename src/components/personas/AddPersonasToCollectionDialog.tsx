import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, CheckSquare, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { addPersonasToCollection } from "@/services/collections";
import { supabase } from "@/integrations/supabase/client";
import { FilteredSearchResult } from "@/hooks/useFilteredPersonaSearch";

interface AddPersonasToCollectionDialogProps {
  collectionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPersonasAdded: () => void;
}

const PAGE_SIZE = 50;

const AddPersonasToCollectionDialog: React.FC<AddPersonasToCollectionDialogProps> = ({
  collectionId,
  open,
  onOpenChange,
  onPersonasAdded,
}) => {
  const { user } = useAuth();
  const [personas, setPersonas] = useState<FilteredSearchResult[]>([]);
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  // IDs already in collection — to exclude from results
  const [existingIds, setExistingIds] = useState<Set<string>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load existing collection persona IDs once when dialog opens
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setSelectedPersonaIds([]);
      setPersonas([]);
      setTotalCount(0);
      return;
    }
    if (!user) return;

    const loadExisting = async () => {
      const { data } = await supabase
        .from('collection_personas')
        .select('persona_id')
        .eq('collection_id', collectionId);
      const ids = new Set<string>((data || []).map((r: any) => r.persona_id));
      setExistingIds(ids);
    };
    loadExisting();
  }, [open, collectionId, user]);

  // Server-side search using the same RPC that powers PersonaViewer
  const runSearch = useCallback(async (query: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('search_personas_unified', {
        p_search_query: query.trim() || null,
        p_user_id: null,        // search all personas (public + own)
        p_public_only: false,
        p_age_min: null,
        p_age_max: null,
        p_genders: null,
        p_ethnicities: null,
        p_states: null,
        p_occupations_contain: null,
        p_income_brackets: null,
        p_education_levels: null,
        p_has_children: null,
        p_political_leans: null,
        p_interest_tags: null,
        p_health_tags: null,
        p_limit: PAGE_SIZE,
        p_offset: 0,
      });

      if (error) {
        console.error('Search error:', error);
        toast.error('Search failed. Please try again.');
        return;
      }

      // Filter out personas already in the collection
      const results: FilteredSearchResult[] = (data || []).filter(
        (p: FilteredSearchResult) => !existingIds.has(p.persona_id)
      );
      setPersonas(results);
      setTotalCount(results.length > 0 ? (results[0].total_count ?? results.length) : 0);
    } catch (err) {
      console.error('Search exception:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, existingIds]);

  // Run initial search when existingIds loads or dialog opens
  useEffect(() => {
    if (open && user && existingIds !== undefined) {
      runSearch('');
    }
  }, [open, user, existingIds]);

  // Debounced search on searchTerm change
  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(searchTerm);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm, open]);

  const handleCheckboxChange = (personaId: string) => {
    setSelectedPersonaIds(prev =>
      prev.includes(personaId) ? prev.filter(id => id !== personaId) : [...prev, personaId]
    );
  };

  const handleSelectAll = () => setSelectedPersonaIds(personas.map(p => p.persona_id));
  const handleClearAll = () => setSelectedPersonaIds([]);

  const handleAddPersonas = async () => {
    if (selectedPersonaIds.length === 0) {
      toast.info("Please select at least one persona to add");
      return;
    }
    setIsAdding(true);
    try {
      const success = await addPersonasToCollection(collectionId, selectedPersonaIds);
      if (success) {
        toast.success(`${selectedPersonaIds.length} persona${selectedPersonaIds.length !== 1 ? 's' : ''} added to collection!`);
        onPersonasAdded();
        onOpenChange(false);
        setSelectedPersonaIds([]);
      } else {
        toast.error("Failed to add personas to collection.");
      }
    } catch (error) {
      console.error("Error adding personas:", error);
      toast.error("Failed to add personas to collection.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            Add Personas to Collection
            <Badge variant="secondary">{selectedPersonaIds.length} selected</Badge>
          </DialogTitle>
          <DialogDescription>
            Search across all personas by name, occupation, location, demographics, or any trait.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-3 py-2 overflow-hidden flex flex-col">
          {/* Search bar */}
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder='Search by name, occupation, location, "retired teacher", "Ohio", "age 55"...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9"
              autoFocus
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Count + bulk controls */}
          <div className="flex items-center justify-between flex-shrink-0 text-xs text-muted-foreground px-1">
            <span>
              {isLoading
                ? 'Searching...'
                : `${personas.length} result${personas.length !== 1 ? 's' : ''}${totalCount > PAGE_SIZE ? ` (showing first ${PAGE_SIZE})` : ''}`}
            </span>
            {personas.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll} disabled={isLoading}>
                  <CheckSquare className="h-3 w-3 mr-1" /> Select All
                </Button>
                <Button variant="outline" size="sm" onClick={handleClearAll} disabled={selectedPersonaIds.length === 0}>
                  <Square className="h-3 w-3 mr-1" /> Clear
                </Button>
              </div>
            )}
          </div>

          {/* Persona list */}
          <ScrollArea className="flex-1 min-h-0 rounded-md border">
            {isLoading && personas.length === 0 ? (
              <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Searching personas...</span>
              </div>
            ) : personas.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {searchTerm
                  ? `No personas found matching "${searchTerm}".`
                  : 'All available personas are already in this collection.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
                {personas.map(persona => {
                  const isSelected = selectedPersonaIds.includes(persona.persona_id);
                  return (
                    <Card
                      key={persona.persona_id}
                      className={`cursor-pointer transition-all duration-150 ${isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                      onClick={() => handleCheckboxChange(persona.persona_id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          {persona.profile_thumbnail_url || persona.profile_image_url ? (
                            <img
                              src={persona.profile_thumbnail_url || persona.profile_image_url}
                              alt={persona.name}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0 mt-0.5"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-medium text-muted-foreground">
                              {persona.name?.[0]?.toUpperCase() ?? '?'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                                {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                              </div>
                              <h3 className="font-semibold text-sm truncate">{persona.name}</h3>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {persona.age && (
                                <Badge variant="outline" className="text-xs py-0 px-1.5">Age {persona.age}</Badge>
                              )}
                              {persona.gender && (
                                <Badge variant="outline" className="text-xs py-0 px-1.5">{persona.gender}</Badge>
                              )}
                              {persona.occupation && (
                                <Badge variant="outline" className="text-xs py-0 px-1.5 max-w-[120px] truncate">{persona.occupation}</Badge>
                              )}
                              {(persona.city || persona.state_region) && (
                                <Badge variant="outline" className="text-xs py-0 px-1.5">
                                  📍 {[persona.city, persona.state_region].filter(Boolean).join(', ')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter className="border-t pt-4 flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              {selectedPersonaIds.length} persona{selectedPersonaIds.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isAdding}>
                Cancel
              </Button>
              <Button onClick={handleAddPersonas} disabled={selectedPersonaIds.length === 0 || isAdding}>
                {isAdding ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Adding...</>
                ) : (
                  `Add ${selectedPersonaIds.length > 0 ? selectedPersonaIds.length : ''} Persona${selectedPersonaIds.length !== 1 ? 's' : ''}`
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPersonasToCollectionDialog;
