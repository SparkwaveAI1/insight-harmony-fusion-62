import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useHasRole } from "@/hooks/useHasRole";
import { Loader2 } from "lucide-react";

export function ACPSemanticSearchTest() {
  const { hasRole: isAdmin, loading: roleLoading } = useHasRole("admin");
  const [query, setQuery] = useState("restaurant owners in California who are health conscious");
  const [personaCount, setPersonaCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        'acp-semantic-search',
        {
          body: {
            research_query: query,
            persona_count: personaCount,
            min_results: 3,
          },
        }
      );

      if (fnError) throw fnError;
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (roleLoading) return <div>Loading...</div>;
  if (!isAdmin) return <div>Admin access required</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>ACP Semantic Search Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Research Query</label>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., lawyers who are prosecutors in Texas"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Persona Count</label>
          <Input
            type="number"
            value={personaCount}
            onChange={(e) => setPersonaCount(parseInt(e.target.value) || 5)}
            min={1}
            max={20}
          />
        </div>

        <Button onClick={runTest} disabled={loading || !query}>
          {loading ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Testing...</> : 'Test ACP Search'}
        </Button>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded text-sm">
            Error: {error}
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className={`p-3 rounded text-sm ${result.success ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'}`}>
              Status: {result.status} | Found: {result.personas?.length || 0} personas | Duration: {result.duration_ms}ms
            </div>

            {result.personas?.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Personas:</p>
                {result.personas.map((p: any, i: number) => (
                  <div key={p.persona_id} className="p-2 bg-muted rounded text-sm">
                    <div className="font-medium">{i + 1}. {p.name} ({Math.round(p.match_score * 100)}%)</div>
                    <div className="text-xs text-muted-foreground">{p.match_reason}</div>
                    <div className="text-xs text-muted-foreground/70">
                      {p.demographics?.occupation} • {p.demographics?.age} • {p.demographics?.location}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground">Full Response</summary>
              <pre className="mt-2 p-2 bg-muted rounded overflow-auto max-h-60">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
