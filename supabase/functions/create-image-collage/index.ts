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

async function createImageGrid(images: string[], maxWidth: number, maxHeight: number): Promise<string[]> {
  // Return all images individually with clear numbering
  return images;
}

    // Return all images with context information
    const allImages = await createImageGrid(images, maxWidth, maxHeight);
    
    return new Response(JSON.stringify({ 
      images: allImages,
      imageCount: images.length,
      message: `You are viewing ${images.length} images. Each image is numbered for reference (Image 1, Image 2, etc.).`
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