import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getAllPersonasV2 } from "@/services/persona";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';

interface MigrationResult {
  persona_id: string;
  name: string;
  status: 'success' | 'error';
  message: string;
}

interface MigrationResponse {
  message: string;
  results: MigrationResult[];
  total: number;
  successful: number;
  failed: number;
}

export function PersonaMigrationDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResults, setMigrationResults] = useState<MigrationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [personas, setPersonas] = useState<any[]>([]);

  useEffect(() => {
    const loadPersonas = async () => {
      try {
        const data = await getAllPersonasV2();
        setPersonas(data);
      } catch (error) {
        console.error('Error loading personas:', error);
      }
    };
    if (isOpen) {
      loadPersonas();
    }
  }, [isOpen]);

  const handleRefresh = () => {
    if (isOpen) {
      const loadPersonas = async () => {
        try {
          const data = await getAllPersonasV2();
          setPersonas(data);
        } catch (error) {
          console.error('Error loading personas:', error);
        }
      };
      loadPersonas();
    }
  };

  const handleMigrateAll = async () => {
    setIsMigrating(true);
    setError(null);
    setMigrationResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('migrate-persona-to-v2', {
        body: { mode: 'batch' }
      });

      if (error) {
        throw new Error(error.message);
      }

      setMigrationResults(data);
      
      // Refresh personas list after migration
      if (data.successful > 0) {
        handleRefresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed');
    } finally {
      setIsMigrating(false);
    }
  };

  const handleMigrateSingle = async (personaId: string) => {
    setIsMigrating(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('migrate-persona-to-v2', {
        body: { personaId, mode: 'single' }
      });

      if (error) {
        throw new Error(error.message);
      }

      setMigrationResults(data);
      handleRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed');
    } finally {
      setIsMigrating(false);
    }
  };

  const getProgressValue = () => {
    if (!migrationResults) return 0;
    return (migrationResults.successful / migrationResults.total) * 100;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Migrate to PersonaV2
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Migrate Personas to PersonaV2</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            This will convert your existing personas to the new PersonaV2 format, which enables 
            advanced conversation features like voicepack compilation and enhanced personality modeling.
          </div>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {migrationResults && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Migration Progress</span>
                <span className="text-sm text-muted-foreground">
                  {migrationResults.successful} / {migrationResults.total} completed
                </span>
              </div>
              <Progress value={getProgressValue()} className="w-full" />
              
              <div className="max-h-40 overflow-y-auto space-y-2">
                {migrationResults.results.map((result) => (
                  <div key={result.persona_id} className="flex items-center gap-2 text-sm">
                    {result.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium">{result.name}</span>
                    <span className="text-muted-foreground">- {result.message}</span>
                  </div>
                ))}
              </div>

              {migrationResults.failed > 0 && (
                <Alert>
                  <AlertDescription>
                    {migrationResults.failed} personas failed to migrate. You can retry individual migrations later.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={handleMigrateAll}
              disabled={isMigrating}
              className="flex-1"
            >
              {isMigrating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Migrate All Personas
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isMigrating}
            >
              Close
            </Button>
          </div>

          {personas && personas.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Migrate Individual Personas:</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {personas.slice(0, 5).map((persona) => (
                  <div key={persona.persona_id} className="flex items-center justify-between">
                    <span className="text-sm">{persona.name}</span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleMigrateSingle(persona.persona_id)}
                      disabled={isMigrating}
                    >
                      Migrate
                    </Button>
                  </div>
                ))}
                {personas.length > 5 && (
                  <div className="text-xs text-muted-foreground">
                    And {personas.length - 5} more...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}