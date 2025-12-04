import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BootSequenceProps {
  onComplete: () => void;
}

const TERMINAL_LINES = [
  "> CONNECTING TO AKASHIC RECORDS...",
  "> DECRYPTING SOUL CONTRACT...",
  "> BYPASSING EGO FIREWALL...",
  "> LINK ESTABLISHED."
];

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  useEffect(() => {
    if (currentLineIndex >= TERMINAL_LINES.length) {
      setTimeout(onComplete, 800); // Wait a bit after last line
      return;
    }

    const timeout = setTimeout(() => {
      setLines(prev => [...prev, TERMINAL_LINES[currentLineIndex]]);
      setCurrentLineIndex(prev => prev + 1);
    }, 600); // Speed of typing

    return () => clearTimeout(timeout);
  }, [currentLineIndex, onComplete]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center p-8 font-mono text-[#00FF41]">
      <div className="w-full max-w-md space-y-2">
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm md:text-base tracking-wider"
          >
            {line}
          </motion.div>
        ))}
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="w-2 h-4 bg-[#00FF41] inline-block ml-1"
        />
      </div>
    </div>
  );
}

