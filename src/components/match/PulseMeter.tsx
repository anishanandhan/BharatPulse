/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, Activity } from "lucide-react";
import { formatPulse } from "../../lib/utils";
import { motion } from "motion/react";

interface PulseMeterProps {
  data: { time: string; pulse: number }[];
}

export function PulseMeter({ data }: PulseMeterProps) {
  const currentPulse = Math.round(data[data.length - 1]?.pulse || 50);
  
  const getMoodInfo = (pulse: number) => {
    if (pulse > 85) return { label: "Electric", reason: "High-intensity volatility following critical event" };
    if (pulse > 70) return { label: "Tense", reason: "Pressure building in final offensive third" };
    if (pulse > 40) return { label: "Engaged", reason: "Balanced structural play and fan consensus" };
    return { label: "Stable", reason: "Standard match conditions and field dynamics" };
  };

  const mood = getMoodInfo(currentPulse);

  return (
    <div className="border border-white/10 p-8 flex flex-col gap-6 bg-black/40 backdrop-blur-sm stark-card relative overflow-hidden" id="pulse-meter">
      <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${currentPulse}%` }}
          className={`h-full transition-all duration-1000 ${currentPulse > 70 ? 'bg-red-500' : 'bg-blue-500'}`}
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="mono-meta italic text-blue-500 flex items-center gap-2">
          <Activity className="w-3 h-3" />
          Live Momentum Index
        </h2>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3 h-3 text-white/30" />
          <span className="mono-meta tracking-tighter">Node Sync Hub</span>
        </div>
      </div>

      <div className="flex flex-col items-start gap-4">
        <div className="flex flex-col">
          <span className={`text-[120px] bold-heading leading-[0.8] mb-4 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)] ${currentPulse > 70 ? 'text-red-500' : 'text-blue-500'}`}>
            {currentPulse}
          </span>
          <div className="flex flex-col gap-1">
             <span className="text-xl font-black uppercase italic tracking-widest text-white">
                STADIUM MOOD: {mood.label}
             </span>
             <p className="text-[10px] mono-meta opacity-40 uppercase tracking-tighter max-w-[200px]">
                {mood.reason}
             </p>
          </div>
        </div>
      </div>

      <div className="h-24 w-full relative -mx-8 -mb-8 overflow-hidden opacity-30">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <Area 
              type="monotone" 
              dataKey="pulse" 
              stroke="#2563eb" 
              fill="#2563eb"
              fillOpacity={0.2}
              strokeWidth={3}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
