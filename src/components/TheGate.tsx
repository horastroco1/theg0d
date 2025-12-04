'use client';

import React from 'react';

export default function TheGate() {
  return (
    <div className="min-h-screen bg-black text-[#00FF41] flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold tracking-widest mb-8">theg0d</h1>
      <button 
        className="border border-[#00FF41] px-6 py-3 mt-4 hover:bg-[#00FF41] hover:text-black transition font-mono text-xl uppercase tracking-widest"
        onClick={() => alert("SYSTEM INITIALIZED")}
      >
        INITIALIZE
      </button>
    </div>
  );
}
