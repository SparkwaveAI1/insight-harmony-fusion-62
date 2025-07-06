
import { useState } from 'react';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Persona } from '@/services/persona/types';
import { v4 as uuidv4 } from 'uuid';

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

      const metadata = originalPersona.metadata || {};
      
      // Create a clone with new persona_id and user_id
      const clonedPersona = {
        ...originalPersona,
        persona_id: `persona-${uuidv4().substring(0, 6)}`,
        name: newName,
        user_id: user.id,
        creation_date: new Date().toISOString().split('T')[0],
        // Preserve all metadata fields
        metadata: {
          ...metadata,
          age: metadata.age || 'Unknown',
          gender: metadata.gender || 'Unknown',
          region: metadata.region || metadata.location_history?.current_residence || 'Unknown',
          occupation: metadata.occupation || 'Unknown',
          education_level: metadata.education_level || 'Unknown'
        },
        is_public: false // Clones are private by default
      };

      // Remove fields that shouldn't be copied
      delete clonedPersona.id;
      delete clonedPersona.created_at;

      const { data, error } = await supabase
        .from('personas')
        .insert(clonedPersona)
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
