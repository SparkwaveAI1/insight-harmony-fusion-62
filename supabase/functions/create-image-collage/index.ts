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

    // For multiple images, create a simple HTML canvas-based collage
    const canvasScript = `
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const images = ${JSON.stringify(images)};
      const maxWidth = ${maxWidth};
      const maxHeight = ${maxHeight};
      
      // Calculate layout
      const imageCount = images.length;
      const cols = Math.ceil(Math.sqrt(imageCount));
      const rows = Math.ceil(imageCount / cols);
      
      const cellWidth = Math.floor(maxWidth / cols);
      const cellHeight = Math.floor(maxHeight / rows);
      
      canvas.width = maxWidth;
      canvas.height = maxHeight;
      
      // Fill with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, maxWidth, maxHeight);
      
      const promises = images.map((base64, index) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = col * cellWidth;
            const y = row * cellHeight;
            
            // Calculate scaling to fit within cell while maintaining aspect ratio
            const scale = Math.min(cellWidth / img.width, cellHeight / img.height);
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            
            // Center the image in the cell
            const offsetX = (cellWidth - scaledWidth) / 2;
            const offsetY = (cellHeight - scaledHeight) / 2;
            
            ctx.drawImage(img, x + offsetX, y + offsetY, scaledWidth, scaledHeight);
            
            // Add border
            ctx.strokeStyle = '#cccccc';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, cellWidth, cellHeight);
            
            // Add image number
            ctx.fillStyle = '#000000';
            ctx.font = '16px Arial';
            ctx.fillText((index + 1).toString(), x + 5, y + 20);
            
            resolve(null);
          };
          img.src = base64;
        });
      });
      
      Promise.all(promises).then(() => {
        const collageBase64 = canvas.toDataURL();
        // Send back the result
        console.log('Collage created with ' + images.length + ' images');
      });
    `;

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

    // For now, return the first image with metadata about multiple images
    // In a production environment, you might want to use a proper image processing library
    return new Response(JSON.stringify({ 
      collageImage: images[0], // Primary image
      multiImageContext: collageInfo,
      message: `This is a multi-image question with ${images.length} images. The primary image is shown, but please consider that there are ${images.length} total images in this question.`
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