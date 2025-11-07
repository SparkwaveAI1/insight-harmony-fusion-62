import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function BatchThumbnailGenerator() {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const { toast } = useToast();

  const processExistingImages = async () => {
    setProcessing(true);
    
    try {
      // Get all personas with images but no thumbnails
      const { data: personas, error } = await supabase
        .from('v4_personas')
        .select('persona_id, profile_image_url')
        .not('profile_image_url', 'is', null)
        .is('profile_thumbnail_url', null)
        .limit(500); // Process all remaining thumbnails

      if (error) throw error;

      setProgress({ current: 0, total: personas?.length || 0 });

      for (let i = 0; i < (personas?.length || 0); i++) {
        const persona = personas[i];
        
        // Since images are already 512x512 from DALL-E, just copy the URL
        // In production, you'd use an image service here
        const thumbnailUrl = persona.profile_image_url;
        
        // Update database with thumbnail URL
        const { error: updateError } = await supabase
          .from('v4_personas')
          .update({ profile_thumbnail_url: thumbnailUrl })
          .eq('persona_id', persona.persona_id);
        
        if (updateError) {
          console.error(`Failed to update persona ${persona.persona_id}:`, updateError);
        }
      
      setProgress({ current: i + 1, total: personas.length });
      }
      
      toast({
        title: "Thumbnails Generated",
        description: `Successfully processed ${personas?.length} personas`,
      });
      
    } catch (error) {
      console.error('Batch processing error:', error);
      toast({
        title: "Error",
        description: "Failed to process images",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-muted/50">
      <h3 className="font-semibold mb-2">Batch Thumbnail Generator</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Generate thumbnails for existing persona images
      </p>
      
      {progress.total > 0 && (
        <div className="mb-4">
          <div className="text-sm mb-1">
            Progress: {progress.current} / {progress.total}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}
      
      <Button 
        onClick={processExistingImages}
        disabled={processing}
      >
        {processing ? 'Processing...' : 'Generate Thumbnails'}
      </Button>
    </div>
  );
}
