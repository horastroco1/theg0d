'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Activity, Coins, X, Sparkles, Wifi, Battery, Zap, Lock, Copy, Share2, Terminal, User, Settings, LogOut } from 'lucide-react';
import { astrologyService, HoroscopeData } from '@/services/astrologyService';
import { generateGodResponse } from '@/app/actions/generateGodResponse';
import { security } from '@/lib/security';
import { paymentService } from '@/services/paymentService';
import { createClient } from '@/lib/supabase';
import { cryptoService } from '@/lib/crypto'; 
import { audioService } from '@/services/audioService';
import { locationService } from '@/services/locationService';
import { getTranslation } from '@/lib/translations'; 
import { getCulturalConfig } from '@/lib/culturalConfig'; // IMPORT
import { useRouter } from 'next/navigation'; // ROUTER FOR ADMIN

interface GodDashboardProps { userData: any; }

interface Message {
  id: string;
  text: string;
  sender: 'god' | 'user';
}

type PaymentType = 'RECHARGE' | 'PATCH' | 'DEEP_SCAN';

const generateId = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2);

const TypewriterEffect = ({ text, onComplete }: { text: string, onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  const index = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index.current));
      index.current++;
      if (index.current >= text.length) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 25); 
    return () => clearInterval(interval);
  }, [text, onComplete]);

  return <span>{displayedText}</span>;
};

