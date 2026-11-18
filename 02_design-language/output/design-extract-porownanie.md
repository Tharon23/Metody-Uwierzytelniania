# design-extract: Protocol Explorer a „Jak się logujemy?”

Pomiar narzędziem designlang 13.4.1 (`npx designlang <url> --interactions --motion-runtime`), 18.11.2026, viewport 1920×1080. Surowe wyniki nie trafiły do repo (są pochodną cudzej strony); poniżej wnioski.

| Obszar | Protocol Explorer | Nasza aplikacja (przed poprawkami) |
|---|---|---|
| Wynik systemu | 81/100 | 87/100 |
| Kontrast WCAG | 76% (4 pary poniżej AA) | 100% |
| Kolor | jeden tusz `#0032a0` na `#fdfdfe` + akcenty semantyczne (zieleń, morski, bursztyn, fiolet) | jeden tusz na cyjanotypii + 3 kolory semantyczne |
| Typografia | Iosevka (mono) wszędzie, nagłówki 800, skala 1,067 | Archivo + IBM Plex Mono, skala 1,067, 2 rozmiary płynne |
| Ruch interfejsu | spójny: krzywa `cubic-bezier(0.16, 1, 0.3, 1)` (328 użyć), wyjścia `cubic-bezier(0.5, 0, 0.75, 0)`, czasy 120/180/300/420 ms, przesuwany wskaźnik zakładek (0,55 s), wejście kroku `step-in` | „mixed”: jedna animacja (`rise`), przejścia bez wspólnych czasów i krzywych |
| Głębia | miękkie cienie w odcieniu tuszu (`0 12px 32px` i `0 24px 64px`), obrys wewnętrzny 2,2 px | pojedynczy czarny cień |
| Połączenia na scenie | dwa równoległe tory przerywane, strzałki w obu kierunkach | jedna linia kropkowana |
| Detale urządzeń | zawartość ekranów, diody, dwie grubości kreski | bryły z liniami detali |

## Co bierzemy (bez kopiowania wyglądu)

1. **System ruchu interfejsu**: tokeny `--dur-xs/sm/md/lg` (120/180/300/420 ms) i krzywe `--ease-out` (wykładnicza), `--ease-in`, `--ease-move`; przesuwane wskaźniki w zakładkach i przełącznikach; wejście treści kroku w panelu.
2. **Krzywa wykładnicza w scenie**: dojazd kamery i rysowanie linii z tą samą krzywą co interfejs (szybki start, miękkie wyhamowanie) — liczona deterministycznie w silniku, więc działa też w wideo.
3. **Głębia w odcieniu tuszu**: dwa poziomy cienia dla elementów pływających (pytanie, werdykt, nakładki, dymki).
4. **Dwukierunkowe tory połączeń**: każda para aktorów ma dwa równoległe tory; pakiet jedzie torem swojego kierunku, co od razu pokazuje, kto do kogo mówi.
5. **Detale ekranów**: zawartość ekranu laptopa i telefonu (pasek adresu, bloki treści), żeby urządzenia czytały się z daleka.

## Czego nie bierzemy

Iosevki, białego tła jako domyślnego, kapitalików z rozstrzeleniem i układu nagłówków 1:1 — to elementy tożsamości Protocol Explorera. Nasza tożsamość (cyjanotypia, Archivo, tabliczka rysunkowa) zostaje.
