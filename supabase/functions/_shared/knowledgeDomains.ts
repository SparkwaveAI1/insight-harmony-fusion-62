import { generateChatResponse } from "./openai.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

export async function generateKnowledgeDomains(basePersona: any): Promise<any> {
  console.log('Generating knowledge domains...');
  
  const occupation = basePersona.metadata?.occupation || 'unemployed';
  const education = basePersona.metadata?.education_level || basePersona.metadata?.education || 'high school';
  const age = basePersona.metadata?.age || '30';
  
  const messages = [
    {
      role: "system",
      content: `Generate realistic knowledge domains for ${basePersona.name}. Return ONLY valid JSON with NO markdown formatting.

REQUIRED STRUCTURE:
{
  "knowledge_domains": {
    "technology": 2,
    "finance": 1,
    "science": 3,
    "arts": 4,
    "sports": 3,
    "politics": 2,
    "history": 2,
    "health": 2,
    "business": 3,
    "entertainment": 4
  }
}

RATING SCALE (1-5):
1 = Minimal knowledge (basic awareness only)
2 = Basic knowledge (can follow simple conversations)
3 = Moderate knowledge (can discuss topics meaningfully)
4 = Strong knowledge (well-informed, can teach others)
5 = Expert knowledge (professional level, deep understanding)

GUIDELINES:
- Base ratings realistically on occupation, education, age, and background
- Most people have 1-2 domains at 4-5, several at 2-3, majority at 1-2
- Consider socioeconomic factors and access to information
- Avoid stereotyping but be realistic about knowledge distribution
- Factor in interests and hobbies that might increase knowledge in specific areas`
    },
    {
      role: "user",
      content: `Generate knowledge domains for ${basePersona.name}: ${occupation}, ${education} education, age ${age}.`
    }
  ];

  const response = await generateChatResponse(messages, OPENAI_API_KEY);
  const content = response.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse knowledge domains:', content);
    throw new Error('Invalid knowledge domains response from AI');
  }
}