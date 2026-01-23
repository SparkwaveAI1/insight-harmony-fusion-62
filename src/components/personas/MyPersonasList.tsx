import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PersonaCard from "./PersonaCard";
import PersonaLoadingState from "./PersonaLoadingState";
import PersonaEmptyState from "./PersonaEmptyState";
import { V4Persona } from "@/types/persona-v4";
import { getMyPersonasByIds } from "@/services/persona";
import { useFilteredPersonaSearch } from "@/hooks/useFilteredPersonaSearch";
import { PersonaFilterPanel } from "./PersonaFilterPanel";
import { DEFAULT_FILTERS } from "@/types/personaFilters";
import { useAuth } from "@/context/AuthContext";
import { updatePersonaVisibility } from "@/services/persona/operations/updatePersona";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MyPersonasListProps {
  onPersonasLoad?: (personas: V4Persona[]) => void;
  className?: string;
}

const MyPersonasList = ({
  onPersonasLoad,
  className = "grid grid-cols-1 lg:grid-cols-2 gap-6"
}: MyPersonasListProps) => {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
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
  } = useFilteredPersonaSearch(DEFAULT_FILTERS, {
    publicOnly: false,
    userId: user?.id,
    limit: itemsPerPage
  });

  // Get the persona IDs from results to fetch full data
  const personaIds = useMemo(
    () => filteredResults.map(r => r.persona_id),
    [filteredResults]
  );

  // Fetch full persona data for display (PersonaCard needs full V4Persona structure)
  const { data: fullPersonas = [], isLoading: isLoadingFullPersonas } = useQuery({
    queryKey: ['my-personas-full', personaIds, user?.id],
    queryFn: () => getMyPersonasByIds(personaIds, user?.id || ''),
    enabled: personaIds.length > 0 && !!user?.id,
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

  // Initial load - fetch first page on mount when user is available
  useEffect(() => {
    if (!hasInitialized && user?.id && !authLoading) {
      setHasInitialized(true);
      executeFilteredSearch();
    }
  }, [hasInitialized, user?.id, authLoading, executeFilteredSearch]);

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
    setTimeout(() => executeFilteredSearch(), 0);
  }, [setCurrentPage, executeFilteredSearch]);

  const isLoading = isFilterLoading || isLoadingFullPersonas;

  // Handle page changes
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    setTimeout(() => executeFilteredSearch(), 0);
  }, [setCurrentPage, executeFilteredSearch]);

  // Handle visibility changes
  const handleVisibilityChange = useCallback(async (personaId: string, isPublic: boolean) => {
    try {
      await updatePersonaVisibility(personaId, isPublic);
      queryClient.invalidateQueries({ queryKey: ['my-personas-full'] });
      queryClient.invalidateQueries({ queryKey: ['public-personas-full'] });
      executeFilteredSearch();
    } catch (error) {
      console.error("Error updating persona visibility:", error);
    }
  }, [queryClient, executeFilteredSearch]);

  // Handle deletion
  const handleDelete = useCallback((personaId: string) => {
    queryClient.invalidateQueries({ queryKey: ['my-personas-full'] });
    executeFilteredSearch();
  }, [queryClient, executeFilteredSearch]);

  if (authLoading) {
    return <PersonaLoadingState />;
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please sign in to view your personas.</p>
      </div>
    );
  }

  // Show loading state on initial load
  if (isLoading && !hasInitialized) {
    return <PersonaLoadingState />;
  }

  return (
    <div>
      {/* Filter Panel */}
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
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && orderedPersonas.length === 0 && hasInitialized && (
        <PersonaEmptyState />
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

export default MyPersonasList;
