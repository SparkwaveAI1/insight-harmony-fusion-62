import { useState, useEffect } from "react";
import { getAllUnifiedPersonas } from "@/services/persona";
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
      const unifiedPersonas = await getAllUnifiedPersonas(user?.id);

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
      const v2PersonasCount = unifiedPersonas.filter(p => p.version === 'v2').length;
      const v1PersonasCount = unifiedPersonas.filter(p => p.version === 'v1').length;
      
      let missingDemographics = 0;
      let missingKnowledgeDomains = 0;
      let missingEducation = 0;
      let briefDescriptions = 0;

      console.log('Total unified personas found:', totalPersonas);
      console.log('V2 personas:', v2PersonasCount, 'V1 personas:', v1PersonasCount);

      unifiedPersonas.forEach(unifiedPersona => {
        // For V1 personas, analyze the converted data
        if (unifiedPersona.version === 'v1') {
          const persona = unifiedPersona.data as any;
          const metadata = persona.metadata || {};
          const demographics = metadata.demographics || {};
          
          // Check if ANY required demographic field is missing or empty
          const hasAge = demographics.age && demographics.age !== "";
          const hasGender = demographics.gender && demographics.gender !== "";
          const hasLocation = demographics.location && demographics.location !== "";
          const hasOccupation = demographics.occupation && demographics.occupation !== "";
          
          if (!hasAge || !hasGender || !hasLocation || !hasOccupation) {
            missingDemographics++;
          }

          // Check for missing knowledge domains
          const knowledgeDomains = metadata.knowledge_domains || metadata.knowledgeDomains || [];
          if (!Array.isArray(knowledgeDomains) || knowledgeDomains.length === 0 || 
              (knowledgeDomains.length === 1 && (!knowledgeDomains[0] || knowledgeDomains[0] === ""))) {
            missingKnowledgeDomains++;
          }

          // Check for missing education
          const education = metadata.education || {};
          const hasLevel = education.level && education.level !== "";
          const hasField = education.field && education.field !== "";
          
          if (!hasLevel || !hasField) {
            missingEducation++;
          }
        }
        
        // For V2 personas, we'd need to implement similar checks for the V2 structure
        // For now, assume V2 personas are complete
        
        // Check for brief descriptions (less than 50 characters or missing)
        const description = unifiedPersona.description || '';
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