import type { SupabaseClient } from '@supabase/supabase-js';

export async function getBearerAndBase(supabase: SupabaseClient) {
  const session = (await supabase.auth.getSession()).data.session;
  if (!session?.access_token) throw new Error("NO_SESSION");
  // @ts-expect-error: supabase-js exposes the URL on the client instance
  const base = supabase.supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return { token: session.access_token, base };
}

export async function retryFetch(input: RequestInfo, init?: RequestInit, max = 4): Promise<Response> {
  let attempt = 0;
  while (true) {
    try {
      const res = await fetch(input, init);
      if (res.status < 500 && res.status !== 429) return res;
      if (attempt >= max) return res;
    } catch (e) {
      if (attempt >= max) throw e;
    }
    await new Promise(r => setTimeout(r, Math.min(2000, 200 * 2 ** attempt)));
    attempt++;
  }
}