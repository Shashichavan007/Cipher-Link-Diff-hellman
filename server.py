from __future__ import annotations

import socket
from typing import Tuple

from crypto_utils import (
    compute_shared_secret,
    decrypt_message,
    derive_key,
    encrypt_message,
    generate_private_key,
    generate_public_key,
    recv_json,
    send_json,
)

HOST = "127.0.0.1"
PORT = 65432

def handle_client(conn: socket.socket, addr: Tuple[str, int]) -> None:
    print(f"[+] Connected by {addr}")

    server_private = generate_private_key()
    server_public = generate_public_key(server_private)

    hello = recv_json(conn)
    if hello.get("type") != "client_hello":
        raise ValueError("Expected client_hello")

    client_public = int(hello["public_key"])
    send_json(conn, {"type": "server_hello", "public_key": str(server_public)})

    shared_secret = compute_shared_secret(client_public, server_private)
    key = derive_key(shared_secret)
    print("[*] Secure channel established.")

    while True:
        try:
            msg = recv_json(conn)
        except ConnectionError:
            print("[*] Client disconnected.")
            break

        if msg.get("type") != "message":
            continue

        plaintext = decrypt_message(key, msg["payload"])
        print(f"Client: {plaintext}")

        if plaintext.lower() in {"bye", "exit", "quit"}:
            send_json(conn, {"type": "message", "payload": encrypt_message(key, "Goodbye! Connection closed.")})
            break

        reply = input("Server> ")
        send_json(conn, {"type": "message", "payload": encrypt_message(key, reply)})
        if reply.lower() in {"bye", "exit", "quit"}:
            break

    conn.close()

def main() -> None:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server:
        server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server.bind((HOST, PORT))
        server.listen(1)
        print(f"[*] Server listening on {HOST}:{PORT}")
        conn, addr = server.accept()
        with conn:
            handle_client(conn, addr)

if __name__ == "__main__":
    main()
