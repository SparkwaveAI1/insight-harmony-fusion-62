
import { FlaskConical, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface LibraryHeaderProps {
  totalCount: number;
  currentPage: number;
  totalPages: number;
  isFetching: boolean;
}

const LibraryHeader = ({ totalCount, currentPage, totalPages, isFetching }: LibraryHeaderProps) => {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <FlaskConical className="h-6 w-6 md:h-8 md:w-8 text-primary" />
        <div>
          <h1 className="text-xl md:text-3xl font-bold">Character Lab Library</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {user ? 'Creative characters from your lab' : 'Public community creations'}
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
  );
};

export default LibraryHeader;
