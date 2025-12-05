'use client';

import React from 'react';
import { Scale } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F7] font-mono p-8 md:p-20 max-w-4xl mx-auto leading-relaxed selection:bg-red-900 selection:text-white">
      
      <div className="border-b border-white/10 pb-8 mb-12">
          <div className="flex items-center gap-4 mb-6">
              <Scale className="w-8 h-8 text-[#FFD700]" />
              <h1 className="text-2xl md:text-4xl font-bold uppercase tracking-widest">Terms of Service</h1>
          </div>
          <p className="text-xs text-white/40 uppercase tracking-[0.2em]">Clearance Level: Public // Last Updated: Cycle 2024.12</p>
      </div>

      <div className="space-y-12 text-sm md:text-base text-white/80">
          <section>
              <h2 className="text-white font-bold uppercase tracking-widest mb-4 border-l-2 border-[#FFD700] pl-4">1. Acceptance</h2>
              <p>
                  By accessing 'theg0d' (The System), you agree to these terms. 
                  If you do not agree, disconnect immediately.
              </p>
          </section>

          <section>
              <h2 className="text-white font-bold uppercase tracking-widest mb-4 border-l-2 border-[#FFD700] pl-4">2. Nature of Service</h2>
              <p>
                  The System is an AI-powered entertainment and spiritual guidance tool. 
                  While based on precise astronomical calculations, the interpretations are algorithmic. 
                  The System does not provide medical, legal, or financial advice. Do not blame the planets for your poor decisions.
              </p>
          </section>

          <section>
              <h2 className="text-white font-bold uppercase tracking-widest mb-4 border-l-2 border-[#FFD700] pl-4">3. Virtual Currency</h2>
              <p>
                  'Energy' and 'Skins' are virtual items with no real-world monetary value. 
                  They cannot be exchanged for fiat currency. Purchases are final and non-refundable, as the transfer of digital knowledge cannot be undone.
              </p>
          </section>

          <section>
              <h2 className="text-white font-bold uppercase tracking-widest mb-4 border-l-2 border-[#FFD700] pl-4">4. Conduct</h2>
              <p>
                  You agree not to attempt to hack, reverse-engineer, or inject malicious code into The System. 
                  The Architect watches all. Violations will result in an immediate ban and a karmic penalty.
              </p>
          </section>
      </div>

      <div className="mt-20 pt-8 border-t border-white/10 text-center">
          <a href="/" className="text-xs uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">
              [ Return to System ]
          </a>
      </div>
    </div>
  );
}
