import React from 'react';

interface SymbolProps {
  className?: string;
}

export const TheGodSymbol: React.FC<SymbolProps> = ({ className = "" }) => {
  return (
    <svg 
      viewBox="0 0 60 100" 
      xmlns="http://www.w3.org/2000/svg" 
      aria-label="thegΦd symbol" 
      className={className}
      fill="currentColor"
    >
      <g transform="translate(-225, 0)">
        {/* Φ (Phi) - The Centerpiece */}
        {/* The Circle */}
        <circle cx="255" cy="55" r="22" fill="none" stroke="currentColor" strokeWidth="6" />
        {/* The Vertical Data Beam */}
        <rect x="252" y="15" width="6" height="80" fill="currentColor" />
        {/* The Nodes (Top and Bottom) */}
        <rect x="250" y="10" width="10" height="8" fill="currentColor" />
        <rect x="250" y="92" width="10" height="8" fill="currentColor" />
      </g>
    </svg>
  );
};

