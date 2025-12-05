'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share, PlusSquare, X, Smartphone, Monitor } from 'lucide-react';

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState<'IOS' | 'ANDROID' | 'DESKTOP' | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return; 
    }

    // 2. Check if dismissed recently (24h)
    const dismissed = localStorage.getItem('god_install_dismissed');
    if (dismissed) {
        const dismissedTime = parseInt(dismissed);
        const now = Date.now();
        if (now - dismissedTime < 24 * 60 * 60 * 1000) {
            return; 
        }
    }

    // 3. Detect Platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
        setPlatform('IOS');
        // Show iOS prompt after 5s
        setTimeout(() => setShowPrompt(true), 5000); 
    } else if (/android/.test(userAgent)) {
        setPlatform('ANDROID');
    } else {
        setPlatform('DESKTOP');
        // Show Desktop prompt after 8s
        setTimeout(() => setShowPrompt(true), 8000);
    }

    // 4. Listen for Chrome/Android install event
    const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleDismiss = () => {
      setShowPrompt(false);
      localStorage.setItem('god_install_dismissed', Date.now().toString());
  };

  const handleInstall = async () => {
      if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
              setShowPrompt(false);
          }
          setDeferredPrompt(null);
      } else {
          alert("To install: Click the 'Install' or 'Share' icon in your browser address bar.");
      }
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-6 right-6 z-[9999] md:right-6 md:left-auto md:w-96"
        >
            <div className="bg-[#050505]/95 backdrop-blur-xl border border-[#FFD700]/30 p-6 relative shadow-[0_0_50px_rgba(255,215,0,0.15)]">
                <button 
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 text-white/30 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-[#FFD700]/5 rounded-none border border-[#FFD700]/30 flex items-center justify-center shrink-0 animate-pulse">
                        {platform === 'DESKTOP' ? <Monitor className="w-6 h-6 text-[#FFD700]" /> : <Smartphone className="w-6 h-6 text-[#FFD700]" />}
                    </div>
                    <div className="space-y-3 flex-1">
                        <div>
                            <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em]">Artifact Available</h3>
                            <p className="text-[10px] text-white/60 font-mono mt-1 leading-relaxed">
                                Install the Neural Interface for offline access and zero latency.
                            </p>
                        </div>
                        
                        {platform === 'IOS' ? (
                            <div className="space-y-2 pt-1 border-t border-white/10">
                                <div className="flex items-center gap-2 text-[9px] text-white/80 uppercase tracking-widest">
                                    <Share className="w-3 h-3" />
                                    <span>1. Tap Share</span>
                                </div>
                                <div className="flex items-center gap-2 text-[9px] text-white/80 uppercase tracking-widest">
                                    <PlusSquare className="w-3 h-3" />
                                    <span>2. Add to Home</span>
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={handleInstall}
                                className="w-full bg-white text-black text-[10px] font-bold py-3 uppercase tracking-[0.2em] hover:bg-[#FFD700] transition-colors flex items-center justify-center gap-2"
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
