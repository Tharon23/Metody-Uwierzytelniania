import type { Mechanism } from './types';
import { haslo } from './mechanisms/haslo';
import { sms } from './mechanisms/sms';
import { totp } from './mechanisms/totp';
import { push } from './mechanisms/push';
import { fido2 } from './mechanisms/fido2';
import { passkey } from './mechanisms/passkey';
import { biometria } from './mechanisms/biometria';
import { karta } from './mechanisms/karta';
import { mfa } from './mechanisms/mfa';
import { blik } from './mechanisms/blik';

/** Mechanizmy w kolejności arkuszy (KM1 §8.1 + rozszerzenie BLIK). */
export const mechanisms: Mechanism[] = [haslo, sms, totp, push, fido2, passkey, biometria, karta, mfa, blik].sort(
  (a, b) => a.num - b.num,
);

export const mechanismById = Object.fromEntries(mechanisms.map((m) => [m.id, m])) as Record<string, Mechanism>;

export * from './types';
