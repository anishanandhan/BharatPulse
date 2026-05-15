/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, Volume2, VolumeX, Loader2, Play, Zap } from "lucide-react";
import { Match, MatchEvent, EventType } from "../../types/match";
import { generateAudioCommentary } from "../../services/geminiService";
import { playPCM } from "../../lib/utils";

interface LiveCommentaryProps {
  match: Match;
  intensity: number;
}

export function LiveCommentary({ match, intensity }: LiveCommentaryProps) {
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [latestCommentary, setLatestCommentary] = useState<string | null>(null);
  const [lastEventId, setLastEventId] = useState<string | null>(null);
  const lastFetchRef = useRef<number>(0);

  const mode = intensity > 20 ? 'CROWD HYPE' : 'ANALYST';

  const getCommentary = async (event: MatchEvent) => {
    const now = Date.now();
    if (now - lastFetchRef.current < 60000) return;
    lastFetchRef.current = now;

    setIsGenerating(true);
    try {
      const { audio, text } = await generateAudioCommentary(match, event, mode);
      setLatestCommentary(text);
      if (isListening) {
        await playPCM(audio);
      }
    } catch (err) {
      console.error("Failed to get commentary:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Automatically trigger commentary on new significant events if listening
  useEffect(() => {
    const handleDemo = (e: any) => {
      const type = e.detail;
      const mockEvent: MatchEvent = {
        id: `demo-${Date.now()}`,
        type: type === 'GOAL' ? EventType.GOAL : EventType.RED_CARD,
        minute: 75,
        description: type === 'GOAL' ? 'Incredible goal! The stadium has erupted!' : 'A straight red card for a dangerous high boot!',
        teamId: 'h1',
        playerName: 'Demo Player'
      };
      getCommentary(mockEvent);
    };

    window.addEventListener('demo-action', handleDemo);
    return () => window.removeEventListener('demo-action', handleDemo);
  }, []);

  useEffect(() => {
    const latestEvent = match.timeline[0];
    if (latestEvent && latestEvent.id !== lastEventId) {
      setLastEventId(latestEvent.id);
      if (isListening) {
        getCommentary(latestEvent);
      }
    }
  }, [match.timeline, isListening, lastEventId]);

  return (
    <div className="border border-white/10 stark-card p-8 flex flex-col gap-8" id="live-audio-commentary">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="mono-meta italic text-blue-500">Multimodal Commentary</span>
            <div className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.2em] border ${mode === 'CROWD HYPE' ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-blue-500/10 border-blue-500/50 text-blue-400'}`}>
               {mode} MODE
            </div>
          </div>
          <h3 className="text-3xl bold-heading italic">AI Voice Stream</h3>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              const event = match.timeline[0];
              if (event) getCommentary(event);
            }}
            className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/20 hover:border-blue-500/50 hover:text-blue-500 transition-all font-black uppercase italic text-[10px]"
          >
            <Zap className="w-3 h-3 fill-current" />
            Test Comm
          </button>
          <button 
            onClick={() => setIsListening(!isListening)}
            className={`flex items-center gap-3 px-6 py-3 rounded-none font-black italic uppercase transition-all border-2 ${
              isListening 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'border-white/20 text-white/50 hover:border-white'
            }`}
          >
            {isListening ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            {isListening ? 'Stream Active' : 'Enable Commentary'}
          </button>
        </div>
      </div>

      <div className="relative min-h-[160px] border-2 border-white/5 bg-white/2 p-8 flex flex-col justify-center items-center group">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex gap-1 items-end h-8">
                 {[...Array(5)].map((_, i) => (
                   <motion.div 
                    key={i}
                    animate={{ height: [10, 30, 10] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                    className="w-1.5 bg-blue-500"
                   />
                 ))}
              </div>
              <span className="mono-meta animate-pulse text-blue-500 uppercase font-black tracking-widest">Synthesizing live reaction...</span>
            </motion.div>
          ) : latestCommentary ? (
            <motion.div 
              key="content"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Mic className={`w-4 h-4 ${mode === 'CROWD HYPE' ? 'text-red-500' : 'text-blue-500'}`} />
                <span className="mono-meta">Live Narrator: Puck ({mode})</span>
              </div>
              <p className="text-xl font-bold tracking-tight italic text-white leading-relaxed">
                "{latestCommentary}"
              </p>
              {!isListening && (
                <button 
                  onClick={() => {
                    const event = match.timeline[0];
                    if (event) getCommentary(event);
                  }}
                  className="mt-6 flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span className="bold-heading text-sm">Re-play Moment</span>
                </button>
              )}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center gap-4 opacity-30 italic">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-blue-500 rounded-full"
                  />
                  <Mic className="w-8 h-8 text-blue-500 relative z-10" />
                </div>
                <p className="text-center font-bold animate-pulse text-white/50">Commentary Agent Listening...</p>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                      className="w-1.5 h-1.5 bg-blue-500/30 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Visualizer effect when active */}
        {isListening && !isGenerating && (
          <div className="absolute bottom-0 left-0 right-0 h-1 flex items-end justify-center gap-1">
            {[...Array(20)].map((_, i) => (
              <motion.div 
                key={i}
                animate={{ height: [4, Math.random() * 24 + 4, 4] }}
                transition={{ repeat: Infinity, duration: 0.5 + Math.random(), ease: "easeInOut" }}
                className={`w-1 ${mode === 'CROWD HYPE' ? 'bg-red-500/50' : 'bg-blue-500/30'}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
        <div className="flex flex-col gap-2">
          <span className="mono-meta">Active Modality</span>
          <span className="bold-heading italic flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Live Audio
          </span>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <span className="mono-meta">Latency</span>
          <span className="bold-heading italic text-blue-500">~1.2s</span>
        </div>
      </div>
    </div>
  );
}
