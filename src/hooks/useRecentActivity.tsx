
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Activity {
  id: string;
  type: 'persona' | 'collection' | 'insight';
  title: string;
  description: string;
  iconName: 'Users' | 'Folder' | 'BarChart3';
  timestamp: Date;
}

export function useRecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      setIsLoading(true);
      
      try {
        // Fetch recent personas (created or updated)
        const { data: personas, error: personasError } = await supabase
          .from('personas')
          .select('id, persona_id, name, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        if (personasError) throw personasError;

        // Fetch recent collections (created or updated)
        const { data: collections, error: collectionsError } = await supabase
          .from('collections')
          .select('id, name, updated_at')
          .order('updated_at', { ascending: false })
          .limit(3);

        if (collectionsError) throw collectionsError;

        // Fetch recent collection-persona associations
        const { data: collectionPersonas, error: collectionPersonasError } = await supabase
          .from('collection_personas')
          .select('id, persona_id, collection_id, added_at')
          .order('added_at', { ascending: false })
          .limit(2);

        if (collectionPersonasError) throw collectionPersonasError;

        // Now fetch the related persona and collection names separately
        const personaCollectionActivities: Activity[] = [];
        
        if (collectionPersonas && collectionPersonas.length > 0) {
          for (const cp of collectionPersonas) {
            // Get persona name
            const { data: personaData } = await supabase
              .from('personas')
              .select('name')
              .eq('persona_id', cp.persona_id)
              .single();
            
            // Get collection name
            const { data: collectionData } = await supabase
              .from('collections')
              .select('name')
              .eq('id', cp.collection_id)
              .single();
            
            const personaName = personaData?.name || 'Unknown Persona';
            const collectionName = collectionData?.name || 'Unknown Collection';
            
            personaCollectionActivities.push({
              id: cp.id,
              type: 'insight',
              title: 'Persona added to collection',
              description: `Added "${personaName}" to "${collectionName}"`,
              iconName: 'BarChart3',
              timestamp: new Date(cp.added_at)
            });
          }
        }

        // Transform the data into activity items
        const personaActivities: Activity[] = (personas || []).map(persona => ({
          id: persona.id,
          type: 'persona',
          title: 'Persona created',
          description: `You created "${persona.name}"`,
          iconName: 'Users',
          timestamp: new Date(persona.created_at)
        }));

        const collectionActivities: Activity[] = (collections || []).map(collection => ({
          id: collection.id,
          type: 'collection',
          title: 'Collection updated',
          description: `You updated "${collection.name}"`,
          iconName: 'Folder',
          timestamp: new Date(collection.updated_at)
        }));

        // Combine all activities and sort by timestamp
        const combinedActivities = [
          ...personaActivities,
          ...collectionActivities,
          ...personaCollectionActivities
        ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5); // Limit to 5 most recent activities

        setActivities(combinedActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
        // Fallback to mock data if there's an error or no data
        const mockActivities: Activity[] = [
          {
            id: '1',
            type: 'persona',
            title: 'Persona interview completed',
            description: 'You interviewed "Jamie, 34, Marketing Manager"',
            iconName: 'Users',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
          },
          {
            id: '2',
            type: 'collection',
            title: 'New collection created',
            description: 'You created "Product Feedback - Q2"',
            iconName: 'Folder',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
          },
          {
            id: '3',
            type: 'insight',
            title: 'Insight generated',
            description: 'New insights for "Millennial Shopping Habits"',
            iconName: 'BarChart3',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
          }
        ];
        
        setActivities(mockActivities);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  return { activities, isLoading };
}
