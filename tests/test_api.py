from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "CipherLink"
    assert data["status"] == "online"


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "Diffie-Hellman" in data["crypto_status"]


def test_crypto_info_endpoint():
    response = client.get("/api/info")
    assert response.status_code == 200
    data = response.json()
    assert data["dh_prime_bits"] == 768
    assert data["symmetric_cipher"] == "AES-256-GCM"


def test_demo_encrypt_playground():
    payload = {"plaintext": "Hello, Playground Test!"}
    response = client.post("/api/demo/encrypt", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["plaintext"] == "Hello, Playground Test!"
    assert "nonce_base64" in data
    assert "ciphertext_base64" in data
    assert data["cipher"] == "AES-256-GCM"
