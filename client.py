from __future__ import annotations

import socket

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

def main() -> None:
    client_private = generate_private_key()
    client_public = generate_public_key(client_private)

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.connect((HOST, PORT))

        send_json(sock, {"type": "client_hello", "public_key": str(client_public)})
        hello = recv_json(sock)
        if hello.get("type") != "server_hello":
            raise ValueError("Expected server_hello")

        server_public = int(hello["public_key"])
        shared_secret = compute_shared_secret(server_public, client_private)
        key = derive_key(shared_secret)

        print("[*] Secure channel established.")
        print("Type messages and press Enter. Use 'bye' to end the session.")

        while True:
            text = input("Client> ")
            send_json(sock, {"type": "message", "payload": encrypt_message(key, text)})

            response = recv_json(sock)
            if response.get("type") != "message":
                continue

            plaintext = decrypt_message(key, response["payload"])
            print(f"Server: {plaintext}")

            if text.lower() in {"bye", "exit", "quit"} or plaintext.lower().startswith("goodbye"):
                break

if __name__ == "__main__":
    main()
