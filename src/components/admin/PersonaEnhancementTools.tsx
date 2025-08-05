import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { bulkEnhancePersonas, BulkEnhanceOptions } from '@/services/persona/bulkEnhancePersonas';
import { toast } from 'sonner';

export const PersonaEnhancementTools: React.FC = () => {
  const [isRunning, setBulkRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [options, setOptions] = useState<BulkEnhanceOptions>({
    batchSize: 10,
    targetCount: 75,
    enhanceKnowledgeDomains: true,
    enhanceEducation: true,
    enhanceDescriptions: false
  });

  const handleBulkEnhancement = async () => {
    setBulkRunning(true);
    setProgress(0);
    setResults(null);

    try {
      console.log('🚀 Starting bulk persona enhancement with options:', options);
      
      // Simulate progress (since we don't have real-time updates from the edge function)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 2000);

      const result = await bulkEnhancePersonas(options);
      
      clearInterval(progressInterval);
      setProgress(100);
      setResults(result);

      if (result.success) {
        toast.success(`Successfully enhanced ${result.processed} personas!`);
      } else {
        toast.error(`Enhancement failed: ${result.error}`);
      }
      
    } catch (error) {
      console.error('❌ Bulk enhancement error:', error);
      toast.error('Failed to perform bulk enhancement');
    } finally {
      setBulkRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🛠️ Persona Enhancement Tools</CardTitle>
          <CardDescription>
            Tools to fix and enhance existing personas with missing data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">Enhancement Options</h4>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="knowledge-domains"
                checked={options.enhanceKnowledgeDomains}
                onCheckedChange={(checked) => 
                  setOptions(prev => ({ ...prev, enhanceKnowledgeDomains: !!checked }))
                }
              />
              <label htmlFor="knowledge-domains" className="text-sm font-medium">
                🧠 Generate Knowledge Domains (Critical Fix)
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="education"
                checked={options.enhanceEducation}
                onCheckedChange={(checked) => 
                  setOptions(prev => ({ ...prev, enhanceEducation: !!checked }))
                }
              />
              <label htmlFor="education" className="text-sm font-medium">
                🎓 Add Education Fields
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="descriptions"
                checked={options.enhanceDescriptions}
                onCheckedChange={(checked) => 
                  setOptions(prev => ({ ...prev, enhanceDescriptions: !!checked }))
                }
              />
              <label htmlFor="descriptions" className="text-sm font-medium">
                📝 Enhance Brief Descriptions
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Batch Size</label>
            <input 
              type="number" 
              value={options.batchSize} 
              onChange={(e) => setOptions(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
              min="1" 
              max="50"
              className="w-20 px-2 py-1 border rounded"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Target Count</label>
            <input 
              type="number" 
              value={options.targetCount} 
              onChange={(e) => setOptions(prev => ({ ...prev, targetCount: parseInt(e.target.value) }))}
              min="1" 
              max="200"
              className="w-20 px-2 py-1 border rounded"
            />
          </div>

          <Button 
            onClick={handleBulkEnhancement}
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? 'Enhancing Personas...' : '🚀 Start Bulk Enhancement'}
          </Button>

          {isRunning && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Processing personas... {progress}%
              </p>
            </div>
          )}

          {results && (
            <div className="mt-4 p-4 border rounded-md bg-muted">
              <h4 className="font-medium mb-2">Enhancement Results</h4>
              <div className="space-y-1 text-sm">
                <p>✅ Processed: {results.processed} personas</p>
                <p>❌ Errors: {results.errors?.length || 0}</p>
                {results.enhanced && results.enhanced.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium">Enhanced Personas</summary>
                    <ul className="mt-1 space-y-1 text-xs">
                      {results.enhanced.slice(0, 10).map((item: string, idx: number) => (
                        <li key={idx}>• {item}</li>
                      ))}
                      {results.enhanced.length > 10 && (
                        <li>... and {results.enhanced.length - 10} more</li>
                      )}
                    </ul>
                  </details>
                )}
                {results.errors && results.errors.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium text-red-600">Errors</summary>
                    <ul className="mt-1 space-y-1 text-xs text-red-600">
                      {results.errors.slice(0, 5).map((error: string, idx: number) => (
                        <li key={idx}>• {error}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📊 Current Status</CardTitle>
          <CardDescription>Overview of persona data completeness</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Missing Knowledge Domains:</span>
              <span className="font-mono text-red-600">~75 personas</span>
            </div>
            <div className="flex justify-between">
              <span>Missing Education:</span>
              <span className="font-mono text-yellow-600">~100 personas</span>
            </div>
            <div className="flex justify-between">
              <span>Brief Descriptions:</span>
              <span className="font-mono text-blue-600">~35 personas</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};