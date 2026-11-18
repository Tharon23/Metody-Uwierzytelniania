# Figury raportu

Zrzuty 1920×1080 z aplikacji (`npm --prefix 04_app run dev`), jasny motyw, czas zamrożony parametrem `t`:

| Plik | Adres |
|---|---|
| `explorer-passkey.png` | `#/m/passkey/phishing?t=20.9&motyw=light` |
| `explorer-totp.png` | `#/m/totp?t=17.1&motyw=light` |
| `sekwencja-relay.png` | `#/m/karta/relay?t=999&motyw=light&widok=sekwencja` |
| `porownanie.png` | `#/porownanie?motyw=light` |
| `pokaz-pytanie.png` | `#/autoplay?stop&t=62.3&motyw=light` |
| `pokaz-werdykt.png` | `#/autoplay?stop&t=110&motyw=light` |

Parametr `motyw` działa przy pierwszym wczytaniu strony (przeładuj kartę po zmianie adresu). Czasy dla tempa `PACE = 0,6` (sesja 3); po zmianie tempa przelicz je (`npx tsx scripts/show-times.ts` dla pokazu).
