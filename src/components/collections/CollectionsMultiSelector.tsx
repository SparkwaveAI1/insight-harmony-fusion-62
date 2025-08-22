import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { getUserCollections } from '@/services/collections/collectionsService';
import { Collection } from '@/services/collections/types';
import { supabase } from '@/integrations/supabase/client';

interface CollectionsMultiSelectorProps {
  selectedCollectionIds: string[];
  onSelectionChange: (collectionIds: string[]) => void;
  className?: string;
}

export function CollectionsMultiSelector({
  selectedCollectionIds,
  onSelectionChange,
  className
}: CollectionsMultiSelectorProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userCollections = await getUserCollections();
      setCollections(userCollections);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCollection = (collectionId: string) => {
    const newSelection = selectedCollectionIds.includes(collectionId)
      ? selectedCollectionIds.filter(id => id !== collectionId)
      : [...selectedCollectionIds, collectionId];
    
    onSelectionChange(newSelection);
  };

  const selectedCollections = collections.filter(c => selectedCollectionIds.includes(c.id));

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium">
        Add to Collections (optional)
      </label>
      
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              {selectedCollections.length === 0
                ? "Select collections..."
                : selectedCollections.length === 1
                ? selectedCollections[0].name
                : `${selectedCollections.length} collections selected`
              }
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="mt-2 border rounded-md">
            <ScrollArea className="h-[200px]">
              {loading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading collections...
                </div>
              ) : collections.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No collections found. Create a collection first.
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {collections.map((collection) => (
                    <div
                      key={collection.id}
                      className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                      onClick={() => handleToggleCollection(collection.id)}
                    >
                      <Checkbox
                        checked={selectedCollectionIds.includes(collection.id)}
                        onCheckedChange={() => handleToggleCollection(collection.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {collection.name}
                        </div>
                        {collection.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {collection.description}
                          </div>
                        )}
                      </div>
                      {selectedCollectionIds.includes(collection.id) && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {selectedCollections.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Persona will be added to: {selectedCollections.map(c => c.name).join(', ')}
        </div>
      )}
    </div>
  );
}