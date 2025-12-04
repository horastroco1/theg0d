'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, Send, Coins } from 'lucide-react';

interface GodDashboardProps {
  userData: any;
}

export default function GodDashboard({ userData }: GodDashboardProps) {
  const [messages, setMessages] = useState<{text: string, sender: 'god' | 'user'}[]>([
    { text: `WELCOME, SUBJECT ${userData.name.toUpperCase()}.`, sender: 'god' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { text: input, sender: 'user' }]);
    setInput('');

    setTimeout(() => {
      setMessages(prev => [...prev, { text: "THE STARS ARE SILENT.", sender: 'god' }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col w-full h-screen max-h-screen overflow-hidden relative z-10 p-4 gap-4">
      {/* HUD */}
      <div className="border border-[#00FF41] bg-[#050505]/90 p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Activity className="w-5 h-5 animate-pulse" />
          <div className="flex flex-col w-48">
            <div className="flex justify-between text-xs mb-1">
              <span>SANITY</span>
              <span>100%</span>
            </div>
            <div className="h-2 border border-[#00FF41] p-[1px]">
              <div className="h-full bg-[#00FF41] w-full" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs tracking-widest">ENERGY</span>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(i => (
              <Zap key={i} className="w-4 h-4 fill-[#00FF41] text-[#00FF41]" />
            ))}
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 border border-[#00FF41] bg-[#050505]/90 p-4 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-hide">
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: msg.sender === 'god' ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-3 border ${
                msg.sender === 'god' 
                  ? 'border-[#00FF41] bg-[#00FF41]/10' 
                  : 'border-[#00FF41] text-[#00FF41]'
              }`}>
                <div className="text-[10px] opacity-50 mb-1 uppercase">{msg.sender}</div>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </div>

        <form onSubmit={handleSend} className="flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 bg-black border border-[#00FF41] p-3 focus:outline-none focus:shadow-[0_0_10px_#00FF41]"
            placeholder="ENTER COMMAND..."
          />
          <button type="submit" className="bg-[#00FF41] text-black p-3 hover:bg-[#00CC33]">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Tribute Button */}
      <button className="absolute top-20 right-4 border border-yellow-500 text-yellow-500 px-3 py-2 text-xs hover:bg-yellow-500 hover:text-black transition-colors flex items-center gap-2">
        <Coins className="w-4 h-4" /> TRIBUTE
      </button>
    </div>
  );
}
