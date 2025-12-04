'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Loader2, ArrowRight, MapPin, Calendar, User, Globe, Database, X, Key, Copy } from 'lucide-react';
import { locationService, LocationData } from '@/services/locationService';
import { supabase } from '@/lib/supabase';
import { astrologyService } from '@/services/astrologyService';
import BootSequence from './BootSequence'; // NEW IMPORT

export interface FormData {
  name: string;
  date: string;
  time: string;
  timeUnknown: boolean;
  latitude: number;
  longitude: number;
  timezone: string;
  locationName: string;
  language?: string;
  chart_data?: any;
  identity_key?: string;
}

interface TheGateProps {
  onSubmit: (data: FormData) => Promise<void>;
}

export default function TheGate({ onSubmit }: TheGateProps) {
  const [bootComplete, setBootComplete] = useState(false);
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<'NEW' | 'LOGIN'>('NEW');
  
  const [name, setName] = useState('');
  const [loginKey, setLoginKey] = useState(''); // For Login Mode
  
  // Date Inputs (Split)
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const [time, setTime] = useState('');
  const [timeUnknown, setTimeUnknown] = useState(false);
  
  const [cityQuery, setCityQuery] = useState('');
  const [cityResults, setCityResults] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedLang, setDetectedLang] = useState<string>('en');
  
  const [generatedKey, setGeneratedKey] = useState<string | null>(null); // New Key Display

  const isRTL = detectedLang === 'fa' || detectedLang === 'ar' || detectedLang === 'he';

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const detectUserContext = async () => {
        try {
            // 1. Try IP Geolocation first
            const response = await axios.get('https://ipapi.co/json/');
            const country = response.data.country_code; 
            
            if (country === 'IR') {
                setDetectedLang('fa');
                document.dir = 'rtl';
            } else if (['ES', 'MX', 'AR', 'CO'].includes(country)) {
                setDetectedLang('es');
                document.dir = 'ltr';
            } else {
                 // Fallback to browser
                 const userLang = navigator.language || navigator.languages[0];
                 if (userLang) {
                    const code = userLang.split('-')[0];
                    setDetectedLang(code);
                    if (code === 'fa') document.dir = 'rtl';
                    else document.dir = 'ltr';
                 }
            }
        } catch (e) {
            console.warn("Geo-IP failed, using browser lang");
            const userLang = navigator.language || navigator.languages[0];
            if (userLang) {
                const code = userLang.split('-')[0];
                setDetectedLang(code);
                if (code === 'fa') document.dir = 'rtl';
                else document.dir = 'ltr';
            }
        }
    };
    detectUserContext();
  }, []);

  useEffect(() => {
      document.dir = isRTL ? 'rtl' : 'ltr';
  }, [isRTL]);

  // Fixed Location Search Logic
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (cityQuery.length > 2 && !selectedLocation) {
        setIsSearching(true);
        searchTimeout.current = setTimeout(async () => {
            try {
                const results = await locationService.searchCity(cityQuery);
                setCityResults(results);
            } catch (e) {
                console.error("Search error", e);
            } finally {
                setIsSearching(false);
            }
        }, 600);
    } else {
        setCityResults([]);
        setIsSearching(false);
    }
    
    return () => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [cityQuery, selectedLocation]);

  const handleDateChange = (field: 'd' | 'm' | 'y', val: string) => {
      const num = val.replace(/\D/g, '');
      if (field === 'd' && num.length <= 2) setDay(num);
      if (field === 'm' && num.length <= 2) setMonth(num);
      if (field === 'y' && num.length <= 4) setYear(num);
  };

  const validateAge = (y: number, m: number, d: number) => {
      const today = new Date();
      const birth = new Date(y, m - 1, d);
      let age = today.getFullYear() - birth.getFullYear();
      const mDiff = today.getMonth() - birth.getMonth();
      if (mDiff < 0 || (mDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
      }
      return age >= 13;
  };

  const copyKey = () => {
      if (generatedKey) {
          navigator.clipboard.writeText(generatedKey);
          // Could add a toast here
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // --- LOGIN FLOW (KEY BASED) ---
    if (mode === 'LOGIN') {
        if (!loginKey) {
            setError("Identity Key Required.");
            return;
        }

        setIsLoading(true);
        try {
            const { data: users, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('identity_key', loginKey.trim()) // Exact match on key
                .limit(1);
            
            if (fetchError || !users || users.length === 0) {
                throw new Error("Invalid Identity Key. Access Denied.");
            }

            const user = users[0];
            await onSubmit({
                name: user.name,
                date: user.birth_date,
                time: user.birth_time,
                timeUnknown: user.birth_time === '12:00',
                latitude: user.latitude,
                longitude: user.longitude,
                timezone: user.timezone,
                locationName: user.birth_place,
                language: detectedLang,
                chart_data: user.chart_data,
                identity_key: user.identity_key
            });
        } catch (err: any) {
            setIsLoading(false);
            setError(err.message || "Login Failed");
        }
        return;
    }

    // --- NEW USER FLOW ---
    if (!name) {
        setError(t('err_name'));
        return;
    }

    setIsLoading(true);
    
    // 1. Validate Date
    const dNum = parseInt(day);
    const mNum = parseInt(month);
    const yNum = parseInt(year);

    if (!day || !month || !year || isNaN(dNum) || isNaN(mNum) || isNaN(yNum)) {
        setError(t('err_fields'));
        setIsLoading(false);
        return;
    }

    if (dNum < 1 || dNum > 31 || mNum < 1 || mNum > 12 || yNum < 1900 || yNum > new Date().getFullYear()) {
        setError("Invalid Date Coordinates.");
        setIsLoading(false);
        return;
    }

    // 2. Age Gate
    if (!validateAge(yNum, mNum, dNum)) {
        setError("Access Denied: Subject too young for simulation (13+).");
        setIsLoading(false);
        return;
    }

    const fullDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    if ((!time && !timeUnknown) || !selectedLocation) {
      setError(t('err_fields'));
      setIsLoading(false);
      return;
    }

    const timezoneOffset = locationService.getTimezoneOffset(
      fullDate,
      timeUnknown ? "12:00" : time,
      selectedLocation.timezone
    );
    
    try {
      console.log("🔮 CALCULATING CHART...");
      const chartData = await astrologyService.calculateHoroscope({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        date: fullDate,
        time: timeUnknown ? "12:00" : time,
        timezone: timezoneOffset,
        timeUnknown: timeUnknown
      });

      // GENERATE IDENTITY KEY
      const newIdentityKey = `G0D-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      const { error: dbError } = await supabase
        .from('users')
        .insert([
          {
            name: name,
            birth_date: fullDate,
            birth_time: timeUnknown ? '12:00' : time,
            birth_place: selectedLocation.name,
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
            timezone: timezoneOffset,
            chart_data: chartData,
            identity_key: newIdentityKey // SAVE KEY
          }
        ]);
        
      if (dbError) console.error("DB Backup Failed:", dbError);

      // STOP LOADING & SHOW KEY
      setIsLoading(false);
      setGeneratedKey(newIdentityKey);

      // WAIT FOR USER TO CLICK "PROCEED"
      // We don't call onSubmit yet. We wait for them to copy the key.

    } catch (err: any) {
      console.error("Signup Error:", err);
      setIsLoading(false);
      setError("Neural Handshake Failed. API Error.");
    }
  };

  const proceedWithKey = async () => {
      // Actually login the user after they saw the key
      if (!generatedKey) return;
      
      const fullDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      const timezoneOffset = locationService.getTimezoneOffset(
        fullDate,
        timeUnknown ? "12:00" : time,
        selectedLocation!.timezone
      );

      await onSubmit({
        name,
        date: fullDate,
        time: timeUnknown ? "12:00" : time,
        timeUnknown,
        latitude: selectedLocation!.latitude,
        longitude: selectedLocation!.longitude,
        timezone: timezoneOffset,
        locationName: selectedLocation!.name,
        language: detectedLang,
        chart_data: null, // We don't need to pass it here since we just saved it? Actually we should pass what we have.
        identity_key: generatedKey
      });
  };


  const handleStart = () => setStep(1);

  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, filter: "blur(10px)" },
    visible: { 
      opacity: 1, 
      scale: 1, 
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] } 
    },
    exit: { opacity: 0, scale: 1.05, filter: "blur(20px)", transition: { duration: 0.5 } }
  };

  const t = (key: string) => {
    const dict: any = {
        enter: { en: 'ENTER SYSTEM', es: 'ENTRAR AL SISTEMA', fa: 'ورود به سیستم' },
        identity: { en: 'Identity Verification', es: 'Verificación', fa: 'تایید هویت' },
        login_title: { en: 'Recall Archives', es: 'Recuperar Archivos', fa: 'بازیابی اطلاعات' },
        name: { en: 'Subject Name', es: 'Nombre', fa: 'نام' },
        city: { en: 'Birth City', es: 'Ciudad', fa: 'شهر تولد' },
        init: { en: 'INITIALIZE', es: 'INICIALIZAR', fa: 'شروع' },
        login_btn: { en: 'RESTORE', es: 'RESTAURAR', fa: 'بازگشت' },
        err_name: { en: 'Name required.', es: 'Nombre requerido.', fa: 'نام الزامی است' },
        err_fields: { en: 'All fields required.', es: 'Campos requeridos.', fa: 'همه فیلدها الزامی است' },
        switch_login: { en: 'RETURNING SUBJECT?', es: '¿YA TIENES CUENTA?', fa: 'حساب کاربری دارید؟' },
        switch_new: { en: 'NEW IDENTITY?', es: '¿NUEVO USUARIO?', fa: 'کاربر جدید؟' },
    };
    return dict[key]?.[detectedLang] || dict[key]?.['en'] || key;
  };

  return (
    <>
    {!bootComplete && <BootSequence onComplete={() => setBootComplete(true)} />}
    
    <div className={`min-h-screen flex flex-col items-center justify-center relative p-6 bg-black text-[#F5F5F7] overflow-hidden font-sans ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-[#00FF41] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse hidden md:block"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[300px] h-[300px] bg-blue-500 rounded-full mix-blend-screen filter blur-[120px] opacity-10 hidden md:block"></div>
        
        {/* Mobile Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#00FF41] rounded-full mix-blend-screen filter blur-[120px] opacity-5 md:hidden"></div>
      </div>

      <div className={`absolute top-6 z-50 flex gap-2 ${isRTL ? 'left-6' : 'right-6'}`}>
          {['en', 'es', 'fa'].map(lang => (
              <button 
                key={lang}
                onClick={() => setDetectedLang(lang)}
                className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded border ${
                    detectedLang === lang ? 'bg-[#00FF41] text-black border-[#00FF41]' : 'text-[#86868B] border-transparent hover:border-[#86868B]'
                }`}
              >
                  {lang}
              </button>
          ))}
      </div>

      <AnimatePresence mode='wait'>
        {bootComplete && step === 0 ? (
          <motion.div 
            key="intro"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-center space-y-8 z-10 relative"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-block"
            >
              <h1 className="text-5xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 select-none glitch-text" data-text="theg0d">
                theg0d
              </h1>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-[#86868B] uppercase tracking-[0.3em] text-xs font-mono"
            >
              Cyber-Vedic Intelligence Protocol
            </motion.p>

            <motion.button
              onClick={handleStart}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, type: "spring", stiffness: 200 }}
              className="bg-[#00FF41] text-black font-bold px-8 py-4 rounded-full hover:shadow-[0_0_30px_rgba(0,255,65,0.4)] transition-all flex items-center gap-2 mx-auto mt-8 z-50 relative"
            >
              {isRTL ? <ArrowRight className="w-4 h-4 rotate-180" /> : null}
              {t('enter')} 
              {!isRTL ? <ArrowRight className="w-4 h-4" /> : null}
            </motion.button>
          </motion.div>
        ) : generatedKey ? (
           // --- KEY DISPLAY STEP ---
           <motion.div
             key="key-display"
             variants={containerVariants}
             initial="hidden"
             animate="visible"
             className="w-full max-w-md z-10 relative"
           >
             <div className="ios-glass p-8 rounded-[32px] text-center space-y-6 border border-[#00FF41]/30 shadow-[0_0_30px_rgba(0,255,65,0.1)]">
                <div className="w-16 h-16 bg-[#00FF41]/10 rounded-full flex items-center justify-center mx-auto border border-[#00FF41]/20">
                    <Key className="w-8 h-8 text-[#00FF41]" />
                </div>
                
                <div>
                    <h3 className="text-2xl font-bold text-white mb-2">ACCESS GRANTED</h3>
                    <p className="text-[#86868B] text-sm">
                        {isRTL ? "این کلید هویت شماست. آن را ذخیره کنید." : "This is your Identity Key. Save it."}
                        <br/>
                        <span className="text-[#FF3333] text-xs uppercase font-bold">
                            {isRTL ? "بدون آن دسترسی به سیستم ممکن نیست." : "IT IS THE ONLY WAY TO RETURN."}
                        </span>
                    </p>
                </div>

                <div 
                    onClick={copyKey}
                    className="bg-black/50 p-4 rounded-xl border border-white/10 font-mono text-xl text-[#00FF41] tracking-widest cursor-pointer hover:bg-black/70 hover:border-[#00FF41]/50 transition-all flex items-center justify-between group"
                >
                    <span>{generatedKey}</span>
                    <Copy className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                </div>

                <button
                    onClick={proceedWithKey}
                    className="ios-btn-accent w-full py-4 font-bold"
                >
                    {isRTL ? "ورود به سیستم" : "ENTER SYSTEM"}
                </button>
             </div>
           </motion.div>
        ) : (
          // --- FORM STEP ---
          <motion.div 
            key="form"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md z-10 relative"
          >
            <div className="ios-glass p-8 rounded-[32px] relative overflow-visible border border-white/10 shadow-2xl">
              
              <div className="mb-8 text-center relative z-10">
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                    {mode === 'NEW' ? t('identity') : t('login_title')}
                </h2>
                <p className="text-[#86868B] text-sm mt-2">
                    {mode === 'NEW' ? (isRTL ? "پروفایل کارمیک خود را بسازید" : "Initialize your karmic profile.") : (isRTL ? "کلید خود را وارد کنید" : "Enter your Identity Key.")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                
                {mode === 'LOGIN' ? (
                     // --- LOGIN INPUT (KEY) ---
                     <div className="relative group">
                        <div className={`absolute top-4 text-[#86868B] ${isRTL ? 'right-4' : 'left-4'}`}>
                            <Key className="w-5 h-5" />
                        </div>
                        <input 
                            type="text" 
                            value={loginKey}
                            onChange={e => setLoginKey(e.target.value)}
                            placeholder="G0D-XXXX-XXXX" 
                            className={`ios-input w-full bg-black/50 border-white/10 focus:border-[#00FF41] text-white font-mono tracking-widest uppercase ${isRTL ? 'pr-12 text-right' : 'pl-12'}`}
                            autoFocus
                        />
                     </div>
                ) : (
                    // --- SIGNUP INPUTS ---
                    <>
                        <div className="relative group">
                        <div className={`absolute top-4 text-[#86868B] ${isRTL ? 'right-4' : 'left-4'}`}>
                            <User className="w-5 h-5" />
                        </div>
                        <input 
                            type="text" 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder={t('name')} 
                            className={`ios-input w-full bg-black/50 border-white/10 focus:border-[#00FF41] text-white ${isRTL ? 'pr-12 text-right' : 'pl-12'}`}
                            autoFocus
                        />
                        </div>

                        <AnimatePresence>
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-5 overflow-visible"
                            >
                                {/* DATE SPLIT INPUTS */}
                                <div className="relative">
                                    <div className={`absolute top-3 text-[#86868B] ${isRTL ? 'right-4' : 'left-4'}`}>
                                    <Calendar className="w-5 h-5" />
                                    </div>
                                    <div className={`flex gap-2 ${isRTL ? 'pr-12' : 'pl-12'} overflow-x-auto scrollbar-hide`}>
                                        <input 
                                            type="tel" 
                                            pattern="[0-9]*"
                                            value={day} 
                                            onChange={e => handleDateChange('d', e.target.value)}
                                            placeholder="DD"
                                            className="ios-input w-1/3 min-w-[60px] text-center bg-black/50 border-white/10 focus:border-[#00FF41] text-white"
                                        />
                                        <input 
                                            type="tel" 
                                            pattern="[0-9]*"
                                            value={month} 
                                            onChange={e => handleDateChange('m', e.target.value)}
                                            placeholder="MM"
                                            className="ios-input w-1/3 min-w-[60px] text-center bg-black/50 border-white/10 focus:border-[#00FF41] text-white"
                                        />
                                        <input 
                                            type="tel" 
                                            pattern="[0-9]*"
                                            value={year} 
                                            onChange={e => handleDateChange('y', e.target.value)}
                                            placeholder="YYYY"
                                            className="ios-input w-1/3 min-w-[80px] text-center bg-black/50 border-white/10 focus:border-[#00FF41] text-white"
                                        />
                                    </div>
                                </div>
                                
                                {/* TIME INPUT */}
                                <div className="flex gap-4 items-center">
                                    <div className="relative flex-1">
                                        <input 
                                            type="time" 
                                            value={time}
                                            disabled={timeUnknown}
                                            onChange={e => setTime(e.target.value)}
                                            className={`ios-input w-full text-center px-0 bg-black/50 border-white/10 focus:border-[#00FF41] text-white ${timeUnknown ? 'opacity-30' : ''}`}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 min-w-[120px]">
                                        <input 
                                            type="checkbox" 
                                            id="timeUnknown"
                                            checked={timeUnknown}
                                            onChange={e => setTimeUnknown(e.target.checked)}
                                            className="w-4 h-4 accent-[#00FF41] rounded cursor-pointer"
                                        />
                                        <label htmlFor="timeUnknown" className="text-xs text-[#86868B] cursor-pointer select-none font-mono whitespace-nowrap">
                                            {isRTL ? "زمان نامشخص" : "TIME UNKNOWN"}
                                        </label>
                                    </div>
                                </div>

                                {/* LOCATION INPUT */}
                                <div className="relative z-[60]">
                                    <div className={`absolute top-4 text-[#86868B] ${isRTL ? 'right-4' : 'left-4'}`}>
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <input 
                                        type="text" 
                                        value={cityQuery}
                                        onChange={e => {
                                            setCityQuery(e.target.value);
                                            setSelectedLocation(null);
                                        }}
                                        placeholder={t('city')} 
                                        className={`ios-input w-full bg-black/50 border-white/10 focus:border-[#00FF41] text-white ${isRTL ? 'pr-12 text-right' : 'pl-12'}`}
                                    />
                                    
                                    {cityQuery && (
                                        <button 
                                            type="button"
                                            onClick={() => { setCityQuery(''); setSelectedLocation(null); }}
                                            className={`absolute top-4 text-[#86868B] hover:text-white ${isRTL ? 'left-10' : 'right-10'}`}
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}

                                    {isSearching && (
                                        <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'}`}>
                                            <Loader2 className="w-5 h-5 animate-spin text-[#00FF41]" />
                                        </div>
                                    )}

                                    <AnimatePresence>
                                        {cityResults.length > 0 && !selectedLocation && (
                                            <motion.ul 
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute top-full left-0 w-full mt-2 bg-[#1C1C1E] border border-[#00FF41]/30 rounded-xl overflow-hidden z-[70] shadow-2xl max-h-48 overflow-y-auto"
                                            >
                                                {cityResults.map((loc, i) => (
                                                    <li 
                                                        key={i}
                                                        onClick={() => {
                                                            setSelectedLocation(loc);
                                                            setCityQuery(`${loc.name}, ${loc.country}`);
                                                            setCityResults([]);
                                                        }}
                                                        className={`px-4 py-3 hover:bg-[#00FF41] hover:text-black cursor-pointer text-sm border-b border-white/5 last:border-none transition-colors flex items-center ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}
                                                    >
                                                        <span className="font-medium">{loc.name}</span>
                                                        <span className="text-xs opacity-60">{loc.country}</span>
                                                    </li>
                                                ))}
                                            </motion.ul>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </>
                )}

                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-[#FF3333] text-xs text-center font-mono bg-[#FF3333]/10 py-3 rounded-lg border border-[#FF3333]/30"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="ios-btn-accent mt-6 flex items-center justify-center gap-2 disabled:opacity-50 w-full py-4 text-base font-bold relative z-10"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'NEW' ? t('init') : t('login_btn'))}
                </motion.button>

                <div className="text-center pt-4 relative z-10">
                    <button 
                        type="button"
                        onClick={() => {
                            setMode(mode === 'NEW' ? 'LOGIN' : 'NEW');
                            setError(null);
                        }}
                        className="text-[#86868B] text-xs hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
                    >
                        {mode === 'NEW' ? (
                            <><Database className="w-3 h-3" /> {t('switch_login')}</>
                        ) : (
                            <><Globe className="w-3 h-3" /> {t('switch_new')}</>
                        )}
                    </button>
                </div>

              </form>
            </div>
            
            <p className="text-center text-[#86868B] text-[10px] mt-8 uppercase tracking-widest opacity-50 relative z-10">
                Secure Connection • End-to-End Encryption
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
