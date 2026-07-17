/**
 * base64 <-> Uint8Array helpers.
 *
 * React Native's global `atob`/`btoa` handle ASCII-range base64 safely and
 * are available via the JS engine polyfills Expo ships with, so no extra
 * native dependency is required for binary file manipulation (PDF/ZIP).
 */

export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = global.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return global.btoa(binary);
}
