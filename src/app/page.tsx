'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TheGate, { FormData } from '@/components/TheGate';
import GodDashboard from '@/components/GodDashboard';

export default function Home() {
  const [userData, setUserData] = useState<FormData | null>(null);

  return (
    <main className="min-h-screen w-full bg-[#050505] text-[#00FF41] font-mono overflow-hidden relative selection:bg-[#00FF41] selection:text-black">
      <div className="scanlines" />
      
      <AnimatePresence mode="wait">
        {userData ? (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="h-full w-full"
          >
            <GodDashboard userData={userData} />
          </motion.div>
        ) : (
          <motion.div 
            key="gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            className="h-full w-full flex items-center justify-center"
          >
            <TheGate onSubmit={async (data) => setUserData(data)} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
