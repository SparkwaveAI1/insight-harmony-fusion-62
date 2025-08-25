import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllPersonas } from "@/services/persona"; 
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import PersonaLoadingState from "./PersonaLoadingState";
import PersonaEmptyState from "./PersonaEmptyState";
import PersonaCard from "./PersonaCard";
import { Persona } from "@/services/persona/types";
import { getPersonasByCollection } from "@/services/persona";
import { cn } from "@/lib/utils";
import { useUnifiedPersonaSearch } from "@/hooks/useUnifiedPersonaSearch";
import { V4Persona } from "@/types/persona-v4";

// Helper function to detect if a persona is from the US
const isUSPersona = (persona: V4Persona): boolean => {
  const region = persona.conversation_summary?.demographics?.location?.toLowerCase() || '';
  const usIndicators = [
    // States
    'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut', 'delaware', 'florida', 'georgia',
    'hawaii', 'idaho', 'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana', 'maine', 'maryland',
    'massachusetts', 'michigan', 'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada', 'new hampshire', 'new jersey',
    'new mexico', 'new york', 'north carolina', 'north dakota', 'ohio', 'oklahoma', 'oregon', 'pennsylvania', 'rhode island', 'south carolina',
    'south dakota', 'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington', 'west virginia', 'wisconsin', 'wyoming',
    // Abbreviations
    'al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga', 'hi', 'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md',
    'ma', 'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj', 'nm', 'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc',
    'sd', 'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy',
    // Common US identifiers
    'usa', 'united states', 'us', 'america', 'american',
    // Major cities
    'new york', 'los angeles', 'chicago', 'houston', 'philadelphia', 'phoenix', 'san antonio', 'san diego', 'dallas', 'san jose',
    'austin', 'jacksonville', 'fort worth', 'columbus', 'charlotte', 'san francisco', 'indianapolis', 'seattle', 'denver', 'washington',
    'boston', 'el paso', 'detroit', 'nashville', 'memphis', 'portland', 'oklahoma city', 'las vegas', 'baltimore', 'milwaukee'
  ];
  
  return usIndicators.some(indicator => region.includes(indicator));
};

// Helper function to check if persona has complete profile
const hasCompleteProfile = (persona: V4Persona): boolean => {
  const hasImage = !!persona.profile_image_url;
  const hasDescription = !!persona.conversation_summary?.demographics?.background_description;
  return hasImage && hasDescription;
};

// Helper function to check if persona has partial profile
const hasPartialProfile = (persona: V4Persona): boolean => {
  const hasImage = !!persona.profile_image_url;
  const hasDescription = !!persona.conversation_summary?.demographics?.background_description;
  return hasImage || hasDescription;
};

// Priority scoring function for sorting
const getPersonaPriority = (persona: V4Persona): number => {
  const isUS = isUSPersona(persona);
  const hasComplete = hasCompleteProfile(persona);
  const hasPartial = hasPartialProfile(persona);
  
  // Higher numbers = higher priority
  if (isUS && hasComplete) return 5; // Tier 1
  if (isUS && hasPartial) return 4;  // Tier 2
  if (!isUS && hasComplete) return 3; // Tier 3
  if (!isUS && hasPartial) return 2;  // Tier 4
  return 1; // Tier 5 - missing both image and description
};

// Function to sort personas by priority (for public personas only)
const sortPersonasByPriority = (personas: V4Persona[]): V4Persona[] => {
  return personas.sort((a, b) => {
    // First sort by priority score (highest first)
    const priorityDiff = getPersonaPriority(b) - getPersonaPriority(a);
    if (priorityDiff !== 0) return priorityDiff;
    
    // Within same priority tier, sort by most recent first
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA;
  });
};

interface PersonaListProps {
  onPersonasLoad?: (personas: V4Persona[]) => void;
  filterByCurrentUser?: boolean;
  filterByOtherUsers?: boolean;
  publicOnly?: boolean;
  collectionId?: string;
  onDeleteCollection?: () => void;
  className?: string;
  searchQuery?: string;
  selectedTags?: string[];
  selectedAge?: string;
  selectedRegion?: string;
  selectedIncome?: string;
  selectedSourceType?: string;
}

