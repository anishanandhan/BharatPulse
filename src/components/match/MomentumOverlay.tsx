import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MatchEvent, EventType } from '../../types/match';

interface MomentumOverlayProps {
  lastEvent?: MatchEvent;
}

export function MomentumOverlay({ lastEvent }: MomentumOverlayProps) {
  const [show, setShow] = useState(false);
  const [eventData, setEventData] = useState<MatchEvent | null>(null);

  useEffect(() => {
    if (lastEvent && (lastEvent.type === EventType.GOAL || lastEvent.type === EventType.RED_CARD)) {
      setEventData(lastEvent);
      setShow(true);
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [lastEvent]);

  return (
    <AnimatePresence>
      {show && eventData && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center overflow-hidden"
        >
          {/* Cinematic Background Pulse */}
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 2.5, opacity: 0.15 }}
            transition={{ duration: 1.5 }}
            className={`absolute w-[100vw] h-[100vw] rounded-full blur-[100px] ${
              eventData.type === EventType.GOAL ? 'bg-blue-500' : 'bg-red-600'
            }`}
          />

          {/* Flash Effect */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-white"
          />

          {/* Content */}
          <motion.div
            initial={{ y: 50, scale: 0.8, opacity: 0 }}
            animate={{ 
              y: [0, -10, 10, -5, 5, 0],
              scale: 1, 
              opacity: 1 
            }}
            transition={{ 
              y: { duration: 0.5, repeat: 2 },
              duration: 0.5 
            }}
            exit={{ y: -50, scale: 1.1, opacity: 0 }}
            className="relative bg-black border border-white/20 p-12 stark-card flex flex-col items-center gap-4 text-center backdrop-blur-2xl shadow-[0_0_100px_rgba(59,130,246,0.3)]"
          >
            <div className="flex items-center gap-4">
              <span className="mono-meta text-blue-500 tracking-[0.5em] uppercase">Impact Moment</span>
              <div className="h-0.5 w-12 bg-blue-500" />
            </div>

            <h2 className="text-8xl font-black italic tracking-tighter uppercase text-white leading-none">
              {eventData.type === EventType.GOAL ? 'GOOOAL!' : 'RED CARD!'}
            </h2>

            <div className="bg-blue-500 text-black px-6 py-2 font-black italic text-2xl uppercase mt-4">
              {eventData.description}
            </div>

            <div className="flex items-center gap-8 mt-8">
              <div className="flex flex-col items-center">
                <span className="mono-meta text-xs opacity-50">Match Intensity</span>
                <span className="text-4xl font-black italic text-blue-400">+42%</span>
              </div>
              <div className="w-[1px] h-12 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="mono-meta text-xs opacity-50">Node Sync</span>
                <span className="text-4xl font-black italic text-white">REACTIVE</span>
              </div>
            </div>
          </motion.div>

          {/* Glitch Overlay Lines */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay">
            <div className="h-full w-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
