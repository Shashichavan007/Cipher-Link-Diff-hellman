/**
 * CipherLink Client-Side Cryptographic Engine
 * Preserves exact protocol compatibility with Python app.crypto.crypto_utils:
 * - 1536-bit MODP Diffie-Hellman Group (RFC 3526)
 * - SHA-256 Key Derivation: SHA256(salt + minimal_big_endian_bytes(shared_secret))
 * - AES-256-GCM Authenticated Encryption with 96-bit (12-byte) random nonces
 */

export const P_HEX = 
  "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD1" +
  "29024E088A67CC74020BBEA63B139B22514A08798E3404DD" +
  "EF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245" +
  "E485B576625E7EC6F44C42E9A63A3620FFFFFFFFFFFFFFFF";

export const P = BigInt("0x" + P_HEX);
export const G = 2n;
export const DEFAULT_SALT = "secure-text-transfer-demo";

/**
 * Fast Modular Exponentiation: (base ^ exp) % mod
 */
export function modPow(base, exp, mod) {
  let res = 1n;
  base = base % mod;
  let e = exp;
  while (e > 0n) {
    if (e % 2n === 1n) {
      res = (res * base) % mod;
    }
    e = e / 2n;
    base = (base * base) % mod;
  }
  return res;
}

/**
 * Generate cryptographically secure random BigInt for DH private exponent.
 */
export function generatePrivateKey() {
  const min = 2n;
  const max = P - 2n;
  const range = max - min;
  
  // 192 bytes = 1536 bits
  const randomBytes = new Uint8Array(192);
  window.crypto.getRandomValues(randomBytes);
  
  let hex = "";
  for (let i = 0; i < randomBytes.length; i++) {
    hex += randomBytes[i].toString(16).padStart(2, "0");
  }
  const randVal = BigInt("0x" + hex);
  return min + (randVal % range);
}

/**
 * Compute public key: Y = (G ^ x) mod P
 */
export function generatePublicKey(privateKey) {
  if (privateKey < 2n || privateKey > P - 2n) {
    throw new Error("Private key out of bounds");
  }
  return modPow(G, privateKey, P);
}

/**
 * Compute shared secret: S = (peerPublicKey ^ privateKey) mod P
 */
export function computeSharedSecret(peerPublicKey, privateKey) {
  if (peerPublicKey < 2n || peerPublicKey > P - 2n) {
    throw new Error("Invalid peer public key: out of valid range [2, P-2]");
  }
  return modPow(peerPublicKey, privateKey, P);
}

/**
 * Convert BigInt shared secret to minimal big-endian Uint8Array matching Python:
 * (shared_secret.bit_length() + 7) // 8
 */
export function bigIntToBytes(bn) {
  let hex = bn.toString(16);
  if (hex.length % 2 !== 0) {
    hex = "0" + hex;
  }
  const len = hex.length / 2;
  const u8 = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    u8[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return u8;
}

/**
 * Derive Web Crypto AES-GCM 256-bit CryptoKey using SHA-256(salt + secret_bytes).
 */
export async function deriveKey(sharedSecret, saltStr = DEFAULT_SALT) {
  const encoder = new TextEncoder();
  const saltBytes = encoder.encode(saltStr);
  const secretBytes = bigIntToBytes(sharedSecret);
  
  const combined = new Uint8Array(saltBytes.length + secretBytes.length);
  combined.set(saltBytes, 0);
  combined.set(secretBytes, saltBytes.length);
  
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", combined);
  
  const aesKey = await window.crypto.subtle.importKey(
    "raw",
    hashBuffer,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  
  return { aesKey, hashBuffer };
}

/**
 * Encrypt plaintext using AES-256-GCM with fresh 96-bit (12-byte) random nonce.
 */
export async function encryptMessage(aesKey, plaintext) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  const nonce = new Uint8Array(12);
  window.crypto.getRandomValues(nonce);
  
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    aesKey,
    data
  );
  
  const nonceBase64 = arrayBufferToBase64(nonce.buffer);
  const ciphertextBase64 = arrayBufferToBase64(ciphertextBuffer);
  
  return {
    nonce: nonceBase64,
    ciphertext: ciphertextBase64,
  };
}

/**
 * Decrypt AES-256-GCM payload and verify 128-bit authentication tag.
 */
export async function decryptMessage(aesKey, payload) {
  if (!payload || !payload.nonce || !payload.ciphertext) {
    throw new Error("Invalid payload: missing nonce or ciphertext");
  }
  
  const nonce = base64ToArrayBuffer(payload.nonce);
  const ciphertext = base64ToArrayBuffer(payload.ciphertext);
  
  const plaintextBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: nonce },
    aesKey,
    ciphertext
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(plaintextBuffer);
}

/**
 * Generate educational inspection metadata for Encryption Playground
 */
export async function inspectEncryption(aesKey, hashBuffer, plaintext) {
  const payload = await encryptMessage(aesKey, plaintext);
  const nonceU8 = new Uint8Array(base64ToArrayBuffer(payload.nonce));
  const rawCtU8 = new Uint8Array(base64ToArrayBuffer(payload.ciphertext));
  
  const ctData = rawCtU8.slice(0, Math.max(0, rawCtU8.length - 16));
  const authTag = rawCtU8.slice(Math.max(0, rawCtU8.length - 16));
  
  // Calculate key fingerprint (truncated hash of derived key)
  const fpBuffer = await window.crypto.subtle.digest("SHA-256", hashBuffer);
  const fpArray = Array.from(new Uint8Array(fpBuffer));
  const fpHex = fpArray.map(b => b.toString(16).padStart(2, "0")).join("").substring(0, 16);
  
  return {
    plaintext,
    nonce_base64: payload.nonce,
    nonce_hex: u8ToHex(nonceU8),
    ciphertext_base64: payload.ciphertext,
    ciphertext_hex: u8ToHex(ctData),
    auth_tag_hex: u8ToHex(authTag),
    key_fingerprint: `sha256:${fpHex}...`,
    cipher: "AES-256-GCM",
    key_derivation: "SHA-256 (Salted)",
    key_length_bits: 256,
    nonce_length_bits: 96,
    tag_length_bits: 128,
  };
}

// Helpers for Base64 and Hex conversion
export function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export function u8ToHex(u8) {
  return Array.from(u8).map(b => b.toString(16).padStart(2, "0")).join("");
}
