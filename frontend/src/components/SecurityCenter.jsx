import React from 'react';
import { ShieldCheck, Key, Lock, Cpu, Server, Laptop, CheckCircle2, ShieldAlert, ArrowDown, Activity } from 'lucide-react';

export default function SecurityCenter({ sessionState }) {
  const isConnected = sessionState.handshakeCompleted;

  const pipelineSteps = [
    {
      title: "1. Client Key Generation",
      subtitle: "Diffie-Hellman Exponent",
      desc: "Browser generates private key x ∈ [2, P-2] and computes public key Y_A = G^x mod P",
      status: isConnected ? "Completed" : "Inactive",
      icon: Laptop,
      badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10"
    },
    {
      title: "2. Key Exchange Over WebSocket",
      subtitle: "Public Key Swap",
      desc: "Client and Server exchange public keys Y_A and Y_B over WebSocket layer without exposing private exponents",
      status: isConnected ? "Exchanged" : "Inactive",
      icon: Key,
      badgeColor: "text-blue-400 border-blue-500/30 bg-blue-500/10"
    },
    {
      title: "3. Shared Secret Calculation",
      subtitle: "S = (Y_B ^ x) mod P",
      desc: "Both parties compute matching 1536-bit shared secret integer S independently",
      status: isConnected ? "Established" : "Inactive",
      icon: Cpu,
      badgeColor: "text-teal-400 border-teal-500/30 bg-teal-500/10"
    },
    {
      title: "4. Key Derivation (KDF)",
      subtitle: "SHA-256(Salt + S_bytes)",
      desc: "Shared secret is derived into a 256-bit symmetric AES key with standard domain salt",
      status: isConnected ? "Ready" : "Inactive",
      icon: Activity,
      badgeColor: "text-purple-400 border-purple-500/30 bg-purple-500/10"
    },
    {
      title: "5. AES-256-GCM Encrypted Message",
      subtitle: "Authenticated Encryption",
      desc: "Fresh 96-bit random nonce generated for every message. Payload encrypted with 128-bit authentication tag",
      status: isConnected ? "Active" : "Inactive",
      icon: Lock,
      badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
    },
    {
      title: "6. Server Decryption & Auth Tag Verification",
      subtitle: "Integrity Guaranteed",
      desc: "Server decrypts payload and verifies GCM authentication tag to detect any tampering",
      status: isConnected ? "Verified" : "Inactive",
      icon: Server,
      badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            Security & Encryption Audit Panel
          </div>
          <h2 className="text-2xl font-bold text-white">Cryptographic Pipeline Architecture</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Live inspection of the Diffie-Hellman key agreement and AES-256-GCM authenticated encryption lifecycle. No private keys or raw secrets are ever exposed.
          </p>
        </div>

        <div className={`px-4 py-2 rounded-xl border text-xs font-mono font-semibold flex items-center gap-2 ${
          isConnected ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'
        }`}>
          <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
          {isConnected ? 'SECURE CHANNEL ACTIVE' : 'NO ACTIVE SESSION'}
        </div>
      </div>

      {/* Safe Metadata Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-slate-400">Key Exchange</span>
          <p className="text-sm font-bold text-cyan-300 font-mono">
            {isConnected ? 'Completed (1536-bit)' : 'Not Started'}
          </p>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-slate-400">Shared Secret</span>
          <p className="text-sm font-bold text-teal-300 font-mono">
            {isConnected ? 'Established' : 'None'}
          </p>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-slate-400">Symmetric Cipher</span>
          <p className="text-sm font-bold text-emerald-300 font-mono">AES-256-GCM</p>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-slate-400">Auth Tag Mode</span>
          <p className="text-sm font-bold text-purple-300 font-mono">128-bit Verification</p>
        </div>
      </div>

      {/* Visual Pipeline Step-by-Step Flow */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          End-to-End Encryption Sequence
        </h3>

        <div className="space-y-4 relative">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-sm text-slate-100">{step.title}</h4>
                    <span className="text-[10px] font-mono text-slate-400 font-medium">[{step.subtitle}]</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{step.desc}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md border text-xs font-mono font-semibold ${step.badgeColor}`}>
                    {step.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Properties Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Confidentiality
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            AES-256 encryption ensures message content cannot be read by network eavesdroppers or unauthorized proxies.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Integrity & Authenticity
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Galois/Counter Mode (GCM) appends a 128-bit authentication tag that detects any message modification or bit flips.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Replay Attack Protection
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Fresh 96-bit nonces generated cryptographically per message prevent replay attacks over persistent WebSocket sessions.
          </p>
        </div>

      </div>

    </div>
  );
}
