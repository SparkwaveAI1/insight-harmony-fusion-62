
/**
 * OpenAI API utilities for Edge Functions
 * Supports both standard and streaming responses
 */

// JSON response type
export interface OpenAIResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    index: number;
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Streaming chunk type
export interface OpenAIStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    delta: {
      content?: string;
    };
    index: number;
    finish_reason: null | string;
  }[];
}

/**
 * Generate chat completion response using OpenAI API (non-streaming)
 */
export async function generateChatResponse(messages: any[], apiKey: string): Promise<OpenAIResponse> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.85,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error (${response.status}):`, errorText);
      
      // Enhanced error handling with more context
      let errorMessage = `OpenAI API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          errorMessage += ` - ${errorJson.error.message || errorJson.error.type || 'Unknown error'}`;
        }
      } catch {
        errorMessage += ` - ${errorText.substring(0, 100)}`;
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error("Error in generateChatResponse:", error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * Generate streaming response from OpenAI API
 * @returns ReadableStream of text chunks
 */
export async function generateChatResponseStream(
  messages: any[],
  apiKey: string,
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    stream_callback?: (chunk: string) => void;
  } = {}
): Promise<ReadableStream<Uint8Array>> {
  const {
    model = "gpt-4o-mini",
    temperature = 0.85,
    max_tokens = 400,
    stream_callback,
  } = options;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: temperature,
        max_tokens: max_tokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error (${response.status}):`, errorText);
      
      // Enhanced error handling with more context
      let errorMessage = `OpenAI API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          errorMessage += ` - ${errorJson.error.message || errorJson.error.type || 'Unknown error'}`;
        }
      } catch {
        errorMessage += ` - ${errorText.substring(0, 100)}`;
      }
      
      throw new Error(errorMessage);
    }

    // Verify we got a streaming response
    if (!response.body) {
      throw new Error("OpenAI API response does not have a body stream");
    }

    // Process the stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    return new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk
              .split("\n")
              .filter((line) => line.trim() !== "" && line.trim() !== "data: [DONE]");

            for (const line of lines) {
              try {
                // Each line starts with "data: " - extract the JSON
                const jsonStr = line.replace(/^data: /, "").trim();
                if (!jsonStr) continue;
                
                const json = JSON.parse(jsonStr) as OpenAIStreamChunk;
                const content = json.choices[0]?.delta?.content || "";
                
                // Call the callback if provided
                if (stream_callback && content) {
                  stream_callback(content);
                }
                
                // Push the content to the stream
                controller.enqueue(new TextEncoder().encode(content));
                
              } catch (error) {
                console.warn("Error parsing stream line:", error, line);
              }
            }
          }
          controller.close();
        } catch (error) {
          console.error("Error processing response stream:", error);
          controller.error(error);
        }
      },
      
      async cancel() {
        console.log("Stream processing was cancelled");
        reader.cancel();
      }
    });
  } catch (error) {
    console.error("Failed to create streaming response:", error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * Generate a complete text response from a streaming API call
 * This is useful when you want to use streaming internally but 
 * return a complete response to the caller
 */
export async function generateStreamedCompletion(
  messages: any[],
  apiKey: string,
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    onProgress?: (text: string) => void;
  } = {}
): Promise<string> {
  const { onProgress } = options;
  let fullText = "";
  
  try {
    const stream = await generateChatResponseStream(messages, apiKey, {
      ...options,
      stream_callback: (chunk) => {
        fullText += chunk;
        if (onProgress) onProgress(fullText);
      }
    });
    
    // Process the entire stream to build the complete text
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      // We already processed the text in the callback
    }
    
    return fullText;
  } catch (error) {
    console.error("Error in generateStreamedCompletion:", error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}
