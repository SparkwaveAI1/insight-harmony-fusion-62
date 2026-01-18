/**
 * Image Interpreter Edge Function
 *
 * Simplified version - self-contained without complex module imports.
 * Analyzes images using OpenAI Vision and returns structured JSON.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Allowed MIME types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Detail policy keywords
const HIGH_DETAIL_KEYWORDS = [
  'what does this say', 'read the text', 'what button', 'terms', 'price',
  'chart', 'graph', 'table', 'screenshot', 'ui', 'interface', 'form',
  'menu', 'code', 'terminal', 'console', 'spreadsheet'
];

interface ImageInput {
  data_base64: string;
  mime_type?: string;
  filename?: string;
}

interface ImageInterpreterRequest {
  images: ImageInput[];
  question_text?: string;
  mode?: 'detailed' | 'quick';
}

// Detect MIME type from base64 magic bytes
function detectMimeType(base64: string): string {
  if (base64.startsWith('data:')) {
    const match = base64.match(/^data:([^;]+);/);
    return match?.[1] || 'image/jpeg';
  }

  try {
    const decoded = atob(base64.slice(0, 20));
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }

    if (bytes[0] === 0xFF && bytes[1] === 0xD8) return 'image/jpeg';
    if (bytes[0] === 0x89 && bytes[1] === 0x50) return 'image/png';
    if (bytes[0] === 0x52 && bytes[1] === 0x49) return 'image/webp';
    if (bytes[0] === 0x47 && bytes[1] === 0x49) return 'image/gif';
  } catch {
    // Ignore detection errors
  }

  return 'image/jpeg';
}

// Decide detail policy
function decideDetailPolicy(questionText: string): 'high' | 'auto' {
  const lower = questionText.toLowerCase();
  for (const keyword of HIGH_DETAIL_KEYWORDS) {
    if (lower.includes(keyword)) return 'high';
  }
  return 'auto';
}

// Extract base64 from data URL if needed
function extractBase64(input: string): string {
  if (input.startsWith('data:')) {
    const match = input.match(/^data:[^;]+;base64,(.+)$/);
    return match?.[1] || input;
  }
  return input;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const body: ImageInterpreterRequest = await req.json();
    const { images: rawImages, question_text = '', mode = 'detailed' } = body;

    if (!rawImages || !Array.isArray(rawImages) || rawImages.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No images provided',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate and process images
    const processedImages: Array<{ base64: string; mimeType: string }> = [];

    for (const img of rawImages) {
      const base64 = extractBase64(img.data_base64);
      const mimeType = img.mime_type || detectMimeType(base64);

      if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        console.warn(`Skipping image with invalid MIME type: ${mimeType}`);
        continue;
      }

      processedImages.push({ base64, mimeType });
    }

    if (processedImages.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No valid images after validation',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get OpenAI API key
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'OpenAI API key not configured',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Decide detail policy
    const detailPolicy = decideDetailPolicy(question_text);

    // Build OpenAI message content
    const content: Array<{ type: string; text?: string; image_url?: { url: string; detail: string } }> = [];

    // Add prompt
    const promptText = mode === 'quick'
      ? `Briefly analyze this image and return JSON with: summary, image_type (screenshot/photo/chart/document/ui/other), has_text (boolean), key_objects (array of strings).`
      : `Analyze this image thoroughly for a persona-based research system. Return JSON with:
- summary: 1-2 sentence description
- image_type: screenshot/photo/chart/diagram/document/ui/art/meme/other
- text_content: { has_text: boolean, extracted_text: string if any, text_type: title/body/label/code/caption/button/error/mixed/none }
- visual_elements: { dominant_colors: [], objects: [], people: { count: number, description: string }, style: professional/casual/technical/artistic/humorous/formal/informal }
- context_clues: { setting: string, purpose: string, audience: string, emotional_tone: positive/negative/neutral/urgent/informative/entertaining }
- technical_details: { is_ui: boolean, platform: string if UI, data_visualization: boolean, code_visible: boolean }

${question_text ? `User's question context: "${question_text}"` : ''}`;

    content.push({ type: 'text', text: promptText });

    // Add images
    for (const img of processedImages) {
      content.push({
        type: 'image_url',
        image_url: {
          url: `data:${img.mimeType};base64,${img.base64}`,
          detail: detailPolicy,
        },
      });
    }

    console.log(`🔍 Image Interpreter: Analyzing ${processedImages.length} image(s), detail: ${detailPolicy}`);

    // Call OpenAI Vision
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an image analysis assistant. Always respond with valid JSON only, no markdown formatting.',
          },
          { role: 'user', content },
        ],
        max_tokens: mode === 'quick' ? 500 : 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content || '';

    // Parse JSON from response
    let imageReadoutJson: object | undefined;
    try {
      // Handle markdown code blocks
      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : rawText.trim();
      imageReadoutJson = JSON.parse(jsonStr);
    } catch {
      console.warn('Failed to parse JSON from response');
    }

    const processingTime = Date.now() - startTime;
    console.log(`✅ Image Interpreter: Success in ${processingTime}ms, JSON: ${!!imageReadoutJson}`);

    return new Response(JSON.stringify({
      success: true,
      image_readout_json: imageReadoutJson,
      raw_text: rawText,
      provider: 'openai',
      model: 'gpt-4o',
      detail_mode: detailPolicy,
      image_count: processedImages.length,
      mime_types: processedImages.map(i => i.mimeType),
      processing_time_ms: processingTime,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Image Interpreter Error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'openai',
      model: 'gpt-4o',
      detail_mode: 'unknown',
      image_count: 0,
      mime_types: [],
      processing_time_ms: Date.now() - startTime,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
