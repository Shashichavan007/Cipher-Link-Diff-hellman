import React, { useEffect, useState } from 'react';
import { Shield, Key, Lock, Activity, Send, MessageSquare, Clock, Zap, CheckCircle2 } from 'lucide-react';

export default function SecurityDashboard({ sessionState, messageCount }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let timer;
    if (sessionState.handshakeCompleted) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [sessionState.handshakeCompleted]);

  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400">Connection</span>
            <h4 className="text-lg font-bold text-emerald-400 mt-0.5">
              {sessionState.handshakeCompleted ? 'Encrypted' : 'Disconnected'}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400">Session Uptime</span>
            <h4 className="text-lg font-bold text-cyan-300 font-mono mt-0.5">
              {formatDuration(elapsedSeconds)}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400">Messages Sent</span>
            <h4 className="text-lg font-bold text-white font-mono mt-0.5">
              {Math.ceil(messageCount / 2)}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Send className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400">Messages Received</span>
            <h4 className="text-lg font-bold text-white font-mono mt-0.5">
              {Math.floor(messageCount / 2)}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Cryptographic Parameters Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          Live Session Security Metrics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400">Key Exchange Protocol:</span>
            <span className="text-cyan-300 font-semibold">Diffie-Hellman (RFC 3526)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400">Symmetric Encryption:</span>
            <span className="text-teal-300 font-semibold">AES-256-GCM</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400">Key Derivation (KDF):</span>
            <span className="text-blue-300 font-semibold">SHA-256 (Salted)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400">Authentication Tag:</span>
            <span className="text-purple-300 font-semibold">128-bit GCM Tag</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400">Transport Security:</span>
            <span className="text-emerald-300 font-semibold">Persistent WebSocket</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400">Nonce Generation:</span>
            <span className="text-amber-300 font-semibold">Cryptographically Secure Random (96-bit)</span>
          </div>

        </div>
      </div>

    </div>
  );
}
