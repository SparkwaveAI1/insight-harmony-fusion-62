import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useHasRole } from "@/hooks/useHasRole";
import { Loader2 } from "lucide-react";

export const CollectionMatcherTest = () => {
  const { hasRole: isAdmin, loading: roleLoading } = useHasRole("admin");
  const [collectionId, setCollectionId] = useState("");
  const [skipLlm, setSkipLlm] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "collection-persona-matcher",
        {
          body: {
            collection_id: collectionId || undefined,
            research_query: collectionId ? undefined : "restaurant owners in California",
            skip_llm_scoring: skipLlm,
            max_results: 20,
          },
        }
      );

      if (fnError) {
        setError(fnError.message);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Admin access required
      </div>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Collection Matcher Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="flex-1">
            <label className="text-sm font-medium">Collection ID (optional)</label>
            <Input
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              placeholder="Leave empty to test with 'restaurant owners in California'"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="skip-llm"
              checked={skipLlm}
              onCheckedChange={(checked) => setSkipLlm(checked === true)}
            />
            <label htmlFor="skip-llm" className="text-sm cursor-pointer">
              Skip LLM scoring (fast)
            </label>
          </div>
          <Button onClick={runTest} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              "Test"
            )}
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md">
            Error: {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 text-green-700 dark:text-green-400 rounded-md">
              Success! Found {result.personas?.length ?? 0} personas in {result.duration_ms}ms
            </div>

            <div className="text-sm">
              <strong>Stages:</strong>
              <pre className="mt-1 p-2 bg-muted rounded overflow-auto text-xs">
                {JSON.stringify(result.stages, null, 2)}
              </pre>
            </div>

            <div className="text-sm">
              <strong>Parsed Criteria:</strong>
              <pre className="mt-1 p-2 bg-muted rounded overflow-auto text-xs">
                {JSON.stringify(result.parsed_criteria, null, 2)}
              </pre>
            </div>

            <div className="text-sm">
              <strong>Top 5 Personas:</strong>
              <div className="mt-1 space-y-2">
                {result.personas?.slice(0, 5).map((p: any) => (
                  <div key={p.persona_id} className="p-3 bg-muted rounded-md">
                    <div className="font-medium">
                      {p.name} {p.match_score !== null && `(${Math.round(p.match_score * 100)}%)`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.demographics.age}, {p.demographics.occupation}, {p.demographics.location}
                    </div>
                    {p.match_reasons?.length > 0 && p.match_reasons[0] !== 'LLM scoring skipped' && (
                      <div className="text-xs text-primary mt-1">
                        {p.match_reasons.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Full Response
              </summary>
              <pre className="mt-1 p-2 bg-muted rounded overflow-auto text-xs max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
