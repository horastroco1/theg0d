'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Activity, Coins, X, Sparkles, Battery, Zap, Lock, Copy, Share2, Terminal, User, Settings, LogOut, AlertTriangle, Eye, Radio, ArrowRight, Book } from 'lucide-react';
import { astrologyService, HoroscopeData } from '@/services/astrologyService';
import { generateGodResponse } from '@/app/actions/generateGodResponse';
import { security } from '@/lib/security';
import { paymentService } from '@/services/paymentService';
import { createClient } from '@/lib/supabase';
import { cryptoService } from '@/lib/crypto'; 
import { audioService } from '@/services/audioService';
import { locationService } from '@/services/locationService';
import { TheGodLogo } from './TheGodLogo';
import { getTranslation } from '@/lib/translations'; 
import { getCulturalConfig } from '@/lib/culturalConfig'; 
import { useRouter } from 'next/navigation';
import InstallPrompt from './InstallPrompt';

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

// VISUAL MOON COMPONENT
const VisualMoon = ({ phase, accentColor }: { phase: string | undefined, accentColor: string }) => {
    // Simple approximation of phases to visual representation
    // New, Waxing, Full, Waning
    let shadowX = 0;
    let opacity = 0.2;
    let isFull = false;

    if (phase === 'New Moon') { opacity = 0.05; }
    else if (phase?.includes('Crescent')) { shadowX = 10; opacity = 0.4; }
    else if (phase?.includes('Quarter')) { shadowX = 20; opacity = 0.6; }
    else if (phase?.includes('Gibbous')) { shadowX = 30; opacity = 0.8; }
    else if (phase === 'Full Moon') { shadowX = 0; opacity = 1; isFull = true; }

    return (
        <div className={`w-8 h-8 rounded-full relative ${isFull ? 'moon-glow-gold' : 'moon-glow'}`} style={{ backgroundColor: isFull ? '#FFD700' : '#F5F5F7', opacity: opacity }}>
            {!isFull && (
                <div 
                    className="absolute inset-0 rounded-full bg-black transition-all duration-1000" 
                    style={{ transform: `translateX(${shadowX}%) scale(0.9)` }}
                ></div>
            )}
        </div>
    );
};

