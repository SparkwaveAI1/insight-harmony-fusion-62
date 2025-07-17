
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Edit, Download, Sparkles, Copy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Character } from '../types/characterTraitTypes';
import CharacterCloneForm from './CharacterCloneForm';

interface CharacterDetailHeaderProps {
  character: Character;
  onDownloadJSON: () => void;
}

const CharacterDetailHeader = ({ character, onDownloadJSON }: CharacterDetailHeaderProps) => {
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const isCreativeCharacter = character.creation_source === 'creative';

  const handleCopyCharacterId = async () => {
    try {
      await navigator.clipboard.writeText(character.character_id);
      toast.success('Character ID copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy character ID');
    }
  };

  // Determine the correct back link based on character type
  const getBackLink = () => {
    if (isCreativeCharacter) {
      return "/characters/creative";
    }
    return "/characters";
  };

  const getBackText = () => {
    if (isCreativeCharacter) {
      return "Back to Character Lab";
    }
    return "Back to Library";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link to={getBackLink()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {getBackText()}
            </Link>
          </Button>
          
          {isCreativeCharacter && (
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Character Lab
              </Badge>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={cloneDialogOpen} onOpenChange={setCloneDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Clone & Customize
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">Clone & Customize Character</DialogTitle>
                <DialogDescription>
                  Create a customized version of this character using the appropriate creation process for their type.
                </DialogDescription>
              </DialogHeader>
              <CharacterCloneForm character={character} />
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={onDownloadJSON}>
            <Download className="h-4 w-4 mr-2" />
            Download JSON
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/characters/${character.character_id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Character
            </Link>
          </Button>
        </div>
      </div>

      {/* Character ID Display */}
      <div className="bg-muted/50 rounded-lg p-3 border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Character ID:</span>
            <code className="text-sm font-mono bg-background px-2 py-1 rounded border">
              {character.character_id}
            </code>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyCharacterId}
            className="h-8 w-8 p-0"
            title="Copy Character ID"
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CharacterDetailHeader;
