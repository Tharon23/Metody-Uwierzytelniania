# Ocena researchu (Gemini Deep Research)

Plik źródłowy: `gemini-deep-research.md` (ten folder). Raport traktujemy jako **materiał roboczy, nie źródło**: część danych jest trafna, część zmyślona albo uproszczona. Poniżej co bierzemy, co odrzucamy i co trzeba sprawdzić przed użyciem. Weryfikacja wykonana 18.11.2026 (`npm view`, `gh api`).

## Bierzemy

- **Architektura renderu:** czyste inline SVG, własna projekcja izometryczna (kilkanaście linii matematyki), bez canvasa i bez WebGL w scenach. Ostrość na TV 4K, zero zależności, deterministyczny render w Remotion.
- **Scena jako czysta funkcja czasu** `(krok, postęp) → SVG`. Ten sam opis napędza tryb interaktywny (krok po kroku, przewijanie), autoplay i wideo. To pokrywa się z kierunkiem z sesji 1 („timeline jako dane").
- **Dwie perspektywy:** widok przestrzenny (izometryczna topologia: urządzenia, serwery) i sekwencyjny (diagram sekwencji z torami). Przełączane, zsynchronizowane.
- **Progresywne ujawnianie:** komunikat → pola wiadomości → bajty. Inspektor wiadomości (pola JSON/APDU/CBOR) jako panel szczegółów, bez pełnego hex-dumpu wszędzie.
- **Paleta „blueprint":** jeden odcień bazowy + akcenty semantyczne (bursztyn = ostrzeżenie, czerwień = atak udany, zieleń = weryfikacja kryptograficzna). Ciemny motyw domyślny na TV/rzutnik, jasny jako alternatywa, przełącznik `T`.
- **Typografia mono z cyframi tabelarycznymi** (`tnum`, przekreślone zero), fonty z paczek `@fontsource/*` (wersje 5.3.0 zweryfikowane), lokalnie w bundlu.
- **Kiosk / autoplay:** pętla scen z napisami, przejęcie sterowania przy ruchu myszy/klawiszu, powrót do pętli po bezczynności (tylko w trybie kiosku), Screen Wake Lock, `prefers-reduced-motion`, migotanie < 3 Hz (WCAG 2.3.1), wszystko offline (bez CDN).
- **Pedagogika:** „obstaw wynik" przed animacją ataku (aktywna predykcja), sygnalizowanie (pulsujący zły adres w ataku phishingowym), segmentacja na krótkie kroki, etykiety przyklejone do pakietów zamiast osobnych legend, zero dekoracyjnej „hakerskiej" grafiki.
- **Polski kontekst:** BLIK jako dodatkowy mechanizm (rozszerzenie względem KM1 §8.1, oznaczone jako takie), scenariusz „oszustwo na BLIKa", NGate (przekaźnik NFC), Zastrzeż PESEL jako kontekst SIM-swap. Liczby (CERT Polska, PSP) tylko po weryfikacji w źródle pierwotnym.
- **Stack:** Vite + React + TypeScript, routing hash (GitHub Pages bez 404), Remotion do wideo z tych samych komponentów. Wersje z raportu okazały się prawdziwe (`motion` 14.14.0, `remotion` 4.0.545, `react` 19.3.1, `vite` 8.3.8).

## Odrzucamy

- **GSAP, Lenis, Tailwind, shadcn, Three.js/R3F w scenach.** Animacje scen muszą być czystą funkcją czasu (Remotion); dwa silniki animacji to dubel. Motion tylko do chromu aplikacji (panele, menu). Stylowanie: własne tokeny CSS. Three.js wraca tylko, jeśli konkretna scena realnie zyska na 3D.
- **Zmyślone repozytoria:** `jaredallard/clockwork`, `factor4/emv-tools`, `hartikainen/tiny-cpu` (404). `huangyingting/protocol` istnieje (3 gwiazdki), ale **nie** jest „implementacją referencyjną" Protocol Explorera.
- **Podejrzane publikacje z „Track F"** (Jannett 2026, Ramat 2026, Cattaneo „GRACE", Vykopal 2023, Warwick 2025, Bellini 2025) i liczby bez źródła („+34% retencji"). Nie cytujemy.
- **Tłumaczenie angielskich analogii „aha".** Piszemy własne, po polsku, sprawdzone merytorycznie.
- **Przesadzone tezy:** „phishing matematycznie niemożliwy" (passkey odpiera AitM dzięki powiązaniu z domeną, ale zostaje recovery, kradzież sesji, złośliwe oprogramowanie), „biometria = wektor 512D i odległość euklidesowa" (odcisk palca dopasowuje się po minucjach).
- **Runbook „Agent-Reach"** (Jina/X, rzekome tokeny). Niepotrzebny do celu.

## Sprawdzić przed użyciem

- **Tabele kroków protokołów (sekcja 4).** Szkic dobry, szczegóły do korekty względem specyfikacji: EMV (ARQC w odpowiedzi GPO w Visa qVSDC, w GENERATE AC w Mastercard), CTAP2 (licznik PIN: 8 prób, blokada do odłączenia po 3 kolejnych), BLIK (kto generuje kod: system BLIK na żądanie banku), push (number matching dotyczy logowania po haśle).
- **Publikacje spoza KM1.** Bonneau i in. (IEEE S&P 2012, DOI 10.1109/SP.2012.44), Lee i in. (SOUPS 2020, SIM swap), Zhou i in. „PrintListener" (NDSS 2024) są realne. Inne tylko po rozwiązaniu DOI.
- **Liczby z polskiego kontekstu** (103 449 incydentów CERT Polska 2024, ~2 mld transakcji BLIK rocznie). Weryfikacja w raporcie CERT Polska / komunikatach PSP przed wpisaniem do raportu.
- **Narzędzia:** `design-extract` (repo istnieje, 5,1k gwiazdek; paczka npm 0.1.0 może nie być tym samym), IconMCP, Context7 (`@upstash/context7-mcp`, nie `@context7/mcp-server`). Instalacja z limitem czasu; żadne nie blokuje aplikacji.

## Zasada cytowania

Matryca (KM2) i raport (KM4) opierają się na źródłach z `KM1-Baza-Zrodel.md` (identyfikatory N/S/P/A/R/W, linki zweryfikowane 08.11). Nowe źródło trafia do raportu dopiero po sprawdzeniu DOI/URL.
