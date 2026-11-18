# Język wizualny: „Arkusz protokołu"

Każdy mechanizm uwierzytelniania pokazujemy jako **arkusz rysunku technicznego** — cyjanotypia (niebieska kopia rysunku inżynierskiego) z kredowo-białą kreską, izometryczne urządzenia, tabliczka rysunkowa w rogu. To słownictwo inżynierii, nie „hakerskiego" filmu. Inspiracja: Protocol Explorer (Dilum Sanjaya) — od niego bierzemy poziom czytelności, izometryczną kreskę i rytm animacji. Odróżniamy się kolorem (cyjanotypia zamiast niebieskiego atramentu na bieli), typografią (rodzina IBM Plex zamiast Iosevki), etykietami w zwykłej pisowni zamiast kapitalików i tabliczką rysunkową jako elementem rozpoznawczym.

## Kolor

Motyw ciemny „cyjanotypia" (domyślny: TV, rzutnik):

| Token | Hex | Rola |
|---|---|---|
| `--paper` | `#0F2D4D` | tło arkusza (błękit pruski) |
| `--paper-deep` | `#0A2139` | panele boczne, pasek czasu |
| `--ink` | `#E8F1FA` | kreska i tekst główny (kreda) |
| `--ink-soft` | `#9DB8D3` | kreska drugorzędna, opisy |
| `--grid` | `#1C4269` | siatka izometryczna |
| `--ok` | `#7EE2B8` | weryfikacja udana, podpis poprawny |
| `--warn` | `#FFC46B` | ostrożność, sekret w ruchu |
| `--attack` | `#FF7A6B` | atakujący, atak udany |

Motyw jasny „diazotypia" (`T` przełącza): papier `#F4F7FA`, tusz `#123A63`, kreska drugorzędna `#5B7A99`, siatka `#DCE5EE`, ok `#0F8A5F`, ostrożność `#B86E00`, atak `#C8372D`.

Zasada: kolor semantyczny tylko na tym, co zmienia stan (pakiet, wynik, aktor atakujący). Reszta jest monochromatyczna.

## Typografia

- **IBM Plex Sans** (400/500/600/700) — interfejs i tytuły. Wybrany po porównaniu z Archivo, Bricolage Grotesque i Anybody: najlepiej narysowane polskie znaki (ogonki, kreski, „ł”).
- **IBM Plex Sans Condensed** (500/600) — etykiety na scenie, nagłówki torów i kolumn matrycy (gęste miejsca).
- **IBM Plex Mono** (400/500/600) — dane protokołu: pola wiadomości, kody, domeny. Cyfry tabelaryczne.
- **Symbole** — podzbiór JetBrains Mono (OFL, `04_app/src/assets/fonts/`) jako zapas dla ✓ ✗ ≠ → ← ‖ ⌊ ⌋ ∈ ≤ ⁶; paczki fontów są przycięte do alfabetu, więc bez tego przeglądarka dobierała przypadkowe fonty systemowe.
- Skala modułowa: baza 16 px, stosunek 1,25 — 14 / 16 / 20 / 25–39 (tytuł, płynnie) / 39–61 (display, płynnie). Nic poniżej 14 px. Pisownia zdaniowa, `text-wrap: balance` w nagłówkach.

## Układ

```
┌──────────────────────────────────────────────────────────────┐
│ znak  Jak się logujemy?   [mechanizm ▾]   Ctrl+K   ?   ◐      │
├────────────┬────────────────────────────────────┬────────────┤
│ Kroki      │   arkusz: scena izometryczna       │ Ten krok   │
│ 1 ...      │   albo diagram sekwencji           │ wiadomość  │
│ 2 ... ◀    │                                    │ (pola)     │
│ 3 ...      │                     ┌ tabliczka ┐  │ Metoda     │
│ Warianty   │                     └───────────┘  │ (fakty)    │
├────────────┴────────────────────────────────────┴────────────┤
│ ◀ ▶ ⏯   ──●────┼────┼────┼────┼─── kroki na osi czasu    1×  │
└──────────────────────────────────────────────────────────────┘
```

Tekst wyrównany do lewej. Arkusz zajmuje co najmniej 60% szerokości. `D` chowa panele (sam arkusz), `F` pełny ekran, `L` lista kroków.

## Kreska i rysunek

