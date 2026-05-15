import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Trophy, Target, MousePointer2 } from 'lucide-react';
import { FanMission } from '../../types/match';

interface FanMissionProps {
  mission: FanMission;
}

export function FanMissionComponent({ mission }: FanMissionProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const handleSelect = (option: string) => {
    if (completed) return;
    setSelected(option);
    setTimeout(() => setCompleted(true), 1500);
  };

  return (
    <div className={`border-2 p-8 stark-card relative overflow-hidden transition-all duration-500 ${completed ? 'border-green-500/30 bg-green-500/5' : 'border-blue-500/30 bg-blue-500/5 shadow-[0_0_30px_rgba(59,130,246,0.1)]'}`} id="fan-mission">
      {!completed && (
        <motion.div 
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 border-2 border-blue-500/20 pointer-events-none"
        />
      )}
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 text-black flex items-center justify-center rounded-sm rotate-3">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div>
            <span className="mono-meta text-[10px] text-blue-500 font-bold uppercase tracking-widest">Active Mission</span>
            <h3 className="text-2xl bold-heading italic leading-none">{mission.title}</h3>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="mono-meta text-[8px] opacity-40 uppercase">Reward</span>
          <div className="flex items-center gap-1.5 text-yellow-500 font-black italic">
            <Trophy className="w-3 h-3" />
            <span>{mission.reward || '+50 pts'}</span>
          </div>
        </div>
      </div>

      <p className="text-white/70 italic text-sm mb-8 leading-relaxed">
        {mission.description}
      </p>

      <div className="grid grid-cols-1 gap-3">
        <AnimatePresence mode="wait">
          {!completed ? (
            <motion.div 
              key="options"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {mission.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`w-full group relative h-14 border transition-all flex items-center justify-between px-6 ${
                    selected === option 
                      ? 'border-blue-500 bg-blue-500/20' 
                      : 'border-white/10 bg-black/40 hover:border-white/30'
                  }`}
                >
                  <span className={`text-lg italic bold-heading ${selected === option ? 'text-blue-400' : 'text-white'}`}>
                    {option}
                  </span>
                  <div className="w-6 h-6 border border-white/20 flex items-center justify-center">
                    {selected === option && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 bg-blue-500" />
                    )}
                  </div>
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-6 flex flex-col items-center gap-4 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                 <Target className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h4 className="text-xl font-black italic uppercase text-green-400">Mission Synced</h4>
                <p className="mono-meta text-[10px] opacity-60">VERIFYING_LIVE_DATA_STREAM...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Interactive Hint */}
      {!completed && (
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MousePointer2 className="w-3 h-3 text-blue-500 animate-bounce" />
            <span className="mono-meta text-[8px] opacity-40 uppercase">Tap to participate</span>
          </div>
          <span className="mono-meta text-[8px] opacity-40 uppercase tracking-widest animate-pulse">Critical interaction required</span>
        </div>
      )}
    </div>
  );
}
