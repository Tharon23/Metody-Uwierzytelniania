import type { Mechanism } from '../types';
import { base32, demoTotp, demoTotpGrouped, DEMO_SECRET, hex } from '../lib/totp';

const K = base32(DEMO_SECRET);
const T = demoTotp.counter;
const H = hex(demoTotp.hmac);
const CODE = demoTotp.code;

export const totp: Mechanism = {
  id: 'totp',
  num: 3,
  name: 'TOTP (aplikacja)',
  short: 'TOTP',
  factors: ['wiedza', 'posiadanie'],
  tagline: 'Kod liczony co 30 sekund z czasu i sekretu, który znają tylko aplikacja i serwer (RFC 6238).',
  analogy:
    'Ty i bank macie dwa identyczne zegarki z tajnym mechanizmem. Co 30 sekund oba pokazują ten sam 6-cyfrowy kod, bez wysyłania czegokolwiek. Kłopot: kod przepisujesz Ty, więc można Cię namówić, żebyś przepisał go na złej stronie.',
  facts: {
    aal: 'AAL2',
    psd2: 'Posiadanie (urządzenie z sekretem) + wiedza (hasło)',
    phishingResistant: 'nie',
    najlepiej: 'Jako drugi składnik zamiast SMS: działa offline i nie zależy od operatora.',
    slabosci: 'Phishing w czasie rzeczywistym, kradzież sekretu (np. z niezaszyfrowanej kopii zapasowej), utrata telefonu bez kopii.',
  },
  actors: [
    { id: 'ala', kind: 'osoba', label: 'Ala', at: [0, 0] },
    { id: 'telefon', kind: 'telefon', label: 'Aplikacja', note: 'uwierzytelniająca', at: [0, -2.6] },
    { id: 'laptop', kind: 'laptop', label: 'Przeglądarka', at: [2.6, 0] },
    { id: 'serwer', kind: 'serwer', label: 'Serwer banku', note: 'bank.example', at: [7, 0] },
  ],
  variants: [
    {
      id: 'normalny',
      name: 'Kod z aplikacji',
      kind: 'normalny',
      summary: 'Aplikacja liczy kod z sekretu i czasu, serwer liczy to samo i porównuje. Liczby na tym arkuszu są prawdziwe.',
      initial: {
        screens: [{ at: 'laptop', text: 'bank.example', tone: 'ok' }],
        tokens: [{ at: 'telefon', label: 'sekret K', tone: 'warn' }, { at: 'serwer', label: 'sekret K', tone: 'warn' }],
      },
      steps: [
        {
          id: 'czas', title: 'Aplikacja bierze czas',
          caption: `Aplikacja dzieli aktualny czas na okna po 30 s. Teraz to okno nr ${T}.`,
          detail: `Sekret K (${K}) trafił do aplikacji raz, przy rejestracji, w kodzie QR. Licznik T = ⌊czas uniksowy / 30⌋; tu: 23.01.2026, 11:15:12.`,
          at: 'telefon', calc: `T = ⌊czas / 30⌋ = ${T}`,
        },
        {
          id: 'hmac', title: 'HMAC z sekretu i licznika',
          caption: 'Aplikacja liczy HMAC-SHA-1 z sekretu K i licznika T: 20 bajtów.',
          detail: `Pełny wynik: ${H}. Bez znajomości K nie da się go przewidzieć ani policzyć wstecz.`,
          at: 'telefon', calc: `HMAC-SHA1(K, T) = ${H.slice(0, 16)}…`,
        },
        {
          id: 'kod', title: 'Skrócenie do 6 cyfr',
          caption: `Z 20 bajtów aplikacja wycina 4 i bierze resztę z dzielenia przez milion: ${demoTotpGrouped}.`,
          detail: `Ostatnia cyfra szesnastkowa (${H.slice(-1)}) wskazuje przesunięcie ${demoTotp.offset}. Cztery bajty od tego miejsca to liczba ${demoTotp.binary}; mod 1 000 000 daje ${CODE}.`,
          at: 'telefon', calc: `${demoTotp.binary} mod 10⁶ = ${CODE}`,
          shows: [{ at: 'telefon', text: demoTotpGrouped, tone: 'warn' }],
          result: 'ok',
        },
        {
          id: 'przepisanie', title: 'Ala przepisuje kod',
          caption: 'Ala wpisuje kod z aplikacji w przeglądarce.',
          detail: 'Telefon nie musi mieć internetu. Kod przenosi człowiek, więc metoda zależy od tego, gdzie go wpisze.',
          from: 'ala', to: 'laptop', focus: ['telefon', 'ala', 'laptop'],
          msg: { label: CODE, channel: 'czlowiek', tone: 'warn' },
        },
        {
          id: 'wysylka', title: 'Kod jedzie do serwera',
          caption: 'Przeglądarka wysyła kod razem z sesją logowania po haśle.',
          detail: 'Kod jest ważny tylko w swoim oknie czasowym (zwykle serwer akceptuje też sąsiednie okno, gdy zegary się rozjadą).',
          from: 'laptop', to: 'serwer',
          msg: { label: `kod: ${CODE}`, channel: 'tls', tone: 'warn' },
        },
        {
          id: 'weryfikacja', title: 'Serwer liczy to samo',
          caption: 'Serwer liczy TOTP z tego samego sekretu i czasu. Wynik się zgadza. Sesja wydana.',
          detail: 'Serwer sprawdza okna T−1, T i T+1 i odrzuca kod użyty wcześniej. Sekret K musi być na serwerze dobrze chroniony — jego wyciek pozwala liczyć kody.',
          at: 'serwer', calc: `TOTP(K, ${T}) = ${CODE} ✓`,
          gives: [{ at: 'laptop', label: 'sesja', tone: 'ok' }],
          result: 'ok',
        },
      ],
    },
    {
      id: 'phishing',
      name: 'Phishing AitM',
      kind: 'atak',
      summary: 'Pośrednik przekazuje kod z aplikacji do banku, zanim minie 30-sekundowe okno.',
      actors: [{ id: 'proxy', kind: 'serwer', label: 'Pośrednik atakującego', note: 'bank.examp1e', at: [5, 3], hostile: true }],
      initial: {
        screens: [{ at: 'laptop', text: 'bank.examp1e', tone: 'attack' }],
        tokens: [{ at: 'telefon', label: 'sekret K', tone: 'warn' }, { at: 'proxy', label: 'hasło', tone: 'attack' }],
      },
      bet: {
        question: 'Kod z aplikacji zmienia się co 30 sekund. Czy to wystarczy przeciw pośrednikowi?',
        options: ['Tak, kod szybko traci ważność', 'Nie, pośrednik zdąży'],
        correct: 1,
      },
      steps: [
        {
          id: 'kod', title: 'Aplikacja pokazuje kod',
          caption: 'Hasło już przejęte. Fałszywa strona prosi o kod, aplikacja Ali go pokazuje.',
          detail: 'Aplikacja liczy kod poprawnie. Nie wie i nie może wiedzieć, na jakiej stronie zostanie wpisany.',
          at: 'telefon', calc: `TOTP(K, T) = ${CODE}`,
          shows: [{ at: 'telefon', text: demoTotpGrouped, tone: 'warn' }],
        },
        {
          id: 'wpis', title: 'Kod na fałszywej stronie',
          caption: 'Ala wpisuje kod na bank.examp1e.',
          detail: 'Strona wygląda jak bank, więc prośba o kod wydaje się naturalna.',
          from: 'ala', to: 'laptop', focus: ['telefon', 'ala', 'laptop'],
          msg: { label: CODE, channel: 'czlowiek', tone: 'warn' },
        },
        {
          id: 'przechwyt', title: 'Kod u pośrednika',
          caption: 'Kod trafia do pośrednika w ułamku sekundy.',
          detail: 'Do końca okna zostało kilkanaście sekund — dla automatu to wieczność.',
          from: 'laptop', to: 'proxy',
          msg: { label: `kod: ${CODE}`, channel: 'tls', tone: 'attack' },
          gives: [{ at: 'proxy', label: 'kod', tone: 'attack' }],
          result: 'breach',
        },
        {
          id: 'przekaz', title: 'Pośrednik loguje się kodem',
          caption: 'Pośrednik wysyła hasło i kod do banku, zanim okno się zamknie.',
          detail: 'Dla banku to poprawne logowanie: właściwe hasło, właściwy kod, właściwy czas.',
          from: 'proxy', to: 'serwer',
          msg: { label: `kod: ${CODE}`, channel: 'tls', tone: 'attack' },
          calc: `TOTP(K, ${T}) = ${CODE} ✓`,
          gives: [{ at: 'proxy', label: 'sesja', tone: 'attack' }],
          result: 'breach',
        },
      ],
      verdict: { outcome: 'udany', text: 'Atak udany. 30 sekund to dużo czasu dla automatycznego pośrednika; kod nie jest związany z domeną.' },
    },
  ],
  sources: ['S3', 'S4', 'N1', 'A1', 'P7', 'P8', 'N4'],
};
