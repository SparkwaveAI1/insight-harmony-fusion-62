import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  ChevronRight,
  AlertTriangle,
  Users,
  Brain,
  MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PersonaCompleteness {
  persona_id: string;
  name: string;
  is_complete: boolean;
  missing_components: string[];
  completion_score: number;
  trait_profile_complete: boolean;
  interview_sections_complete: boolean;
  metadata_complete: boolean;
  linguistic_profile_complete: boolean;
}

export function PersonaCompletenessAnalysis() {
  const [personas, setPersonas] = useState<PersonaCompleteness[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIncomplete, setShowIncomplete] = useState(true);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    fetchPersonaCompleteness();
  }, []);

  // Helper function to check if required demographic fields are present
  const hasRequiredDemographicFields = (metadata: any): boolean => {
    if (!metadata || typeof metadata !== 'object') return false;
    
    const requiredFields = [
      'age', 'gender', 'race_ethnicity', 'education_level', 
      'occupation', 'employment_type', 'income_level', 
      'social_class_identity', 'marital_status'
    ];
    
    return requiredFields.every(field => 
      metadata[field] && metadata[field] !== 'Not specified' && metadata[field] !== ''
    );
  };

  const analyzePersonaCompleteness = (persona: any): PersonaCompleteness => {
    const missingComponents: string[] = [];
    let completionScore = 0;
    const totalComponents = 4;

    // Check trait profile completeness
    const traitProfileComplete = persona.trait_profile && 
      Object.keys(persona.trait_profile).length > 0 &&
      persona.trait_profile.big_five &&
      persona.trait_profile.moral_foundations;
    
    if (traitProfileComplete) {
      completionScore++;
    } else {
      missingComponents.push("Trait Profile");
    }

    // Check interview sections completeness
    const interviewSectionsComplete = persona.interview_sections && 
      Array.isArray(persona.interview_sections) &&
      persona.interview_sections.length > 0;
    
    if (interviewSectionsComplete) {
      completionScore++;
    } else {
      missingComponents.push("Interview Sections");
    }

    // Check metadata completeness - use proper demographic validation
    const metadataComplete = persona.metadata && 
      Object.keys(persona.metadata).length > 0 &&
      hasRequiredDemographicFields(persona.metadata);
    
    if (metadataComplete) {
      completionScore++;
    } else {
      missingComponents.push("Demographics Metadata");
    }

    // Check linguistic profile completeness
    const linguisticProfileComplete = persona.linguistic_profile && 
      Object.keys(persona.linguistic_profile).length > 0;
    
    if (linguisticProfileComplete) {
      completionScore++;
    } else {
      missingComponents.push("Linguistic Profile");
    }

    const isComplete = missingComponents.length === 0;

    return {
      persona_id: persona.persona_id,
      name: persona.name,
      is_complete: isComplete,
      missing_components: missingComponents,
      completion_score: Math.round((completionScore / totalComponents) * 100),
      trait_profile_complete: traitProfileComplete,
      interview_sections_complete: interviewSectionsComplete,
      metadata_complete: metadataComplete,
      linguistic_profile_complete: linguisticProfileComplete
    };
  };

  const fetchPersonaCompleteness = async () => {
    try {
      setLoading(true);
      
      const { data: personasData, error } = await supabase
        .from('personas')
        .select('persona_id, name, trait_profile, interview_sections, metadata, linguistic_profile, is_public')
        .order('name');

      if (error) {
        console.error('Error fetching personas:', error);
        toast.error('Failed to fetch persona data');
        return;
      }

      const analyzedPersonas = personasData.map(analyzePersonaCompleteness);
      setPersonas(analyzedPersonas);
      
    } catch (error) {
      console.error('Error analyzing personas:', error);
      toast.error('Failed to analyze persona completeness');
    } finally {
      setLoading(false);
    }
  };

  const completePersonas = personas.filter(p => p.is_complete);
  const incompletePersonas = personas.filter(p => !p.is_complete);
  const averageCompletionScore = personas.length > 0 
    ? Math.round(personas.reduce((sum, p) => sum + p.completion_score, 0) / personas.length)
    : 0;

  const getComponentIcon = (component: string) => {
    switch (component) {
      case "Trait Profile":
        return <Brain className="h-3 w-3" />;
      case "Interview Sections":
        return <MessageSquare className="h-3 w-3" />;
      case "Demographics Metadata":
        return <Users className="h-3 w-3" />;
      case "Linguistic Profile":
        return <MessageSquare className="h-3 w-3" />;
      default:
        return <AlertTriangle className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Persona Completeness Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Analyzing personas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Persona Completeness Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{personas.length}</div>
            <div className="text-sm text-muted-foreground">Total Personas</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{completePersonas.length}</div>
            <div className="text-sm text-muted-foreground">Complete</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{incompletePersonas.length}</div>
            <div className="text-sm text-muted-foreground">Incomplete</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{averageCompletionScore}%</div>
            <div className="text-sm text-muted-foreground">Avg. Complete</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex gap-2">
          <Button
            variant={showIncomplete ? "default" : "outline"}
            size="sm"
            onClick={() => setShowIncomplete(!showIncomplete)}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Incomplete ({incompletePersonas.length})
          </Button>
          <Button
            variant={showComplete ? "default" : "outline"}
            size="sm"
            onClick={() => setShowComplete(!showComplete)}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Complete ({completePersonas.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPersonaCompleteness}
          >
            Refresh Analysis
          </Button>
        </div>

        {/* Incomplete Personas */}
        {showIncomplete && incompletePersonas.length > 0 && (
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center gap-2 w-full">
              <ChevronDown className="h-4 w-4" />
              <h3 className="text-lg font-medium text-orange-600">
                Incomplete Personas ({incompletePersonas.length})
              </h3>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-3">
              {incompletePersonas.map((persona) => (
                <div key={persona.persona_id} className="border rounded-lg p-4 bg-orange-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">{persona.name}</span>
                      <Badge variant="outline">{persona.completion_score}% complete</Badge>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {persona.missing_components.map((component) => (
                      <Badge key={component} variant="destructive" className="text-xs">
                        {getComponentIcon(component)}
                        <span className="ml-1">{component}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Complete Personas */}
        {showComplete && completePersonas.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 w-full">
              <ChevronRight className="h-4 w-4" />
              <h3 className="text-lg font-medium text-green-600">
                Complete Personas ({completePersonas.length})
              </h3>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-3">
              {completePersonas.map((persona) => (
                <div key={persona.persona_id} className="border rounded-lg p-4 bg-green-50/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{persona.name}</span>
                    <Badge variant="outline" className="bg-green-100">100% complete</Badge>
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {personas.length === 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No personas found in the system.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}