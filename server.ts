import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Match, MatchStatus, EventType, FanMission } from "./src/types/match";
import dotenv from "dotenv";

dotenv.config();

console.log("Starting server process...");

const app = express();
const PORT = 3000;

// API-Football Integration
const FOOTBALL_API_URL = "https://v3.football.api-sports.io";

function generateMission(match: Match): FanMission | undefined {
  const lastEvent = match.timeline[0];
  if (!lastEvent) return undefined;

  if (lastEvent.type === EventType.GOAL) {
    return {
      id: `m-goal-${Date.now()}`,
      title: "Hero Moment Analysis",
      description: "Match intensity is soaring! Will the conceding team strike back before the next hydration break?",
      type: "PREDICTION",
      options: ["Equalizer Soon", "Defense Collapses", "Stalemate"],
      reward: "100 Fan Points + Badge"
    };
  }

  if (lastEvent.type === EventType.RED_CARD) {
    return {
      id: `m-red-${Date.now()}`,
      title: "Tactical Crisis",
      description: "A red card in the ISL! How should the coach adjust the defensive block?",
      type: "TACTICAL",
      options: ["Compact 4-4-1", "High-Line Risk", "Defensive Shield"],
      reward: "50 XP + Tactician Rank"
    };
  }

  // Default mission if none specifically triggered but match is live
  if (match.status === MatchStatus.LIVE && Math.random() > 0.8) {
    return {
      id: `m-tactical-${Date.now()}`,
      title: "Tactical Overload",
      description: "Opposition is pinning our fullbacks. Should we switch to a 3-5-2 to control the mid-field?",
      type: "TACTICAL",
      options: ["Switch to 3-5-2", "Stay Compact", "High Press"],
      reward: "150 Fan Points + Tactician Rank"
    };
  }

  return undefined;
}

// Check for fetch (Node 18+)
const fetchRef = (globalThis as any).fetch;
if (!fetchRef) {
  console.error("CRITICAL: fetch is not defined.");
}

async function fetchLiveMatch(): Promise<Match | null> {
  const currentKey = process.env.FOOTBALL_API_KEY;
  if (!currentKey) {
    console.error("FOOTBALL_API_KEY environment variable is not set.");
    return null;
  }

  const commonHeaders = {
    "x-rapidapi-key": currentKey,
    "x-rapidapi-host": "v3.football.api-sports.io"
  };

  try {
    // 1. Fetch all Live Fixtures first
    console.log("Fetching live fixtures from API-Sports...");
    let response = await fetch(`${FOOTBALL_API_URL}/fixtures?live=all`, {
      headers: commonHeaders,
      signal: AbortSignal.timeout(5000)
    });
    let data = await response.json();
    
    // Prioritize ISL (ID: 323) or I-League (ID: 324)
    let fixtureData = data.response?.find((f: any) => f.league.id === 323 || f.league.country === "India");

    // 2. If no live Indian matches, fetch today's ISL fixtures specifically
    if (!fixtureData) {
      console.log("No live Indian matches, checking ISL schedule for today...");
      const today = new Date().toISOString().split('T')[0];
      response = await fetch(`${FOOTBALL_API_URL}/fixtures?league=323&season=2024&date=${today}`, {
        headers: commonHeaders,
        signal: AbortSignal.timeout(5000)
      });
      data = await response.json();
      
      if (!data.response || data.response.length === 0) {
         response = await fetch(`${FOOTBALL_API_URL}/fixtures?date=${today}`, {
           headers: commonHeaders,
           signal: AbortSignal.timeout(5000)
         });
         data = await response.json();
         fixtureData = data.response?.find((f: any) => f.league.country === "India") || data.response?.[0];
      } else {
         fixtureData = data.response[0];
      }
    }

    if (!fixtureData) {
      console.log("No relevant ISL or Indian fixtures found for today.");
      return null;
    }

    const fixtureId = fixtureData.fixture.id;
    const [statsRes, eventsRes] = await Promise.all([
      fetch(`${FOOTBALL_API_URL}/fixtures/statistics?fixture=${fixtureId}`, {
        headers: commonHeaders,
        signal: AbortSignal.timeout(5000)
      }),
      fetch(`${FOOTBALL_API_URL}/fixtures/events?fixture=${fixtureId}`, {
        headers: commonHeaders,
        signal: AbortSignal.timeout(5000)
      })
    ]);

    const statsData = await statsRes.json();
    const eventsData = await eventsRes.json();

    const rawStats = statsData.response || [];
    const getStat = (teamIdx: number, type: string) => {
      const teamStats = rawStats[teamIdx]?.statistics || [];
      return teamStats.find((s: any) => s.type === type)?.value || 0;
    };

    const match: Match = {
      id: fixtureId.toString(),
      competition: "Indian Super League",
      status: fixtureData.fixture.status.short === "FT" ? MatchStatus.POST_MATCH : MatchStatus.LIVE,
      venue: fixtureData.fixture.venue.name || "Salt Lake Stadium",
      homeTeam: {
        id: fixtureData.teams.home.id.toString(),
        name: fixtureData.teams.home.name,
        shortName: fixtureData.teams.home.name.substring(0, 3).toUpperCase(),
        logoUrl: fixtureData.teams.home.logo,
        score: fixtureData.goals.home ?? 0,
      },
      awayTeam: {
        id: fixtureData.teams.away.id.toString(),
        name: fixtureData.teams.away.name,
        shortName: fixtureData.teams.away.name.substring(0, 3).toUpperCase(),
        logoUrl: fixtureData.teams.away.logo,
        score: fixtureData.goals.away ?? 0,
      },
      clock: fixtureData.fixture.status.elapsed ? `${fixtureData.fixture.status.elapsed}'` : "FT",
      timeline: (eventsData.response || []).map((e: any, idx: number) => ({
        id: `e-${idx}`,
        type: e.type === "Goal" ? EventType.GOAL : 
              e.detail.includes("Card") ? (e.detail.includes("Red") ? EventType.RED_CARD : EventType.YELLOW_CARD) :
              e.type === "subst" ? EventType.SUBSTITUTION : EventType.MOMENT_OF_INTEREST,
        minute: e.time.elapsed,
        description: `${e.player.name} (${e.team.name}): ${e.detail || e.type}`,
        teamId: e.team.id.toString(),
        playerName: e.player.name,
      })).reverse(),
      activePoll: {
        id: `p-${fixtureId}`,
        question: `Who is dominating the tactical transition at ${fixtureData.fixture.status.elapsed}'?`,
        isActive: true,
        options: [
          { id: '1', text: fixtureData.teams.home.name, votes: 1240 },
          { id: '2', text: fixtureData.teams.away.name, votes: 980 },
          { id: '3', text: 'Stalemate', votes: 450 }
        ]
      }
    };

    match.activeMission = generateMission(match);

    const homePoss = getStat(0, 'Ball Possession') || "50%";
    const awayPoss = getStat(1, 'Ball Possession') || "50%";

    (match as any).liveStats = [
      { label: "Possession", home: homePoss, away: awayPoss },
      { label: "Shots on Goal", home: getStat(0, 'Shots on Goal') || 4, away: getStat(1, 'Shots on Goal') || 3 },
      { label: "Corners", home: getStat(0, 'Corner Kicks') || 2, away: getStat(1, 'Corner Kicks') || 2 },
      { label: "Fouls", home: getStat(0, 'Fouls') || 8, away: getStat(1, 'Fouls') || 7 },
    ];

    return match;
  } catch (error) {
    console.error("Error fetching live match details:", error);
    return null;
  }
}

