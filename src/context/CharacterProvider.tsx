
import React, { createContext, useState, useEffect } from "react";
import { Character } from "@/characters/types/characterTraitTypes";
import { useAuth } from "./AuthContext";
import { CharacterContextType } from "./CharacterContext.types";
import { getAllCharacters } from "@/characters/services/characterService";

export const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

interface CharacterProviderProps {
  children: React.ReactNode;
}

export const CharacterProvider: React.FC<CharacterProviderProps> = ({ children }) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [activeCharacters, setActiveCharacters] = useState<Character[]>([]);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadCharacters = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const allCharacters = await getAllCharacters();
        if (user) {
          // Filter characters by user_id
          const userCharacters = allCharacters.filter(character => character.user_id === user.id);
          setCharacters(userCharacters);
        } else {
          setCharacters(allCharacters);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCharacters();
  }, [user]);

  const loadCharacter = async (characterId: string): Promise<Character | null> => {
    try {
      setIsLoading(true);
      // Find the character in the current list or fetch it
      const character = characters.find(c => c.character_id === characterId) || null;
      setActiveCharacter(character);
      return character;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const loadMultipleCharacters = async (characterIds: string[]): Promise<Character[]> => {
    try {
      setIsLoading(true);
      // Filter characters from the current list based on the provided IDs
      const foundCharacters = characters.filter(c => characterIds.includes(c.character_id));
      setActiveCharacters(foundCharacters);
      return foundCharacters;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const clearCharacter = () => {
    setActiveCharacter(null);
  };

  const clearCharacters = () => {
    setActiveCharacters([]);
  };

  const value: CharacterContextType = {
    characters,
    setCharacters,
    activeCharacter,
    activeCharacters,
    isLoading,
    error,
    loadCharacter,
    loadMultipleCharacters,
    clearCharacter,
    clearCharacters
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacterContext = () => {
  const context = React.useContext(CharacterContext);
  if (context === undefined) {
    throw new Error("useCharacterContext must be used within a CharacterProvider");
  }
  return context;
};
