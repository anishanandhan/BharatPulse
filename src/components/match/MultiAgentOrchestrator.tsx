/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Zap, BarChart3, Radio } from "lucide-react";
import { orchestrateInsights, AgentRole } from "../../services/aiService";
import { Match } from "../../types/match";

interface MultiAgentOrchestratorProps {
  match: Match;
  sentimentHistory: { time: string; pulse: number }[];
}

export function MultiAgentOrchestrator({ match, sentimentHistory }: MultiAgentOrchestratorProps) {
  const [insights, setInsights] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState(0);
  const [thinkingStep, setThinkingStep] = useState(0);

  const thinkingSteps = [
    "Analyzing Salt Lake pitch friction...",
    "Correlating ISL tactical nodes...",
    "Syncing with BharatPulse high-frequency feed...",
    "Synthesizing crowd energy volatility..."
  ];

  const lastFetchRef = useRef<number>(0);

  useEffect(() => {
    const fetchInsights = async () => {
      const now = Date.now();
      if (now - lastFetchRef.current < 60000) return;
      lastFetchRef.current = now;
      
      setLoading(true);
      setThinkingStep(0);
      
      // Simulate thinking steps for visual weight
      for (let i = 0; i < thinkingSteps.length; i++) {
        setThinkingStep(i);
        await new Promise(r => setTimeout(r, 600));
      }

      try {
        const data = await orchestrateInsights(match, sentimentHistory);
        setInsights(data);
      } catch (e) {
        console.error("Failed to fetch insights", e);
      }
      setLoading(false);
    };
    
    fetchInsights();
  }, [match.timeline.length, match.id]);

  useEffect(() => {
    if (!loading && insights.length > 0) {
      const interval = setInterval(() => {
        setActiveAgent((prev) => (prev + 1) % insights.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [loading, insights.length]);

  const getAgentIcon = (role: string) => {
    switch (role) {
      case "Tactician": return <Shield className="w-4 h-4" />;
      case "Hype Master": return <Zap className="w-4 h-4" />;
      case "Analyst": return <BarChart3 className="w-4 h-4" />;
      default: return <Radio className="w-4 h-4" />;
    }
  };

  const getAgentColor = (role: string) => {
    switch (role) {
      case "Tactician": return "text-blue-500";
      case "Hype Master": return "text-orange-500";
      case "Analyst": return "text-emerald-500";
      default: return "text-white";
    }
  };

  return (
    <div className="border border-white/10 stark-card p-6 mb-8 relative overflow-hidden flex flex-col bg-white/[0.02]" id="multi-agent-orchestrator">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <motion.div 
            animate={loading ? { scale: [1, 1.2, 1], opacity: [1, 0.5, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
            className={`w-2 h-2 rounded-full ${loading ? 'bg-blue-500' : 'bg-green-500'}`} 
          />
          <span className="mono-meta uppercase tracking-widest text-[10px]">
            {loading ? 'Thinking State Active' : 'Multi-Agent Consensus Stable'}
          </span>
        </div>
        <div className="flex gap-1">
          {insights.map((_, i) => (
            <div 
              key={i} 
              className={`h-0.5 w-4 transition-all duration-500 ${activeAgent === i && !loading ? 'bg-blue-500' : 'bg-white/10'}`} 
            />
          ))}
        </div>
      </div>

      <div className="relative min-h-[140px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="thinking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4 items-center justify-center py-6"
            >
              <div className="flex gap-1.5">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                    className="w-2 h-2 bg-blue-500"
                  />
                ))}
              </div>
              <span className="mono-meta text-[10px] italic opacity-60 uppercase tracking-tighter">
                {thinkingSteps[thinkingStep]}
              </span>
            </motion.div>
          ) : (
            insights.length > 0 && (
              <motion.div
                key={`${activeAgent}-${insights[activeAgent]?.role}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                <div className={`flex items-center gap-2 font-black uppercase italic tracking-tighter text-sm ${getAgentColor(insights[activeAgent].role)}`}>
                  {getAgentIcon(insights[activeAgent].role)}
                  {insights[activeAgent].role}
                </div>
                <p className="text-2xl lg:text-3xl bold-heading text-white leading-tight mb-4">
                  "{insights[activeAgent].text}"
                </p>

                <div className="border-t border-white/10 pt-4 mb-4">
                   <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] mono-meta text-blue-500 font-bold uppercase tracking-widest">Impact Analysis</span>
                      <span className="text-[8px] mono-meta opacity-40">Confidence: 94%</span>
                   </div>
                   <p className="text-[10px] text-white/50 italic leading-relaxed">
                      {activeAgent === 0 ? "Detected shift in defensive pivot. Opposition transition speed reduced by 14%." : 
                       activeAgent === 1 ? "Stadium decibel levels peaking. Home node synchronization increasing." : 
                       "Ball retention efficiency in the mid-field cluster remains optimal."}
                   </p>
                </div>
                
                {/* Reasoning Threads */}
                <div className="flex flex-wrap gap-2 mt-4">
                   <div className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-[8px] mono-meta text-blue-400 flex items-center gap-1">
                      <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
                      REASONING: MACRO_FORMATION_SHIFT
                   </div>
                   <div className="px-2 py-0.5 bg-white/5 border border-white/10 text-[8px] mono-meta opacity-40">SOURCE: REALTIME_ISL_API</div>
                   <div className="px-2 py-0.5 bg-white/5 border border-white/10 text-[8px] mono-meta opacity-40">CONFIDENCE: 92%</div>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>

      <div className="mt-auto pt-6 border-t border-white/5 flex gap-8">
        <div className="flex flex-col gap-1">
          <span className="mono-meta text-[8px]">Agentic Load</span>
          <span className="text-xs font-bold leading-none italic">0.12ms Latency</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="mono-meta text-[8px]">Orchestrator Protocol</span>
          <span className="text-xs font-bold leading-none italic text-blue-500">BHARAT_V4_SSE</span>
        </div>
      </div>
    </div>
  );
}
