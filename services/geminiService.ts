import { GoogleGenAI } from "@google/genai";
import { GenerationSettings } from "../types";

// Helper to determine the correct model based on settings
const getModelStrategy = (settings: GenerationSettings) => {
  // Upgrade to Pro if high resolution is requested OR grounding is enabled
  const needsPro = settings.resolution !== '1K' || settings.useGrounding;
  
  return {
    model: needsPro ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image',
    needsPaidKey: needsPro
  };
};

export const generateImages = async (settings: GenerationSettings): Promise<string[]> => {
  const strategy = getModelStrategy(settings);
  
  // Handle API Key selection for Pro features
  if (strategy.needsPaidKey) {
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        const success = await window.aistudio.openSelectKey();
        // We must assume success or the user cancelled. If they cancelled, the next call will fail, handled by try/catch in UI.
      }
    }
    // When using the interactive key selection, the key is injected into the environment usually, 
    // or we re-instantiate the client to pick it up if the environment was updated by the platform.
    // For this snippet, we assume process.env.API_KEY is managed or updated by the platform shell.
  }

  // Create a new instance to ensure we have the latest key if it was just selected
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare config
  const config: any = {
    generationConfig: {
      temperature: settings.temperature,
    },
    imageConfig: {
      aspectRatio: settings.aspectRatio,
    }
  };

  // Add resolution (imageSize) only if using Pro model
  if (strategy.model === 'gemini-3-pro-image-preview') {
    config.imageConfig.imageSize = settings.resolution;
  }

  // Add grounding only if enabled and using Pro model (redundant check but safe)
  if (settings.useGrounding && strategy.model === 'gemini-3-pro-image-preview') {
    config.tools = [{ googleSearch: {} }];
  }

  // Construct parts
  const parts: any[] = [];
  if (settings.referenceImage) {
      const base64Data = settings.referenceImage.data.includes('base64,') 
          ? settings.referenceImage.data.split('base64,')[1] 
          : settings.referenceImage.data;
      
      parts.push({
          inlineData: {
              data: base64Data,
              mimeType: settings.referenceImage.mimeType
          }
      });
  }
  parts.push({ text: settings.prompt });

  // Parallel requests for multiple images
  const requests = Array.from({ length: settings.numberOfImages }).map(async () => {
    try {
      const response = await ai.models.generateContent({
        model: strategy.model,
        contents: { parts },
        config: config
      });

      // Extract image
      const responseParts = response.candidates?.[0]?.content?.parts;
      if (!responseParts) throw new Error("No content generated");

      for (const part of responseParts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image data found in response");
    } catch (err: any) {
      console.error("Individual generation failed", err);
      throw err;
    }
  });

  const results = await Promise.all(requests);
  return results;
};