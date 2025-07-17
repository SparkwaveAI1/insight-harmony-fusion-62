
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HistoricalCharacterHeaderProps {
  onBackClick: () => void;
}

const HistoricalCharacterHeader = ({ onBackClick }: HistoricalCharacterHeaderProps) => {
  return (
    <>
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackClick}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Characters
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <Clock className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Create Historical Character</h1>
          <p className="text-muted-foreground">Design a character based on a real historical figure</p>
        </div>
      </div>
    </>
  );
};

export default HistoricalCharacterHeader;
