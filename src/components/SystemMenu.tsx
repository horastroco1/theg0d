'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, Shield, Book, Radio } from 'lucide-react';
import Link from 'next/link';

export default function SystemMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: 'THE PROTOCOL', href: '/about', icon: Book },
    { label: 'SIGNAL UPLINK', href: '/contact', icon: Radio },
    { label: 'DATA COVENANT', href: '/terms', icon: Shield },
  ];

  return (
    <>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-6 left-6 z-[60] w-10 h-10 bg-[#1C1C1E]/80 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 text-[#F5F5F7] hover:text-[#00FF41] hover:border-[#00FF41]/30 transition-all"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-md flex justify-start"
            onClick={() => setIsOpen(false)}
          >
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-80 h-full bg-[#000000] border-r border-white/10 p-8 relative shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-xs font-bold tracking-[0.3em] text-[#86868B]">SYSTEM MENU</h2>
                <button onClick={() => setIsOpen(false)} className="text-[#F5F5F7] hover:text-[#00FF41] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Links */}
              <nav className="flex-1 space-y-2">
                {menuItems.map((item, i) => (
                  <Link 
                    key={i} 
                    href={item.href} 
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center justify-between p-4 rounded-xl hover:bg-[#1C1C1E] transition-all border border-transparent hover:border-white/5"
                  >
                    <div className="flex items-center gap-4">
                        <item.icon className="w-4 h-4 text-[#86868B] group-hover:text-[#00FF41] transition-colors" />
                        <span className="text-sm font-medium tracking-wide text-[#F5F5F7]">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#86868B] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </Link>
                ))}
              </nav>

              {/* Footer */}
              <div className="pt-8 border-t border-white/10">
                <div className="text-[10px] text-[#86868B] font-mono text-center">
                    v2.0.4 // STABLE
                    <br/>
                    <span className="opacity-50">LATENCY: 12ms</span>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

