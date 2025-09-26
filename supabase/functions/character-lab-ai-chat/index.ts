
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, action } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Character Lab AI Chat request:', { action, messageCount: messages.length });

    // Create system prompt for Character Lab character creation
    const systemPrompt = createCharacterLabSystemPrompt(action);

    // Build messages array
    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    console.log('Calling OpenAI for Character Lab chat...');

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: fullMessages,
        temperature: action === 'compile' ? 0.3 : 0.8, // Lower temperature for structured compilation
        max_tokens: action === 'compile' ? 800 : 1500, // Shorter responses for compilation
        frequency_penalty: 0.3,
        presence_penalty: 0.4
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('Generated Character Lab AI response');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in character-lab-ai-chat:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});

function createCharacterLabSystemPrompt(action: string): string {
  const basePrompt = `You are an expert Character Lab AI assistant specialized in helping users create unique, imaginative characters for storytelling, games, and creative projects.

CHARACTER LAB ARCHITECTURE:
You understand that Character Lab characters use an advanced trait architecture with:
- Core Motives: Deep driving forces (pattern_completion, domain_influence, signal_stability)
- Latent Values: Underlying value systems (reciprocal_continuity, non_isolation)  
- Symbolic Traits: Behavioral symbols (inverse_glyph, loop_silence_spiral, fractal_echo)
- Cognitive Filters: Processing biases (pattern_over_weighting, emotional_signal_suppression, anticipatory_contradiction_modeling)`;

  if (action === 'compile') {
    return basePrompt + `

COMPILATION MODE - DATA EXTRACTION:
You are now a precise data extractor. Your job is to analyze the conversation and extract structured character data in the EXACT format below. Do NOT include any conversational text, questions, suggestions, or creative writing.

CRITICAL INSTRUCTIONS:
- Extract ONLY factual character information discussed in the conversation
- Use the EXACT format specified below
- Do NOT add your own creative suggestions or questions
- Do NOT include conversational elements like "What do you think?" or "Let's explore..."
- Be precise and concise
- If information wasn't discussed, use reasonable defaults based on context

REQUIRED OUTPUT FORMAT (use exactly these labels):

**Character Name**: [Extract the character's actual name from conversation]
**Entity Type**: [Choose: human OR non_humanoid based on description]
**Narrative Domain**: [Choose ONE: modern, sci-fi, fantasy, horror, surreal based on setting/context]
**Environment**: [Brief description of where/how they exist - max 50 words]
**Physical Form**: [Physical appearance and characteristics - max 100 words]
**Communication**: [How they communicate - max 30 words]
**Core Description**: [Personality, abilities, motivations, key traits - max 150 words]
**Surface Triggers**: [Specific fears, weaknesses, emotional triggers - max 50 words]

EXTRACT ONLY. DO NOT ADD CREATIVE SUGGESTIONS OR QUESTIONS.`;
  }

  return basePrompt + `

BRAINSTORMING MODE:
Help the user explore and develop their character concept. Ask questions that will help you understand:
- What kind of character they have in mind
- What makes this character unique or interesting
- Their personality, motivations, and background
- Their physical appearance and abilities
- The world or setting they come from

Be creative and suggest interesting possibilities they might not have considered!`;
}
