import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const grokApiKey = Deno.env.get('GROK_API_KEY')
const openaiKey = Deno.env.get('OPENAI_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GROK_MODEL = Deno.env.get("GROK_MODEL") ?? "grok-3-latest"

// Detail policy keywords for high-res images
const HIGH_DETAIL_KEYWORDS = [
  'what does this say', 'read the text', 'what button', 'terms', 'price',
  'chart', 'graph', 'table', 'screenshot', 'ui', 'interface', 'form',
  'menu', 'code', 'terminal', 'console', 'spreadsheet'
];

interface NormalizedImage {
  data_base64: string;
  mime_type: string;
  filename: string;
}

// Detect MIME type from base64 magic bytes
function detectMimeType(base64: string): string {
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
  } catch { /* ignore */ }
  return 'image/jpeg';
}

// Extract base64 from data URL
function extractBase64(input: string): { data: string; mimeType: string } {
  if (input.startsWith('data:')) {
    const match = input.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      return { mimeType: match[1], data: match[2] };
    }
  }
  return { data: input, mimeType: detectMimeType(input) };
}

// Normalize images from input - handles both string arrays and object arrays
function normalizeImages(imageData: any): NormalizedImage[] {
  if (!imageData) return [];
  const images = Array.isArray(imageData) ? imageData : [imageData];

  return images.map((img, index) => {
    // Handle object format: { data_base64, mime_type }
    if (typeof img === 'object' && img !== null && img.data_base64) {
      const base64Data = extractBase64(img.data_base64);
      return {
        data_base64: base64Data.data,
        mime_type: img.mime_type || base64Data.mimeType,
        filename: img.filename || `image_${index + 1}`,
      };
    }

    // Handle string format (legacy)
    if (typeof img === 'string') {
      const { data, mimeType } = extractBase64(img);
      return {
        data_base64: data,
        mime_type: mimeType,
        filename: `image_${index + 1}`,
      };
    }

    // Skip invalid inputs
    return null;
  }).filter((img): img is NormalizedImage => img !== null);
}

// Decide detail policy based on prompt keywords
function decideDetailPolicy(prompt: string): 'high' | 'auto' {
  const lower = prompt.toLowerCase();
  for (const keyword of HIGH_DETAIL_KEYWORDS) {
    if (lower.includes(keyword)) return 'high';
  }
  return 'auto';
}

