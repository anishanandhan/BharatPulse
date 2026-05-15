import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Shield, BarChart3, Radio, ArrowUpRight } from "lucide-react";
import { MatchEvent, EventType } from "../../types/match";

interface TimelineProps {
  events: MatchEvent[];
}

export function Timeline({ events }: TimelineProps) {
  const sortedEvents = [...events].sort((a, b) => b.minute - a.minute);

  return (
    <div className="border border-white/10 p-8 stark-card bg-white/[0.02]" id="momentum-narrative">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="bold-heading italic text-2xl uppercase">Momentum Narrative</h3>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          <span className="mono-meta text-[8px]">Agentic Analysis Active</span>
        </div>
      </div>

      <div className="relative space-y-12 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
        {sortedEvents.map((event, index) => {
          const isHighImpact = event.type === EventType.GOAL || event.type === EventType.RED_CARD;
          
          return (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`relative pl-12 group ${isHighImpact ? 'z-10' : ''}`}
            >
              {/* Timeline Marker */}
              <div className={`absolute left-0 top-0.5 w-[32px] h-[32px] rounded-full border-2 bg-black flex items-center justify-center transition-all ${
                isHighImpact 
                  ? 'border-blue-500 scale-125 shadow-[0_0_20px_rgba(59,130,246,0.6)]' 
                  : 'border-white/20 group-hover:border-white/40 group-hover:scale-110'
              }`}>
                {getEventIcon(event.type, isHighImpact)}
              </div>

              {/* Event Content */}
              <div className={`flex flex-col gap-2 ${
                isHighImpact 
                  ? 'bg-blue-500/10 p-6 border-l-4 border-l-blue-500 border-y border-r border-white/10 -ml-2' 
                  : 'border-l border-white/10 pl-6 pb-2 -ml-[1px]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-black italic mono-meta ${isHighImpact ? 'text-blue-500' : 'text-white/30'}`}>
                      {event.minute}'
                    </span>
                    {isHighImpact && (
                      <span className="text-[10px] font-black uppercase bg-blue-500 text-black px-2 py-0.5 italic tracking-tighter">
                        Critical Moment
                      </span>
                    )}
                  </div>
                  {!isHighImpact && (
                    <ArrowUpRight className="w-3 h-3 text-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                
                <h4 className={`font-black italic uppercase leading-none tracking-tighter ${
                  isHighImpact ? 'text-2xl text-white mt-1' : 'text-lg text-white/80'
                }`}>
                  {event.description.split(': ')[0]}
                </h4>
                
                {event.description.includes(': ') && (
                   <p className={`font-medium italic leading-relaxed ${
                     isHighImpact ? 'text-sm text-white/70' : 'text-xs text-white/40'
                   }`}>
                     {event.description.split(': ')[1]}
                   </p>
                )}

                {/* AI Storytelling Overlay */}
                {isHighImpact && (
                   <div className="mt-4 pt-4 border-t border-white/10 flex gap-3">
                     <Radio className="w-4 h-4 text-blue-500 shrink-0" />
                     <p className="text-[10px] mono-meta italic text-blue-400">
                       "Structural imbalance detected post-event. Anticipating tactical recalibration from away side."
                     </p>
                   </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {sortedEvents.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center gap-6 opacity-30">
            <div className="relative w-16 h-16">
               <div className="absolute inset-0 border-2 border-dashed border-white/20 rounded-full animate-spin-slow" />
               <div className="absolute inset-4 border border-blue-500/50 rounded-full animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <span className="mono-meta text-[10px] italic block uppercase tracking-[0.2em]">Observing Field Dynamics</span>
              <span className="text-[9px] mono-meta opacity-50 block">NO_EVENTS_DETECTED_IN_INTERVAL</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getEventIcon(type: EventType, highImpact: boolean) {
  const iconClass = highImpact ? "w-4 h-4 text-blue-500" : "w-3 h-3 text-white/40";
  
  switch (type) {
    case EventType.GOAL:
      return <Zap className={iconClass} />;
    case EventType.SUBSTITUTION:
      return <div className={`font-black italic text-[12px] ${highImpact ? 'text-blue-500' : 'text-white/40'}`}>S</div>;
    case EventType.YELLOW_CARD:
      return <div className="w-2.5 h-4 bg-yellow-500 rounded-[1px]" />;
    case EventType.RED_CARD:
      return <div className="w-2.5 h-4 bg-red-600 rounded-[1px] shadow-[0_0_15px_red]" />;
    default:
      return <Shield className={iconClass} />;
  }
}
