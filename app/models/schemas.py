from __future__ import annotations

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "CipherLink API"
    version: str = "1.0.0"
    crypto_status: str = "Diffie-Hellman + AES-256-GCM Active"


class CryptoInfoResponse(BaseModel):
    dh_prime_bits: int = 1536
    dh_generator: int = 2
    symmetric_cipher: str = "AES-256-GCM"
    key_derivation: str = "SHA-256 (Salted)"
    nonce_size_bytes: int = 12
    auth_tag_size_bytes: int = 16


class EncryptPlaygroundRequest(BaseModel):
    plaintext: str = Field(..., max_length=10000, description="Text to encrypt for demonstration")


class EncryptPlaygroundResponse(BaseModel):
    plaintext: str
    nonce_base64: str
    nonce_hex: str
    ciphertext_base64: str
    ciphertext_hex: str
    auth_tag_hex: str
    key_fingerprint: str
    cipher: str
    key_derivation: str
    key_length_bits: int
    nonce_length_bits: int
    tag_length_bits: int


# WebSocket protocol models
class WSClientHello(BaseModel):
    type: str = "client_hello"
    public_key: str  # Decimal string representation of DH public key


class WSServerHello(BaseModel):
    type: str = "server_hello"
    public_key: str  # Decimal string representation of server DH public key


class WSEncryptedMessagePayload(BaseModel):
    nonce: str       # Base64 string
    ciphertext: str  # Base64 string


class WSMessage(BaseModel):
    type: str = "message"
    payload: WSEncryptedMessagePayload
    sender: Optional[str] = "peer"
    timestamp: Optional[float] = None


class WSRoomJoin(BaseModel):
    type: str = "room_join"
    room_id: str
    public_key: str


class WSError(BaseModel):
    type: str = "error"
    detail: str
