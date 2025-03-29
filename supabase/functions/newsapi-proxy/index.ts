
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request (CORS preflight)");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log(`Handling ${req.method} request to newsapi-proxy`);
    
    // Handle health check GET requests with no parameters (used for availability checks)
    if (req.method === "GET") {
      const url = new URL(req.url);
      
      // If no parameters provided, it's a health check
      if (url.searchParams.size === 0) {
        console.log("Handling health check GET request");
        
        // Check if the API key is available
        const newsApiKey = Deno.env.get("NEWS_API_KEY");
        const apiKeyStatus = newsApiKey ? "available" : "missing";
        
        return new Response(
          JSON.stringify({ 
            status: "ok", 
            message: "Edge Function is available",
            apiKeyStatus: apiKeyStatus
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
          }
        );
      }
    }
    
    let queryParams = {};
    
    // Process request based on HTTP method
    if (req.method === "POST") {
      try {
        // Log the start of the POST request processing
        console.log("Processing POST request");
        
        const requestText = await req.text();
        console.log("Raw POST request body:", requestText);
        
        if (!requestText || requestText.trim() === "") {
          console.error("Empty request body received");
          return new Response(
            JSON.stringify({ 
              status: "error", 
              message: "Empty request body received" 
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
        
        try {
          const requestBody = JSON.parse(requestText);
          console.log("Parsed POST request body:", JSON.stringify(requestBody));
          queryParams = requestBody;
        } catch (parseError) {
          console.error("Error parsing request body:", parseError);
          return new Response(
            JSON.stringify({ 
              status: "error", 
              message: "Invalid JSON format in request body" 
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
      } catch (bodyError) {
        console.error("Error reading request body:", bodyError);
        return new Response(
          JSON.stringify({ 
            status: "error", 
            message: "Error reading request body" 
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
    } else if (req.method === "GET" && req.url.includes("?")) {
      // Get URL with search parameters for GET requests
      const url = new URL(req.url);
      // Convert URLSearchParams to a regular object
      url.searchParams.forEach((value, key) => {
        queryParams[key] = value;
      });
      console.log("GET request params:", JSON.stringify(queryParams));
    } else if (req.method !== "GET") {
      return new Response(
        JSON.stringify({ status: "error", message: "Method not allowed" }),
        { 
          status: 405, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Extract parameters from query params or request body
    const query = queryParams.q || "";
    const from = queryParams.from || "";
    const sortBy = queryParams.sortBy || "relevancy";
    const language = queryParams.language || "en";
    const pageSize = queryParams.pageSize || "25";
    
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
    
    // Get API key from environment variable
    const newsApiKey = Deno.env.get("NEWS_API_KEY");
    if (!newsApiKey) {
      console.error("NEWS_API_KEY environment variable is not set");
      return new Response(
        JSON.stringify({ 
          status: "error", 
          message: "News API key is not configured on the server",
          code: "MISSING_API_KEY"
        }),
        { 
          status: 503,  // Service Unavailable is more appropriate than 500
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          } 
        }
      );
    }
    
    // Log the parameters being used
    console.log("Processing News API request with parameters:");
    console.log(`Query: "${query}"`);
    console.log(`From: ${from || 'not specified'}`);
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
    
    // Make the request to the News API with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(newsApiUrl.toString(), {
        signal: controller.signal,
        headers: {
          "User-Agent": "Supabase Function NewsAPI Proxy"
        }
      });
      clearTimeout(timeoutId);
      
      // Get the response data
      const responseText = await response.text();
      console.log(`News API raw response: ${responseText.substring(0, 200)}...`);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error("Error parsing News API response:", jsonError);
        return new Response(
          JSON.stringify({ 
            status: "error", 
            message: "Failed to parse response from News API" 
          }),
          { 
            status: 500, 
            headers: { 
              ...corsHeaders, 
              "Content-Type": "application/json" 
            } 
          }
        );
      }
      
      // Log the response status
      console.log(`News API response status: ${response.status}`);
      
      // If we got an error response, log it clearly
      if (!response.ok) {
        console.error("News API error:", JSON.stringify(data));
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
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("Error fetching from News API:", fetchError);
      
      return new Response(
        JSON.stringify({ 
          status: "error", 
          message: fetchError.name === "AbortError" 
            ? "Request to News API timed out" 
            : `Error fetching from News API: ${fetchError.message}` 
        }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          } 
        }
      );
    }
  } catch (error) {
    console.error("Unhandled error in newsapi-proxy:", error);
    
    return new Response(
      JSON.stringify({ 
        status: "error", 
        message: error.message || "An error occurred while proxying the request" 
      }),
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
