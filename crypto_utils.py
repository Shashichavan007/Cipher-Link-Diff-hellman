"""
Root compatibility module for legacy imports.
Re-exports functionality from app.crypto.crypto_utils.
"""
from app.crypto.crypto_utils import (
    P,
    G,
    generate_private_key,
    generate_public_key,
    compute_shared_secret,
    derive_key,
    encrypt_message,
    decrypt_message,
    send_json,
    recv_json,
    inspect_encryption,
)

__all__ = [
    "P",
    "G",
    "generate_private_key",
    "generate_public_key",
    "compute_shared_secret",
    "derive_key",
    "encrypt_message",
    "decrypt_message",
    "send_json",
    "recv_json",
    "inspect_encryption",
]
