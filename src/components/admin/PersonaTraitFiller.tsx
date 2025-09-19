import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Brain, CheckCircle, AlertCircle, Play, Search, User, Users, Zap } from "lucide-react";

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
  statistical_traits_added?: string[];
}

interface PersonaOption {
  persona_id: string;
  name: string;
  completenessScore?: number;
}

interface SingleTestResult extends FillResult {
  before: any;
  after: any;
}

export function PersonaTraitFiller() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFilling, setIsFilling] = useState(false);
  const [analysis, setAnalysis] = useState<TraitAnalysis[]>([]);
  const [results, setResults] = useState<FillResult[]>([]);
  
  // Statistical enhancement state
  const [includeStatisticalEnhancement, setIncludeStatisticalEnhancement] = useState(false);
  
  // Single persona testing state
  const [personas, setPersonas] = useState<PersonaOption[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('');
  const [isSingleTesting, setIsSingleTesting] = useState(false);
  const [singleTestResult, setSingleTestResult] = useState<SingleTestResult | null>(null);
  const [loadingPersonas, setLoadingPersonas] = useState(false);
  
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
    
    if (incompletePersonas.length === 0 && !includeStatisticalEnhancement) {
      toast({
        title: "No Action Needed",
        description: "All personas already have complete trait profiles"
      });
      return;
    }

    setIsFilling(true);
    try {
      const personaIds = incompletePersonas.length > 0 
        ? incompletePersonas.map(p => p.persona_id)
        : analysis.map(p => p.persona_id); // Include all if just doing statistical enhancement
      
      const { data, error } = await supabase.functions.invoke('fill-missing-traits', {
        body: { 
          mode: 'execute',
          personaIds,
          includeStatisticalEnhancement
        }
      });

      if (error) throw error;

      setResults(data.updates || []);
      
      // Refresh analysis
      await analyzeTraits();
      
      const enhancementSuffix = includeStatisticalEnhancement ? " with statistical enhancement" : "";
      toast({
        title: "Enhancement Complete",
        description: `Updated ${data.updates?.length || 0} personas${enhancementSuffix}`,
      });
    } catch (error) {
      console.error('Error filling traits:', error);
      toast({
        title: "Enhancement Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsFilling(false);
    }
  };

  // Fetch personas for selection
  const fetchPersonas = async () => {
    setLoadingPersonas(true);
    try {
      const { data, error } = await supabase
        .from('v4_personas')
        .select('persona_id, name')
        .eq('creation_completed', true)
        .order('name');

      if (error) throw error;
      setPersonas(data || []);
    } catch (error) {
      console.error('Error fetching personas:', error);
      toast({
        title: "Error Loading Personas",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoadingPersonas(false);
    }
  };

  // Test single persona
  const testSinglePersona = async () => {
    if (!selectedPersonaId) {
      toast({
        title: "No Persona Selected",
        description: "Please select a persona to test",
        variant: "destructive"
      });
      return;
    }

    setIsSingleTesting(true);
    setSingleTestResult(null);
    
    try {
      // First get the current state
      const { data: beforeData, error: beforeError } = await supabase
        .from('v4_personas')
        .select('full_profile')
        .eq('persona_id', selectedPersonaId)
        .single();

      if (beforeError) throw beforeError;

      // Fill missing traits
      const { data, error } = await supabase.functions.invoke('fill-missing-traits', {
        body: { 
          mode: 'execute',
          personaIds: [selectedPersonaId],
          includeStatisticalEnhancement
        }
      });

      if (error) throw error;

      // Get the updated state
      const { data: afterData, error: afterError } = await supabase
        .from('v4_personas')
        .select('full_profile')
        .eq('persona_id', selectedPersonaId)
        .single();

      if (afterError) throw afterError;

      const update = data.updates?.[0];
      if (update) {
        setSingleTestResult({
          ...update,
          before: beforeData.full_profile,
          after: afterData.full_profile
        });
        
        const totalTraits = update.filled_traits.length + (update.statistical_traits_added?.length || 0);
        const enhancementText = includeStatisticalEnhancement ? " (including statistical traits)" : "";
        toast({
          title: "Single Persona Test Complete",
          description: `Updated ${totalTraits} traits for ${update.name}${enhancementText}`,
        });
      } else {
        toast({
          title: "No Updates Needed",
          description: "The selected persona already has complete traits",
        });
      }
    } catch (error) {
      console.error('Error testing single persona:', error);
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSingleTesting(false);
    }
  };

  // Load personas on mount
  useEffect(() => {
    fetchPersonas();
  }, []);

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
          Unified Persona Enhancement
        </CardTitle>
        <CardDescription>
          Analyze and enhance personas with structural validation and statistical traits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="batch" className="w-full">
          <TabsList>
            <TabsTrigger value="batch" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Batch Processing
            </TabsTrigger>
            <TabsTrigger value="single" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Test Single Persona
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="batch" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="statistical-enhancement" 
                  checked={includeStatisticalEnhancement}
                  onCheckedChange={(checked) => setIncludeStatisticalEnhancement(checked === true)}
                />
                <label htmlFor="statistical-enhancement" className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Include Statistical Trait Enhancement
                </label>
              </div>
              
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
                    disabled={isFilling || (!includeStatisticalEnhancement && analysis.filter(p => p.missingTraits.length > 0).length === 0)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isFilling ? 'Enhancing...' : 'Enhance Personas'}
                  </Button>
                )}
              </div>
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
                       <div key={result.persona_id} className="p-3 bg-muted rounded space-y-2">
                         <div className="font-medium">{result.name}</div>
                         
                         {result.filled_traits.length > 0 && (
                           <div>
                             <div className="text-xs text-muted-foreground mb-1">Structural fixes:</div>
                             <div className="flex flex-wrap gap-1">
                               {result.filled_traits.map((trait) => (
                                 <Badge key={trait} variant="default" className="text-xs">
                                   {trait.replace('_', ' ')}
                                 </Badge>
                               ))}
                             </div>
                           </div>
                         )}
                         
                         {result.statistical_traits_added && result.statistical_traits_added.length > 0 && (
                           <div>
                             <div className="text-xs text-muted-foreground mb-1">Statistical traits:</div>
                             <div className="flex flex-wrap gap-1">
                               {result.statistical_traits_added.map((trait) => (
                                 <Badge key={trait} variant="secondary" className="text-xs">
                                   <Zap className="h-3 w-3 mr-1" />
                                   {trait.replace('_', ' ')}
                                 </Badge>
                               ))}
                             </div>
                           </div>
                         )}
                       </div>
                     ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="single" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="single-statistical-enhancement" 
                  checked={includeStatisticalEnhancement}
                  onCheckedChange={(checked) => setIncludeStatisticalEnhancement(checked === true)}
                />
                <label htmlFor="single-statistical-enhancement" className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Include Statistical Trait Enhancement
                </label>
              </div>
              
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Select Persona to Test</label>
                  <Select value={selectedPersonaId} onValueChange={setSelectedPersonaId}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingPersonas ? "Loading personas..." : "Choose a persona"} />
                    </SelectTrigger>
                    <SelectContent>
                      {personas.map((persona) => (
                        <SelectItem key={persona.persona_id} value={persona.persona_id}>
                          {persona.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={testSinglePersona}
                  disabled={isSingleTesting || !selectedPersonaId}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isSingleTesting ? 'Testing...' : 'Test Enhancement'}
                </Button>
              </div>
            </div>

            {singleTestResult && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Test Results: {singleTestResult.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {singleTestResult.filled_traits.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Structural Traits Fixed:</h4>
                          <div className="flex flex-wrap gap-1">
                            {singleTestResult.filled_traits.map((trait) => (
                              <Badge key={trait} variant="default" className="text-xs">
                                {trait.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {singleTestResult.statistical_traits_added && singleTestResult.statistical_traits_added.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Statistical Traits Added:</h4>
                          <div className="flex flex-wrap gap-1">
                            {singleTestResult.statistical_traits_added.map((trait) => (
                              <Badge key={trait} variant="secondary" className="text-xs">
                                <Zap className="h-3 w-3 mr-1" />
                                {trait.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Before</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className="text-xs overflow-auto max-h-64 bg-muted p-2 rounded">
                            {JSON.stringify(singleTestResult.before, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">After</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {singleTestResult.filled_traits.map((trait) => {
                              const newData = singleTestResult.after[trait];
                              return (
                                <div key={trait} className="p-2 border rounded">
                                  <h4 className="font-medium text-sm mb-1">{trait.replace('_', ' ')}</h4>
                                  <pre className="text-xs overflow-auto max-h-32 bg-muted p-2 rounded">
                                    {JSON.stringify(newData, null, 2)}
                                  </pre>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Validation Checks</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          {singleTestResult.after.health_profile && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              Health Profile: BMI category "{singleTestResult.after.health_profile.bmi_category}"
                            </div>
                          )}
                          {singleTestResult.after.money_profile && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              Money Profile: Attitude "{singleTestResult.after.money_profile.attitude_toward_money}"
                            </div>
                          )}
                          {singleTestResult.after.political_narrative && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              Political Narrative: Added realistic viewpoints
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}