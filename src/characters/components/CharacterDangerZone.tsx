
import React from 'react';
import Card from '@/components/ui-custom/Card';
import DeleteCharacterButton from './DeleteCharacterButton';

interface CharacterDangerZoneProps {
  characterId: string;
  characterName: string;
  onDeleted: () => Promise<void>;
}

const CharacterDangerZone = ({ characterId, characterName, onDeleted }: CharacterDangerZoneProps) => {
  return (
    <Card className="p-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2 text-destructive">Danger Zone</h3>
        <p className="text-muted-foreground mb-4">
          Once you delete a character, there is no going back. Please be certain.
        </p>
        <DeleteCharacterButton
          characterId={characterId}
          characterName={characterName}
          onDeleted={onDeleted}
        />
      </div>
    </Card>
  );
};

export default CharacterDangerZone;
