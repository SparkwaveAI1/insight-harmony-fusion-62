
// Collection Types
export interface Collection {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CollectionWithPersonaCount extends Collection {
  persona_count: number;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description: string | null;
  information: string | null;
  research_objectives: string | null;
  methodology: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithConversationCount extends Project {
  conversation_count: number;
}

// Conversation Types
export interface Conversation {
  id: string;
  title: string;
  project_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  persona_ids: string[];
  tags: string[];
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  persona_id: string | null;
}

// Knowledge Base Types
export interface KnowledgeBaseDocument {
  id: string;
  title: string;
  content: string | null;
  file_url: string | null;
  file_type: string | null;
  file_size: number | null;
  project_id: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}
