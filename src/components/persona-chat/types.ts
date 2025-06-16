
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  file?: File;
  image?: string; // base64 encoded image for backwards compatibility
  responding_persona_id?: string; // Added for research session support
}

export interface PersonaChatContext {
  personaId: string;
  messages: Message[];
  isResponding: boolean;
}

// Enhanced chat mode type
export type ChatMode = 'conversation' | 'research' | 'interview';

// Chat state interfaces
export interface ChatState {
  messages: Message[];
  isResponding: boolean;
  conversationContext: string;
}

export interface ChatActions {
  addMessage: (message: Message) => void;
  addMessages: (messages: Message[]) => void;
  setIsResponding: (responding: boolean) => void;
  setConversationContext: (context: string) => void;
  clearMessages: () => void;
  resetState: () => void;
}

// Hook return types
export interface UseChatStateReturn extends ChatState {
  actions: ChatActions;
}

export interface UsePersonaChatReturn {
  messages: Message[];
  isResponding: boolean;
  conversationContext: string;
  isLoading: boolean;
  error: any;
  activePersona: any;
  handleSendMessage: (inputMessage: string, file?: File | null) => Promise<void>;
  setConversationContext: (context: string) => void;
  chatActions: ChatActions;
}

// Component prop interfaces
export interface PersonaChatInterfaceProps {
  personaId: string;
}

export interface ChatAreaProps {
  messages: Message[];
  isResponding: boolean;
  onSendMessage: (message: string, file?: File | null) => void;
  personaImageUrl?: string;
}

export interface MessageInputProps {
  onSendMessage: (message: string, file?: File | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface SaveConversationMessage {
  role: "user" | "assistant";
  content: string;
  persona_id?: string;
}

export interface SaveConversationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: SaveConversationMessage[];
  personaIds: string[];
  defaultTitle: string;
  sessionType?: string;
  onSaved: (conversationId: string, projectId: string) => void;
}
