import React, { useEffect, useState } from 'react';
import { ShieldCheck, Lock, Key, Cpu, Zap, CheckCircle2, Loader2 } from 'lucide-react';

export default function HandshakeModal({ isOpen, onClose, currentStep, errorDetail }) {
  if (!isOpen) return null;

  const steps = [
    { id: 1, label: "Connecting to WebSocket Server...", icon: Zap },
    { id: 2, label: "Generating 1536-bit Diffie-Hellman Keypair...", icon: Key },
    { id: 3, label: "Exchanging Public Key Parameters...", icon: ShieldCheck },
    { id: 4, label: "Computing Shared Secret S = (Y_B ^ x) mod P...", icon: Cpu },
    { id: 5, label: "Deriving 256-bit Symmetric AES Key via SHA-256...", icon: Lock },
    { id: 6, label: "SECURE CHANNEL ESTABLISHED", icon: CheckCircle2 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md glass-panel rounded-2xl p-6 border border-slate-700 shadow-2xl relative overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Cryptographic Handshake</h3>
            <p className="text-xs text-slate-400 font-mono">Diffie-Hellman Key Agreement</p>
          </div>
        </div>

        {/* Error message display if any */}
        {errorDetail && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs font-mono">
            ⚠️ Handshake Error: {errorDetail}
          </div>
        )}

        {/* Handshake Step Checklist */}
        <div className="space-y-3">
          {steps.map((s) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.id;
            const isCurrent = currentStep === s.id;
            const isPending = currentStep < s.id;

            return (
              <div
                key={s.id}
                className={`flex items-center gap-3 p-3 rounded-xl border text-xs transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                    : isCurrent
                    ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/40 border-slate-800/60 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                <div className="font-mono flex-1 text-[11px] leading-tight font-medium">
                  {s.label}
                </div>

                {isCompleted && (
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Done
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Handshake Completion Banner */}
        {currentStep === 6 && (
          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-center glow-emerald">
              <div className="text-xs font-mono font-bold text-emerald-400 tracking-wider">
                🔒 SECURE CHANNEL ESTABLISHED
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                AES-256-GCM encrypted tunnel active.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-4 w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-xs transition-all"
            >
              Open Secure Chat
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
