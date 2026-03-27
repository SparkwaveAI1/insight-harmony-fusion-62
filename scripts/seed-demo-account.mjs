#!/usr/bin/env node
/**
 * seed-demo-account.mjs — PersonaAI Demo Account Seeder
 *
 * Creates (or resets) a demo user account with:
 *   - 10 pre-existing public V4 personas
 *   - A completed research survey session
 *   - A generated research insights report
 *
 * Usage:
 *   node scripts/seed-demo-account.mjs
 *
 * Env vars (optional — defaults to embedded config):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Demo credentials:
 *   Email: demo@personaresearch.ai
 *   Password: DemoPersonaAI2026!
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? 'https://wgerdrdsuusnrdnwwelt.supabase.co';

// Service role key — read from ~/.config/personaai/config.json if not in env
let SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_ROLE_KEY) {
  try {
    const { readFileSync } = await import('fs');
    const { homedir } = await import('os');
    const config = JSON.parse(
      readFileSync(`${homedir()}/.config/personaai/config.json`, 'utf8')
    );
    SERVICE_ROLE_KEY = config.service_role_key;
  } catch {
    console.error(
      '❌ SUPABASE_SERVICE_ROLE_KEY not set and ~/.config/personaai/config.json not found.\n' +
        '   Set env var or ensure config file exists.'
    );
    process.exit(1);
  }
}

const DEMO_EMAIL = 'demo@personaresearch.ai';
const DEMO_PASSWORD = 'DemoPersonaAI2026!';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('🌱 PersonaAI Demo Account Seeder');
  console.log('================================');

  // ─── Step 1: Ensure demo user exists ───────────────────────────────────────
  console.log('\n1️⃣  Checking demo user account…');

  let demoUserId;

  // Try to find existing user via admin API
  const { data: listData, error: listError } =
    await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (listError) {
    console.error('❌ Failed to list users:', listError.message);
    process.exit(1);
  }

  const existing = listData.users.find((u) => u.email === DEMO_EMAIL);

  if (existing) {
    demoUserId = existing.id;
    console.log(`   ✅ Demo user exists: ${demoUserId}`);

    // Reset password to ensure it's correct
    const { error: resetErr } = await supabase.auth.admin.updateUserById(
      demoUserId,
      { password: DEMO_PASSWORD }
    );
    if (resetErr) {
      console.warn(`   ⚠️  Could not reset password: ${resetErr.message}`);
    }
  } else {
    const { data: newUser, error: createErr } =
      await supabase.auth.admin.createUser({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: 'PersonaAI Demo' },
      });
    if (createErr) {
      console.error('❌ Failed to create demo user:', createErr.message);
      process.exit(1);
    }
    demoUserId = newUser.user.id;
    console.log(`   ✅ Created demo user: ${demoUserId}`);
  }

  // ─── Step 2: Pick 10 public V4 personas ────────────────────────────────────
  console.log('\n2️⃣  Selecting 10 public V4 personas…');

  const { data: personas, error: personaErr } = await supabase
    .from('v4_personas')
    .select('persona_id, name, conversation_summary')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(10);

  if (personaErr || !personas || personas.length === 0) {
    console.error(
      '❌ Failed to fetch public personas:',
      personaErr?.message ?? 'No public personas found'
    );
    process.exit(1);
  }

  console.log(`   ✅ Selected ${personas.length} personas:`);
  personas.forEach((p) => console.log(`      - ${p.name} (${p.persona_id})`));

  const personaIds = personas.map((p) => p.persona_id);

  // ─── Step 3: Create / reset demo research survey ───────────────────────────
  console.log('\n3️⃣  Setting up demo research survey…');

  const DEMO_SURVEY_NAME = 'Demo: Consumer Sentiment Study — Q1 2026';
  const DEMO_QUESTIONS = [
    {
      text: 'How do you feel about AI tools that analyze your behavior to make recommendations?',
    },
    {
      text: 'Would you pay a premium for a product that learns your preferences over time?',
    },
    {
      text: 'What concerns, if any, do you have about AI making decisions on your behalf?',
    },
  ];

  // Delete existing demo survey sessions and surveys for clean reset
  const { data: existingSurveys } = await supabase
    .from('research_surveys')
    .select('id')
    .eq('user_id', demoUserId)
    .eq('name', DEMO_SURVEY_NAME);

  if (existingSurveys && existingSurveys.length > 0) {
    const surveyIds = existingSurveys.map((s) => s.id);

    // Delete associated sessions first
    await supabase
      .from('research_survey_sessions')
      .delete()
      .in('research_survey_id', surveyIds);

    // Delete surveys
    await supabase
      .from('research_surveys')
      .delete()
      .in('id', surveyIds);

    console.log('   🔄 Cleared existing demo survey (reset)');
  }

  const { data: survey, error: surveyErr } = await supabase
    .from('research_surveys')
    .insert({
      user_id: demoUserId,
      name: DEMO_SURVEY_NAME,
      description:
        '10-persona synthetic panel exploring consumer attitudes toward AI-assisted products. Demonstrates PersonaAI\'s research capabilities.',
      questions: DEMO_QUESTIONS,
    })
    .select('id')
    .single();

  if (surveyErr || !survey) {
    console.error('❌ Failed to create demo survey:', surveyErr?.message);
    process.exit(1);
  }

  console.log(`   ✅ Demo survey created: ${survey.id}`);

  // ─── Step 4: Create a completed research survey session ────────────────────
  console.log('\n4️⃣  Creating completed research session…');

  const { data: session, error: sessionErr } = await supabase
    .from('research_survey_sessions')
    .insert({
      user_id: demoUserId,
      research_survey_id: survey.id,
      selected_personas: personaIds,
      status: 'completed',
      started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
      completed_at: new Date().toISOString(),
      research_context: {
        mode: 'demo',
        study_name: DEMO_SURVEY_NAME,
        questions: DEMO_QUESTIONS.map((q) => q.text),
      },
    })
    .select('id')
    .single();

  if (sessionErr || !session) {
    console.error(
      '❌ Failed to create demo session:',
      sessionErr?.message
    );
    process.exit(1);
  }

  console.log(`   ✅ Demo session created: ${session.id}`);

  // Seed synthetic survey responses
  const syntheticResponses = [];
  for (let qIdx = 0; qIdx < DEMO_QUESTIONS.length; qIdx++) {
    for (const p of personas.slice(0, 5)) {
      // Use 5 personas for speed
      syntheticResponses.push({
        session_id: session.id,
        persona_id: p.persona_id,
        question_index: qIdx,
        question_text: DEMO_QUESTIONS[qIdx].text,
        response_text: generateSyntheticResponse(p.name, qIdx),
        responded_at: new Date().toISOString(),
      });
    }
  }

  const { error: responseErr } = await supabase
    .from('research_survey_responses')
    .insert(syntheticResponses);

  if (responseErr) {
    console.warn(
      `   ⚠️  Could not seed survey responses (table may not exist): ${responseErr.message}`
    );
    // Non-fatal — the session and report can still exist
  } else {
    console.log(
      `   ✅ Seeded ${syntheticResponses.length} synthetic survey responses`
    );
  }

  // ─── Step 5: Generate research report via edge function ────────────────────
  console.log('\n5️⃣  Generating research insights report…');

  const directData = {
    responses: syntheticResponses.map((r) => ({
      persona_id: r.persona_id,
      question_index: r.question_index,
      question_text: r.question_text,
      response_text: r.response_text,
    })),
    personas: personas.slice(0, 5).map((p) => ({
      persona_id: p.persona_id,
      name: p.name,
      summary: typeof p.conversation_summary === 'string'
        ? p.conversation_summary
        : JSON.stringify(p.conversation_summary ?? {}),
    })),
    questions: DEMO_QUESTIONS.map((q) => q.text),
    study_name: DEMO_SURVEY_NAME,
    study_description:
      'Demo consumer sentiment study showing PersonaAI synthetic panel capabilities',
  };

  try {
    const { data: reportData, error: reportErr } =
      await supabase.functions.invoke('compile-research-insights', {
        body: { direct_data: directData },
      });

    if (reportErr) throw reportErr;

    // Store in research_reports table
    const insights = reportData?.insights ?? reportData;

    const { error: storeErr } = await supabase
      .from('research_reports')
      .upsert({
        survey_session_id: session.id,
        user_id: demoUserId,
        insights,
        updated_at: new Date().toISOString(),
      });

    if (storeErr) {
      console.warn(`   ⚠️  Report generated but could not store: ${storeErr.message}`);
    } else {
      console.log('   ✅ Research report generated and stored');
    }
  } catch (err) {
    console.warn(
      `   ⚠️  Edge function unavailable (report generation skipped): ${err.message ?? err}`
    );
    console.log(
      '   ℹ️  The session is created — report will generate when viewed at /research/results/' +
        session.id
    );
  }

  // ─── Done ──────────────────────────────────────────────────────────────────
  console.log('\n✅ Demo account ready!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   URL:      https://personaresearch.ai/research/results/${session.id}`);
  console.log(`   Email:    ${DEMO_EMAIL}`);
  console.log(`   Password: ${DEMO_PASSWORD}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('To reset and run again: node scripts/seed-demo-account.mjs');
}

/**
 * Generates a plausible synthetic persona response for demo seeding.
 * Not meant to be high quality — just enough to feed compile-research-insights.
 */
