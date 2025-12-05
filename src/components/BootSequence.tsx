'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface BootSequenceProps {
  onComplete: () => void;
}

const bootLines = [
  "INITIALIZING KERNEL...",
  "CONNECTING TO AKASHIC RECORDS...",
  "DECRYPTING KARMIC FILES...",
  "ESTABLISHING NEURAL LINK...",
  "SYSTEM ONLINE."
];

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= bootLines.length) {
      setTimeout(onComplete, 500); // Slight delay after last line
      return;
    }

    const timer = setTimeout(() => {
      setLines(prev => [...prev, bootLines[index]]);
      setIndex(prev => prev + 1);
    }, 400); // Speed of each line

    return () => clearTimeout(timer);
  }, [index, onComplete]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center p-8 font-mono text-xs md:text-sm text-[#00FF41] pointer-events-none cursor-wait">
      <div className="w-full max-w-md space-y-2">
        {lines.map((line, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="opacity-50">{`> `}</span>
            {line}
          </motion.div>
        ))}
        <motion.div 
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="w-2 h-4 bg-[#00FF41] mt-2"
        />
      </div>
    </div>
  );
}
