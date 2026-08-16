import React from 'react';
import { BookOpen, Key, Lock, Cpu, Zap, Shield, ArrowRight, Layers, FileCode2, CheckCircle2 } from 'lucide-react';

export default function HowItWorks() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono font-medium">
          <BookOpen className="w-3.5 h-3.5" />
          Technical Documentation & Architecture
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">How CipherLink Protocol Works</h1>
        <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          An in-depth explanation of the cryptographic principles, mathematical foundations, and real-time protocol implementation powering CipherLink.
        </p>
      </div>

      {/* Sections Grid */}
      <div className="space-y-8">
        
        {/* Section 1: Diffie-Hellman Key Exchange */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">1. Diffie-Hellman Key Exchange</h2>
              <p className="text-xs text-slate-400 font-mono">RFC 3526 MODP Group Parameters</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            The Diffie-Hellman (DH) protocol allows two parties—Client (Alice) and Server (Bob)—to establish a shared secret over an insecure channel without transmitting the secret itself.
          </p>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs text-cyan-300 space-y-2">
            <div>1. Public Parameters: Prime P (1536-bit / 768-bit demo) and Generator G = 2</div>
            <div>2. Client chooses random private exponent x ∈ [2, P-2], computes public key Y_A = G^x mod P</div>
            <div>3. Server chooses random private exponent y ∈ [2, P-2], computes public key Y_B = G^y mod P</div>
            <div>4. Shared Secret S = (Y_B ^ x) mod P = (Y_A ^ y) mod P = G^(xy) mod P</div>
          </div>
        </div>

        {/* Section 2: Key Derivation Function (KDF) */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">2. SHA-256 Key Derivation</h2>
              <p className="text-xs text-slate-400 font-mono">Symmetric Key Extraction</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Raw Diffie-Hellman shared secrets are large arbitrary integers. To turn the shared secret integer into a fixed 256-bit key for AES encryption, we pass the byte representation of the secret along with a domain salt through SHA-256:
          </p>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs text-blue-300">
            Derived_Key = SHA256( Salt || BigEndianBytes(Shared_Secret) )
          </div>
        </div>

        {/* Section 3: AES-256-GCM Authenticated Encryption */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">3. AES-256-GCM Authenticated Encryption</h2>
              <p className="text-xs text-slate-400 font-mono">Confidentiality + Integrity + Authentication</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Unlike legacy CBC mode, Galois/Counter Mode (GCM) provides AEAD (Authenticated Encryption with Associated Data). It guarantees both confidentiality and data integrity:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="font-bold text-teal-300">Confidentiality</span>
              <p className="text-slate-400 text-[11px]">Plaintext is transformed into unreadable ciphertext using AES-256 counter mode.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="font-bold text-purple-300">Authentication Tag</span>
              <p className="text-slate-400 text-[11px]">A 128-bit MAC tag is computed over the ciphertext to ensure it has not been modified in transit.</p>
            </div>
          </div>
        </div>

        {/* Section 4: Nonce Management & Replay Prevention */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">4. Fresh Nonce Per Message</h2>
              <p className="text-xs text-slate-400 font-mono">96-bit Cryptographic Nonce</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Reusing a nonce with the same key in AES-GCM completely destroys security. CipherLink generates a fresh 96-bit (12-byte) cryptographically secure random nonce for every transmitted message.
          </p>
        </div>

        {/* Section 5: Real-Time WebSocket Transport */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">5. Full-Duplex WebSockets</h2>
              <p className="text-xs text-slate-400 font-mono">Low-Latency Duplex Communication</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Instead of HTTP short polling, CipherLink utilizes persistent WebSockets (`ws://` / `wss://`) for instant bidirectional payload delivery, handshake state persistence, and low latency messaging.
          </p>
        </div>

      </div>

    </div>
  );
}
