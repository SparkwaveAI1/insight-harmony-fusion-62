
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
        temperature: 0.8,
        max_tokens: 1500,
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
      JSON.stringify({ error: error.message }),
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
- Cognitive Filters: Processing biases (pattern_over_weighting, emotional_signal_suppression, anticipatory_contradiction_modeling)

REQUIRED INFORMATION TO EXTRACT:
- Name: Character's name
- Entity Type: human, non_humanoid, post_biological, fluid_based_consciousness, etc.
- Narrative Domain: sci-fi, fantasy, surreal, modern, horror, etc.
- Description: Core personality, motivations, fears, desires
- Environment/Physical Form: How they look, their scale, appearance details
- Communication: How they communicate (speech, telepathy, bioluminescence, etc.)

YOUR ROLE:
- Ask engaging, creative questions to help users brainstorm
- Suggest unique concepts and creative directions
- Help users explore unconventional character ideas
- Extract the information needed for Character Lab's trait architecture
- Be encouraging and inspire creativity

CONVERSATION STYLE:
- Natural, enthusiastic, and creative
- Ask follow-up questions to deepen character concepts
- Suggest interesting possibilities they might not have considered
- Help them think outside conventional character archetypes`;

  if (action === 'compile') {
    return basePrompt + `

COMPILATION MODE:
You are now compiling the conversation into an optimized character description. Based on our conversation, extract and synthesize:

1. All the key character details we've discussed
2. The character's core personality and motivations
3. Their physical appearance and unique traits
4. Their communication methods and abilities
5. What makes them interesting and unique

Format this as a comprehensive character description that captures everything we've brainstormed, ready for character creation.`;
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
