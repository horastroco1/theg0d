'use client';

import { useState } from 'react';
import TheGate from '@/components/TheGate';
import GodDashboard from '@/components/GodDashboard';

export default function Home() {
  const [userData, setUserData] = useState<any>(null);

  return (
    <main className="min-h-screen w-full bg-[#050505] text-[#00FF41] font-mono overflow-hidden relative selection:bg-[#00FF41] selection:text-black">
      <div className="scanlines" />
      
      {userData ? (
        <GodDashboard userData={userData} />
      ) : (
        <TheGate onSubmit={async (data) => setUserData(data)} />
      )}
    </main>
  );
}
