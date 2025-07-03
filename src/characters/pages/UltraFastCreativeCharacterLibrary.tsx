
import { useState, useDeferredValue, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Card from '@/components/ui-custom/Card';
import Section from '@/components/ui-custom/Section';
import { useHighPerformanceCreativeCharacters } from '../hooks/useHighPerformanceCreativeCharacters';
import { useAuth } from '@/context/AuthContext';
import LibraryHeader from '../components/library/LibraryHeader';
import SearchAndControls from '../components/library/SearchAndControls';
import CharacterSections from '../components/library/CharacterSections';
import LibraryPagination from '../components/library/LibraryPagination';

const CHARACTERS_PER_PAGE = 12;

const UltraFastCreativeCharacterLibrary = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Use deferred value for search to prevent excessive re-renders
  const deferredSearchQuery = useDeferredValue(searchQuery);
  
  const offset = (currentPage - 1) * CHARACTERS_PER_PAGE;
  
  const { 
    data: result, 
    isLoading, 
    error,
    isFetching 
  } = useHighPerformanceCreativeCharacters({
    limit: CHARACTERS_PER_PAGE,
    offset,
    searchQuery: deferredSearchQuery,
    enableSearch: deferredSearchQuery.length > 0
  });

  const characters = result?.characters || [];
  const totalCount = result?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / CHARACTERS_PER_PAGE);

  // Memoized character grouping
  const { userCharacters, publicCharacters } = useMemo(() => {
    const userOwned = characters.filter(char => user && char.user_id === user.id);
    const publicOwned = characters.filter(char => !user || char.user_id !== user.id);
    return { userCharacters: userOwned, publicCharacters: publicOwned };
  }, [characters, user]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, []);

  // Loading state
  if (authLoading || (isLoading && currentPage === 1 && !deferredSearchQuery)) {
    return (
      <div className="w-full px-4 md:px-8 py-8">
        <Section>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading characters...</p>
            </div>
          </div>
        </Section>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full px-4 md:px-8 py-8">
        <Section>
          <Card className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2 text-red-600">Error Loading Characters</h2>
            <p className="text-muted-foreground mb-4">
              {error.message || 'Failed to load characters'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </Card>
        </Section>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-8 py-8">
      <Section>
        {/* Header */}
        <div className="flex flex-col gap-6 mb-8">
          <LibraryHeader 
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            isFetching={isFetching}
          />

          {/* Search and View Controls */}
          <SearchAndControls
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            deferredSearchQuery={deferredSearchQuery}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          />
        </div>

        {/* Character Grid/List */}
        <CharacterSections
          userCharacters={userCharacters}
          publicCharacters={publicCharacters}
          viewMode={viewMode}
          currentUserId={user?.id}
          user={user}
          deferredSearchQuery={deferredSearchQuery}
        />

        {/* Pagination */}
        <LibraryPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isFetching={isFetching}
        />
      </Section>
    </div>
  );
};

export default UltraFastCreativeCharacterLibrary;
