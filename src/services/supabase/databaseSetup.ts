import { supabase } from "@/integrations/supabase/client";
import { createParticipantsTable } from "./createParticipantsTable";
import { getParticipantsTableSQL } from "./createParticipantsTable";
import { createInterviewTable } from "./createInterviewTable";
import { getInterviewTableSQL } from "./createInterviewTable";
import { createResearchProjectTable } from "./createResearchProjectTable";
import { getResearchProjectTableSQL } from "./createResearchProjectTable";
import { createProfilesTable, getProfilesTableSQL } from "./createProfilesTable";

export const ensureTablesExist = async () => {
  try {
    // Check if we can connect to Supabase
    const { data: testData, error: testError } = await supabase
      .from('participants')
      .select('id')
      .limit(1);

    if (testError && testError.code !== 'PGRST116') {
      console.error('Error connecting to Supabase:', testError);
      return false;
    }

    // Create or ensure profiles table exists
    await createProfilesTable();
    
    // Create or ensure participants table exists
    await createParticipantsTable();

    // Create or ensure interview table exists
    await createInterviewTable();

    // Create or ensure research_projects table exists
    await createResearchProjectTable();

    return true;
  } catch (error) {
    console.error('Error ensuring tables exist:', error);
    return false;
  }
};

export const getSetupSQLScripts = () => {
  return `
${getProfilesTableSQL()}
${getParticipantsTableSQL()}
${getInterviewTableSQL()}
${getResearchProjectTableSQL()}
  `;
};
