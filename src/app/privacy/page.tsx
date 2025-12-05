'use client';

import React from 'react';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F7] font-mono p-8 md:p-20 max-w-4xl mx-auto leading-relaxed selection:bg-red-900 selection:text-white">
      
      <div className="border-b border-white/10 pb-8 mb-12">
          <div className="flex items-center gap-4 mb-6">
              <Shield className="w-8 h-8 text-red-500" />
              <h1 className="text-2xl md:text-4xl font-bold uppercase tracking-widest">Classified Protocol: Privacy</h1>
          </div>
          <p className="text-xs text-white/40 uppercase tracking-[0.2em]">Clearance Level: Public // Last Updated: Cycle 2024.12</p>
      </div>

      <div className="space-y-12 text-sm md:text-base text-white/80">
          <section>
              <h2 className="text-white font-bold uppercase tracking-widest mb-4 border-l-2 border-red-500 pl-4">1. Data Collection</h2>
              <p>
                  The System collects specific coordinates: Date of Birth, Time of Birth, and Location. 
                  This data is used SOLELY for the calculation of your astrological chart. 
                  We do not sell your fate to third-party brokers. Your karma is your own.
              </p>
          </section>

          <section>
              <h2 className="text-white font-bold uppercase tracking-widest mb-4 border-l-2 border-red-500 pl-4">2. Encryption</h2>
              <p>
                  All conversations with the AI Oracle are encrypted at rest using AES-256 protocols. 
                  Your secrets, confessions, and queries are stored in a secure 'Grimoire' accessible only via your unique Identity Key.
              </p>
          </section>

          <section>
              <h2 className="text-white font-bold uppercase tracking-widest mb-4 border-l-2 border-red-500 pl-4">3. Cookies & Local Storage</h2>
              <p>
                  We use Local Storage and Cookies to maintain your session state (Energy, XP, Level). 
                  This is essential for the gamification of your spiritual journey. Disabling them will disconnect you from the simulation.
              </p>
          </section>

          <section>
              <h2 className="text-white font-bold uppercase tracking-widest mb-4 border-l-2 border-red-500 pl-4">4. The Right to Be Forgotten</h2>
              <p>
                  You may request the complete deletion of your data ('The Purge') at any time by contacting the Architect. 
                  This action is irreversible and will reset your progress in the simulation to zero.
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

