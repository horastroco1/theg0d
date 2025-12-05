'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Activity, Coins, X, Sparkles, Wifi, Battery, Zap, Lock, Copy, Share2, Terminal } from 'lucide-react';
import { astrologyService, HoroscopeData } from '@/services/astrologyService';
import { generateGodResponse } from '@/app/actions/generateGodResponse';
import { security } from '@/lib/security';
import { paymentService } from '@/services/paymentService';
import { createClient } from '@/lib/supabase';
import { cryptoService } from '@/lib/crypto'; 
import { audioService } from '@/services/audioService'; // IMPORT AUDIO
import { locationService } from '@/services/locationService';

interface GodDashboardProps { userData: any; }

interface Message {
  id: string;
  text: string;
  sender: 'god' | 'user';
}

type PaymentType = 'RECHARGE' | 'PATCH' | 'DEEP_SCAN';

const generateId = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2);

// Typewriter Component for God's Messages
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
    }, 25); // Speed: 25ms per char
    return () => clearInterval(interval);
  }, [text, onComplete]);

  return <span>{displayedText}</span>;
};

// Translation dictionary for UI
const UI_TEXT: Record<string, any> = {
  en: {
    init: "Initializing Neural Link...",
    connected: "Connected. Subject:",
    listening: "I am listening. What is your query?",
    placeholder: "> Enter Command...",
    placeholderPremium: "> DEEP SCAN PROTOCOL ACTIVE...",
    recharge: "ENERGY DEPLETED"
  },
  es: {
    init: "Iniciando Enlace Neuronal...",
    connected: "Conectado. Sujeto:",
    listening: "Te escucho. ¿Cuál es tu consulta?",
    placeholder: "> Comando...",
    placeholderPremium: "> ESCANEO PROFUNDO ACTIVO...",
    recharge: "ENERGÍA AGOTADA"
  },
  fr: {
    init: "Initialisation du lien neuronal...",
    connected: "Connecté. Sujet:",
    listening: "Je vous écoute. Quelle est votre requête ?",
    placeholder: "> Commande...",
    placeholderPremium: "> SCAN PROFOND ACTIF...",
    recharge: "ÉNERGIE ÉPUISÉE"
  },
  de: {
    init: "Initialisiere Neuronalen Link...",
    connected: "Verbunden. Subjekt:",
    listening: "Ich höre. Was ist Ihre Anfrage?",
    placeholder: "> Befehl eingeben...",
    placeholderPremium: "> TIEFENSCAN AKTIV...",
    recharge: "ENERGIE LEER"
  },
  pt: {
    init: "Inicializando Link Neural...",
    connected: "Conectado. Sujeito:",
    listening: "Estou ouvindo. Qual é a sua consulta?",
    placeholder: "> Comando...",
    placeholderPremium: "> VARREDURA PROFUNDA ATIVA...",
    recharge: "ENERGIA ESGOTADA"
  },
  ja: {
    init: "ニューラルリンクを初期化中...",
    connected: "接続完了。対象:",
    listening: "聞いています。質問は何ですか？",
    placeholder: "> コマンド入力...",
    placeholderPremium: "> ディープスキャン有効...",
    recharge: "エネルギー切れ"
  },
  zh: {
    init: "正在初始化神经链接...",
    connected: "已连接。主体：",
    listening: "我在听。你的查询是什么？",
    placeholder: "> 输入指令...",
    placeholderPremium: "> 深度扫描已激活...",
    recharge: "能量耗尽"
  },
  ru: {
    init: "Инициализация нейронной связи...",
    connected: "Подключено. Субъект:",
    listening: "Я слушаю. Каков ваш запрос?",
    placeholder: "> Введите команду...",
    placeholderPremium: "> ГЛУБОКОЕ СКАНИРОВАНИЕ...",
    recharge: "НЕТ ЭНЕРГИИ"
  },
  hi: {
    init: "न्यूरल लिंक आरंभ किया जा रहा है...",
    connected: "जुड़ा हुआ। विषय:",
    listening: "मैं सुन रहा हूँ। आपकी क्या क्वेरी है?",
    placeholder: "> कमांड दर्ज करें...",
    placeholderPremium: "> डीप स्कैन सक्रिय...",
    recharge: "ऊर्जा समाप्त"
  },
  ar: {
    init: "جارٍ تهيئة الرابط العصبي...",
    connected: "متصل. الموضوع:",
    listening: "أنا أستمع. ما هو استفسارك؟",
    placeholder: "> أدخل الأمر...",
    placeholderPremium: "> المسح العميق نشط...",
    recharge: "الطاقة نفدت"
  },
  fa: {
    init: "در حال راه اندازی لینک عصبی...",
    connected: "متصل شد. سوژه:",
    listening: "من گوش می دهم. پرسش شما چیست؟",
    placeholder: "> دستور را وارد کنید...",
    placeholderPremium: "> اسکن عمیق فعال است...",
    recharge: "اتمام انرژی"
  }
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
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false); 
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); 
  const [isTyping, setIsTyping] = useState(false);
  const [isPremiumMode, setIsPremiumMode] = useState(false); 
  
  // Language State
  const [uiText, setUiText] = useState(UI_TEXT['en']);
  const [userLang, setUserLang] = useState('en');

  useEffect(() => {
      const lang = locationService.detectUserLanguage();
      setUserLang(lang);
      setUiText(UI_TEXT[lang] || UI_TEXT['en']);
  }, []);

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
    
    // DEV GOD MODE: Infinite Energy on Localhost
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.log("⚡ GOD MODE ACTIVE: INFINITE ENERGY");
        
        // Force override local storage immediately to prevent sync issues
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
      audioService.play('init'); // AUDIO: Init
      setMessages([{ id: generateId(), text: uiText.init, sender: 'god' }]);
      const supabase = createClient();

      try {
        // --- CHART CACHING LOGIC ---
        let data;
        
        if (userData.chart_data) {
            console.log("🔮 LOADING CHART FROM CACHE...");
            data = userData.chart_data;
            
            // Force Refresh Dasha Logic (Fix Unsynchronized)
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
                        { id: generateId(), text: `${uiText.connected} ${finalUserData.name}.`, sender: 'god' },
                        { id: generateId(), text: `Moon: ${data.moon_sign} | Dasha: ${data.current_dasha}`, sender: 'god' },
                        { id: generateId(), text: uiText.listening, sender: 'god' }
                    ]);
                }, 1200);
            }
        }

      } catch (e: any) {
        setLoading(false);
        audioService.play('error'); // AUDIO: Error
        setMessages(prev => [...prev, { id: generateId(), text: `Connection Failed: ${e.message}`, sender: 'god' }]);
      }
    };
    init();
  }, [finalUserData, userData.chart_data, uiText]);

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
        audioService.play('error');
        setMessages(prev => [...prev, { id: generateId(), text: "SYSTEM ALERT: RATE LIMIT EXCEEDED.", sender: 'god' }]);
        return;
    }

    const text = security.sanitizeInput(rawText);

    setInput('');
    setEnergy(e => e - 1);
    inputRef.current?.focus();
    
    audioService.play('message'); // AUDIO: User Send
    const newHistory: Message[] = [...messages, { id: generateId(), text, sender: 'user' }];
    setMessages(newHistory);
    
    // SAVE USER MSG (Encrypted)
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
            language: userLang // Pass detected language
        }
      );
      
      if (isPremiumMode) setIsPremiumMode(false); // Consume the premium token
      
      setMessages(prev => [...prev, { id: generateId(), text: response, sender: 'god' }]);
      audioService.play('message'); // AUDIO: God Reply
      
      // SAVE GOD MSG (Encrypted)
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
      // Fake delay to simulate blockchain verification
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setIsVerifying(false);
      setShowPaymentModal({ show: false, type: null });
      
      if (showPaymentModal.type === 'RECHARGE') setEnergy(e => e + 20);
      if (showPaymentModal.type === 'DEEP_SCAN') setIsPremiumMode(true);
      
      setPaymentResult(null);
      
      // Success Sound & Feedback
      audioService.play('init');
      setMessages(prev => [...prev, { id: generateId(), text: "TRIBUTE ACCEPTED. PROTOCOLS UNLOCKED.", sender: 'god' }]);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-black text-[#F5F5F7] font-mono overflow-hidden" style={{ height: '100dvh' }}>
      
      <div className="noise-overlay"></div>
      <div className="scanlines"></div>
      
      {/* --- HEADER --- */}
      <div className="pt-4 pb-2 px-6 flex justify-between items-center bg-black/80 backdrop-blur-xl z-50 border-b border-white/5 sticky top-0 flex-shrink-0">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#00FF41]/10 flex items-center justify-center border border-[#00FF41]/20">
                <Terminal className="w-4 h-4 text-[#00FF41]" />
            </div>
            <div>
                <h1 className="text-xs font-bold tracking-widest uppercase text-white glitch-text" data-text="THEG0D">THEG0D</h1>
                <div className="flex items-center gap-1 text-[9px] text-[#86868B] font-mono">
                    <span className="w-1.5 h-1.5 bg-[#00FF41] animate-pulse"></span>
                    CONNECTED: 127.0.0.1
                </div>
            </div>
        </div>

            <div className="flex items-center gap-4 bg-[#1C1C1E] px-4 py-2 rounded border border-white/5 font-mono">
            <div className="flex items-center gap-2">
                 <Battery className={`w-3 h-3 ${energy < 2 ? 'text-red-500 animate-pulse' : 'text-[#00FF41]'}`} />
                 <span className="text-[10px] text-[#86868B]">
                    {energy > 9000 ? "INF" : `${energy}/5`}
                 </span>
            </div>
            <div className="w-[1px] h-3 bg-white/10"></div>
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#86868B]">CPU</span>
                <div className="w-12 h-1 bg-[#333] overflow-hidden">
                    <div className="h-full bg-[#00FF41] animate-pulse" style={{ width: `${sanity}%` }}></div>
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
                ? 'bg-black/40 text-[#00FF41] border-[#00FF41]/20 shadow-[0_0_15px_rgba(0,255,65,0.05)] rounded-tr-xl rounded-br-xl rounded-bl-xl' 
                : 'bg-white text-black border-transparent rounded-tl-xl rounded-bl-xl rounded-br-xl'
            }`}>
              <div className="absolute -top-3 left-0 text-[9px] text-[#86868B] bg-black px-1 font-mono uppercase tracking-widest">
                {msg.sender === 'god' ? 'SYSTEM' : 'SUBJECT'}
              </div>
              
              {msg.sender === 'god' ? (
                <TypewriterEffect text={msg.text} />
              ) : (
                msg.text
              )}
              
              {/* SHARE BUTTON FOR GOD MESSAGES */}
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
                    className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[#86868B] hover:text-[#00FF41]"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
              )}
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="text-[#00FF41] font-mono text-xs animate-pulse">
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
                <Lock className="w-3 h-3" /> DEEP SCAN ($10)
             </button>
            {SUGGESTED_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => handleSend(null, q)} disabled={isTyping} className="whitespace-nowrap px-4 py-2 bg-[#1C1C1E] border border-white/10 text-[10px] font-mono text-[#86868B] hover:text-[#00FF41] hover:border-[#00FF41]/30 transition-all flex-shrink-0 disabled:opacity-50 uppercase tracking-widest">
                    {q}
                </button>
            ))}
        </div>

        <form onSubmit={handleSend} className={`relative w-full flex items-center gap-4 ${isPremiumMode ? 'border-b border-[#FFD700]' : 'border-b border-white/20'}`}>
            <span className="text-[#00FF41] font-mono text-lg animate-pulse">{'>'}</span>
            <input 
                ref={inputRef}
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={isPremiumMode ? uiText.placeholderPremium : (energy > 0 ? uiText.placeholder : uiText.recharge)}
                disabled={energy <= 0}
                className="w-full bg-transparent text-white py-4 font-mono text-base outline-none placeholder-[#333]"
                autoComplete="off"
            />
            <button type="submit" disabled={!input.trim() || isTyping || energy <= 0} className={`p-2 hover:text-[#00FF41] transition-colors disabled:opacity-30 ${isPremiumMode ? 'text-[#FFD700]' : 'text-white'}`}>
                <Send className="w-5 h-5" />
            </button>
        </form>
      </div>

      {/* --- PAYMENT MODAL --- */}
      <AnimatePresence>
        {showPaymentModal.show && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }} className="bg-black w-full max-w-md border border-[#00FF41]/30 p-8 relative shadow-[0_0_50px_rgba(0,255,65,0.1)]">
              <button onClick={() => setShowPaymentModal({ show: false, type: null })} className="absolute top-4 right-4 text-[#86868B] hover:text-white"><X className="w-4 h-4" /></button>
              
              <div className="text-center space-y-6 font-mono">
                <div className="w-16 h-16 border border-[#00FF41] flex items-center justify-center mx-auto relative">
                    <div className="absolute inset-0 bg-[#00FF41] opacity-10 animate-pulse"></div>
                    <Coins className="w-8 h-8 text-[#00FF41]" />
                </div>
                
                <div>
                    <h3 className="text-xl text-white uppercase tracking-widest mb-2">System Recharge</h3>
                    <p className="text-[#86868B] text-xs">Protocol requires energy token.</p>
                </div>

                {paymentLoading ? (
                  <div className="py-8 flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-t-[#00FF41] border-white/10 rounded-full animate-spin"></div>
                      <div className="text-[#00FF41] text-xs blink">GENERATING_ADDRESS...</div>
                  </div>
                ) : paymentResult ? (
                    <div className="space-y-6">
                         <div className="bg-white p-2 w-fit mx-auto border border-white/20">
                             <img src={paymentResult.qr_code_url} alt="QR Code" className="w-40 h-40 object-contain" />
                         </div>
                         <div className="space-y-2">
                              <p className="text-[10px] text-[#86868B] uppercase tracking-widest">SEND {paymentResult.amount} {paymentResult.pay_currency.toUpperCase()}</p>
                              <div 
                                 onClick={() => navigator.clipboard.writeText(paymentResult.pay_address)}
                                 className="bg-[#111] p-3 border border-dashed border-[#333] text-[10px] text-[#00FF41] break-all cursor-pointer hover:border-[#00FF41] transition-all text-center"
                              >
                                 {paymentResult.pay_address}
                              </div>
                         </div>
                         <button 
                             onClick={confirmPayment}
                             disabled={isVerifying}
                             className="w-full bg-[#00FF41] text-black font-bold py-4 uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
                         >
                             {isVerifying ? "VERIFYING..." : "CONFIRM TRANSACTION"}
                         </button>
                    </div>
                ) : (
                    <button onClick={handlePayment} className="w-full bg-[#00FF41] text-black font-bold py-4 uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2">
                        <Zap className="w-4 h-4" /> INITIATE TRANSFER
                    </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* --- FOOTER STATUS --- */}
      <div className="bg-black border-t border-white/5 text-[#333] text-[9px] font-mono text-center py-1 uppercase tracking-widest select-none">
        SERVER: ONLINE | ENCRYPTION: ACTIVE | NODE: {Math.floor(Math.random() * 9999)}
      </div>
    </div>
  );
}
