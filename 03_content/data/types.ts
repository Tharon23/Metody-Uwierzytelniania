// Model treści: jedno źródło prawdy dla aplikacji, wideo i raportu.
// Plik bez zależności npm — importują go Vite, Remotion i skrypty generujące.

export type Factor = 'wiedza' | 'posiadanie' | 'cecha';

export type ActorKind =
  | 'osoba'
  | 'laptop'
  | 'telefon'
  | 'serwer'
  | 'baza'
  | 'bts'
  | 'karta'
  | 'terminal'
  | 'bank'
  | 'klucz'
  | 'chmura'
  | 'centrala'
  | 'chip';

export interface Actor {
  id: string;
  kind: ActorKind;
  label: string;
  /** Drugi wiersz etykiety, np. domena albo model. */
  note?: string;
  /** Pozycja na siatce izometrycznej [x, y]; oś x biegnie w prawo-w dół, oś y w lewo-w dół. */
  at: [number, number];
  /** Aktor należy do atakującego (rysowany kolorem ataku). */
  hostile?: boolean;
}

export type Channel =
  | 'tls' // HTTPS
  | 'sms' // sieć komórkowa, SMS
  | 'nfc' // radio krótkiego zasięgu
  | 'usb'
  | 'push' // powiadomienie push (APNs/FCM)
  | 'czlowiek' // człowiek przepisuje / patrzy / dotyka
  | 'wewn' // wewnątrz urządzenia lub serwerowni
  | 'siec' // sieć płatnicza / międzybankowa / internet
  | 'pasek'; // odczyt magnetyczny paska karty

export type Tone = 'neutral' | 'ok' | 'warn' | 'attack';

export interface Field {
  k: string;
  v: string;
  /** Wartość tajna (rysowana jako sekret w ruchu). */
  secret?: boolean;
  tone?: Tone;
}

export interface Message {
  /** Krótka etykieta na pakiecie (≤ 22 znaki). */
  label: string;
  channel: Channel;
  fields?: Field[];
  tone?: Tone;
}

/** Żeton (stan) przypisany aktorowi od końca kroku, np. „sesja" w przeglądarce. */
export interface Token {
  at: string;
  label: string;
  tone?: Tone;
}

/** Co pokazuje ekran urządzenia od końca kroku (adres, kod, pytanie). */
export interface Screen {
  at: string;
  text: string;
  tone?: Tone;
}

export interface Step {
  id: string;
  /** Tytuł na liście kroków (≤ 40 znaków). */
  title: string;
  /** Podpis w autoplay (≤ 90 znaków). */
  caption: string;
  /** Objaśnienie dla dociekliwych (≤ 3 zdania). */
  detail: string;
  /** Przelot wiadomości od → do. */
  from?: string;
  to?: string;
  /** Działanie lokalne u aktora (gdy brak from/to). */
  at?: string;
  msg?: Message;
  /** Obliczenie lokalne, np. „Argon2id(hasło, sól)". */
  calc?: string;
  /** ok = weryfikacja udana, warn = ryzyko, blocked = atak zatrzymany, breach = atak udany. */
  result?: 'ok' | 'warn' | 'blocked' | 'breach';
  gives?: Token[];
  /** Żetony usuwane po kroku (aktor + etykieta). */
  takes?: Token[];
  shows?: Screen[];
  /** Aktorzy, na których celuje kamera (domyślnie from/to/at). */
  focus?: string[];
  /** Waga długości kroku (1 = standard). */
  dur?: number;
}

export interface Bet {
  question: string;
  options: [string, string];
  correct: 0 | 1;
}

export interface Verdict {
  outcome: 'udany' | 'zablokowany' | 'czesciowo';
  text: string;
}

export interface Variant {
  id: string;
  name: string;
  kind: 'normalny' | 'atak';
  /** Jedno zdanie: co się dzieje w tym wariancie. */
  summary: string;
  /** Dodatkowi aktorzy (np. atakujący). */
  actors?: Actor[];
  /** Aktorzy ukryci w tym wariancie. */
  hide?: string[];
  /** Nadpisanie pozycji aktorów bazowych. */
  move?: Record<string, [number, number]>;
  /** Stan początkowy: żetony i ekrany przed pierwszym krokiem. */
  initial?: { tokens?: Token[]; screens?: Screen[] };
  bet?: Bet;
  steps: Step[];
  verdict?: Verdict;
}

export interface Facts {
  /** Najwyższy osiągalny poziom NIST SP 800-63B-4. */
  aal: string;
  /** Rola w PSD2 SCA. */
  psd2: string;
  phishingResistant: 'tak' | 'nie' | 'częściowo';
  /** Najlepsze zastosowanie (rekomendacja). */
  najlepiej: string;
  /** Główne słabości, jednym zdaniem. */
  slabosci: string;
}

export interface Mechanism {
  id: string;
  num: number;
  name: string;
  /** Krótka nazwa do kafelków i tabel (≤ 14 znaków). */
  short: string;
  factors: Factor[];
  /** Jedno zdanie: czym jest. */
  tagline: string;
  /** Analogia dla licealisty. */
  analogy: string;
  facts: Facts;
  actors: Actor[];
  variants: Variant[];
  sources: string[];
  /** Rozszerzenie względem KM1 §8.1. */
  extension?: boolean;
}

export type CriterionGroup = 'A' | 'B' | 'C' | 'D';

export interface Criterion {
  id: string;
  group: CriterionGroup;
  name: string;
  /** Pełny opis do dymka i raportu. */
  desc: string;
}

export interface Score {
  /** Ocena 1–5 (5 = najlepiej). */
  v: 1 | 2 | 3 | 4 | 5;
  /** Uzasadnienie (1–2 zdania). */
  why: string;
  /** Identyfikatory źródeł z sources.ts. */
  src: string[];
  /** Wartość opisowa dla kryteriów D (np. „AAL2", „tak"). */
  label?: string;
}

export interface Source {
  id: string;
  short: string;
  full: string;
  url: string;
  year: number;
  /** Rodzaj: norma, spec, recenz., preprint, raport, repo. */
  type: string;
}

export interface Profile {
  id: 'B2B' | 'B2C' | 'C2C';
  name: string;
  desc: string;
  /** Waga grupy kryteriów (suma = 1). */
  weights: Record<CriterionGroup, number>;
}
