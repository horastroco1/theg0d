'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full bg-black text-[#FF3333] font-mono flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
          {/* Glitch Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif')] bg-cover bg-center mix-blend-screen"></div>
          
          <AlertTriangle className="w-16 h-16 mb-6 animate-pulse" />
          
          <h1 className="text-4xl font-bold mb-2 glitch-text" data-text="CRITICAL FAILURE">CRITICAL FAILURE</h1>
          <p className="text-sm text-[#FF3333]/70 mb-8 max-w-md">
            THE SIMULATION HAS ENCOUNTERED AN UNRECOVERABLE ANOMALY.
            <br/>
            <span className="text-xs mt-2 block opacity-50">{this.state.error?.message}</span>
          </p>

          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 border border-[#FF3333] bg-[#FF3333]/10 hover:bg-[#FF3333]/20 transition-all flex items-center gap-2 uppercase tracking-widest text-xs"
          >
            <RefreshCcw className="w-4 h-4" />
            Reboot System
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

