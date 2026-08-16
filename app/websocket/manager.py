from __future__ import annotations

import logging
import json
import time
from typing import Dict, Set, Optional
from fastapi import WebSocket, WebSocketDisconnect

from app.crypto.crypto_utils import (
    generate_private_key,
    generate_public_key,
    compute_shared_secret,
    derive_key,
    encrypt_message,
    decrypt_message,
)

logger = logging.getLogger("CipherLink.WS")


class DirectSession:
    """Manages direct client-to-server DH secure session."""
    def __init__(self, websocket: WebSocket, session_id: str):
        self.websocket = websocket
        self.session_id = session_id
        self.server_private: Optional[int] = None
        self.server_public: Optional[int] = None
        self.peer_public: Optional[int] = None
        self.derived_key: Optional[bytes] = None
        self.handshake_completed: bool = False
        self.created_at: float = time.time()
        self.messages_sent: int = 0
        self.messages_received: int = 0

    async def initialize_handshake(self, client_public_str: str) -> str:
        """Perform Diffie-Hellman handshake with client."""
        try:
            self.peer_public = int(client_public_str)
            self.server_private = generate_private_key()
            self.server_public = generate_public_key(self.server_private)
            
            shared_secret = compute_shared_secret(self.peer_public, self.server_private)
            self.derived_key = derive_key(shared_secret)
            self.handshake_completed = True
            logger.info(f"Session {self.session_id}: DH Handshake completed successfully.")
            return str(self.server_public)
        except Exception as e:
            logger.error(f"Session {self.session_id}: Handshake failed: {e}")
            raise ValueError("Invalid client public key or handshake failed") from e

    def process_incoming(self, payload: dict) -> str:
        """Decrypt incoming encrypted message payload from client."""
        if not self.handshake_completed or not self.derived_key:
            raise ValueError("Session is not secured with established key")
        plaintext = decrypt_message(self.derived_key, payload)
        self.messages_received += 1
        return plaintext

    def generate_encrypted_response(self, text: str) -> dict:
        """Encrypt server response using established session key."""
        if not self.handshake_completed or not self.derived_key:
            raise ValueError("Session is not secured with established key")
        payload = encrypt_message(self.derived_key, text)
        self.messages_sent += 1
        return payload


class RoomSessionManager:
    """Manages peer-to-peer relay rooms for zero-knowledge E2EE messaging between clients."""
    def __init__(self):
        # room_id -> Dict[client_id, WebSocket]
        self.rooms: Dict[str, Dict[str, WebSocket]] = {}

    async def join_room(self, room_id: str, client_id: str, websocket: WebSocket):
        if room_id not in self.rooms:
            self.rooms[room_id] = {}
        self.rooms[room_id][client_id] = websocket
        logger.info(f"Client {client_id} joined room {room_id}. Total occupants: {len(self.rooms[room_id])}")

    async def broadcast_to_room(self, room_id: str, sender_id: str, message: dict):
        if room_id not in self.rooms:
            return
        for cid, ws in list(self.rooms[room_id].items()):
            if cid != sender_id:
                try:
                    await ws.send_text(json.dumps(message))
                except Exception as e:
                    logger.warning(f"Failed to send to client {cid} in room {room_id}: {e}")

    def leave_room(self, room_id: str, client_id: str):
        if room_id in self.rooms and client_id in self.rooms[room_id]:
            del self.rooms[room_id][client_id]
            logger.info(f"Client {client_id} left room {room_id}")
            if not self.rooms[room_id]:
                del self.rooms[room_id]


room_manager = RoomSessionManager()
