// Minimalna, synchroniczna implementacja HOTP/TOTP (RFC 4226 / RFC 6238) z SHA-1.
// Synchroniczna celowo: scena liczy prawdziwy kod w czasie renderu (także w Remotion).

function sha1(bytes: Uint8Array): Uint8Array {
  const ml = bytes.length * 8;
  const withOne = bytes.length + 1;
  const total = Math.ceil((withOne + 8) / 64) * 64;
  const buf = new Uint8Array(total);
  buf.set(bytes);
  buf[bytes.length] = 0x80;
  const dv = new DataView(buf.buffer);
  dv.setUint32(total - 8, Math.floor(ml / 2 ** 32));
  dv.setUint32(total - 4, ml >>> 0);

  let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476, h4 = 0xc3d2e1f0;
  const w = new Uint32Array(80);
  for (let off = 0; off < total; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4);
    for (let i = 16; i < 80; i++) {
      const x = w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16];
      w[i] = (x << 1) | (x >>> 31);
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4;
    for (let i = 0; i < 80; i++) {
      let f: number, k: number;
      if (i < 20) { f = (b & c) | (~b & d); k = 0x5a827999; }
      else if (i < 40) { f = b ^ c ^ d; k = 0x6ed9eba1; }
      else if (i < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8f1bbcdc; }
      else { f = b ^ c ^ d; k = 0xca62c1d6; }
      const t = (((a << 5) | (a >>> 27)) + f + e + k + w[i]) >>> 0;
      e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0; h4 = (h4 + e) >>> 0;
  }
  const out = new Uint8Array(20);
  const ov = new DataView(out.buffer);
  [h0, h1, h2, h3, h4].forEach((h, i) => ov.setUint32(i * 4, h));
  return out;
}

export function hmacSha1(key: Uint8Array, msg: Uint8Array): Uint8Array {
  const block = 64;
  let k = key.length > block ? sha1(key) : key;
  const padded = new Uint8Array(block);
  padded.set(k);
  const ipad = new Uint8Array(block + msg.length);
  const opad = new Uint8Array(block + 20);
  for (let i = 0; i < block; i++) {
    ipad[i] = padded[i] ^ 0x36;
    opad[i] = padded[i] ^ 0x5c;
  }
  ipad.set(msg, block);
  opad.set(sha1(ipad), block);
  k = sha1(opad);
  return k;
}

export function counterBytes(counter: number): Uint8Array {
  const out = new Uint8Array(8);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, Math.floor(counter / 2 ** 32));
  dv.setUint32(4, counter >>> 0);
  return out;
}

export interface HotpTrace {
  hmac: Uint8Array;
  offset: number;
  binary: number;
  code: string;
}

export function hotp(key: Uint8Array, counter: number, digits = 6): HotpTrace {
  const hmac = hmacSha1(key, counterBytes(counter));
  const offset = hmac[19] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    (hmac[offset + 1] << 16) |
    (hmac[offset + 2] << 8) |
    hmac[offset + 3];
  const code = String(binary % 10 ** digits).padStart(digits, '0');
  return { hmac, offset, binary, code };
}

export function totp(key: Uint8Array, unixSeconds: number, step = 30, digits = 6) {
  const counter = Math.floor(unixSeconds / step);
  return { counter, ...hotp(key, counter, digits) };
}

export function ascii(s: string): Uint8Array {
  return new Uint8Array([...s].map((c) => c.charCodeAt(0)));
}

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export function base32(bytes: Uint8Array): string {
  let bits = 0, value = 0, out = '';
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

export const hex = (bytes: Uint8Array) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');

/** Dane demonstracyjne sceny TOTP: sekret z wektorów testowych RFC 6238 i stała chwila. */
export const DEMO_SECRET = ascii('12345678901234567890');
export const DEMO_TIME = Date.UTC(2026, 0, 23, 10, 15, 12) / 1000; // 23.01.2026 11:15:12 czasu PL
export const demoTotp = totp(DEMO_SECRET, DEMO_TIME);
export const demoTotpGrouped = `${demoTotp.code.slice(0, 3)} ${demoTotp.code.slice(3)}`;
