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

interface PersonaListProps {
  onPersonasLoad?: (personas: Persona[]) => void;
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
  selectedGender?: string;
  selectedMaritalStatus?: string;
  selectedHasChildren?: string;
  selectedEducation?: string;
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
  selectedSourceType = "",
  selectedGender = "",
  selectedMaritalStatus = "",
  selectedHasChildren = "",
  selectedEducation = ""
}: PersonaListProps) {
  const { user } = useAuth();
  
  // Use React Query to fetch personas
  const { data: allPersonas = [], isLoading, error, refetch } = useQuery({
    queryKey: ['personas', { filterByCurrentUser, filterByOtherUsers, publicOnly, collectionId, userId: user?.id }],
    queryFn: async () => {
      try {
        console.log("Fetching personas with filters:", { filterByCurrentUser, filterByOtherUsers, publicOnly, collectionId });
        let data = await getAllPersonas();
        
        console.log("Total personas loaded:", data.length);
        console.log("User ID for filtering:", user?.id);
        
        // Apply filtering logic based on the view type
        if (collectionId) {
          // If we're in a collection, fetch personas for that collection
          const collectionPersonas = await getPersonasByCollection(collectionId);
          return collectionPersonas;
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
          // Show only public personas (if not filtered by other users)
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true, // Add this to ensure a refresh when component mounts
    refetchOnWindowFocus: true // Refetch when window regains focus
  });
  
  // Update the parent component with loaded personas
  useEffect(() => {
    if (allPersonas && onPersonasLoad) {
      onPersonasLoad(allPersonas);
    }
  }, [allPersonas, onPersonasLoad]);

  const [personas, setPersonas] = useState<Persona[]>([]);
  
  // Update local state when personas are loaded from React Query
  useEffect(() => {
    if (allPersonas) {
      console.log("Setting personas state with count:", allPersonas.length);
      setPersonas(allPersonas);
    }
  }, [allPersonas]);

  // Enhanced search function
  const searchPersonas = (personas: Persona[], query: string) => {
    if (!query.trim()) return personas;
    
    const searchTerm = query.toLowerCase().trim();
    
    return personas.filter((persona) => {
      // Search in name
      if (persona.name.toLowerCase().includes(searchTerm)) return true;
      
      // Search in prompt/description
      if (persona.prompt?.toLowerCase().includes(searchTerm)) return true;
      
      // Search in trait profile
      if (persona.trait_profile) {
        const traitString = JSON.stringify(persona.trait_profile).toLowerCase();
        if (traitString.includes(searchTerm)) return true;
      }
      
      // Search in metadata
      if (persona.metadata) {
        const metadataString = JSON.stringify(persona.metadata).toLowerCase();
        if (metadataString.includes(searchTerm)) return true;
      }
      
      // Search in interview sections
      if (persona.interview_sections) {
        const interviewString = JSON.stringify(persona.interview_sections).toLowerCase();
        if (interviewString.includes(searchTerm)) return true;
      }
      
      return false;
    });
  };

  // New filter function for advanced filters
  const applyAdvancedFilters = (personas: Persona[]) => {
    return personas.filter((persona) => {
      // Tags filter - check metadata for use case tags
      if (selectedTags.length > 0) {
        const personaTags = persona.metadata?.tags || [];
        const hasMatchingTag = selectedTags.some(tag => 
          personaTags.includes(tag) ||
          persona.name.toLowerCase().includes(tag) ||
          persona.prompt?.toLowerCase().includes(tag)
        );
        if (!hasMatchingTag) return false;
      }

      // Age filter - convert age number to range check
      if (selectedAge) {
        const personaAge = persona.metadata?.age;
        if (personaAge) {
          const age = parseInt(personaAge.toString());
          let ageInRange = false;
          
          switch (selectedAge) {
            case "18-24":
              ageInRange = age >= 18 && age <= 24;
              break;
            case "25-34":
              ageInRange = age >= 25 && age <= 34;
              break;
            case "35-44":
              ageInRange = age >= 35 && age <= 44;
              break;
            case "45-54":
              ageInRange = age >= 45 && age <= 54;
              break;
            case "55-64":
              ageInRange = age >= 55 && age <= 64;
              break;
            case "65+":
              ageInRange = age >= 65;
              break;
          }
          
          if (!ageInRange) return false;
        } else {
          return false; // No age data, exclude from filtered results
        }
      }

      // Region filter - check both region field and location data
      if (selectedRegion) {
        const personaRegion = persona.metadata?.region || 
                            persona.metadata?.location_history?.current_residence ||
                            persona.metadata?.urban_rural_context;
        
        if (personaRegion) {
          const regionLower = personaRegion.toLowerCase();
          let regionMatches = false;
          
          switch (selectedRegion) {
            case "urban":
              regionMatches = regionLower.includes("urban") || 
                            regionLower.includes("city") ||
                            regionLower.includes("san francisco") ||
                            regionLower.includes("new york") ||
                            regionLower.includes("chicago");
              break;
            case "suburban":
              regionMatches = regionLower.includes("suburban") ||
                            regionLower.includes("suburb");
              break;
            case "rural":
              regionMatches = regionLower.includes("rural") ||
                            regionLower.includes("countryside");
              break;
          }
          
          if (!regionMatches) return false;
        } else {
          return false;
        }
      }

      // Income filter - handle various income formats
      if (selectedIncome) {
        const personaIncome = persona.metadata?.income_level;
        
        if (personaIncome) {
          const incomeLower = personaIncome.toLowerCase();
          let incomeMatches = false;
          
          switch (selectedIncome) {
            case "low":
              incomeMatches = incomeLower.includes("low") ||
                            incomeLower.includes("$20,000") ||
                            incomeLower.includes("$30,000") ||
                            incomeLower.includes("under");
              break;
            case "middle":
              incomeMatches = incomeLower.includes("middle") ||
                            incomeLower.includes("$50,000") ||
                            incomeLower.includes("$60,000") ||
                            incomeLower.includes("$70,000");
              break;
            case "high":
              incomeMatches = incomeLower.includes("high") ||
                            incomeLower.includes("$80,000") ||
                            incomeLower.includes("$100,000") ||
                            incomeLower.includes("above");
              break;
          }
          
          if (!incomeMatches) return false;
        } else {
          return false;
        }
      }

      // Source type filter
      if (selectedSourceType) {
        const sourceType = persona.metadata?.source_type || "simulated";
        if (sourceType !== selectedSourceType) return false;
      }

      // Gender filter - improved to handle various formats
      if (selectedGender) {
        const personaGender = persona.metadata?.gender;
        if (personaGender) {
          const genderLower = personaGender.toLowerCase();
          const selectedGenderLower = selectedGender.toLowerCase();
          
          // Handle common variations
          let genderMatches = false;
          if (selectedGenderLower === "male") {
            genderMatches = genderLower === "male" || genderLower === "m" || genderLower === "man";
          } else if (selectedGenderLower === "female") {
            genderMatches = genderLower === "female" || genderLower === "f" || genderLower === "woman";
          } else {
            genderMatches = genderLower === selectedGenderLower;
          }
          
          if (!genderMatches) return false;
        } else {
          return false; // No gender data, exclude
        }
      }

      // Marital status filter - improved to handle various formats
      if (selectedMaritalStatus) {
        const personaMaritalStatus = persona.metadata?.marital_status;
        if (personaMaritalStatus) {
          const maritalLower = personaMaritalStatus.toLowerCase();
          const selectedMaritalLower = selectedMaritalStatus.toLowerCase();
          
          // Handle common variations
          let maritalMatches = false;
          if (selectedMaritalLower === "single") {
            maritalMatches = maritalLower.includes("single") || maritalLower.includes("never married");
          } else if (selectedMaritalLower === "married") {
            maritalMatches = maritalLower.includes("married") && !maritalLower.includes("never");
          } else {
            maritalMatches = maritalLower.includes(selectedMaritalLower);
          }
          
          if (!maritalMatches) return false;
        } else {
          return false; // No marital status data, exclude
        }
      }

      // Has children filter - improved to check multiple storage locations
      if (selectedHasChildren) {
        console.log(`Filtering for has children: ${selectedHasChildren}`);
        console.log(`Persona ${persona.name} metadata:`, persona.metadata);
        
        // Check multiple possible locations for children data
        let hasChildren = false;
        
        // Method 1: Check relationships_family.has_children
        if (persona.metadata?.relationships_family?.has_children !== undefined) {
          hasChildren = persona.metadata.relationships_family.has_children;
          console.log(`Found has_children in relationships_family: ${hasChildren}`);
        }
        // Method 2: Check direct has_children field
        else if (persona.metadata?.has_children !== undefined) {
          hasChildren = persona.metadata.has_children;
          console.log(`Found has_children in metadata: ${hasChildren}`);
        }
        // Method 3: Check for children array or count
        else if (persona.metadata?.children || persona.metadata?.number_of_children) {
          const children = persona.metadata.children || persona.metadata.number_of_children;
          hasChildren = Boolean(children && (Array.isArray(children) ? children.length > 0 : children > 0));
          console.log(`Inferred has_children from children data: ${hasChildren}`);
        }
        // Method 4: Check for family_members containing children
        else if (persona.metadata?.family_members) {
          hasChildren = persona.metadata.family_members.some((member: any) => 
            member.relationship?.toLowerCase().includes('child') || 
            member.relationship?.toLowerCase().includes('son') || 
            member.relationship?.toLowerCase().includes('daughter')
          );
          console.log(`Inferred has_children from family_members: ${hasChildren}`);
        }
        else {
          console.log(`No children data found for persona ${persona.name}, excluding from filter`);
          return false; // No children data found, exclude from filtered results
        }
        
        const childrenMatch = selectedHasChildren === "yes" ? hasChildren === true : hasChildren === false;
        console.log(`Children match result: ${childrenMatch} (looking for ${selectedHasChildren}, found ${hasChildren})`);
        
        if (!childrenMatch) return false;
      }

      // Education filter - improved to handle various formats
      if (selectedEducation) {
        const personaEducation = persona.metadata?.education_level || persona.metadata?.education;
        if (personaEducation) {
          const educationLower = personaEducation.toLowerCase();
          const selectedEducationLower = selectedEducation.toLowerCase();
          
          // Handle common variations
          let educationMatches = false;
          if (selectedEducationLower === "high school") {
            educationMatches = educationLower.includes("high school") || 
                              educationLower.includes("hs") || 
                              educationLower.includes("secondary");
          } else if (selectedEducationLower === "some college") {
            educationMatches = educationLower.includes("some college") || 
                              educationLower.includes("partial");
          } else if (selectedEducationLower === "bachelor's") {
            educationMatches = educationLower.includes("bachelor") || 
                              educationLower.includes("ba") || 
                              educationLower.includes("bs");
          } else if (selectedEducationLower === "master's") {
            educationMatches = educationLower.includes("master") || 
                              educationLower.includes("ma") || 
                              educationLower.includes("ms");
          } else if (selectedEducationLower === "doctorate") {
            educationMatches = educationLower.includes("doctorate") || 
                              educationLower.includes("phd") || 
                              educationLower.includes("ph.d");
          } else if (selectedEducationLower === "vocational") {
            educationMatches = educationLower.includes("vocational") || 
                              educationLower.includes("trade") || 
                              educationLower.includes("technical");
          } else {
            educationMatches = educationLower.includes(selectedEducationLower);
          }
          
          if (!educationMatches) return false;
        } else {
          return false; // No education data, exclude
        }
      }

      return true;
    });
  };

  // Apply both search and advanced filters
  const searchedPersonas = searchPersonas(personas, searchQuery);
  const filteredPersonas = applyAdvancedFilters(searchedPersonas);

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
    if ((searchQuery || selectedTags.length > 0 || selectedAge || selectedRegion || selectedIncome || selectedSourceType || selectedGender || selectedMaritalStatus || selectedHasChildren || selectedEducation) && personas.length > 0) {
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