// Global state for live tracking
let latestMatchData: Match | null = null;
let sseClients: any[] = [];

async function backgroundPoll() {
  console.log("--- Background Poll Started ---");
  const liveMatch = await fetchLiveMatch();
  
  if (liveMatch) {
    const hasChanged = !latestMatchData || 
                      latestMatchData.clock !== liveMatch.clock || 
                      latestMatchData.homeTeam.score !== liveMatch.homeTeam.score ||
                      latestMatchData.awayTeam.score !== liveMatch.awayTeam.score ||
                      latestMatchData.timeline.length !== liveMatch.timeline.length;

    if (hasChanged) {
      console.log("Match update detected! Broadcasting to SSE clients.");
      latestMatchData = liveMatch;
      broadcastUpdate({ type: "MATCH_UPDATE", data: liveMatch });
      
      const lastEvent = liveMatch.timeline[0];
      if (lastEvent) {
        if (lastEvent.type === EventType.GOAL || lastEvent.type === EventType.RED_CARD) {
          console.log("High-intensity event detected!");
          broadcastUpdate({ type: "PULSE_SPIKE", intensity: 95, event: lastEvent.description });
        }
      }
    }
  } else {
    if (latestMatchData && latestMatchData.status === MatchStatus.LIVE) {
        broadcastUpdate({ type: "HEARTBEAT", time: new Date().toISOString() });
    }
  }
}

function broadcastUpdate(payload: any) {
  sseClients.forEach(client => {
    client.res.write(`data: ${JSON.stringify(payload)}\n\n`);
  });
}

// Start background polling every 20 seconds
setInterval(backgroundPoll, 20000);

async function startServer() {
  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString(), nodeVersion: process.version });
  });

  // SSE Endpoint
  app.get("/api/match/stream", (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const clientId = Date.now();
    const newClient = { id: clientId, res };
    sseClients.push(newClient);

    // Send initial data if available
    if (latestMatchData) {
      res.write(`data: ${JSON.stringify({ type: "MATCH_UPDATE", data: latestMatchData })}\n\n`);
    }

    console.log(`SSE client connected: ${clientId}. Total: ${sseClients.length}`);

    req.on('close', () => {
      console.log(`SSE client disconnected: ${clientId}`);
      sseClients = sseClients.filter(c => c.id !== clientId);
    });
  });

  app.get("/api/match/live", async (req, res) => {
    console.log(`[${new Date().toISOString()}] Request: /api/match/live`);
    try {
      const liveMatch = await fetchLiveMatch();
      if (liveMatch) {
        res.json(liveMatch);
      } else {
        res.status(404).json({ error: "No live matches found or API key missing" });
      }
    } catch (err) {
      console.error("API Route Error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Initializing Vite dev server middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`>>> Server ready on port ${PORT}`);
  });

  server.on('error', (err) => {
    console.error("Server listen error:", err);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
