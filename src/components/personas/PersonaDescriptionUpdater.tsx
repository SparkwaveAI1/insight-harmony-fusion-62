import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Loader2, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface UpdateResult {
  success: boolean;
  updated?: number;
  total?: number;
  errors?: string[];
  message?: string;
  error?: string;
}

const PersonaDescriptionUpdater: React.FC = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [result, setResult] = useState<UpdateResult | null>(null);

  const handleBulkUpdate = async () => {
    setIsUpdating(true);
    setResult(null);
    
    try {
      toast.info('Updating persona descriptions...', { 
        id: 'bulk-update',
        duration: 10000
      });

      console.log('Starting bulk persona description update...');
      
      const { data, error } = await supabase.functions.invoke('update-persona-descriptions', {
        body: {}
      });

      if (error) {
        throw new Error(error.message || 'Failed to update descriptions');
      }

      console.log('Bulk update result:', data);
      setResult(data);

      if (data.success) {
        toast.success(`Updated ${data.updated} persona descriptions!`, { 
          id: 'bulk-update' 
        });
      } else {
        toast.error(data.error || 'Update failed', { 
          id: 'bulk-update' 
        });
      }

    } catch (error) {
      console.error('Error during bulk update:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResult({
        success: false,
        error: errorMessage
      });
      toast.error(`Update failed: ${errorMessage}`, { 
        id: 'bulk-update' 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Persona Description Updater
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate descriptions for personas that don't have them using their trait profiles
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Bulk Update Descriptions</p>
            <p className="text-sm text-muted-foreground">
              Find personas without descriptions and generate them automatically
            </p>
          </div>
          
          <Button 
            onClick={handleBulkUpdate} 
            disabled={isUpdating}
            className="flex items-center gap-2"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Start Update
              </>
            )}
          </Button>
        </div>

        {result && (
          <div className={`p-4 rounded-lg border ${
            result.success 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {result.success ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="font-medium">
                {result.success ? 'Update Completed' : 'Update Failed'}
              </span>
            </div>
            
            {result.message && (
              <p className="text-sm mb-2">{result.message}</p>
            )}
            
            {result.success && result.updated !== undefined && result.total !== undefined && (
              <p className="text-sm">
                Successfully updated {result.updated} of {result.total} personas
              </p>
            )}
            
            {result.error && (
              <p className="text-sm">{result.error}</p>
            )}
            
            {result.errors && result.errors.length > 0 && (
              <details className="mt-2">
                <summary className="text-sm font-medium cursor-pointer">
                  View Errors ({result.errors.length})
                </summary>
                <div className="mt-2 space-y-1">
                  {result.errors.slice(0, 5).map((error, index) => (
                    <p key={index} className="text-xs font-mono bg-white/50 p-1 rounded">
                      {error}
                    </p>
                  ))}
                  {result.errors.length > 5 && (
                    <p className="text-xs italic">
                      ...and {result.errors.length - 5} more errors
                    </p>
                  )}
                </div>
              </details>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>
            <strong>Note:</strong> This process will generate descriptions for up to 50 personas 
            at a time. You may need to run it multiple times for large persona libraries.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonaDescriptionUpdater;