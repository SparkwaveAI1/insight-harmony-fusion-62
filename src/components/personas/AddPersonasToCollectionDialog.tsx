
import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Persona } from "@/services/persona/types";
import { addPersonasToCollection, getPersonasNotInCollection } from "@/services/collections";
import { dbPersonaToPersona } from "@/services/persona/mappers";
import { useUnifiedPersonaSearch } from "@/hooks/useUnifiedPersonaSearch";
import { V4Persona } from "@/types/persona-v4";

interface AddPersonasToCollectionDialogProps {
  collectionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPersonasAdded: () => void;
}

const AddPersonasToCollectionDialog: React.FC<AddPersonasToCollectionDialogProps> = ({
  collectionId,
  open,
  onOpenChange,
  onPersonasAdded,
}) => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Fetch personas when dialog opens
  useEffect(() => {
    if (open && user) {
      fetchAvailablePersonas();
    }
  }, [open, user, collectionId]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setSelectedPersonaIds([]);
    }
  }, [open]);

  const fetchAvailablePersonas = async () => {
    setIsLoading(true);
    try {
      if (!user) {
        console.error("User not authenticated");
        toast.error("You must be logged in to add personas to a collection.");
        return;
      }

      const availablePersonasData = await getPersonasNotInCollection(collectionId, user.id);
      // Transform the data using the dbPersonaToPersona mapper to ensure correct type
      const transformedPersonas = availablePersonasData.map((dbPersona: any) => dbPersonaToPersona(dbPersona));
      setPersonas(transformedPersonas);
    } catch (error) {
      console.error("Error fetching personas not in collection:", error);
      toast.error("Failed to load available personas.");
    } finally {
      setIsLoading(false);
    }
  };

  // Use unified search hook (cast for V4 search)
  const searchedPersonas = useUnifiedPersonaSearch(personas as unknown as V4Persona[], searchTerm, {
    context: 'collection',
    maxResults: 20
  }) as unknown as Persona[];

  // Filter personas by collection (simplified - collection filtering removed as it wasn't implemented)
  const filteredPersonas = useMemo(() => {
    return searchedPersonas;
  }, [searchedPersonas]);

  const handleCheckboxChange = (personaId: string) => {
    setSelectedPersonaIds((prevSelected) => {
      if (prevSelected.includes(personaId)) {
        return prevSelected.filter((id) => id !== personaId);
      } else {
        return [...prevSelected, personaId];
      }
    });
  };

  const handleSelectAll = () => {
    const allIds = filteredPersonas.map(p => p.persona_id);
    setSelectedPersonaIds(allIds);
  };

  const handleClearAll = () => {
    setSelectedPersonaIds([]);
  };

  const handleAddPersonas = async () => {
    if (selectedPersonaIds.length === 0) {
      toast.info("Please select at least one persona to add");
      return;
    }

    try {
      const success = await addPersonasToCollection(collectionId, selectedPersonaIds);
      if (success) {
        toast.success("Personas added to collection successfully!");
        onPersonasAdded();
        onOpenChange(false); // Close the dialog
        setSelectedPersonaIds([]); // Reset selection
      } else {
        toast.error("Failed to add personas to collection.");
      }
    } catch (error) {
      console.error("Error adding personas to collection:", error);
      toast.error("Failed to add personas to collection.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            Add Personas to Collection
            <Badge variant="secondary">
              {selectedPersonaIds.length} selected
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Search and select personas to add to this collection. Use the search bar to filter by name, demographics, or tags.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 space-y-4 py-4 overflow-hidden">
          {/* Search and Controls */}
          <div className="space-y-3 flex-shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, demographics, occupation, location, education, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Bulk Selection Controls */}
            {filteredPersonas.length > 0 && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSelectAll}
                  disabled={isLoading}
                >
                  <CheckSquare className="h-4 w-4 mr-1" />
                  Select All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearAll}
                  disabled={isLoading || selectedPersonaIds.length === 0}
                >
                  <Square className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </div>
            )}
            
            {/* Search Help Text */}
            <p className="text-xs text-muted-foreground">
              Search across name, age, gender, occupation, location, education, income, ethnicity, and tags
            </p>
          </div>

          {/* Persona List */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-[500px] w-full rounded-md border">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p className="text-muted-foreground">Loading personas...</p>
                </div>
              ) : filteredPersonas.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground mb-2">
                    {searchTerm ? 
                      `No personas found matching "${searchTerm}".` :
                      personas.length === 0 ?
                        'No available personas to add' :
                        'No personas match your current filters.'
                    }
                  </p>
                  {personas.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      All your personas are already in this collection
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
                  {filteredPersonas.map((persona) => {
                    const isSelected = selectedPersonaIds.includes(persona.persona_id);
                    const metadata = persona.metadata || {};

                    return (
                      <Card
                        key={persona.persona_id}
                        className={`cursor-pointer transition-all duration-200 ${
                          isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleCheckboxChange(persona.persona_id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded border-2 mt-1 flex items-center justify-center ${
                              isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                            }`}>
                              {isSelected && (
                                <div className="w-2 h-2 bg-white rounded-sm" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm mb-2 truncate">{persona.name}</h3>
                              
                              {/* Enhanced Demographics Display */}
                              <div className="space-y-2">
                                {/* Primary Demographics */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  {metadata.age && (
                                    <Badge variant="outline" className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                                      Age: {metadata.age}
                                    </Badge>
                                  )}
                                  {metadata.gender && (
                                    <Badge variant="outline" className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 border-purple-200">
                                      {metadata.gender}
                                    </Badge>
                                  )}
                                </div>
                                
                                {/* Occupation */}
                                {metadata.occupation && (
                                  <p className="text-xs font-medium text-foreground">
                                    {metadata.occupation}
                                  </p>
                                )}
                                
                                {/* Secondary Demographics */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  {metadata.education_level && (
                                    <Badge variant="outline" className="text-xs px-2 py-0.5 bg-green-50 text-green-700 border-green-200">
                                      {metadata.education_level}
                                    </Badge>
                                  )}
                                  {metadata.income_level && (
                                    <Badge variant="outline" className="text-xs px-2 py-0.5 bg-yellow-50 text-yellow-700 border-yellow-200">
                                      {metadata.income_level}
                                    </Badge>
                                  )}
                                </div>
                                
                                {/* Location */}
                                {(metadata.region || metadata.location_history?.current_residence) && (
                                  <div className="flex items-center gap-1">
                                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                                      📍 {metadata.region || metadata.location_history?.current_residence}
                                    </Badge>
                                  </div>
                                )}
                                
                                {/* Ethnicity */}
                                {metadata.race_ethnicity && (
                                  <p className="text-xs text-muted-foreground">
                                    {metadata.race_ethnicity}
                                  </p>
                                )}
                                
                                {/* Tags */}
                                {persona.preinterview_tags && Array.isArray(persona.preinterview_tags) && persona.preinterview_tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {persona.preinterview_tags.slice(0, 3).map((tag, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {persona.preinterview_tags.length > 3 && (
                                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                        +{persona.preinterview_tags.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
        
        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              {selectedPersonaIds.length} persona{selectedPersonaIds.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddPersonas} 
                disabled={selectedPersonaIds.length === 0 || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding...
                  </div>
                ) : (
                  `Add ${selectedPersonaIds.length} Persona${selectedPersonaIds.length !== 1 ? 's' : ''}`
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPersonasToCollectionDialog;
