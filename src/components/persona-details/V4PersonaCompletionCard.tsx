import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { V4Persona } from '@/types/persona-v4';
import { 
  validateV4PersonaCompleteness, 
  getV4PersonaCompletionStatus,
  needsV4PersonaCompletion 
} from '@/services/v4-persona/v4PersonaValidation';
import { 
  completeV4Persona, 
  getV4PersonaCompletionRecommendation 
} from '@/services/v4-persona/v4PersonaCompletion';
import { toast } from 'sonner';

interface V4PersonaCompletionCardProps {
  persona: V4Persona;
  onPersonaUpdated?: (updatedPersona: V4Persona) => void;
}

export function V4PersonaCompletionCard({ persona, onPersonaUpdated }: V4PersonaCompletionCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  
  const validation = validateV4PersonaCompleteness(persona);
  const needsCompletion = needsV4PersonaCompletion(persona);
  const status = getV4PersonaCompletionStatus(persona);
  const recommendation = getV4PersonaCompletionRecommendation(persona);

  // Don't show card if persona is complete
  if (validation.isComplete) {
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
        toast.error(result.error || 'Failed to complete V4 persona');
      }
    } catch (error) {
      console.error('Error completing V4 persona:', error);
      toast.error('Failed to complete V4 persona');
    } finally {
      setIsCompleting(false);
    }
  };

  const getStatusIcon = () => {
    if (validation.isComplete) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (validation.errors.length > 0) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    return <RefreshCw className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusVariant = () => {
    if (validation.isComplete) return "default";
    if (validation.errors.length > 0) return "destructive";
    return "secondary";
  };

  return (
    <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">V4 Persona Incomplete</CardTitle>
          </div>
          <Badge variant={getStatusVariant()}>
            {status}
          </Badge>
        </div>
        <CardDescription>
          This V4 persona is not fully generated and may not work properly in conversations.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Details */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Current Status:</h4>
          <div className="text-sm text-muted-foreground">
            <div>Stage: <code className="bg-muted px-1 py-0.5 rounded">{validation.stage}</code></div>
            <div>Creation completed: <code className="bg-muted px-1 py-0.5 rounded">{String(validation.completeness.isCreationCompleted)}</code></div>
            <div>Has full profile: <code className="bg-muted px-1 py-0.5 rounded">{String(validation.completeness.hasFullProfile)}</code></div>
            <div>Has required traits: <code className="bg-muted px-1 py-0.5 rounded">{String(validation.completeness.hasRequiredTraits)}</code></div>
          </div>
        </div>

        {/* Missing Traits */}
        {validation.completeness.missingTraits.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Missing Traits:</h4>
            <div className="flex flex-wrap gap-1">
              {validation.completeness.missingTraits.map(trait => (
                <Badge key={trait} variant="outline" className="text-xs">
                  {trait}
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