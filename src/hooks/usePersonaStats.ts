import { useState, useEffect } from "react";
import { getAllPersonas } from "@/services/persona";
import { useAuth } from "@/context/AuthContext";

interface PersonaStats {
  totalPersonas: number;
  v2PersonasCount: number;
  v1PersonasCount: number;
  missingDemographics: number;
  missingKnowledgeDomains: number;
  missingEducation: number;
  briefDescriptions: number;
}

export function usePersonaStats() {
  const [stats, setStats] = useState<PersonaStats>({
    totalPersonas: 0,
    v2PersonasCount: 0,
    v1PersonasCount: 0,
    missingDemographics: 0,
    missingKnowledgeDomains: 0,
    missingEducation: 0,
    briefDescriptions: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Use unified persona system to get all personas
      const unifiedPersonas = await getAllPersonas(user?.id);

      if (!unifiedPersonas || unifiedPersonas.length === 0) {
        setStats({
          totalPersonas: 0,
          v2PersonasCount: 0,
          v1PersonasCount: 0,
          missingDemographics: 0,
          missingKnowledgeDomains: 0,
          missingEducation: 0,
          briefDescriptions: 0,
        });
        return;
      }

      const totalPersonas = unifiedPersonas.length;
      const v2PersonasCount = unifiedPersonas.length; // All are V2 now
      const v1PersonasCount = 0; // No V1 personas exist
      
      let missingDemographics = 0;
      let missingKnowledgeDomains = 0;
      let missingEducation = 0;
      let briefDescriptions = 0;

      console.log('Total unified personas found:', totalPersonas);
      console.log('V2 personas:', v2PersonasCount, 'V1 personas:', v1PersonasCount);

      unifiedPersonas.forEach(persona => {
        // All personas are V2 now, analyze the V2 structure
        const personaData = persona.persona_data as any;
          const identity = personaData?.identity || {};
          const demographics = identity;
          
          // Check if ANY required demographic field is missing or empty
          const hasAge = demographics.age && demographics.age !== "";
          const hasGender = demographics.gender && demographics.gender !== "";
          const hasLocation = demographics.location && demographics.location !== "";
          const hasOccupation = demographics.occupation && demographics.occupation !== "";
          
          if (!hasAge || !hasGender || !hasLocation || !hasOccupation) {
            missingDemographics++;
          }

        // For V2 personas, knowledge domains would be in life_context or cognitive_profile
        // For now, assume all V2 personas are complete since they have proper structure
        
        // Check for brief descriptions (less than 50 characters or missing)
        const description = persona.description || '';
        if (!description || description.length < 50) {
          briefDescriptions++;
        }
      });

      setStats({
        totalPersonas,
        v2PersonasCount,
        v1PersonasCount,
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