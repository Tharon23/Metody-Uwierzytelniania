// Wypisuje znaczniki czasu pokazu (do zrzutów i montażu wideo).
import { buildShow } from '../src/engine/show';
const show = buildShow();
console.log('total', show.total.toFixed(1));
for (const s of show.segments) console.log(s.kind.padEnd(8), s.start.toFixed(1).padStart(6), s.end.toFixed(1).padStart(6), 'mech' in s ? s.mech.id : '', 'variant' in s ? s.variant.id : '');
