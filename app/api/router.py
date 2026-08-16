from __future__ import annotations

import secrets
from fastapi import APIRouter, HTTPException, status

from app.crypto.crypto_utils import (
    P,
    G,
    generate_private_key,
    generate_public_key,
    compute_shared_secret,
    derive_key,
    inspect_encryption,
)
from app.models.schemas import (
    HealthResponse,
    CryptoInfoResponse,
    EncryptPlaygroundRequest,
    EncryptPlaygroundResponse,
)

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        service="CipherLink Secure Messaging Backend",
        version="1.0.0",
        crypto_status="Active (Diffie-Hellman 1536-bit MODP + AES-256-GCM)",
    )


@router.get("/info", response_model=CryptoInfoResponse)
async def crypto_info():
    return CryptoInfoResponse(
        dh_prime_bits=P.bit_length(),
        dh_generator=G,
        symmetric_cipher="AES-256-GCM",
        key_derivation="SHA-256 (Salted)",
        nonce_size_bytes=12,
        auth_tag_size_bytes=16,
    )


@router.post("/demo/encrypt", response_model=EncryptPlaygroundResponse)
async def demo_encrypt(req: EncryptPlaygroundRequest):
    try:
        # Generate ephemeral demo keypair for playground simulation
        priv = generate_private_key()
        pub = generate_public_key(priv)
        
        # Self-derived key for playground demonstration
        shared = compute_shared_secret(pub, priv)
        key = derive_key(shared)
        
        metadata = inspect_encryption(key, req.plaintext)
        return EncryptPlaygroundResponse(**metadata)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Playground encryption error: {str(e)}",
        )
