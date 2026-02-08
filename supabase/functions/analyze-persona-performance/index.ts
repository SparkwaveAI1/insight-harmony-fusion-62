import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface QualityRecord {
  persona_id: string;
  user_message: string;
  response: string;
  explicit_rating: number | null;
  reply_received: boolean;
  response_length: number;
  created_at: string;
}

interface PerformanceInsight {
  persona_id: string;
  total_responses: number;
  positive_rate: number;
  negative_rate: number;
  avg_response_length: number;
  patterns: {
    successful_topics: string[];
    unsuccessful_topics: string[];
    optimal_length_range: [number, number];
  };
  recommendations: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { persona_id, days_back = 7 } = await req.json()

    // Get quality summary from view
    let summaryQuery = supabase
      .from('persona_quality_summary')
      .select('*')
    
    if (persona_id) {
      summaryQuery = summaryQuery.eq('persona_id', persona_id)
    }

    const { data: summaries, error: summaryError } = await summaryQuery

    if (summaryError) {
      throw new Error(`Failed to fetch summaries: ${summaryError.message}`)
    }

    // Get detailed records for pattern analysis
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days_back)

    let detailQuery = supabase
      .from('persona_response_quality')
      .select('persona_id, user_message, response, explicit_rating, reply_received, response_length, created_at')
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(1000)

    if (persona_id) {
      detailQuery = detailQuery.eq('persona_id', persona_id)
    }

    const { data: records, error: recordsError } = await detailQuery

    if (recordsError) {
      throw new Error(`Failed to fetch records: ${recordsError.message}`)
    }

    // Analyze patterns
    const insights: PerformanceInsight[] = []

    // Group by persona
    const byPersona = new Map<string, QualityRecord[]>()
    for (const record of (records || [])) {
      const existing = byPersona.get(record.persona_id) || []
      existing.push(record)
      byPersona.set(record.persona_id, existing)
    }

    for (const [pid, personaRecords] of byPersona) {
      const summary = summaries?.find(s => s.persona_id === pid)
      
      const positive = personaRecords.filter(r => r.explicit_rating === 1)
      const negative = personaRecords.filter(r => r.explicit_rating === -1)
      const replied = personaRecords.filter(r => r.reply_received)
      
      // Calculate optimal response length from positive responses
      const positiveResponses = positive.map(r => r.response_length).filter(l => l > 0)
      const optimalLengthRange: [number, number] = positiveResponses.length > 0
        ? [Math.min(...positiveResponses), Math.max(...positiveResponses)]
        : [100, 500] // default

      // Extract topic keywords from successful/unsuccessful responses
      const extractTopics = (records: QualityRecord[]) => {
        const topics = new Map<string, number>()
        for (const r of records) {
          const words = (r.user_message || '').toLowerCase()
            .split(/\s+/)
            .filter(w => w.length > 4)
          for (const word of words) {
            topics.set(word, (topics.get(word) || 0) + 1)
          }
        }
        return Array.from(topics.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([topic]) => topic)
      }

      const successfulTopics = extractTopics(positive)
      const unsuccessfulTopics = extractTopics(negative)

      // Generate recommendations
      const recommendations: string[] = []
      
      if (summary?.positive_ratings < summary?.total_responses * 0.5) {
        recommendations.push('Less than 50% positive ratings - review response style')
      }
      
      if (optimalLengthRange[1] < 200) {
        recommendations.push('Successful responses tend to be short - keep it concise')
      } else if (optimalLengthRange[0] > 300) {
        recommendations.push('Successful responses tend to be detailed - provide more context')
      }

      if (unsuccessfulTopics.length > 0) {
        recommendations.push(`Avoid or improve handling of topics: ${unsuccessfulTopics.slice(0, 3).join(', ')}`)
      }

      insights.push({
        persona_id: pid,
        total_responses: summary?.total_responses || personaRecords.length,
        positive_rate: summary?.total_responses ? (summary.positive_ratings / summary.total_responses) : 0,
        negative_rate: summary?.total_responses ? (summary.negative_ratings / summary.total_responses) : 0,
        avg_response_length: summary?.avg_response_length || 0,
        patterns: {
          successful_topics: successfulTopics,
          unsuccessful_topics: unsuccessfulTopics,
          optimal_length_range: optimalLengthRange,
        },
        recommendations,
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        period_days: days_back,
        personas_analyzed: insights.length,
        insights,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
