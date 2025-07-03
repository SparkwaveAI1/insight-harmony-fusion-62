
import { useState, useDeferredValue, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Card from '@/components/ui-custom/Card';
import Section from '@/components/ui-custom/Section';
import { useStandardizedCreativeCharacters } from '../hooks/useStandardizedCreativeCharacters';
import { useAuth } from '@/context/AuthContext';
import LibraryHeader from '../components/library/LibraryHeader';
import SearchAndControls from '../components/library/SearchAndControls';
import StandardizedCharacterSections from '../components/library/StandardizedCharacterSections';
import LibraryPagination from '../components/library/LibraryPagination';

const CHARACTERS_PER_PAGE = 12;

const UltraFastCreativeCharacterLibrary = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const offset = (currentPage - 1) * CHARACTERS_PER_PAGE;
  
  // Using ONLY the optimized standardized hook to prevent contention
  const { 
    data: result, 
    isLoading, 
    error,
    isFetching 
  } = useStandardizedCreativeCharacters({
    limit: CHARACTERS_PER_PAGE,
    offset,
    searchQuery: deferredSearchQuery,
    enableSearch: deferredSearchQuery.length >= 2
  });

  const characters = result?.characters || [];
  const totalCount = result?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / CHARACTERS_PER_PAGE);

  const { userCharacters, publicCharacters } = useMemo(() => {
    const userOwned = characters.filter(char => user && char.user_id === user.id);
    const publicOwned = characters.filter(char => !user || char.user_id !== user.id);
    return { userCharacters: userOwned, publicCharacters: publicOwned };
  }, [characters, user]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, []);

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

  if (error) {
    console.error('❌ Character library error:', error);
    return (
      <div className="w-full px-4 md:px-8 py-8">
        <Section>
          <Card className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2 text-red-600">Error Loading Characters</h2>
            <p className="text-muted-foreground mb-4">
              {error.message || 'Failed to load characters'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => setCurrentPage(1)}>
                Reset Filters
              </Button>
            </div>
          </Card>
        </Section>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-8 py-8">
      <Section>
        <div className="flex flex-col gap-6 mb-8">
          <LibraryHeader 
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            isFetching={isFetching}
          />
          <SearchAndControls
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            deferredSearchQuery={deferredSearchQuery}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          />
        </div>
        <StandardizedCharacterSections
          userCharacters={userCharacters}
          publicCharacters={publicCharacters}
          viewMode={viewMode}
          currentUserId={user?.id}
          user={user}
          deferredSearchQuery={deferredSearchQuery}
        />
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
