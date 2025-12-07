import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useHasRole } from "@/hooks/useHasRole";
import { Loader2, Play, CheckCircle, AlertCircle, Square } from "lucide-react";

export const EmbeddingGenerator = () => {
  const { hasRole: isAdmin, loading: roleLoading } = useHasRole("admin");
  const [loading, setLoading] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const [stats, setStats] = useState<{
    total: number;
    withEmbeddings: number;
    remaining: number;
  } | null>(null);
  const [lastResult, setLastResult] = useState<{
    processed: number;
    duration_ms: number;
    errors?: number;
    remaining?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch current stats
  const fetchStats = async () => {
    const { count: total } = await supabase
      .from('v4_personas')
      .select('persona_id', { count: 'exact', head: true })
      .eq('creation_completed', true);

    const { count: withEmbeddings } = await supabase
      .from('v4_personas')
      .select('persona_id', { count: 'exact', head: true })
      .eq('creation_completed', true)
      .not('profile_embedding', 'is', null);

    setStats({
      total: total ?? 0,
      withEmbeddings: withEmbeddings ?? 0,
      remaining: (total ?? 0) - (withEmbeddings ?? 0),
    });
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  const runBatch = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        'generate-persona-embeddings',
        {
          body: { 
            batch_size: 50,
            force_regenerate: true  // TEMPORARY: Regenerate all with new comprehensive text
          },
        }
      );

      if (fnError) {
        setError(fnError.message);
        return false;
      }

      setLastResult(data);
      await fetchStats();

      // Return true if there are more to process
      return (data.remaining ?? 0) > 0 && data.processed > 0;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const runAutomatic = async () => {
    setAutoRunning(true);
    let hasMore = true;
    let batchCount = 0;

    while (hasMore && batchCount < 100) { // Safety limit
      hasMore = await runBatch();
      batchCount++;
      
      if (hasMore) {
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setAutoRunning(false);
  };

  const stopAutomatic = () => {
    setAutoRunning(false);
  };

  if (roleLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="animate-spin h-4 w-4" /> Loading...
      </div>
    );
  }

  if (!isAdmin) {
    return <div className="text-destructive">Admin access required</div>;
  }

  const progress = stats && stats.total > 0 ? (stats.withEmbeddings / stats.total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Persona Embedding Generator
          {stats?.remaining === 0 && stats.total > 0 && (
            <CheckCircle className="text-green-500 h-5 w-5" />
          )}
        </CardTitle>
        <CardDescription>
          Generate semantic search embeddings for all personas. Required for semantic search to work.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        {stats && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{stats.withEmbeddings.toLocaleString()} of {stats.total.toLocaleString()} personas have embeddings</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            {stats.remaining > 0 && (
              <p className="text-sm text-muted-foreground">
                {stats.remaining.toLocaleString()} personas remaining (~{Math.ceil(stats.remaining / 50)} batches)
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={runBatch}
            disabled={loading || autoRunning || stats?.remaining === 0}
            variant="outline"
          >
            {loading && !autoRunning ? (
              <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Processing...</>
            ) : (
              'Run Single Batch (50)'
            )}
          </Button>

          {!autoRunning ? (
            <Button
              onClick={runAutomatic}
              disabled={loading || stats?.remaining === 0}
            >
              <Play className="mr-2 h-4 w-4" />
              Run All Automatically
            </Button>
          ) : (
            <Button onClick={stopAutomatic} variant="destructive">
              <Square className="mr-2 h-4 w-4" />
              Stop
            </Button>
          )}

          <Button onClick={fetchStats} variant="ghost" disabled={loading}>
            Refresh Stats
          </Button>
        </div>

        {/* Status */}
        {autoRunning && (
          <div className="flex items-center gap-2 text-primary bg-primary/10 p-3 rounded-md">
            <Loader2 className="animate-spin h-4 w-4" />
            <span>Auto-processing batches... {stats?.remaining} remaining</span>
          </div>
        )}

        {/* Last Result */}
        {lastResult && (
          <div className="text-sm bg-muted p-3 rounded-md space-y-1">
            <p><strong>Last batch:</strong> {lastResult.processed} processed in {lastResult.duration_ms}ms</p>
            {lastResult.errors && lastResult.errors > 0 && (
              <p className="text-destructive">Errors: {lastResult.errors}</p>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-md">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Complete */}
        {stats?.remaining === 0 && stats.total > 0 && (
          <div className="flex items-center gap-2 text-green-600 bg-green-500/10 p-3 rounded-md">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <span>All personas have embeddings! Semantic search is ready.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
