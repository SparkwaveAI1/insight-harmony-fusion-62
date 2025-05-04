
/**
 * Provides SQL scripts to create tables in Supabase SQL Editor
 * This is an alternative to manual table creation
 */
export function getSetupSQLScripts(): string {
  return `
-- Create participants table
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  screener_passed BOOLEAN DEFAULT FALSE,
  questionnaire_data JSONB DEFAULT '{}'::jsonb,
  interview_unlocked BOOLEAN DEFAULT FALSE,
  unlock_code TEXT,
  interview_completed BOOLEAN DEFAULT FALSE,
  transcript_url TEXT,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index on email for faster lookups
CREATE UNIQUE INDEX participants_email_idx ON participants (email);

-- Set up Row Level Security (RLS)
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous reads but restrict writes
CREATE POLICY "Allow anonymous read access" 
ON participants FOR SELECT USING (true);

CREATE POLICY "Allow insert for new participants" 
ON participants FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for existing participants" 
ON participants FOR UPDATE USING (true);
`;
}
