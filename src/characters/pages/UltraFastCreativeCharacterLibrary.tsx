
import { useState, useDeferredValue, useCallback, useMemo } from 'react';
import { FlaskConical, Plus, Grid, List, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Card from '@/components/ui-custom/Card';
import Section from '@/components/ui-custom/Section';
import { useHighPerformanceCreativeCharacters } from '../hooks/useHighPerformanceCreativeCharacters';
import { Link } from 'react-router-dom';
import OptimizedCharacterCard from '../components/OptimizedCharacterCard';
import { useAuth } from '@/context/AuthContext';

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FlaskConical className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              <div>
                <h1 className="text-xl md:text-3xl font-bold">Character Lab Library</h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  {user ? 'Optimized performance for managing your creative characters' : 'Public community creations'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalCount} total characters • Page {currentPage} of {totalPages}
                  {isFetching && ' • Loading...'}
                </p>
              </div>
            </div>
            {user && (
              <Button asChild>
                <Link to="/characters/create/creative">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Character
                </Link>
              </Button>
            )}
          </div>

          {/* Search and View Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search characters..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10"
              />
              {deferredSearchQuery !== searchQuery && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewModeChange('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewModeChange('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Character Grid/List */}
        {characters.length === 0 ? (
          <Card className="text-center py-12">
            <FlaskConical className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {deferredSearchQuery ? 'No characters found' : 'No creative characters yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {deferredSearchQuery 
                ? 'Try adjusting your search or browse different pages'
                : user 
                  ? 'Create your first creative character to get started'
                  : 'Sign in to create and view your own characters'
              }
            </p>
            {!deferredSearchQuery && user && (
              <Button asChild>
                <Link to="/characters/create/creative">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Character
                </Link>
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-8">
            {/* User's Characters Section */}
            {user && userCharacters.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Your Characters ({userCharacters.length})</h2>
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                  : "space-y-4"
                }>
                  {userCharacters.map((character) => (
                    <OptimizedCharacterCard
                      key={character.character_id}
                      character={character}
                      viewMode={viewMode}
                      currentUserId={user.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Public Characters Section */}
            {publicCharacters.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Community Characters ({publicCharacters.length})</h2>
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                  : "space-y-4"
                }>
                  {publicCharacters.map((character) => (
                    <OptimizedCharacterCard
                      key={character.character_id}
                      character={character}
                      viewMode={viewMode}
                      currentUserId={user?.id}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Optimized Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isFetching}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    disabled={isFetching}
                    className="w-10 h-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isFetching}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Section>
    </div>
  );
};

export default UltraFastCreativeCharacterLibrary;
