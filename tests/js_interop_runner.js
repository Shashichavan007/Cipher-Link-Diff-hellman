import { webcrypto } from 'node:crypto';

// Polyfill window.crypto for Node.js environment
if (!globalThis.window) {
  globalThis.window = {};
}
globalThis.window.crypto = webcrypto;
globalThis.window.btoa = (b) => Buffer.from(b, 'binary').toString('base64');
globalThis.window.atob = (b) => Buffer.from(b, 'base64').toString('binary');

import {
  generatePublicKey,
  computeSharedSecret,
  deriveKey,
  encryptMessage,
  decryptMessage,
  DEFAULT_SALT,
  bigIntToBytes,
} from '../frontend/src/lib/crypto.js';

async function main() {
  const args = JSON.parse(process.argv[2]);
  
  if (args.action === 'compute_public_key') {
    const priv = BigInt(args.private_key);
    const pub = generatePublicKey(priv);
    console.log(JSON.stringify({ public_key: pub.toString() }));
  } else if (args.action === 'compute_shared_key') {
    const peerPub = BigInt(args.peer_public_key);
    const myPriv = BigInt(args.my_private_key);
    const secret = computeSharedSecret(peerPub, myPriv);
    const { hashBuffer } = await deriveKey(secret, args.salt || DEFAULT_SALT);
    const keyHex = Buffer.from(hashBuffer).toString('hex');
    console.log(JSON.stringify({
      shared_secret: secret.toString(),
      derived_key_hex: keyHex
    }));
  } else if (args.action === 'encrypt') {
    const peerPub = BigInt(args.peer_public_key);
    const myPriv = BigInt(args.my_private_key);
    const secret = computeSharedSecret(peerPub, myPriv);
    const { aesKey } = await deriveKey(secret, args.salt || DEFAULT_SALT);
    const payload = await encryptMessage(aesKey, args.plaintext);
    console.log(JSON.stringify(payload));
  } else if (args.action === 'decrypt') {
    const peerPub = BigInt(args.peer_public_key);
    const myPriv = BigInt(args.my_private_key);
    const secret = computeSharedSecret(peerPub, myPriv);
    const { aesKey } = await deriveKey(secret, args.salt || DEFAULT_SALT);
    const plaintext = await decryptMessage(aesKey, args.payload);
    console.log(JSON.stringify({ plaintext }));
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
