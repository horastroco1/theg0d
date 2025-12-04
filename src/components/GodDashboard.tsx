'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Send, Coins, Terminal, X, Sparkles } from 'lucide-react';
import { astrologyService, HoroscopeData } from '@/services/astrologyService';
import { geminiService } from '@/services/geminiService';

interface GodDashboardProps { userData: any; }

interface Message {
  id: string;
  text: string;
  sender: 'god' | 'user';
}

// Unique ID Generator using crypto.randomUUID if available, otherwise fallback
const generateId = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2);

export default function GodDashboard({ userData }: GodDashboardProps) {
  const initializationRef = useRef(false); // Strict ref to track init
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

  useEffect(() => {
    const interval = setInterval(() => {
      setSanity(s => Math.max(0, s - 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    const init = async () => {
      setLoading(true);
      // Use functional update to ensure clean state if rerendered
      setMessages([{ id: generateId(), text: "CONNECTING TO COSMIC MAINFRAME...", sender: 'god' }]);
      
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

        setTimeout(() => {
            setMessages(prev => [
                ...prev,
                { id: generateId(), text: `IDENTITY VERIFIED: ${userData.name.toUpperCase()}.`, sender: 'god' },
                { id: generateId(), text: `MOON: ${moonSign}. CURRENT CYCLE: ${dasha}.`, sender: 'god' },
                { id: generateId(), text: "WHAT IS YOUR QUERY, SEEKER?", sender: 'god' }
            ]);
        }, 1000);

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
    
    setMessages(prev => [...prev, { id: generateId(), text: userText, sender: 'user' }]);
    setSanity(s => Math.max(0, s - 5));

    try {
      const response = await geminiService.getGodResponse(userText, horoscope);
      setMessages(prev => [...prev, { id: generateId(), text: response, sender: 'god' }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: generateId(), text: "CONNECTION ERROR. TRY AGAIN.", sender: 'god' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-screen max-h-screen overflow-hidden relative z-10 p-4 gap-4 font-mono text-[#00FF41] bg-[#050505]">
      {/* HUD */}
      <div className="border border-[#00FF41]/50 bg-[#050505]/90 p-4 flex justify-between items-center rounded-lg backdrop-blur-md">
         <div className="flex items-center gap-2">
             <Activity className="w-4 h-4 animate-pulse" />
             <span className="text-xs">SANITY: {sanity}%</span>
         </div>
         <div className="flex gap-1">
            {[1,2,3,4,5].map(i => (
              <Zap key={i} className={`w-3 h-3 ${i <= energy ? 'fill-[#00FF41] text-[#00FF41]' : 'text-[#00FF41]/20'}`} />
            ))}
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
          {isTyping && (
             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs animate-pulse text-[#00FF41] flex items-center gap-2"
             >
                <Sparkles className="w-3 h-3 animate-spin" />
                GOD IS THINKING...
             </motion.div>
          )}
          <div ref={chatEndRef} />
          {loading && <div className="text-xs animate-pulse text-[#00FF41]">CALCULATING FATE...</div>}
        </div>

        <form onSubmit={handleSend} className="flex gap-2 border-t border-[#333] pt-4">
          <input 
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 bg-black border border-[#333] p-3 text-sm focus:outline-none focus:border-[#00FF41] text-white placeholder-gray-700 font-mono"
            placeholder="ENTER COMMAND..."
            disabled={loading || isTyping}
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
               <button onClick={() => setShowTribute(false)} className="absolute top-4 right-4 text-[#FFD700] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
               
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
                     setMessages(prev => [...prev, { id: generateId(), text: "TRIBUTE RECEIVED. ENERGY RESTORED.", sender: 'god' }]);
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
