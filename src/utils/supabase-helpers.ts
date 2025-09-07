import type { SupabaseClient } from '@supabase/supabase-js';

export async function getBearerAndBase(supabase: SupabaseClient) {
  const session = (await supabase.auth.getSession()).data.session;
  if (!session?.access_token) {
    throw new Error('NO_SESSION');
  }
  return { 
    token: session.access_token, 
    base: supabase.supabaseUrl as string 
  };
}

export async function retryFetch(input: RequestInfo, init: RequestInit, tries = 2): Promise<Response> {
  for (let i = 0; i <= tries; i++) {
    const response = await fetch(input, init);
    if (response.ok || ![500, 502, 503, 504, 429].includes(response.status)) {
      return response;
    }
    if (i < tries) {
      await new Promise(resolve => setTimeout(resolve, (i + 1) * 500));
    }
  }
  return fetch(input, init);
}