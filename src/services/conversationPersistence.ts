/**
 * Conversation Persistence Service
 * 
 * Handles saving and loading chat conversations to/from the database.
 * Works with existing `conversations` and `conversation_messages` tables.
 */

import { supabase } from '@/integrations/supabase/client';

export interface ConversationMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  image?: string; // Base64 image data (not persisted to DB)
}

export interface Conversation {
  id: string;
  title: string;
  persona_ids: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Get or create a conversation for a persona/user pair
 */
export async function getOrCreateConversation(
  personaId: string,
  userId: string,
  personaName: string
): Promise<Conversation | null> {
  try {
    // First, try to find existing conversation for this persona
    const { data: existing, error: findError } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .contains('persona_ids', [personaId])
      .eq('session_type', 'chat')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (existing && !findError) {
      console.log('📂 Found existing conversation:', existing.id);
      return existing as Conversation;
    }

    // No existing conversation, create new one
    const title = `Chat with ${personaName} - ${new Date().toLocaleDateString()}`;
    
    const { data: newConv, error: createError } = await supabase
      .from('conversations')
      .insert({
        title,
        user_id: userId,
        persona_ids: [personaId],
        session_type: 'chat',
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating conversation:', createError);
      return null;
    }

    console.log('✅ Created new conversation:', newConv.id);
    return newConv as Conversation;

  } catch (error) {
    console.error('❌ Error in getOrCreateConversation:', error);
    return null;
  }
}

/**
 * Load messages for a conversation
 */
export async function loadConversationMessages(
  conversationId: string
): Promise<ConversationMessage[]> {
  try {
    const { data, error } = await supabase
      .from('conversation_messages')
      .select('id, role, content, created_at, persona_id')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error loading messages:', error);
      return [];
    }

    console.log(`📨 Loaded ${data?.length || 0} messages`);
    
    return (data || []).map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      timestamp: new Date(msg.created_at),
    }));

  } catch (error) {
    console.error('❌ Error in loadConversationMessages:', error);
    return [];
  }
}

/**
 * Save a message to the conversation
 */
export async function saveMessage(
  conversationId: string,
  message: ConversationMessage,
  personaId?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('conversation_messages')
      .insert({
        conversation_id: conversationId,
        role: message.role,
        content: message.content,
        persona_id: message.role === 'assistant' ? personaId : null,
        responding_persona_id: message.role === 'assistant' ? personaId : null,
      });

    if (error) {
      console.error('❌ Error saving message:', error);
      return false;
    }

    // Update conversation's updated_at timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return true;

  } catch (error) {
    console.error('❌ Error in saveMessage:', error);
    return false;
  }
}

/**
 * Save both user message and assistant response together
 */
export async function saveMessagePair(
  conversationId: string,
  userMessage: ConversationMessage,
  assistantMessage: ConversationMessage,
  personaId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('conversation_messages')
      .insert([
        {
          conversation_id: conversationId,
          role: 'user',
          content: userMessage.content,
        },
        {
          conversation_id: conversationId,
          role: 'assistant',
          content: assistantMessage.content,
          persona_id: personaId,
          responding_persona_id: personaId,
        }
      ]);

    if (error) {
      console.error('❌ Error saving message pair:', error);
      return false;
    }

    // Update conversation's updated_at timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    console.log('💾 Saved message pair to conversation');
    return true;

  } catch (error) {
    console.error('❌ Error in saveMessagePair:', error);
    return false;
  }
}

/**
 * Start a new conversation (clears current and creates fresh)
 */
export async function startNewConversation(
  personaId: string,
  userId: string,
  personaName: string
): Promise<Conversation | null> {
  try {
    const title = `Chat with ${personaName} - ${new Date().toLocaleDateString()}`;
    
    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({
        title,
        user_id: userId,
        persona_ids: [personaId],
        session_type: 'chat',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating new conversation:', error);
      return null;
    }

    console.log('🆕 Started new conversation:', newConv.id);
    return newConv as Conversation;

  } catch (error) {
    console.error('❌ Error in startNewConversation:', error);
    return null;
  }
}

/**
 * List all conversations for a persona/user
 */
export async function listConversations(
  personaId: string,
  userId: string
): Promise<Conversation[]> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .contains('persona_ids', [personaId])
      .eq('session_type', 'chat')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('❌ Error listing conversations:', error);
      return [];
    }

    return (data || []) as Conversation[];

  } catch (error) {
    console.error('❌ Error in listConversations:', error);
    return [];
  }
}

/**
 * Delete a conversation and its messages
 */
export async function deleteConversation(conversationId: string): Promise<boolean> {
  try {
    // Messages are cascade-deleted via FK constraint
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('❌ Error deleting conversation:', error);
      return false;
    }

    console.log('🗑️ Deleted conversation:', conversationId);
    return true;

  } catch (error) {
    console.error('❌ Error in deleteConversation:', error);
    return false;
  }
}
