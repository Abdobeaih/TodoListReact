const HEX = "0123456789abcdef";

/**
 * Collision-resistant id without pulling in a uuid polyfill.
 * Prefers the platform CSPRNG and degrades to Math.random only if it is missing.
 */
export function createId(): string {
    const cryptoRef = globalThis.crypto;
    if (cryptoRef?.randomUUID) return cryptoRef.randomUUID();
    if (cryptoRef?.getRandomValues) {
        const bytes = cryptoRef.getRandomValues(new Uint8Array(16));
        let out = "";
        for (const byte of bytes) out += HEX[byte >> 4] + HEX[byte & 15];
        return out;
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
