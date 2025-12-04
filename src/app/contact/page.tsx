'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Mail, Globe, Server } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-[#F5F5F7] pt-24 px-6 pb-12 font-sans flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 bg-[#00FF41]/10 rounded-full flex items-center justify-center mx-auto border border-[#00FF41]/20 animate-pulse">
            <Radio className="w-6 h-6 text-[#00FF41]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Signal Uplink</h1>
          <p className="text-[#86868B] text-xs uppercase tracking-widest">Direct Line to Admin</p>
        </motion.div>

        {/* Contact Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <a href="mailto:admin@theg0d.com" className="block ios-glass p-6 rounded-2xl hover:bg-white/5 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#1C1C1E] rounded-full flex items-center justify-center">
                <Mail className="w-4 h-4 text-white group-hover:text-[#00FF41] transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Email Protocol</h3>
                <p className="text-xs text-[#86868B]">admin@theg0d.com</p>
              </div>
            </div>
          </a>

          <a href="#" className="block ios-glass p-6 rounded-2xl hover:bg-white/5 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#1C1C1E] rounded-full flex items-center justify-center">
                <Globe className="w-4 h-4 text-white group-hover:text-[#00FF41] transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Global Grid</h3>
                <p className="text-xs text-[#86868B]">@theg0d_ai (X / Twitter)</p>
              </div>
            </div>
          </a>
        </motion.div>

        {/* Status */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1C1C1E] p-4 rounded-xl border border-white/5 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Server className="w-4 h-4 text-[#86868B]" />
            <span className="text-xs text-[#86868B] font-mono">SYSTEM STATUS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#00FF41] rounded-full animate-pulse"></span>
            <span className="text-xs text-[#00FF41] font-mono">OPERATIONAL</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

