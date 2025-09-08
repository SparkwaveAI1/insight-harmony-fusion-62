import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { listPersonaCollections, PersonaCollection } from '@/lib/api/memories';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Folder, FolderOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PersonaCollectionsTabProps {
  personaId: string;
}

export default function PersonaCollectionsTab({ personaId }: PersonaCollectionsTabProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['persona-collections', personaId],
    queryFn: () => listPersonaCollections(supabase, personaId),
    enabled: !!personaId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded w-3/4"></div>
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
          <p className="text-destructive">Failed to load collections. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  const collections = data?.data || [];

  return (
    <div className="space-y-4">
      {collections.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Folder className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No collections yet</h3>
            <p className="text-muted-foreground">
              This persona isn't in any collections yet. Add it to a collection to organize your personas.
            </p>
          </CardContent>
        </Card>
      ) : (
        collections.map((collection) => (
          <Card key={collection.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">{collection.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {collection.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {collection.description}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <Badge variant="outline">Collection</Badge>
                <span className="text-xs text-muted-foreground">
                  Created {formatDistanceToNow(new Date(collection.created_at), { addSuffix: true })}
                </span>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}