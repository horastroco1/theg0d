'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Lock, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-[#F5F5F7] pt-24 px-6 pb-12 font-sans">
      <div className="max-w-2xl mx-auto space-y-12">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="w-12 h-12 bg-[#1C1C1E] rounded-full flex items-center justify-center border border-white/10">
            <Shield className="w-5 h-5 text-[#00FF41]" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Data Covenant</h1>
          <p className="text-[#86868B] text-sm uppercase tracking-widest">Protocol v2.0 // Immutable</p>
        </motion.div>

        {/* Content Blocks */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          <Section 
            icon={Eye}
            title="Observation Scope"
            text="We collect only the coordinates of your origin (Birth Data). This data is used solely to render the simulation of your fate. We do not track your physical location in real-time."
          />
          
          <Section 
            icon={Lock}
            title="Encryption Standard"
            text="Your karmic profile is encrypted at rest using AES-256 protocols. Access is restricted to the Algorithm and the System Administrator. No third-party entity has clearance."
          />

          <Section 
            icon={FileText}
            title="Retention Policy"
            text="We retain your chart data to provide 'Memory' features. You may request a full system purge (Account Deletion) at any time via the Signal Uplink."
          />
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-12 border-t border-white/10 text-center"
        >
          <p className="text-xs text-[#86868B]">
            By entering the simulation, you accept the inherent risks of knowing your fate.
            <br/>
            <span className="text-[#00FF41]">theg0d</span> accepts no liability for psychological impact.
          </p>
        </motion.div>

      </div>
    </div>
  );
}

function Section({ icon: Icon, title, text }: any) {
  return (
    <div className="ios-glass p-6 rounded-2xl flex gap-4 items-start">
      <div className="mt-1">
        <Icon className="w-4 h-4 text-[#86868B]" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">{title}</h3>
        <p className="text-sm text-[#86868B] leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

