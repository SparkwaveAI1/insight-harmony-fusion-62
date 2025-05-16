
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Save, Edit } from 'lucide-react';

interface ConversationContextProps {
  context: string;
  onContextChange: (context: string) => void;
}

const ConversationContext: React.FC<ConversationContextProps> = ({
  context,
  onContextChange
}) => {
  const [isEditing, setIsEditing] = useState(!context);
  const [draftContext, setDraftContext] = useState(context || '');

  const handleSave = () => {
    onContextChange(draftContext);
    setIsEditing(false);
  };

  return (
    <Card className="p-4 mb-4 bg-muted/30 border border-muted">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-sm">Conversation Context</h3>
        {!isEditing && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(true)}
            className="h-8 px-2"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea 
            value={draftContext} 
            onChange={(e) => setDraftContext(e.target.value)} 
            placeholder="Set a context for this conversation (e.g., 'We're in a job interview', 'We're discussing climate policy', etc.)"
            className="min-h-[80px] text-sm"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              size="sm"
              className="h-8"
            >
              <Save className="h-4 w-4 mr-1" />
              Save Context
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-background p-3 rounded-md border text-sm">
          {context ? context : <span className="text-muted-foreground italic">No context set for this conversation</span>}
        </div>
      )}
    </Card>
  );
};

export default ConversationContext;
