import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { convertPersonaToDescription } from "@/services/persona/operations/convertPersonaToDescription";

interface LegacyPersona {
  persona_id: string;
  name: string;
  full_profile: any;
}

export function PersonaDescriptionConverter() {
  const [personas, setPersonas] = useState<LegacyPersona[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPersonas, setIsLoadingPersonas] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);

  // Fetch legacy personas from database
  const fetchLegacyPersonas = async () => {
    setIsLoadingPersonas(true);
    try {
      const { data, error } = await supabase
        .from('v4_personas')
        .select('persona_id, name, full_profile')
        .eq('creation_completed', true)
        .not('full_profile', 'is', null)
        .order('name')
        .limit(20);

      if (error) throw error;
      
      setPersonas(data || []);
      toast.success(`Loaded ${data?.length || 0} personas for testing`);
    } catch (err) {
      console.error('Error fetching personas:', err);
      toast.error('Failed to load personas');
    } finally {
      setIsLoadingPersonas(false);
    }
  };

  // Test the conversion function
  const testConversion = async () => {
    if (!selectedPersonaId) {
      toast.error('Please select a persona to test');
      return;
    }

    const selectedPersona = personas.find(p => p.persona_id === selectedPersonaId);
    if (!selectedPersona) {
      toast.error('Selected persona not found');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Testing conversion for persona:', selectedPersona.name);
      
      // Pass the complete persona object so the function can access persona_id for collections
      const description = await convertPersonaToDescription({
        ...selectedPersona.full_profile,
        persona_id: selectedPersona.persona_id
      });
      
      setResult(description);
      setShowResultDialog(true);
      
      toast.success('✅ Conversion successful! Check the result dialog.');
      
    } catch (err) {
      console.error('❌ Conversion test failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setShowResultDialog(true);
      
      toast.error('❌ Conversion failed - check result for details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Persona JSON→Description Converter Test
          </CardTitle>
          <CardDescription>
            Test the conversion function that transforms legacy persona JSON into natural language descriptions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Button
                onClick={fetchLegacyPersonas}
                disabled={isLoadingPersonas}
                variant="outline"
                size="sm"
              >
                {isLoadingPersonas ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load Personas'
                )}
              </Button>
              
              <Badge variant="secondary">
                {personas.length} personas loaded
              </Badge>
            </div>

            {personas.length > 0 && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Select Persona to Test:
                  </label>
                  <Select value={selectedPersonaId} onValueChange={setSelectedPersonaId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a persona..." />
                    </SelectTrigger>
                    <SelectContent>
                      {personas.map((persona) => (
                        <SelectItem key={persona.persona_id} value={persona.persona_id}>
                          {persona.name} ({persona.persona_id.slice(-8)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={testConversion}
                  disabled={isLoading || !selectedPersonaId}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Converting JSON to Description...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Test Persona JSON→Description Converter
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {error ? (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Conversion Failed
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Conversion Successful
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {error 
                ? 'The conversion encountered an error. See details below.'
                : 'Successfully converted persona JSON to natural language description.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[500px] w-full">
            <div className="space-y-4">
              {error ? (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Error Details:</h4>
                  <p className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">
                    {error}
                  </p>
                </div>
              ) : result && (
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                      Generated Description:
                    </h4>
                    <div className="text-sm text-green-700 dark:text-green-300 whitespace-pre-wrap leading-relaxed">
                      {result}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground border-t pt-3">
                    <p><strong>Test completed successfully!</strong></p>
                    <p>• Input: Legacy persona JSON object</p>
                    <p>• Output: Natural language description ({result.length} characters)</p>
                    <p>• Function: convertPersonaToDescription()</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}