import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Users, ShieldAlert, LogIn } from "lucide-react";
import { db, auth, signInWithGoogle } from "../../lib/firebase";
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: any;
  type: 'fan' | 'ai' | 'system';
}

export function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    const q = query(
      collection(db, "messages"),
      orderBy("timestamp", "asc"),
      limit(50)
    );

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
    }, (error) => {
      console.error("Firestore Error in ChatRoom:", error);
    });

    // AI AUTO-POSTER (DEMO HYPE)
    // Only posts if user is logged in (to use their auth session as proxy)
    // Every 45 seconds adds a tactical insight
    const aiInterval = setInterval(() => {
      if (auth.currentUser) {
        simulateAIMessage();
      }
    }, 45000);

    return () => {
      unsubscribeAuth();
      unsubscribeMessages();
      clearInterval(aiInterval);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !user) return;
    
    try {
      await addDoc(collection(db, "messages"), {
        userId: user.uid,
        userName: user.displayName || 'Anonymous Fan',
        text: inputValue,
        timestamp: serverTimestamp(),
        type: 'fan'
      });
      setInputValue("");
    } catch (e) {
      console.error("Error sending message:", e);
    }
  };

  const simulateAIMessage = async () => {
    if (!auth.currentUser) return;
    
    const aiAgents = [
      { name: 'TACTIC_BRAIN', text: "Detected 4-3-3 shift. Midfield recovery rate dropping." },
      { name: 'STADIUM_AI', text: "Crowd decibel levels peaking at 102dB. Synchronization high." },
      { name: 'HUB_ANALYST', text: "Mohun Bagan transition efficiency up by 12% in the last 10 mins." },
      { name: 'BHARAT_PULSE', text: "Fan sentiment leaning 72% towards Home Team. Energy nodes pulsing." }
    ];
    
    const agent = aiAgents[Math.floor(Math.random() * aiAgents.length)];

    try {
      await addDoc(collection(db, "messages"), {
        userId: `ai-${agent.name}`,
        userName: agent.name,
        text: agent.text,
        timestamp: serverTimestamp(),
        type: 'ai'
      });
    } catch (e) {
      console.error("AI simulation failed:", e);
    }
  };

  return (
    <div className="border border-white/10 stark-card bg-white/[0.03] flex flex-col h-[500px]" id="fan-chat-room">
      <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
        <div>
          <span className="mono-meta text-[8px] text-blue-500 font-bold uppercase tracking-widest">Global Synchronization</span>
          <h3 className="bold-heading italic text-xl">Bharat Arena Discussion</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="mono-meta text-[10px] uppercase">Nodes: {Math.floor(14000 + Math.random() * 1000).toLocaleString()}</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex flex-col gap-1 ${user?.uid === m.userId ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-[8px] font-black uppercase tracking-wider ${
                  m.type === 'ai' ? 'text-blue-500' : 
                  m.type === 'system' ? 'text-red-500' : 'opacity-40'
                }`}>
                  {m.userName}
                </span>
                <span className="text-[7px] mono-meta opacity-20">
                  {m.timestamp instanceof Timestamp ? m.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                </span>
              </div>
              <div className={`px-4 py-2 text-xs italic font-bold border ${
                user?.uid === m.userId 
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                  : m.type === 'ai' 
                    ? 'bg-white/5 border-white/10 text-white'
                    : 'bg-red-500/5 border-red-500/20 text-red-400'
              }`}>
                {m.text}
              </div>
            </motion.div>
          ))}
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-30 italic text-center p-8">
              <Users className="w-8 h-8 mb-4" />
              <p className="text-sm">Waiting for fan node connection... <br/> Sign in to transmit.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-white/10 bg-black/40">
        {!user ? (
          <button 
            onClick={() => signInWithGoogle()}
            className="w-full flex items-center justify-center gap-3 py-3 border border-white/20 hover:bg-white/5 transition-all text-xs font-black uppercase italic"
          >
            <LogIn className="w-4 h-4" />
            Sync BharatID to Transmit
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button 
                onClick={simulateAIMessage}
                className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/30 text-[8px] font-black uppercase italic text-blue-400"
              >
                Trigger AI React
              </button>
              <div className="flex-1 text-[8px] mono-meta opacity-30 flex items-center justify-end uppercase">
                {user.displayName} Sync Active
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Transmit to ISL network..."
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-xs italic font-bold focus:outline-none focus:border-blue-500 transition-colors pl-4 pr-12"
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
