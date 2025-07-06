
import { useState } from 'react';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Persona } from '@/services/persona/types';
import { mapPersonaToDbPersona } from '@/services/persona/mappers';
import { v4 as uuidv4 } from 'uuid';
import { safeMetadataAccess } from '@/services/persona/utils/metadataUtils';

export const usePersonaClone = () => {
  const [isCloning, setIsCloning] = useState(false);
  const { toast } = useToast();

  const clonePersona = async (originalPersona: Persona, newName: string) => {
    setIsCloning(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const safeMetadata = safeMetadataAccess(originalPersona.metadata);
      
      // Create a clone with new persona_id and user_id
      const clonedPersona: Persona = {
        ...originalPersona,
        persona_id: `persona-${uuidv4().substring(0, 6)}`,
        name: newName,
        user_id: user.id,
        creation_date: new Date().toISOString().split('T')[0],
        metadata: {
          ...safeMetadata,
          // Only include required fields with proper fallbacks
          age: safeMetadata.age || 'Unknown',
          gender: safeMetadata.gender || 'Unknown',
          region: safeMetadata.region || safeMetadata.location_history?.current_residence || 'Unknown',
          occupation: safeMetadata.occupation || 'Unknown',
          education_level: safeMetadata.education_level || 'Unknown',
          employment_type: safeMetadata.employment_type || 'Unknown',
          income_level: safeMetadata.income_level || 'Unknown',
          marital_status: safeMetadata.marital_status || safeMetadata.family_status || 'Unknown',
          family_status: safeMetadata.family_status || 'Unknown',
          health_status: safeMetadata.health_status || 'Unknown',
          transportation: safeMetadata.transportation || 'Unknown',
          technology_usage: safeMetadata.technology_usage || 'Unknown'
        },
        is_public: false // Clones are private by default
      };

      // Use the proper database mapper
      const dbPersona = mapPersonaToDbPersona(clonedPersona);

      const { data, error } = await supabase
        .from('personas')
        .insert(dbPersona)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Persona "${newName}" has been cloned successfully.`,
      });

      return data;
    } catch (error) {
      console.error('Error cloning persona:', error);
      toast({
        title: "Error",
        description: "Failed to clone persona. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsCloning(false);
    }
  };

  return {
    clonePersona,
    isCloning
  };
};
