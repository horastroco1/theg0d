'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Activity, Coins, X, Sparkles, Wifi, Battery, Zap, Lock, Copy } from 'lucide-react';
import { astrologyService, HoroscopeData } from '@/services/astrologyService';
import { geminiService } from '@/services/geminiService';
import { security } from '@/lib/security';
import { paymentService } from '@/services/paymentService';
import { createClient } from '@/lib/supabase';
import { cryptoService } from '@/lib/crypto'; // Import encryption helper

interface GodDashboardProps { userData: any; }

interface Message {
  id: string;
  text: string;
  sender: 'god' | 'user';
}

type PaymentType = 'RECHARGE' | 'PATCH' | 'DEEP_SCAN';

const generateId = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2);

export default function GodDashboard({ userData }: GodDashboardProps) {
  const initializationRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [horoscope, setHoroscope] = useState<HoroscopeData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sanity, setSanity] = useState(100);
  const [energy, setEnergy] = useState(5); // Daily Free Credits
  const [showPaymentModal, setShowPaymentModal] = useState<{show: boolean, type: PaymentType | null}>({ show: false, type: null });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // Ref for auto-focus
  const [isTyping, setIsTyping] = useState(false);

  // Use user data or default if missing
  const finalUserData = userData || {
    name: "Subject",
    locationName: "Unknown Grid",
    identity_key: null
  };

  // --- Initialization Logic ---
  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    // Check local storage for today's energy
    const today = new Date().toISOString().split('T')[0];
    const storedEnergy = localStorage.getItem(`energy_${today}`);
    if (storedEnergy) {
        setEnergy(parseInt(storedEnergy));
    } else {
        localStorage.setItem(`energy_${today}`, '5');
        setEnergy(5);
    }

    const init = async () => {
      setMessages([{ id: generateId(), text: "Initializing Neural Link...", sender: 'god' }]);
      const supabase = createClient();

      try {
        // --- CHART CACHING LOGIC ---
        let data;
        
        if (userData.chart_data) {
            console.log("🔮 LOADING CHART FROM CACHE...");
            data = userData.chart_data;
        } else {
            console.log("🔮 CALCULATING FRESH CHART...");
            data = await astrologyService.calculateHoroscope(finalUserData);
        }

        setHoroscope(data);
        setLoading(false);

        // --- LOAD PREVIOUS CHAT (ENCRYPTED) ---
        if (finalUserData.identity_key) {
            console.log("🔐 DECRYPTING ARCHIVES...");
            const { data: history, error } = await supabase
                .from('messages')
                .select('*')
                .eq('user_key', finalUserData.identity_key)
                .order('created_at', { ascending: true });

            if (history && history.length > 0) {
                const decryptedMessages = history.map((msg: any) => ({
                    id: msg.id,
                    text: cryptoService.decrypt(msg.content, finalUserData.identity_key),
                    sender: msg.sender as 'god' | 'user'
                }));
                setMessages(decryptedMessages);
                
                // Add "Resume" message
                setMessages(prev => [...prev, { id: generateId(), text: "CONNECTION RESTORED. I REMEMBER EVERYTHING.", sender: 'god' }]);
            } else {
                // New Session Greetings
                setTimeout(() => {
                    setMessages(prev => [
                        ...prev,
                        { id: generateId(), text: `Connected. Subject: ${finalUserData.name}.`, sender: 'god' },
                        { id: generateId(), text: `Moon: ${data.moon_sign} | Dasha: ${data.current_dasha}`, sender: 'god' },
                        { id: generateId(), text: "I am listening. What is your query?", sender: 'god' }
                    ]);
                }, 1200);
            }
        }

      } catch (e: any) {
        setLoading(false);
        setMessages(prev => [...prev, { id: generateId(), text: `Connection Failed: ${e.message}`, sender: 'god' }]);
      }
    };
    init();
  }, [finalUserData, userData.chart_data]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Sanity Drain
  useEffect(() => {
    const interval = setInterval(() => setSanity(s => Math.max(0, s - 0.5)), 3000);
    return () => clearInterval(interval);
  }, []);

  // Update Local Storage when energy changes
  useEffect(() => {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`energy_${today}`, energy.toString());
  }, [energy]);

  const saveMessage = async (text: string, sender: 'user' | 'god') => {
      if (!finalUserData.identity_key) return;
      
      const supabase = createClient();
      const encryptedContent = cryptoService.encrypt(text, finalUserData.identity_key);
      
      await supabase.from('messages').insert([{
          user_key: finalUserData.identity_key,
          sender: sender,
          content: encryptedContent
      }]);
  };

  const SUGGESTED_QUESTIONS = [
    "Why am I like this?",
    "Predict my career path",
    "Is my love life cursed?",
    "What is my purpose?",
    "System Diagnostics"
  ];

  const handleSend = async (e: React.FormEvent | null, overrideText?: string) => {
    if (e) e.preventDefault();
    
    if (energy <= 0) {
        setShowPaymentModal({ show: true, type: 'RECHARGE' });
        return;
    }

    const rawText = overrideText || input;
    if (!rawText.trim() || isTyping) return;

    if (!security.checkRateLimit('chat_msg', 10, 60)) {
        setMessages(prev => [...prev, { id: generateId(), text: "SYSTEM ALERT: RATE LIMIT EXCEEDED.", sender: 'god' }]);
        return;
    }

    const text = security.sanitizeInput(rawText);

    setInput('');
    setEnergy(e => e - 1);
    inputRef.current?.focus();
    
    const newHistory: Message[] = [...messages, { id: generateId(), text, sender: 'user' }];
    setMessages(newHistory);
    
    // SAVE USER MSG (Encrypted)
    saveMessage(text, 'user');

    setIsTyping(true);
    setSanity(s => Math.max(0, s - 2));

    try {
      const apiHistory = newHistory.map(m => ({ role: m.sender, text: m.text }));

      const response = await geminiService.getGodResponse(
        apiHistory, 
        {
            horoscopeData: horoscope,
            userLocation: finalUserData.locationName || "Unknown Grid"
        }
      );
      
      setMessages(prev => [...prev, { id: generateId(), text: response, sender: 'god' }]);
      
      // SAVE GOD MSG (Encrypted)
      saveMessage(response, 'god');

    } catch (err) {
      setMessages(prev => [...prev, { id: generateId(), text: "Signal Lost.", sender: 'god' }]);
    } finally {
      setIsTyping(false);
    }
  };

   const handlePayment = async () => {
      setPaymentLoading(true);
      setPaymentResult(null);
      const type = showPaymentModal.type;
      let amount = 5;
      let desc = "Energy Recharge";

      if (type === 'PATCH') { amount = 3; desc = "System Patch"; }
      if (type === 'DEEP_SCAN') { amount = 10; desc = "Deep Soul Analysis"; }

      try {
          const result: any = await paymentService.createPayment({ amount, description: desc });
          setPaymentLoading(false);
          setPaymentResult(result);
      } catch (e) {
          setPaymentLoading(false);
          alert("Payment Gateway Error. Check Console.");
      }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-black text-[#F5F5F7] font-sans overflow-hidden">
      
      {/* --- HEADER --- */}
      <div className="pt-4 pb-2 px-6 flex justify-between items-center bg-black/80 backdrop-blur-xl z-50 border-b border-white/5 sticky top-0 flex-shrink-0">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#00FF41]/10 flex items-center justify-center border border-[#00FF41]/20">
                <Activity className="w-4 h-4 text-[#00FF41]" />
            </div>
            <div>
                <h1 className="text-xs font-bold tracking-widest uppercase text-white">theg0d</h1>
                <div className="flex items-center gap-1 text-[10px] text-[#86868B]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse"></span>
                    ENCRYPTED UPLINK
                </div>
            </div>
        </div>

        <div className="flex items-center gap-4 bg-[#1C1C1E] px-4 py-2 rounded-full border border-white/5">
            <div className="flex items-center gap-2">
                 <Battery className={`w-3 h-3 ${energy < 2 ? 'text-red-500 animate-pulse' : 'text-[#00FF41]'}`} />
                 <span className="text-[10px] font-mono text-[#86868B]">{energy}/5</span>
            </div>
            <div className="w-[1px] h-3 bg-white/10"></div>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#86868B]">SANITY</span>
                <div className="w-16 h-1 bg-[#333] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 to-[#00FF41] transition-all duration-1000" style={{ width: `${sanity}%` }}></div>
                </div>
            </div>
            <div className="w-[1px] h-3 bg-white/10"></div>
            <button onClick={() => setShowPaymentModal({ show: true, type: 'RECHARGE' })} className="text-[#FFD700] hover:text-white transition-colors">
                <Coins className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* --- CHAT --- */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide relative w-full">
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none">
            <Wifi className="w-96 h-96" />
        </div>

        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] md:max-w-[65%] px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
              msg.sender === 'god' 
                ? 'bg-[#1C1C1E] border border-white/5 text-[#F5F5F7] rounded-tl-sm font-mono' 
                : 'bg-[#00FF41] text-black font-medium rounded-tr-sm shadow-[0_0_15px_rgba(0,255,65,0.15)]'
            }`}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-[#1C1C1E] px-4 py-3 rounded-2xl rounded-tl-sm border border-white/5 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#86868B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-[#86868B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-[#86868B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
            </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* --- INPUT --- */}
      <div className="p-4 md:p-6 bg-gradient-to-t from-black via-black to-transparent flex-shrink-0 z-40 w-full flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mask-linear-fade items-center">
             <button onClick={() => setShowPaymentModal({ show: true, type: 'DEEP_SCAN' })} className="flex items-center gap-1 whitespace-nowrap px-4 py-2 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-xs text-[#FFD700] hover:bg-[#FFD700]/20 transition-all flex-shrink-0">
                <Lock className="w-3 h-3" /> DEEP SCAN ($10)
             </button>
            {SUGGESTED_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => handleSend(null, q)} disabled={isTyping} className="whitespace-nowrap px-4 py-2 rounded-full bg-[#1C1C1E] border border-white/10 text-xs text-[#86868B] hover:text-[#00FF41] hover:border-[#00FF41]/30 transition-all flex-shrink-0 disabled:opacity-50">
                    {q}
                </button>
            ))}
        </div>

        <form onSubmit={handleSend} className="relative max-w-3xl mx-auto w-full">
            <input 
                ref={inputRef}
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={energy > 0 ? "Encrypted Input..." : "RECHARGE REQUIRED"}
                disabled={energy <= 0}
                className="w-full bg-[#1C1C1E]/90 backdrop-blur-md text-white pl-6 pr-14 py-4 rounded-full border border-white/10 focus:border-[#00FF41]/30 focus:ring-1 focus:ring-[#00FF41]/30 outline-none transition-all shadow-2xl placeholder-[#555] text-base disabled:opacity-50"
                autoComplete="off"
            />
            <button type="submit" disabled={!input.trim() || isTyping || energy <= 0} className="absolute right-2 top-2 w-10 h-10 bg-[#00FF41] rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-0 disabled:scale-50">
                <Send className="w-5 h-5 ml-0.5" />
            </button>
        </form>
      </div>

      {/* --- PAYMENT MODAL --- */}
      <AnimatePresence>
        {showPaymentModal.show && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="bg-[#1C1C1E] w-full max-w-md rounded-t-[32px] md:rounded-[32px] border border-white/10 p-8 relative shadow-2xl pb-12 md:pb-8">
              <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-8 md:hidden"></div>
              <button onClick={() => setShowPaymentModal({ show: false, type: null })} className="absolute top-6 right-6 bg-[#2C2C2E] p-2 rounded-full text-[#86868B] hover:text-white transition-colors"><X className="w-4 h-4" /></button>
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-[#00FF41]/10 rounded-full flex items-center justify-center mx-auto border border-[#00FF41]/20 relative"><Coins className="w-10 h-10 text-[#00FF41]" /></div>
                <div><h3 className="text-2xl font-bold text-white mb-2">Recharge Signal</h3><p className="text-[#86868B] text-sm">Restore connection bandwidth.</p></div>
                {paymentLoading ? (
                  <div className="py-8 flex flex-col items-center gap-4"><div className="w-16 h-16 relative"><div className="absolute inset-0 border-4 border-[#00FF41]/20 rounded-full"></div><div className="absolute inset-0 border-4 border-[#00FF41] rounded-full border-t-transparent animate-spin"></div></div><div className="text-[#00FF41] animate-pulse text-sm font-mono text-center">GENERATING ADDRESS...</div></div>
                ) : paymentResult ? (
                    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                         <div className="bg-white p-2 rounded-xl w-fit mx-auto">
                             <img src={paymentResult.qr_code_url} alt="QR Code" className="w-48 h-48 object-contain" />
                         </div>
                         <div className="space-y-2">
                              <p className="text-xs text-[#86868B] uppercase tracking-widest">Send {paymentResult.amount} {paymentResult.pay_currency.toUpperCase()}</p>
                              <div 
                                 onClick={() => navigator.clipboard.writeText(paymentResult.pay_address)}
                                 className="bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-xs text-[#00FF41] break-all select-all cursor-pointer hover:border-[#00FF41]/50 transition-all flex items-center justify-between gap-2 group"
                              >
                                 <span>{paymentResult.pay_address}</span>
                                 <Copy className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                              </div>
                         </div>
                         <button 
                             onClick={() => {
                                 setShowPaymentModal({ show: false, type: null });
                                 if (showPaymentModal.type === 'RECHARGE') setEnergy(e => e + 20);
                                 setPaymentResult(null);
                             }} 
                             className="w-full bg-[#00FF41] text-black font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                         >
                             I HAVE SENT IT
                         </button>
                    </div>
                ) : (
                    <div className="space-y-4"><div className="bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-xs text-[#86868B] break-all select-all cursor-pointer hover:border-[#00FF41]/30 transition-colors">T9yD14Nj9j7xAB4dbGeiX9h8unkkhxnXVpe</div><button onClick={handlePayment} className="w-full bg-[#00FF41] text-black font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"><Sparkles className="w-4 h-4" />CONFIRM PAYMENT</button></div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