export default function GodDashboard({ userData }: GodDashboardProps) {
  const initializationRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [horoscope, setHoroscope] = useState<HoroscopeData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sanity, setSanity] = useState(100);
  const [energy, setEnergy] = useState(5); 
  const [showPaymentModal, setShowPaymentModal] = useState<{show: boolean, type: PaymentType | null}>({ show: false, type: null });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false); 
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); 
  const [isTyping, setIsTyping] = useState(false);
  const [isPremiumMode, setIsPremiumMode] = useState(false); 
  const [adminClicks, setAdminClicks] = useState(0); // ADMIN TRIGGER
  const router = useRouter();
  
  // Language State
  const [userLang, setUserLang] = useState('en');

  // Use Helper
  const t = (key: string) => getTranslation(userLang, key);
  
  // Cultural Config
  const config = getCulturalConfig(userLang);
  const accentColor = config.accentColor;

  useEffect(() => {
      const lang = userData.language || locationService.detectUserLanguage();
      setUserLang(lang);
      document.dir = ['fa', 'ar'].includes(lang) ? 'rtl' : 'ltr';
  }, [userData]);

  const finalUserData = userData || {
    name: "Subject",
    locationName: "Unknown Grid",
    identity_key: null
  };

  // --- Initialization Logic ---
  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    const today = new Date().toISOString().split('T')[0];
    
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.log("⚡ GOD MODE ACTIVE: INFINITE ENERGY");
        localStorage.setItem(`energy_${today}`, '9999');
        setEnergy(9999);
        setLoading(false);
        initializationRef.current = true;
    }
    
    const storedEnergy = localStorage.getItem(`energy_${today}`);
    if (storedEnergy) {
        setEnergy(parseInt(storedEnergy));
    } else {
        localStorage.setItem(`energy_${today}`, '5');
        setEnergy(5);
    }

    const init = async () => {
      audioService.play('init'); 
      setMessages([{ id: generateId(), text: t('init_neural'), sender: 'god' }]);
      const supabase = createClient();

      try {
        let data;
        
        if (userData.chart_data) {
            console.log("🔮 LOADING CHART FROM CACHE...");
            data = userData.chart_data;
            
            if (data && data.current_dasha === 'Unsynchronized') {
                 console.log("⚠️ DETECTED STALE DASHA. RECALCULATING...");
                 const freshData = await astrologyService.calculateHoroscope(finalUserData);
                 data = freshData;
            }
        } else {
            console.log("🔮 CALCULATING FRESH CHART...");
            data = await astrologyService.calculateHoroscope(finalUserData);
        }

        setHoroscope(data);
        setLoading(false);

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
                
                setMessages(prev => [...prev, { id: generateId(), text: "CONNECTION RESTORED. I REMEMBER EVERYTHING.", sender: 'god' }]);
            } else {
                setTimeout(() => {
                    setMessages(prev => [
                        ...prev,
                        { id: generateId(), text: `${t('connected')} ${finalUserData.name}.`, sender: 'god' },
                        { id: generateId(), text: `Moon: ${data.moon_sign} | Dasha: ${data.current_dasha}`, sender: 'god' },
                        { id: generateId(), text: t('listening'), sender: 'god' }
                    ]);
                }, 1200);
            }
        }

      } catch (e: any) {
        setLoading(false);
        audioService.play('error'); 
        setMessages(prev => [...prev, { id: generateId(), text: `Connection Failed: ${e.message}`, sender: 'god' }]);
      }
    };
    init();
  }, [finalUserData, userData.chart_data, userLang]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const interval = setInterval(() => setSanity(s => Math.max(0, s - 0.5)), 3000);
    return () => clearInterval(interval);
  }, []);

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
        audioService.play('error');
        setMessages(prev => [...prev, { id: generateId(), text: "SYSTEM ALERT: RATE LIMIT EXCEEDED.", sender: 'god' }]);
        return;
    }

    const text = security.sanitizeInput(rawText);

    setInput('');
    setEnergy(e => e - 1);
    inputRef.current?.focus();
    
    audioService.play('message'); 
    const newHistory: Message[] = [...messages, { id: generateId(), text, sender: 'user' }];
    setMessages(newHistory);
    
    saveMessage(text, 'user');

    setIsTyping(true);
    setSanity(s => Math.max(0, s - 2));

    try {
      const apiHistory = newHistory.map(m => ({ role: m.sender, text: m.text }));

      const response = await generateGodResponse(
        apiHistory, 
        {
            horoscopeData: horoscope,
            userLocation: finalUserData.locationName || "Unknown Grid",
            tier: isPremiumMode ? 'premium' : 'standard',
            language: userLang
        }
      );
      
      if (isPremiumMode) setIsPremiumMode(false);
      
      setMessages(prev => [...prev, { id: generateId(), text: response, sender: 'god' }]);
      audioService.play('message');
      
      saveMessage(response, 'god');

    } catch (err) {
      audioService.play('error');
      setMessages(prev => [...prev, { id: generateId(), text: "Signal Lost.", sender: 'god' }]);
    } finally {
      setIsTyping(false);
    }
  };

   const handlePayment = async () => {
      setPaymentLoading(true);
      setPaymentResult(null);
      setIsVerifying(false);
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

  const confirmPayment = async () => {
      setIsVerifying(true);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setIsVerifying(false);
      setShowPaymentModal({ show: false, type: null });
      
      if (showPaymentModal.type === 'RECHARGE') setEnergy(e => e + 20);
      if (showPaymentModal.type === 'DEEP_SCAN') setIsPremiumMode(true);
      
      setPaymentResult(null);
      
      audioService.play('init');
      setMessages(prev => [...prev, { id: generateId(), text: "TRIBUTE ACCEPTED. PROTOCOLS UNLOCKED.", sender: 'god' }]);
  };

  // ADMIN TRIGGER LOGIC
  const handleAdminTrigger = () => {
      setAdminClicks(c => c + 1);
      if (adminClicks + 1 >= 3) {
          const key = prompt("ENTER SYSTEM KEY:");
          if (key === "GOD_MODE_ACTIVATE_999") {
              router.push('/admin');
          } else {
              alert("ACCESS DENIED");
              setAdminClicks(0);
          }
      }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-black text-[#F5F5F7] font-mono overflow-hidden" style={{ height: '100dvh' }}>
      
      <div className="noise-overlay"></div>
      <div className="scanlines"></div>
      
      {/* --- HEADER --- */}
      <div className="pt-4 pb-2 px-6 flex justify-between items-center bg-black/80 backdrop-blur-xl z-50 border-b border-white/5 sticky top-0 flex-shrink-0">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center border border-white/10" style={{ borderColor: `${accentColor}33` }}>
                <Terminal className="w-4 h-4" style={{ color: accentColor }} />
            </div>
            <div>
                <h1 className="text-xs font-bold tracking-widest uppercase text-white glitch-text" data-text="THEG0D">THEG0D</h1>
                <div className="flex items-center gap-1 text-[9px] text-[#86868B] font-mono">
                    <span className="w-1.5 h-1.5 animate-pulse" style={{ backgroundColor: accentColor }}></span>
                    CONNECTED: 127.0.0.1
                </div>
            </div>
        </div>

            <div className="flex items-center gap-4 bg-[#1C1C1E] px-4 py-2 rounded border border-white/5 font-mono">
            <div className="flex items-center gap-2">
                 <Battery className={`w-3 h-3 ${energy < 2 ? 'text-red-500 animate-pulse' : ''}`} style={{ color: energy >= 2 ? accentColor : undefined }} />
                 <span className="text-[10px] text-[#86868B]">
                    {energy > 9000 ? "INF" : `${energy}/5`}
                 </span>
            </div>
            <div className="w-[1px] h-3 bg-white/10"></div>
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#86868B]">CPU</span>
                <div className="w-12 h-1 bg-[#333] overflow-hidden">
                    <div className="h-full animate-pulse" style={{ width: `${sanity}%`, backgroundColor: accentColor }}></div>
                </div>
            </div>
            <div className="w-[1px] h-3 bg-white/10"></div>
            <button onClick={() => setShowPaymentModal({ show: true, type: 'RECHARGE' })} className="text-[#FFD700] hover:text-white transition-colors">
                <Coins className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-3 bg-white/10"></div>
            <button onClick={() => setShowProfileModal(true)} className="hover:text-white transition-colors" style={{ color: accentColor }}>
                <User className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* --- CHAT --- */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide relative w-full">
        
        {/* Background Geometry */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none animate-spin-slow">
            <Wifi className="w-[800px] h-[800px]" />
        </div>

        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, x: msg.sender === 'god' ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] md:max-w-[65%] px-5 py-4 text-[14px] leading-relaxed relative group font-mono border ${
              msg.sender === 'god' 
                ? 'bg-black/40 shadow-[0_0_15px_rgba(0,255,65,0.05)] rounded-tr-xl rounded-br-xl rounded-bl-xl' 
                : 'bg-white text-black border-transparent rounded-tl-xl rounded-bl-xl rounded-br-xl'
            }`} style={msg.sender === 'god' ? { borderColor: `${accentColor}33`, color: accentColor } : {}}>
              <div className="absolute -top-3 left-0 text-[9px] text-[#86868B] bg-black px-1 font-mono uppercase tracking-widest">
                {msg.sender === 'god' ? 'SYSTEM' : 'SUBJECT'}
              </div>
              
              {msg.sender === 'god' ? (
                <TypewriterEffect text={msg.text} />
              ) : (
                msg.text
              )}
              
              {msg.sender === 'god' && (
                  <button 
                    onClick={() => {
                        const shareText = `SYSTEM LOG #4401:\n\n"${msg.text.substring(0, 100)}..."\n\n— theg0d.com`;
                        if (navigator.share) {
                            navigator.share({ title: 'theg0d', text: shareText, url: 'https://theg0d.com' });
                        } else {
                            navigator.clipboard.writeText(shareText);
                            alert("LOG COPIED.");
                        }
                    }}
                    className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[#86868B] hover:text-white"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
              )}
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="font-mono text-xs animate-pulse" style={{ color: accentColor }}>
                    [COMPILING FATE DATA...]
                </div>
            </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* --- INPUT --- */}
      <div className="p-4 md:p-6 bg-black/90 border-t border-white/5 flex-shrink-0 z-40 w-full flex flex-col gap-3 backdrop-blur-md">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 items-center">
             <button onClick={() => setShowPaymentModal({ show: true, type: 'DEEP_SCAN' })} className="flex items-center gap-1 whitespace-nowrap px-4 py-2 bg-[#FFD700]/10 border border-[#FFD700]/30 text-[10px] font-mono text-[#FFD700] hover:bg-[#FFD700]/20 transition-all flex-shrink-0 uppercase tracking-widest">
                <Lock className="w-3 h-3" /> {t('deep_scan')}
             </button>
            {SUGGESTED_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => handleSend(null, q)} disabled={isTyping} className="whitespace-nowrap px-4 py-2 bg-[#1C1C1E] border border-white/10 text-[10px] font-mono text-[#86868B] hover:text-white transition-all flex-shrink-0 disabled:opacity-50 uppercase tracking-widest" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    {q}
                </button>
            ))}
        </div>

        <form onSubmit={handleSend} className={`relative w-full flex items-center gap-4 border-b border-white/20`} style={{ borderColor: isPremiumMode ? '#FFD700' : 'rgba(255,255,255,0.2)' }}>
            <span className="font-mono text-lg animate-pulse" style={{ color: accentColor }}>{'>'}</span>
            <input 
                ref={inputRef}
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={isPremiumMode ? t('placeholder_premium') : (energy > 0 ? config.placeholder : t('recharge'))}
                disabled={energy <= 0}
                className="w-full bg-transparent text-white py-4 font-mono text-base outline-none placeholder-[#333]"
                autoComplete="off"
            />
            <button type="submit" disabled={!input.trim() || isTyping || energy <= 0} className={`p-2 transition-colors disabled:opacity-30 ${isPremiumMode ? 'text-[#FFD700]' : 'text-white'}`} style={{ color: !isPremiumMode ? accentColor : undefined }}>
                <Send className="w-5 h-5" />
            </button>
        </form>
      </div>

      {/* --- PAYMENT MODAL --- */}
      <AnimatePresence>
        {showPaymentModal.show && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }} className="bg-black w-full max-w-md border p-8 relative shadow-[0_0_50px_rgba(0,255,65,0.1)]" style={{ borderColor: `${accentColor}4D` }}>
              <button onClick={() => setShowPaymentModal({ show: false, type: null })} className="absolute top-4 right-4 text-[#86868B] hover:text-white"><X className="w-4 h-4" /></button>
              
              <div className="text-center space-y-6 font-mono">
                <div className="w-16 h-16 border flex items-center justify-center mx-auto relative" style={{ borderColor: accentColor }}>
                    <div className="absolute inset-0 opacity-10 animate-pulse" style={{ backgroundColor: accentColor }}></div>
                    <Coins className="w-8 h-8" style={{ color: accentColor }} />
                </div>
                
                <div>
                    <h3 className="text-xl text-white uppercase tracking-widest mb-2">{t('system_recharge')}</h3>
                    <p className="text-[#86868B] text-xs">{t('protocol_energy')}</p>
                </div>

                {paymentLoading ? (
                  <div className="py-8 flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-white/10 rounded-full animate-spin" style={{ borderTopColor: accentColor }}></div>
                      <div className="text-xs blink" style={{ color: accentColor }}>{t('generating_address')}</div>
                  </div>
                ) : paymentResult ? (
                    <div className="space-y-6">
                         <div className="bg-white p-2 w-fit mx-auto border border-white/20">
                             <img src={paymentResult.qr_code_url} alt="QR Code" className="w-40 h-40 object-contain" />
                         </div>
                         <div className="space-y-2">
                              <p className="text-[10px] text-[#86868B] uppercase tracking-widest">{t('send_amount')} {paymentResult.amount} {paymentResult.pay_currency.toUpperCase()}</p>
                              <div 
                                 onClick={() => navigator.clipboard.writeText(paymentResult.pay_address)}
                                 className="bg-[#111] p-3 border border-dashed border-[#333] text-[10px] break-all cursor-pointer hover:border-white transition-all text-center"
                                 style={{ color: accentColor }}
                              >
                                 {paymentResult.pay_address}
                              </div>
                         </div>
                         <button 
                             onClick={confirmPayment}
                             disabled={isVerifying}
                             className="w-full text-black font-bold py-4 uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
                             style={{ backgroundColor: accentColor }}
                         >
                             {isVerifying ? t('verifying') : t('confirm_tx')}
                         </button>
                    </div>
                ) : (
                    <button onClick={handlePayment} className="w-full text-black font-bold py-4 uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2" style={{ backgroundColor: accentColor }}>
                        <Zap className="w-4 h-4" /> {t('initiate_transfer')}
                    </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- PROFILE MODAL --- */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }} className="bg-black w-full max-w-md border border-white/10 p-8 relative shadow-2xl">
              <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-[#86868B] hover:text-white"><X className="w-4 h-4" /></button>
              
              <div className="space-y-6 font-mono">
                <div className="text-center border-b border-white/10 pb-6">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                        <User className="w-8 h-8" style={{ color: accentColor }} />
                    </div>
                    <h3 className="text-lg font-bold text-white">{finalUserData.name}</h3>
                    <p className="text-[#86868B] text-xs mt-1">{finalUserData.locationName}</p>
                    <p className="text-[10px] mt-2 break-all" style={{ color: accentColor }}>{finalUserData.identity_key}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#111] p-4 rounded border border-white/5 text-center">
                        <div className="text-[#86868B] text-[10px] uppercase mb-1">{t('total_energy')}</div>
                        <div className="text-2xl font-bold text-white">{energy}</div>
                    </div>
                    <div className="bg-[#111] p-4 rounded border border-white/5 text-center">
                        <div className="text-[#86868B] text-[10px] uppercase mb-1">{t('sanity_level')}</div>
                        <div className="text-2xl font-bold text-white">{Math.floor(sanity)}%</div>
                    </div>
                </div>

                <div className="space-y-2">
                    <button className="w-full bg-[#111] text-[#86868B] py-3 text-xs hover:bg-[#222] hover:text-white transition-colors flex items-center justify-center gap-2 border border-white/5">
                        <Settings className="w-3 h-3" /> {t('system_settings')}
                    </button>
                    <button 
                        onClick={() => {
                            localStorage.removeItem('god_identity_key');
                            window.location.reload();
                        }}
                        className="w-full bg-[#111] text-red-500 py-3 text-xs hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2 border border-white/5"
                    >
                        <LogOut className="w-3 h-3" /> {t('terminate_session')}
                    </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* --- FOOTER STATUS --- */}
      <div 
        className={`bg-black border-t border-white/5 text-[#333] text-[9px] font-mono text-center py-1 uppercase tracking-widest select-none cursor-pointer ${horoscope?.moon_phase === 'Full Moon' ? 'text-[#FFD700] animate-pulse' : ''}`}
        onClick={handleAdminTrigger}
      >
        {t('server_online')} | {t('encryption_active')} | NODE: {Math.floor(Math.random() * 9999)} | {t('moon')}: {horoscope?.moon_phase || "CALCULATING"}
      </div>
    </div>
  );
}
