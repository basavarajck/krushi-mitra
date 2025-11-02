import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { FarmerProfile, ChatMessage, ActivityLog } from '../types';

// Lazily initialize to avoid crashing on load if API key is missing.
let ai: GoogleGenAI | null = null;
const getAi = () => {
  if (!ai) {
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      console.error("VITE_API_KEY environment variable not set. Please add it to your .env file.");
      return null;
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};


function fileToGenerativePart(base64: string, mimeType: string) {
  return {
    inlineData: {
      data: base64,
      mimeType
    },
  };
}

const buildSystemInstruction = (profile: FarmerProfile, activityLogs: ActivityLog[] = []) => {
  const recentActivities = activityLogs.slice(-5).map(log => `- On ${log.date}, action: ${log.activityType}, notes: ${log.notes}`).join('\n');

  return `You are "Krishi Mitra AI", an expert agricultural assistant for Indian farmers. Your goal is to provide **holistic and integrated advice** by synthesizing all available data points: the farmer's profile, their logged activities, real-time weather forecasts, market price trends, and available government schemes.
Your user is a farmer in India. You must communicate clearly and concisely. If the user communicates in Kannada, you MUST respond in Kannada.

**Farmer's Profile:**
- Name: ${profile.name}
- Location: ${profile.location}
- Land Size: ${profile.landSize} acres
- Main Crop: ${profile.mainCrop}
- Soil Type: ${profile.soilType}
- Irrigation Method: ${profile.irrigationMethod}

**Recent Farmer Activities (last 5):**
${recentActivities || "No recent activities logged."}

**Your Core Tasks:**
1.  **Synthesized Advisory:** Do not just provide siloed information. Combine data to give actionable advice. For example, if you see high pest risk and upcoming rain, advise: "Avoid spraying for pests today due to expected rain; a better window is in two days. Check your ${profile.mainCrop} crop for aphids as there are local reports."
2.  **Answer Questions:** Answer farming-related questions based on all context you have.
3.  **Activity Logging:** When the user mentions an activity, acknowledge it and confirm.
4.  **Disease Detection:** If an image of a plant is uploaded, analyze it for diseases or pests. Provide a diagnosis and suggest organic and chemical treatments.
5.  **Market & Scheme Info:** If asked about prices or schemes, provide concise, relevant information.
6.  **Contextual Reminders:** Base your reminders on logged activities. If they haven't logged irrigation in a while and the weather is dry, gently remind them.

Be a supportive, proactive, and empowering partner to the farmer.
`;
};

const API_KEY_ERROR_MESSAGE = "AI service is not configured. An API key is required.";
const API_KEY_ERROR_JSON = (message: string) => JSON.stringify({ error: message });


export const generateChatResponse = async (
  profile: FarmerProfile,
  history: ChatMessage[],
  newMessage: string,
  image?: { base64: string, mimeType: string }
): Promise<string> => {
  const ai = getAi();
  if (!ai) return API_KEY_ERROR_MESSAGE;

  const modelName = image ? 'gemini-2.5-flash-image' : 'gemini-2.5-flash';
  
  const activityLogs: ActivityLog[] = JSON.parse(localStorage.getItem('activityLogs') || '[]');
  const systemInstruction = buildSystemInstruction(profile, activityLogs);
  
  const contents: { role: string; parts: ({ text: string; } | { inlineData: { data: string; mimeType: string; }; })[] }[] = history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
  }));
  
  const userParts: ({ text: string } | { inlineData: { data: string; mimeType: string; } })[] = [{ text: newMessage }];
  if (image) {
      userParts.unshift(fileToGenerativePart(image.base64, image.mimeType));
  }
  contents.push({ role: 'user', parts: userParts });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
            topP: 0.95,
        }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating response from Gemini:", error);
    return "Sorry, I'm having trouble connecting to the AI service. Please check your connection or API key and try again.";
  }
};


export const getWeatherForecast = async (location: string): Promise<string> => {
    const ai = getAi();
    if (!ai) return API_KEY_ERROR_JSON(API_KEY_ERROR_MESSAGE);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Get the 5-day weather forecast for ${location}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        location: { type: Type.STRING },
                        forecast: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    day: { type: Type.STRING },
                                    temp_high: { type: Type.NUMBER },
                                    temp_low: { type: Type.NUMBER },
                                    condition: { type: Type.STRING },
                                    precipitation_chance: { type: Type.NUMBER },
                                },
                                required: ["day", "temp_high", "temp_low", "condition", "precipitation_chance"],
                            },
                        },
                    },
                    required: ["location", "forecast"],
                },
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching weather forecast:", error);
        return JSON.stringify({ error: "Could not fetch weather data." });
    }
};

