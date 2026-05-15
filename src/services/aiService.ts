import { GoogleGenAI } from "@google/genai";

export enum AgentRole {
  TACTICIAN = "Tactician",
  HYPE_MASTER = "Hype Master",
  ANALYST = "Analyst",
}

interface AgentInsight {
  role: AgentRole;
  text: string;
}

export async function orchestrateInsights(matchData: any, sentimentHistory: any[]): Promise<AgentInsight[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `
    You are the 'Multi-Agent Orchestrator' for a live Indian Super League (ISL) football match.
    Match: ${matchData.homeTeam.name} vs ${matchData.awayTeam.name} (${matchData.clock})
    Recent Intensity Pattern: ${sentimentHistory.slice(-5).map(h => h.pulse).join(", ")}
    Recent Events: ${matchData.timeline?.slice(0, 3).map((e: any) => e.description).join(" | ")}
    
    Synthesize 3 distinct insights from these personas, with an awareness of Indian football patterns (e.g., Salt Lake atmosphere, counter-press efficiency):
    1. The Tactician: Focuses on formation, pressure, and strategic shifts.
    2. The Hype Master: Focuses on fan excitement, atmosphere, and "clutch" moments.
    3. The Analyst: Focuses on data trends, ball speed, and efficiency.

    Return as a JSON array of objects: [{ "role": "Tactician", "text": "..." }, { "role": "Hype Master", "text": "..." }, { "role": "Analyst", "text": "..." }]
    Be extremely concise (max 12 words per agent).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (err) {
    console.error("Orchestration error:", err);
    return [
      { role: AgentRole.TACTICIAN, text: "Holding tactical shape. Low volatility." },
      { role: AgentRole.HYPE_MASTER, text: "Stadium tension building. Fans on edge." },
      { role: AgentRole.ANALYST, text: "Possession cycles stabilizing." },
    ];
  }
}
