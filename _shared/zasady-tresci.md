# Zasady treści

Obowiązują w danych (`03_content`), aplikacji, wideo i raporcie.

## Język i ton

- Polski, poprawne znaki diakrytyczne. Terminy angielskie tylko tam, gdzie są standardem (passkey, phishing, AitM, SIM-swap), przy pierwszym użyciu z objaśnieniem.
- Odbiorca podwójny: licealista na dniu otwartym (warstwa podpisów i analogii) i prowadzący (warstwa szczegółów, pola wiadomości, źródła). Podpis kroku ≤ 90 znaków, objaśnienie ≤ 3 zdania.
- Bez przesady i marketingu. „Odporny na phishing AitM" zamiast „niemożliwy do zhakowania". Każda metoda ma granice — pokazujemy je.
- Bez dekoracyjnej „hakerskiej" estetyki (czaszki, deszcz zer i jedynek). Atakujący to rola w protokole, nie postać z filmu.
- Analogie własne, sprawdzone merytorycznie. Nie tłumaczymy analogii z raportu Gemini.
- Nie wspominamy w treściach o sposobie wytworzenia projektu (narzędzia, asystenci).

## Cytowanie

- Każda ocena w matrycy ma uzasadnienie i co najmniej jeden identyfikator źródła z `KM1-Baza-Zrodel.md` (N1–N7, S1–S5, P1–P16, A1–A9, R1–R3, W1–W5).
- Nowe źródła spoza KM1 dodajemy do `03_content/data/sources.ts` z prefiksem `X` (np. X1) tylko po sprawdzeniu, że DOI/URL działa. Lista sprawdzonych: `01_research/output/ocena-researchu.md`.
- Liczby (statystyki, odsetki) tylko z podanym źródłem pierwotnym.

## Poprawność techniczna

- Przepływy upraszczamy, ale nie fałszujemy. Uproszczenie oznaczamy w objaśnieniu kroku („w uproszczeniu").
- Warianty zależne od implementacji (np. EMV Visa vs Mastercard) opisujemy jednym typowym przebiegiem i zaznaczamy, że to przykład.
- Dane przykładowe (kody, domeny, kwoty) są fikcyjne i nie mogą wskazywać prawdziwych serwisów: domena banku `bank.example` (zarezerwowana, RFC 2606), domena atakującego `bank.examp1e` (łudząco podobna, cyfra 1 zamiast l; taka domena nie może istnieć), użytkowniczka `ala`, kwota 150 zł.