function generateSyntheticResponse(personaName, questionIdx) {
  const responses = [
    // Q0: AI that analyzes behavior
    [
      `I'm genuinely intrigued by the idea, but I want to understand what data is actually being collected before I trust it. There's a difference between helpful personalization and surveillance.`,
      `Honestly, I think it depends on the use case. For health or productivity tools, great. For shopping recommendations? I'm more skeptical — it often just seems like it's trying to sell me more stuff.`,
      `I've had mixed experiences. When it works, it's genuinely useful. When it gets it wrong, it's annoying to have an algorithm confidently misread you.`,
      `My concern is always about who else has access to that data. The tool itself might be trustworthy, but what about data breaches or the company selling it later?`,
      `I find it useful when I can see what data is being used and opt out of specific things. Transparency is the key factor for me.`,
    ],
    // Q1: Pay premium for learning product
    [
      `Yes, if it actually saves me time and gets noticeably better over time. I've paid premiums for tools like that before — it's about whether the value compounds.`,
      `Maybe. The problem is that 'learns your preferences' is often marketing speak for 'we track you.' I'd need to see real evidence it works before paying more.`,
      `Absolutely, for the right category. I'd pay more for a financial advisor tool that learns my risk tolerance than for a streaming service that learns I like action movies.`,
      `It really depends on the product and how transparent they are about what 'learning' means. I'm cautious about lock-in too — what happens if I switch?`,
      `I'm price-sensitive on this. I'd pay maybe 10-15% more if the learning benefit was tangible and demonstrable. Not 50% more on a promise.`,
    ],
    // Q2: Concerns about AI making decisions
    [
      `The biggest concern for me is accountability. If AI makes a wrong call — about my health, finances, or hiring — who's responsible? The company? The user? Nobody?`,
      `I worry about edge cases. AI learns from patterns, but my situation might be genuinely unusual. I don't want a system that worked for 95% of people to make bad calls for me.`,
      `Explainability matters a lot. I'm okay with AI making recommendations. I'm much less comfortable with decisions I can't understand or challenge.`,
      `My concern is bias. These systems learn from historical data, which reflects historical inequalities. That can get baked in as if it's neutral when it's not.`,
      `I think the concerns are real but often overstated. Most AI decisions in consumer contexts are low stakes. I'd rather focus scrutiny on high-stakes uses like criminal justice or lending.`,
    ],
  ];

  const idx = Math.min(questionIdx, responses.length - 1);
  const opts = responses[idx];
  // Simple hash of persona name to pick a consistent response
  const pick =
    personaName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    opts.length;
  return opts[pick];
}

main().catch((err) => {
  console.error('\n❌ Seeder failed:', err);
  process.exit(1);
});
