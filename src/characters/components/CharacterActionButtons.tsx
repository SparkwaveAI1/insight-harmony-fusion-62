
import { MessageCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Character } from "../types/characterTraitTypes";
import CharacterCloneForm from "./CharacterCloneForm";

interface CharacterActionButtonsProps {
  characterId: string;
  character: Character;
  onChatClick: (characterId: string) => void;
}

export default function CharacterActionButtons({
  characterId,
  character,
  onChatClick
}: CharacterActionButtonsProps) {
  return (
    <div className="space-y-2">
      <Button 
        variant="default" 
        onClick={() => onChatClick(characterId)} 
        className="w-full flex items-center justify-center gap-2"
      >
        <MessageCircle className="h-4 w-4" />
        Chat with Character
      </Button>
      
      <CharacterCloneForm character={character} />
    </div>
  );
}