- Izometria 30°, jedna grubość kreski głównej (1,5 px przy 1080p) i jedna drugorzędna (1 px). Wypełnienia: płaszczyzny ścian w tonie papieru rozjaśnionym o 4/8/12% (góra/lewa/prawa), żadnych gradientów.
- Urządzenia składane z brył (`isoBox`, `isoCylinder`) — spójne proporcje: laptop, telefon, serwer, baza, wieża BTS, karta, terminal, bank, klucz sprzętowy, chmura, osoba.
- Połączenia biegną wzdłuż osi siatki (łamane L), linia przerywana; aktywne połączenie rysuje się kreską (dashoffset).
- Pakiet = pigułka z etykietą w Plex Mono, przyklejona do linii (etykieta jedzie z pakietem — zasada ciągłości przestrzennej).
- Tabliczka rysunkowa: nazwa mechanizmu, nr arkusza (np. 5/10), czynniki (wiedza / posiadanie / cecha), wariant, skala „1:1 protokół".

## Ruch

- Wspólne tokeny (wnioski z design-extract, `design-extract-porownanie.md`): czasy 120/180/300/420 ms, przesuw wskaźników 550 ms; krzywe `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)` (wejścia, dojazdy), `--ease-in: cubic-bezier(0.5, 0, 0.75, 0)` (wyjścia), `--ease-move: cubic-bezier(0.4, 0, 0.2, 1)` (przewijanie czasu). Te same krzywe liczy silnik sceny (`engine/easing.ts`), więc działają też w wideo.
- Każda klatka sceny to czysta funkcja czasu. Krzywe: `easeInOutCubic` dla przelotu pakietu, sprężyna dla pojawiania się aktorów, smootherstep (zerowa prędkość i przyspieszenie na obu końcach) dla kamery.
- Tempo: krok o wadze 1 trwa 2,8 s / 0,6 ≈ 4,7 s (`PACE` w `engine/timeline.ts`); prędkości 0,5×, 1×, 1,5×, 2×. W pokazie krok trwa co najmniej tyle, ile czytanie podpisu (1,6 s + 1 s na 14 znaków).
- Ujęcie otwierające (3,4 s): kamera zaczyna od zbliżenia na pierwsze urządzenie (tylko ono jest widoczne), trzyma je 0,7 s, potem odjeżdża do planu ogólnego (do 3,0 s); pozostali aktorzy, trasy i żetony pojawiają się, gdy wchodzą w kadr.
- Przejścia między krokami: krok naprzód odtwarza krok, krok wstecz i skok o wiele kroków szybko przewijają czas przez stany pośrednie (420–1100 ms). Kamera to viewBox (zawsze ostry wektor); w aplikacji dojeżdża do kadru sprężyną krytycznie tłumioną (ω = 6,5), więc płynie także przy skokach, przewijaniu i zmianie rozmiaru. W wideo sprężyna jest wyłączona.
- Rytm kroku: kamera przejeżdża w pierwszej połowie kroku, zbliżenie zmienia się logarytmicznie (stałe odczucie tempa), kreska połączenia się rysuje (0,06–0,34), pakiet leci (0,3–0,76), odbiór: pierścień fali + zmiana stanu aktora (0,72–1). Płynność pilnuje test `camera.test.ts` (próbkowanie 60 Hz, bez skoków prędkości).
- Sekwencja: wiadomości opadają w czasie (zapytanie w prawo-w dół, odpowiedź w lewo-w dół — zygzak), grot obraca się do kąta strzałki, widoczne są tylko rozpoczęte kroki; nagłówek torów jest nieprzezroczysty, treść chowa się pod nim z wygaszeniem; po ostatnim kroku cały przebieg ściska się nad werdyktem.
- Autoodtwarzanie explorera: domyślnie włączone; pauza, krok ręczny albo przewijanie je wyłącza. Pytanie „Jak myślisz?” czeka 30 s, ekran końca 20 s (werdykt) lub 10 s, potem następny arkusz w kolejności całej aplikacji.
- Detale: kursor-kłódka (czerwona zamknięta, nad elementem klikalnym zielona otwarta), oddychające logo z zielonym znacznikiem na krawędzi, pieczątka werdyktu, podświetlanie uczestników kroku z listy, podpowiedź kroku nad osią czasu, licznik rankingu, „deszyfrowanie” nazwy mechanizmu w tabliczce.
- Autoskalowanie: baza rem = min(0,833vw; 1,48vh), ograniczona do 10–18 px (1920×1080 = 16 px); wymiary układu w rem. Od 1280×800 do 1920×1080 żaden panel się nie przewija.
- Atak: tor atakującego odchodzi od legalnego czerwoną kreską; wynik „zablokowano" = rysowany krzyżyk na pakiecie i krótkie, wygaszane drżenie (≤ 2 Hz), „udany atak" = przejęty żeton przelatuje do atakującego.
- `prefers-reduced-motion`: przejścia zamieniane na przenikanie, kamera bez jazdy.
- Ruch w chromie aplikacji (panele, menu) tylko w odpowiedzi na działanie użytkownika.
