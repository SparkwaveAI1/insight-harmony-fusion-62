import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  CheckSquare, 
  Square, 
  PlayCircle, 
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { validatePersona } from "@/services/v4-persona/v4PersonaValidation";

interface PersonaForSelection {
  persona_id: string;
  name: string;
  full_profile: any;
  age?: number;
  occupation?: string;
  collections?: string[];
  needs_migration: boolean;
}

interface ConversionResult {
  persona_id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export function PersonaSelectionInterface() {
  const { user } = useAuth();
  const [personas, setPersonas] = useState<PersonaForSelection[]>([]);
  const [selectedPersonas, setSelectedPersonas] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [progress, setProgress] = useState(0);

  const MAX_SELECTION = 10;

  useEffect(() => {
    fetchPersonasForSelection();
  }, []);

  const fetchPersonasForSelection = async () => {
    try {
      setLoading(true);
      
      const { data: personasData, error } = await supabase
        .from('v4_personas')
        .select('persona_id, name, full_profile')
        .eq('creation_completed', true)
        .not('full_profile', 'is', null)
        .order('name');

      if (error) throw error;

      // Filter personas that need migration and extract relevant info
      const processedPersonas: PersonaForSelection[] = personasData
        .map(persona => {
          const fullProfile = persona.full_profile as Record<string, any> || {};
          const validation = validatePersona(fullProfile);
          const needsMigration = !validation.isValid || 
            !fullProfile.political_narrative || 
            !fullProfile.prompt_shaping;

          // Extract basic info for display
          const demographics = fullProfile.identity as Record<string, any> || {};
          const age = demographics.age;
          const occupation = demographics.occupation;

          return {
            persona_id: persona.persona_id,
            name: persona.name,
            full_profile: persona.full_profile,
            age: typeof age === 'number' ? age : undefined,
            occupation: typeof occupation === 'string' ? occupation : undefined,
            collections: [], // Will be populated if needed
            needs_migration: needsMigration
          };
        })
        .filter(persona => persona.needs_migration);

      setPersonas(processedPersonas);
      setSelectedPersonas(new Set());
      setResults([]);
      
    } catch (error) {
      console.error('Error fetching personas:', error);
      toast.error('Failed to fetch personas for selection');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonaToggle = (personaId: string) => {
    const newSelected = new Set(selectedPersonas);
    
    if (newSelected.has(personaId)) {
      newSelected.delete(personaId);
    } else if (newSelected.size < MAX_SELECTION) {
      newSelected.add(personaId);
    } else {
      toast.error(`Maximum ${MAX_SELECTION} personas can be selected at once`);
      return;
    }
    
    setSelectedPersonas(newSelected);
  };

  const handleSelectAll = () => {
    const availablePersonas = personas.slice(0, MAX_SELECTION);
    setSelectedPersonas(new Set(availablePersonas.map(p => p.persona_id)));
  };

  const handleClearAll = () => {
    setSelectedPersonas(new Set());
  };

  const processSelectedPersonas = async () => {
    if (selectedPersonas.size === 0) {
      toast.error('Please select at least one persona to convert');
      return;
    }

    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    setProcessing(true);
    setProgress(0);

    const selectedPersonasList = personas.filter(p => selectedPersonas.has(p.persona_id));
    
    // Initialize results
    const initialResults: ConversionResult[] = selectedPersonasList.map(persona => ({
      persona_id: persona.persona_id,
      name: persona.name,
      status: 'pending'
    }));
    setResults(initialResults);

    try {
      console.log(`🚀 Starting conversion of ${selectedPersonasList.length} selected personas...`);

      // Call the bulk conversion edge function with selected persona IDs
      const { data, error } = await supabase.functions.invoke('convert-selected-personas', {
        body: { 
          personaIds: Array.from(selectedPersonas),
          userId: user.id
        }
      });

      if (error) throw error;

      console.log('✅ Batch conversion completed:', data);
      
      // Update results based on response
      if (data?.results) {
        setResults(data.results);
      }

      const succeeded = data?.succeeded || 0;
      const failed = data?.failed || 0;
      
      toast.success(`Conversion complete! ${succeeded} succeeded, ${failed} failed`);
      
      // Refresh the persona list to reflect changes
      await fetchPersonasForSelection();
      
    } catch (error) {
      console.error('❌ Batch conversion failed:', error);
      toast.error('Batch conversion failed');
      
      // Mark all as failed
      setResults(prev => prev.map(result => ({
        ...result,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })));
    } finally {
      setProcessing(false);
      setProgress(100);
    }
  };

  const getStatusIcon = (status: ConversionResult['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'processing': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Persona Selection for Batch Conversion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Loading personas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Persona Selection for Batch Conversion
        </CardTitle>
        <CardDescription>
          Select up to {MAX_SELECTION} personas to convert to the new V4 format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{personas.length}</div>
            <div className="text-sm text-muted-foreground">Need Migration</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{selectedPersonas.size}</div>
            <div className="text-sm text-muted-foreground">Selected</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{MAX_SELECTION - selectedPersonas.size}</div>
            <div className="text-sm text-muted-foreground">Remaining</div>
          </div>
        </div>

        {/* Selection Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={processing || personas.length === 0}
            >
              <CheckSquare className="h-4 w-4 mr-1" />
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={processing || selectedPersonas.size === 0}
            >
              <Square className="h-4 w-4 mr-1" />
              Clear All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPersonasForSelection}
              disabled={processing}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
          
          <Badge variant={selectedPersonas.size > 0 ? "default" : "secondary"}>
            {selectedPersonas.size} of {MAX_SELECTION} selected
          </Badge>
        </div>

        {/* Convert Button */}
        <div className="flex items-center gap-4">
          <Button
            onClick={processSelectedPersonas}
            disabled={processing || selectedPersonas.size === 0}
            size="lg"
            className="flex-shrink-0"
          >
            {processing ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Convert Selected Personas ({selectedPersonas.size})
              </>
            )}
          </Button>
        </div>

        {/* Progress Bar */}
        {processing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Converting personas...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Results Display */}
        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Conversion Results:</h4>
            <ScrollArea className="max-h-[200px] w-full">
              <div className="space-y-2">
                {results.map((result) => (
                  <div 
                    key={result.persona_id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.name}</span>
                    </div>
                    <Badge variant={result.status === 'completed' ? 'default' : 
                                  result.status === 'failed' ? 'destructive' : 'secondary'}>
                      {result.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Persona Selection List */}
        {personas.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium">Available Personas ({personas.length}):</h4>
            <ScrollArea className="max-h-[400px] w-full">
              <div className="space-y-2">
                {personas.map((persona) => (
                  <div 
                    key={persona.persona_id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPersonas.has(persona.persona_id) 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handlePersonaToggle(persona.persona_id)}
                  >
                    <Checkbox
                      checked={selectedPersonas.has(persona.persona_id)}
                      disabled={processing || 
                        (!selectedPersonas.has(persona.persona_id) && selectedPersonas.size >= MAX_SELECTION)}
                      onChange={() => handlePersonaToggle(persona.persona_id)}
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{persona.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {persona.age && `Age: ${persona.age}`}
                            {persona.age && persona.occupation && ' • '}
                            {persona.occupation && `Occupation: ${persona.occupation}`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {persona.persona_id.slice(-8)}
                          </div>
                        </div>
                        
                        <Badge variant="outline" className="text-xs">
                          Needs Migration
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              No personas need migration! All personas are already in the new V4 format.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}