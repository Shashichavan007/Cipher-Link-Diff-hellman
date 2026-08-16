from __future__ import annotations

import base64
import hashlib
import json
import secrets
import socket
import struct
from typing import Dict, Any, Optional

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# Demo prime for educational project use (1536-bit MODP Group from RFC 3526)
P = int(
    "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD1"
    "29024E088A67CC74020BBEA63B139B22514A08798E3404DD"
    "EF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245"
    "E485B576625E7EC6F44C42E9A63A3620FFFFFFFFFFFFFFFF",
    16,
)
G = 2
DEFAULT_SALT = b"secure-text-transfer-demo"


def generate_private_key() -> int:
    """Generate cryptographically secure DH private exponent: 2 <= x <= P - 2."""
    return secrets.randbelow(P - 3) + 2


def generate_public_key(private_key: int) -> int:
    """Compute public key Y = G^x mod P."""
    if not 2 <= private_key <= P - 2:
        raise ValueError("Private key out of bounds")
    return pow(G, private_key, P)


def compute_shared_secret(peer_public_key: int, private_key: int) -> int:
    """Compute shared secret S = peer_public_key^private_key mod P with validation."""
    if not 2 <= peer_public_key <= P - 2:
        raise ValueError("Invalid peer public key: out of valid DH range [2, P-2]")
    return pow(peer_public_key, private_key, P)


def derive_key(shared_secret: int, salt: bytes = DEFAULT_SALT) -> bytes:
    """
    Derive 256-bit symmetric key using SHA-256(salt + minimal_big_endian_bytes(shared_secret)).
    Preserves exact behavior of original crypto_utils.py.
    """
    byte_len = max(1, (shared_secret.bit_length() + 7) // 8)
    secret_bytes = shared_secret.to_bytes(byte_len, "big")
    return hashlib.sha256(salt + secret_bytes).digest()


def encrypt_message(key: bytes, plaintext: str) -> Dict[str, str]:
    """
    Encrypt plaintext using AES-256-GCM with a fresh 96-bit (12-byte) random nonce.
    Returns dictionary with base64 encoded nonce and ciphertext (which includes authentication tag).
    """
    if not isinstance(key, bytes) or len(key) != 32:
        raise ValueError("AES key must be 32 bytes (256 bits)")
    aesgcm = AESGCM(key)
    nonce = secrets.token_bytes(12)
    ciphertext = aesgcm.encrypt(nonce, plaintext.encode("utf-8"), None)
    return {
        "nonce": base64.b64encode(nonce).decode("utf-8"),
        "ciphertext": base64.b64encode(ciphertext).decode("utf-8"),
    }


def decrypt_message(key: bytes, payload: Dict[str, str]) -> str:
    """
    Decrypt AES-256-GCM ciphertext payload and verify authentication tag.
    Raises ValueError on invalid formatting or decryption/authentication failure.
    """
    if not isinstance(key, bytes) or len(key) != 32:
        raise ValueError("AES key must be 32 bytes (256 bits)")
    if "nonce" not in payload or "ciphertext" not in payload:
        raise ValueError("Invalid payload: missing nonce or ciphertext")
    
    try:
        aesgcm = AESGCM(key)
        nonce = base64.b64decode(payload["nonce"])
        ciphertext = base64.b64decode(payload["ciphertext"])
        if len(nonce) != 12:
            raise ValueError("Invalid nonce length: expected 12 bytes")
        plaintext_bytes = aesgcm.decrypt(nonce, ciphertext, None)
        return plaintext_bytes.decode("utf-8")
    except Exception as e:
        raise ValueError(f"Decryption failed: {str(e)}") from e


def inspect_encryption(key: bytes, plaintext: str) -> Dict[str, Any]:
    """
    Generate detailed educational metadata for Encryption Playground.
    Never exposes raw private keys or raw symmetric keys.
    """
    enc_payload = encrypt_message(key, plaintext)
    nonce_bytes = base64.b64decode(enc_payload["nonce"])
    raw_ct = base64.b64decode(enc_payload["ciphertext"])
    
    # AES-GCM appends 16-byte authentication tag to ciphertext
    ct_data = raw_ct[:-16] if len(raw_ct) >= 16 else raw_ct
    auth_tag = raw_ct[-16:] if len(raw_ct) >= 16 else b""
    
    key_fingerprint = hashlib.sha256(key).hexdigest()[:16]

    return {
        "plaintext": plaintext,
        "nonce_base64": enc_payload["nonce"],
        "nonce_hex": nonce_bytes.hex(),
        "ciphertext_base64": enc_payload["ciphertext"],
        "ciphertext_hex": ct_data.hex(),
        "auth_tag_hex": auth_tag.hex(),
        "key_fingerprint": f"sha256:{key_fingerprint}...",
        "cipher": "AES-256-GCM",
        "key_derivation": "SHA-256 (Salted)",
        "key_length_bits": 256,
        "nonce_length_bits": 96,
        "tag_length_bits": 128
    }


# Backwards compatibility socket helpers for CLI server/client
def send_json(sock: socket.socket, data: dict) -> None:
    raw = json.dumps(data).encode("utf-8")
    sock.sendall(struct.pack("!I", len(raw)) + raw)


def recv_json(sock: socket.socket) -> dict:
    header = _recv_exact(sock, 4)
    if not header:
        raise ConnectionError("Connection closed")
    (length,) = struct.unpack("!I", header)
    body = _recv_exact(sock, length)
    if not body:
        raise ConnectionError("Connection closed while reading payload")
    return json.loads(body.decode("utf-8"))


def _recv_exact(sock: socket.socket, n: int) -> bytes:
    parts = []
    remaining = n
    while remaining > 0:
        chunk = sock.recv(remaining)
        if not chunk:
            return b""
        parts.append(chunk)
        remaining -= len(chunk)
    return b"".join(parts)
