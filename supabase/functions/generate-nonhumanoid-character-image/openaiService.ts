
export async function generateImageWithOpenAI(
  prompt: string, 
  apiKey: string, 
  customParams?: any
): Promise<string> {
  console.log("Calling OpenAI API for non-humanoid character image generation with base64 format...");
  
  const defaultParams = {
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: "1024x1024",
    response_format: "b64_json",
    quality: "hd",
    style: "natural"
  };
  
  // Merge custom parameters with defaults
  const params = { ...defaultParams, ...customParams, prompt };
  
  console.log("OpenAI parameters:", params);
  
  const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(params)
  });
  
  if (!imageResponse.ok) {
    const errorText = await imageResponse.text();
    console.error("OpenAI API error:", errorText);
    throw new Error(`OpenAI API error: ${imageResponse.status}`);
  }
  
  const imageData = await imageResponse.json();
  
  if (!imageData.data || !imageData.data[0] || !imageData.data[0].b64_json) {
    throw new Error("Invalid response from OpenAI image generation");
  }
  
  const base64Image = imageData.data[0].b64_json;
  console.log("Successfully received base64 image from OpenAI");
  
  return base64Image;
}
