/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Match, MatchStatus } from "../../types/match";

interface MatchHeaderProps {
  match: Match;
}

export function MatchHeader({ match }: MatchHeaderProps) {
  const isLive = match.status === MatchStatus.LIVE;

  return (
    <div className="relative border-b border-white/20 pb-12 mb-12" id="match-header">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <span className="mono-meta uppercase tracking-[0.2em]">{match.competition} • BHARAT FOOTBALL HUB</span>
          <div className="flex items-center gap-4">
            <span className="mono-meta text-blue-500">PROVIDER: ISL_LIVE_SYNC</span>
            {isLive && (
              <div className="px-2 py-0.5 bg-red-600 text-white font-black text-[10px] uppercase italic animate-pulse">
                Live
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Home Team */}
          <div className="flex flex-col items-center md:items-start flex-1 gap-4">
            <img 
              src={match.homeTeam.logoUrl} 
              alt={match.homeTeam.name} 
              className="w-16 h-16 object-contain filter grayscale brightness-200"
              referrerPolicy="no-referrer"
            />
            <h1 className="text-4xl lg:text-6xl bold-heading text-white uppercase italic leading-[0.8]">{match.homeTeam.name}</h1>
            <span className="mono-meta text-[10px] opacity-40">{match.venue}</span>
          </div>

          {/* Scoreboard */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-6 lg:gap-10">
              <span className="text-8xl lg:text-[120px] font-black leading-none tracking-tighter tabular-nums drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                {match.homeTeam.score}
              </span>
              <span className="text-4xl text-white/20 font-light italic mt-[-20px]">:</span>
              <span className="text-8xl lg:text-[120px] font-black leading-none tracking-tighter tabular-nums text-blue-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                {match.awayTeam.score}
              </span>
            </div>
            <motion.div 
              animate={{ opacity: [1, 0.8, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="bg-white text-black px-8 py-2 mt-[-10px] relative z-10 skew-x-[-12deg]"
            >
              <span className="text-xl font-black uppercase italic tracking-widest block skew-x-[12deg]">{match.clock}</span>
            </motion.div>
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center md:items-end flex-1 gap-4">
            <img 
              src={match.awayTeam.logoUrl} 
              alt={match.awayTeam.name} 
              className="w-16 h-16 object-contain filter grayscale brightness-200"
              referrerPolicy="no-referrer"
            />
            <h1 className="text-4xl lg:text-6xl bold-heading text-white text-right uppercase italic leading-[0.8]">{match.awayTeam.name}</h1>
            <span className="mono-meta text-[10px] opacity-40 text-right">FAN PULSE: STABLE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
