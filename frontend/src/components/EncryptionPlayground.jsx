import React, { useState, useEffect } from 'react';
import { PlayCircle, Lock, RefreshCw, Copy, Check, Shield, ArrowDown, Key, FileText, Code2, Eye, EyeOff } from 'lucide-react';
import { generatePrivateKey, generatePublicKey, computeSharedSecret, deriveKey, inspectEncryption } from '../lib/crypto';

export default function EncryptionPlayground() {
  const [plaintext, setPlaintext] = useState("Hello, this is a secure message.");
  const [outputFormat, setOutputFormat] = useState('hex'); // 'hex' or 'base64'
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const runSimulation = async () => {
    if (!plaintext) return;
    setLoading(true);
    try {
      // Ephemeral simulated key pair for educational playground
      const alicePriv = generatePrivateKey();
      const alicePub = generatePublicKey(alicePriv);
      
      const bobPriv = generatePrivateKey();
      const bobPub = generatePublicKey(bobPriv);
      
      const sharedSecret = computeSharedSecret(bobPub, alicePriv);
      const { aesKey, hashBuffer } = await deriveKey(sharedSecret);
      
      const res = await inspectEncryption(aesKey, hashBuffer, plaintext);
      setInspection(res);
    } catch (e) {
      console.error("Playground simulation error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [plaintext]);

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Playground Header */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <PlayCircle className="w-4 h-4" />
            Interactive Cryptographic Sandbox
          </div>
          <h2 className="text-2xl font-bold text-white">Encryption Playground</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Type any text to see real-time step-by-step transformation: Plaintext ➔ SHA-256 Key Derivation ➔ AES-256-GCM Nonce & Ciphertext ➔ Decryption.
          </p>
        </div>

        {/* Format Selector */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setOutputFormat('hex')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              outputFormat === 'hex' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold' : 'text-slate-400'
            }`}
          >
            Hexadecimal
          </button>
          <button
            onClick={() => setOutputFormat('base64')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              outputFormat === 'base64' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold' : 'text-slate-400'
            }`}
          >
            Base64
          </button>
        </div>
      </div>

      {/* Input & Live Transformation Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Input Sandbox Panel */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Plaintext Input
            </label>
            <span className="text-[11px] font-mono text-slate-400">{plaintext.length} characters</span>
          </div>

          <textarea
            rows={5}
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs font-sans text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 resize-none"
            placeholder="Type plaintext to encrypt..."
          />

          <div className="flex items-center justify-between pt-2 text-xs font-mono text-slate-400 border-t border-slate-800/60">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
              AES-256-GCM Sandbox
            </span>
            <button
              onClick={runSimulation}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
              Re-encrypt (New Nonce)
            </button>
          </div>
        </div>

        {/* Right Output Transformation Pipeline */}
        {inspection && (
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              Encrypted Payload Breakdown
            </h3>

            {/* Nonce Box */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-teal-300 font-semibold">1. Random Nonce (96 bits / 12 bytes)</span>
                <button
                  onClick={() => copyToClipboard(outputFormat === 'hex' ? inspection.nonce_hex : inspection.nonce_base64, 'nonce')}
                  className="text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  {copiedField === 'nonce' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="font-mono text-xs text-slate-300 break-all bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                {outputFormat === 'hex' ? inspection.nonce_hex : inspection.nonce_base64}
              </div>
            </div>

            {/* Ciphertext Box */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-cyan-300 font-semibold">2. AES-256 Ciphertext</span>
                <button
                  onClick={() => copyToClipboard(outputFormat === 'hex' ? inspection.ciphertext_hex : inspection.ciphertext_base64, 'ct')}
                  className="text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  {copiedField === 'ct' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="font-mono text-xs text-slate-300 break-all bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 max-h-28 overflow-y-auto">
                {outputFormat === 'hex' ? inspection.ciphertext_hex : inspection.ciphertext_base64}
              </div>
            </div>

            {/* Auth Tag Box */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-purple-300 font-semibold">3. GCM Authentication Tag (128 bits)</span>
                <button
                  onClick={() => copyToClipboard(inspection.auth_tag_hex, 'tag')}
                  className="text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  {copiedField === 'tag' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="font-mono text-xs text-slate-300 break-all bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                {inspection.auth_tag_hex}
              </div>
            </div>

            {/* Key Fingerprint (Safe metadata only!) */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
              <span>Derived Key Fingerprint:</span>
              <span className="text-slate-200 font-semibold">{inspection.key_fingerprint}</span>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
