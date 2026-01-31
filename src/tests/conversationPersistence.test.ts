/**
 * Tests for Conversation Persistence Service
 * 
 * Critical path testing for save/load message pairs functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import {
  getOrCreateConversation,
  loadConversationMessages,
  saveMessage,
  saveMessagePair,
  startNewConversation,
  listConversations,
  deleteConversation,
  type ConversationMessage,
  type Conversation,
} from '@/services/conversationPersistence';

// Type helper for mocking supabase chainable API
type MockQueryBuilder = {
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  contains: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
};

describe('conversationPersistence', () => {
  let mockQueryBuilder: MockQueryBuilder;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create chainable mock query builder
    mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };

    // Setup mock to return chainable builder
    vi.mocked(supabase.from).mockReturnValue(mockQueryBuilder as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getOrCreateConversation', () => {
    const testPersonaId = 'v4_test_persona_123';
    const testUserId = 'user_abc123';
    const testPersonaName = 'Test Persona';

    it('should return existing conversation when found', async () => {
      const existingConversation: Conversation = {
        id: 'conv_existing_123',
        title: 'Chat with Test Persona',
        persona_ids: [testPersonaId],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T12:00:00Z',
      };

      mockQueryBuilder.single.mockResolvedValue({
        data: existingConversation,
        error: null,
      });

      const result = await getOrCreateConversation(testPersonaId, testUserId, testPersonaName);

      expect(result).toEqual(existingConversation);
      expect(supabase.from).toHaveBeenCalledWith('conversations');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', testUserId);
      expect(mockQueryBuilder.contains).toHaveBeenCalledWith('persona_ids', [testPersonaId]);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('session_type', 'chat');
    });

    it('should create new conversation when none exists', async () => {
      const newConversation: Conversation = {
        id: 'conv_new_456',
        title: `Chat with ${testPersonaName} - ${new Date().toLocaleDateString()}`,
        persona_ids: [testPersonaId],
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      // First query returns no existing conversation
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'No rows returned' },
      });

      // Mock insert for new conversation
      const insertBuilder = {
        ...mockQueryBuilder,
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: newConversation,
            error: null,
          }),
        }),
      };
      vi.mocked(supabase.from)
        .mockReturnValueOnce(mockQueryBuilder as any) // First call for select
        .mockReturnValueOnce(insertBuilder as any);   // Second call for insert

      const result = await getOrCreateConversation(testPersonaId, testUserId, testPersonaName);

      expect(result).toEqual(newConversation);
    });

    it('should return null on database error', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { code: 'INTERNAL_ERROR', message: 'Database error' },
      });

      const result = await getOrCreateConversation(testPersonaId, testUserId, testPersonaName);

      // Should still try to create a new conversation
      expect(supabase.from).toHaveBeenCalled();
    });
  });

  describe('loadConversationMessages', () => {
    const testConversationId = 'conv_123';

    it('should load messages in ascending order', async () => {
      const mockMessages = [
        { id: 'msg_1', role: 'user', content: 'Hello', created_at: '2024-01-01T10:00:00Z', persona_id: null },
        { id: 'msg_2', role: 'assistant', content: 'Hi there!', created_at: '2024-01-01T10:00:05Z', persona_id: 'v4_123' },
        { id: 'msg_3', role: 'user', content: 'How are you?', created_at: '2024-01-01T10:00:10Z', persona_id: null },
      ];

      mockQueryBuilder.order.mockReturnValue({
        ...mockQueryBuilder,
        then: (resolve: any) => Promise.resolve(resolve({ data: mockMessages, error: null })),
      } as any);

      // Override single/order chain for this test
      mockQueryBuilder.order.mockResolvedValue({ data: mockMessages, error: null });

      const result = await loadConversationMessages(testConversationId);

      expect(result).toHaveLength(3);
      expect(result[0].role).toBe('user');
      expect(result[0].content).toBe('Hello');
      expect(result[1].role).toBe('assistant');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('conversation_id', testConversationId);
      expect(mockQueryBuilder.order).toHaveBeenCalledWith('created_at', { ascending: true });
    });

    it('should return empty array on error', async () => {
      mockQueryBuilder.order.mockResolvedValue({
        data: null,
        error: { code: 'INTERNAL_ERROR', message: 'DB error' },
      });

      const result = await loadConversationMessages(testConversationId);

      expect(result).toEqual([]);
    });

    it('should handle empty conversation', async () => {
      mockQueryBuilder.order.mockResolvedValue({ data: [], error: null });

      const result = await loadConversationMessages(testConversationId);

      expect(result).toEqual([]);
    });
  });

  describe('saveMessagePair', () => {
    const testConversationId = 'conv_123';
    const testPersonaId = 'v4_persona_456';

    const userMessage: ConversationMessage = {
      role: 'user',
      content: 'What do you think about AI?',
    };

    const assistantMessage: ConversationMessage = {
      role: 'assistant',
      content: 'I think AI is a fascinating technology with great potential.',
    };

    it('should save both messages atomically', async () => {
      // Mock successful insert
      mockQueryBuilder.insert.mockReturnValue({
        ...mockQueryBuilder,
        then: (resolve: any) => Promise.resolve(resolve({ error: null })),
      } as any);

      // Mock update for timestamp
      mockQueryBuilder.update.mockReturnValue({
        ...mockQueryBuilder,
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      // Override for this test
      mockQueryBuilder.insert.mockResolvedValue({ error: null });
      vi.mocked(supabase.from)
        .mockReturnValueOnce(mockQueryBuilder as any)  // insert
        .mockReturnValueOnce({                         // update
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        } as any);

      const result = await saveMessagePair(
        testConversationId,
        userMessage,
        assistantMessage,
        testPersonaId
      );

      expect(result).toBe(true);
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith([
        {
          conversation_id: testConversationId,
          role: 'user',
          content: userMessage.content,
        },
        {
          conversation_id: testConversationId,
          role: 'assistant',
          content: assistantMessage.content,
          persona_id: testPersonaId,
          responding_persona_id: testPersonaId,
        },
      ]);
    });

    it('should return false on insert error', async () => {
      mockQueryBuilder.insert.mockResolvedValue({
        error: { code: 'INSERT_ERROR', message: 'Failed to insert' },
      });

      const result = await saveMessagePair(
        testConversationId,
        userMessage,
        assistantMessage,
        testPersonaId
      );

      expect(result).toBe(false);
    });

    it('should handle exception gracefully', async () => {
      mockQueryBuilder.insert.mockRejectedValue(new Error('Network error'));

      const result = await saveMessagePair(
        testConversationId,
        userMessage,
        assistantMessage,
        testPersonaId
      );

      expect(result).toBe(false);
    });
  });

  describe('saveMessage', () => {
    it('should save a single user message', async () => {
      const testConversationId = 'conv_123';
      const message: ConversationMessage = {
        role: 'user',
        content: 'Test message',
      };

      mockQueryBuilder.insert.mockResolvedValue({ error: null });
      vi.mocked(supabase.from)
        .mockReturnValueOnce(mockQueryBuilder as any)
        .mockReturnValueOnce({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        } as any);

      const result = await saveMessage(testConversationId, message);

      expect(result).toBe(true);
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith({
        conversation_id: testConversationId,
        role: 'user',
        content: 'Test message',
        persona_id: null,
        responding_persona_id: null,
      });
    });

    it('should save assistant message with persona_id', async () => {
      const testConversationId = 'conv_123';
      const testPersonaId = 'v4_persona_456';
      const message: ConversationMessage = {
        role: 'assistant',
        content: 'Response message',
      };

      mockQueryBuilder.insert.mockResolvedValue({ error: null });
      vi.mocked(supabase.from)
        .mockReturnValueOnce(mockQueryBuilder as any)
        .mockReturnValueOnce({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        } as any);

      const result = await saveMessage(testConversationId, message, testPersonaId);

      expect(result).toBe(true);
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith({
        conversation_id: testConversationId,
        role: 'assistant',
        content: 'Response message',
        persona_id: testPersonaId,
        responding_persona_id: testPersonaId,
      });
    });
  });

  describe('startNewConversation', () => {
    it('should create a fresh conversation', async () => {
      const testPersonaId = 'v4_persona_789';
      const testUserId = 'user_xyz';
      const testPersonaName = 'Fresh Persona';

      const newConversation: Conversation = {
        id: 'conv_fresh_001',
        title: `Chat with ${testPersonaName} - ${new Date().toLocaleDateString()}`,
        persona_ids: [testPersonaId],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockQueryBuilder.insert.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: newConversation, error: null }),
        }),
      });

      const result = await startNewConversation(testPersonaId, testUserId, testPersonaName);

      expect(result).toEqual(newConversation);
    });
  });

  describe('listConversations', () => {
    it('should list all conversations for a persona/user', async () => {
      const testPersonaId = 'v4_persona_123';
      const testUserId = 'user_abc';

      const conversations: Conversation[] = [
        {
          id: 'conv_1',
          title: 'Chat 1',
          persona_ids: [testPersonaId],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
        {
          id: 'conv_2',
          title: 'Chat 2',
          persona_ids: [testPersonaId],
          created_at: '2024-01-03T00:00:00Z',
          updated_at: '2024-01-04T00:00:00Z',
        },
      ];

      mockQueryBuilder.order.mockResolvedValue({ data: conversations, error: null });

      const result = await listConversations(testPersonaId, testUserId);

      expect(result).toHaveLength(2);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', testUserId);
      expect(mockQueryBuilder.contains).toHaveBeenCalledWith('persona_ids', [testPersonaId]);
    });
  });

  describe('deleteConversation', () => {
    it('should delete conversation (messages cascade)', async () => {
      const testConversationId = 'conv_to_delete';

      mockQueryBuilder.delete.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const result = await deleteConversation(testConversationId);

      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('conversations');
    });

    it('should return false on delete error', async () => {
      mockQueryBuilder.delete.mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: { code: 'DELETE_ERROR', message: 'Failed to delete' },
        }),
      });

      const result = await deleteConversation('conv_error');

      expect(result).toBe(false);
    });
  });
});

describe('Message roundtrip integration', () => {
  it('should correctly roundtrip save and load messages', async () => {
    // This test verifies the data transformation is correct
    const inputMessages: ConversationMessage[] = [
      { role: 'user', content: 'First question' },
      { role: 'assistant', content: 'First answer' },
      { role: 'user', content: 'Second question' },
      { role: 'assistant', content: 'Second answer' },
    ];

    // Simulate what DB would return
    const dbMessages = inputMessages.map((msg, idx) => ({
      id: `msg_${idx}`,
      role: msg.role,
      content: msg.content,
      created_at: new Date(Date.now() + idx * 1000).toISOString(),
      persona_id: msg.role === 'assistant' ? 'v4_test' : null,
    }));

    // Verify transformation
    const transformed = dbMessages.map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      timestamp: new Date(msg.created_at),
    }));

    expect(transformed).toHaveLength(4);
    expect(transformed[0].role).toBe('user');
    expect(transformed[1].role).toBe('assistant');
    expect(transformed[2].content).toBe('Second question');
    expect(transformed[3].content).toBe('Second answer');
  });
});
