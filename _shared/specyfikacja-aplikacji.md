# Specyfikacja aplikacji „Jak się logujemy?"

Status: zatwierdzona do realizacji (18.11.2026).

## Cel

Statyczna aplikacja web (GitHub Pages, działa offline), która pokazuje, jak działa 10 mechanizmów uwierzytelniania i jak zachowują się wobec ataków. Trzy sposoby użycia z jednego kodu:

1. **Explorer** — przeklikiwanie myszą i klawiaturą: krok po kroku, przewijanie osi czasu, warianty ataków, inspekcja wiadomości.
2. **Autoplay / kiosk** — pętla wszystkich mechanizmów z dużymi podpisami na osobnym ekranie, bez obsługi.
3. **Wideo** — te same sceny renderowane do MP4 przez Remotion.

Plus **porównanie**: matryca KM2 (1–5, ze źródłami) i ranking dla profili B2B / B2C / C2C.

## Mechanizmy

KM1 §8.1 (9 jednostek) + BLIK jako rozszerzenie polskie:

| # | id | Mechanizm | Warianty |
|---|---|---|---|
| 1 | `haslo` | Hasło (sól + Argon2id) | normalny · phishing AitM · wyciek bazy |
| 2 | `sms` | SMS OTP | normalny · SIM-swap · phishing AitM |
| 3 | `totp` | TOTP (aplikacja) | normalny (prawdziwe HMAC) · phishing AitM |
| 4 | `push` | Push + number matching | normalny · push bombing (zwykły push) · push bombing vs number matching |
| 5 | `fido2` | Klucz sprzętowy FIDO2 | normalny (PIN + dotyk) · phishing AitM · zdalne złośliwe oprogramowanie |
| 6 | `passkey` | Passkey (synced / device-bound) | normalny · phishing AitM · kradzież sesji po zalogowaniu |
| 7 | `biometria` | Biometria lokalna | normalny · atak prezentacji (sztuczny palec) |
| 8 | `karta` | Karta: zbliżeniowa EMV i pasek | normalny EMV · skimming paska · powtórzenie (replay) · przekaźnik NFC |
| 9 | `mfa` | MFA + ocena ryzyka | normalny (step-up) · credential stuffing · wymuszony fallback na SMS |
| 10 | `blik` | BLIK (rozszerzenie PL) | normalny · „oszustwo na BLIKa" |

## Architektura

```
03_content/data/        typy + dane (bez zależności npm)
  types.ts              Mechanism, Actor, Step, Variant, Score...
  mechanisms/*.ts       po jednym pliku na mechanizm
  matrix.ts             oceny 1–5 + uzasadnienia + źródła
  sources.ts            identyfikatory KM1 (+ zweryfikowane X*)
04_app/src/
  engine/               czas → stan: timeline, easing, sprężyny, kamera
  scene/                rysunek: iso.ts (projekcja), devices/*, Stage.tsx
  views/                Explorer, Autoplay, Porownanie, OProjekcie, Start
  video/                kompozycje Remotion (te same komponenty sceny)
```

**Zasada determinizmu:** komponent sceny dostaje `(mechanizm, wariant, czas)` i zwraca SVG. Brak własnych zegarów, przejść CSS czy bibliotek animacji wewnątrz sceny. Explorer napędza czas `requestAnimationFrame`, Remotion — numerem klatki. Chrom aplikacji (panele, nakładki) animuje CSS, tylko w odpowiedzi na działanie użytkownika.

**Model kroku:** krok ma nadawcę/odbiorcę albo obliczenie lokalne, wiadomość (etykieta + pola + kanał: TLS, SMS, NFC, USB, push, człowiek), wynik (`ok`/`warn`/`fail`), żetony przekazywane aktorom (np. „sesja", „hasło" trafia do atakującego), podpis (≤ 90 zn.) i objaśnienie.

**Oś czasu:** wariant → płaska lista kroków z długościami; czas globalny → (indeks kroku, postęp 0–1). Stan sceny w chwili *t* = złożenie skutków kroków zakończonych + animacja bieżącego.

**Widoki sceny:** izometryczny (topologia) i sekwencja (tory aktorów), przełącznik `V`, ten sam czas.

## Explorer — sterowanie

`←/→` krok, `Spacja` odtwarzaj/pauza, `Home/End`, `V` widok, `A` następny wariant, `1`–`0` mechanizm, `L` lista, `D` sam arkusz, `F` pełny ekran, `T` motyw, `Ctrl+K` wyszukiwarka, `?` pomoc, `Esc` zamknij. Przed wariantem ataku pytanie „Jak myślisz?" (dwie odpowiedzi), wynik po animacji. Pola trafień ≥ 44 px.

## Autoplay / kiosk

`#/autoplay`: plansza tytułowa → dla każdego mechanizmu: karta tytułowa z analogią, przebieg normalny, jeden wariant ataku z werdyktem → finał: ranking odporności na phishing → podziękowania. Pętla. Podpisy duże, czytelne z 3–5 m. Mysz/klawisz pokazuje na chwilę pasek (wyjście `Esc`). `#/autoplay?kiosk` dodatkowo: Wake Lock, kursor ukryty. Explorer z `?idle=60` wraca do autoplay po 60 s bezczynności.

## Porównanie

Matryca mechanizmy × kryteria A1–A7, B1–B3, C1–C4, D1–D4 (KM1 §8.2), kolor wg oceny, dymek z uzasadnieniem i źródłami. Profile wag B2B / B2C / C2C → ranking słupkowy. Wagi opisane w danych, te same w raporcie.

## Jakość — kryteria odbioru

- `npm run build` bez błędów, `npm test` zielony (oś czasu, TOTP wg wektorów testowych RFC 6238, integralność matrycy: każda ocena ma źródło z listy).
- Zrzuty Playwright 1920×1080 i 1280×800 dla każdego widoku, oba motywy; brak nachodzących etykiet.
- 60 kl./s w Explorerze na zwykłym laptopie (brak alokacji w pętli klatki poza React).
- Działa z `vite preview` pod ścieżką podrzędną (`base: './'`) i bez internetu.
- Credit Protocol Explorer / Dilum Sanjaya w „O projekcie" i w stopce startu.
