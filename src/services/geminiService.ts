import { GoogleGenAI, Modality } from "@google/genai";
import { Match, MatchEvent } from "../types/match";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getTacticalInsight(match: Match, recentEvent: MatchEvent): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `You are a high-level sports tactical analyst. 
      Analyze this specific moment in the ISL match: ${recentEvent.description} at ${recentEvent.minute}'.
      Match Context: ${match.homeTeam.name} vs ${match.awayTeam.name} (${match.competition}). 
      Score: ${match.homeTeam.score} - ${match.awayTeam.score}.
      
      Provide a concise (max 2 sentences) tactical insight. Why does this matter for the momentum?`,
      config: {
        systemInstruction: "Be precise, analytical, and professional. Focus on tactical implications.",
        temperature: 0.7,
      },
    });

    return response.text || "Insight unavailable at this moment.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Tactical analysis is currently offline.";
  }
}

export async function generateAudioCommentary(match: Match, event: MatchEvent, mode: 'CROWD HYPE' | 'ANALYST' = 'ANALYST'): Promise<{ audio: string; text: string }> {
  try {
    const prompt = mode === 'CROWD HYPE' 
      ? `Narrate this sports moment with absolute maximum intensity and raw fan energy. Use short, punchy sentences. The crowd is going wild!
         Event: ${event.description} at minute ${event.minute}.
         Match: ${match.homeTeam.name} vs ${match.awayTeam.name}.
         Score: ${match.homeTeam.score}-${match.awayTeam.score}.`
      : `Provide a sophisticated, tactical audio commentary for this match event. Focus on positional transitions and technical execution.
         Event: ${event.description} at minute ${event.minute}.
         Match: ${match.homeTeam.name} vs ${match.awayTeam.name}.
         Score: ${match.homeTeam.score}-${match.awayTeam.score}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Puck' }, // Puck is energetic/narrative
          },
        },
      },
    });

    const audio = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data || "";
    const text = response.text || "Generating commentary...";

    return { audio, text };
  } catch (error) {
    console.error("Commentary Generation Error:", error);
    throw error;
  }
}
