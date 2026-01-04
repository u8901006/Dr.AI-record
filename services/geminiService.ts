import { GoogleGenAI, Schema, Type } from "@google/genai";
import { ConsultationData } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

// Using gemini-2.0-flash-exp as it currently supports the best audio-to-text + reasoning capabilities on AI Studio.
// If strictly limited by the prompt's model list for "Text Tasks", we would use 'gemini-3-flash-preview', 
// but for Audio handling, 2.0 Flash Exp is the robust choice for this specific use case.
// We will use 'gemini-2.0-flash-exp' to ensure the audio processing works correctly.
const MODEL_NAME = "gemini-2.0-flash-exp"; 

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    transcript: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          speaker: { type: Type.STRING, enum: ["Doctor", "Patient", "Patient Side", "Other"] },
          timestamp: { type: Type.STRING },
          text: { type: Type.STRING },
          confidence: { type: Type.NUMBER }
        },
        required: ["speaker", "text"]
      }
    },
    soap: {
      type: Type.OBJECT,
      properties: {
        chief_complaint: { type: Type.STRING },
        hpi: { type: Type.STRING },
        ros: { type: Type.STRING },
        pmh: { type: Type.STRING },
        medications: { type: Type.STRING },
        allergies: { type: Type.STRING },
        physical_exam: { type: Type.STRING },
        assessment: { type: Type.STRING },
        plan: { type: Type.STRING }
      },
      required: ["chief_complaint", "hpi", "assessment", "plan"]
    },
    flags: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          field: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["contradiction", "low_confidence", "missing_info"] },
          content: { type: Type.STRING },
          reason: { type: Type.STRING }
        }
      }
    }
  },
  required: ["transcript", "soap"]
};

export const generateConsultationData = async (audioBlob: Blob): Promise<ConsultationData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is set.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Convert Blob to Base64
  const base64Audio = await blobToBase64(audioBlob);

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: audioBlob.type || "audio/wav",
              data: base64Audio
            }
          },
          {
            text: "Please analyze this consultation audio."
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // Low temperature for factual accuracy
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const data = JSON.parse(text) as ConsultationData;
    return data;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the Data-URL declaration (e.g. "data:audio/wav;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
