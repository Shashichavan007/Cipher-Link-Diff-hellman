import React from 'react';
import { ShieldCheck, Lock, Key, Cpu, Zap, CheckCircle2, Loader2, X, AlertTriangle, Play } from 'lucide-react';

export default function HandshakeModal({
  isOpen,
  onClose,
  currentStep,
  errorDetail,
  onRetry,
  onStartSimulated,
  isSimulated
}) {
  if (!isOpen) return null;

  const steps = [
    { id: 1, label: "Initializing Security Parameters...", icon: Zap },
    { id: 2, label: "Generating 1536-bit Diffie-Hellman Keypair (x, Y_A)...", icon: Key },
    { id: 3, label: "Exchanging Public Keys over WebSocket...", icon: ShieldCheck },
    { id: 4, label: "Computing Shared Secret S = (Y_B ^ x) mod P...", icon: Cpu },
    { id: 5, label: "Deriving 256-bit AES Key K via SHA-256 KDF...", icon: Lock },
    { id: 6, label: "SECURE CHANNEL ESTABLISHED", icon: CheckCircle2 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md glass-panel rounded-2xl p-6 border border-slate-700 shadow-2xl relative overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Cryptographic Handshake
                {isSimulated && (
                  <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Offline Demo
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 font-mono">Diffie-Hellman Key Agreement</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message display if any */}
        {errorDetail && (
          <div className="mb-5 p-4 rounded-xl bg-red-950/80 border border-red-800/80 text-red-200 text-xs font-mono space-y-3">
            <div className="flex items-start gap-2 text-red-300 font-semibold">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>Handshake Error</span>
            </div>
            <p className="text-[11px] leading-relaxed text-red-200/90">{errorDetail}</p>
            
            <div className="pt-2 flex flex-col gap-2 font-sans">
              <div className="flex items-center gap-2">
                {onStartSimulated && (
                  <button
                    onClick={onStartSimulated}
                    className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Try Offline Demo
                  </button>
                )}
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 transition-colors"
                  >
                    Retry Connection
                  </button>
                )}
              </div>
            </div>
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
              className="mt-4 w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-xs transition-all shadow-lg shadow-cyan-500/20"
            >
              Open Secure Chat
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

