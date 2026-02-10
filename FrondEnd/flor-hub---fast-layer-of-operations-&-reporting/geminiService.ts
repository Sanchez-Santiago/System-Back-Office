
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Initializing GoogleGenAI using a named parameter with process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getLogisticsInsights = async (salesData: string) => {
  try {
    // Fix: Using ai.models.generateContent to query GenAI directly.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analiza los siguientes datos de ventas y logística de telecomunicaciones y proporciona 3 sugerencias clave de optimización: ${salesData}. Devuelve un JSON con un array de sugerencias. Cada sugerencia debe tener un título y una descripción corta.`,
      config: {
        responseMimeType: 'application/json',
        // Fix: Use responseSchema for the expected JSON structure.
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: 'Título de la sugerencia.',
                  },
                  description: {
                    type: Type.STRING,
                    description: 'Descripción corta de la sugerencia.',
                  },
                },
                required: ["title", "description"],
              },
            },
          },
          required: ["suggestions"],
        },
      }
    });
    // Fix: Accessing the .text property directly (not a method).
    const text = response.text;
    return text ? JSON.parse(text) : { suggestions: [] };
  } catch (error) {
    console.error("Error fetching AI insights:", error);
    return { suggestions: [{ title: "Error", description: "No se pudieron obtener insights de IA." }] };
  }
};
