from __future__ import annotations

import json
import os
import subprocess
import sys
import pytest

from app.crypto.crypto_utils import (
    P,
    G,
    generate_public_key,
    compute_shared_secret,
    derive_key,
    encrypt_message,
    decrypt_message,
)

JS_RUNNER_PATH = os.path.join(os.path.dirname(__file__), "js_interop_runner.js")


def run_js(action: str, **kwargs) -> dict:
    payload = {"action": action, **kwargs}
    cmd = ["node", JS_RUNNER_PATH, json.dumps(payload)]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return json.loads(res.stdout.strip())


def test_python_js_dh_interoperability():
    # Fixed deterministic private keys for test vector reproducibility
    priv_py = 123456789123456789123456789123456789
    priv_js = 987654321987654321987654321987654321

    # 1. Generate Public Keys
    pub_py = generate_public_key(priv_py)
    js_pub_res = run_js("compute_public_key", private_key=str(priv_js))
    pub_js = int(js_pub_res["public_key"])

    # Verify JS public key for priv_py matches Python public key for priv_py
    js_pub_py_res = run_js("compute_public_key", private_key=str(priv_py))
    assert int(js_pub_py_res["public_key"]) == pub_py, "Python & JS public key generation mismatch!"

    # 2. Compute Shared Secrets and Derived Keys
    shared_py = compute_shared_secret(pub_js, priv_py)
    key_py = derive_key(shared_py)

    js_shared_res = run_js("compute_shared_key", peer_public_key=str(pub_py), my_private_key=str(priv_js))
    shared_js = int(js_shared_res["shared_secret"])
    key_js_hex = js_shared_res["derived_key_hex"]

    assert shared_py == shared_js, "Python & JS DH shared secrets do not match!"
    assert key_py.hex() == key_js_hex, "Python & JS SHA-256 derived keys do not match!"

    # 3. Interoperable Encryption Test A: Python Encrypt -> JS Decrypt
    msg_py_to_js = "Secret message from Python backend to JS browser client."
    payload_py = encrypt_message(key_py, msg_py_to_js)
    
    js_decrypt_res = run_js(
        "decrypt",
        peer_public_key=str(pub_py),
        my_private_key=str(priv_js),
        payload=payload_py
    )
    assert js_decrypt_res["plaintext"] == msg_py_to_js, "JS failed to decrypt Python payload!"

    # 4. Interoperable Encryption Test B: JS Encrypt -> Python Decrypt
    msg_js_to_py = "Secret message from JS browser client to Python backend."
    js_encrypt_res = run_js(
        "encrypt",
        peer_public_key=str(pub_py),
        my_private_key=str(priv_js),
        plaintext=msg_js_to_py
    )
    
    decrypted_by_py = decrypt_message(key_py, js_encrypt_res)
    assert decrypted_by_py == msg_js_to_py, "Python failed to decrypt JS payload!"
