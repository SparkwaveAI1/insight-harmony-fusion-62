import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertTriangle, RefreshCw, CheckSquare } from 'lucide-react';
import { V4Persona } from '@/types/persona-v4';
import { 
  validatePersona,
  hasRequiredKeys
} from '@/services/v4-persona/v4PersonaValidation';
import { 
  completeV4Persona, 
  getV4PersonaCompletionRecommendation 
} from '@/services/v4-persona/v4PersonaCompletion';
import { normalizeV4PersonaProfile } from '@/services/v4-persona/v4PersonaNormalize';
import { markV4PersonaAsComplete } from '@/services/persona';
import { toast } from 'sonner';

interface V4PersonaCompletionCardProps {
  persona: V4Persona;
  onPersonaUpdated?: (updatedPersona: V4Persona) => void;
}

export function V4PersonaCompletionCard({ persona, onPersonaUpdated }: V4PersonaCompletionCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  
  const validation = validatePersona(persona.full_profile || {});
  const needsCompletion = !validation.isValid || !persona.creation_completed;
  const status = persona.creation_completed ? 'Complete' : (persona.creation_stage || 'Incomplete');
  const recommendation = getV4PersonaCompletionRecommendation(persona);

  // Don't show card if persona is complete
  if (validation.isValid && persona.creation_completed) {
    return null;
  }

  const handleCompletePersona = async () => {
    setIsCompleting(true);
    
    try {
      console.log('🔄 Starting V4 persona completion for:', persona.persona_id);
      
      const result = await completeV4Persona(persona.persona_id);
      
      if (result.success) {
        toast.success('V4 persona completed successfully!');
        
        if (result.persona && onPersonaUpdated) {
          onPersonaUpdated(result.persona);
        }
      } else {
        // Show more specific error messages
        const errorMessage = result.error || 'Failed to complete V4 persona';
        console.error('V4 persona completion failed:', result);
        
        if (errorMessage.includes('internal error')) {
          toast.error('An internal error occurred. The enhancement system is being updated. Please try again in a few minutes.');
        } else if (errorMessage.includes('timeout')) {
          toast.error('Enhancement timed out. This persona may be complex - please try again.');
        } else {
          toast.error(`Enhancement failed: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('Error completing V4 persona:', error);
      toast.error('An unexpected error occurred during enhancement. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleMarkAsComplete = async () => {
    setIsMarkingComplete(true);
    
    try {
      console.log('🔄 Marking V4 persona as complete:', persona.persona_id);
      
      const success = await markV4PersonaAsComplete(persona.persona_id);
      
      if (success) {
        toast.success('Persona marked as complete!');
        
        // Update local persona state
        if (onPersonaUpdated) {
          onPersonaUpdated({
            ...persona,
            creation_completed: true,
            creation_stage: 'completed'
          });
        }
      } else {
        toast.error('Failed to mark persona as complete');
      }
    } catch (error) {
      console.error('Error marking persona as complete:', error);
      toast.error('Failed to mark persona as complete');
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const getStatusIcon = () => {
    if (validation.isValid && persona.creation_completed) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (validation.errors.length > 0) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    return <RefreshCw className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusVariant = () => {
    if (validation.isValid && persona.creation_completed) return "default";
    if (validation.errors.length > 0) return "destructive";
    return "secondary";
  };

  return (
    <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">
              {recommendation.actionRequired === 'update_completion_status' ? 'Persona Appears Complete' : 'V4 Persona Incomplete'}
            </CardTitle>
          </div>
          <Badge variant={getStatusVariant()}>
            {status}
          </Badge>
        </div>
        <CardDescription>
          {recommendation.actionRequired === 'update_completion_status' 
            ? 'This persona appears to be complete but needs status update in the database.'
            : 'This V4 persona is not fully generated and may not work properly in conversations.'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Details */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Current Status:</h4>
          <div className="text-sm text-muted-foreground">
            <div>Stage: <code className="bg-muted px-1 py-0.5 rounded">{persona.creation_stage || 'Unknown'}</code></div>
            <div>Creation completed: <code className="bg-muted px-1 py-0.5 rounded">{String(persona.creation_completed || false)}</code></div>
            <div>Has full profile: <code className="bg-muted px-1 py-0.5 rounded">{String(!!persona.full_profile)}</code></div>
            <div>Validation score: <code className="bg-muted px-1 py-0.5 rounded">{validation.completenessScore.toFixed(2)}</code></div>
          </div>
        </div>

        {/* Validation errors showing specific missing fields */}
        {validation.errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Missing or Invalid Fields:</h4>
            <div className="flex flex-wrap gap-1">
              {validation.errors.map((error, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {error.replace('Missing required field: ', '').replace('Missing ', '')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Errors */}
        {validation.errors.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {validation.errors.map((error, index) => (
                  <div key={index} className="text-sm">{error}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Warnings */}
        {validation.warnings.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {validation.warnings.map((warning, index) => (
                  <div key={index} className="text-sm">{warning}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Recommendation */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Recommendation:</h4>
          <p className="text-sm text-muted-foreground">{recommendation.recommendation}</p>
        </div>

        {/* Completion Button */}
        {recommendation.canComplete && (
          <Button 
            onClick={handleCompletePersona}
            disabled={isCompleting}
            className="w-full"
          >
            {isCompleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Completing V4 Persona...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Complete V4 Persona
              </>
            )}
          </Button>
        )}

        {/* Mark as Complete Button */}
        {recommendation.actionRequired === 'update_completion_status' && (
          <Button 
            onClick={handleMarkAsComplete}
            disabled={isMarkingComplete}
            className="w-full"
            variant="outline"
          >
            {isMarkingComplete ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Marking as Complete...
              </>
            ) : (
              <>
                <CheckSquare className="mr-2 h-4 w-4" />
                Mark as Complete
              </>
            )}
          </Button>
        )}

        {!recommendation.canComplete && recommendation.actionRequired === 'regenerate_persona' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This persona needs to be regenerated from scratch. The detailed traits generation failed or is missing.
              Consider deleting this persona and creating a new one.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}