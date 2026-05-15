/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Match, MatchStatus, EventType } from '../types/match';

const MOCK_MATCH: Match = {
  id: 'm1',
  competition: 'Indian Super League',
  status: MatchStatus.LIVE,
  venue: 'Salt Lake Stadium, Kolkata',
  homeTeam: {
    id: 'h1',
    name: 'Mohun Bagan SG',
    shortName: 'MBSG',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/Mohun_Bagan_SG_logo.svg/300px-Mohun_Bagan_SG_logo.svg.png',
    score: 2,
  },
  awayTeam: {
    id: 'a1',
    name: 'East Bengal FC',
    shortName: 'EBFC',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/be/East_Bengal_FC_logo.svg/300px-East_Bengal_FC_logo.svg.png',
    score: 1,
  },
  clock: "68'",
  timeline: [
    {
      id: 'e1',
      type: EventType.GOAL,
      minute: 24,
      description: 'Goal! Liston Colaco scores a world-class curler for Mohun Bagan!',
      teamId: 'h1',
      playerName: 'Liston Colaco',
      aiInsight: 'MBSG utilizing the width of the Salt Lake pitch to stretch East Bengal.'
    },
    {
      id: 'e2',
      type: EventType.YELLOW_CARD,
      minute: 42,
      description: 'Yellow card for Saul Crespo after a heated challenge.',
      teamId: 'a1',
      playerName: 'Saul Crespo',
    },
    {
      id: 'e3',
      type: EventType.GOAL,
      minute: 58,
      description: 'Goal! Cleiton Silva equalizes for East Bengal with a clinical header.',
      teamId: 'a1',
      playerName: 'Cleiton Silva',
    }
  ],
  activePoll: {
    id: 'p1',
    question: 'Who will dominate the final 20 minutes of the Derby?',
    isActive: true,
    options: [
      { id: '1', text: 'Mariners (MBSG)', votes: 8400 },
      { id: '2', text: 'Red & Gold (EBFC)', votes: 7200 },
      { id: '3', text: 'Draw looks likely', votes: 1200 }
    ]
  }
};

export function useMatchData() {
  const [match, setMatch] = useState<Match>(MOCK_MATCH);
  const [lastEventId, setLastEventId] = useState<string | null>(null);
  const [sentimentHistory, setSentimentHistory] = useState<{ time: string; pulse: number }[]>(() => {
    // Pre-populate with some historical data
    const now = Date.now();
    return Array.from({ length: 15 }, (_, i) => {
      const time = new Date(now - (15 - i) * 3000);
      return {
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        pulse: 30 + Math.random() * 20
      };
    });
  });

  useEffect(() => {
    console.log("Connecting to match stream...");
    const eventSource = new EventSource('/api/match/stream');

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        console.log("SSE update received:", payload);

        if (payload.type === "MATCH_UPDATE") {
          setMatch(payload.data);
          
          // Check for new events to trigger spikes
          const newestPlayerEvent = payload.data.timeline[0];
          if (newestPlayerEvent && newestPlayerEvent.id !== lastEventId) {
            setLastEventId(newestPlayerEvent.id);
            // Auto-spike on any new event
            triggerSpike(70 + Math.random() * 20);
          }
        } 
        else if (payload.type === "PULSE_SPIKE") {
          triggerSpike(payload.intensity);
        }
      } catch (err) {
        console.error("Error parsing SSE data:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection error:", err);
      eventSource.close();
      // Simple reconnect logic
      setTimeout(() => {
         window.location.reload(); // Hard refresh to reset state on stream failure
      }, 5000);
    };

    function triggerSpike(intensity: number) {
      setSentimentHistory(prev => {
        const newPoint = { 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
          pulse: intensity 
        };
        return [...prev, newPoint].slice(-20);
      });
    }

    // Gentle decay background loop
    const decayInterval = setInterval(() => {
      setSentimentHistory(prev => {
        const last = prev[prev.length - 1]?.pulse || 40;
        // Natural decay towards 40-50 range
        const target = 45;
        const diff = target - last;
        const next = last + (diff * 0.1) + (Math.random() - 0.5) * 5;
        const newPoint = { 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
          pulse: Math.max(10, Math.min(100, next)) 
        };
        return [...prev, newPoint].slice(-20);
      });
    }, 3000);

    return () => {
      eventSource.close();
      clearInterval(decayInterval);
    };
  }, [lastEventId]);

  return { match, sentimentHistory };
}
