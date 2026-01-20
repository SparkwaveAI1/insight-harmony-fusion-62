export async function generateImageWithGemini(prompt: string, apiKey: string): Promise<string> {
  // Use Lovable AI Gateway instead of direct Google API (bypasses geographic restrictions)
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }
  
  console.log("Calling Lovable AI Gateway for image generation...");
  
  const imageResponse = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        modalities: ["image", "text"]
      })
    }
  );
  
  if (!imageResponse.ok) {
    const errorText = await imageResponse.text();
    console.error("Lovable AI Gateway error:", errorText);
    throw new Error(`Lovable AI Gateway error: ${imageResponse.status} - ${errorText}`);
  }
  
  const result = await imageResponse.json();
  console.log("Lovable AI Gateway response received");

  // Extract base64 image from the gateway response format
  const imageData = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  
  if (!imageData) {
    const textResponse = result.choices?.[0]?.message?.content;
    if (textResponse) {
      console.error("Gateway returned text instead of image:", textResponse);
      throw new Error(`Image generation refused: ${textResponse.substring(0, 200)}`);
    }
    console.error("No image data in gateway response:", JSON.stringify(result, null, 2));
    throw new Error("No image data in gateway response");
  }

  // The gateway returns data:image/png;base64,... format - extract just the base64 part
  const base64Match = imageData.match(/^data:image\/[^;]+;base64,(.+)$/);
  if (base64Match) {
    console.log("Successfully received base64 image from Lovable AI Gateway");
    return base64Match[1];
  }
  
  // If it's already raw base64, return as-is
  console.log("Successfully received base64 image from Lovable AI Gateway");
  return imageData;
}