import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import PersonaCard from "./PersonaCard";
import PersonaLoadingState from "./PersonaLoadingState";
import PersonaEmptyState from "./PersonaEmptyState";
import { V4Persona } from "@/types/persona-v4";
import { getPublicPersonasByIds } from "@/services/persona";
import { useFilteredPersonaSearch } from "@/hooks/useFilteredPersonaSearch";
import { PersonaFilterPanel } from "./PersonaFilterPanel";
import { DEFAULT_FILTERS } from "@/types/personaFilters";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PublicPersonasListProps {
  onPersonasLoad?: (personas: V4Persona[]) => void;
  className?: string;
}

const PublicPersonasList = ({
  onPersonasLoad,
  className = "grid grid-cols-1 lg:grid-cols-2 gap-6"
}: PublicPersonasListProps) => {
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Server-side filtered search using RPC - this is now the PRIMARY data source
  const {
    results: filteredResults,
    totalCount,
    isLoading: isFilterLoading,
    filters,
    setFilters,
    resetFilters,
    search: executeFilteredSearch,
    hasActiveFilters,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useFilteredPersonaSearch(DEFAULT_FILTERS, { publicOnly: true, limit: itemsPerPage });

  // Get the persona IDs from results to fetch full data
  const personaIds = useMemo(
    () => filteredResults.map(r => r.persona_id),
    [filteredResults]
  );

  // Fetch full persona data for display (PersonaCard needs full V4Persona structure)
  const { data: fullPersonas = [], isLoading: isLoadingFullPersonas, refetch } = useQuery({
    queryKey: ['public-personas-full', personaIds],
    queryFn: () => getPublicPersonasByIds(personaIds),
    enabled: personaIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // Maintain the order from search results when displaying personas
  const orderedPersonas = useMemo(() => {
    if (!fullPersonas.length) return [];
    const personaMap = new Map(fullPersonas.map(p => [p.persona_id, p]));
    return personaIds
      .map(id => personaMap.get(id))
      .filter((p): p is V4Persona => p !== undefined);
  }, [fullPersonas, personaIds]);

  // Initial load - fetch first page on mount
  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true);
      executeFilteredSearch();
    }
  }, [hasInitialized, executeFilteredSearch]);

  // Update the parent component with loaded personas
  useEffect(() => {
    if (orderedPersonas.length > 0 && onPersonasLoad) {
      onPersonasLoad(orderedPersonas);
    }
  }, [orderedPersonas, onPersonasLoad]);

  // Handle items per page change - reset to page 1 and re-search
  const handleItemsPerPageChange = useCallback((newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    // Note: useFilteredPersonaSearch will need to be updated to react to limit changes
    // For now, we trigger a new search after state updates
    setTimeout(() => executeFilteredSearch(), 0);
  }, [setCurrentPage, executeFilteredSearch]);

  const isLoading = isFilterLoading || isLoadingFullPersonas;

  // Handle page changes
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    setTimeout(() => executeFilteredSearch(), 0);
  }, [setCurrentPage, executeFilteredSearch]);

  const handleVisibilityChange = useCallback((personaId: string, isPublic: boolean) => {
    if (!isPublic) {
      // Re-fetch current page when a persona is made private
      executeFilteredSearch();
    }
  }, [executeFilteredSearch]);

  // Show loading state on initial load
  if (isLoading && !hasInitialized) {
    return <PersonaLoadingState />;
  }

  return (
    <div>
      {/* Advanced Filter Panel */}
      <PersonaFilterPanel
        filters={filters}
        onChange={setFilters}
        onApply={executeFilteredSearch}
        onClear={() => {
          resetFilters();
          setTimeout(() => executeFilteredSearch(), 0);
        }}
        isLoading={isFilterLoading}
        resultCount={totalCount}
      />

      {/* Loading state */}
      {isLoading && <PersonaLoadingState />}

      {/* Results grid */}
      {!isLoading && orderedPersonas.length > 0 && (
        <div className={className}>
          {orderedPersonas.map((persona) => (
            <PersonaCard
              key={persona.persona_id}
              persona={persona}
              onVisibilityChange={handleVisibilityChange}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && orderedPersonas.length === 0 && hasInitialized && (
        <div className="text-center py-12">
          {hasActiveFilters ? (
            <>
              <p className="text-muted-foreground">No personas match your filter criteria.</p>
              <Button variant="link" onClick={() => {
                resetFilters();
                setTimeout(() => executeFilteredSearch(), 0);
              }} className="mt-2">
                Clear all filters
              </Button>
            </>
          ) : (
            <PersonaEmptyState />
          )}
        </div>
      )}

      {/* Pagination */}
      {orderedPersonas.length > 0 && (
        <div className="flex justify-center items-center gap-4 mt-8 pb-8 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show:</span>
            <Select value={String(itemsPerPage)} onValueChange={(val) => handleItemsPerPageChange(Number(val))}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {totalPages > 1 && (
            <>
              <Button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || isLoading}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} ({totalCount.toLocaleString()} personas)
              </span>

              <Button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || isLoading}
                variant="outline"
                size="sm"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {totalPages <= 1 && (
            <span className="text-sm text-muted-foreground">
              {totalCount.toLocaleString()} personas
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicPersonasList;
