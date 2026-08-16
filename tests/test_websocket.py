from __future__ import annotations

import json
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.crypto.crypto_utils import (
    generate_private_key,
    generate_public_key,
    compute_shared_secret,
    derive_key,
    encrypt_message,
    decrypt_message,
)

client = TestClient(app)


def test_websocket_dh_handshake_and_encrypted_chat():
    client_priv = generate_private_key()
    client_pub = generate_public_key(client_priv)

    with client.websocket_connect("/ws/chat") as websocket:
        # Step 1: Send client_hello
        websocket.send_text(json.dumps({
            "type": "client_hello",
            "public_key": str(client_pub)
        }))

        # Step 2: Receive server_hello
        res_text = websocket.receive_text()
        server_hello = json.loads(res_text)

        assert server_hello["type"] == "server_hello"
        assert "public_key" in server_hello
        assert server_hello["status"] == "SECURE_CHANNEL_ESTABLISHED"

        server_pub = int(server_hello["public_key"])

        # Step 3: Compute shared secret & derive AES key
        shared_secret = compute_shared_secret(server_pub, client_priv)
        aes_key = derive_key(shared_secret)

        # Step 4: Encrypt and send message
        plaintext = "Hello over encrypted WebSocket!"
        encrypted_payload = encrypt_message(aes_key, plaintext)

        websocket.send_text(json.dumps({
            "type": "message",
            "payload": encrypted_payload
        }))

        # Step 5: Receive encrypted response from server
        reply_raw = websocket.receive_text()
        reply_msg = json.loads(reply_raw)

        assert reply_msg["type"] == "message"
        assert "payload" in reply_msg

        # Step 6: Decrypt server response
        server_reply_text = decrypt_message(aes_key, reply_msg["payload"])
        assert "CipherLink Bot received" in server_reply_text or "Secure channel operational" in server_reply_text


def test_websocket_unsecured_message_rejection():
    with client.websocket_connect("/ws/chat") as websocket:
        # Try sending encrypted message before handshake
        websocket.send_text(json.dumps({
            "type": "message",
            "payload": {"nonce": "fake", "ciphertext": "fake"}
        }))

        reply_raw = websocket.receive_text()
        reply_msg = json.loads(reply_raw)
        assert reply_msg["type"] == "error"
        assert "Handshake not completed" in reply_msg["detail"]
