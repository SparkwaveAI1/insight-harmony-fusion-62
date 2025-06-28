
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Edit, MessageCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Character } from '../types/characterTraitTypes';

interface CharacterDetailHeaderProps {
  character: Character;
  onDownloadJSON: () => void;
}

const CharacterDetailHeader = ({ character, onDownloadJSON }: CharacterDetailHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link to="/characters">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Library
          </Link>
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onDownloadJSON}>
          <Download className="h-4 w-4 mr-2" />
          Download JSON
        </Button>
        <Button variant="outline" asChild>
          <Link to={`/characters/${character.character_id}/chat`}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat
          </Link>
        </Button>
        <Button asChild>
          <Link to={`/characters/${character.character_id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Character
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default CharacterDetailHeader;
