import { mechanisms } from '@content/index';
import type { Mechanism, Variant } from '@content/types';

/**
 * Jedna kolejność całej aplikacji: warianty mechanizmu po kolei, potem następny mechanizm
 * (po BLIK-u znów hasło). Używana przez autoodtwarzanie i strzałki na granicach przebiegu.
 */
export const ORDER: { m: Mechanism; v: Variant }[] = mechanisms.flatMap((m) => m.variants.map((v) => ({ m, v })));

export function neighbor(m: Mechanism, v: Variant, dir: 1 | -1) {
  const i = ORDER.findIndex((x) => x.m.id === m.id && x.v.id === v.id);
  return ORDER[(i + dir + ORDER.length) % ORDER.length];
}
