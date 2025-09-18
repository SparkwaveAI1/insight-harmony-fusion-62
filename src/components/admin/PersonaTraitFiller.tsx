import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Brain, CheckCircle, AlertCircle, Play, Search } from "lucide-react";

interface TraitAnalysis {
  persona_id: string;
  name: string;
  missingTraits: string[];
  incompleteTraits: Array<{ category: string; missing: string[] }>;
  completenessScore: number;
}

interface FillResult {
  persona_id: string;
  name: string;
  filled_traits: string[];
}

export function PersonaTraitFiller() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFilling, setIsFilling] = useState(false);
  const [analysis, setAnalysis] = useState<TraitAnalysis[]>([]);
  const [results, setResults] = useState<FillResult[]>([]);
  const { toast } = useToast();

  const analyzeTraits = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('fill-missing-traits', {
        body: { mode: 'preview' }
      });

      if (error) throw error;

      setAnalysis(data.analysis || []);
      toast({
        title: "Analysis Complete",
        description: `Analyzed ${data.analyzed_count} personas`,
      });
    } catch (error) {
      console.error('Error analyzing traits:', error);
      toast({
        title: "Analysis Failed", 
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fillMissingTraits = async () => {
    const incompletePersonas = analysis.filter(p => p.missingTraits.length > 0);
    
    if (incompletePersonas.length === 0) {
      toast({
        title: "No Action Needed",
        description: "All personas already have complete trait profiles"
      });
      return;
    }

    setIsFilling(true);
    try {
      const personaIds = incompletePersonas.map(p => p.persona_id);
      
      const { data, error } = await supabase.functions.invoke('fill-missing-traits', {
        body: { 
          mode: 'execute',
          personaIds 
        }
      });

      if (error) throw error;

      setResults(data.updates || []);
      
      // Refresh analysis
      await analyzeTraits();
      
      toast({
        title: "Traits Filled Successfully",
        description: `Updated ${data.updates?.length || 0} personas with missing traits`,
      });
    } catch (error) {
      console.error('Error filling traits:', error);
      toast({
        title: "Fill Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsFilling(false);
    }
  };

  const getCompletenessColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Persona Trait Completeness
        </CardTitle>
        <CardDescription>
          Analyze and fill missing personality traits using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={analyzeTraits}
            disabled={isAnalyzing}
            variant="outline"
          >
            <Search className="h-4 w-4 mr-2" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Traits'}
          </Button>
          
          {analysis.length > 0 && (
            <Button 
              onClick={fillMissingTraits}
              disabled={isFilling || analysis.filter(p => p.missingTraits.length > 0).length === 0}
            >
              <Play className="h-4 w-4 mr-2" />
              {isFilling ? 'Filling Traits...' : 'Fill Missing Traits'}
            </Button>
          )}
        </div>

        {analysis.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{analysis.length}</div>
                  <p className="text-xs text-muted-foreground">Total Personas</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">
                    {analysis.filter(p => p.missingTraits.length === 0).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Complete</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-600">
                    {analysis.filter(p => p.missingTraits.length > 0).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Need Traits</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {analysis.map((persona) => (
                <Card key={persona.persona_id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{persona.name}</h4>
                        <Badge variant={persona.missingTraits.length === 0 ? "default" : "destructive"}>
                          {persona.completenessScore}% Complete
                        </Badge>
                      </div>
                      
                      {persona.missingTraits.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {persona.missingTraits.map((trait) => (
                            <Badge key={trait} variant="outline" className="text-xs">
                              Missing: {trait.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {persona.incompleteTraits.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {persona.incompleteTraits.map((incomplete, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              Partial: {incomplete.category}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {persona.missingTraits.length === 0 ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </div>
                  
                  <Progress 
                    value={persona.completenessScore} 
                    className="mt-2 h-2"
                  />
                </Card>
              ))}
            </div>
          </div>
        )}

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.map((result) => (
                  <div key={result.persona_id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="font-medium">{result.name}</span>
                    <div className="flex gap-1">
                      {result.filled_traits.map((trait) => (
                        <Badge key={trait} variant="default" className="text-xs">
                          {trait.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}