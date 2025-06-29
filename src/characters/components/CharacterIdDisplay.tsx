
import React from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CharacterIdDisplayProps {
  characterId: string;
  className?: string;
}

const CharacterIdDisplay = ({ characterId, className = "" }: CharacterIdDisplayProps) => {
  const handleCopyCharacterId = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if inside a link
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(characterId);
      toast.success('Character ID copied');
    } catch (error) {
      toast.error('Failed to copy ID');
    }
  };

  // Truncate long IDs for display
  const displayId = characterId.length > 12 
    ? `${characterId.slice(0, 8)}...${characterId.slice(-4)}`
    : characterId;

  return (
    <div className={`flex items-center gap-1 text-xs text-muted-foreground ${className}`}>
      <span>ID:</span>
      <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
        {displayId}
      </code>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopyCharacterId}
        className="h-5 w-5 p-0 hover:bg-muted"
        title="Copy full character ID"
      >
        <Copy className="h-2.5 w-2.5" />
      </Button>
    </div>
  );
};

export default CharacterIdDisplay;
