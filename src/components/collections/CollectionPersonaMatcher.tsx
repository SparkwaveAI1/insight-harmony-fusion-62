import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useHasRole } from "@/hooks/useHasRole";
import { addPersonasToCollection } from "@/services/collections/personaCollectionOperations";
import { Loader2, Search, Sparkles, UserPlus, ChevronUp, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MatchedPersona {
  persona_id: string;
  name: string;
  similarity: number;
  similarity_percent: number;
  profile_image_url: string | null;
  profile_thumbnail_url: string | null;
  age_computed: number | null;
  gender_computed: string | null;
  occupation_computed: string | null;
  location: string;
  preview_summary: string | null;
}

interface Collection {
  id: string;
  name: string;
  description: string | null;
}

export function CollectionPersonaMatcher() {
  const { hasRole: isAdmin, loading: roleLoading } = useHasRole("admin");
  const { toast } = useToast();
  
  // State
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [customQuery, setCustomQuery] = useState<string>("");
  const [results, setResults] = useState<MatchedPersona[]>([]);
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [searchComplete, setSearchComplete] = useState(false);
  const [collectionInfo, setCollectionInfo] = useState<{ name: string; description: string } | null>(null);
  const [expandedPersonaId, setExpandedPersonaId] = useState<string | null>(null);

  // Fetch collections on mount
  useEffect(() => {
    async function fetchCollections() {
      const { data, error } = await supabase
        .from('collections')
        .select('id, name, description')
        .order('name');
      
      if (!error && data) {
        setCollections(data);
      }
    }
    
    if (isAdmin) {
      fetchCollections();
    }
  }, [isAdmin]);

  // Search for matching personas
  const handleSearch = async () => {
    if (!selectedCollectionId) {
      toast({ title: "Select a collection first", variant: "destructive" });
      return;
    }

    setIsSearching(true);
    setSearchComplete(false);
    setResults([]);
    setSelectedPersonaIds(new Set());

    try {
      const { data, error } = await supabase.functions.invoke('collection-persona-matcher', {
        body: {
          collection_id: selectedCollectionId,
          custom_query: customQuery || undefined,
          max_results: 100,
          match_threshold: 0.3,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setResults(data.personas || []);
      setCollectionInfo(data.collection);
      setSearchComplete(true);
      
      toast({ 
        title: `Found ${data.personas?.length || 0} matching personas`,
        description: `Search completed in ${data.duration_ms}ms`
      });
    } catch (err: any) {
      toast({ title: "Search failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  // Toggle persona selection
  const togglePersona = (personaId: string) => {
    const newSelected = new Set(selectedPersonaIds);
    if (newSelected.has(personaId)) {
      newSelected.delete(personaId);
    } else {
      newSelected.add(personaId);
    }
    setSelectedPersonaIds(newSelected);
  };

  // Select/deselect all
  const toggleAll = () => {
    if (selectedPersonaIds.size === results.length) {
      setSelectedPersonaIds(new Set());
    } else {
      setSelectedPersonaIds(new Set(results.map(p => p.persona_id)));
    }
  };

  // Add selected personas to collection
  const handleAddToCollection = async () => {
    if (selectedPersonaIds.size === 0) {
      toast({ title: "Select at least one persona", variant: "destructive" });
      return;
    }

    setIsAdding(true);
    try {
      await addPersonasToCollection(selectedCollectionId, Array.from(selectedPersonaIds));
      
      toast({ 
        title: "Success!", 
        description: `Added ${selectedPersonaIds.size} personas to ${collectionInfo?.name}`
      });
      
      // Remove added personas from results
      setResults(prev => prev.filter(p => !selectedPersonaIds.has(p.persona_id)));
      setSelectedPersonaIds(new Set());
    } catch (err: any) {
      toast({ title: "Failed to add personas", description: err.message, variant: "destructive" });
    } finally {
      setIsAdding(false);
    }
  };

  if (roleLoading) {
    return <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> Loading...</div>;
  }

  if (!isAdmin) {
    return <div className="text-destructive">Admin access required</div>;
  }

  const selectedCollection = collections.find(c => c.id === selectedCollectionId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Collection Persona Matcher
        </CardTitle>
        <CardDescription>
          Find personas that match a collection's description using AI semantic search
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Collection Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Collection</label>
          <Select value={selectedCollectionId} onValueChange={setSelectedCollectionId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a collection to fill..." />
            </SelectTrigger>
            <SelectContent>
              {collections.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCollection?.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {selectedCollection.description}
            </p>
          )}
        </div>

        {/* Custom Query Override */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Custom Search Query (optional)</label>
          <Input
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            placeholder="Override collection description with custom search..."
          />
          <p className="text-xs text-muted-foreground">
            Leave empty to use collection name + description as the search query
          </p>
        </div>

        {/* Search Button */}
        <Button 
          onClick={handleSearch} 
          disabled={!selectedCollectionId || isSearching}
          className="w-full"
        >
          {isSearching ? (
            <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Searching...</>
          ) : (
            <><Search className="mr-2 h-4 w-4" /> Find Matching Personas</>
          )}
        </Button>

        {/* Results */}
        {searchComplete && (
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {results.length} personas found (not in collection)
              </span>
              {results.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={toggleAll}>
                    {selectedPersonaIds.size === results.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleAddToCollection}
                    disabled={selectedPersonaIds.size === 0 || isAdding}
                  >
                    {isAdding ? (
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    ) : (
                      <UserPlus className="mr-2 h-4 w-4" />
                    )}
                    Add {selectedPersonaIds.size} to Collection
                  </Button>
                </div>
              )}
            </div>

            {/* Results List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map(persona => (
                <div key={persona.persona_id} className="space-y-0">
                  <div 
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedPersonaIds.has(persona.persona_id) 
                        ? 'bg-primary/10 border-primary/50' 
                        : 'hover:bg-muted/50 border-border'
                    } ${expandedPersonaId === persona.persona_id ? 'rounded-b-none' : ''}`}
                    onClick={() => togglePersona(persona.persona_id)}
                  >
                    <Checkbox 
                      checked={selectedPersonaIds.has(persona.persona_id)}
                      onCheckedChange={() => togglePersona(persona.persona_id)}
                    />
                    
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={persona.profile_thumbnail_url || persona.profile_image_url || undefined} />
                      <AvatarFallback>{persona.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                  <a 
                    href={`/persona-detail/${persona.persona_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium truncate hover:text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {persona.name}
                        </a>
                        <Badge variant="secondary" className="text-xs">
                          {persona.similarity_percent}% match
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {[persona.age_computed, persona.occupation_computed, persona.location]
                          .filter(Boolean)
                          .join(' • ')}
                      </div>
                      {persona.preview_summary && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {persona.preview_summary}
                        </p>
                      )}
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedPersonaId(expandedPersonaId === persona.persona_id ? null : persona.persona_id);
                      }}
                    >
                      {expandedPersonaId === persona.persona_id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {expandedPersonaId === persona.persona_id && (
                    <div className="pl-16 pr-4 py-3 text-sm text-muted-foreground bg-muted/50 rounded-b-lg border border-t-0 border-border">
                      {persona.preview_summary || "No summary available"}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {results.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No matching personas found that aren't already in this collection.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
