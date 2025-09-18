import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PersonaStats {
  totalPersonas: number;
  missingDemographics: number;
  missingKnowledgeDomains: number;
  missingEducation: number;
  briefDescriptions: number;
}

export function usePersonaStats() {
  const [stats, setStats] = useState<PersonaStats>({
    totalPersonas: 0,
    missingDemographics: 0,
    missingKnowledgeDomains: 0,
    missingEducation: 0,
    briefDescriptions: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Error getting user:', userError);
        return;
      }

      const { data: personas, error } = await supabase
        .from('v4_personas')
        .select('persona_id, full_profile')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching personas:', error);
        return;
      }

      if (!personas) {
        setStats({
          totalPersonas: 0,
          missingDemographics: 0,
          missingKnowledgeDomains: 0,
          missingEducation: 0,
          briefDescriptions: 0,
        });
        return;
      }

      const totalPersonas = personas.length;
      let missingDemographics = 0;
      let missingKnowledgeDomains = 0;
      let missingEducation = 0;
      let briefDescriptions = 0;

      console.log('Total personas found:', totalPersonas);
      console.log('Sample persona data:', personas[0]?.full_profile);

      personas.forEach(persona => {
        // Check for missing demographics in V4 persona structure
        const fullProfile = persona.full_profile as any || {};
        const demographics = fullProfile.demographics || {};
        
        // Check if ANY required demographic field is missing or empty
        const hasAge = demographics.age && demographics.age !== "";
        const hasGender = demographics.gender && demographics.gender !== "";
        const hasLocation = demographics.location && demographics.location !== "";
        const hasOccupation = demographics.occupation && demographics.occupation !== "";
        
        if (!hasAge || !hasGender || !hasLocation || !hasOccupation) {
          missingDemographics++;
        }

        // Check for missing knowledge domains - V4 personas store this differently
        const interests = fullProfile.interests || [];
        if (!Array.isArray(interests) || interests.length === 0) {
          missingKnowledgeDomains++;
        }

        // Check for missing education - V4 personas store this in demographics
        const education = demographics.education || "";
        if (!education || education === "") {
          missingEducation++;
        }

        // Check for brief descriptions using full_profile demographics  
        const backgroundDescription = demographics.background_description || '';
        if (!backgroundDescription || backgroundDescription.length < 50) {
          briefDescriptions++;
        }
      });

      setStats({
        totalPersonas,
        missingDemographics,
        missingKnowledgeDomains,
        missingEducation,
        briefDescriptions,
      });

    } catch (error) {
      console.error('Error calculating persona stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refetch: fetchStats };
}