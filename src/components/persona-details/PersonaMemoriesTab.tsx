import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { listPersonaMemories, PersonaMemory } from '@/lib/api/memories';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Tag, MessageCircle, BookOpen, FileText, Globe, Circle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PersonaMemoriesTabProps {
  personaId: string;
}

const typeIcons = {
  conversation: MessageCircle,
  fact: BookOpen,
  note: FileText,
  global: Globe,
};

const typeColors = {
  conversation: 'bg-blue-100 text-blue-800',
  fact: 'bg-green-100 text-green-800',
  note: 'bg-yellow-100 text-yellow-800',
  global: 'bg-purple-100 text-purple-800',
};

export default function PersonaMemoriesTab({ personaId }: PersonaMemoriesTabProps) {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [cursor, setCursor] = useState<string | undefined>();
  const [allMemories, setAllMemories] = useState<PersonaMemory[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['persona-memories', personaId, typeFilter],
    queryFn: async () => {
      const result = await listPersonaMemories(supabase, personaId, {
        limit: 20,
        type: typeFilter === 'all' ? undefined : typeFilter,
        includeGlobal: true,
      });
      setAllMemories(result.data);
      setCursor(result.next_cursor);
      return result;
    },
    enabled: !!personaId,
  });

  const loadMore = async () => {
    if (!cursor) return;
    
    try {
      const result = await listPersonaMemories(supabase, personaId, {
        limit: 20,
        cursor,
        type: typeFilter === 'all' ? undefined : typeFilter,
        includeGlobal: true,
      });
      
      setAllMemories(prev => {
        const seen = new Set(prev.map(m => m.id));
        const next = result.data.filter(m => !seen.has(m.id));
        return [...prev, ...next];
      });
      setCursor(result.next_cursor);
    } catch (err) {
      console.error('Failed to load more memories:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">Failed to load memories. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  const memories = allMemories;
  const hasMore = !!cursor;

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex items-center gap-4">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="conversation">Conversations</SelectItem>
            <SelectItem value="fact">Facts</SelectItem>
            <SelectItem value="note">Notes</SelectItem>
            <SelectItem value="global">Global</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Memories List */}
      {memories.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No memories yet</h3>
            <p className="text-muted-foreground">
              Upload a conversation or add a note to start building this persona's memory bank.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {memories.map((memory) => {
            const Icon = typeIcons[memory.type] ?? Circle;
            const typeColor = typeColors[memory.type] ?? 'bg-gray-100 text-gray-800';
            
            return (
              <Card key={memory.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <CardTitle className="text-base">
                        {memory.title || `${memory.type.charAt(0).toUpperCase() + memory.type.slice(1)} Memory`}
                      </CardTitle>
                    </div>
                    <Badge variant="secondary" className={typeColor}>
                      {memory.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                    {memory?.content?.text ?? 'No preview available'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {Array.isArray(memory.tags) && memory.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3 text-muted-foreground" />
                          <div className="flex gap-1">
                            {memory.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {memory.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{memory.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(memory.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {hasMore && (
            <div className="text-center">
              <Button variant="outline" onClick={loadMore}>
                Load more memories
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}