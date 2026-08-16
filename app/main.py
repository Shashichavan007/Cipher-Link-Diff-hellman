from __future__ import annotations

import json
import logging
import uuid
import time
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.api.router import router as api_router
from app.websocket.manager import DirectSession, room_manager

logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("CipherLink")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="End-to-End Secure Messaging Prototype powered by Diffie-Hellman Key Exchange & AES-256-GCM Encryption.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "subtitle": settings.PROJECT_SUBTITLE,
        "status": "online",
        "docs": "/docs",
    }


# WebSocket 1: Direct Client-Server DH Secure Chat
@app.websocket("/ws/chat")
async def websocket_direct_chat(websocket: WebSocket):
    await websocket.accept()
    session_id = f"sess_{uuid.uuid4().hex[:8]}"
    session = DirectSession(websocket, session_id)
    logger.info(f"WebSocket client connected. Session ID: {session_id}")

    try:
        while True:
            raw_text = await websocket.receive_text()
            try:
                msg_data = json.loads(raw_text)
            except Exception:
                await websocket.send_text(json.dumps({"type": "error", "detail": "Malformed JSON payload"}))
                continue

            msg_type = msg_data.get("type")

            # Step 1: Handshake
            if msg_type == "client_hello":
                client_pub = msg_data.get("public_key")
                if not client_pub:
                    await websocket.send_text(json.dumps({"type": "error", "detail": "Missing client public key"}))
                    continue
                try:
                    server_pub_str = await session.initialize_handshake(client_pub)
                    await websocket.send_text(json.dumps({
                        "type": "server_hello",
                        "public_key": server_pub_str,
                        "session_id": session_id,
                        "status": "SECURE_CHANNEL_ESTABLISHED"
                    }))
                except Exception as e:
                    await websocket.send_text(json.dumps({"type": "error", "detail": f"Handshake error: {str(e)}"}))
                    break

            # Step 2: Encrypted Message Processing
            elif msg_type == "message":
                if not session.handshake_completed:
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "detail": "Handshake not completed. Secure channel required."
                    }))
                    continue

                payload = msg_data.get("payload")
                if not payload:
                    await websocket.send_text(json.dumps({"type": "error", "detail": "Missing encrypted payload"}))
                    continue

                try:
                    plaintext = session.process_incoming(payload)
                    logger.info(f"Session {session_id}: Received encrypted message (length {len(plaintext)})")

                    # Generate automated secure response
                    reply_text = f"CipherLink Bot received: '{plaintext}'. [AES-256-GCM Encrypted Response]"
                    if plaintext.lower() in {"ping", "hello", "hi"}:
                        reply_text = "🔒 Secure channel operational. Diffie-Hellman key agreement verified."

                    response_payload = session.generate_encrypted_response(reply_text)
                    await websocket.send_text(json.dumps({
                        "type": "message",
                        "payload": response_payload,
                        "sender": "CipherLink Bot",
                        "timestamp": time.time()
                    }))

                except Exception as e:
                    logger.error(f"Session {session_id} Decryption error: {e}")
                    await websocket.send_text(json.dumps({"type": "error", "detail": "Decryption/authentication failed"}))

            else:
                await websocket.send_text(json.dumps({"type": "error", "detail": f"Unknown message type: {msg_type}"}))

    except WebSocketDisconnect:
        logger.info(f"Session {session_id}: Client disconnected.")
    except Exception as e:
        logger.error(f"Session {session_id}: Unexpected WebSocket exception: {e}")


# WebSocket 2: Zero-Knowledge P2P E2EE Room Relay
@app.websocket("/ws/room/{room_id}/{client_id}")
async def websocket_room_relay(websocket: WebSocket, room_id: str, client_id: str):
    await websocket.accept()
    await room_manager.join_room(room_id, client_id, websocket)

    # Notify peer in room that new participant joined
    await room_manager.broadcast_to_room(room_id, client_id, {
        "type": "peer_joined",
        "client_id": client_id
    })

    try:
        while True:
            data_str = await websocket.receive_text()
            try:
                msg = json.loads(data_str)
                msg["sender_id"] = client_id
                # Zero-knowledge relay: Server forwards handshakes & ciphertexts without decrypting
                await room_manager.broadcast_to_room(room_id, client_id, msg)
            except Exception as e:
                logger.error(f"Room {room_id} relay error: {e}")

    except WebSocketDisconnect:
        room_manager.leave_room(room_id, client_id)
        await room_manager.broadcast_to_room(room_id, client_id, {
            "type": "peer_left",
            "client_id": client_id
        })
