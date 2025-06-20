
import { supabase } from "@/integrations/supabase/client";

export class OpenAIService {
  private static async getApiKey(): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('get-api-key', {
        body: { service: 'openai' }
      });

      if (error) {
        console.error('Error getting OpenAI API key:', error);
        throw new Error('Failed to get OpenAI API key');
      }

      if (!data?.apiKey) {
        throw new Error('OpenAI API key not found. Please add your API key in settings.');
      }

      return data.apiKey;
    } catch (error) {
      console.error('Error in getApiKey:', error);
      throw error;
    }
  }

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
      const apiKey = await this.getApiKey();
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options?.model || 'gpt-4.1-2025-04-14', // Updated to match edge function
          messages,
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 2000,
          stream: options?.stream || false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating OpenAI response:', error);
      throw error;
    }
  }

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
}
