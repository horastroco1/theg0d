'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share, PlusSquare, X, Smartphone, Monitor, ArrowUpRight, ArrowDown } from 'lucide-react';

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState<'IOS' | 'ANDROID' | 'DESKTOP' | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showManualGuide, setShowManualGuide] = useState(false);

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
          // If no native prompt, show manual guide
          setShowManualGuide(true);
      }
  };

  if (!showPrompt) return null;

  return (
    <>
    {/* MANUAL GUIDE OVERLAY */}
    <AnimatePresence>
        {showManualGuide && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8"
                onClick={() => setShowManualGuide(false)}
            >
                <motion.div 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-[#0A0A0A] border border-white/20 p-8 max-w-md w-full text-center relative"
                    onClick={e => e.stopPropagation()}
                >
                    <button onClick={() => setShowManualGuide(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X className="w-6 h-6" /></button>
                    
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                        <Download className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white uppercase tracking-[0.2em] mb-4">Manual Override</h3>
                    <p className="text-white/60 text-xs font-mono mb-8 leading-relaxed">
                        Your browser security requires manual authorization to install the Neural Interface.
                    </p>

                    <div className="space-y-4 text-left bg-white/5 p-6 border border-white/5">
                        <div className="flex items-center gap-4 text-xs text-white font-mono">
                            <div className="w-6 h-6 bg-white/10 flex items-center justify-center rounded">1</div>
                            <span>Locate browser menu (usually top right)</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-white font-mono">
                            <div className="w-6 h-6 bg-white/10 flex items-center justify-center rounded">2</div>
                            <span>Select "Install App" or "Add to Home"</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-white font-mono">
                            <div className="w-6 h-6 bg-white/10 flex items-center justify-center rounded">3</div>
                            <span>Confirm installation</span>
                        </div>
                    </div>

                    <div className="mt-8 animate-bounce">
                        <ArrowUpRight className="w-6 h-6 text-[#FFD700] mx-auto" />
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>

    <AnimatePresence>
        {!showManualGuide && (
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
                                    <Download className="w-3 h-3" /> {deferredPrompt ? 'Install Protocol' : 'Manual Install'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
    </>
  );
}
