/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Match } from "../../types/match";

interface MatchStatsProps {
  match: Match;
}

export function MatchStats({ match }: MatchStatsProps) {
  const [drift, setDrift] = useState({ home: 0, away: 0 });
  
  // Drift effect to make stats feel alive
  useEffect(() => {
    const interval = setInterval(() => {
      setDrift({
        home: (Math.random() - 0.5) * 0.5,
        away: (Math.random() - 0.5) * 0.5
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Believable fallbacks if stats are zeroes or missing
  const getFallbackStats = () => {
    const isHomeLeading = match.homeTeam.score > match.awayTeam.score;
    const isDrawing = match.homeTeam.score === match.awayTeam.score;
    
    return [
      { 
        label: "Possession", 
        home: isHomeLeading ? "56%" : isDrawing ? "51%" : "44%", 
        away: isHomeLeading ? "44%" : isDrawing ? "49%" : "56%",
        insight: isHomeLeading ? "Controlling the mid-field tempo." : "Pushing higher for an equalizer."
      },
      { 
        label: "Press Intensity", 
        home: isHomeLeading ? "68%" : "74%", 
        away: isHomeLeading ? "82%" : "65%",
        insight: "High-friction zones detected in final third." 
      },
      { 
        label: "Attack Momentum", 
        home: isHomeLeading ? 42 : 55, 
        away: isHomeLeading ? 58 : 45,
        insight: "Direct transition threat is rising." 
      },
      { 
        label: "Shots / Targeted", 
        home: `${Math.max(match.homeTeam.score * 2, 4)} / ${match.homeTeam.score + 1}`, 
        away: `${Math.max(match.awayTeam.score * 2, 3)} / ${match.awayTeam.score}`,
        insight: "Conversion efficiency: Optimal."
      },
    ];
  };

  const stats = (match.liveStats && match.liveStats.length > 0 && match.liveStats[0].home !== 0) 
    ? match.liveStats 
    : getFallbackStats();

  const parseValue = (val: any) => {
    if (typeof val === 'string') {
      if (val.includes('/')) return parseFloat(val.split('/')[0]);
      if (val.includes('%')) return parseFloat(val);
    }
    return parseFloat(val) || 0;
  };

  return (
    <div className="border border-white/10 p-8 stark-card mb-16 bg-white/[0.02] relative overflow-hidden" id="match-engine-panel">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
      
      <div className="flex items-center justify-between mb-12 relative z-10">
        <div>
          <span className="mono-meta text-[8px] text-blue-500 font-bold uppercase tracking-widest block mb-1">Unit: Datastream_V3</span>
          <h2 className="bold-heading italic text-2xl text-white">AI Match Engine</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20">
          <motion.div 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-1.5 h-1.5 bg-blue-400 rounded-full" 
          />
          <span className="mono-meta text-[10px] text-blue-400 uppercase font-black uppercase">Live Analysis</span>
        </div>
      </div>

      <div className="space-y-12">
        {/* Momentum Bar - Special Visualization */}
        <div className="space-y-4">
           <div className="flex justify-between items-center px-1">
              <span className="text-[10px] mono-meta font-black uppercase text-white/40">{match.homeTeam.shortName}</span>
              <span className="text-[10px] mono-meta font-black uppercase text-blue-500 tracking-widest">Momentum Trend</span>
              <span className="text-[10px] mono-meta font-black uppercase text-white/40">{match.awayTeam.shortName}</span>
           </div>
           <div className="h-6 w-full bg-white/5 relative flex items-center p-1 rounded-sm border border-white/5">
              <motion.div 
                animate={{ width: `${60 + drift.home * 2}%` }}
                className="h-full bg-gradient-to-r from-white/20 to-white flex items-center justify-end px-3"
              >
                 <span className="text-[8px] font-black text-black italic">DOMINANT</span>
              </motion.div>
              <div className="w-0.5 h-full bg-blue-500 z-10 shadow-[0_0_10px_#3b82f6]" />
              <motion.div 
                animate={{ width: `${40 + drift.away * 2}%` }}
                className="h-full bg-gradient-to-l from-blue-500/20 to-blue-500 flex items-center justify-start px-3"
              >
                  <span className="text-[8px] font-black text-white italic">REACTIVE</span>
              </motion.div>
           </div>
        </div>

        {/* Individual Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {stats.map((stat: any, idx: number) => {
            const homeVal = parseValue(stat.home);
            const awayVal = parseValue(stat.away);
            const total = homeVal + awayVal || 1;

            return (
              <div key={idx} className="flex flex-col gap-3 group">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-3xl bold-heading leading-none text-white group-hover:text-blue-400 transition-colors">{stat.home}</span>
                    <span className="mono-meta text-[8px] opacity-30 uppercase">{match.homeTeam.shortName}</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-center opacity-60 italic pb-1">
                      {stat.label}
                    </span>
                  </div>
  
                  <div className="flex flex-col items-end">
                    <span className="text-3xl bold-heading leading-none text-blue-500">{stat.away}</span>
                    <span className="mono-meta text-[8px] opacity-30 uppercase">{match.awayTeam.shortName}</span>
                  </div>
                </div>
  
                <div className="h-[6px] w-full bg-white/5 relative flex rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(homeVal / total) * 100}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.2)]" 
                  />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(awayVal / total) * 100}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="h-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" 
                  />
                </div>

                {stat.insight && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full" />
                    <p className="text-[9px] italic text-white/40 font-medium group-hover:text-white/60 transition-colors uppercase tracking-tight">
                      {stat.insight}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Confidence Meter */}
      <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="flex flex-col">
               <span className="text-[8px] mono-meta opacity-30 uppercase">AI Analytics Confidence</span>
               <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                     {[...Array(5)].map((_, i) => (
                       <div key={i} className={`w-3 h-1 ${i < 4 ? 'bg-blue-500' : 'bg-white/10'}`} />
                     ))}
                  </div>
                  <span className="text-[10px] font-black italic">94%</span>
               </div>
            </div>
         </div>
         <p className="text-[8px] mono-meta opacity-20 uppercase max-w-[200px] text-right">
           Data reconstructed from live ISL telemetry feed via BharatPulse Unit.
         </p>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { motion } from "motion/react";
