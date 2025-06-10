
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getAllPersonas, getPersonasByCollection } from '@/services/persona';
import { getUserCollections } from '@/services/collections';
import { Persona } from '@/services/persona/types';
import { Collection } from '@/services/collections/types';
import { searchPersonas } from './searchUtils';

export const useAudienceData = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [filteredPersonas, setFilteredPersonas] = useState<Persona[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [isLoadingPersonas, setIsLoadingPersonas] = useState(true);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);

  // Fetch collections
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setIsLoadingCollections(true);
        console.log('Fetching user collections...');
        const userCollections = await getUserCollections();
        console.log('Fetched collections:', userCollections.length);
        setCollections(userCollections);
      } catch (error) {
        console.error('Error fetching collections:', error);
        toast.error('Failed to load collections');
      } finally {
        setIsLoadingCollections(false);
      }
    };

    fetchCollections();
  }, []);

  // Fetch personas
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        setIsLoadingPersonas(true);
        console.log('Fetching personas for collection:', selectedCollection);
        
        let allPersonas: Persona[] = [];
        
        if (selectedCollection === 'all') {
          // Fetch all personas
          allPersonas = await getAllPersonas();
        } else {
          // Fetch personas from selected collection using the correct function
          try {
            allPersonas = await getPersonasByCollection(selectedCollection);
            console.log('Collection personas fetched:', allPersonas.length);
          } catch (collectionError) {
            console.error('Error fetching collection personas:', collectionError);
            // Fall back to empty array if collection fetch fails
            allPersonas = [];
            toast.error('Failed to load personas from collection');
          }
        }
        
        console.log('Fetched personas:', allPersonas.length);
        setPersonas(allPersonas);
      } catch (error) {
        console.error('Error fetching personas:', error);
        toast.error('Failed to load personas');
        setPersonas([]);
      } finally {
        setIsLoadingPersonas(false);
      }
    };

    fetchPersonas();
  }, [selectedCollection]);

  // Apply search when search term or personas change
  useEffect(() => {
    console.log('Search term changed:', searchTerm);
    const filtered = searchPersonas(personas, searchTerm);
    console.log('Filtered personas count:', filtered.length);
    setFilteredPersonas(filtered);
  }, [searchTerm, personas]);

  return {
    personas,
    filteredPersonas,
    collections,
    searchTerm,
    setSearchTerm,
    selectedCollection,
    setSelectedCollection,
    isLoadingPersonas,
    isLoadingCollections
  };
};
