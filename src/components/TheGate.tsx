'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Terminal, Search, Loader2, Lock, AlertTriangle } from 'lucide-react';
import { locationService, LocationData } from '@/services/locationService';

export interface FormData {
  name: string;
  date: string;
  time: string;
  timeUnknown: boolean;
  latitude: number;
  longitude: number;
  timezone: string;
  locationName: string;
}

interface TheGateProps {
  onSubmit: (data: FormData) => Promise<void>;
}

export default function TheGate({ onSubmit }: TheGateProps) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [cityQuery, setCityQuery] = useState('');
  const [cityResults, setCityResults] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce City Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (cityQuery.length > 2 && !selectedLocation) {
        setIsSearching(true);
        const results = await locationService.searchCity(cityQuery);
        setCityResults(results);
        setIsSearching(false);
      } else {
        setCityResults([]);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [cityQuery, selectedLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !date || (!time && !timeUnknown) || !selectedLocation) {
      setError("SYSTEM ERROR: DATA_PACKET_INCOMPLETE");
      return;
    }

    setIsLoading(true);

    const timezoneOffset = locationService.getTimezoneOffset(
      date,
      timeUnknown ? "12:00" : time,
      selectedLocation.timezone
    );

    try {
      await onSubmit({
        name,
        date,
        time: timeUnknown ? "12:00" : time,
        timeUnknown,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        timezone: timezoneOffset,
        locationName: selectedLocation.name
      });
    } catch (err) {
      setIsLoading(false);
      setError("CONNECTION REJECTED BY FATE.");
    }
  };

  const inputVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
    })
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          x: error ? [0, -10, 10, -10, 10, 0] : 0 
        }}
        transition={{ duration: error ? 0.4 : 0.8, ease: "circOut" }}
        className="w-full max-w-xl glass-panel p-8 md:p-12 rounded-xl relative z-20 neon-border"
      >
        {/* Header */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center mb-12"
        >
            <Terminal className="w-8 h-8 text-[#00FF41] mb-4 animate-pulse" />
            <h1 className="text-6xl font-bold tracking-tighter text-[#00FF41] font-mono glitch-text select-none">theg0d</h1>
            <p className="text-xs uppercase tracking-[0.4em] text-[#00FF41]/60 mt-2">Cyber-Vedic Astrology Protocol</p>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 mb-6 text-xs font-mono flex items-center gap-2 rounded"
            >
              <AlertTriangle className="w-4 h-4" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-8 font-mono">
          
          {/* Name */}
          <motion.div custom={1} variants={inputVariants} initial="hidden" animate="visible" className="group">
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#00FF41]/50 mb-1 block group-hover:text-[#00FF41] transition-colors">Subject ID</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border-b border-[#00FF41]/30 py-2 text-[#00FF41] text-xl focus:outline-none focus:border-[#00FF41] transition-all placeholder-[#00FF41]/20"
              placeholder="ENTER NAME"
              disabled={isLoading}
            />
          </motion.div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div custom={2} variants={inputVariants} initial="hidden" animate="visible" className="group">
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#00FF41]/50 mb-1 block group-hover:text-[#00FF41] transition-colors">Inception Date</label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent border-b border-[#00FF41]/30 py-2 text-[#00FF41] focus:outline-none focus:border-[#00FF41] [color-scheme:dark] text-lg"
                disabled={isLoading}
              />
            </motion.div>

            <motion.div custom={3} variants={inputVariants} initial="hidden" animate="visible" className="group">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#00FF41]/50 group-hover:text-[#00FF41] transition-colors">Time</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={timeUnknown}
                    onChange={(e) => setTimeUnknown(e.target.checked)}
                    className="accent-[#00FF41] w-3 h-3 cursor-pointer"
                    disabled={isLoading}
                  />
                  <span className="text-[9px] text-[#00FF41]/50">UNKNOWN</span>
                </div>
              </div>
              <input 
                type="time"
                value={time}
                disabled={timeUnknown || isLoading}
                onChange={(e) => setTime(e.target.value)}
                className={`w-full bg-transparent border-b border-[#00FF41]/30 py-2 text-[#00FF41] focus:outline-none focus:border-[#00FF41] [color-scheme:dark] text-lg ${timeUnknown ? 'opacity-30' : ''}`}
              />
            </motion.div>
          </div>

          {/* Location */}
          <motion.div custom={4} variants={inputVariants} initial="hidden" animate="visible" className="group relative">
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#00FF41]/50 mb-1 block group-hover:text-[#00FF41] transition-colors">Coordinates</label>
            <div className="relative">
              <input 
                type="text"
                value={cityQuery}
                onChange={(e) => {
                  setCityQuery(e.target.value);
                  setSelectedLocation(null);
                }}
                className="w-full bg-transparent border-b border-[#00FF41]/30 py-2 pl-8 text-[#00FF41] text-lg focus:outline-none focus:border-[#00FF41] placeholder-[#00FF41]/20 transition-all"
                placeholder="SEARCH LOCATION"
                disabled={isLoading}
              />
              <Search className="absolute left-0 top-3.5 w-4 h-4 text-[#00FF41]/40" />
              {isSearching && <Loader2 className="absolute right-2 top-3.5 w-4 h-4 animate-spin text-[#00FF41]" />}
            </div>

            {/* Autocomplete Dropdown */}
            <AnimatePresence>
              {cityResults.length > 0 && !selectedLocation && (
                <motion.ul 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 w-full bg-black/90 backdrop-blur-md border border-[#00FF41]/30 mt-2 max-h-48 overflow-y-auto z-50 shadow-2xl rounded"
                >
                  {cityResults.map((loc, i) => (
                    <li 
                      key={i}
                      onClick={() => {
                        setSelectedLocation(loc);
                        setCityQuery(`${loc.name}, ${loc.country || ''}`);
                        setCityResults([]);
                      }}
                      className="p-3 hover:bg-[#00FF41]/20 cursor-pointer border-b border-[#00FF41]/10 text-sm flex justify-between transition-colors text-[#00FF41]"
                    >
                      <span>{loc.name}</span>
                      <span className="text-xs opacity-50">{loc.country}</span>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            custom={5} variants={inputVariants} initial="hidden" animate="visible"
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(0,255,65,0.3)" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#00FF41] text-black p-4 mt-8 uppercase tracking-[0.25em] font-bold hover:bg-[#00CC33] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden rounded"
          >
            {isLoading ? (
              <motion.span 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-xs"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                ESTABLISHING UPLINK...
              </motion.span>
            ) : (
              <>
                <Lock className="w-4 h-4 group-hover:unlock transition-transform" />
                INITIALIZE FATE
              </>
            )}
          </motion.button>

        </form>
      </motion.div>
    </div>
  );
}
