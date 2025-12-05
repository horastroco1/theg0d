import React from 'react';

interface LogoProps {
  className?: string;
}

export const TheGodLogo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <svg 
      viewBox="0 0 400 100" 
      xmlns="http://www.w3.org/2000/svg" 
      aria-label="thegΦd logo" 
      className={className}
      fill="currentColor"
    >
      <g fill="currentColor" stroke="none">
        {/* T */}
        <path d="M20,30 H60 V40 H45 V80 H35 V40 H20 Z" />
        {/* H */}
        <path d="M70,20 V80 H82 V56 H103 V80 H115 V20 H103 V45 H82 V20 Z" />
        {/* E */}
        <path d="M125,30 H165 V40 H137 V49 H160 V59 H137 V70 H165 V80 H125 Z" />
        {/* G */}
        <path d="M215,45 V30 H175 V80 H215 V60 H195 V70 H187 V40 H215" />
        
        {/* Φ (Phi) - The Centerpiece */}
        {/* The Circle */}
        <circle cx="255" cy="55" r="22" fill="none" stroke="currentColor" strokeWidth="6" />
        {/* The Vertical Data Beam */}
        <rect x="252" y="15" width="6" height="80" fill="currentColor" />
        {/* The Nodes (Top and Bottom) */}
        <rect x="250" y="10" width="10" height="8" fill="currentColor" />
        <rect x="250" y="92" width="10" height="8" fill="currentColor" />
        
        {/* D */}
        <path d="M295,20 V80 H320 C340,80 345,70 345,50 C345,30 340,20 320,20 Z M307,30 H320 C328,30 333,35 333,50 C333,65 328,70 320,70 H307 Z" />
      </g>
    </svg>
  );
};