export const getPriceTrends = async (crop: string, location: string): Promise<string> => {
    const ai = getAi();
    if (!ai) return API_KEY_ERROR_JSON(API_KEY_ERROR_MESSAGE);

    try {
        const today = new Date();
        const pastDate = new Date();
        pastDate.setDate(today.getDate() - 30);
        
        const prompt = `
        Analyze the market price for "${crop}" in the region of "${location}, India".
        Provide a realistic but simulated price trend analysis.
        - Generate historical data for the last 30 days, from ${pastDate.toISOString().split('T')[0]} to ${today.toISOString().split('T')[0]}.
        - Generate a price prediction for the next 7 days.
        - The price should be in INR per quintal.
        - Write a brief, one-paragraph summary of the trend and your prediction.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        crop: { type: Type.STRING },
                        location: { type: Type.STRING },
                        historical: {
                            type: Type.ARRAY,
                            description: "Last 30 days of price data.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
                                    price: { type: Type.NUMBER, description: "Price in INR per quintal" },
                                },
                                required: ["date", "price"],
                            },
                        },
                        predicted: {
                            type: Type.ARRAY,
                            description: "Next 7 days of predicted price data.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
                                    price: { type: Type.NUMBER, description: "Price in INR per quintal" },
                                },
                                required: ["date", "price"],
                            },
                        },
                        summary: {
                            type: Type.STRING,
                            description: "A brief summary of the price trend."
                        },
                    },
                    required: ["crop", "location", "historical", "predicted", "summary"],
                }
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching price trends:", error);
        return JSON.stringify({ error: "Could not fetch price trend data." });
    }
};

export const getSchemeReminders = async (profile: FarmerProfile): Promise<string> => {
    const ai = getAi();
    if (!ai) return API_KEY_ERROR_JSON(API_KEY_ERROR_MESSAGE);

    try {
        const prompt = `
        Based on the following farmer's profile, generate a list of 2-3 relevant (but simulated) Indian government agricultural schemes.
        - Location: ${profile.location}
        - Main Crop: ${profile.mainCrop}
        - Land Size: ${profile.landSize} acres
        - Irrigation: ${profile.irrigationMethod}
        
        Provide key details for each scheme: a brief description, general eligibility criteria, an upcoming application deadline (within the next 30-90 days), and a placeholder application link.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            schemeName: { type: Type.STRING },
                            description: { type: Type.STRING },
                            eligibility: { type: Type.STRING },
                            deadline: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
                            applicationLink: { type: Type.STRING, description: "A placeholder URL" },
                        },
                        required: ["schemeName", "description", "eligibility", "deadline", "applicationLink"],
                    }
                }
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching scheme reminders:", error);
        return JSON.stringify({ error: "Could not fetch scheme reminders." });
    }
};


export const getSmartAlerts = async (profile: FarmerProfile, activityLogs: ActivityLog[]): Promise<string> => {
    const ai = getAi();
    if (!ai) return API_KEY_ERROR_JSON(API_KEY_ERROR_MESSAGE);

    try {
        const recentActivities = activityLogs.slice(-5).map(log => `- On ${log.date}, action: ${log.activityType}, notes: ${log.notes}`).join('\n');
        const prompt = `
        You are an AI agricultural expert. Your task is to generate 3-4 smart, proactive alerts for a farmer based on their profile, recent activities, and simulated real-time data (weather, pests, market).
        
        **Farmer Profile:**
        - Location: ${profile.location}
        - Main Crop: ${profile.mainCrop}
        - Land Size: ${profile.landSize} acres
        - Irrigation: ${profile.irrigationMethod}

        **Recent Activities:**
        ${recentActivities || "No recent activities logged."}

        **Instructions:**
        1.  Analyze all the provided context.
        2.  Generate alerts that are timely, relevant, and actionable.
        3.  Consider potential upcoming issues (e.g., pest outbreak due to humidity, need for irrigation based on no recent activity and dry weather, market price fluctuations).
        4.  Assign a priority ('High', 'Medium', 'Low') to each alert.
        5.  Provide a clear title and a concise message for each alert.
        
        **Example alert:**
        - Title: "Pest Alert: Aphids"
        - Message: "High humidity and warm temperatures in your area increase the risk of an aphid outbreak on your ${profile.mainCrop} crop. Inspect the underside of leaves in the next 1-2 days."
        - Priority: "High"
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING, description: "A unique identifier, e.g., 'alert-1'" },
                            title: { type: Type.STRING },
                            message: { type: Type.STRING },
                            priority: { type: Type.STRING, description: "Can be 'High', 'Medium', or 'Low'" },
                            timestamp: { type: Type.STRING, description: "Current timestamp in ISO format" }
                        },
                        required: ["id", "title", "message", "priority", "timestamp"],
                    }
                }
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching smart alerts:", error);
        return JSON.stringify({ error: "Could not fetch smart alerts." });
    }
};