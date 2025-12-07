import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, ChevronDown, Loader2 } from "lucide-react";

interface SearchResult {
  persona_id: string;
  name: string;
  similarity: number;
  similarity_percent: number;
  demographics: {
    age: number | null;
    gender: string | null;
    occupation: string | null;
    location: string | null;
  };
  profile_image_url: string | null;
  preview_summary: string | null;
}

interface SearchResponse {
  success: boolean;
  query: string;
  total: number;
  personas: SearchResult[];
  duration_ms: number;
  error?: string;
}

export function SemanticSearchTest() {
  const [query, setQuery] = useState("");
  const [threshold, setThreshold] = useState(0.3);
  const [maxResults, setMaxResults] = useState(50);
  const [filterCollectionId, setFilterCollectionId] = useState("");
  const [excludeCollectionId, setExcludeCollectionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({ title: "Query required", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("semantic-persona-search", {
        body: {
          query: query.trim(),
          match_threshold: threshold,
          max_results: maxResults,
          filter_collection_id: filterCollectionId || undefined,
          exclude_collection_id: excludeCollectionId || undefined,
        },
      });

      if (error) throw error;

      setResults(data as SearchResponse);
      
      if (data.success) {
        toast({ title: `Found ${data.total} personas in ${data.duration_ms}ms` });
      } else {
        toast({ title: "Search failed", description: data.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Semantic Persona Search
        </CardTitle>
        <CardDescription>
          Test the semantic search edge function with natural language queries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Query */}
        <div className="space-y-2">
          <Label htmlFor="query">Search Query</Label>
          <div className="flex gap-2">
            <Input
              id="query"
              placeholder="e.g., health-conscious millennial in tech"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Match Threshold: {threshold}</Label>
            <Slider
              value={[threshold]}
              onValueChange={([v]) => setThreshold(v)}
              min={0.1}
              max={0.9}
              step={0.05}
            />
            <p className="text-xs text-muted-foreground">Lower = more results</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxResults">Max Results</Label>
            <Input
              id="maxResults"
              type="number"
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              min={1}
              max={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filterCollection">Filter Collection ID (optional)</Label>
            <Input
              id="filterCollection"
              placeholder="UUID"
              value={filterCollectionId}
              onChange={(e) => setFilterCollectionId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="excludeCollection">Exclude Collection ID (optional)</Label>
            <Input
              id="excludeCollection"
              placeholder="UUID"
              value={excludeCollectionId}
              onChange={(e) => setExcludeCollectionId(e.target.value)}
            />
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">
                Results: {results.total} personas ({results.duration_ms}ms)
              </h3>
              <Collapsible open={showRawJson} onOpenChange={setShowRawJson}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Raw JSON <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showRawJson ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
            </div>

            <Collapsible open={showRawJson}>
              <CollapsibleContent>
                <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-60">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </CollapsibleContent>
            </Collapsible>

            {results.personas.length > 0 ? (
              <div className="space-y-2">
                {results.personas.map((p) => (
                  <div
                    key={p.persona_id}
                    className="flex items-center gap-3 p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                  >
                    {p.profile_image_url ? (
                      <img
                        src={p.profile_image_url}
                        alt={p.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        {p.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          {p.similarity_percent}%
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {[p.demographics.occupation, p.demographics.location].filter(Boolean).join(" • ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No personas found</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
