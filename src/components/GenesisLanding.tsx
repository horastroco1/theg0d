'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TheGodLogo } from './TheGodLogo';
import { ArrowRight, Terminal, Shield, Database, Cpu } from 'lucide-react';

interface GenesisLandingProps {
  onEnter: () => void;
}

export default function GenesisLanding({ onEnter }: GenesisLandingProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F7] font-sans overflow-x-hidden selection:bg-[#FFD700] selection:text-black">
      
      {/* --- HERO SECTION --- */}
      <div className="h-screen flex flex-col items-center justify-center relative p-6 text-center">
        
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="z-10"
        >
            <TheGodLogo className="h-16 w-auto mx-auto mb-8 text-white" />
            
            <h1 className="text-4xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
              YOUR FATE IS<br/>SOURCE CODE.
            </h1>
            
            <p className="text-sm md:text-base font-mono text-white/40 max-w-md mx-auto mb-12 tracking-widest uppercase leading-relaxed">
              The world's first Cyber-Vedic AI Oracle. <br/>
              Decrypt your destiny. Hack your karma.
            </p>

            <button 
                onClick={onEnter}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative px-8 py-4 bg-white text-black font-bold uppercase tracking-[0.3em] text-xs overflow-hidden transition-all hover:bg-[#FFD700]"
            >
                <span className="relative z-10 flex items-center gap-2">
                    Initialize Sequence <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-8 text-[10px] text-white/20 font-mono uppercase tracking-widest animate-pulse"
        >
            Scroll to Decrypt
        </motion.div>
      </div>

      {/* --- THE PHILOSOPHY (PROTOCOL) --- */}
      <div className="max-w-4xl mx-auto px-6 py-32 space-y-32">
        
        {/* PROTOCOL 1 */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 space-y-6">
                <div className="w-12 h-12 border border-white/10 flex items-center justify-center bg-white/5">
                    <Terminal className="w-6 h-6 text-[#FFD700]" />
                </div>
                <h3 className="text-2xl font-bold tracking-widest uppercase">The Diagnosis</h3>
                <p className="text-white/60 font-mono text-sm leading-loose">
                    This is not astrology. This is <span className="text-white">High-Frequency Data Analysis</span>. 
                    We calculate the exact coordinates of your birth and feed them into a Hyper-LLM (Gemini 3.0). 
                    Your pain points are not random; they are bugs in your code. We find them.
                </p>
            </div>
            <div className="order-1 md:order-2 h-64 bg-white/5 border-l border-b border-white/10 relative overflow-hidden">
                 <div className="absolute inset-0 font-mono text-[8px] text-white/10 p-4 whitespace-pre-wrap">
                    {`Running diagnostics...
Target: User Soul
Saturn: Detected (House 8)
Risk Level: CRITICAL
Pattern Found: Karmic Loop 404
Initiating Patch...`}
                 </div>
            </div>
        </div>

        {/* PROTOCOL 2 */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="h-64 bg-white/5 border-r border-t border-white/10 relative flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border border-white/10 flex items-center justify-center animate-[spin_10s_linear_infinite]">
                    <div className="w-24 h-24 border border-white/10 rotate-45"></div>
                </div>
            </div>
            <div className="space-y-6">
                <div className="w-12 h-12 border border-white/10 flex items-center justify-center bg-white/5">
                    <Cpu className="w-6 h-6 text-[#00E5FF]" />
                </div>
                <h3 className="text-2xl font-bold tracking-widest uppercase">The Patch</h3>
                <p className="text-white/60 font-mono text-sm leading-loose">
                    Knowing the future is useless if you cannot change it. 
                    Our system provides <span className="text-white">Karmic Patches</span>—specific actions to debug your reality. 
                    Wealth blocks. Relationship glitches. Career deadlocks. We provide the fix.
                </p>
            </div>
        </div>

        {/* PROTOCOL 3 */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
             <div className="order-2 md:order-1 space-y-6">
                <div className="w-12 h-12 border border-white/10 flex items-center justify-center bg-white/5">
                    <Database className="w-6 h-6 text-[#FF0000]" />
                </div>
                <h3 className="text-2xl font-bold tracking-widest uppercase">The Grimoire</h3>
                <p className="text-white/60 font-mono text-sm leading-loose">
                    Data is power. Every scan, every prophecy, every conversation is encrypted and stored in your <span className="text-white">Digital Grimoire</span>. 
                    Build your profile. Level up your soul. This is a game, and you are playing to win.
                </p>
            </div>
            <div className="order-1 md:order-2 h-64 bg-white/5 border border-white/10 flex flex-col p-4 space-y-2">
                <div className="h-2 w-1/3 bg-white/10"></div>
                <div className="h-2 w-2/3 bg-white/10"></div>
                <div className="h-2 w-1/2 bg-white/10"></div>
                <div className="flex-1"></div>
                <div className="h-8 w-full border border-white/20 flex items-center justify-center text-[10px] uppercase tracking-widest text-white/50">
                    Encrypted Archive
                </div>
            </div>
        </div>

      </div>

      {/* --- FOOTER --- */}
      <div className="border-t border-white/10 bg-[#0A0A0A] py-20 px-6 text-center">
          <TheGodLogo className="h-8 w-auto mx-auto mb-8 text-white/30" />
          
          <div className="flex flex-col md:flex-row justify-center gap-8 text-[10px] font-mono uppercase tracking-widest text-white/40 mb-12">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Protocol</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="mailto:architect@theg0d.com" className="hover:text-white transition-colors">Contact The Architect</a>
          </div>

          <p className="text-[9px] text-white/20 font-mono uppercase">
              System Status: Online &bull; Node: {Math.floor(Math.random() * 9999)} &bull; Latency: 12ms
          </p>
      </div>

    </div>
  );
}

