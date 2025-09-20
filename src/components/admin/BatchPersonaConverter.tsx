import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlayCircle, CheckCircle, AlertCircle, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { convertPersonaToDescription } from "@/services/persona/operations/convertPersonaToDescription";
import { addToQueue, parsePersonaDescription } from "@/services/personaQueueService";
import { useAuth } from "@/context/AuthContext";

interface LegacyPersona {
  persona_id: string;
  name: string;
  full_profile: any;
}

interface ProcessingResult {
  persona: LegacyPersona;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  description?: string;
  queueId?: string;
  collections?: string[];
  error?: string;
}

export function BatchPersonaConverter() {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [progress, setProgress] = useState(0);

  const batchConvertLegacyPersonas = async (count: number = 5) => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    setIsProcessing(true);
    setResults([]);
    setProgress(0);

    try {
      console.log(`🚀 Starting batch conversion of ${count} legacy personas...`);
      
      // Fetch legacy personas from database
      const { data: personas, error } = await supabase
        .from('v4_personas')
        .select('persona_id, name, full_profile')
        .eq('creation_completed', true)
        .not('full_profile', 'is', null)
        .order('name')
        .limit(count);

      if (error) throw error;

      if (!personas || personas.length === 0) {
        toast.error('No legacy personas found');
        return;
      }

      console.log(`📋 Found ${personas.length} personas to process:`, personas.map(p => p.name));

      // Initialize results array
      const initialResults: ProcessingResult[] = personas.map(persona => ({
        persona,
        status: 'pending'
      }));
      setResults(initialResults);

      // Process each persona
      for (let i = 0; i < personas.length; i++) {
        const persona = personas[i];
        console.log(`\n🔄 Processing persona ${i + 1}/${personas.length}: ${persona.name}`);

        // Update status to processing
        setResults(prev => prev.map((result, index) => 
          index === i ? { ...result, status: 'processing' } : result
        ));

        try {
          // Step 1: Convert persona to description
          console.log(`📝 Converting ${persona.name} to description...`);
          const personaData = persona.full_profile as Record<string, any> || {};
          const description = await convertPersonaToDescription({
            ...personaData,
            persona_id: persona.persona_id
          });

          if (!description) {
            throw new Error('Failed to generate description');
          }

          // Step 2: Parse description to extract components
          console.log(`🔍 Parsing description for ${persona.name}...`);
          const parsed = parsePersonaDescription(description);
          console.log(`✅ Parsed: name="${parsed.name}", collections=[${parsed.collections.join(', ')}]`);

          // Step 3: Add to queue
          console.log(`📋 Adding ${persona.name} to queue...`);
          const queueData = await addToQueue(
            user.id,
            parsed.name,
            parsed.description,
            parsed.collections
          );

          console.log(`✅ Successfully queued ${persona.name} with ID: ${queueData.id}`);

          // Update result as completed
          setResults(prev => prev.map((result, index) => 
            index === i ? { 
              ...result, 
              status: 'completed',
              description,
              queueId: queueData.id,
              collections: parsed.collections
            } : result
          ));

        } catch (error) {
          console.error(`❌ Failed to process ${persona.name}:`, error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          // Update result as failed
          setResults(prev => prev.map((result, index) => 
            index === i ? { 
              ...result, 
              status: 'failed',
              error: errorMessage
            } : result
          ));
        }

        // Update progress
        setProgress(((i + 1) / personas.length) * 100);
      }

      const completed = results.filter(r => r.status === 'completed').length;
      const failed = results.filter(r => r.status === 'failed').length;
      
      console.log(`\n🎯 Batch conversion complete! ✅${completed} succeeded, ❌${failed} failed`);
      toast.success(`Batch conversion complete! ${completed} personas queued, ${failed} failed`);

    } catch (error) {
      console.error('❌ Batch conversion failed:', error);
      toast.error('Batch conversion failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: ProcessingResult['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'processing': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: ProcessingResult['status']) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'processing': return 'default';
      case 'completed': return 'default';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  const completedCount = results.filter(r => r.status === 'completed').length;
  const failedCount = results.filter(r => r.status === 'failed').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Batch Persona Converter
        </CardTitle>
        <CardDescription>
          Automatically convert legacy personas to descriptions and add them to the processing queue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => batchConvertLegacyPersonas(5)}
            disabled={isProcessing}
            size="lg"
            className="flex-shrink-0"
          >
            {isProcessing ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Convert 5 Legacy Personas
              </>
            )}
          </Button>

          {results.length > 0 && (
            <div className="flex items-center gap-3">
              <Badge variant="outline">{results.length} total</Badge>
              {completedCount > 0 && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  ✅ {completedCount} completed
                </Badge>
              )}
              {failedCount > 0 && (
                <Badge variant="destructive">
                  ❌ {failedCount} failed
                </Badge>
              )}
            </div>
          )}
        </div>

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Processing Results:</h4>
            <ScrollArea className="max-h-[400px] w-full">
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div 
                    key={result.persona.persona_id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium">{result.persona.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {result.persona.persona_id.slice(-8)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {result.collections && result.collections.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {result.collections.length} collections
                        </Badge>
                      )}
                      
                      <Badge variant={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {results.length > 0 && !isProcessing && (
          <div className="text-xs text-muted-foreground border-t pt-3">
            <p><strong>Process Summary:</strong></p>
            <p>• Legacy personas converted to descriptions using AI</p>
            <p>• Descriptions parsed to extract names and collections</p>
            <p>• Successfully processed personas added to creation queue</p>
            <p>• Ready for queue processing to create new personas</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}