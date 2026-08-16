import React from 'react';
import { ShieldCheck, Lock, Cpu, PlayCircle, BookOpen, KeyRound, Radio } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, sessionState, onConnect, onDisconnect }) {
  const isConnected = sessionState.handshakeCompleted;
  const isConnecting = sessionState.connecting;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-[#0b0f17]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => setActiveTab('hero')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:border-cyan-400 transition-all duration-300">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                CipherLink
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                DH + AES-GCM
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              End-to-End Secure Messaging
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('hero')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'hero' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Overview
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'chat' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Secure Chat
          </button>

          <button
            onClick={() => setActiveTab('security-center')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'security-center' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Security Center
          </button>

          <button
            onClick={() => setActiveTab('playground')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'playground' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            Playground
          </button>

          <button
            onClick={() => setActiveTab('how-it-works')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'how-it-works' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            How It Works
          </button>
        </nav>

        {/* Right Status & Session Action */}
        <div className="flex items-center gap-3">
          {/* Security Status Pill */}
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono font-medium ${
            isConnected
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 glow-emerald'
              : isConnecting
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-400 animate-pulse'
              : 'bg-slate-900/60 border-slate-800 text-slate-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-400 animate-pulse' : isConnecting ? 'bg-amber-400 animate-ping' : 'bg-slate-600'
            }`} />
            {isConnected ? '🔒 SECURE CHANNEL ACTIVE' : isConnecting ? '⏳ ESTABLISHING HANDSHAKE' : '⚡ DISCONNECTED'}
          </div>

          {/* Action button */}
          {!isConnected ? (
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-xs shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50"
            >
              <KeyRound className="w-3.5 h-3.5" />
              {isConnecting ? 'Connecting...' : 'Start Session'}
            </button>
          ) : (
            <button
              onClick={onDisconnect}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 font-medium text-xs hover:bg-red-950/50 hover:border-red-800 hover:text-red-300 transition-all"
            >
              <Radio className="w-3.5 h-3.5" />
              Disconnect
            </button>
          )}
        </div>

      </div>

      {/* Mobile nav sub-bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-950 border-t border-slate-800/60 px-2 py-2 text-xs">
        <button 
          onClick={() => setActiveTab('hero')} 
          className={`flex flex-col items-center gap-1 ${activeTab === 'hero' ? 'text-cyan-400 font-semibold' : 'text-slate-400'}`}
        >
          <ShieldCheck className="w-4 h-4" /> Home
        </button>
        <button 
          onClick={() => setActiveTab('chat')} 
          className={`flex flex-col items-center gap-1 ${activeTab === 'chat' ? 'text-cyan-400 font-semibold' : 'text-slate-400'}`}
        >
          <Lock className="w-4 h-4" /> Chat
        </button>
        <button 
          onClick={() => setActiveTab('security-center')} 
          className={`flex flex-col items-center gap-1 ${activeTab === 'security-center' ? 'text-cyan-400 font-semibold' : 'text-slate-400'}`}
        >
          <Cpu className="w-4 h-4" /> Security
        </button>
        <button 
          onClick={() => setActiveTab('playground')} 
          className={`flex flex-col items-center gap-1 ${activeTab === 'playground' ? 'text-cyan-400 font-semibold' : 'text-slate-400'}`}
        >
          <PlayCircle className="w-4 h-4" /> Sandbox
        </button>
        <button 
          onClick={() => setActiveTab('how-it-works')} 
          className={`flex flex-col items-center gap-1 ${activeTab === 'how-it-works' ? 'text-cyan-400 font-semibold' : 'text-slate-400'}`}
        >
          <BookOpen className="w-4 h-4" /> Docs
        </button>
      </div>
    </header>
  );
}
