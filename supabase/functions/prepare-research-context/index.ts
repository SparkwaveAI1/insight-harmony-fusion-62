import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documents, surveyName, surveyDescription } = await req.json();

    console.log(`Processing ${documents.length} documents for survey: ${surveyName}`);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract and combine document content
    let combinedContent = '';
    const documentSummaries = [];
    const imageDocuments = [];

    for (const doc of documents) {
      console.log(`Processing document: ${doc.title}`);
      
      // Handle text content
      if (doc.content && doc.content.trim()) {
        combinedContent += `\n\n=== ${doc.title} ===\n${doc.content}`;
        documentSummaries.push({
          title: doc.title,
          content_length: doc.content.length,
          file_type: doc.file_type || 'unknown',
          type: 'text'
        });
      }
      
      // Handle image documents
      if (doc.is_image && doc.image_data) {
        console.log(`Found image document: ${doc.title} with visual data`);
        imageDocuments.push({
          title: doc.title,
          image_data: doc.image_data,
          file_type: doc.file_type || 'image',
          image_url: doc.image_url
        });
        documentSummaries.push({
          title: doc.title,
          content_length: 0,
          file_type: doc.file_type || 'image',
          type: 'image'
        });
      }
    }

    if (!combinedContent.trim() && imageDocuments.length === 0) {
      console.log('No document content found, returning empty context');
      return new Response(JSON.stringify({
        research_context: {
          summary: 'No project documents provided.',
          key_insights: [],
          guidelines: [],
          document_summaries: [],
          has_images: false
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle image analysis if we have images
    let imageAnalysis = '';
    if (imageDocuments.length > 0) {
      console.log(`Analyzing ${imageDocuments.length} image document(s)...`);
      
      // For now, we'll analyze the first image (can be extended to handle multiple)
      const firstImage = imageDocuments[0];
      
      const imageAnalysisPrompt = `You are analyzing an image document titled "${firstImage.title}" as part of a research project.

SURVEY DETAILS:
- Name: ${surveyName}
- Description: ${surveyDescription || 'Not provided'}

Please analyze this image and provide insights that would be relevant for survey respondents. Focus on:
1. What you see in the image
2. Key visual elements, themes, or concepts
3. How this relates to the survey context
4. Important details that personas should consider when responding

Provide a detailed description of what you observe in this image.`;

      const imageResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { 
              role: 'system', 
              content: 'You are a research assistant that analyzes images for research projects. Provide detailed, objective descriptions.' 
            },
            { 
              role: 'user', 
              content: [
                { type: 'text', text: imageAnalysisPrompt },
                { 
                  type: 'image_url', 
                  image_url: { 
                    url: `data:image/jpeg;base64,${firstImage.image_data}` 
                  } 
                }
              ]
            }
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        imageAnalysis = imageData.choices[0]?.message?.content || '';
        console.log('Image analysis completed successfully');
        
        // Add image analysis to combined content
        combinedContent += `\n\n=== IMAGE ANALYSIS: ${firstImage.title} ===\n${imageAnalysis}`;
      } else {
        console.error('Failed to analyze image with OpenAI');
        imageAnalysis = `Image document "${firstImage.title}" is available for visual analysis but could not be processed at this time.`;
        combinedContent += `\n\n=== IMAGE DOCUMENT: ${firstImage.title} ===\n${imageAnalysis}`;
      }
    }

    // Create AI prompt for document analysis
    const prompt = `You are a research assistant tasked with analyzing project documents to create a comprehensive research briefing.

SURVEY DETAILS:
- Name: ${surveyName}
- Description: ${surveyDescription || 'Not provided'}

PROJECT DOCUMENTS${imageDocuments.length > 0 ? ' (including visual content)' : ''}:
${combinedContent}

Your task is to analyze these documents and create a structured research context that will help personas provide informed responses to survey questions.

Please provide a JSON response with the following structure:
{
  "summary": "A concise 2-3 sentence summary of the key information from all documents",
  "key_insights": ["List of 3-5 key insights or findings from the documents"],
  "guidelines": ["List of 3-5 important guidelines or principles that should inform responses"],
  "background_context": "Detailed background information that personas should know",
  "document_summaries": [
    {
      "title": "document title",
      "key_points": ["main points from this document"]
    }
  ]${imageDocuments.length > 0 ? ',\n  "visual_elements": "Description of key visual elements and their significance"' : ''}
}

Focus on information that would be relevant for survey respondents to understand the context, objectives, and any constraints or guidelines for their responses.`;

    console.log('Sending document analysis request to OpenAI...');

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: 'You are a research assistant that analyzes documents and creates structured research briefings. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const analysisResult = data.choices[0]?.message?.content || '';

    console.log('Received analysis from OpenAI, parsing JSON...');

    // Parse the JSON response
    let research_context;
    try {
      research_context = JSON.parse(analysisResult);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      // Fallback to a basic structure
      research_context = {
        summary: `Analysis of ${documents.length} project documents for ${surveyName}`,
        key_insights: ['Document analysis completed but parsing failed'],
        guidelines: ['Refer to project documents for context'],
        background_context: combinedContent.substring(0, 1000) + '...',
        document_summaries: documentSummaries
      };
    }

    // Add metadata
    research_context.metadata = {
      processed_at: new Date().toISOString(),
      document_count: documents.length,
      total_content_length: combinedContent.length,
      model_used: 'gpt-4.1-2025-04-14',
      has_images: imageDocuments.length > 0,
      image_count: imageDocuments.length
    };

    console.log('Document processing completed successfully');

    return new Response(JSON.stringify({ research_context }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in prepare-research-context function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      research_context: null 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});