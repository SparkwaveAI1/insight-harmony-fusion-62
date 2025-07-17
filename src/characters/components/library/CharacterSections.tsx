
import { Link } from 'react-router-dom';
import { FlaskConical, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Card from '@/components/ui-custom/Card';
import StandardizedCreativeCharacterCard from '../StandardizedCreativeCharacterCard';
import { CharacterCardData } from '../../types/cardTypes';

interface CharacterSectionsProps {
  userCharacters: CharacterCardData[];
  publicCharacters: CharacterCardData[];
  viewMode: 'grid' | 'list';
  currentUserId?: string;
  user: any;
  deferredSearchQuery: string;
}

const CharacterSections = ({ 
  userCharacters, 
  publicCharacters, 
  viewMode, 
  currentUserId, 
  user,
  deferredSearchQuery 
}: CharacterSectionsProps) => {
  const totalCharacters = userCharacters.length + publicCharacters.length;

  if (totalCharacters === 0) {
    return (
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
    );
  }

  const gridClasses = viewMode === 'grid' 
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
    : "space-y-4";

  return (
    <div className="space-y-8">
      {user && userCharacters.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Characters ({userCharacters.length})</h2>
          <div className={gridClasses}>
            {userCharacters.map((character) => (
              <StandardizedCreativeCharacterCard
                key={character.character_id}
                character={character}
                viewMode={viewMode}
              />
            ))}
          </div>
        </div>
      )}

      {publicCharacters.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Community Characters ({publicCharacters.length})</h2>
          <div className={gridClasses}>
            {publicCharacters.map((character) => (
              <StandardizedCreativeCharacterCard
                key={character.character_id}
                character={character}
                viewMode={viewMode}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterSections;
