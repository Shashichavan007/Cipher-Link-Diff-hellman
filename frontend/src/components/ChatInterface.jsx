import React, { useState, useRef, useEffect } from 'react';
import { Send, Lock, ShieldCheck, Key, RefreshCw, Radio, UserCheck, Users, Copy, Check, Info } from 'lucide-react';

export default function ChatInterface({
  messages,
  onSendMessage,
  sessionState,
  onConnect,
  onDisconnect,
  mode,
  setMode,
  roomId,
  setRoomId,
  onJoinRoom
}) {
  const [inputText, setInputText] = useState('');
  const [copiedRoom, setCopiedRoom] = useState(false);
  const messagesEndRef = useRef(null);

  const isConnected = sessionState.handshakeCompleted;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || !isConnected) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedRoom(true);
    setTimeout(() => setCopiedRoom(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-5rem)] flex flex-col md:flex-row gap-6">
      
      {/* Sidebar / Left Session Security Panel */}
      <div className="w-full md:w-80 flex-shrink-0 flex flex-col gap-4">
        
        {/* Session Card */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Security Panel</h3>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
              isConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              {isConnected ? 'Active' : 'Offline'}
            </span>
          </div>

          {/* Mode Switcher: Server Bot vs P2P Room */}
          <div className="flex rounded-xl bg-slate-900/80 p-1 border border-slate-800">
            <button
              onClick={() => setMode('direct')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === 'direct' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Direct Bot
            </button>
            <button
              onClick={() => setMode('room')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === 'room' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              P2P Room
            </button>
          </div>

          {/* P2P Room Code UI if room mode */}
          {mode === 'room' && (
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2">
              <label className="text-[11px] font-mono text-slate-400">Session Room ID</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  placeholder="room-code"
                />
                <button
                  onClick={copyRoomCode}
                  className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
                  title="Copy room ID"
                >
                  {copiedRoom ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* Cryptographic Session Metadata List */}
          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between items-center text-slate-400">
              <span>Session ID:</span>
              <span className="text-slate-200 font-medium">{sessionState.sessionId || 'None'}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Key Exchange:</span>
              <span className={isConnected ? 'text-emerald-400' : 'text-slate-500'}>
                {isConnected ? 'Diffie-Hellman' : 'Pending'}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Cipher Algorithm:</span>
              <span className="text-cyan-300">AES-256-GCM</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Key Derivation:</span>
              <span className="text-blue-300">SHA-256</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Transport:</span>
              <span className="text-purple-300">WebSocket</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Nonce Mode:</span>
              <span className="text-teal-300">96-bit Random</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {!isConnected ? (
              <button
                onClick={onConnect}
                disabled={sessionState.connecting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Key className="w-3.5 h-3.5" />
                {sessionState.connecting ? 'Establishing Handshake...' : 'Start Secure Session'}
              </button>
            ) : (
              <button
                onClick={onDisconnect}
                className="w-full py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-red-400 hover:border-red-900/50 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Radio className="w-3.5 h-3.5" />
                Disconnect Session
              </button>
            )}
          </div>
        </div>

        {/* Security Notice Card */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800/60 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold">
            <Info className="w-4 h-4" />
            <span>Educational Guarantee</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Private keys and raw shared secrets exist only in client memory. Messages are encrypted client-side using AES-GCM before transport.
          </p>
        </div>

      </div>

      {/* Main Chat Thread & Composer Area */}
      <div className="flex-1 glass-panel rounded-2xl border border-slate-800 flex flex-col overflow-hidden">
        
        {/* Chat Thread Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <div>
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                {mode === 'direct' ? 'CipherLink Agent Chat' : `Room: ${roomId}`}
                {isConnected && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    🔒 E2EE Active
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                {isConnected ? 'Diffie-Hellman + AES-256-GCM Secure Channel' : 'Disconnected from secure relay'}
              </p>
            </div>
          </div>

          <button
            onClick={onConnect}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Reconnect"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-200 text-sm">Your secure channel is ready.</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Messages sent through this session are encrypted using AES-GCM prior to transmission.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isUser = msg.sender === 'user' || msg.sender === 'me';
              return (
                <div
                  key={index}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed space-y-1.5 shadow-lg ${
                      isUser
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none border border-cyan-400/30'
                        : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-1 text-[10px] font-mono text-slate-300">
                      <span className="font-semibold">{isUser ? 'You' : msg.sender || 'Peer'}</span>
                      <span>{msg.timestamp || new Date().toLocaleTimeString()}</span>
                    </div>

                    <p className="whitespace-pre-wrap font-sans text-xs">{msg.text}</p>

                    {/* Encryption Badge Indicator */}
                    <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-200/90 pt-1">
                      <Lock className="w-3 h-3 text-cyan-300" />
                      <span>🔒 AES-GCM encrypted</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Composer Area */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex flex-col gap-2">
          
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Lock className="w-3.5 h-3.5" />
              🔒 AES-256-GCM Encrypted
            </span>
            <span>{inputText.length} / 2000</span>
          </div>

          <div className="flex items-center gap-3">
            <textarea
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!isConnected}
              placeholder={isConnected ? "Type secure message..." : "Connect secure channel to send messages..."}
              className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 resize-none disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!isConnected || !inputText.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-40 transition-all"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-[10px] text-slate-400 text-right px-1">
            Press <kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono text-slate-300">Enter</kbd> to send • <kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono text-slate-300">Shift+Enter</kbd> for new line
          </div>

        </div>

      </div>

    </div>
  );
}
