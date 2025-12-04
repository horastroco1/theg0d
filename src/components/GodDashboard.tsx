'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Send, Coins, X, Sparkles } from 'lucide-react';
import { astrologyService, HoroscopeData } from '@/services/astrologyService'; 
import { geminiService } from '@/services/geminiService';

// --- Interfaces ---
interface GodDashboardProps { 
  userData: {
    name: string;
    latitude: number;
    longitude: number;
    date: string;
    time: string;
    timezone: string;
    timeUnknown?: boolean;
    locationName?: string;
  }; 
}

interface Message {
  id: string;
  text: string;
  sender: 'god' | 'user';
  delay?: number;
}

// --- Helper ---
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export default function GodDashboard({ userData }: GodDashboardProps) {
  const hasInitialized = useRef(false); 
  const [loading, setLoading] = useState(true);
  const [horoscope, setHoroscope] = useState<HoroscopeData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sanity, setSanity] = useState(100);
  const [energy, setEnergy] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [showTribute, setShowTribute] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Sanity Drain
  useEffect(() => {
    const interval = setInterval(() => {
      setSanity(s => Math.max(0, s - 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // API Connection (Run Once)
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const init = async () => {
      setError(null);
      setLoading(true);
      setMessages([{ id: generateId(), text: "CONNECTING TO COSMIC MAINFRAME...", sender: 'god', delay: 0 }]);
      
      try {
        const data = await astrologyService.calculateHoroscope({
            latitude: userData.latitude,
            longitude: userData.longitude,
            date: userData.date,
            time: userData.time,
            timezone: userData.timezone,
            timeUnknown: userData.timeUnknown
        });
        
        setHoroscope(data);
        setLoading(false);

        const dasha = data.current_dasha || 'UNKNOWN';
        const moonSign = data.moon_sign || 'UNKNOWN';
        const ascendant = data.ascendant || 'UNKNOWN';

        // Add messages sequentially
        setTimeout(() => {
            setMessages(prev => [
                ...prev,
                { id: generateId(), text: `IDENTITY VERIFIED: ${userData.name.toUpperCase()}.`, sender: 'god' },
                { id: generateId(), text: `MOON: ${moonSign}. ASCENDANT: ${ascendant}.`, sender: 'god' },
                { id: generateId(), text: `CURRENT CYCLE: ${dasha}. DIFFICULTY: HARD.`, sender: 'god' },
                { id: generateId(), text: "WHAT IS YOUR QUERY, SEEKER?", sender: 'god' }
            ]);
        }, 1500);

      } catch (e: any) {
        console.error("Init Error:", e);
        setLoading(false);
        setError(e.message);
        setMessages(prev => [...prev, { id: generateId(), text: `ERROR: ${e.message}`, sender: 'god' }]);
      }
    };

    init();
  }, [userData]); 

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    
    const userText = input;
    setInput('');
    setIsTyping(true);
    
    // User Message
    setMessages(prev => [...prev, { id: generateId(), text: userText, sender: 'user' }]);
    setSanity(s => Math.max(0, s - 5));

    try {
        // Call Gemini AI
        const responseText = await geminiService.getGodResponse(userText, horoscope);
        
        // Add God Response
        setMessages(prev => [...prev, { id: generateId(), text: responseText, sender: 'god' }]);
    } catch (err) {
        setMessages(prev => [...prev, { id: generateId(), text: "CONNECTION ERROR. TRY AGAIN.", sender: 'god' }]);
    } finally {
        setIsTyping(false);
    }
  };

  const addMessage = (text: string, sender: 'god' | 'user') => {
     setMessages(prev => [...prev, { id: generateId(), text, sender }]);
  };

  return (
    <div className="flex flex-col w-full h-screen max-h-screen overflow-hidden relative z-10 font-mono text-[#00FF41] bg-[#050505]">
      
      {/* Top Sanity Line */}
      <div className="fixed top-0 left-0 w-full h-1 z-50 bg-[#00FF41]/10">
        <motion.div 
            initial={{ width: '100%' }}
            animate={{ width: `${sanity}%` }}
            className={`h-full shadow-[0_0_10px_currentColor] ${sanity < 30 ? 'bg-[#FF3333] shadow-[#FF3333]' : 'bg-[#00FF41] shadow-[#00FF41]'}`} 
        />
      </div>

      {/* Header / HUD */}
      <div className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-md border-b border-[#00FF41]/20 p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
           <div className="flex flex-col">
             <h2 className="text-lg font-bold tracking-widest glitch-text">theg0d</h2>
             <span className="text-[9px] opacity-50 tracking-[0.2em]">CONNECTED: {userData.locationName?.toUpperCase().slice(0, 15)}</span>
           </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#00FF41]/5 px-3 py-1 rounded-full border border-[#00FF41]/20">
              <Activity className={`w-4 h-4 ${sanity < 30 ? 'text-[#FF3333] animate-pulse' : 'text-[#00FF41]'}`} />
              <span className={`text-xs font-bold ${sanity < 30 ? 'text-[#FF3333]' : 'text-[#00FF41]'}`}>{sanity}%</span>
          </div>
          <div className="hidden sm:flex gap-1">
            {[1,2,3,4,5].map(i => (
              <Zap key={i} className={`w-3 h-3 ${i <= energy ? 'fill-[#00FF41] text-[#00FF41]' : 'text-[#00FF41]/20'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col items-center w-full">
        <div className="w-full max-w-2xl flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide pb-24">
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] md:max-w-[70%] p-4 text-sm leading-relaxed shadow-lg backdrop-blur-sm ${
                msg.sender === 'god' 
                  ? 'bg-[#00FF41]/10 border-l-2 border-[#00FF41] text-[#00FF41] rounded-r-xl rounded-bl-xl' 
                  : 'bg-[#1a1a1a] border border-white/5 text-white rounded-l-xl rounded-br-xl'
              }`}>
                <div className="text-[8px] opacity-40 mb-2 uppercase tracking-widest font-bold">
                    {msg.sender === 'god' ? 'SYSTEM_AI' : 'USER_INPUT'}
                </div>
                {msg.text}
              </div>
            </motion.div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start w-full max-w-2xl"
              >
                <div className="p-4 text-sm border-l-2 border-[#00FF41] bg-[#00FF41]/5 text-[#00FF41] animate-pulse rounded-r-xl rounded-bl-xl flex items-center gap-2">
                   <Sparkles className="w-3 h-3 animate-spin" />
                   CALCULATING KARMIC VECTOR...
                </div>
              </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Floating Tribute Button */}
        <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowTribute(true)}
            className="fixed bottom-24 right-6 z-50 bg-[#FFD700] text-black p-3 rounded-full shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:shadow-[0_0_30px_rgba(255,215,0,0.6)] transition-all"
        >
            <Coins className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 w-full bg-[#050505]/90 backdrop-blur-xl border-t border-[#00FF41]/20 p-4 z-40">
        <div className="max-w-2xl mx-auto">
             <form onSubmit={handleSend} className="flex gap-4 items-center">
              <input 
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                className="flex-1 bg-[#111] border border-[#333] rounded-full px-6 py-3 text-sm focus:outline-none focus:border-[#00FF41] focus:ring-1 focus:ring-[#00FF41] text-white placeholder-gray-600 font-mono transition-all"
                placeholder="Confess to the machine..."
                disabled={loading || isTyping}
              />
              <button 
                type="submit" 
                disabled={loading || isTyping}
                className="bg-[#00FF41] text-black p-3 rounded-full hover:bg-[#00CC33] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,255,65,0.3)]"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
        </div>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed top-20 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-6 py-2 rounded-full text-xs font-bold shadow-xl z-50 backdrop-blur-md"
            >
                {error}
            </motion.div>
        )}
      </AnimatePresence>

      {/* Tribute Modal */}
      <AnimatePresence>
         {showTribute && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-md"
           >
             <motion.div 
               initial={{ scale: 0.9 }}
               animate={{ scale: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-[#050505] border border-[#FFD700] p-8 max-w-sm w-full relative shadow-[0_0_60px_rgba(255,215,0,0.15)] rounded-xl"
             >
               <button 
                 onClick={() => setShowTribute(false)}
                 className="absolute top-4 right-4 text-[#FFD700]/50 hover:text-[#FFD700] transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>
               
               <div className="flex flex-col items-center space-y-6 text-center">
                 <div className="w-40 h-40 bg-white p-2 rounded-lg shadow-lg">
                   <div className="w-full h-full bg-black flex items-center justify-center text-white text-[10px] font-mono break-all p-1">
                     [QR_CODE_USDT_TRC20]
                   </div>
                 </div>
                 
                 <div>
                   <h3 className="text-[#FFD700] font-bold tracking-widest text-xl mb-1 font-mono">OFFER TRIBUTE</h3>
                   <p className="text-[#FFD700]/60 text-xs font-mono">Reduce bad karma instantly.</p>
                 </div>
 
                 <div className="bg-[#FFD700]/5 p-4 border border-[#FFD700]/20 w-full text-[10px] text-[#FFD700] font-mono break-all select-all cursor-pointer rounded hover:bg-[#FFD700]/10 transition-colors">
                   0x71C7656EC7ab88b098defB751B7401B5f6d8976F
                 </div>
 
                 <button 
                    onClick={() => {
                     setEnergy(5);
                     setSanity(prev => Math.min(100, prev + 25));
                     setShowTribute(false);
                     addMessage("TRIBUTE RECEIVED. ENERGY RESTORED.", 'god');
                     setShowTribute(false);
                    }}
                    className="w-full bg-[#FFD700] text-black font-bold py-4 rounded hover:bg-[#E5C100] transition-all uppercase text-xs tracking-[0.2em] font-mono shadow-[0_0_20px_rgba(255,215,0,0.2)]"
                 >
                   CONFIRM TRANSFER
                 </button>
               </div>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>

    </div>
  );
}
