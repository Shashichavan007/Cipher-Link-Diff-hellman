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
    isSimulated: false,
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

  // Simulated Local Handshake (Offline Demo Mode)
  const runSimulatedHandshake = async (pubKey) => {
    try {
      // Step 3: Exchange Public Key
      await new Promise(r => setTimeout(r, 450));
      setSessionState((prev) => ({ ...prev, handshakeStep: 3 }));

      // Generate simulated bot DH keypair
      const botPriv = generatePrivateKey();
      const botPub = generatePublicKey(botPriv);
      cryptoRef.current.peerPublicKey = botPub;

      // Step 4: Compute Shared Secret S
      await new Promise(r => setTimeout(r, 450));
      setSessionState((prev) => ({ ...prev, handshakeStep: 4 }));
      const sharedSecret = computeSharedSecret(botPub, cryptoRef.current.clientPrivateKey);

      // Step 5: Derive Key K via SHA-256
      await new Promise(r => setTimeout(r, 450));
      setSessionState((prev) => ({ ...prev, handshakeStep: 5 }));
      const { aesKey } = await deriveKey(sharedSecret);
      cryptoRef.current.aesKey = aesKey;

      await new Promise(r => setTimeout(r, 350));
      // Step 6: Handshake Completed
      setSessionState({
        connecting: false,
        handshakeCompleted: true,
        sessionId: `sim_${Math.random().toString(36).substring(2, 8)}`,
        handshakeStep: 6,
        errorDetail: null,
        isSimulated: true,
      });

      setMessages([
        {
          text: "🔒 Offline Simulated Secure Channel Established. Diffie-Hellman 1536-bit Key Exchange complete.",
          sender: "System",
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
    } catch (err) {
      setSessionState({
        connecting: false,
        handshakeCompleted: false,
        sessionId: '',
        handshakeStep: 0,
        errorDetail: `Simulated handshake error: ${err.message}`,
        isSimulated: false,
      });
    }
  };

  // Initialize WebSocket & Handshake
  const startSecureSession = async (forceSimulated = false) => {
    if (sessionState.connecting && !errorDetail) return;

    // Reset previous connection if any
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setSessionState({
      connecting: true,
      handshakeCompleted: false,
      sessionId: '',
      handshakeStep: 1,
      errorDetail: null,
      isSimulated: forceSimulated,
    });
    setIsModalOpen(true);

    try {
      // Step 2: Key Pair Generation
      setSessionState((prev) => ({ ...prev, handshakeStep: 2 }));
      const priv = generatePrivateKey();
      const pub = generatePublicKey(priv);

      cryptoRef.current.clientPrivateKey = priv;
      cryptoRef.current.clientPublicKey = pub;

      if (forceSimulated) {
        await runSimulatedHandshake(pub);
        return;
      }

      // Step 3: Connect to WebSocket Server with fallback timeout
      setSessionState((prev) => ({ ...prev, handshakeStep: 3 }));

      // Protocol WebSocket URL resolution
      const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = isLocalHost ? '127.0.0.1:8000' : window.location.host;

      // On GitHub Pages static hosting (no live backend), default to simulated handshake after brief attempt
      const isStaticHosting = window.location.hostname.includes('github.io') || window.location.hostname.includes('vercel.app');

      const wsUrl = mode === 'direct' 
        ? `${protocol}//${host}/ws/chat`
        : `${protocol}//${host}/ws/room/${roomId}/client_${Math.random().toString(36).substring(2, 6)}`;

      let handshakeSucceeded = false;
      let socket = null;
      let connectionTimeout = null;

      // Fast-track fallback for static hosting where WS server does not exist
      if (isStaticHosting) {
        await runSimulatedHandshake(pub);
        return;
      }

      try {
        socket = new WebSocket(wsUrl);
        wsRef.current = socket;
      } catch (err) {
        console.warn("WebSocket instantiation error, using simulated mode:", err);
        await runSimulatedHandshake(pub);
        return;
      }

      // 2.5-second timeout to fall back to simulated mode if WebSocket server doesn't respond
      connectionTimeout = setTimeout(async () => {
        if (!handshakeSucceeded) {
          console.warn("WebSocket connection timeout (2.5s). Falling back to client-side simulated DH session.");
          if (wsRef.current) {
            try { wsRef.current.close(); } catch (e) {}
            wsRef.current = null;
          }
          await runSimulatedHandshake(pub);
        }
      }, 2500);

      socket.onopen = () => {
        socket.send(JSON.stringify({
          type: 'client_hello',
          public_key: pub.toString()
        }));
      };

      socket.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle Direct Bot (server_hello) or P2P Room (client_hello from peer)
          if (data.type === 'server_hello' || (data.type === 'client_hello' && data.sender_id)) {
            if (connectionTimeout) clearTimeout(connectionTimeout);
            const peerPubStr = data.public_key;
            if (!peerPubStr) return;

            const peerPub = BigInt(peerPubStr);
            cryptoRef.current.peerPublicKey = peerPub;

            // Step 4: Compute Shared Secret S
            setSessionState((prev) => ({ ...prev, handshakeStep: 4 }));
            const sharedSecret = computeSharedSecret(peerPub, cryptoRef.current.clientPrivateKey);

            // Step 5: Derive Key K via SHA-256
            setSessionState((prev) => ({ ...prev, handshakeStep: 5 }));
            const { aesKey } = await deriveKey(sharedSecret);
            cryptoRef.current.aesKey = aesKey;
            handshakeSucceeded = true;

            // In room mode, respond to peer with hello_ack
            if (data.type === 'client_hello' && data.sender_id) {
              socket.send(JSON.stringify({
                type: 'peer_hello_ack',
                public_key: pub.toString()
              }));
            }

            // Step 6: Handshake Completed
            setSessionState({
              connecting: false,
              handshakeCompleted: true,
              sessionId: data.session_id || `sess_${Math.random().toString(36).substring(2, 8)}`,
              handshakeStep: 6,
              errorDetail: null,
              isSimulated: false,
            });

          } else if (data.type === 'peer_hello_ack') {
            if (connectionTimeout) clearTimeout(connectionTimeout);
            const peerPubStr = data.public_key;
            if (!peerPubStr) return;

            const peerPub = BigInt(peerPubStr);
            cryptoRef.current.peerPublicKey = peerPub;

            setSessionState((prev) => ({ ...prev, handshakeStep: 4 }));
            const sharedSecret = computeSharedSecret(peerPub, cryptoRef.current.clientPrivateKey);

            setSessionState((prev) => ({ ...prev, handshakeStep: 5 }));
            const { aesKey } = await deriveKey(sharedSecret);
            cryptoRef.current.aesKey = aesKey;
            handshakeSucceeded = true;

            setSessionState({
              connecting: false,
              handshakeCompleted: true,
              sessionId: `room_sess_${Math.random().toString(36).substring(2, 8)}`,
              handshakeStep: 6,
              errorDetail: null,
              isSimulated: false,
            });

          } else if (data.type === 'peer_joined') {
            // When another peer joins the room, send client_hello
            socket.send(JSON.stringify({
              type: 'client_hello',
              public_key: pub.toString()
            }));

          } else if (data.type === 'message') {
            // Decrypt incoming payload
            if (cryptoRef.current.aesKey && data.payload) {
              const plaintext = await decryptMessage(cryptoRef.current.aesKey, data.payload);
              setMessages((prev) => [
                ...prev,
                {
                  text: plaintext,
                  sender: data.sender || data.sender_id || 'Peer',
                  timestamp: new Date().toLocaleTimeString(),
                }
              ]);
            }
          } else if (data.type === 'error') {
            if (connectionTimeout) clearTimeout(connectionTimeout);
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

      socket.onerror = async (err) => {
        if (connectionTimeout) clearTimeout(connectionTimeout);
        if (!handshakeSucceeded) {
          console.warn("WebSocket error encountered, switching to simulated mode...");
          await runSimulatedHandshake(pub);
        }
      };

      socket.onclose = () => {
        if (connectionTimeout) clearTimeout(connectionTimeout);
        if (handshakeSucceeded) {
          setSessionState({
            connecting: false,
            handshakeCompleted: false,
            sessionId: '',
            handshakeStep: 0,
            errorDetail: null,
            isSimulated: false,
          });
        }
      };

    } catch (err) {
      setSessionState({
        connecting: false,
        handshakeCompleted: false,
        sessionId: '',
        handshakeStep: 0,
        errorDetail: err.message || 'Handshake failed',
        isSimulated: false,
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
      isSimulated: false,
    });
    setMessages([]);
  };

  const sendMessage = async (text) => {
    if (!sessionState.handshakeCompleted || !cryptoRef.current.aesKey) return;

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

      if (sessionState.isSimulated) {
        // Simulated local bot echo response
        setTimeout(async () => {
          const replyText = text.toLowerCase() === 'ping'
            ? '🔒 Secure channel operational. Diffie-Hellman key agreement verified (Simulated Agent).'
            : `CipherLink Bot received: '${text}'. [AES-256-GCM Encrypted Response]`;

          setMessages((prev) => [
            ...prev,
            {
              text: replyText,
              sender: 'CipherLink Bot (Simulated)',
              timestamp: new Date().toLocaleTimeString(),
            }
          ]);
        }, 400);
      } else if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'message',
          payload
        }));
      }
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
        onConnect={() => startSecureSession(false)}
        onDisconnect={disconnectSession}
      />

      {/* Handshake Progress Modal */}
      <HandshakeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          if (sessionState.handshakeCompleted) {
            setActiveTab('chat');
          }
        }}
        currentStep={sessionState.handshakeStep}
        errorDetail={sessionState.errorDetail}
        onRetry={() => startSecureSession(false)}
        onStartSimulated={() => startSecureSession(true)}
        isSimulated={sessionState.isSimulated}
      />

      {/* Dynamic Views */}
      <main className="flex-1">
        {activeTab === 'hero' && (
          <div className="space-y-12">
            <LandingHero
              onStartSession={() => {
                if (sessionState.handshakeCompleted) {
                  setActiveTab('chat');
                } else {
                  startSecureSession(false);
                }
              }}
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
