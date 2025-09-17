// Quick debug script to get the raw prompt
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://wgerdrdsuusnrdnwwelt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxODkxMjAsImV4cCI6MjA1Nzc2NTEyMH0.yAoqtSbNo7gabNOSyDrNGNjIUaMIPwyhevV2F-IQHbY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getDebugPrompt() {
  try {
    const { data, error } = await supabase.functions.invoke('v4-grok-conversation', {
      body: {
        persona_id: "e5daef8f-b6f8-4768-9c3a-7e615dc23ee1",
        user_message: "What do you think about AI in radiology?",
        conversation_history: [],
        include_prompt: true
      }
    });

    if (error) {
      console.error('Error:', error);
      return;
    }

    if (data.prompt_debug && data.prompt_debug.instructions) {
      console.log('=== RAW PROMPT INSTRUCTIONS ===');
      console.log(data.prompt_debug.instructions);
      console.log('=== END RAW PROMPT ===');
    } else {
      console.log('Full response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error calling function:', error);
  }
}

getDebugPrompt();