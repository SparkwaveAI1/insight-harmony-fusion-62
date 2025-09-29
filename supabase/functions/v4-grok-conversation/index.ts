import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const grokApiKey = Deno.env.get('GROK_API_KEY')
const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GROK_MODEL = Deno.env.get("GROK_MODEL") ?? "grok-2-latest"
const GROK_VISION_MODEL = Deno.env.get("GROK_VISION_MODEL") ?? "grok-2-vision-1212"

// Helper to normalize image data URLs and prevent double-prefixing
function normalizeImageUrl(imageData: string): string {
  if (!imageData) return imageData;
  
  // If already a data URL, return as-is
  if (imageData.startsWith('data:image/')) {
    return imageData;
  }
  
  // If it's raw base64, add the prefix
  return `data:image/jpeg;base64,${imageData}`;
}

console.log(`🔥 DEPLOYMENT TEST - Edge function is live and updated!`)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { persona_id, user_message, imageData, conversation_history } = await req.json()
    
    console.log(`1. FUNCTION START - persona_id: ${persona_id}`)

    if (!persona_id || !user_message) {
      throw new Error('Missing required parameters: persona_id and user_message')
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log(`2. CALLING OPENAI TRAIT ANALYZER`)

    // Step 1: Get OpenAI trait analysis and system prompt
    const { data: analysisData, error: analysisError } = await supabase.functions.invoke('v4-openai-trait-analyzer', {
      body: {
        persona_id,
        user_message,
        conversation_history
      }
    })

    if (analysisError) {
      console.error('❌ Error calling OpenAI trait analyzer:', analysisError)
      throw new Error(`Trait analysis failed: ${analysisError.message}`)
    }

    if (!analysisData?.success || !analysisData?.system_prompt) {
      console.error('❌ No system prompt generated')
      throw new Error('Failed to generate system prompt')
    }

    console.log(`3. OPENAI ANALYSIS COMPLETE - Generated system prompt`)
    console.log(`4. CALLING GROK WITH OPENAI-GENERATED PROMPT`)

    // Step 2: Call Grok with the OpenAI-generated system prompt
    const grokMessages = [
      {
        role: "system",
        content: analysisData.system_prompt
      }
    ]

    // Add conversation history
    if (conversation_history && conversation_history.length > 0) {
      grokMessages.push(...conversation_history)
    }

    // Normalize image data and add current user message (with image support)
    const normalizedImageData = imageData ? normalizeImageUrl(imageData) : null
    
    const userMessage: any = {
      role: "user",
      content: normalizedImageData ? [
        {
          type: "text",
          text: user_message
        },
        {
          type: "image_url",
          image_url: {
            url: normalizedImageData
          }
        }
      ] : user_message
    }
    
    // Avoid duplicate current user message if the history already ends with the same user content
    const lastMsg = Array.isArray(conversation_history) && conversation_history.length > 0
      ? conversation_history[conversation_history.length - 1]
      : null;
    const isDuplicateLastUser = !!(lastMsg && lastMsg.role === 'user' && typeof lastMsg.content === 'string' &&
      lastMsg.content.trim() === (typeof user_message === 'string' ? user_message.trim() : ''));
    if (!isDuplicateLastUser) {
      grokMessages.push(userMessage)
    } else {
      console.log('🛡️ Skipping duplicate user message appended from conversation_history')
    }

    // Select model based on whether we have image data
    const modelToUse = normalizedImageData ? GROK_VISION_MODEL : GROK_MODEL
    
    console.log(`📸 Image data present: ${!!normalizedImageData}`)
    console.log(`🤖 Using model: ${modelToUse}`)

    let grokMessage: string
    let providerUsed = 'xai'

    // Try xAI Grok first
    try {
      const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${grokApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: grokMessages,
          temperature: 0.8,
          max_tokens: 2000
        }),
      })

      if (!grokResponse.ok) {
        const errorData = await grokResponse.json()
        console.error('❌ Grok API error:', errorData)
        throw new Error(`Grok API error: ${errorData.error?.message || grokResponse.statusText}`)
      }

      const grokData = await grokResponse.json()
      grokMessage = grokData.choices[0]?.message?.content

      if (!grokMessage) {
        throw new Error('No response generated by Grok')
      }

      console.log(`5. GROK RESPONSE RECEIVED`)
      console.log(`✅ PIPELINE COMPLETE - OpenAI→Grok successful`)
      
    } catch (grokError) {
      console.error('⚠️ Grok failed, attempting Gemini fallback:', grokError)
      
      // Fallback to Gemini if Grok fails and we have the API key
      if (!geminiApiKey) {
        const errorMessage = grokError instanceof Error ? grokError.message : String(grokError)
        throw new Error(`Grok failed and no Gemini API key available: ${errorMessage}`)
      }

      providerUsed = 'gemini'
      console.log(`🔄 Falling back to Gemini Vision API`)

      // Build Gemini request format
      const geminiContents = []
      
      for (const msg of grokMessages) {
        if (msg.role === 'system') {
          // Gemini doesn't have system role, prepend to first user message
          continue
        }
        
        const parts = []
        
        if (typeof msg.content === 'string') {
          parts.push({ text: msg.content })
        } else if (Array.isArray(msg.content)) {
          for (const item of msg.content) {
            if (item.type === 'text') {
              parts.push({ text: item.text })
            } else if (item.type === 'image_url') {
              // Extract base64 data from data URL
              const base64Data = item.image_url.url.split(',')[1] || item.image_url.url
              parts.push({
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: base64Data
                }
              })
            }
          }
        }
        
        geminiContents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts
        })
      }

      // Prepend system prompt as first user message
      const systemPrompt = grokMessages.find(m => m.role === 'system')?.content
      if (systemPrompt && geminiContents.length > 0) {
        geminiContents[0].parts.unshift({ text: `System instructions: ${systemPrompt}\n\n` })
      }

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: geminiContents })
        }
      )

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text()
        throw new Error(`Gemini fallback also failed: ${errorText}`)
      }

      const geminiData = await geminiResponse.json()
      grokMessage = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

      if (!grokMessage) {
        throw new Error('No response from Gemini fallback')
      }

      console.log(`5. GEMINI FALLBACK RESPONSE RECEIVED`)
      console.log(`✅ PIPELINE COMPLETE - OpenAI→Gemini successful`)
    }

    // Log the Grok prompt for monitoring
    try {
      await supabase.functions.invoke('log-grok-prompt', {
        body: {
          source: 'v4-grok-conversation',
          persona_id,
          persona_name: analysisData.persona_name,
          user_message,
          system_instructions: analysisData.system_prompt,
          conversation_history,
          extra: {
            grok_model: GROK_MODEL,
            analysis_model: analysisData.model_used,
            traits_selected: analysisData.traits_selected
          }
        }
      })
    } catch (logError) {
      console.error('Failed to log Grok prompt:', logError)
      // Don't fail the main request if logging fails
    }

    // Return the response (from Grok or Gemini)
    return new Response(JSON.stringify({
      success: true,
      response: grokMessage,
      persona_name: analysisData.persona_name,
      model_used: modelToUse,
      provider_used: providerUsed,
      had_image: !!normalizedImageData,
      analysis_model: analysisData.model_used
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Error in v4-grok-conversation:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})