export default function GodDashboard({ userData }: GodDashboardProps) {
  const initializationRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [horoscope, setHoroscope] = useState<HoroscopeData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sanity, setSanity] = useState(100);
  const [energy, setEnergy] = useState(userData.energy || 5); 
  const [maxEnergy, setMaxEnergy] = useState(userData.max_energy || 5);
  const [xp, setXp] = useState(userData.xp || 0);
  const [level, setLevel] = useState(userData.level || 0);
  const [showPaymentModal, setShowPaymentModal] = useState<{show: boolean, type: PaymentType | null}>({ show: false, type: null });
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // NEW STATE FOR OFFERINGS
  const [activeSkin, setActiveSkin] = useState(userData.active_skin || 'default');
  const [activeTab, setActiveTab] = useState<'STATUS' | 'ARCHIVES' | 'OFFERINGS' | 'MANUAL'>('STATUS');

  // DYNAMIC SKINNING ENGINE
  useEffect(() => {
      // Define skins map (In production this would fetch from DB 'skins' table)
      const SKINS: Record<string, any> = {
          'default': { bg: '#050505', text: '#F5F5F7', accent: '#FFD700' },
          'nebula_purple': { bg: '#1a0b2e', text: '#e0d0ff', accent: '#b388ff' },
          'blood_moon': { bg: '#1a0505', text: '#ffcccc', accent: '#ff0000' },
          'matrix_green': { bg: '#000500', text: '#00ff41', accent: '#00ff41' }
      };

      const theme = SKINS[activeSkin] || SKINS['default'];
      
      // Apply CSS Variables to Root
      const root = document.documentElement;
      root.style.setProperty('--bg-void', theme.bg);
      root.style.setProperty('--color-starlight', theme.text);
      root.style.setProperty('--accent-gold', theme.accent);
      
      // Force body update
      document.body.style.backgroundColor = theme.bg;
      document.body.style.color = theme.text;

  }, [activeSkin]);
  const [savedScans, setSavedScans] = useState<any[]>([]);
  const [selectedScan, setSelectedScan] = useState<any | null>(null);
  const [skins, setSkins] = useState<any[]>([]); // Store for fetchable skins

  useEffect(() => {
      if (showProfileModal) {
          if (activeTab === 'ARCHIVES') {
              const fetchScans = async () => {
                  const supabase = createClient();
                  const { data } = await supabase
                      .from('saved_scans')
                      .select('*')
                      .eq('user_key', finalUserData.identity_key)
                      .order('created_at', { ascending: false });
                  if (data) setSavedScans(data);
              };
              fetchScans();
          }
          if (activeTab === 'OFFERINGS') {
               const fetchSkins = async () => {
                  const supabase = createClient();
                  // 1. Get All Skins
                  const { data: allSkins } = await supabase.from('skins').select('*');
                  // 2. Get User Owned Skins
                  const { data: mySkins } = await supabase.from('user_skins').select('skin_id').eq('user_key', finalUserData.identity_key);
                  
                  const ownedIds = new Set(mySkins?.map(s => s.skin_id) || []);
                  // Add 'default' as always owned
                  ownedIds.add('default');

                  const formattedSkins = allSkins?.map(s => ({
                      ...s,
                      owned: ownedIds.has(s.id)
                  })) || [];
                  
                  setSkins(formattedSkins);
               };
               fetchSkins();
          }
      }
  }, [showProfileModal, activeTab]);
  const [showKarmicModal, setShowKarmicModal] = useState(false); 
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false); 
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); 
  const [isTyping, setIsTyping] = useState(false);
  const [isPremiumMode, setIsPremiumMode] = useState(false); 
  const [adminClicks, setAdminClicks] = useState(0); 
  const [broadcastMessage, setBroadcastMessage] = useState<string | null>(null); // NEW: Broadcast state
  const router = useRouter();
  
  const [userLang, setUserLang] = useState('en');
  const t = (key: string) => getTranslation(userLang, key);
  const config = getCulturalConfig(userLang);
  const accentColor = config.accentColor;
  const isRTL = ['fa', 'ar'].includes(userLang);

  useEffect(() => {
      const lang = userData.language || locationService.detectUserLanguage();
      setUserLang(lang);
      document.dir = isRTL ? 'rtl' : 'ltr';
      
      // Explicitly set font on body for Vazirmatn support
      if (isRTL) {
          document.body.style.fontFamily = 'var(--font-vazir), sans-serif';
          document.documentElement.lang = lang;
      } else {
          document.body.style.fontFamily = '';
          document.documentElement.lang = 'en';
      }
  }, [userData, isRTL]);

  const finalUserData = userData || {
    name: "Subject",
    locationName: "Unknown Grid",
    identity_key: null
  };

  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    const today = new Date().toISOString().split('T')[0];
    
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.log("⚡ GOD MODE ACTIVE: INFINITE ENERGY");
        setEnergy(9999);
        setLoading(false);
        initializationRef.current = true;
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

        // AUTO-SHOW KARMIC ALERT IF PATTERNS EXIST
        if (data.karmic_patterns && data.karmic_patterns.length > 0) {
            setTimeout(() => setShowKarmicModal(true), 2000);
        }

        // CHECK FOR BROADCASTS
        const { data: activeBroadcast } = await supabase
            .from('broadcasts')
            .select('message')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        
        if (activeBroadcast) {
            setBroadcastMessage(activeBroadcast.message);
        }

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
                
                setMessages(prev => [...prev, { id: generateId(), text: "CONNECTION RESTORED. ARCHIVES LOADED.", sender: 'god' }]);
            } else {
                setTimeout(() => {
                    setMessages(prev => [
                        ...prev,
                        { id: generateId(), text: `${t('connected')} ${finalUserData.name.toUpperCase()}.`, sender: 'god' },
                        // NEW PSYCHOLOGICAL OPENER
                        { id: generateId(), text: `DETECTED: ${data.psychology?.strength?.toUpperCase() || "UNKNOWN POWER"} // HIDDEN: ${data.psychology?.weakness?.toUpperCase() || "UNKNOWN FEAR"}`, sender: 'god' },
                        { id: generateId(), text: `CORE OBSESSION: ${data.psychology?.obsession?.toUpperCase() || "UNKNOWN HUNGER"}`, sender: 'god' },
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
      // SYNC ENERGY & XP TO SUPABASE (Debounced)
      const timeout = setTimeout(async () => {
          if (!finalUserData.identity_key) return;
          const supabase = createClient();
          await supabase.from('users').update({ energy, xp, level }).eq('identity_key', finalUserData.identity_key);
      }, 2000);
      return () => clearTimeout(timeout);
  }, [energy, xp, level]);

  // LEVEL UP LOGIC
  useEffect(() => {
      const newLevel = Math.floor(Math.sqrt(xp / 50));
      if (newLevel > level) {
          setLevel(newLevel);
          audioService.play('init'); // Using init sound as level up for now
          setMessages(prev => [...prev, { id: generateId(), text: `SYSTEM UPGRADE: ACCESS LEVEL ${newLevel} GRANTED.`, sender: 'god' }]);
      }
  }, [xp]);

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
    
    const rawText = overrideText || input;
    
    if (energy <= 0 && rawText !== 'GOD_MODE_UNLIMITED') {
        setShowPaymentModal({ show: true, type: 'RECHARGE' });
        return;
    }

    if (!rawText.trim() || isTyping) return;

    // GOD MODE CHEAT CODE
    if (rawText === 'GOD_MODE_UNLIMITED') {
        audioService.play('init');
        setEnergy(9999);
        setIsPremiumMode(true);
        setInput('');
        setMessages(prev => [...prev, 
            { id: generateId(), text: "GOD_MODE_UNLIMITED", sender: 'user' },
            { id: generateId(), text: "SYSTEM OVERRIDE ACCEPTED. INFINITE ENERGY GRANTED. PREMIUM BANDWIDTH UNLOCKED.", sender: 'god' }
        ]);
        return;
    }

    // GOD MODE RESET
    if (rawText === 'GOD_MODE_RESET') {
        audioService.play('error');
        setEnergy(5);
        setIsPremiumMode(false);
        setInput('');
        setMessages(prev => [...prev,
            { id: generateId(), text: "GOD_MODE_RESET", sender: 'user' },
            { id: generateId(), text: "SYSTEM RESET. ENERGY DRAINED. PREMIUM BANDWIDTH LOCKED.", sender: 'god' }
        ]);
        return;
    }

    if (!security.checkRateLimit('chat_msg', 10, 60)) {
        audioService.play('error');
        setMessages(prev => [...prev, { id: generateId(), text: "SYSTEM ALERT: RATE LIMIT EXCEEDED.", sender: 'god' }]);
        return;
    }

    const text = security.sanitizeInput(rawText);

    setInput('');
    setEnergy(e => Math.max(0, e - 1));
    setXp(x => x + 1); // +1 XP for chatting
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
      
      // UPSELL TRIGGER FOR FREE USERS
      let finalText = response;
      if (!isPremiumMode && response.length > 50 && Math.random() > 0.7) {
          finalText += `\n\n[ SYSTEM ALERT: FULL DIAGNOSTIC REQUIRED. UNLOCK DEEP SCAN ]`;
      }

      // SAVE PREMIUM RESPONSE TO GRIMOIRE
      if (isPremiumMode || response.length > 300) { // Assuming long response = deep scan
          const supabase = createClient();
          await supabase.from('saved_scans').insert([{
              user_key: finalUserData.identity_key,
              type: 'DEEP_SCAN',
              content: response,
              moon_phase: horoscope?.moon_phase
          }]);
          setXp(x => x + 50); // +50 XP for Deep Scan
      }

      setMessages(prev => [...prev, { id: generateId(), text: finalText, sender: 'god' }]);
      audioService.play('message');
      
      saveMessage(finalText, 'god');

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
      if (type === 'DEEP_SCAN') { amount = 10; desc = "Protocol: Ascension (Deep Scan)"; }

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
      
      if (showPaymentModal.type === 'RECHARGE') {
          setEnergy(e => e + 20);
          setXp(x => x + 10);
      }
      if (showPaymentModal.type === 'DEEP_SCAN') {
          setIsPremiumMode(true);
          setXp(x => x + 20);
      }
      
      setPaymentResult(null);
      
      audioService.play('init');
      setMessages(prev => [...prev, { id: generateId(), text: "TRIBUTE ACCEPTED. PROTOCOLS UNLOCKED.", sender: 'god' }]);
  };

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
    <div className="flex flex-col h-[100dvh] bg-[#050505] text-[#F5F5F7] font-sans overflow-hidden" style={{ height: '100dvh' }}>
      
      {/* --- VIRAL IMPLANT --- */}
      <InstallPrompt />

      {/* --- HEADER (FOUNDATION STYLE) --- */}
      <div className="pt-6 pb-4 px-8 flex justify-between items-center z-50 sticky top-0 flex-shrink-0 bg-gradient-to-b from-[#050505] to-transparent">
        <div className="flex items-center gap-4">
            {/* VISUAL MOON ENGINE */}
            <VisualMoon phase={horoscope?.moon_phase} accentColor={accentColor} />
            
            <div>
                <TheGodLogo className="h-4 w-auto text-white opacity-90 mb-1" />
                <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono tracking-widest">
                    <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span>
                    {finalUserData.locationName.toUpperCase()}
                </div>
            </div>
        </div>

        <div className="flex items-center gap-6">
            {/* KARMIC ALERT ICON */}
            {horoscope?.karmic_patterns && horoscope.karmic_patterns.length > 0 && (
                <button onClick={() => setShowKarmicModal(true)} className="text-red-500 animate-pulse hover:text-red-400 transition-colors">
                    <AlertTriangle className="w-5 h-5" />
                </button>
            )}
            
            <button onClick={() => setShowPaymentModal({ show: true, type: 'RECHARGE' })} className="flex items-center gap-2 text-white/50 hover:text-[#FFD700] transition-colors font-mono text-xs">
                <Coins className="w-4 h-4" />
                <span>{energy}</span>
            </button>
            
            <button onClick={() => setShowProfileModal(true)} className="text-white/50 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* --- CHAT (THE VOID) --- */}
      <div className="flex-1 overflow-y-auto p-4 md:p-12 space-y-8 scrollbar-hide relative w-full max-w-5xl mx-auto">
        
        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
                className={`max-w-[85%] md:max-w-[70%] py-2 px-4 text-[15px] leading-relaxed relative group ${
                    msg.sender === 'god' 
                        ? 'text-white/90 text-left' 
                        : 'text-white/60 text-right rtl:text-left' 
                }`}
                style={isRTL && msg.sender === 'god' ? { textAlign: 'right' } : {}}
            >
              <div className={`text-[9px] uppercase tracking-[0.2em] mb-2 opacity-30 font-mono ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.sender === 'god' ? 'SYSTEM' : 'SUBJECT'}
              </div>
              
              {msg.sender === 'god' ? (
                <div className="font-light tracking-wide">
                    <TypewriterEffect text={msg.text} />
                </div>
              ) : (
                <div className="font-normal italic">
                    {msg.text}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start px-4 md:px-12">
                <div className="text-[10px] uppercase tracking-[0.2em] animate-pulse text-white/30">
                    Analyzing...
                </div>
            </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* --- INPUT (MONOLITH) --- */}
      <div className="p-6 md:p-12 z-40 w-full max-w-5xl mx-auto">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 items-center">
             <button onClick={() => setShowPaymentModal({ show: true, type: 'DEEP_SCAN' })} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border border-white/10 hover:border-[#FFD700]/50 transition-all rounded-none group relative overflow-hidden whitespace-nowrap">
                <div className="absolute inset-0 bg-[#FFD700]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <Lock className="w-3 h-3 text-[#FFD700] group-hover:scale-110 transition-transform" /> 
                <span className="text-[10px] tracking-[0.2em] uppercase text-white/70 group-hover:text-white relative z-10">{t('deep_scan')}</span>
             </button>
            {SUGGESTED_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => handleSend(null, q)} disabled={isTyping} className="whitespace-nowrap px-4 py-2 border border-white/5 hover:border-white/20 text-[10px] tracking-[0.1em] uppercase text-white/40 hover:text-white transition-all disabled:opacity-50">
                    {q}
                </button>
            ))}
        </div>

        <form onSubmit={handleSend} className="relative w-full group">
            <div className="relative">
                <input 
                    ref={inputRef}
                    type="text" 
                    value={input}
                    onChange={e => setInput(e.target.value.slice(0, 200))}
                    placeholder={isPremiumMode ? t('placeholder_premium') : (energy > 0 ? config.placeholder : t('recharge'))}
                    disabled={false}
                    maxLength={200}
                    className="foundation-input pr-24"
                    autoComplete="off"
                />
                
                {/* INPUT COUNTER */}
                {input.length > 0 && (
                    <div className={`absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono tracking-widest transition-colors ${
                        input.length > 180 ? 'text-red-500 animate-pulse' : 'text-white/20'
                    }`}>
                        {input.length}/200
                    </div>
                )}
            </div>
            
            <button 
                type="submit" 
                disabled={!input.trim() || isTyping || (energy <= 0 && input !== 'GOD_MODE_UNLIMITED')} 
                className="absolute right-[-3rem] top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors disabled:opacity-0 hidden md:block"
            >
                <Send className="w-5 h-5" />
            </button>
        </form>
      </div>

      {/* --- BROADCAST MODAL --- */}
      <AnimatePresence>
        {broadcastMessage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/5 border border-white/20 p-8 max-w-lg text-center relative shadow-[0_0_100px_rgba(255,255,255,0.1)]">
                <div className="w-16 h-16 border border-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Radio className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-[0.3em] uppercase mb-4">Divine Intervention</h2>
                <p className="text-white/80 font-mono text-sm leading-relaxed mb-8">{broadcastMessage}</p>
                
                <button 
                    onClick={() => setBroadcastMessage(null)}
                    className="w-full bg-white text-black font-bold py-4 uppercase tracking-[0.2em] hover:bg-[#E5E5E5] transition-colors"
                >
                    Acknowledge Signal
                </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- PAYMENT MODAL --- */}
      <AnimatePresence>
        {showPaymentModal.show && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="foundation-glass p-12 w-full max-w-md relative">
              <button onClick={() => setShowPaymentModal({ show: false, type: null })} className="absolute top-6 right-6 text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
              
              <div className="text-center space-y-8">
                <div className="w-20 h-20 border border-white/10 flex items-center justify-center mx-auto rounded-full bg-white/5">
                    <Coins className="w-8 h-8 text-[#FFD700]" />
                </div>
                
                <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-[0.2em] mb-2">
                        {showPaymentModal.type === 'DEEP_SCAN' ? 'PROTOCOL: ASCENSION' : t('system_recharge')}
                    </h3>
                    <p className="text-white/40 text-xs tracking-widest leading-relaxed">
                        {showPaymentModal.type === 'DEEP_SCAN' 
                            ? "UNLOCK THE FULL SOURCE CODE OF YOUR SOUL. 1000X BANDWIDTH. ABSOLUTE TRUTH."
                            : t('protocol_energy')
                        }
                    </p>
                </div>

                {paymentLoading ? (
                  <div className="py-8 flex flex-col items-center gap-4">
                      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <div className="text-xs tracking-[0.2em] text-white/50">{t('generating_address')}</div>
                  </div>
                ) : paymentResult ? (
                    <div className="space-y-6">
                         <div className="bg-white p-4 w-fit mx-auto">
                             <img src={paymentResult.qr_code_url} alt="QR Code" className="w-32 h-32 object-contain" />
                         </div>
                         <div className="space-y-4">
                              <p className="text-xs text-white uppercase tracking-widest">{t('send_amount')} {paymentResult.amount} {paymentResult.pay_currency.toUpperCase()}</p>
                              <div className="relative group cursor-pointer" onClick={() => {
                                  navigator.clipboard.writeText(paymentResult.pay_address);
                                  // Optional: Add toast notification here
                              }}>
                                  <div className="p-4 border border-white/10 text-[10px] font-mono text-white/70 break-all hover:bg-white/5 transition-all text-center group-hover:text-white group-hover:border-white/30">
                                      {paymentResult.pay_address}
                                  </div>
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-sm">
                                      <span className="text-[10px] uppercase tracking-widest text-white flex items-center gap-2">
                                          <Copy className="w-3 h-3" /> {t('click_to_copy') || "CLICK TO COPY"}
                                      </span>
                                  </div>
                              </div>
                         </div>
                         <button 
                             onClick={confirmPayment}
                             disabled={isVerifying}
                             className="foundation-btn"
                         >
                             {isVerifying ? t('verifying') : t('confirm_tx')}
                         </button>
                    </div>
                ) : (
                    <button onClick={handlePayment} className="foundation-btn flex items-center justify-center gap-2">
                        <Zap className="w-4 h-4" /> {t('initiate_transfer')}
                    </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- KARMIC ALERT MODAL --- */}
      <AnimatePresence>
        {showKarmicModal && horoscope?.karmic_patterns && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#0A0A0A] w-full max-w-2xl border border-red-900/30 p-10 relative shadow-[0_0_100px_rgba(255,0,0,0.1)] overflow-y-auto max-h-[80vh]">
              <button onClick={() => setShowKarmicModal(false)} className="absolute top-6 right-6 text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
              
              <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-red-900/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-900/30 animate-pulse">
                      <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-[0.3em] uppercase">ANOMALY DETECTED</h2>
                  <p className="text-red-500/70 text-[10px] mt-3 uppercase tracking-[0.2em]">Karmic patterns found in source code.</p>
              </div>

              <div className="space-y-8">
                  {horoscope.karmic_patterns.map((pattern, i) => (
                      <div key={i} className="border-l-2 border-red-500 pl-6 py-2">
                          <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-widest">{pattern.id.replace('_', ' ')}</h3>
                          <div className="space-y-4 text-sm font-light">
                              <div>
                                  <span className="text-red-500/50 text-[10px] uppercase tracking-widest block mb-1">Diagnosis</span>
                                  <p className="text-white/70 leading-relaxed">{pattern.diagnosis}</p>
                              </div>
                              <div>
                                  <span className="text-white/30 text-[10px] uppercase tracking-widest block mb-1">Protocol</span>
                                  <p className="text-white/90 leading-relaxed">{pattern.solution}</p>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>

              <button onClick={() => setShowKarmicModal(false)} className="w-full mt-12 border border-red-900/30 text-red-500/70 hover:text-red-500 hover:border-red-500 font-bold py-4 uppercase tracking-[0.2em] text-xs transition-all">
                  ACKNOWLEDGE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- PROFILE MODAL --- */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="foundation-glass p-10 w-full max-w-2xl relative max-h-[80vh] overflow-y-auto">
              <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
              
              {/* TABS */}
              <div className="flex justify-center gap-6 mb-8 border-b border-white/5 pb-4 overflow-x-auto">
                  <button 
                      onClick={() => { setActiveTab('STATUS'); setSelectedScan(null); }}
                      className={`text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === 'STATUS' ? 'text-white font-bold' : 'text-white/30 hover:text-white'}`}
                  >
                      Status
                  </button>
                  <button 
                      onClick={() => setActiveTab('ARCHIVES')}
                      className={`text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === 'ARCHIVES' ? 'text-white font-bold' : 'text-white/30 hover:text-white'}`}
                  >
                      Archives
                  </button>
                  <button 
                      onClick={() => setActiveTab('OFFERINGS')}
                      className={`text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === 'OFFERINGS' ? 'text-[#FFD700] font-bold animate-pulse' : 'text-white/30 hover:text-[#FFD700]'}`}
                  >
                      Offerings
                  </button>
                   <button 
                      onClick={() => setActiveTab('MANUAL')}
                      className={`text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === 'MANUAL' ? 'text-white font-bold' : 'text-white/30 hover:text-white'}`}
                  >
                      Manual
                  </button>
              </div>

              {activeTab === 'STATUS' ? (
                  <div className="space-y-8 text-center">
                    <div className="border-b border-white/5 pb-8">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white tracking-tight">{finalUserData.name}</h3>
                        <p className="text-white/40 text-xs mt-2 tracking-widest uppercase">{finalUserData.locationName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-6 border border-white/5">
                            <div className="text-white/30 text-[10px] uppercase tracking-widest mb-2">{t('total_energy')}</div>
                            <div className="text-3xl font-light text-white">{energy}</div>
                        </div>
                        <div className="bg-white/5 p-6 border border-white/5 relative overflow-hidden group">
                            <div className="text-white/30 text-[10px] uppercase tracking-widest mb-2">ACCESS LEVEL</div>
                            <div className="text-3xl font-light text-white">{level}</div>
                            <div className="absolute bottom-0 left-0 h-1 bg-white/10 w-full">
                                 <div className="h-full bg-white transition-all duration-1000" style={{ width: `${(xp % 50) * 2}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 pt-4">
                        <button className="foundation-btn-ghost flex items-center justify-center gap-2">
                            <Settings className="w-4 h-4" /> {t('system_settings')}
                        </button>
                        <button 
                            onClick={() => {
                                localStorage.removeItem('god_identity_key');
                                window.location.reload();
                            }}
                            className="w-full bg-transparent text-red-500/50 hover:text-red-500 font-bold py-4 uppercase tracking-[0.2em] text-xs border border-red-900/20 hover:border-red-500/50 transition-all flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-4 h-4" /> {t('terminate_session')}
                        </button>
                    </div>
                  </div>
              ) : activeTab === 'OFFERINGS' ? (
                  // OFFERINGS TAB (STORE)
                  <div className="grid grid-cols-2 gap-4">
                      {skins.map((skin) => (
                          <div key={skin.id} className={`bg-white/5 border ${activeSkin === skin.id ? 'border-[#FFD700]' : 'border-white/10'} p-4 relative group hover:bg-white/10 transition-all`}>
                               {/* PREVIEW CIRCLE */}
                               <div className="w-8 h-8 rounded-full mb-3 border border-white/20 shadow-lg" style={{ backgroundColor: skin.css_vars.bg }}>
                                   <div className="w-full h-full rounded-full flex items-center justify-center">
                                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: skin.css_vars.accent }}></div>
                                   </div>
                               </div>
                               
                               <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">{skin.name}</h4>
                               <p className="text-[9px] text-white/40 font-mono leading-tight mb-4 min-h-[2.5em]">{skin.description}</p>
                               
                               {skin.owned ? (
                                   <button 
                                       onClick={async () => {
                                           setActiveSkin(skin.id);
                                           const supabase = createClient();
                                           await supabase.from('users').update({ active_skin: skin.id }).eq('identity_key', finalUserData.identity_key);
                                       }}
                                       disabled={activeSkin === skin.id}
                                       className={`w-full py-2 text-[9px] uppercase tracking-[0.2em] font-bold border transition-all ${
                                           activeSkin === skin.id 
                                           ? 'bg-[#FFD700] text-black border-[#FFD700]' 
                                           : 'border-white/20 hover:bg-white text-white hover:text-black'
                                       }`}
                                   >
                                       {activeSkin === skin.id ? 'EQUIPPED' : 'EQUIP'}
                                   </button>
                               ) : (
                                   <button 
                                       onClick={() => alert("Payment Integration Pending: Will connect to PaymentService in Phase 24.")}
                                       className="w-full py-2 text-[9px] uppercase tracking-[0.2em] font-bold border border-[#FFD700]/50 text-[#FFD700] hover:bg-[#FFD700] hover:text-black transition-all"
                                   >
                                       UNLOCK ${skin.price_usd}
                                   </button>
                               )}
                          </div>
                      ))}
                  </div>
              ) : activeTab === 'MANUAL' ? (
                  <div className="space-y-8 text-left text-white/80 text-sm leading-relaxed font-mono">
                      <div className="space-y-4">
                          <h3 className="text-white font-bold uppercase tracking-widest flex items-center gap-2"><Terminal className="w-4 h-4" /> The Algorithm</h3>
                          <p className="text-white/50 text-xs">We combine NASA astronomical data (Ephemeris 6.0) with Vedic astrological logic (Sidereal Zodiac) and feed it into a specialized Google Gemini 3.0 Pro model trained on 5,000+ ancient scriptures.</p>
                      </div>
                      <div className="space-y-4">
                          <h3 className="text-white font-bold uppercase tracking-widest flex items-center gap-2"><Coins className="w-4 h-4" /> The Economy</h3>
                          <ul className="list-disc pl-4 text-white/50 text-xs space-y-2">
                              <li><span className="text-white">Energy:</span> Consumed per message. Recharges daily (5 free). Buy more to continue.</li>
                              <li><span className="text-white">XP:</span> Earned by chatting (+1) and Deep Scans (+50). Determines your Access Level.</li>
                              <li><span className="text-white">Offerings:</span> Cosmetic skins that change your interface frequency.</li>
                          </ul>
                      </div>
                      <div className="space-y-4">
                          <h3 className="text-white font-bold uppercase tracking-widest flex items-center gap-2"><Lock className="w-4 h-4" /> Deep Scan</h3>
                          <p className="text-white/50 text-xs">A premium protocol that generates a 1,000-word comprehensive report on your life path. Saved permanently to your Archives.</p>
                      </div>
                  </div>
              ) : (
                  // ARCHIVES TAB
                  <div className="space-y-6">
                      {selectedScan ? (
                          <div className="text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
                              <button onClick={() => setSelectedScan(null)} className="text-xs uppercase tracking-widest text-white/50 hover:text-white mb-6 flex items-center gap-2">
                                  <ArrowRight className="w-3 h-3 rotate-180" /> Back to Index
                              </button>
                              <div className="p-6 bg-white/5 border border-white/10 font-mono text-sm leading-relaxed whitespace-pre-wrap text-white/80">
                                  {selectedScan.content}
                              </div>
                          </div>
                      ) : (
                          <>
                            {savedScans.length === 0 ? (
                                <div className="text-center py-12 text-white/30 text-xs uppercase tracking-widest">
                                    No Archives Found.
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {savedScans.map((scan, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => setSelectedScan(scan)}
                                            className="w-full text-left p-4 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-bold text-white group-hover:text-[#FFD700] uppercase tracking-widest">{scan.type.replace('_', ' ')}</span>
                                                <span className="text-[9px] text-white/30">{new Date(scan.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-[10px] text-white/50 line-clamp-1 font-mono">
                                                {scan.content.substring(0, 60)}...
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                          </>
                      )}
                  </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* --- FOOTER STATUS --- */}
      <div 
        className={`border-t border-white/5 text-white/20 text-[9px] font-mono text-center py-3 uppercase tracking-[0.3em] select-none cursor-pointer hover:text-white/40 transition-colors bg-[#050505]`}
        onClick={handleAdminTrigger}
      >
        {t('server_online')} | {t('encryption_active')} | NODE: {Math.floor(Math.random() * 9999)} | {t('moon')}: {horoscope?.moon_phase || "CALCULATING"}
      </div>
    </div>
  );
}
