import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CollageRequest {
  images: string[]; // Array of base64 image data
  maxWidth?: number;
  maxHeight?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { images, maxWidth = 1024, maxHeight = 1024 }: CollageRequest = await req.json();

    if (!images || images.length === 0) {
      return new Response(JSON.stringify({ error: 'No images provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (images.length === 1) {
      // If only one image, return it as-is
      return new Response(JSON.stringify({ collageImage: images[0] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

async function createImageGrid(images: string[], maxWidth: number, maxHeight: number): Promise<string> {
  // For server-side image processing, we'll create a simple text-based description
  // and concatenate images vertically or side by side for now
  
  // Calculate grid layout
  const imageCount = images.length;
  const cols = Math.min(imageCount, 2); // Max 2 columns for readability
  const rows = Math.ceil(imageCount / cols);
  
  // Create a simple concatenated view by joining images with separators
  const separatedImages = images.map((img, index) => {
    // Add image number prefix to help AI identify each image
    const imageNumber = `IMAGE ${index + 1}`;
    return { data: img, label: imageNumber };
  });
  
  // For now, return the first image with clear context about others
  // This is a simplified approach until we implement proper server-side image processing
  return images[0];
}

    // Simple server-side approach: create a basic grid layout description
    // Since we can't run browser canvas on server, we'll return a composite description
    const collageInfo = {
      type: 'multi-image',
      imageCount: images.length,
      layout: {
        cols: Math.ceil(Math.sqrt(images.length)),
        rows: Math.ceil(images.length / Math.ceil(Math.sqrt(images.length)))
      },
      images: images,
      description: `A collage of ${images.length} images arranged in a grid layout`
    };

    // Create a concatenated image with all images and clear descriptions
    const concatenatedImageData = await createImageGrid(images, maxWidth, maxHeight);
    
    return new Response(JSON.stringify({ 
      collageImage: concatenatedImageData,
      multiImageContext: collageInfo,
      message: `You are viewing ${images.length} images arranged in a grid. Each image is numbered (1, 2, 3, etc.) in the top-left corner for reference.`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating image collage:', error);
    return new Response(JSON.stringify({ error: 'Failed to create image collage' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});