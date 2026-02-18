import { GoogleGenAI } from "@google/genai";
import { FarmerProfile } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeImageForVerification = async (base64Data: string, mimeType: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: 'Analyze this image for a product marketplace. 1. Identify the object. 2. Does it appear to be a high-quality, authentic product photo or a generic stock image/low-quality fake? 3. Estimate a confidence score (0-100%) for listing approval. Format as JSON: { "object": string, "qualityAnalysis": string, "confidenceScore": number, "isSuspicious": boolean }',
          },
        ],
      },
    });
    const jsonStr = response.text?.replace(/```json|```/g, '').trim() || '{}';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Image Analysis Failed:", error);
    throw error;
  }
};

export const moderateListingContent = async (title: string, description: string, imageBase64: string, mimeType: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            text: `Analyze this marketplace listing for policy violations. Policies: No banned keywords (weapons, drugs, counterfeit items), no inappropriate content, no personal contact information (phone numbers, emails), no links to external websites.
            Title: "${title}"
            Description: "${description}"
            Analyze the attached image for inappropriate content.
            Respond in JSON format only: { "isApproved": boolean, "reason": "concise reason for rejection or 'Approved' if ok" }`
          },
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
        ],
      },
    });
    const jsonStr = response.text?.replace(/```json|```/g, '').trim() || '{"isApproved": false, "reason": "AI moderation failed."}';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Moderation Failed:", error);
    return { isApproved: false, reason: "Could not connect to the moderation service. Please try again." };
  }
};

export const generateProductDescription = async (title: string, category: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a professional, sales-oriented product description for a "${title}" in the "${category}" category. Keep it under 50 words. Focus on value and quality.`,
    });
    return response.text ?? "Could not generate description at this time.";
  } catch (error) {
    console.error("Gemini Text Generation Failed:", error);
    return "Could not generate description at this time.";
  }
};

export const chatWithAssistant = async (message: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: message,
            config: {
                systemInstruction: "You are a helpful assistant for Pambo, a digital marketplace in Kenya. Answer the user's question about buying, selling, wholesale, or M-Pesa payments. Keep it brief and helpful.",
            }
        });
        return response.text ?? "I am currently experiencing high traffic. Please try again later.";
    } catch (error) {
        console.error("Gemini Chat Failed", error);
        return "I am currently experiencing high traffic. Please try again later.";
    }
}

export const generateDeliveryInsight = async (
  farmer: FarmerProfile,
  buyerLocation: { lat: number; lng: number },
  fuelRate: number,
  baseFee: number
): Promise<string> => {
  try {
    const prompt = `Generate a concise delivery insight for a buyer wanting to source ${farmer.crop} from a farmer in ${farmer.location}, which is ${farmer.distance}km away. The buyer's location is near coordinates ${buyerLocation.lat}, ${buyerLocation.lng}. The general region is rural/semi-rural Kenya.
    Consider common, affordable transport methods: 'boda boda' (motorcycle taxi) for short distances (under 30km) and small loads, or a 'Probox'/'pickup truck' for longer distances or bulk transport.
    Provide a rough cost estimate. The formula should factor in a base fee of KES ${baseFee} plus a per-km rate of KES ${fuelRate}. The final cost can be a range.
    
    Format the response as a single, friendly, and helpful string of about 2-3 sentences. Do not use JSON or markdown.
    
    Example for a short distance: "For a ${farmer.distance}km trip to get ${farmer.crop}, a boda boda would be quick and affordable. Expect delivery in about 1-2 hours, costing around KES [calculated cost range]."
    Example for a longer distance: "Transporting ${farmer.crop} over ${farmer.distance}km would likely require a Probox or small pickup. This might take 3-4 hours and cost approximately KES [calculated cost range], depending on road conditions."`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text ?? "Could not generate delivery insight at this time.";

  } catch (error) {
    console.error("Gemini Delivery Insight Generation Failed:", error);
    throw error;
  }
};