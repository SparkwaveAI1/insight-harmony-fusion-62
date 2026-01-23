import { supabase } from "@/integrations/supabase/client";

/**
 * OpenAI Service - Secure Proxy Pattern
 * 
 * All OpenAI API calls are routed through a server-side edge function
 * that handles authentication and API key management securely.
 * API keys are NEVER exposed to the client.
 */
export class OpenAIService {
  /**
   * Generate a response using OpenAI chat completions via secure proxy
   */
  static async generateResponse(
    messages: Array<{ role: string; content: string }>,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    }
  ): Promise<string> {
    try {
      const payload = {
        model: options?.model || 'gpt-4.1-2025-04-14',
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        stream: options?.stream ?? false,
      };

      // Use secure proxy - API key is handled server-side
      const { data, error } = await supabase.functions.invoke('openai-proxy', {
        body: { endpoint: 'chat/completions', payload }
      });

      if (error) {
        console.error('Error invoking OpenAI proxy:', error);
        throw new Error('Failed to generate response. Please try again.');
      }

      if (data.error) {
        console.error('OpenAI API error:', data.error);
        throw new Error(data.error);
      }

      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating OpenAI response:', error);
      throw error;
    }
  }

  /**
   * Generate a completion from a simple prompt
   */
  static async generateCompletion(
    prompt: string,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    const messages = [{ role: 'user', content: prompt }];
    return this.generateResponse(messages, options);
  }

  /**
   * Generate a response with a system prompt
   */
  static async generateWithSystemPrompt(
    systemPrompt: string,
    userPrompt: string,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
    return this.generateResponse(messages, options);
  }

  /**
   * Generate embeddings via secure proxy
   */
  static async generateEmbedding(
    text: string,
    model: string = 'text-embedding-3-small'
  ): Promise<number[]> {
    try {
      const payload = {
        model,
        input: text,
      };

      const { data, error } = await supabase.functions.invoke('openai-proxy', {
        body: { endpoint: 'embeddings', payload }
      });

      if (error) {
        console.error('Error invoking OpenAI proxy for embeddings:', error);
        throw new Error('Failed to generate embeddings');
      }

      if (data.error) {
        console.error('OpenAI embeddings error:', data.error);
        throw new Error(data.error);
      }

      return data.data?.[0]?.embedding || [];
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }
}
