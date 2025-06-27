
export async function generateImageWithOpenAI(prompt: string, apiKey: string): Promise<string> {
  console.log("Calling OpenAI API for character image generation with base64 format...");
  
  const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
      quality: "hd",
      style: "natural"
    })
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
