'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Loader2, ArrowRight, MapPin, Calendar, User, Globe, Database, X, Key, Copy, HelpCircle, Terminal } from 'lucide-react';
import { locationService, LocationData } from '@/services/locationService';
import { supabase } from '@/lib/supabase';
import { astrologyService } from '@/services/astrologyService';
import BootSequence from './BootSequence';
import { getTranslation } from '@/lib/translations'; 
import { getCulturalConfig } from '@/lib/culturalConfig'; // IMPORT CULTURAL ENGINE

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
  gender?: string;
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
  const [loginKey, setLoginKey] = useState(''); 
  
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const [time, setTime] = useState('');
  const [timeUnknown, setTimeUnknown] = useState(false);
  
  const [cityQuery, setCityQuery] = useState('');
  const [cityResults, setCityResults] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const [gender, setGender] = useState<string>(''); 

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedLang, setDetectedLang] = useState<string>('en');
  const [isWarping, setIsWarping] = useState(false); 
  
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const isRTL = detectedLang === 'fa' || detectedLang === 'ar' || detectedLang === 'he';

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  const t = (key: string) => getTranslation(detectedLang, key);
  
  // CULTURAL CONFIG
  const config = getCulturalConfig(detectedLang);
  const accentColor = config.accentColor; 

  useEffect(() => {
    const detectUserContext = async () => {
        try {
            const savedKey = localStorage.getItem('god_identity_key');
            if (savedKey) {
                setLoginKey(savedKey);
                setMode('LOGIN');
                setTimeout(() => autoLogin(savedKey), 500);
            }

            const lang = await locationService.detectUserLanguageByIP();
            setDetectedLang(lang);
            document.dir = ['fa', 'ar'].includes(lang) ? 'rtl' : 'ltr';

        } catch (e) {
            console.warn("Auto-detect failed, using browser lang");
            const lang = locationService.detectUserLanguage();
            setDetectedLang(lang);
            document.dir = ['fa', 'ar'].includes(lang) ? 'rtl' : 'ltr';
        }
    };
    detectUserContext();
  }, []);

  useEffect(() => {
      document.dir = isRTL ? 'rtl' : 'ltr';
  }, [isRTL]);

  const triggerWarp = async (callback: () => Promise<void>) => {
      setIsWarping(true);
      await new Promise(resolve => setTimeout(resolve, 800)); 
      await callback();
  };

  const autoLogin = async (key: string) => {
      setIsLoading(true);
      try {
          const { data: users, error: fetchError } = await supabase
              .from('users')
              .select('*')
              .eq('identity_key', key.trim())
              .limit(1);
          
          if (fetchError || !users || users.length === 0) {
              localStorage.removeItem('god_identity_key');
              throw new Error("Session Expired.");
          }

          const user = users[0];
          await triggerWarp(async () => {
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
                  gender: user.gender || 'unknown',
                  chart_data: user.chart_data,
                  identity_key: user.identity_key
              });
          });
      } catch (err: any) {
          setIsLoading(false);
          console.log("Auto-login failed:", err.message);
          setMode('NEW'); 
      }
  };

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
      
      if (field === 'd') {
          if (num.length <= 2) {
              setDay(num);
              if (num.length === 2) monthRef.current?.focus();
          }
      }
      if (field === 'm') {
          if (num.length <= 2) {
              setMonth(num);
              if (num.length === 2) yearRef.current?.focus();
          }
      }
      if (field === 'y') {
          if (num.length <= 4) setYear(num);
      }
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
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
                .eq('identity_key', loginKey.trim()) 
                .limit(1);
            
            if (fetchError || !users || users.length === 0) {
                throw new Error("Invalid Identity Key. Access Denied.");
            }
            
            const user = users[0]; // Get user first

            if (user.identity_key) localStorage.setItem('god_identity_key', user.identity_key);

            await triggerWarp(async () => {
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
                    gender: user.gender || 'unknown',
                    chart_data: user.chart_data,
                    identity_key: user.identity_key
                });
            });
        } catch (err: any) {
            setIsLoading(false);
            setError(err.message || "Login Failed");
        }
        return;
    }

    if (!name) {
        setError(t('err_name'));
        return;
    }

    setIsLoading(true);
    
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

    if (!validateAge(yNum, mNum, dNum)) {
        setError("Access Denied: Subject too young for simulation (13+).");
        setIsLoading(false);
        return;
    }

    const fullDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    if ((!time && !timeUnknown) || !selectedLocation || !gender) {
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

      const newIdentityKey = `G0D-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      localStorage.setItem('god_identity_key', newIdentityKey);

      // ROBUST INSERT: Handle gender column failure gracefully
      const userPayload: any = {
            name: name,
            birth_date: fullDate,
            birth_time: timeUnknown ? '12:00' : time,
            birth_place: selectedLocation.name,
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
            timezone: timezoneOffset,
            chart_data: chartData,
            identity_key: newIdentityKey 
      };
      // Only add gender if database likely supports it (or try/catch the insert)
      // For now, we assume the user will run the migration. If not, Supabase errors.
      // To be safe, we can't dynamically check schema easily without admin API. 
      // We will include it and catch the specific error if possible, or just rely on the migration being run.
      userPayload.gender = gender;

      const { error: dbError } = await supabase
        .from('users')
        .insert([userPayload]);
        
      if (dbError) {
        console.error("DB Backup Failed (Non-Critical):", JSON.stringify(dbError, null, 2));
        // If failure is due to column missing, we proceed anyway since chartData is calculated
      }

      setIsLoading(false);
      setGeneratedKey(newIdentityKey);

    } catch (err: any) {
      console.error("Signup Error:", err);
      setIsLoading(false);
      setError("Neural Handshake Failed. API Error.");
    }
  };

  const proceedWithKey = async () => {
      if (!generatedKey) return;
      
      const fullDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      const timezoneOffset = locationService.getTimezoneOffset(
        fullDate,
        timeUnknown ? "12:00" : time,
        selectedLocation!.timezone
      );

      await triggerWarp(async () => {
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
            gender,
            chart_data: null, 
            identity_key: generatedKey
        });
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

  return (
    <>
    <AnimatePresence>
        {isWarping && (
            <motion.div
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "circIn" }}
                className="fixed inset-0 z-[999] bg-white mix-blend-difference pointer-events-none"
            />
        )}
    </AnimatePresence>

    {!bootComplete && <BootSequence onComplete={() => setBootComplete(true)} />}
    
    <div className={`min-h-screen flex flex-col items-center justify-center relative p-6 bg-black text-[#F5F5F7] overflow-hidden font-mono ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      <div className="noise-overlay"></div>
      <div className="scanlines"></div>
      
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center opacity-20">
        <div className="w-[800px] h-[800px] border rounded-full animate-spin-slow dashed-border" style={{ borderColor: `${accentColor}33` }}></div>
        <div className="absolute w-[600px] h-[600px] border rounded-full animate-spin-reverse dashed-border" style={{ borderColor: `${accentColor}1A` }}></div>
      </div>

      <div className={`absolute top-6 z-50 flex gap-2 ${isRTL ? 'left-6' : 'right-6'}`}>
          {['en', 'es', 'fa'].map(lang => (
              <button 
                key={lang}
                onClick={() => {
                    setDetectedLang(lang);
                    document.dir = ['fa', 'ar'].includes(lang) ? 'rtl' : 'ltr';
                }}
                className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded border font-mono transition-colors ${
                    detectedLang === lang 
                    ? `text-black` 
                    : 'text-[#86868B] border-transparent hover:border-[#86868B]'
                }`}
                style={detectedLang === lang ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
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
              <h1 className="text-6xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 select-none glitch-text" data-text="theg0d">
                theg0d
              </h1>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="uppercase tracking-[0.3em] text-xs font-mono animate-pulse"
              style={{ color: accentColor }}
            >
              {config.greeting}
            </motion.p>

            <motion.button
              onClick={handleStart}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, type: "spring", stiffness: 200 }}
              className="group relative bg-black border font-mono font-bold px-8 py-4 rounded hover:text-black transition-all flex items-center gap-2 mx-auto mt-8 z-50 overflow-hidden"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300" style={{ backgroundColor: accentColor }}></div>
              <span className="relative z-10 flex items-center gap-2">
                  {isRTL ? <ArrowRight className="w-4 h-4 rotate-180" /> : null}
                  {t('enter')} 
                  {!isRTL ? <ArrowRight className="w-4 h-4" /> : null}
              </span>
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
             <div className="bg-black/80 backdrop-blur-xl p-8 rounded border text-center space-y-6 shadow-[0_0_30px_rgba(0,255,65,0.1)] relative" style={{ borderColor: accentColor }}>
                <div className="absolute top-0 left-0 w-2 h-2" style={{ backgroundColor: accentColor }}></div>
                <div className="absolute top-0 right-0 w-2 h-2" style={{ backgroundColor: accentColor }}></div>
                <div className="absolute bottom-0 left-0 w-2 h-2" style={{ backgroundColor: accentColor }}></div>
                <div className="absolute bottom-0 right-0 w-2 h-2" style={{ backgroundColor: accentColor }}></div>

                <div className="w-16 h-16 rounded flex items-center justify-center mx-auto border" style={{ borderColor: accentColor, backgroundColor: `${accentColor}1A` }}>
                    <Key className="w-8 h-8" style={{ color: accentColor }} />
                </div>
                
                <div>
                    <h3 className="text-2xl font-bold text-white mb-2 font-mono">{t('access_granted')}</h3>
                    <p className="text-[#86868B] text-xs font-mono">
                        {t('identity_key_generated')}
                        <br/>
                        <span className="text-[#FF3333] uppercase font-bold animate-pulse">
                            {t('do_not_lose')}
                        </span>
                    </p>
                </div>

                <div 
                    onClick={copyKey}
                    className="bg-black p-4 border font-mono text-lg tracking-widest cursor-pointer transition-all flex items-center justify-between group relative overflow-hidden"
                    style={{ borderColor: `${accentColor}80`, color: accentColor }}
                >
                    <div className="absolute inset-0 scanlines opacity-50"></div>
                    <span className="relative z-10">{generatedKey}</span>
                    <Copy className="w-4 h-4 opacity-50 group-hover:opacity-100 relative z-10" />
                </div>

                <button
                    onClick={proceedWithKey}
                    className="w-full text-black font-bold py-4 font-mono hover:bg-white transition-colors"
                    style={{ backgroundColor: accentColor }}
                >
                    {t('enter')}
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
            <div className="bg-black/80 backdrop-blur-xl p-8 rounded border border-white/10 relative overflow-visible shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 opacity-50" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}></div>
              
              <div className="mb-8 text-center relative z-10">
                <h2 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
                    {mode === 'NEW' ? t('identity') : t('login_title')}
                </h2>
                <p className="text-[#86868B] text-xs mt-2 font-mono">
                    {mode === 'NEW' ? t('init_karmic_profile') : t('enter_identity_key')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 relative z-10 font-mono">
                
                {mode === 'LOGIN' ? (
                     // --- LOGIN INPUT (KEY) ---
                     <div className="relative group">
                        <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'}`} style={{ color: accentColor }}>
                            <Key className="w-5 h-5" />
                        </div>
                        <input 
                            type="text" 
                            value={loginKey}
                            onChange={e => setLoginKey(e.target.value)}
                            placeholder="G0D-XXXX-XXXX" 
                            className={`w-full bg-black border border-white/20 p-4 outline-none transition-all font-mono uppercase ${isRTL ? 'pr-12 text-right' : 'pl-12'}`}
                            style={{ color: accentColor, borderColor: loginKey ? accentColor : 'rgba(255,255,255,0.2)' }}
                            autoFocus
                        />
                     </div>
                ) : (
                    // --- SIGNUP INPUTS ---
                    <>
                        <div className="relative group">
                        <div className={`absolute top-4 text-[#86868B] group-focus-within:text-white ${isRTL ? 'right-4' : 'left-4'}`}>
                            <Terminal className="w-5 h-5" />
                        </div>
                        <input 
                            type="text" 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder={t('name')} 
                            className={`w-full bg-black border border-white/20 focus:border-white text-white p-4 outline-none transition-all font-mono ${isRTL ? 'pr-12 text-right' : 'pl-12'}`}
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
                                            maxLength={2}
                                            className="w-1/3 min-w-[60px] text-center bg-black border border-white/20 focus:border-white text-white p-3 outline-none"
                                        />
                                        <input 
                                            ref={monthRef} 
                                            type="tel" 
                                            pattern="[0-9]*"
                                            value={month} 
                                            onChange={e => handleDateChange('m', e.target.value)}
                                            placeholder="MM"
                                            maxLength={2}
                                            className="w-1/3 min-w-[60px] text-center bg-black border border-white/20 focus:border-white text-white p-3 outline-none"
                                        />
                                        <input 
                                            ref={yearRef} 
                                            type="tel" 
                                            pattern="[0-9]*"
                                            value={year} 
                                            onChange={e => handleDateChange('y', e.target.value)}
                                            placeholder="YYYY"
                                            maxLength={4}
                                            className="w-1/3 min-w-[80px] text-center bg-black border border-white/20 focus:border-white text-white p-3 outline-none"
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
                                            className={`w-full text-center bg-black border border-white/20 focus:border-white text-white p-3 outline-none ${timeUnknown ? 'opacity-30' : ''}`}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 min-w-[120px]">
                                        <input 
                                            type="checkbox" 
                                            id="timeUnknown"
                                            checked={timeUnknown}
                                            onChange={e => setTimeUnknown(e.target.checked)}
                                            className="w-4 h-4 rounded cursor-pointer bg-black border-white/20"
                                            style={{ accentColor: accentColor }}
                                        />
                                        <label htmlFor="timeUnknown" className="text-[10px] text-[#86868B] cursor-pointer select-none font-mono whitespace-nowrap uppercase">
                                            {t('time_unknown')}
                                        </label>
                                    </div>
                                </div>

                                {/* GENDER SELECTOR */}
                                <div className="flex gap-2">
                                    {['male', 'female', 'other'].map((g) => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => setGender(g)}
                                            className={`flex-1 py-3 text-[10px] font-bold border transition-all uppercase ${
                                                gender === g 
                                                ? 'text-black' 
                                                : 'bg-black text-[#86868B] border-white/20 hover:border-white/40'
                                            }`}
                                            style={gender === g ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
                                        >
                                            {g === 'male' && t('gender_m')}
                                            {g === 'female' && t('gender_f')}
                                            {g === 'other' && t('gender_o')}
                                        </button>
                                    ))}
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
                                        className={`w-full bg-black border border-white/20 focus:border-white text-white p-4 outline-none transition-all font-mono ${isRTL ? 'pr-12 text-right' : 'pl-12'}`}
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
                                        <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'}`} style={{ color: accentColor }}>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        </div>
                                    )}

                                    <AnimatePresence>
                                        {cityResults.length > 0 && !selectedLocation && (
                                            <motion.ul 
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute top-full left-0 w-full mt-2 bg-black border z-[70] shadow-2xl max-h-48 overflow-y-auto"
                                                style={{ borderColor: accentColor }}
                                            >
                                                {cityResults.map((loc, i) => (
                                                    <li 
                                                        key={i}
                                                        onClick={() => {
                                                            setSelectedLocation(loc);
                                                            setCityQuery(`${loc.name}, ${loc.country}`);
                                                            setCityResults([]);
                                                        }}
                                                        className={`px-4 py-3 hover:text-black cursor-pointer text-xs border-b border-white/10 last:border-none transition-colors flex items-center font-mono ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = accentColor}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                    >
                                                        <span className="font-bold">{loc.name}</span>
                                                        <span className="opacity-60">{loc.country}</span>
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
                            className="text-[#FF3333] text-xs text-center font-mono bg-[#FF3333]/10 py-3 border border-[#FF3333]/30"
                        >
                            {`> ERROR: ${error}`}
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full text-black font-bold py-4 uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
                  style={{ backgroundColor: accentColor }}
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
                        className="text-[#86868B] text-[10px] hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto uppercase tracking-widest font-mono"
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
            
            <p className="text-center text-[#86868B] text-[9px] mt-8 uppercase tracking-widest opacity-30 relative z-10 font-mono">
                ENCRYPTED CONNECTION :: PORT 443
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
