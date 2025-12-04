'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Book, Cpu, Zap, Layout } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-[#F5F5F7] pt-24 px-6 pb-12 font-sans">
      <div className="max-w-2xl mx-auto space-y-16">
        
        {/* Hero */}
        <div className="text-center space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold tracking-tighter"
          >
            The Protocol
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#86868B] text-lg leading-relaxed max-w-lg mx-auto"
          >
            We merged 5,000 years of Vedic wisdom with the cold precision of Silicon Valley logic. 
            <br/>
            <span className="text-[#00FF41]">This is not an app. It is a mirror.</span>
          </motion.p>
        </div>

        {/* Pillars */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card 
            icon={Book} 
            title="Vedic Core" 
            desc="Powered by the algorithms of B.V. Raman and Parashara. We calculate Dasha periods down to the second."
          />
          <Card 
            icon={Cpu} 
            title="AI Neural Net" 
            desc="Gemini 2.5 Flash translates ancient Sanskrit into actionable, modern system diagnostics."
          />
          <Card 
            icon={Zap} 
            title="Real-Time Sync" 
            desc="Your chart updates live with the movement of the planets. The simulation never sleeps."
          />
          <Card 
            icon={Layout} 
            title="Zero Friction" 
            desc="No ads. No clutter. Just pure data. Designed with the obsession of a debilitating perfectionism."
          />
        </div>

      </div>
    </div>
  );
}

function Card({ icon: Icon, title, desc }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="ios-glass p-6 rounded-3xl space-y-4 hover:bg-white/5 transition-colors"
    >
      <div className="w-10 h-10 bg-[#1C1C1E] rounded-full flex items-center justify-center border border-white/10">
        <Icon className="w-4 h-4 text-[#00FF41]" />
      </div>
      <div>
        <h3 className="text-base font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-[#86868B] leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

