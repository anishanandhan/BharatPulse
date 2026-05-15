/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Poll, Match } from "../../types/match";

interface PollComponentProps {
  poll: Poll;
  match: Match;
}

export function PollComponent({ poll, match }: PollComponentProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Parse match minute from clock string (e.g. "65'")
  const matchMinute = parseInt(match.clock.replace("'", "")) || 0;
  const canChangeVote = matchMinute < 70;
  
  const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0) + (selectedId ? 1 : 0);

  return (
    <div className="border border-white/10 p-8 flex flex-col gap-8 stark-card overflow-hidden" id="fan-poll">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="mono-meta italic text-blue-500">Live Fan Decision</span>
          {selectedId && canChangeVote && (
            <span className="text-[10px] uppercase font-bold text-blue-400 animate-pulse">
              Votes editable until 70'
            </span>
          )}
        </div>
        <h3 className="text-3xl bold-heading leading-tight italic">
          {poll.question}
        </h3>
      </div>

      <div className="space-y-3">
        {poll.options.map((option) => {
          const votes = option.votes + (selectedId === option.id ? 1 : 0);
          const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
          const isSelected = selectedId === option.id;

          return (
            <button
              key={option.id}
              onClick={() => {
                if (!selectedId || canChangeVote) {
                  setSelectedId(option.id);
                }
              }}
              disabled={selectedId !== null && !canChangeVote}
              className={`w-full group relative h-16 overflow-hidden flex items-center justify-between px-6 transition-all border ${
                isSelected 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-white/10 bg-black hover:border-white/30'
              } ${!canChangeVote && selectedId && !isSelected ? 'opacity-50' : ''}`}
            >
              {/* Progress Bar Background */}
              <AnimatePresence>
                {selectedId && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                    className={`absolute inset-y-0 left-0 -z-0 ${isSelected ? 'bg-blue-500/20' : 'bg-white/5'}`}
                  />
                )}
              </AnimatePresence>
              
              <div className="flex items-center gap-3 relative z-10">
                {isSelected && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-blue-500 rounded-full" 
                  />
                )}
                <span className={`text-lg bold-heading transition-colors italic ${isSelected ? 'text-blue-400' : 'text-white'}`}>
                  {option.text}
                </span>
              </div>
              
              {selectedId && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 relative z-10"
                >
                  <span className="mono-meta text-xs opacity-40">
                    {(votes).toLocaleString()}
                  </span>
                  <span className="text-xl font-black italic text-white">
                    {percentage}%
                  </span>
                </motion.div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-6 border-t border-white/10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="mono-meta">{totalVotes.toLocaleString()} Global Predictions</span>
          {selectedId && !canChangeVote && (
            <span className="mono-meta text-red-500/60 uppercase text-[9px]">Vote Locked (70'+)</span>
          )}
        </div>
      </div>
    </div>
  );
}
