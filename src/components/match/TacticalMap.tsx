import React from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, Target } from 'lucide-react';

interface TacticalMapProps {
  intensity: number;
}

export function TacticalMap({ intensity }: TacticalMapProps) {
  return (
    <div className="relative aspect-[4/3] bg-blue-950/20 border border-white/10 rounded-sm overflow-hidden stark-card" id="tactical-map">
      {/* Pitch Markings with Glow */}
      <div className="absolute inset-4 border border-white/10 ring-1 ring-white/5">
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10 transform -translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-16 h-16 border border-white/10 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white/5" />
      </div>

      {/* Dynamic Heat Zones */}
      <div className="absolute inset-0">
        <motion.div 
          animate={{ 
            opacity: intensity > 70 ? [0.1, 0.4, 0.1] : [0.05, 0.15, 0.05],
            scale: intensity > 70 ? [1, 1.2, 1] : [1, 1.05, 1],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className={`absolute top-1/4 left-1/3 w-32 h-32 blur-3xl rounded-full ${intensity > 80 ? 'bg-red-500/30' : 'bg-blue-500/20'}`}
        />
        <motion.div 
          animate={{ 
            opacity: [0.05, 0.2, 0.05],
            scale: [1, 1.3, 1],
            x: [0, 20, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 1 }}
          className="absolute bottom-1/4 right-1/3 w-40 h-40 blur-3xl rounded-full bg-blue-400/10"
        />
      </div>

      {/* Scanning Line */}
      <motion.div 
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[2px] bg-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.6)] z-10"
      />

      {/* Tactical Vectors (Arrows) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-40">
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" className="text-blue-500" />
          </marker>
        </defs>
        <motion.line 
          x1="30%" y1="70%" x2="50%" y2="40%" 
          stroke="currentColor" strokeWidth="1" 
          markerEnd="url(#arrowhead)"
          className="text-blue-500"
          animate={{ opacity: [0.1, 0.8, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.line 
          x1="70%" y1="30%" x2="50%" y2="60%" 
          stroke="currentColor" strokeWidth="1" 
          markerEnd="url(#arrowhead)"
          className="text-red-500"
          animate={{ opacity: [0.1, 0.6, 0.1] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />
      </svg>

      {/* Team Nodes (Formations) */}
      {/* Home Team (Blue) */}
      {[
        { x: '15%', y: '50%' }, { x: '35%', y: '25%' }, { x: '35%', y: '75%' },
        { x: '50%', y: '45%' }, { x: '75%', y: '50%' }
      ].map((pos, i) => (
        <motion.div
          key={`home-${i}`}
          animate={{ 
            x: (Math.random() - 0.5) * 10,
            y: (Math.random() - 0.5) * 10
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ left: pos.x, top: pos.y }}
          className="absolute w-2 h-2 bg-blue-500 rounded-full border border-white/50 shadow-[0_0_8px_rgba(59,130,246,0.8)] z-20"
        >
          <div className="absolute inset-0 animate-ping bg-blue-400/40 rounded-full" />
        </motion.div>
      ))}

      {/* Away Team (Red/White) */}
      {[
        { x: '85%', y: '50%' }, { x: '65%', y: '20%' }, { x: '65%', y: '80%' },
        { x: '45%', y: '55%' }, { x: '25%', y: '50%' }
      ].map((pos, i) => (
        <motion.div
          key={`away-${i}`}
          animate={{ 
            x: (Math.random() - 0.5) * 10,
            y: (Math.random() - 0.5) * 10
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          style={{ left: pos.x, top: pos.y }}
          className="absolute w-2 h-2 bg-white rounded-full border border-red-500 shadow-[0_0_8px_rgba(255,255,255,0.8)] z-20"
        />
      ))}

      {/* Ball Node */}
      <motion.div 
        animate={{ 
          left: ['45%', '55%', '50%', '30%', '45%'],
          top: ['55%', '40%', '60%', '50%', '55%'] 
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full shadow-[0_0_10px_#facc15] z-30"
      />

      {/* Overlay UI */}
      <div className="absolute top-2 left-2 flex flex-col gap-1 z-40">
        <div className="flex items-center gap-1.5 bg-black/80 px-2 py-0.5 border border-white/10 backdrop-blur-md">
          <Shield className="w-2.5 h-2.5 text-blue-400" />
          <span className="text-[7px] font-mono font-bold uppercase tracking-tighter">Formation: 4-3-3 Symmetric</span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/80 px-2 py-0.5 border border-white/10 backdrop-blur-md">
          <Target className="w-2.5 h-2.5 text-red-500" />
          <span className="text-[7px] font-mono font-bold uppercase tracking-tighter">Direct Attacking Threat: High</span>
        </div>
      </div>

      <div className="absolute bottom-2 left-2 z-40">
         <div className="flex flex-col gap-0.5">
            <div className="w-16 h-0.5 bg-white/10 relative overflow-hidden">
               <motion.div 
                 animate={{ left: ['-100%', '100%'] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="absolute top-0 bottom-0 w-1/3 bg-blue-500" 
               />
            </div>
            <span className="text-[6px] mono-meta opacity-30">PULSE_SYNC_ACTIVE</span>
         </div>
      </div>

      <div className="absolute bottom-2 right-2 z-40">
        <div className="bg-black/90 px-3 py-1 border border-blue-500/40 flex items-center gap-2">
           <Zap className="w-2.5 h-2.5 text-yellow-400 animate-pulse" />
           <span className="text-[9px] font-black italic uppercase italic tracking-widest">Tactics Hub Live</span>
        </div>
      </div>
    </div>
  );
}