export default function PersonaList({ 
  onPersonasLoad, 
  filterByCurrentUser = false,
  filterByOtherUsers = false,
  publicOnly = false,
  collectionId,
  onDeleteCollection,
  className,
  searchQuery = "",
  selectedTags = [],
  selectedAge = "",
  selectedRegion = "",
  selectedIncome = "",
  selectedSourceType = ""
}: PersonaListProps) {
  const { user, isLoading: authLoading } = useAuth();
  
  // Determine if we need to wait for auth to load
  const needsAuth = filterByCurrentUser || filterByOtherUsers;
  const shouldWaitForAuth = needsAuth && authLoading;
  
  // Use React Query to fetch personas
  const { data: allPersonas = [], isLoading, error, refetch } = useQuery({
    queryKey: ['personas', { 
      filterByCurrentUser: filterByCurrentUser && !!user, 
      filterByOtherUsers: filterByOtherUsers && !!user, 
      publicOnly, 
      collectionId, 
      userId: user?.id 
    }],
    queryFn: async () => {
      try {
        console.log("Fetching personas with filters:", { filterByCurrentUser, filterByOtherUsers, publicOnly, collectionId });
        let data = await getAllPersonas();
        
        console.log("Total personas loaded:", data.length);
        console.log("User ID for filtering:", user?.id);
        
        // Apply filtering logic based on the view type
        if (collectionId) {
          // Collections not supported for V4 personas yet
          return [];
        } else if (filterByCurrentUser && user) {
          // For My Personas view: Show only the current user's personas
          console.log("Filtering by current user:", user.id);
          const userPersonas = data.filter(persona => {
            console.log("Checking persona:", persona.persona_id, "user_id:", persona.user_id);
            return persona.user_id === user.id;
          });
          console.log("Current user's personas count:", userPersonas.length);
          return userPersonas;
        } else if (filterByOtherUsers && publicOnly && user) {
          // For Public Personas section: show only other users' public personas
          console.log("Filtering by other users' public personas");
          const filteredPersonas = data.filter(persona => 
            persona.is_public && persona.user_id !== user.id
          );
          console.log("Other users' public personas count:", filteredPersonas.length);
          return filteredPersonas;
        } else if (publicOnly) {
          // For the public library (Persona Library view):
          // Show only public personas (regardless of user auth state)
          console.log("Showing all public personas");
          const filteredPersonas = data.filter(persona => persona.is_public);
          console.log("All public personas count:", filteredPersonas.length);
          return filteredPersonas;
        }
        
        // Default: return all personas
        return data;
      } catch (err) {
        console.error("Error loading personas:", err);
        toast.error("Failed to load personas");
        throw err;
      }
    },
    enabled: !shouldWaitForAuth, // Don't run query until auth is ready when needed
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });
  
  // Update the parent component with loaded personas
  useEffect(() => {
    if (allPersonas && onPersonasLoad) {
      onPersonasLoad(allPersonas);
    }
  }, [allPersonas, onPersonasLoad]);

  const [personas, setPersonas] = useState<V4Persona[]>([]);
  
  // Update local state when personas are loaded from React Query
  useEffect(() => {
    if (allPersonas) {
      console.log("Setting personas state with count:", allPersonas.length);
      setPersonas(allPersonas);
    }
  }, [allPersonas]);


  // New filter function for advanced filters
  const applyAdvancedFilters = (personas: V4Persona[]) => {
    return personas.filter((persona) => {
      // Tags filter - check name and background for tags
      if (selectedTags.length > 0) {
        const hasMatchingTag = selectedTags.some(tag => 
          persona.name.toLowerCase().includes(tag) ||
          persona.conversation_summary?.demographics?.background_description?.toLowerCase().includes(tag) ||
          persona.conversation_summary?.demographics?.occupation?.toLowerCase().includes(tag)
        );
        if (!hasMatchingTag) return false;
      }

      // Demographics filters - check conversation_summary
      if (selectedAge) {
        const personaAge = persona.conversation_summary?.demographics?.age;
        // Convert age ranges to match
        if (selectedAge === "18-25" && (personaAge < 18 || personaAge > 25)) return false;
        if (selectedAge === "26-35" && (personaAge < 26 || personaAge > 35)) return false;
        if (selectedAge === "36-50" && (personaAge < 36 || personaAge > 50)) return false;
        if (selectedAge === "51+" && personaAge < 51) return false;
      }

      if (selectedRegion) {
        const personaLocation = persona.conversation_summary?.demographics?.location;
        if (!personaLocation?.toLowerCase().includes(selectedRegion.toLowerCase())) return false;
      }

      // Note: V4 personas don't have income data in the current schema
      // Source type filter - V4 personas are all "enhanced"
      if (selectedSourceType && selectedSourceType !== "enhanced") return false;

      return true;
    });
  };

  // Use shared search hook and apply advanced filters
  const searchedPersonas = useUnifiedPersonaSearch(personas, searchQuery, { 
    context: 'library',
    maxResults: 100 
  });
  let filteredPersonas = applyAdvancedFilters(searchedPersonas);
  
  // Apply priority sorting only for public personas (not user's own personas)
  if (publicOnly && filterByOtherUsers) {
    filteredPersonas = sortPersonasByPriority(filteredPersonas);
  }

  const handleVisibilityChange = (personaId: string, isPublic: boolean) => {
    // Update local state when visibility changes
    setPersonas(prevPersonas => 
      prevPersonas.map(persona => 
        persona.persona_id === personaId 
          ? { ...persona, is_public: isPublic } 
          : persona
      )
    );
    
    // If we're in the public library and a persona was made private,
    // remove it from the list only if it's not owned by the current user
    if (publicOnly && !isPublic) {
      setPersonas(prevPersonas => 
        prevPersonas.filter(persona => 
          persona.persona_id !== personaId || persona.user_id === user?.id
        )
      );
    }
    
    // Force a refetch to ensure we have the latest data
    refetch();
  };

  const handleDelete = (personaId: string) => {
    // Remove the deleted persona from the list
    setPersonas(prevPersonas => 
      prevPersonas.filter(persona => persona.persona_id !== personaId)
    );
    
    // If we're in a collection and it's the last persona, trigger collection delete
    if (collectionId && personas.length <= 1 && onDeleteCollection) {
      onDeleteCollection();
    }
    
    // Force a refetch to ensure we have the latest data
    refetch();
  };

  if (isLoading) {
    return <PersonaLoadingState />;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error loading personas: {String(error)}</div>;
  }

  if (filteredPersonas.length === 0) {
    if ((searchQuery || selectedTags.length > 0 || selectedAge || selectedRegion || selectedIncome || selectedSourceType) && personas.length > 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No personas found matching your filters</p>
          <p className="text-muted-foreground text-sm mt-2">Try adjusting your search terms or clearing some filters</p>
        </div>
      );
    }
    return <PersonaEmptyState />;
  }

  return (
    <div className={cn(className)}>
      {filteredPersonas.map((persona) => (
        <PersonaCard 
          key={persona.persona_id} 
          persona={persona}
          onVisibilityChange={handleVisibilityChange}
          onDelete={handleDelete} 
        />
      ))}
    </div>
  );
}
