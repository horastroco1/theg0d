'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BootSequenceProps {
  onComplete: () => void;
}

// MYSTIC / ARTIFACT MESSAGES
const bootLines = [
  "PROTOCOL: ZERO",
  "DETECTING SOUL SIGNATURE...",
  "ALIGNING CELESTIAL GRID...",
  "DECRYPTING FATE ARCHIVES...",
  "ARTIFACT AWAKENING."
];

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // We display lines one by one with a "reading" delay
    if (currentIndex >= bootLines.length) {
      const finishTimer = setTimeout(() => {
          setIsComplete(true);
          setTimeout(onComplete, 1000); // Allow fade out
      }, 800);
      return () => clearTimeout(finishTimer);
    }

    const timer = setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 1200); // Slow, deliberate pace (1.2s per line)

    return () => clearTimeout(timer);
  }, [currentIndex, onComplete]);

  return (
    <AnimatePresence>
        {!isComplete && (
            <motion.div 
                exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
                className="fixed inset-0 bg-[#050505] z-[100] flex flex-col items-center justify-center p-8 cursor-none"
            >
                {/* CENTERING CONTAINER */}
                <div className="w-full max-w-xl flex flex-col items-center space-y-8">
                    
                    {/* THE MONOLITH (Breathing Line) */}
                    <motion.div 
                        initial={{ scaleY: 0, opacity: 0 }}
                        animate={{ scaleY: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                        className="h-16 w-[1px] bg-white/20 relative overflow-hidden"
                    >
                        <motion.div 
                            animate={{ top: ["-100%", "100%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-white to-transparent opacity-50"
                        />
                    </motion.div>

                    {/* TEXT DISPLAY AREA */}
                    <div className="h-12 flex items-center justify-center">
                        <AnimatePresence mode='wait'>
                            <motion.p
                                key={currentIndex}
                                initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, y: -10, filter: "blur(5px)" }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="text-xs md:text-sm font-mono uppercase tracking-[0.3em] text-white/80 text-center"
                            >
                                {bootLines[Math.min(currentIndex, bootLines.length - 1)]}
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    {/* LOADING BAR (Minimalist) */}
                    <div className="w-32 h-[1px] bg-white/10 relative overflow-hidden">
                        <motion.div 
                            initial={{ width: "0%" }}
                            animate={{ width: `${Math.min((currentIndex / bootLines.length) * 100, 100)}%` }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="h-full bg-white absolute left-0 top-0"
                        />
                    </div>
                    
                    {/* FINAL FLASH (Gold) */}
                    {currentIndex === bootLines.length && (
                         <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0.5, 0] }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0 pointer-events-none mix-blend-screen bg-[#FFD700]"
                         />
                    )}

                </div>

                {/* BOTTOM IDENTIFIER */}
                <div className="absolute bottom-12 text-[9px] font-mono text-white/20 tracking-[0.4em] uppercase">
                    System Version 10.4.X
                </div>
            </motion.div>
        )}
    </AnimatePresence>
  );
}
