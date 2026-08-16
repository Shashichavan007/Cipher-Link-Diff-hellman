from __future__ import annotations

import base64
import pytest
from app.crypto.crypto_utils import (
    P,
    G,
    generate_private_key,
    generate_public_key,
    compute_shared_secret,
    derive_key,
    encrypt_message,
    decrypt_message,
    inspect_encryption,
)


def test_dh_key_exchange_parity():
    # Party A (Client)
    priv_a = generate_private_key()
    pub_a = generate_public_key(priv_a)

    # Party B (Server)
    priv_b = generate_private_key()
    pub_b = generate_public_key(priv_b)

    # Compute shared secret
    secret_a = compute_shared_secret(pub_b, priv_a)
    secret_b = compute_shared_secret(pub_a, priv_b)

    assert secret_a == secret_b, "DH Shared secret agreement failed!"

    # Derive symmetric key
    key_a = derive_key(secret_a)
    key_b = derive_key(secret_b)

    assert key_a == key_b, "Derived key agreement failed!"
    assert len(key_a) == 32, "Derived key must be 256 bits (32 bytes)"


def test_public_key_bounds_validation():
    priv = generate_private_key()
    
    with pytest.raises(ValueError, match="Invalid peer public key"):
        compute_shared_secret(1, priv)

    with pytest.raises(ValueError, match="Invalid peer public key"):
        compute_shared_secret(P - 1, priv)

    with pytest.raises(ValueError, match="Invalid peer public key"):
        compute_shared_secret(P + 10, priv)


def test_aes_gcm_encrypt_decrypt_roundtrip():
    secret = 1234567890987654321
    key = derive_key(secret)
    
    plaintext = "Hello, CipherLink E2EE!"
    payload = encrypt_message(key, plaintext)

    assert "nonce" in payload
    assert "ciphertext" in payload
    
    # Decrypt
    decrypted = decrypt_message(key, payload)
    assert decrypted == plaintext


def test_aes_gcm_tampered_ciphertext_rejection():
    key = derive_key(999999999)
    plaintext = "Top Secret Message"
    payload = encrypt_message(key, plaintext)

    # Tamper with ciphertext
    raw_ct = bytearray(base64.b64decode(payload["ciphertext"]))
    raw_ct[0] ^= 0xFF  # Flip bits in ciphertext
    tampered_payload = {
        "nonce": payload["nonce"],
        "ciphertext": base64.b64encode(raw_ct).decode("utf-8")
    }

    with pytest.raises(ValueError, match="Decryption failed"):
        decrypt_message(key, tampered_payload)


def test_wrong_key_decryption_failure():
    key1 = derive_key(100)
    key2 = derive_key(200)

    payload = encrypt_message(key1, "Confidential payload")

    with pytest.raises(ValueError, match="Decryption failed"):
        decrypt_message(key2, payload)


def test_inspect_encryption_metadata():
    key = derive_key(55555)
    info = inspect_encryption(key, "Test Playground")

    assert info["plaintext"] == "Test Playground"
    assert info["cipher"] == "AES-256-GCM"
    assert info["key_length_bits"] == 256
    assert info["nonce_length_bits"] == 96
    assert "sha256:" in info["key_fingerprint"]
    # Ensure raw key is NOT present in metadata
    assert key.hex() not in str(info)
