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
      
      const { data: personas, error } = await supabase
        .from('personas')
        .select('persona_id, name, trait_profile, interview_sections, metadata, linguistic_profile, description')
        .order('name', { ascending: true });

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

      personas.forEach(persona => {
        // Check for missing demographics in metadata
        const metadata = persona.metadata as any || {};
        const demographics = metadata.demographics || {};
        
        const hasDemographics = demographics.age && 
                              demographics.gender && 
                              demographics.location && 
                              demographics.occupation;
        
        if (!hasDemographics) {
          missingDemographics++;
        }

        // Check for missing knowledge domains in metadata
        const knowledgeDomains = metadata.knowledge_domains || [];
        if (!Array.isArray(knowledgeDomains) || knowledgeDomains.length === 0) {
          missingKnowledgeDomains++;
        }

        // Check for missing education in metadata
        const education = metadata.education || {};
        if (!education.level || !education.field) {
          missingEducation++;
        }

        // Check for brief descriptions (less than 50 characters or missing)
        const description = persona.description || '';
        if (!description || description.length < 50) {
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