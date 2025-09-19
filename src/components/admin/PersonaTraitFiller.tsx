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
import { Brain, CheckCircle, AlertCircle, Play, Search, User, Users, Zap, Clock, Loader2, RefreshCw, Database } from "lucide-react";

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
  validation_results?: Array<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    completenessScore: number;
  }>;
}

interface PersonaOption {
  persona_id: string;
  name: string;
  completenessScore?: number;
}

interface SingleTestResult extends FillResult {
  before: any;
  after: any;
  processingTime?: number;
  statusBefore?: {
    statistical_enhancement_status: string;
    enhancement_applied_at: string | null;
  };
  statusAfter?: {
    statistical_enhancement_status: string;
    enhancement_applied_at: string | null;
  };
  executionLog?: string[];
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
  const [processingStage, setProcessingStage] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [executionStartTime, setExecutionStartTime] = useState<number>(0);
  
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

  // Test single persona with enhanced feedback
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
    setProcessingProgress(0);
    setExecutionStartTime(Date.now());
    
    try {
      // Stage 1: Get current state
      setProcessingStage("Analyzing current persona state...");
      setProcessingProgress(10);
      
      const { data: beforeData, error: beforeError } = await supabase
        .from('v4_personas')
        .select(`
          full_profile, 
          statistical_enhancement_status, 
          enhancement_applied_at,
          name
        `)
        .eq('persona_id', selectedPersonaId)
        .single();

      if (beforeError) throw beforeError;

      const statusBefore = {
        statistical_enhancement_status: beforeData.statistical_enhancement_status || 'pending',
        enhancement_applied_at: beforeData.enhancement_applied_at
      };

      // Stage 2: Process enhancement
      setProcessingStage("Processing structural validation and enhancements...");
      setProcessingProgress(30);

      const { data, error } = await supabase.functions.invoke('fill-missing-traits', {
        body: { 
          mode: 'execute',
          personaIds: [selectedPersonaId],
          includeStatisticalEnhancement
        }
      });

      if (error) throw error;

      // Stage 3: Verify results
      setProcessingStage("Verifying results and updating database...");
      setProcessingProgress(70);

      // Get the updated state
      const { data: afterData, error: afterError } = await supabase
        .from('v4_personas')
        .select(`
          full_profile, 
          statistical_enhancement_status, 
          enhancement_applied_at,
          name
        `)
        .eq('persona_id', selectedPersonaId)
        .single();

      if (afterError) throw afterError;

      const statusAfter = {
        statistical_enhancement_status: afterData.statistical_enhancement_status || 'pending',
        enhancement_applied_at: afterData.enhancement_applied_at
      };

      setProcessingProgress(100);
      const processingTime = Date.now() - executionStartTime;

      const update = data.updates?.[0];
      const hasChanges = update && (update.filled_traits.length > 0 || (update.statistical_traits_added?.length || 0) > 0);
      
      setSingleTestResult({
        persona_id: selectedPersonaId,
        name: beforeData.name,
        filled_traits: update?.filled_traits || [],
        statistical_traits_added: update?.statistical_traits_added || [],
        before: beforeData.full_profile,
        after: afterData.full_profile,
        processingTime,
        statusBefore,
        statusAfter,
        executionLog: data.executionLog || [],
        validation_results: data.validation_results
      });

      // Provide detailed feedback
      if (hasChanges) {
        const structuralCount = update.filled_traits.length;
        const statisticalCount = update.statistical_traits_added?.length || 0;
        let description = '';
        
        if (structuralCount > 0 && statisticalCount > 0) {
          description = `✅ ${structuralCount} structural fixes, ${statisticalCount} statistical traits added`;
        } else if (structuralCount > 0) {
          description = `✅ ${structuralCount} structural validation fixes applied`;
        } else if (statisticalCount > 0) {
          description = `✅ ${statisticalCount} statistical traits enhanced`;
        }
        
        description += ` • Processed in ${processingTime}ms`;
        
        toast({
          title: "Enhancement Complete",
          description,
        });
      } else {
        // Check validation results for detailed feedback
        const validationResult = data.validation_results?.[0];
        
        if (validationResult?.isValid) {
          // Persona is already valid
          const wasAlreadyEnhanced = statusBefore.statistical_enhancement_status === 'complete' && includeStatisticalEnhancement;
          const description = wasAlreadyEnhanced 
            ? `ℹ️ Persona already has complete enhancements • Status: ${statusBefore.statistical_enhancement_status}`
            : "ℹ️ No structural issues found and no statistical enhancements needed";
            
          toast({
            title: "No Changes Required",
            description,
          });
        } else {
          // Show validation errors when fixes failed
          const errorCount = validationResult?.errors?.length || 0;
          const errorSample = validationResult?.errors?.slice(0, 2).join(', ') || 'Unknown validation issues';
          
          toast({
            title: "Fix Failed",
            description: `❌ ${errorCount} validation errors remain: ${errorSample}${errorCount > 2 ? '...' : ''}`,
            variant: "destructive"
          });
        }
      }
      
    } catch (error) {
      console.error('Error testing single persona:', error);
      toast({
        title: "Enhancement Failed",
        description: `❌ ${error.message} • Processing time: ${Date.now() - executionStartTime}ms`,
        variant: "destructive"
      });
    } finally {
      setIsSingleTesting(false);
      setProcessingStage('');
      setProcessingProgress(0);
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

            {/* Processing Status */}
            {isSingleTesting && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm font-medium">Processing Enhancement</span>
                    </div>
                    
                    {processingStage && (
                      <div className="text-sm text-muted-foreground">{processingStage}</div>
                    )}
                    
                    <Progress value={processingProgress} className="h-2" />
                    
                    <div className="text-xs text-muted-foreground">
                      Processing time: {Math.round((Date.now() - executionStartTime) / 1000)}s
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Test Results */}
            {singleTestResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Enhancement Results: {singleTestResult.name}
                  </CardTitle>
                  <CardDescription>
                    Processing completed in {singleTestResult.processingTime}ms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    
                    {/* Validation Results */}
                    {singleTestResult.validation_results?.[0] && (
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-sm font-medium mb-2 flex items-center gap-2">
                            {singleTestResult.validation_results[0].isValid ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                            Comprehensive Validation Status
                          </div>
                          <div className="space-y-3">
                            {/* Completeness Score */}
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Completeness Score:</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      Math.round(singleTestResult.validation_results[0].completenessScore * 100) >= 85 
                                        ? 'bg-green-500' 
                                        : Math.round(singleTestResult.validation_results[0].completenessScore * 100) >= 70
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
                                    }`}
                                    style={{ width: `${Math.round(singleTestResult.validation_results[0].completenessScore * 100)}%` }}
                                  />
                                </div>
                                <span className={`text-sm font-bold ${
                                  Math.round(singleTestResult.validation_results[0].completenessScore * 100) >= 85 
                                    ? 'text-green-600' 
                                    : Math.round(singleTestResult.validation_results[0].completenessScore * 100) >= 70
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                                }`}>
                                  {Math.round(singleTestResult.validation_results[0].completenessScore * 100)}%
                                </span>
                              </div>
                            </div>
                            
                            <Badge variant={singleTestResult.validation_results[0].isValid ? "default" : "destructive"}>
                              {singleTestResult.validation_results[0].isValid ? 'Structurally Valid' : 'Has Structural Issues'}
                            </Badge>
                            
                            {/* Structural Errors */}
                            {singleTestResult.validation_results[0].errors.length > 0 && (
                              <div className="mt-3">
                                <div className="text-xs font-medium text-red-600 mb-2 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Structural Errors ({singleTestResult.validation_results[0].errors.length}):
                                </div>
                                <ul className="text-xs text-red-600 space-y-1 bg-red-50 p-2 rounded">
                                  {singleTestResult.validation_results[0].errors.slice(0, 5).map((error: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-1">
                                      <span className="text-red-400 mt-0.5">•</span>
                                      {error}
                                    </li>
                                  ))}
                                  {singleTestResult.validation_results[0].errors.length > 5 && (
                                    <li className="text-red-500 font-medium">
                                      ... and {singleTestResult.validation_results[0].errors.length - 5} more
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}

                            {/* Completeness Warnings */}
                            {singleTestResult.validation_results[0].warnings && singleTestResult.validation_results[0].warnings.length > 0 && (
                              <div className="mt-3">
                                <div className="text-xs font-medium text-yellow-600 mb-2 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Content Completeness Issues ({singleTestResult.validation_results[0].warnings.length}):
                                </div>
                                <ul className="text-xs text-yellow-600 space-y-1 bg-yellow-50 p-2 rounded max-h-32 overflow-y-auto">
                                  {singleTestResult.validation_results[0].warnings.slice(0, 8).map((warning: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-1">
                                      <span className="text-yellow-400 mt-0.5">•</span>
                                      {warning}
                                    </li>
                                  ))}
                                  {singleTestResult.validation_results[0].warnings.length > 8 && (
                                    <li className="text-yellow-500 font-medium">
                                      ... and {singleTestResult.validation_results[0].warnings.length - 8} more content gaps
                                    </li>
                                  )}
                                </ul>
                                
                                {/* Completeness Enhancement Recommendation */}
                                {Math.round(singleTestResult.validation_results[0].completenessScore * 100) < 85 && (
                                  <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                    💡 <strong>Tip:</strong> Enable statistical enhancement to fill empty arrays and replace "unspecified" values with realistic content.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Enhancement Status Tracking */}
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-sm font-medium mb-2">Status Before</div>
                          <div className="space-y-1">
                            <Badge variant={singleTestResult.statusBefore?.statistical_enhancement_status === 'complete' ? 'default' : 'secondary'}>
                              {singleTestResult.statusBefore?.statistical_enhancement_status || 'pending'}
                            </Badge>
                            {singleTestResult.statusBefore?.enhancement_applied_at && (
                              <div className="text-xs text-muted-foreground">
                                Last enhanced: {new Date(singleTestResult.statusBefore.enhancement_applied_at).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-sm font-medium mb-2">Status After</div>
                          <div className="space-y-1">
                            <Badge variant={singleTestResult.statusAfter?.statistical_enhancement_status === 'complete' ? 'default' : 'secondary'}>
                              {singleTestResult.statusAfter?.statistical_enhancement_status || 'pending'}
                            </Badge>
                            {singleTestResult.statusAfter?.enhancement_applied_at && (
                              <div className="text-xs text-muted-foreground">
                                Enhanced: {new Date(singleTestResult.statusAfter.enhancement_applied_at).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Changes Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {singleTestResult.filled_traits.length > 0 && (
                        <Card>
                          <CardContent className="pt-4">
                            <div className="text-sm font-medium mb-2 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              Structural Fixes ({singleTestResult.filled_traits.length})
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {singleTestResult.filled_traits.map((trait) => (
                                <Badge key={trait} variant="default" className="text-xs">
                                  {trait.replace('_', ' ')}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                      {singleTestResult.statistical_traits_added && singleTestResult.statistical_traits_added.length > 0 && (
                        <Card>
                          <CardContent className="pt-4">
                            <div className="text-sm font-medium mb-2 flex items-center gap-2">
                              <Zap className="h-4 w-4 text-blue-600" />
                              Statistical Traits ({singleTestResult.statistical_traits_added.length})
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {singleTestResult.statistical_traits_added.map((trait) => (
                                <Badge key={trait} variant="secondary" className="text-xs">
                                  {trait.replace('_', ' ')}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                    
                    {/* No Changes Message */}
                    {singleTestResult.filled_traits.length === 0 && 
                     (!singleTestResult.statistical_traits_added || singleTestResult.statistical_traits_added.length === 0) && 
                     singleTestResult.validation_results?.[0]?.isValid && (
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-center text-muted-foreground">
                            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <div className="text-sm">No changes were required</div>
                            <div className="text-xs mt-1">
                              Persona structure is complete and enhancements are up to date
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Execution Log */}
                    {singleTestResult.executionLog && singleTestResult.executionLog.length > 0 && (
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Processing Log
                          </div>
                          <div className="text-xs font-mono bg-muted p-3 rounded max-h-40 overflow-y-auto space-y-1">
                            {singleTestResult.executionLog.map((log, index) => (
                              <div key={index} className="text-muted-foreground">{log}</div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Refresh Button */}
                    <div className="flex justify-center">
                      <Button 
                        variant="outline" 
                        onClick={() => testSinglePersona()}
                        disabled={isSingleTesting}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Test Again
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}