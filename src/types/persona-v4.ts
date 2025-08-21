// V4 Core Persona Interfaces

// Basic identity structure
export interface V4Identity {
  name: string;           // "Derrick Cole"
  age: number;            // 36
  gender: string;         // "Male", "Female", "Non-binary"
  occupation: string;     // "Electrical Contractor"
  location: {
    city: string;         // "Raleigh"
    region: string;       // "NC"
    country: string;      // "US"
  };
  background_summary: string; // Rich narrative (temporary - will be moved to conversation_summary later)
}

// Core motivation structure
export interface V4MotivationProfile {
  self_interest: number;      // 0.8
  family: number;             // 0.9
  status: number;             // 0.6
  mastery: number;            // 0.7
  care: number;               // 0.5
  security: number;           // 0.8
  belonging: number;          // 0.4
  novelty: number;            // 0.3
  meaning: number;            // 0.6
}

// Basic communication style
export interface V4CommunicationStyle {
  directness: string;         // "high", "medium", "low"
  formality: string;          // "casual", "neutral", "formal"
  signature_phrases: string[]; // ["bottom line", "roger that"]
}

// Conversation summary (populated in Call 2)
export interface V4ConversationSummary {
  demographics: {
    name: string;
    age: number;
    occupation: string;
    location: string;
    background_description: string; // Generated in Call 2
  };
  motivation_summary: string;       // Generated in Call 2
  communication_style: V4CommunicationStyle;
}

// Simple full profile (will expand later)
export interface V4FullProfile {
  identity: V4Identity;
  motivation_profile: V4MotivationProfile;
  communication_style: V4CommunicationStyle;
}

// Main V4 Persona interface
export interface V4Persona {
  id: string;
  persona_id: string;
  name: string;
  user_id: string;
  schema_version: string;
  
  full_profile: V4FullProfile;
  conversation_summary: V4ConversationSummary;
  
  creation_stage: 'not_started' | 'detailed_traits' | 'summary_generation' | 'completed';
  creation_completed: boolean;
  
  created_at: string;
  updated_at: string;
}