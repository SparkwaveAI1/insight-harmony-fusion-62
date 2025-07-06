
import { PersonaMetadata } from '../types/metadata';

export const safeMetadataAccess = (metadata: any): Partial<PersonaMetadata> => {
  if (!metadata || typeof metadata !== 'object') {
    return {};
  }
  return metadata as Partial<PersonaMetadata>;
};

export const getMetadataField = (metadata: any, field: keyof PersonaMetadata, fallback: string = 'Unknown'): string => {
  const safeMetadata = safeMetadataAccess(metadata);
  const value = safeMetadata[field];
  
  if (typeof value === 'string' && value.trim() !== '') {
    return value;
  }
  
  return fallback;
};

export const getLocationFromMetadata = (metadata: any, fallback: string = 'Unknown'): string => {
  const safeMetadata = safeMetadataAccess(metadata);
  
  // Try region first
  if (safeMetadata.region && typeof safeMetadata.region === 'string') {
    return safeMetadata.region;
  }
  
  // Try location_history.current_residence
  if (safeMetadata.location_history?.current_residence) {
    return safeMetadata.location_history.current_residence;
  }
  
  return fallback;
};
