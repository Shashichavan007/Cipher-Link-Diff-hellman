import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import LandingHero from './components/LandingHero';
import ChatInterface from './components/ChatInterface';
import HandshakeModal from './components/HandshakeModal';
import SecurityCenter from './components/SecurityCenter';
import EncryptionPlayground from './components/EncryptionPlayground';
import SecurityDashboard from './components/SecurityDashboard';
import HowItWorks from './components/HowItWorks';

import {
  generatePrivateKey,
  generatePublicKey,
  computeSharedSecret,
  deriveKey,
  encryptMessage,
  decryptMessage,
} from './lib/crypto';

export default function App() {
  const [activeTab, setActiveTab] = useState('hero');
  const [mode, setMode] = useState('direct'); // 'direct' or 'room'
  const [roomId, setRoomId] = useState(() => 'room_' + Math.random().toString(36).substring(2, 8));

  // Cryptographic Session State
  const [sessionState, setSessionState] = useState({
    connecting: false,
    handshakeCompleted: false,
    sessionId: '',
    handshakeStep: 0,
    errorDetail: null,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState([]);

  // Ephemeral crypto references in memory (never rendered or logged)
  const cryptoRef = useRef({
    clientPrivateKey: null,
    clientPublicKey: null,
    peerPublicKey: null,
    aesKey: null,
  });

  const wsRef = useRef(null);

  // Initialize WebSocket & Handshake
  const startSecureSession = async () => {
    if (sessionState.connecting || sessionState.handshakeCompleted) return;

    setSessionState({
      connecting: true,
      handshakeCompleted: false,
      sessionId: '',
      handshakeStep: 1,
      errorDetail: null,
    });
    setIsModalOpen(true);

    try {
      // Step 2: Key Pair Generation
      setSessionState((prev) => ({ ...prev, handshakeStep: 2 }));
      const priv = generatePrivateKey();
      const pub = generatePublicKey(priv);

      cryptoRef.current.clientPrivateKey = priv;
      cryptoRef.current.clientPublicKey = pub;

      // Protocol WebSocket URL resolution
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? '127.0.0.1:8000' 
        : window.location.host;

      const wsUrl = mode === 'direct' 
        ? `${protocol}//${host}/ws/chat`
        : `${protocol}//${host}/ws/room/${roomId}/client_${Math.random().toString(36).substring(2, 6)}`;

      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        // Step 3: Public Key Exchange
        setSessionState((prev) => ({ ...prev, handshakeStep: 3 }));
        socket.send(JSON.stringify({
          type: 'client_hello',
          public_key: pub.toString()
        }));
      };

      socket.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'server_hello') {
            const peerPubStr = data.public_key;
            const peerPub = BigInt(peerPubStr);
            cryptoRef.current.peerPublicKey = peerPub;

            // Step 4: Compute Shared Secret S
            setSessionState((prev) => ({ ...prev, handshakeStep: 4 }));
            const sharedSecret = computeSharedSecret(peerPub, cryptoRef.current.clientPrivateKey);

            // Step 5: Derive Key K via SHA-256
            setSessionState((prev) => ({ ...prev, handshakeStep: 5 }));
            const { aesKey } = await deriveKey(sharedSecret);
            cryptoRef.current.aesKey = aesKey;

            // Step 6: Handshake Completed
            setSessionState({
              connecting: false,
              handshakeCompleted: true,
              sessionId: data.session_id || 'sess_active',
              handshakeStep: 6,
              errorDetail: null,
            });

          } else if (data.type === 'message') {
            // Decrypt incoming payload
            if (cryptoRef.current.aesKey && data.payload) {
              const plaintext = await decryptMessage(cryptoRef.current.aesKey, data.payload);
              setMessages((prev) => [
                ...prev,
                {
                  text: plaintext,
                  sender: data.sender || 'Peer',
                  timestamp: new Date().toLocaleTimeString(),
                }
              ]);
            }
          } else if (data.type === 'error') {
            setSessionState((prev) => ({
              ...prev,
              connecting: false,
              errorDetail: data.detail
            }));
          }
        } catch (err) {
          console.error("WebSocket message handling error:", err);
        }
      };

      socket.onerror = (err) => {
        setSessionState((prev) => ({
          ...prev,
          connecting: false,
          errorDetail: 'WebSocket connection error'
        }));
      };

      socket.onclose = () => {
        setSessionState({
          connecting: false,
          handshakeCompleted: false,
          sessionId: '',
          handshakeStep: 0,
          errorDetail: null,
        });
      };

    } catch (err) {
      setSessionState({
        connecting: false,
        handshakeCompleted: false,
        sessionId: '',
        handshakeStep: 0,
        errorDetail: err.message || 'Handshake failed',
      });
    }
  };

  const disconnectSession = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    cryptoRef.current = {
      clientPrivateKey: null,
      clientPublicKey: null,
      peerPublicKey: null,
      aesKey: null,
    };
    setSessionState({
      connecting: false,
      handshakeCompleted: false,
      sessionId: '',
      handshakeStep: 0,
      errorDetail: null,
    });
    setMessages([]);
  };

  const sendMessage = async (text) => {
    if (!wsRef.current || !sessionState.handshakeCompleted || !cryptoRef.current.aesKey) return;

    try {
      const payload = await encryptMessage(cryptoRef.current.aesKey, text);

      // Append user message locally
      setMessages((prev) => [
        ...prev,
        {
          text,
          sender: 'user',
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);

      wsRef.current.send(JSON.stringify({
        type: 'message',
        payload
      }));
    } catch (err) {
      console.error("Encryption send error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sessionState={sessionState}
        onConnect={startSecureSession}
        onDisconnect={disconnectSession}
      />

      {/* Handshake Progress Modal */}
      <HandshakeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setActiveTab('chat');
        }}
        currentStep={sessionState.handshakeStep}
        errorDetail={sessionState.errorDetail}
      />

      {/* Dynamic Views */}
      <main className="flex-1">
        {activeTab === 'hero' && (
          <div className="space-y-12">
            <LandingHero
              onStartSession={startSecureSession}
              onExploreDocs={() => setActiveTab('how-it-works')}
              onOpenPlayground={() => setActiveTab('playground')}
              sessionState={sessionState}
            />

            {/* Embedded Security Overview Dashboard */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
              <SecurityDashboard
                sessionState={sessionState}
                messageCount={messages.length}
              />
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <ChatInterface
            messages={messages}
            onSendMessage={sendMessage}
            sessionState={sessionState}
            onConnect={startSecureSession}
            onDisconnect={disconnectSession}
            mode={mode}
            setMode={setMode}
            roomId={roomId}
            setRoomId={setRoomId}
          />
        )}

        {activeTab === 'security-center' && (
          <SecurityCenter sessionState={sessionState} />
        )}

        {activeTab === 'playground' && (
          <EncryptionPlayground />
        )}

        {activeTab === 'how-it-works' && (
          <HowItWorks />
        )}
      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-800/80 py-6 mt-auto text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">CipherLink</span>
            <span>• End-to-End Secure Messaging Prototype</span>
          </div>

          <div className="font-mono text-[11px] text-slate-400">
            Diffie-Hellman Key Agreement • SHA-256 KDF • AES-256-GCM
          </div>
        </div>
      </footer>

    </div>
  );
}
