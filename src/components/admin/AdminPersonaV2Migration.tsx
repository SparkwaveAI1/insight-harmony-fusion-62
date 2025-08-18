import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { migrationService, MigrationResult } from '@/services/persona/migration/migrationService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PlayCircle, PauseCircle, RefreshCw, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface MigrationStats {
  v1Count: number;
  v2Count: number;
  migrationRate: number;
}

export const AdminPersonaV2Migration: React.FC = () => {
  const [stats, setStats] = useState<MigrationStats>({ v1Count: 0, v2Count: 0, migrationRate: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [batchSize, setBatchSize] = useState(8);
  const [migrationMode, setMigrationMode] = useState<'safe' | 'fast'>('safe');
  const [results, setResults] = useState<MigrationResult[]>([]);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  // Load migration statistics
  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const [v1Result, v2Result] = await Promise.all([
        supabase.from('personas').select('id', { count: 'exact', head: true }),
        supabase.from('personas_v2').select('id', { count: 'exact', head: true })
      ]);

      const v1Count = v1Result.count || 0;
      const v2Count = v2Result.count || 0;
      const migrationRate = v1Count > 0 ? (v2Count / (v1Count + v2Count)) * 100 : 0;

      setStats({ v1Count, v2Count, migrationRate });
    } catch (error) {
      console.error('Failed to load migration stats:', error);
      toast.error('Failed to load migration statistics');
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Calculate batches needed
  useEffect(() => {
    const batches = Math.ceil(stats.v1Count / batchSize);
    setTotalBatches(batches);
  }, [stats.v1Count, batchSize]);

  const handleStartMigration = async () => {
    if (stats.v1Count === 0) {
      toast.info('No V1 personas found to migrate');
      return;
    }

    setIsRunning(true);
    setIsPaused(false);
    setProgress(0);
    setResults([]);
    setCurrentBatch(0);

    toast.info(`Starting migration of ${stats.v1Count} personas in ${totalBatches} batches`);

    try {
      // Get all candidates first
      const candidates = await migrationService.getMigrationCandidates();
      
      for (let i = 0; i < candidates.length && !isPaused; i += batchSize) {
        setCurrentBatch(Math.floor(i / batchSize) + 1);
        
        const batch = candidates.slice(i, i + batchSize);
        const batchResults: MigrationResult[] = [];

        // Process batch in parallel if fast mode, sequentially if safe mode
        if (migrationMode === 'fast') {
          const promises = batch.map(candidate => 
            migrationService.migratePersona(candidate.persona_id)
          );
          const batchRes = await Promise.all(promises);
          batchResults.push(...batchRes);
        } else {
          // Safe mode: sequential processing with delays
          for (const candidate of batch) {
            if (isPaused) break;
            const result = await migrationService.migratePersona(candidate.persona_id);
            batchResults.push(result);
            // Small delay to prevent overwhelming the system
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        setResults(prev => [...prev, ...batchResults]);
        
        const newProgress = Math.min(((i + batchSize) / candidates.length) * 100, 100);
        setProgress(newProgress);

        // Reload stats after each batch
        await loadStats();

        // Longer delay between batches in safe mode
        if (migrationMode === 'safe' && i + batchSize < candidates.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!isPaused) {
        setProgress(100);
        const successCount = results.filter(r => r.status === 'success').length;
        const errorCount = results.filter(r => r.status === 'error').length;
        
        toast.success(`Migration complete! ${successCount} successful, ${errorCount} errors`);
      }

    } catch (error) {
      console.error('Migration failed:', error);
      toast.error('Migration process failed - check console for details');
    } finally {
      setIsRunning(false);
      setIsPaused(false);
    }
  };

  const handlePauseMigration = () => {
    setIsPaused(!isPaused);
    toast.info(isPaused ? 'Migration resumed' : 'Migration paused');
  };

  const handleResetMigration = () => {
    setIsRunning(false);
    setIsPaused(false);
    setProgress(0);
    setResults([]);
    setCurrentBatch(0);
    loadStats();
    toast.info('Migration process reset');
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          PersonaV2 Migration Tools
        </CardTitle>
        <CardDescription>
          Migrate all V1 personas to the new PersonaV2 format with enhanced voicepack system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Migration Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">V1 Personas</span>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold">{loadingStats ? '...' : stats.v1Count}</p>
            <p className="text-xs text-muted-foreground">Need migration</p>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">V2 Personas</span>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold">{loadingStats ? '...' : stats.v2Count}</p>
            <p className="text-xs text-muted-foreground">Migrated</p>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Migration Rate</span>
              <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
              </div>
            </div>
            <p className="text-2xl font-bold">{loadingStats ? '...' : Math.round(stats.migrationRate)}%</p>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>

        <Separator />

        {/* Migration Controls */}
        <div className="space-y-4">
          <h4 className="font-medium">Migration Configuration</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Batch Size</label>
              <select 
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value))}
                disabled={isRunning}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value={5}>5 personas (Safest)</option>
                <option value={8}>8 personas (Recommended)</option>
                <option value={12}>12 personas (Faster)</option>
                <option value={15}>15 personas (Fastest)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Migration Mode</label>
              <select 
                value={migrationMode}
                onChange={(e) => setMigrationMode(e.target.value as 'safe' | 'fast')}
                disabled={isRunning}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="safe">Safe Mode (Sequential)</option>
                <option value="fast">Fast Mode (Parallel)</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-md">
            <p><strong>Estimated batches:</strong> {totalBatches} batches of {batchSize} personas each</p>
            <p><strong>Mode:</strong> {migrationMode === 'safe' ? 'Sequential processing with validation' : 'Parallel processing for speed'}</p>
          </div>
        </div>

        {/* Migration Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={handleStartMigration}
            disabled={isRunning || stats.v1Count === 0}
            className="flex-1"
            size="lg"
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            {isRunning ? `Processing Batch ${currentBatch}/${totalBatches}...` : `Migrate ${stats.v1Count} Personas`}
          </Button>
          
          {isRunning && (
            <Button 
              onClick={handlePauseMigration}
              variant="outline"
              size="lg"
            >
              {isPaused ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
            </Button>
          )}
          
          <Button 
            onClick={handleResetMigration}
            variant="outline"
            size="lg"
            disabled={!isRunning && results.length === 0}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Migration Progress */}
        {(isRunning || results.length > 0) && (
          <div className="space-y-3 p-4 bg-primary/5 rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Migration Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Batch {currentBatch} of {totalBatches}</span>
              <span>{successCount} success, {errorCount} errors</span>
            </div>
            {isPaused && (
              <div className="flex items-center gap-2 text-amber-600">
                <PauseCircle className="h-4 w-4" />
                <span className="text-sm">Migration paused - click resume to continue</span>
              </div>
            )}
          </div>
        )}

        {/* Migration Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Migration Results</h4>
              <div className="flex gap-2">
                <Badge variant={successCount > 0 ? "default" : "secondary"}>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {successCount} Success
                </Badge>
                <Badge variant={errorCount > 0 ? "destructive" : "secondary"}>
                  <XCircle className="h-3 w-3 mr-1" />
                  {errorCount} Errors
                </Badge>
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-3 bg-muted/20">
              {results.map((result, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="font-mono">{result.name}</span>
                  <div className="flex items-center gap-2">
                    {result.status === 'success' ? (
                      <Badge variant="default">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Success
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Error
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Post-Migration Actions */}
        {progress === 100 && results.length > 0 && (
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Migration Complete!</h4>
            <p className="text-sm text-green-700 dark:text-green-300 mb-3">
              All personas have been processed. Review the results above and refresh the page to see updated statistics.
            </p>
            <Button 
              onClick={loadStats}
              variant="outline"
              size="sm"
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Statistics
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};