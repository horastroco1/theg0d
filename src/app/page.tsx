'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TheGate, { FormData } from '@/components/TheGate';
import GodDashboard from '@/components/GodDashboard';
import GenesisLanding from '@/components/GenesisLanding';

export default function Home() {
  const [userData, setUserData] = useState<FormData | null>(null);
  const [showGate, setShowGate] = useState(false);

  // If user is already logged in (checked in TheGate internal logic but we can skip landing if we knew), 
  // but for now we always show landing first unless we detect session.
  // Actually, let's let the user experience the Genesis first.

  return (
    <main className="min-h-screen w-full bg-[#050505] font-sans overflow-hidden relative">
      
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
        ) : showGate ? (
          <motion.div 
            key="gate"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full flex items-center justify-center"
          >
            <TheGate onSubmit={async (data) => setUserData(data)} />
          </motion.div>
        ) : (
           <motion.div
             key="genesis"
             exit={{ opacity: 0, y: -50 }}
             transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
             className="h-full w-full"
           >
             <GenesisLanding onEnter={() => setShowGate(true)} />
           </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
