'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Send, Coins, X } from 'lucide-react';
import { astrologyService } from '../services/astrologyService'; 

interface GodDashboardProps { userData: any; }

interface Message {
  id: string;
  text: string;
  sender: 'god' | 'user';
}

export default function GodDashboard({ userData }: GodDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [horoscope, setHoroscope] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sanity, setSanity] = useState(100);
  const [energy, setEnergy] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [showTribute, setShowTribute] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Sanity Drain Effect ---
  useEffect(() => {
    const interval = setInterval(() => {
      setSanity(s => Math.max(0, s - 1)); // Drain 1% every 3s
    }, 3000); 
    return () => clearInterval(interval);
  }, []);

  // --- API Connection Effect ---
  useEffect(() => {
    const init = async () => {
      setError(null);
      setLoading(true);
      setMessages([{ id: 'init', text: "CONNECTING TO COSMIC MAINFRAME...", sender: 'god' }]);
      
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

        setTimeout(() => {
            setMessages(prev => [
                ...prev,
                { id: 'id_ver', text: `IDENTITY VERIFIED: ${userData.name.toUpperCase()}`, sender: 'god' },
                { id: 'moon_det', text: `MOON DETECTED IN: ${moonSign}. ASCENDANT: ${ascendant}.`, sender: 'god' },
                { id: 'cycle', text: `CURRENT CYCLE: ${dasha} ERA. WHAT IS YOUR QUERY, SEEKER?`, sender: 'god' }
            ]);
        }, 1000);

      } catch (e: any) {
        console.error("Dashboard Init Failed:", e);
        setLoading(false);
        setError(e.message || "CONNECTION SEVERED.");
        setMessages(prev => [...prev, { id: 'err', text: `ERROR: ${e.message}`, sender: 'god' }]);
      }
    };

    init();
  }, [userData]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    const userMsgId = Math.random().toString(36).substr(2, 9);
    setSanity(s => Math.max(0, s - 5)); 
    setMessages(prev => [...prev, { id: userMsgId, text: input, sender: 'user' }]);
    setInput('');
    
    setTimeout(() => {
        const rules = ["Pain is structural engineering for the soul.", "Entropy is the only constant. Accept it.", "The stars do not care. They only burn."];
        const randomResponse = rules[Math.floor(Math.random() * rules.length)];
        const godMsgId = Math.random().toString(36).substr(2, 9);
        setMessages(prev => [...prev, { id: godMsgId, text: randomResponse, sender: 'god' }]);
    }, 1000);
  };

  const addMessage = (text: string, sender: 'god' | 'user') => {
     setMessages(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), text, sender }]);
  };

  return (
    <div className="flex flex-col w-full h-screen max-h-screen overflow-hidden relative z-10 p-4 gap-4 font-mono text-[#00FF41] bg-[#050505]">
      {/* HUD */}
      <div className="border border-[#00FF41]/50 bg-[#050505]/90 p-4 flex justify-between items-center rounded-lg backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Activity className={`w-5 h-5 animate-pulse ${sanity < 30 ? 'text-[#FF3333]' : 'text-[#00FF41]'}`} />
          <div className="flex flex-col w-32 sm:w-48">
            <div className="flex justify-between text-[10px] mb-1 uppercase tracking-widest">
              <span>Sanity</span>
              <span className={sanity < 30 ? 'text-[#FF3333]' : 'text-[#00FF41]'}>{sanity}%</span>
            </div>
            <div className="h-2 border border-[#00FF41]/30 p-[1px]">
              <motion.div 
                initial={{ width: '100%' }}
                animate={{ width: `${sanity}%` }}
                className={`h-full ${sanity < 30 ? 'bg-[#FF3333]' : 'bg-[#00FF41]'}`} 
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-widest opacity-70">ENERGY</span>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(i => (
              <Zap key={i} className={`w-3 h-3 ${i <= energy ? 'fill-[#00FF41] text-[#00FF41]' : 'text-[#00FF41]/20'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 border border-[#00FF41]/30 bg-[#050505]/80 p-4 rounded-lg overflow-hidden flex flex-col relative shadow-[inset_0_0_20px_rgba(0,255,65,0.05)]">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-hide">
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-3 text-sm ${
                msg.sender === 'god' 
                  ? 'border-l-2 border-[#00FF41] bg-[#00FF41]/5 text-[#00FF41]' 
                  : 'border border-[#333] bg-[#111] text-gray-300'
              }`}>
                <div className="text-[8px] opacity-50 mb-1 uppercase tracking-widest">{msg.sender === 'god' ? 'SYSTEM' : 'SUBJECT'}</div>
                {msg.text}
              </div>
            </motion.div>
          ))}
          <div ref={chatEndRef} />
          {loading && <div className="text-xs animate-pulse text-[#00FF41]">CALCULATING FATE...</div>}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex gap-2 border-t border-[#333] pt-4">
          <input 
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 bg-black border border-[#333] p-3 text-sm focus:outline-none focus:border-[#00FF41] text-white placeholder-gray-700 font-mono"
            placeholder="ENTER CONFESSION..."
          />
          <button type="submit" className="bg-[#00FF41] text-black p-3 hover:bg-[#00CC33] transition-colors">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Tribute Button */}
      <div className="absolute top-4 right-4 z-50">
        <button 
            onClick={() => setShowTribute(true)}
            className="border border-[#FFD700] text-[#FFD700] bg-black/80 backdrop-blur px-4 py-2 text-xs hover:bg-[#FFD700] hover:text-black transition-all flex items-center gap-2 uppercase tracking-widest shadow-[0_0_10px_rgba(255,215,0,0.2)]"
        >
          <Coins className="w-3 h-3" /> Offer Tribute
        </button>
      </div>
      
      {/* Error Display */}
      {error && (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 right-4 p-3 bg-[#FF3333]/10 border border-[#FF3333] text-xs text-[#FF3333] rounded z-50"
        >
            {error}
        </motion.div>
      )}

      {/* Tribute Modal */}
      <AnimatePresence>
         {showTribute && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
           >
             <motion.div 
               initial={{ scale: 0.95 }}
               animate={{ scale: 1 }}
               className="bg-black border border-[#FFD700] p-8 max-w-sm w-full relative shadow-[0_0_50px_rgba(255,215,0,0.15)]"
             >
               <button 
                 onClick={() => setShowTribute(false)}
                 className="absolute top-4 right-4 text-[#FFD700] hover:text-white transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>
               
               <div className="flex flex-col items-center space-y-6 text-center">
                 <div className="w-32 h-32 bg-white p-2">
                   <div className="w-full h-full bg-black flex items-center justify-center text-white text-[10px] font-mono break-all p-1">
                     [QR_CODE_USDT_TRC20]
                   </div>
                 </div>
                 
                 <div>
                   <h3 className="text-[#FFD700] font-bold tracking-widest text-lg mb-1 font-mono">OFFER TRIBUTE</h3>
                   <p className="text-[#FFD700]/60 text-xs font-mono">Reduce bad karma instantly.</p>
                 </div>
 
                 <div className="bg-[#FFD700]/5 p-3 border border-[#FFD700]/20 w-full text-[10px] text-[#FFD700] font-mono break-all select-all cursor-pointer">
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
                    className="w-full bg-[#FFD700] text-black font-bold py-3 hover:bg-[#E5C100] transition-colors uppercase text-xs tracking-[0.2em] font-mono"
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
