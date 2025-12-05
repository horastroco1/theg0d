'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share, PlusSquare, X, Smartphone } from 'lucide-react';

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState<'IOS' | 'ANDROID' | 'DESKTOP' | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return; // Already installed
    }

    // 2. Detect Platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
        setPlatform('IOS');
        // iOS doesn't have a native prompt event, so we show ours after a delay
        setTimeout(() => setShowPrompt(true), 15000); // Show after 15s
    } else if (/android/.test(userAgent)) {
        setPlatform('ANDROID');
    } else {
        setPlatform('DESKTOP');
    }

    // 3. Listen for Chrome/Android install event
    const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
      if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
              setShowPrompt(false);
          }
          setDeferredPrompt(null);
      }
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-6 right-6 z-[9999] md:right-auto md:max-w-sm"
        >
            <div className="bg-[#0A0A0A]/90 backdrop-blur-xl border border-[#FFD700]/30 p-6 relative shadow-[0_0_30px_rgba(255,215,0,0.1)]">
                <button 
                    onClick={() => setShowPrompt(false)}
                    className="absolute top-2 right-2 text-white/30 hover:text-white"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#FFD700]/10 rounded border border-[#FFD700]/30 flex items-center justify-center shrink-0 animate-pulse">
                        <Smartphone className="w-6 h-6 text-[#FFD700]" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">System Upgrade</h3>
                        <p className="text-[10px] text-white/60 font-mono leading-relaxed">
                            Establish a permanent neural link for faster access and offline data.
                        </p>
                        
                        {platform === 'IOS' ? (
                            <div className="space-y-2 pt-2">
                                <div className="flex items-center gap-2 text-[10px] text-white/80">
                                    <span className="bg-white/10 p-1 rounded"><Share className="w-3 h-3" /></span>
                                    <span>1. Tap Share Button</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-white/80">
                                    <span className="bg-white/10 p-1 rounded"><PlusSquare className="w-3 h-3" /></span>
                                    <span>2. Add to Home Screen</span>
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={handleInstall}
                                className="mt-2 w-full bg-white text-black text-[10px] font-bold py-3 uppercase tracking-[0.2em] hover:bg-[#E5E5E5] flex items-center justify-center gap-2"
                            >
                                <Download className="w-3 h-3" /> Install Protocol
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    </AnimatePresence>
  );
}

