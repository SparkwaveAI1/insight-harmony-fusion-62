
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let searchParams;
    let requestBody = {};
    
    if (req.method === "POST") {
      // Get parameters from request body
      try {
        requestBody = await req.json();
        console.log("Request body:", requestBody);
      } catch (error) {
        console.error("Error parsing request body:", error);
        return new Response(
          JSON.stringify({ error: "Invalid request body" }),
          { 
            status: 400, 
            headers: { 
              ...corsHeaders, 
              "Content-Type": "application/json" 
            } 
          }
        );
      }
    } else {
      // Get URL with search parameters for GET requests
      const url = new URL(req.url);
      searchParams = url.searchParams;
    }
    
    // Extract parameters (either from query params or request body)
    const query = requestBody.q || searchParams?.get("q") || "";
    const from = requestBody.from || searchParams?.get("from") || "";
    const sortBy = requestBody.sortBy || searchParams?.get("sortBy") || "relevancy";
    const language = requestBody.language || searchParams?.get("language") || "en";
    const pageSize = requestBody.pageSize || searchParams?.get("pageSize") || "25";
    
    // Validate that we have a query
    if (!query) {
      console.error("Missing required parameter: q");
      return new Response(
        JSON.stringify({ 
          status: "error", 
          message: "Missing required parameter: q (query)" 
        }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          } 
        }
      );
    }
    
    // Get API key from environment variable or request headers
    const newsApiKey = Deno.env.get("NEWS_API_KEY") || "fd3f81fca8ee4433b1400b634aee7d2e";
    
    // Log the parameters being used
    console.log("Processing News API request with parameters:");
    console.log(`Query: ${query}`);
    console.log(`From: ${from}`);
    console.log(`Sort By: ${sortBy}`);
    console.log(`Language: ${language}`);
    console.log(`Page Size: ${pageSize}`);
    
    // Build the News API URL
    const newsApiUrl = new URL("https://newsapi.org/v2/everything");
    newsApiUrl.searchParams.append("q", query);
    if (from) newsApiUrl.searchParams.append("from", from);
    newsApiUrl.searchParams.append("sortBy", sortBy);
    newsApiUrl.searchParams.append("language", language);
    newsApiUrl.searchParams.append("pageSize", pageSize);
    newsApiUrl.searchParams.append("apiKey", newsApiKey);
    
    console.log(`Proxying request to News API: ${newsApiUrl.toString().replace(newsApiKey, "API_KEY_REDACTED")}`);
    
    // Make the request to the News API
    const response = await fetch(newsApiUrl.toString());
    
    // Get the response data
    const data = await response.json();
    
    // Log the response status
    console.log(`News API response status: ${response.status}`);
    
    // If we got an error response, log it clearly
    if (!response.ok) {
      console.error("News API error:", data);
    } else {
      console.log(`Retrieved ${data.articles?.length || 0} articles from News API`);
    }
    
    // Return the response from the News API
    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
        status: response.status
      }
    );
  } catch (error) {
    console.error("Error in newsapi-proxy:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred while proxying the request" }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
