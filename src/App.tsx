/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MatchHeader } from './components/match/MatchHeader';
import { MatchStats } from './components/match/MatchStats';
import { PulseMeter } from './components/match/PulseMeter';
import { Timeline } from './components/match/Timeline';
import { PollComponent } from './components/match/PollComponent';
import { LiveCommentary } from './components/match/LiveCommentary';
import { MultiAgentOrchestrator } from './components/match/MultiAgentOrchestrator';
import { TacticalMap3D } from './components/match/TacticalMap3D';
import { MomentumOverlay } from './components/match/MomentumOverlay';
import { FanMissionComponent } from './components/match/FanMission';
import { ChatRoom } from './components/match/ChatRoom';
import { useMatchData } from './hooks/useMatchData';
import { Bell, Radio, Users, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { match, sentimentHistory } = useMatchData();
  const latestPulse = sentimentHistory[sentimentHistory.length - 1]?.pulse || 50;

  // Demo Simulation Handler
  const handleDemoAction = (type: string) => {
    // This is just for demo, we could dispatch to a reducer if we had global state
    // But for now, we'll just log it or provide visual feedback
    console.log(`Demo Action: ${type}`);
    window.dispatchEvent(new CustomEvent('demo-action', { detail: type }));
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 font-sans pb-24 relative overflow-hidden">
      {/* Demo Controls (Hackathon Safety) */}
      <div className="fixed bottom-16 left-6 z-[1000] flex flex-col gap-2">
        <div className="bg-black/90 border border-white/20 p-4 stark-card backdrop-blur-xl">
           <span className="mono-meta text-[8px] text-blue-500 block mb-3 uppercase font-black">Judge Control</span>
           <div className="flex flex-col gap-2">
              <button 
                onClick={() => handleDemoAction('GOAL')}
                className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase italic hover:bg-blue-500 transition-colors"
              >
                Trigger Goal
              </button>
              <button 
                onClick={() => handleDemoAction('RED_CARD')}
                className="px-4 py-1.5 border border-red-500/50 text-red-500 text-[10px] font-black uppercase italic hover:bg-red-500 hover:text-white transition-colors"
              >
                Trigger Red
              </button>
           </div>
        </div>
      </div>
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/30 blur-[150px] rounded-full" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-900/20 blur-[150px] rounded-full" />
      </div>

      {/* Cinematic Feedback Overlay */}
      <MomentumOverlay lastEvent={match.timeline[0]} />
      
      {/* Top Navigation */}
      <nav className="border-b border-white/10 py-6 px-12 mb-12 bg-black/50 backdrop-blur-md sticky top-0 z-[100]">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
              Bharat<span className="text-blue-500">Pulse</span>
            </h1>
            <div className="hidden md:flex items-center gap-8 border-l border-white/10 pl-8">
              <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-sm">
                <span className="text-[10px] mono-meta text-blue-400 uppercase">Input:</span>
                <span className="text-[10px] font-black italic uppercase text-blue-400">3D Interactive</span>
                <Sparkles className="w-3 h-3 text-blue-400" />
              </div>
              <span className="mono-meta cursor-pointer hover:text-white transition-colors relative">
                Tactical Pitch
                <span className="absolute -top-1 -right-4 w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
              </span>
              <span className="mono-meta cursor-pointer hover:text-white transition-colors">Fan Arena</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden xl:flex items-center gap-3 px-4 py-2 border border-white/10 bg-white/5 relative overflow-hidden">
               <motion.div 
                 animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.8, 0.3] }}
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="w-1.5 h-1.5 bg-blue-500 rounded-full" 
               />
               <span className="mono-meta text-[9px] tracking-[0.2em] text-blue-400 font-bold uppercase">System_Synchronized</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 border border-white/10 hover:bg-white/5 transition-colors relative group">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full border-2 border-black group-hover:scale-125 transition-transform" />
              </button>
              <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] mono-meta leading-none opacity-40">MBSG_UNIT</span>
                  <span className="text-[10px] font-black italic uppercase">onparul</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-16">
            <MatchHeader match={match} />
            
            <AnimatePresence mode="wait">
              {match.activeMission && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-8"
                >
                  <FanMissionComponent mission={match.activeMission} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tactical Whispers Row */}
            <div className="flex gap-4 mb-8 overflow-hidden h-12 items-center border-y border-white/5 bg-white/[0.01]">
               <div className="shrink-0 mono-meta text-[8px] text-blue-500 font-bold px-4 border-r border-white/10 uppercase tracking-[0.2em]">Live Whispers</div>
               <div className="flex gap-12 animate-marquee whitespace-nowrap">
                  <span className="mono-meta text-[10px] opacity-40 uppercase">✓ SALT LAKE WIND SPEED: 12KM/H</span>
                  <span className="mono-meta text-[10px] opacity-40 uppercase">✓ PITCH FRICTION: OPTIMAL</span>
                  <span className="mono-meta text-[10px] opacity-40 uppercase">✓ CROWD DECIBELS: 94DB (+4)</span>
                  <span className="mono-meta text-[10px] opacity-40 uppercase">✓ TACTICAL OVERLOAD: DETECTED (MBSG_LEFT)</span>
                  <span className="mono-meta text-[10px] opacity-40 uppercase">✓ SYNC STATUS: BHARATPULSE_V2.1</span>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-8">
                <PulseMeter data={sentimentHistory} />
                <div className="space-y-2">
                  <span className="mono-meta text-[10px] text-blue-500 font-bold uppercase tracking-widest">3D Tactical Engine Live</span>
                  <TacticalMap3D intensity={latestPulse} />
                </div>
              </div>
              <MultiAgentOrchestrator match={match} sentimentHistory={sentimentHistory} />
            </div>
            
            <Timeline events={match.timeline} />
            <MatchStats match={match} />
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-16">
            <div className="space-y-16">
              <LiveCommentary match={match} intensity={latestPulse} />
              
              {match.activePoll && (
                <PollComponent poll={match.activePoll} match={match} />
              )}

              <ChatRoom />
            </div>
          </aside>
        </div>
      </main>

      {/* Footer Ticker */}
      <div className="fixed bottom-0 left-0 right-0 h-10 border-t border-white/10 z-[100] bg-black overflow-hidden flex items-center">
        <div className="flex whitespace-nowrap animate-ticker items-center">
          <span className="px-8 text-blue-500 font-bold italic text-xs">⚡ REAL-TIME STREAM:</span>
          {match.timeline.slice(0, 5).map(event => (
            <span key={event.id} className="px-8 text-white/80 text-[10px] uppercase font-bold tracking-widest">
               {event.minute}' | {event.description.split(':')[0]} •
            </span>
          ))}
          <span className="px-8 text-white/80 text-[10px] uppercase font-bold tracking-widest">BHARAT PULSE INFRASTRUCTURE OPTIMIZED •</span>
        </div>
      </div>
    </div>
  );
}