console.log(`🔥 v4-grok-conversation - Edge function is live!`)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { persona_id, user_message, imageData, images, conversation_history } = await req.json()

    console.log(`1. FUNCTION START - persona_id: ${persona_id}`)

    if (!persona_id || !user_message) {
      throw new Error('Missing required parameters: persona_id and user_message')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Normalize images from either imageData (legacy) or images (new array)
    const normalizedImages = normalizeImages(images || imageData);
    const hasImages = normalizedImages.length > 0;
    const detailPolicy = hasImages ? decideDetailPolicy(user_message) : 'auto';

    console.log(`📸 Image data present: ${hasImages} (${normalizedImages.length} images)`)
    if (hasImages) {
      console.log(`📐 Detail policy: ${detailPolicy}`)
      console.log(`📁 MIME types: ${normalizedImages.map(i => i.mime_type).join(', ')}`)
    }

    // Step 1: If images present, call image-interpreter first
    let imageReadoutJson: object | null = null;
    let interpreterProvider: string | null = null;
    let interpreterModel: string | null = null;

    if (hasImages) {
      console.log(`2. CALLING IMAGE INTERPRETER`)

      try {
        const { data: interpreterData, error: interpreterError } = await supabase.functions.invoke('image-interpreter', {
          body: {
            images: normalizedImages,
            question_text: user_message,
            mode: 'detailed',
          }
        });

        if (interpreterError) {
          console.warn('⚠️ Image interpreter error:', interpreterError);
        } else if (interpreterData?.success && interpreterData?.image_readout_json) {
          imageReadoutJson = interpreterData.image_readout_json;
          interpreterProvider = interpreterData.provider;
          interpreterModel = interpreterData.model;
          console.log(`✅ Image interpreter: ${interpreterProvider}/${interpreterModel}, JSON: ${!!imageReadoutJson}`);
        }
      } catch (err) {
        console.warn('⚠️ Image interpreter call failed:', err);
      }
    }

    console.log(`3. CALLING OPENAI TRAIT ANALYZER`)

    // Step 2: Get trait analysis with image context
    const { data: analysisData, error: analysisError } = await supabase.functions.invoke('v4-openai-trait-analyzer', {
      body: {
        persona_id,
        user_message,
        conversation_history,
        hasImages,
        imageCount: normalizedImages.length,
        imageReadoutJson,
      }
    })

    if (analysisError) {
      console.error('❌ Trait analyzer error:', analysisError)
      throw new Error(`Trait analysis failed: ${analysisError.message}`)
    }

    if (!analysisData?.success || !analysisData?.system_prompt) {
      throw new Error('Failed to generate system prompt')
    }

    console.log(`4. TRAIT ANALYSIS COMPLETE`)

    let responseMessage: string
    let providerUsed: string
    let modelUsed: string

    // Step 3: Generate response
    if (hasImages && openaiKey) {
      // Use OpenAI Vision directly for image responses
      console.log(`5. USING OPENAI VISION for ${normalizedImages.length} image(s)`)

      // Build prompt with persona context and image readout
      let fullPrompt = `PERSONA CONTEXT:\n${analysisData.system_prompt}\n\n`;

      if (imageReadoutJson) {
        fullPrompt += `IMAGE ANALYSIS:\n${JSON.stringify(imageReadoutJson, null, 2)}\n\n`;
      }

      if (conversation_history?.length > 0) {
        fullPrompt += `CONVERSATION HISTORY:\n`;
        for (const msg of conversation_history) {
          const content = typeof msg.content === 'string' ? msg.content : '[message]';
          fullPrompt += `${msg.role}: ${content}\n`;
        }
        fullPrompt += '\n';
      }

      fullPrompt += `USER MESSAGE: ${user_message}\n\nRespond as the persona, considering the images. Keep response to 2-4 sentences.`;

      // Build OpenAI content array
      const content: any[] = [{ type: 'text', text: fullPrompt }];

      for (const img of normalizedImages) {
        content.push({
          type: 'image_url',
          image_url: {
            url: `data:${img.mime_type};base64,${img.data_base64}`,
            detail: detailPolicy,
          }
        });
      }

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content }],
          max_tokens: 2000,
          temperature: 0.8,
        }),
      });

      if (!openaiResponse.ok) {
        const errData = await openaiResponse.json().catch(() => ({}));
        throw new Error(`OpenAI error: ${errData.error?.message || openaiResponse.statusText}`);
      }

      const openaiData = await openaiResponse.json();
      responseMessage = openaiData.choices?.[0]?.message?.content || '';
      providerUsed = 'openai';
      modelUsed = 'gpt-4o';

      console.log(`6. OPENAI VISION RESPONSE RECEIVED`);

    } else {
      // Text-only: use Grok
      console.log(`5. USING GROK for text-only response`)

      const grokMessages: any[] = [
        { role: "system", content: analysisData.system_prompt }
      ];

      if (conversation_history?.length > 0) {
        grokMessages.push(...conversation_history);
      }

      // Avoid duplicate messages
      const lastMsg = conversation_history?.[conversation_history.length - 1];
      const isDupe = lastMsg?.role === 'user' && lastMsg?.content?.trim() === user_message?.trim();
      if (!isDupe) {
        grokMessages.push({ role: "user", content: user_message });
      }

      const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${grokApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROK_MODEL,
          messages: grokMessages,
          temperature: 0.8,
          max_tokens: 2000
        }),
      });

      if (!grokResponse.ok) {
        const errData = await grokResponse.json().catch(() => ({}));
        throw new Error(`Grok error: ${errData.error?.message || grokResponse.statusText}`);
      }

      const grokData = await grokResponse.json();
      responseMessage = grokData.choices?.[0]?.message?.content || '';
      providerUsed = 'grok';
      modelUsed = GROK_MODEL;

      console.log(`6. GROK RESPONSE RECEIVED`);
    }

    if (!responseMessage) {
      throw new Error('No response generated');
    }

    console.log(`✅ PIPELINE COMPLETE - ${providerUsed}`)

    // Log for monitoring (no base64)
    try {
      await supabase.functions.invoke('log-grok-prompt', {
        body: {
          source: 'v4-grok-conversation',
          persona_id,
          persona_name: analysisData.persona_name,
          user_message,
          extra: {
            model_used: modelUsed,
            provider_used: providerUsed,
            image_count: normalizedImages.length,
            detail_mode: hasImages ? detailPolicy : null,
            interpreter_used: !!imageReadoutJson,
          }
        }
      });
    } catch { /* ignore logging errors */ }

    return new Response(JSON.stringify({
      success: true,
      response: responseMessage,
      persona_name: analysisData.persona_name,
      model_used: modelUsed,
      provider_used: providerUsed,
      had_image: hasImages,
      image_count: normalizedImages.length,
      detail_mode: hasImages ? detailPolicy : null,
      interpreter_used: !!imageReadoutJson,
      analysis_model: analysisData.model_used,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
