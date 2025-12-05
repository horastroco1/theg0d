'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Loader2, ArrowRight, MapPin, Calendar, User, Globe, Database, X, Key, Copy, HelpCircle, Terminal } from 'lucide-react';
import { locationService, LocationData } from '@/services/locationService';
import { supabase } from '@/lib/supabase';
import { astrologyService } from '@/services/astrologyService';
import BootSequence from './BootSequence';
import { TheGodLogo } from './TheGodLogo';
import { getTranslation } from '@/lib/translations'; 
import { getCulturalConfig } from '@/lib/culturalConfig'; 

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

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const hasBooted = sessionStorage.getItem('god_boot_complete');
    if (hasBooted) {
        setBootComplete(true);
    }
    // ... rest of useEffect
    
    const detectUserContext = async () => {
        try {
            const savedKey = localStorage.getItem('god_identity_key');
            if (savedKey) {
                setLoginKey(savedKey);
                setMode('LOGIN');
                // Removed autoLogin timeout here to prevent double triggers
                // Instead, we can rely on the user clicking 'Enter' or just pre-filling
                // If you WANT auto-login, we should use a more stable hook
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
    
    const dNum = parseInt(day.trim(), 10);
    const mNum = parseInt(month.trim(), 10);
    const yNum = parseInt(year.trim(), 10);

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
      userPayload.gender = gender;

      const { error: dbError } = await supabase
        .from('users')
        .insert([userPayload]);
        
      if (dbError) {
        console.error("DB Backup Failed (Non-Critical):", JSON.stringify(dbError, null, 2));
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

  // FOUNDATION PROTOCOL: Cinematic Transitions
  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, filter: "blur(20px)" },
    visible: { 
      opacity: 1, 
      scale: 1, 
      filter: "blur(0px)",
      transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } 
    },
    exit: { opacity: 0, scale: 1.05, filter: "blur(40px)", transition: { duration: 0.8 } }
  };

  if (!isMounted) return <div className="bg-[#050505] min-h-screen w-full" />;

  return (
    <>
    {/* WARP OVERLAY */}
    <AnimatePresence>
        {isWarping && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="fixed inset-0 z-[999] bg-white mix-blend-difference pointer-events-none"
            />
        )}
    </AnimatePresence>

    {/* BOOT SEQUENCE - ONLY RENDER IF NOT COMPLETE */}
    {!bootComplete ? (
        <BootSequence onComplete={() => {
            setBootComplete(true);
            sessionStorage.setItem('god_boot_complete', 'true');
        }} />
    ) : (
        // MAIN CONTENT - ONLY RENDER IF BOOT COMPLETE
        <div className={`min-h-screen flex flex-col items-center justify-center relative p-6 bg-black text-[#F5F5F7] overflow-hidden font-mono ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
          
          {/* --- FOUNDATION BACKGROUND --- */}
          {/* No Scanlines. Pure Void. */}
          
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center opacity-10">
            <div className="w-[800px] h-[800px] border rounded-full animate-pulse-slow" style={{ borderColor: accentColor }}></div>
          </div>

          {/* REMOVED LANGUAGE BUTTONS - LOCATION BASED ONLY */}

          <AnimatePresence mode='wait'>
            {step === 0 ? (
              <motion.div 
                key="intro"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-center space-y-12 z-[60] relative pointer-events-auto"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 1.5, ease: "easeOut" }}
                  className="inline-block"
                >
                  <TheGodLogo className="w-64 md:w-96 h-auto text-white opacity-90 mx-auto" />
                </motion.div>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 2 }}
                  className="uppercase tracking-[0.5em] text-xs text-white/50 font-mono"
                >
                  {config.greeting}
                </motion.p>

                <motion.button
                  onClick={handleStart}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5, type: "spring", stiffness: 100 }}
                  className="group relative text-white font-bold py-4 px-12 rounded-none overflow-hidden transition-all cursor-pointer z-[70]"
                >
                  <div className="absolute inset-0 border border-white/20 group-hover:border-white/100 transition-colors duration-500"></div>
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-500"></div>
                  
                  <span className="relative z-10 flex items-center gap-4 uppercase tracking-[0.2em] text-xs">
                      {isRTL ? <ArrowRight className="w-3 h-3 rotate-180" /> : null}
                      {t('enter')} 
                      {!isRTL ? <ArrowRight className="w-3 h-3" /> : null}
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
                 <div className="foundation-glass p-12 text-center space-y-8 relative">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto border border-white/20 bg-white/5">
                        <Key className="w-8 h-8 text-white" />
                    </div>
                    
                    <div>
                        <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">{t('access_granted')}</h3>
                        <p className="text-white/50 text-xs uppercase tracking-widest leading-relaxed">
                            {t('identity_key_generated')}
                            <br/>
                            <span className="text-red-500 block mt-2">
                                {t('do_not_lose')}
                            </span>
                        </p>
                    </div>

                    <div 
                        onClick={copyKey}
                        className="foundation-input text-center cursor-pointer hover:bg-white/10 flex items-center justify-between group"
                    >
                        <span className="relative z-10 font-mono text-sm tracking-[0.2em]">{generatedKey}</span>
                        <Copy className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <button
                        onClick={proceedWithKey}
                        className="foundation-btn"
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
                <div className="foundation-glass p-10 relative overflow-hidden">
                  
                  <div className="mb-10 text-center relative z-10">
                    <h2 className="text-2xl font-bold tracking-tight text-white uppercase">
                        {mode === 'NEW' ? t('identity') : t('login_title')}
                    </h2>
                    <p className="text-white/40 text-[10px] mt-3 uppercase tracking-[0.2em]">
                        {mode === 'NEW' ? t('init_karmic_profile') : t('enter_identity_key')}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    
                    {mode === 'LOGIN' ? (
                         // --- LOGIN INPUT (KEY) ---
                         <div className="relative group">
                            <input 
                                type="text" 
                                value={loginKey}
                                onChange={e => setLoginKey(e.target.value)}
                                placeholder="G0D-XXXX-XXXX" 
                                className="foundation-input text-center"
                                autoFocus
                            />
                         </div>
                    ) : (
                        // --- SIGNUP INPUTS ---
                        <>
                            <div className="relative group">
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder={t('name')} 
                                    className="foundation-input"
                                    autoFocus
                                />
                            </div>

                            <AnimatePresence>
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-6 overflow-visible"
                                >
                                    {/* DATE SPLIT INPUTS */}
                                    <div className="flex gap-4">
                                        <input 
                                            type="tel" 
                                            pattern="[0-9]*"
                                            value={day} 
                                            onChange={e => handleDateChange('d', e.target.value)}
                                            placeholder="DD"
                                            maxLength={2}
                                            className="foundation-input text-center w-1/3"
                                        />
                                        <input 
                                            ref={monthRef} 
                                            type="tel" 
                                            pattern="[0-9]*"
                                            value={month} 
                                            onChange={e => handleDateChange('m', e.target.value)}
                                            placeholder="MM"
                                            maxLength={2}
                                            className="foundation-input text-center w-1/3"
                                        />
                                        <input 
                                            ref={yearRef} 
                                            type="tel" 
                                            pattern="[0-9]*"
                                            value={year} 
                                            onChange={e => handleDateChange('y', e.target.value)}
                                            placeholder="YYYY"
                                            maxLength={4}
                                            className="foundation-input text-center w-1/3"
                                        />
                                    </div>
                                    
                                    {/* TIME INPUT */}
                                    <div className="flex gap-4 items-center">
                                        <div className="relative flex-1">
                                            <input 
                                                type="time" 
                                                value={time}
                                                disabled={timeUnknown}
                                                onChange={e => setTime(e.target.value)}
                                                className={`foundation-input text-center ${timeUnknown ? 'opacity-30' : ''}`}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 min-w-[120px]">
                                            <input 
                                                type="checkbox" 
                                                id="timeUnknown"
                                                checked={timeUnknown}
                                                onChange={e => setTimeUnknown(e.target.checked)}
                                                className="w-4 h-4 cursor-pointer accent-white"
                                            />
                                            <label htmlFor="timeUnknown" className="text-[10px] text-white/60 cursor-pointer select-none uppercase tracking-widest">
                                                {t('time_unknown')}
                                            </label>
                                        </div>
                                    </div>

                                    {/* GENDER SELECTOR */}
                                    <div className="flex gap-0 border border-white/10">
                                        {['male', 'female', 'other'].map((g) => (
                                            <button
                                                key={g}
                                                type="button"
                                                onClick={() => setGender(g)}
                                                className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${
                                                    gender === g 
                                                    ? 'bg-white text-black' 
                                                    : 'bg-transparent text-white/40 hover:text-white'
                                                }`}
                                            >
                                                {g === 'male' && t('gender_m')}
                                                {g === 'female' && t('gender_f')}
                                                {g === 'other' && t('gender_o')}
                                            </button>
                                        ))}
                                    </div>

                                    {/* LOCATION INPUT */}
                                    <div className="relative z-[60]">
                                        <input 
                                            type="text" 
                                            value={cityQuery}
                                            onChange={e => {
                                                setCityQuery(e.target.value);
                                                setSelectedLocation(null);
                                            }}
                                            placeholder={t('city')} 
                                            className="foundation-input"
                                        />
                                        
                                        {cityQuery && (
                                            <button 
                                                type="button"
                                                onClick={() => { setCityQuery(''); setSelectedLocation(null); }}
                                                className={`absolute top-5 text-white/40 hover:text-white ${isRTL ? 'left-4' : 'right-4'}`}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}

                                        {isSearching && (
                                            <div className={`absolute top-5 ${isRTL ? 'left-10' : 'right-10'}`}>
                                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                                            </div>
                                        )}

                                        <AnimatePresence>
                                            {cityResults.length > 0 && !selectedLocation && (
                                                <motion.ul 
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    className="absolute top-full left-0 w-full mt-0 bg-[#0A0A0A] border border-white/10 z-[70] shadow-2xl max-h-48 overflow-y-auto"
                                                >
                                                    {cityResults.map((loc, i) => (
                                                        <li 
                                                            key={i}
                                                            onClick={() => {
                                                                setSelectedLocation(loc);
                                                                setCityQuery(`${loc.name}, ${loc.country}`);
                                                                setCityResults([]);
                                                            }}
                                                            className={`px-6 py-4 hover:bg-white/5 cursor-pointer text-xs border-b border-white/5 last:border-none transition-colors flex items-center font-mono ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}
                                                        >
                                                            <span className="font-bold text-white">{loc.name}</span>
                                                            <span className="opacity-40">{loc.country}</span>
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
                                className="text-red-500 text-xs text-center uppercase tracking-widest py-2"
                            >
                                {`// ERROR: ${error}`}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="foundation-btn mt-8"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (mode === 'NEW' ? t('init') : t('login_btn'))}
                    </motion.button>

                    <div className="text-center pt-6 relative z-10">
                        <button 
                            type="button"
                            onClick={() => {
                                setMode(mode === 'NEW' ? 'LOGIN' : 'NEW');
                                setError(null);
                            }}
                            className="foundation-btn-ghost"
                        >
                            {mode === 'NEW' ? t('switch_login') : t('switch_new')}
                        </button>
                    </div>

                  </form>
                </div>
                
                <p className="text-center text-white/20 text-[9px] mt-8 uppercase tracking-[0.3em] relative z-10 font-mono">
                    SECURE LINK :: ENCRYPTED
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    )}
    </>
  );
}
