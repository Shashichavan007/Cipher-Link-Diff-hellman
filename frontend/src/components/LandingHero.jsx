import React from 'react';
import { Shield, Key, Lock, Zap, ArrowRight, CheckCircle2, Cpu, FileCode2, Play } from 'lucide-react';

export default function LandingHero({ onStartSession, onExploreDocs, onOpenPlayground, sessionState }) {
  return (
    <div className="relative overflow-hidden pt-8 pb-16 md:py-20">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Disclaimer Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-medium backdrop-blur-md shadow-inner">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Educational Cybersecurity Prototype • Production-Style Implementation</span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            End-to-End <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
              Secure Text Transfer
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Secure communication powered by <strong className="text-cyan-300 font-semibold">Diffie-Hellman (RFC 3526)</strong> key exchange and <strong className="text-teal-300 font-semibold">AES-256-GCM</strong> authenticated encryption over real-time WebSockets.
          </p>

          {/* Technology Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono font-medium text-cyan-300">
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span>Diffie-Hellman 1536-bit</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono font-medium text-teal-300">
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              <span>AES-256-GCM</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono font-medium text-blue-300">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>SHA-256 Key Derivation</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono font-medium text-purple-300">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Real-Time WebSocket</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartSession}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5"
            >
              <Shield className="w-4 h-4" />
              <span>Start Secure Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenPlayground}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Play className="w-4 h-4 text-cyan-400" />
              <span>Encryption Sandbox</span>
            </button>

            <button
              onClick={onExploreDocs}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 text-slate-300 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <FileCode2 className="w-4 h-4 text-slate-400" />
              <span>How It Works</span>
            </button>
          </div>
        </div>

        {/* Animated Handshake Visual Preview Card */}
        <div className="mt-16 max-w-4xl mx-auto glass-panel rounded-2xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-2 font-mono text-xs text-slate-400">cipherlink-crypto-flow.svg</span>
            </div>
            <div className="text-xs font-mono text-cyan-400 bg-cyan-950/50 px-2.5 py-1 rounded border border-cyan-800/50">
              Handshake Protocol v1.0
            </div>
          </div>

          {/* Step-by-Step Interactive Flow Preview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center text-xs">
            
            {/* Step 1 */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold">1</div>
              <span className="font-semibold text-slate-200">Browser Client</span>
              <span className="text-[10px] text-slate-400 font-mono">Generates Keypair (x, Y_A)</span>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center text-cyan-500">
              <span className="font-mono text-xs animate-pulse">➔ DH Exchange ➔</span>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-mono font-bold">2</div>
              <span className="font-semibold text-slate-200">Shared Secret</span>
              <span className="text-[10px] text-slate-400 font-mono">S = (Y_B ^ x) mod P</span>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center text-teal-500">
              <span className="font-mono text-xs animate-pulse">➔ SHA-256 KDF ➔</span>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-mono font-bold">3</div>
              <span className="font-semibold text-slate-200">AES-256-GCM</span>
              <span className="text-[10px] text-slate-400 font-mono">Encrypted Tunnel</span>
            </div>

          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero clear-text transmission of private keys or shared secrets</span>
            </div>
            <div className="font-mono text-slate-400 text-[11px]">
              RFC 3526 Group 5 • SHA-256 KDF • AES-GCM Tag Verification
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
