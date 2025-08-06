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
    enhanceDescriptions: false,
    enhanceDemographics: true
  });

  const handleBulkEnhancement = async () => {
    setBulkRunning(true);
    setProgress(0);
    setResults(null);

    try {
      console.log('🚀 Starting bulk persona enhancement with options:', options);
      toast.info('Starting bulk enhancement process...');
      
      // More realistic progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 20) return prev + 5;
          if (prev < 80) return prev + 2;
          return Math.min(prev + 1, 95);
        });
      }, 1000);

      const result = await bulkEnhancePersonas(options);
      
      clearInterval(progressInterval);
      setProgress(100);
      setResults(result);

      if (result.success) {
        toast.success(`🎉 Successfully enhanced ${result.processed} personas! Check the results below.`, {
          duration: 5000,
        });
      } else {
        toast.error(`Enhancement failed: ${result.error}`);
      }
      
    } catch (error) {
      console.error('❌ Bulk enhancement error:', error);
      toast.error('Failed to perform bulk enhancement - check console for details');
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
                id="demographics"
                checked={options.enhanceDemographics}
                onCheckedChange={(checked) => 
                  setOptions(prev => ({ ...prev, enhanceDemographics: !!checked }))
                }
              />
              <label htmlFor="demographics" className="text-sm font-medium">
                👥 Fix Missing Demographics (Priority Fix)
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="knowledge-domains"
                checked={options.enhanceKnowledgeDomains}
                onCheckedChange={(checked) => 
                  setOptions(prev => ({ ...prev, enhanceKnowledgeDomains: !!checked }))
                }
              />
              <label htmlFor="knowledge-domains" className="text-sm font-medium">
                🧠 Generate Knowledge Domains
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
            size="lg"
          >
            {isRunning ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Enhancing {options.targetCount} Personas...
              </div>
            ) : (
              '🚀 Start Bulk Enhancement'
            )}
          </Button>

          {isRunning && (
            <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Enhancement Progress</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full h-2" />
              <p className="text-xs text-muted-foreground">
                Processing up to {options.targetCount} personas in batches of {options.batchSize}...
                {progress > 50 && " This may take a few minutes."}
              </p>
            </div>
          )}

          {results && (
            <div className="mt-4 p-4 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
                </div>
                <h4 className="font-semibold text-green-800 dark:text-green-200">Enhancement Complete!</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                    <p className="font-medium text-green-700 dark:text-green-300">✅ Successfully Processed</p>
                    <p className="text-2xl font-bold text-green-800 dark:text-green-200">{results.processed}</p>
                    <p className="text-xs text-muted-foreground">personas enhanced</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                    <p className="font-medium text-gray-700 dark:text-gray-300">❌ Errors</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{results.errors?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">failures</p>
                  </div>
                </div>
                
                {results.enhanced && results.enhanced.length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer font-medium text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200">
                      View Enhanced Personas ({results.enhanced.length})
                    </summary>
                    <div className="mt-2 max-h-40 overflow-y-auto bg-white dark:bg-gray-800 rounded p-2">
                      <ul className="space-y-1 text-xs">
                        {results.enhanced.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-1">
                            <span className="text-green-500">•</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                )}
                
                {results.errors && results.errors.length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer font-medium text-red-600 hover:text-red-700">
                      View Errors ({results.errors.length})
                    </summary>
                    <div className="mt-2 max-h-32 overflow-y-auto bg-red-50 dark:bg-red-950/30 rounded p-2">
                      <ul className="space-y-1 text-xs text-red-700 dark:text-red-300">
                        {results.errors.map((error: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-1">
                            <span>•</span> {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};