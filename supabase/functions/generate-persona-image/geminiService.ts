export async function generateImageWithGemini(prompt: string, apiKey: string): Promise<string> {
  console.log("Calling Gemini API for image generation...");
  
  const imageResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]  // Critical: parts array wrapper
        }]
      })
    }
  );
  
  if (!imageResponse.ok) {
    const errorText = await imageResponse.text();
    console.error("Gemini API error:", errorText);
    throw new Error(`Gemini API error: ${imageResponse.status} - ${errorText}`);
  }
  
  const result = await imageResponse.json();
  console.log("Gemini API response structure:", JSON.stringify(result, null, 2));
  
  const generatedImage = result.candidates?.[0]?.content?.parts?.find(
    (part: any) => part.inlineData
  )?.inlineData;

  if (!generatedImage?.data) {
    console.error("No image data in Gemini response:", result);
    throw new Error("No image data in Gemini response");
  }

  console.log("Successfully received base64 image from Gemini");
  return generatedImage.data; // Returns base64 string
}