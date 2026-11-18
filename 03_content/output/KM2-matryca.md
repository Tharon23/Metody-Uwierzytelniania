# KM2 — Analiza porównawcza i matryca zagrożeń

**Projekt:** Analiza porównawcza mechanizmów uwierzytelniania · **Przedmiot:** Bezpieczne Transakcje Elektroniczne
**Kamień milowy:** KM2 (13.12) · Dokument generowany z `03_content/data/matrix.ts` (`npm --prefix 04_app run gen:km2`).

## 1. Metodyka

Każdy z 10 mechanizmów oceniono w skali **1–5** (5 = najkorzystniej dla bezpieczeństwa i użytkownika) w 18 kryteriach z KM1 §8.2. Każda ocena ma jednozdaniowe uzasadnienie i co najmniej jedno źródło z bazy KM1 (identyfikatory N/S/P/A/R/W) albo źródło uzupełniające (X), sprawdzone przed użyciem. Kryteria D1–D3 mają oprócz oceny wartość opisową (np. „AAL2”, „tak”).

Wynik zbiorczy dla relacji B2B / B2C / C2C to średnia ważona średnich grup kryteriów. Wagi:

| Profil | Bezpieczeństwo (A) | Wdrażalność (B) | UX (C) | Zgodność (D) | Uzasadnienie |
|---|---|---|---|---|---|
| Firma (B2B) | 45% | 20% | 10% | 25% | Pracownicy i partnerzy biznesowi: bezpieczeństwo i zgodność przed wygodą. |
| Klient (B2C) | 35% | 15% | 35% | 15% | Klienci banków i sklepów: bezpieczeństwo i wygoda w równowadze. |
| Między ludźmi (C2C) | 25% | 25% | 40% | 10% | Płatności i usługi między osobami: wygoda i koszt na pierwszym miejscu. |

BLIK nie występuje w KM1 §8.1 — dodano go jako rozszerzenie o polski kontekst płatności.

## 2. Kryteria

| Id | Grupa | Kryterium | Opis |
|---|---|---|---|
| A1 | Bezpieczeństwo | Phishing / AitM | Odporność na fałszywą stronę i pośrednika w czasie rzeczywistym (adversary-in-the-middle). |
| A2 | Bezpieczeństwo | Przechwycenie kanału | Odporność na podsłuch lub przechwycenie kanału przesyłu (MitM, sieć telekomunikacyjna). |
| A3 | Bezpieczeństwo | Powtórzenie | Odporność na ponowne użycie przechwyconego dowodu (replay). |
| A4 | Bezpieczeństwo | SIM-swap | Odporność na przejęcie numeru telefonu lub kanału telekomunikacyjnego. |
| A5 | Bezpieczeństwo | Socjotechnika | Odporność na manipulację użytkownikiem, w tym zmęczenie powiadomieniami (MFA fatigue). |
| A6 | Bezpieczeństwo | Wyciek z serwera | Skutki wycieku bazy poświadczeń po stronie serwera. |
| A7 | Bezpieczeństwo | Utrata urządzenia | Odporność na kradzież lub przejęcie urządzenia użytkownika. |
| B1 | Uniwersalność i wdrażalność | Koszt | Koszt wdrożenia: infrastruktura, sprzęt, opłaty za wiadomości (5 = tanio). |
| B2 | Uniwersalność i wdrażalność | Interoperacyjność | Wsparcie platform, przeglądarek, urządzeń i krajów. |
| B3 | Uniwersalność i wdrażalność | Skalowalność | Łatwość objęcia milionów użytkowników (logistyka, operacje). |
| C1 | Funkcjonalność (UX) | Tarcie | Liczba kroków i wysiłek przy każdym logowaniu (5 = najmniej). |
| C2 | Funkcjonalność (UX) | Czas | Czas uwierzytelnienia (5 = najkrócej). |
| C3 | Funkcjonalność (UX) | Dostępność i odzyskiwanie | Dostępność dla różnych osób i łatwość odzyskania dostępu po utracie. |
| C4 | Funkcjonalność (UX) | Znajomość | Krzywa uczenia i powszechność metody wśród użytkowników. |
| D1 | Zgodność i dopasowanie | NIST AAL | Najwyższy osiągalny poziom pewności wg NIST SP 800-63B-4: AAL3 = 5; AAL2 albo AAL3 zależnie od wariantu = 4; AAL2 = 3; AAL2 „restricted”, AAL1 lub metoda niedopuszczona samodzielnie = 2; metody płatnicze poza klasyfikacją NIST = 3 (neutralnie). |
| D2 | Zgodność i dopasowanie | PSD2 SCA | Spełnienie silnego uwierzytelniania klienta (PSD2 RTS): tak, z dynamicznym powiązaniem z transakcją = 5; tak, ale tylko z dodatkowym elementem lub rozszerzeniem = 4; częściowo = 3; nie = 1. |
| D3 | Zgodność i dopasowanie | Odporność na phishing | Status „phishing-resistant” (tak = 5, częściowo = 3, nie = 1). |
| D4 | Zgodność i dopasowanie | Dopasowanie B2B/B2C/C2C | Jak dobrze metoda pasuje do typowych relacji transakcyjnych. |

## 3. Matryca (oceny 1–5)

| Mechanizm | A1 | A2 | A3 | A4 | A5 | A6 | A7 | B1 | B2 | B3 | C1 | C2 | C3 | C4 | D1 | D2 | D3 | D4 | Ø A | Ø B | Ø C | Ø D |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Hasło | 1 | 3 | 1 | 4 | 1 | 2 | 4 | 5 | 5 | 5 | 4 | 4 | 4 | 5 | 2 | 1 | 1 | 2 | 2,29 | 5,00 | 4,25 | 1,50 |
| SMS OTP | 1 | 2 | 4 | 1 | 2 | 4 | 2 | 3 | 5 | 3 | 2 | 2 | 4 | 5 | 2 | 4 | 1 | 2 | 2,29 | 3,67 | 3,25 | 2,25 |
| TOTP (aplikacja) | 1 | 4 | 4 | 5 | 2 | 2 | 3 | 5 | 4 | 5 | 2 | 3 | 2 | 3 | 3 | 3 | 1 | 3 | 3,00 | 4,67 | 2,50 | 2,50 |
| Push + number matching | 2 | 4 | 5 | 4 | 3 | 5 | 4 | 3 | 2 | 4 | 3 | 3 | 3 | 4 | 3 | 5 | 1 | 4 | 3,86 | 3,00 | 3,25 | 3,25 |
| Klucz sprzętowy FIDO2 | 5 | 5 | 5 | 5 | 4 | 5 | 4 | 1 | 4 | 2 | 3 | 3 | 2 | 2 | 5 | 4 | 5 | 4 | 4,71 | 2,33 | 2,50 | 4,50 |
| Passkey | 5 | 5 | 5 | 4 | 4 | 5 | 4 | 4 | 4 | 5 | 5 | 5 | 4 | 3 | 4 | 4 | 5 | 5 | 4,57 | 4,33 | 4,25 | 4,50 |
| Biometria | 4 | 5 | 3 | 5 | 4 | 5 | 4 | 4 | 3 | 4 | 5 | 5 | 3 | 5 | 2 | 3 | 3 | 4 | 4,29 | 3,67 | 4,50 | 3,00 |
| Karta płatnicza | 3 | 3 | 3 | 5 | 3 | 3 | 2 | 2 | 5 | 4 | 5 | 5 | 4 | 5 | 3 | 3 | 3 | 4 | 3,14 | 3,67 | 4,75 | 3,25 |
| MFA i ocena ryzyka | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 2 | 2 | 2 | 3 | 4 | 5 | 3 | 5 | 3,57 | 3,33 | 2,25 | 4,25 |
| BLIK | 3 | 4 | 5 | 4 | 2 | 5 | 4 | 3 | 2 | 4 | 4 | 4 | 3 | 5 | 3 | 5 | 3 | 4 | 3,86 | 3,00 | 4,00 | 3,75 |

## 4. Matryca zagrożeń (grupa A) — skrót

Oceny odporności na wektory ataków; 1 = atak zwykle się udaje, 5 = mechanizm go blokuje.

| Mechanizm | A1 Phishing / AitM | A2 Przechwycenie kanału | A3 Powtórzenie | A4 SIM-swap | A5 Socjotechnika | A6 Wyciek z serwera | A7 Utrata urządzenia |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Hasło | 1 | 3 | 1 | 4 | 1 | 2 | 4 |
| SMS OTP | 1 | 2 | 4 | 1 | 2 | 4 | 2 |
| TOTP (aplikacja) | 1 | 4 | 4 | 5 | 2 | 2 | 3 |
| Push + number matching | 2 | 4 | 5 | 4 | 3 | 5 | 4 |
| Klucz sprzętowy FIDO2 | 5 | 5 | 5 | 5 | 4 | 5 | 4 |
| Passkey | 5 | 5 | 5 | 4 | 4 | 5 | 4 |
| Biometria | 4 | 5 | 3 | 5 | 4 | 5 | 4 |
| Karta płatnicza | 3 | 3 | 3 | 5 | 3 | 3 | 2 |
| MFA i ocena ryzyka | 3 | 4 | 4 | 3 | 3 | 4 | 4 |
| BLIK | 3 | 4 | 5 | 4 | 2 | 5 | 4 |

## 5. Ranking ważony

### Firma (B2B)

| # | Mechanizm | Wynik | Dopasowanie (D4) |
|---|---|:-:|---|
| 1 | Passkey | 4,47 | B2C, B2B |
| 2 | Klucz sprzętowy FIDO2 | 3,96 | B2B |
| 3 | Biometria | 3,86 | B2C |
| 4 | BLIK | 3,67 | C2C, B2C (PL) |
| 5 | MFA i ocena ryzyka | 3,56 | B2B, B2C |
| 6 | Push + number matching | 3,47 | B2B, B2C |
| 7 | Karta płatnicza | 3,44 | B2C |
| 8 | TOTP (aplikacja) | 3,16 | B2B, B2C |
| 9 | Hasło | 2,83 | baza dla B2B/B2C/C2C |
| 10 | SMS OTP | 2,65 | B2C (przejściowo) |

### Klient (B2C)

| # | Mechanizm | Wynik | Dopasowanie (D4) |
|---|---|:-:|---|
| 1 | Passkey | 4,41 | B2C, B2B |
| 2 | Biometria | 4,08 | B2C |
| 3 | Karta płatnicza | 3,80 | B2C |
| 4 | BLIK | 3,76 | C2C, B2C (PL) |
| 5 | Klucz sprzętowy FIDO2 | 3,55 | B2B |
| 6 | Push + number matching | 3,42 | B2B, B2C |
| 7 | Hasło | 3,26 | baza dla B2B/B2C/C2C |
| 8 | MFA i ocena ryzyka | 3,17 | B2B, B2C |
| 9 | TOTP (aplikacja) | 3,00 | B2B, B2C |
| 10 | SMS OTP | 2,82 | B2C (przejściowo) |

### Między ludźmi (C2C)

| # | Mechanizm | Wynik | Dopasowanie (D4) |
|---|---|:-:|---|
| 1 | Passkey | 4,38 | B2C, B2B |
| 2 | Biometria | 4,09 | B2C |
| 3 | Karta płatnicza | 3,93 | B2C |
| 4 | BLIK | 3,69 | C2C, B2C (PL) |
| 5 | Hasło | 3,67 | baza dla B2B/B2C/C2C |
| 6 | Push + number matching | 3,34 | B2B, B2C |
| 7 | Klucz sprzętowy FIDO2 | 3,21 | B2B |
| 8 | TOTP (aplikacja) | 3,17 | B2B, B2C |
| 9 | MFA i ocena ryzyka | 3,05 | B2B, B2C |
| 10 | SMS OTP | 3,01 | B2C (przejściowo) |

Ranking to średnia ważona. Wysoka pozycja BLIK-u czy biometrii w profilu B2B nie oznacza, że służą do logowania pracowników — o zastosowaniu mówią kolumna D4 i rozdział 7.

## 6. Uzasadnienia ocen

### 1. Hasło

Sekret, który znasz Ty i który serwer potrafi sprawdzić, nie przechowując go wprost.

| Kryterium | Ocena | Uzasadnienie | Źródła |
|---|:-:|---|---|
| A1 Phishing / AitM | 1 | Hasło działa na każdej stronie, na której zostanie wpisane; pośrednik przekazuje je bez przeszkód. | A1, P6 |
| A2 Przechwycenie kanału | 3 | TLS chroni hasło w drodze, ale po stronie serwera jest ono przez chwilę jawne. | N1, N4 |
| A3 Powtórzenie | 1 | Przechwycone hasło działa wielokrotnie aż do zmiany. | P6, X1 |
| A4 SIM-swap | 4 | Nie zależy od numeru telefonu, o ile reset hasła nie idzie przez SMS. | N1, P11 |
| A5 Socjotechnika | 1 | Hasło można po prostu wyłudzić lub podyktować. | N5, P6 |
| A6 Wyciek z serwera | 2 | Sól i Argon2id spowalniają łamanie, ale słabe i powtarzane hasła padają po wycieku. | X3, X4 |
| A7 Utrata urządzenia | 4 | Nie jest związane z urządzeniem; ryzyko tylko przy hasłach zapisanych bez blokady. | N1 |
| B1 Koszt | 5 | Brak sprzętu i opłat; standard każdego frameworka. | X1, P7 |
| B2 Interoperacyjność | 5 | Działa wszędzie, na każdym urządzeniu. | X1 |
| B3 Skalowalność | 5 | Skaluje się bez logistyki; koszty to głównie obsługa resetów. | X1 |
| C1 Tarcie | 4 | Jeden krok, ale wymaga pamiętania lub menedżera haseł. | P8, X1 |
| C2 Czas | 4 | Kilka sekund z menedżerem haseł, dłużej bez niego. | P1 |
| C3 Dostępność i odzyskiwanie | 4 | Łatwe odzyskanie przez e-mail, choć sam reset bywa słabym punktem. | P11 |
| C4 Znajomość | 5 | Najlepiej znana metoda. | P8, X1 |
| D1 NIST AAL | AAL1 (2) | Samo hasło to AAL1. | N1 |
| D2 PSD2 SCA | nie (1) | Jeden element (wiedza) — nie spełnia SCA. | N3 |
| D3 Odporność na phishing | nie (1) | Nie jest odporne na phishing. | N1, P6 |
| D4 Dopasowanie B2B/B2C/C2C | baza dla B2B/B2C/C2C (2) | Wszędzie jako baza, ale nie jako jedyny składnik przy transakcjach. | N3, N4 |

### 2. SMS OTP

Jednorazowy kod wysyłany SMS-em na numer telefonu, wpisywany po haśle.

| Kryterium | Ocena | Uzasadnienie | Źródła |
|---|:-:|---|---|
| A1 Phishing / AitM | 1 | Pośrednik przekazuje kod w czasie jego ważności. | A1, A3 |
| A2 Przechwycenie kanału | 2 | SMS nie jest szyfrowany end-to-end; możliwe przechwycenie w sieci (SS7) lub przez złośliwe aplikacje. | A3, N1 |
| A3 Powtórzenie | 4 | Kod jednorazowy i krótko ważny. | N1, P7 |
| A4 SIM-swap | 1 | Przejęcie numeru (SIM-swap) daje dostęp do kodów. | X2, A3, X8 |
| A5 Socjotechnika | 2 | Kod łatwo podyktować „pracownikowi banku”. | A3, P9 |
| A6 Wyciek z serwera | 4 | Serwer przechowuje tylko numer telefonu; kody są ulotne. | N1 |
| A7 Utrata urządzenia | 2 | Kod często widać na zablokowanym ekranie. | A3 |
| B1 Koszt | 3 | Opłaty za każdą wiadomość, rosnące przy ruchu międzynarodowym. | P7, A3 |
| B2 Interoperacyjność | 5 | Działa na każdym telefonie komórkowym. | P7, P8 |
| B3 Skalowalność | 3 | Zależność od operatorów i opóźnień doręczenia. | P7 |
| C1 Tarcie | 2 | Oczekiwanie na SMS i przepisywanie kodu. | P8, P12 |
| C2 Czas | 2 | Kilkanaście sekund do minut, zależnie od doręczenia. | P8 |
| C3 Dostępność i odzyskiwanie | 4 | Nie wymaga smartfona; łatwa zmiana numeru. | P7, P9 |
| C4 Znajomość | 5 | Bardzo dobrze znana metoda. | P8, P9 |
| D1 NIST AAL | AAL2 (restricted) (2) | AAL2, ale NIST oznacza ją jako „restricted”. | N1 |
| D2 PSD2 SCA | tak (z hasłem) (4) | Z hasłem spełnia SCA; kwota może być w treści SMS. | N3 |
| D3 Odporność na phishing | nie (1) | Nie jest odporny na phishing. | N1, A1 |
| D4 Dopasowanie B2B/B2C/C2C | B2C (przejściowo) (2) | B2C przejściowo; odchodzi się od niego w bankowości. | N1, R2 |

### 3. TOTP (aplikacja)

Kod liczony co 30 sekund z czasu i sekretu, który znają tylko aplikacja i serwer (RFC 6238).

| Kryterium | Ocena | Uzasadnienie | Źródła |
|---|:-:|---|---|
| A1 Phishing / AitM | 1 | Kod jest ważny ok. 30–90 s; pośrednik zdąży go użyć. | A1, S3 |
| A2 Przechwycenie kanału | 4 | Sekret nie krąży po sieci po rejestracji; kod idzie przez TLS. | S3, N1 |
| A3 Powtórzenie | 4 | Kod ważny tylko w oknie czasowym; poprawna implementacja odrzuca ponowne użycie. | S3, S4 |
| A4 SIM-swap | 5 | Nie zależy od numeru telefonu. | S3, P7 |
| A5 Socjotechnika | 2 | Kod można podyktować oszustowi. | P9, A1 |
| A6 Wyciek z serwera | 2 | Serwer przechowuje wspólny sekret; jego wyciek pozwala liczyć kody. | S3, N1 |
| A7 Utrata urządzenia | 3 | Aplikacja często nie ma osobnej blokady. | N4 |
| B1 Koszt | 5 | Darmowe aplikacje, otwarty standard. | S3, P7 |
| B2 Interoperacyjność | 4 | Standard RFC obsługiwany przez wiele aplikacji. | S3 |
| B3 Skalowalność | 5 | Brak opłat za wiadomości i zależności od operatora. | S3 |
| C1 Tarcie | 2 | Otwarcie aplikacji i przepisanie kodu. | P8, P4 |
| C2 Czas | 3 | Kilka do kilkunastu sekund. | P8 |
| C3 Dostępność i odzyskiwanie | 2 | Utrata telefonu bez kopii sekretu blokuje dostęp. | P11 |
| C4 Znajomość | 3 | Mniej znana niż SMS. | P8, P9 |
| D1 NIST AAL | AAL2 (3) | AAL2. | N1 |
| D2 PSD2 SCA | częściowo (3) | Z hasłem spełnia SCA przy logowaniu; brak powiązania z kwotą transakcji. | N3 |
| D3 Odporność na phishing | nie (1) | Nie jest odporny na phishing. | N1, A1 |
| D4 Dopasowanie B2B/B2C/C2C | B2B, B2C (3) | B2B i B2C jako drugi składnik. | N4, P7 |

### 4. Push + number matching

Powiadomienie w aplikacji na telefonie; w wersji z dopasowaniem liczby trzeba wpisać liczbę widoczną na ekranie logowania.

| Kryterium | Ocena | Uzasadnienie | Źródła |
|---|:-:|---|---|
| A1 Phishing / AitM | 2 | Dopasowanie liczby nie blokuje pośrednika, który pokazuje ofierze prawdziwą liczbę. | A1, X5 |
| A2 Przechwycenie kanału | 4 | Kanał TLS, odpowiedź podpisana kluczem urządzenia. | X9, P10 |
| A3 Powtórzenie | 5 | Każde potwierdzenie dotyczy jednej próby logowania. | X9 |
| A4 SIM-swap | 4 | Nie zależy od SMS, chyba że aktywacja na nowym telefonie idzie przez SMS. | P11, X5 |
| A5 Socjotechnika | 3 | Dopasowanie liczby zatrzymuje push bombing; zostaje socjotechnika przez telefon. | A2, X5, X9 |
| A6 Wyciek z serwera | 5 | Serwer zna tylko klucz publiczny urządzenia. | X9 |
| A7 Utrata urządzenia | 4 | Aplikacja chroniona PIN-em lub biometrią. | P10 |
| B1 Koszt | 3 | Wymaga własnej aplikacji albo dostawcy tożsamości. | P7, P10 |
| B2 Interoperacyjność | 2 | Zależy od aplikacji konkretnego dostawcy. | P10 |
| B3 Skalowalność | 4 | Dobrze skaluje się w firmach i bankach z aplikacją. | P10 |
| C1 Tarcie | 3 | Dopasowanie liczby dodaje krok, ale bez przepisywania długiego kodu. | X5, X9 |
| C2 Czas | 3 | Kilka sekund, zależnie od dostarczenia powiadomienia. | X9 |
| C3 Dostępność i odzyskiwanie | 3 | Wymaga smartfona; zmiana telefonu wymaga ponownej aktywacji. | P11 |
| C4 Znajomość | 4 | Powszechne w bankowości mobilnej. | P9 |
| D1 NIST AAL | AAL2 (3) | AAL2. | N1 |
| D2 PSD2 SCA | tak (5) | Spełnia SCA, w aplikacji można pokazać kwotę i odbiorcę. | N3 |
| D3 Odporność na phishing | nie (1) | Nie jest odporny na phishing AitM. | N1, X5 |
| D4 Dopasowanie B2B/B2C/C2C | B2B, B2C (4) | B2B (pracownicy) i B2C (banki). | P10, X9 |

### 5. Klucz sprzętowy FIDO2

Osobne urządzenie (USB/NFC) z kluczem prywatnym, którego nie da się z niego wyjąć; podpisuje logowanie po PIN-ie i dotyku.

| Kryterium | Ocena | Uzasadnienie | Źródła |
|---|:-:|---|---|
| A1 Phishing / AitM | 5 | Podpis związany z domeną; przeglądarka egzekwuje origin. | S1, A1, P6 |
| A2 Przechwycenie kanału | 5 | Kanał niczego nie zdradza: podpis jest jednorazowy i związany z domeną. | S1, S2 |
| A3 Powtórzenie | 5 | Wyzwanie serwera i licznik podpisów uniemożliwiają powtórzenie. | S1, S2 |
| A4 SIM-swap | 5 | Nie zależy od telefonu. | P6 |
| A5 Socjotechnika | 4 | Nie ma kodu do podyktowania; zostaje wyłudzenie rejestracji lub odzyskiwania. | P6, P11 |
| A6 Wyciek z serwera | 5 | Serwer przechowuje tylko klucze publiczne. | P6, S1 |
| A7 Utrata urządzenia | 4 | Klucz bez PIN-u jest bezużyteczny; blokada po 8 próbach. | S2 |
| B1 Koszt | 1 | Zakup sprzętu dla każdego użytkownika, zwykle dwóch sztuk. | P3, P7 |
| B2 Interoperacyjność | 4 | WebAuthn w głównych przeglądarkach; wymaga USB/NFC. | S1, P2 |
| B3 Skalowalność | 2 | Logistyka dystrybucji i wymiany kluczy. | P3 |
| C1 Tarcie | 3 | Podłączenie, PIN i dotyk. | P1, P2 |
| C2 Czas | 3 | Kilka sekund; szybsze bez PIN-u. | P1 |
| C3 Dostępność i odzyskiwanie | 2 | Zgubiony klucz wymaga zapasowego klucza lub procedury odzyskiwania. | P3, P11 |
| C4 Znajomość | 2 | Użytkownicy słabo rozumieją przewagę klucza nad innymi metodami. | P3, P1 |
| D1 NIST AAL | AAL3 (5) | AAL3 przy certyfikowanym sprzęcie. | N1 |
| D2 PSD2 SCA | tak (bez powiązania z kwotą) (4) | Posiadanie + wiedza; powiązanie z transakcją wymaga dodatkowego rozszerzenia. | N3, S1 |
| D3 Odporność na phishing | tak (5) | Odporny na phishing. | N1, P6 |
| D4 Dopasowanie B2B/B2C/C2C | B2B (4) | Przede wszystkim B2B i konta uprzywilejowane. | P3, R2 |

### 6. Passkey

Para kluczy kryptograficznych przypisana do jednej domeny; odblokowujesz ją palcem, twarzą albo PIN-em urządzenia.

| Kryterium | Ocena | Uzasadnienie | Źródła |
|---|:-:|---|---|
| A1 Phishing / AitM | 5 | Podpis związany z domeną; fałszywa strona nie dostanie ważnego podpisu. | S1, P6, A1 |
| A2 Przechwycenie kanału | 5 | Podpis jednorazowy; synchronizacja kluczy szyfrowana end-to-end. | S1, P5 |
| A3 Powtórzenie | 5 | Wyzwanie serwera wyklucza powtórzenie. | S1 |
| A4 SIM-swap | 4 | Odzyskanie konta chmurowego bywa oparte na SMS. | P5, P11 |
| A5 Socjotechnika | 4 | Brak kodu do podyktowania; ryzyko przy odzyskiwaniu konta. | P4, P11 |
| A6 Wyciek z serwera | 5 | Serwer przechowuje tylko klucze publiczne. | S1, P6 |
| A7 Utrata urządzenia | 4 | Użycie wymaga odblokowania urządzenia. | S1, P5 |
| B1 Koszt | 4 | Wbudowane w systemy; koszt to praca wdrożeniowa. | P4, R2 |
| B2 Interoperacyjność | 4 | Wspierane przez główne platformy, choć ekosystemy synchronizacji są rozłączne. | P4, P5, W4 |
| B3 Skalowalność | 5 | Brak sprzętu do dystrybucji. | R2, P4 |
| C1 Tarcie | 5 | Jeden gest: palec, twarz albo PIN urządzenia. | P4, P1 |
| C2 Czas | 5 | Najkrótsze logowanie spośród badanych metod. | P4, R2 |
| C3 Dostępność i odzyskiwanie | 4 | Synchronizacja ułatwia odzyskanie; wersja związana z urządzeniem trudniejsza. | P5 |
| C4 Znajomość | 3 | Znajomość rośnie (57% w 2024 r.), ale nadal ograniczona. | R1, R2 |
| D1 NIST AAL | AAL2/AAL3 (4) | AAL2 (synchronizowany), AAL3 (związany z urządzeniem). | N1 |
| D2 PSD2 SCA | tak (bez powiązania z kwotą) (4) | Posiadanie + cecha lub wiedza; powiązanie z kwotą wymaga dodatkowego rozszerzenia. | N3, S1 |
| D3 Odporność na phishing | tak (5) | Odporny na phishing. | N1, P6 |
| D4 Dopasowanie B2B/B2C/C2C | B2C, B2B (5) | B2C (synchronizowane) i B2B (związane z urządzeniem). | R2, P5 |

### 7. Biometria

Odcisk palca albo twarz sprawdzane lokalnie w urządzeniu; zgodność odblokowuje klucz, który podpisuje logowanie.

| Kryterium | Ocena | Uzasadnienie | Źródła |
|---|:-:|---|---|
| A1 Phishing / AitM | 4 | Brak sekretu do wpisania; odporność zależy od odblokowywanego uwierzytelniacza. | S1, N1 |
| A2 Przechwycenie kanału | 5 | Wzorzec nie opuszcza urządzenia. | N1, P13 |
| A3 Powtórzenie | 3 | Słabe czujniki można oszukać nagraną próbką; pomaga challenge-response. | P16, P13 |
| A4 SIM-swap | 5 | Niezależna od telefonu jako numeru. | N1 |
| A5 Socjotechnika | 4 | Trudno ją „podyktować”; możliwe wymuszenie fizyczne. | P13 |
| A6 Wyciek z serwera | 5 | Wzorzec przechowywany lokalnie, nie na serwerze. | N1, S1 |
| A7 Utrata urządzenia | 4 | Test żywotności i limit prób, potem PIN. | P14, N6 |
| B1 Koszt | 4 | Czytniki wbudowane w telefony i laptopy. | P15 |
| B2 Interoperacyjność | 3 | Zależy od urządzenia i czujnika. | P13, P2 |
| B3 Skalowalność | 4 | Skaluje się z urządzeniami użytkowników. | P15 |
| C1 Tarcie | 5 | Jeden gest. | P15, P2 |
| C2 Czas | 5 | Ułamek sekundy. | P15 |
| C3 Dostępność i odzyskiwanie | 3 | Nie dla każdego (np. starte linie papilarne); potrzebny PIN zapasowy. | P15, P13 |
| C4 Znajomość | 5 | Powszechna w telefonach. | P15 |
| D1 NIST AAL | n/d samodzielnie (2) | Według NIST tylko w połączeniu z fizycznym uwierzytelniaczem. | N1 |
| D2 PSD2 SCA | częściowo (3) | Element „cecha”; potrzebny drugi element. | N3 |
| D3 Odporność na phishing | częściowo (3) | Zależy od uwierzytelniacza, który odblokowuje. | N1 |
| D4 Dopasowanie B2B/B2C/C2C | B2C (4) | B2C jako odblokowanie passkeya i aplikacji. | P15, R2 |

### 8. Karta płatnicza

Chip EMV liczy przy każdej transakcji jednorazowy kryptogram; pasek magnetyczny powtarza wciąż te same dane.

| Kryterium | Ocena | Uzasadnienie | Źródła |
|---|:-:|---|---|
| A1 Phishing / AitM | 3 | Chipu nie da się sphishować przy kasie, ale dane karty wyłudza się do płatności online. | A6, S5 |
| A2 Przechwycenie kanału | 3 | Kryptogram EMV jest bezwartościowy dla podsłuchującego; pasek — nie. | A9, A8 |
| A3 Powtórzenie | 3 | Chip: licznik i liczba losowa; pasek: dane statyczne. | A6, A8 |
| A4 SIM-swap | 5 | Niezależna od telefonu. | S5 |
| A5 Socjotechnika | 3 | Ofiarę namawia się do przyłożenia karty do telefonu i podania PIN-u. | X6 |
| A6 Wyciek z serwera | 3 | Klucze w HSM banku; wycieki u sprzedawców ujawniają numery do płatności online. | A6 |
| A7 Utrata urządzenia | 2 | Płatności zbliżeniowe bez PIN-u do limitu; obejścia PIN w niektórych konfiguracjach. | A4, A6 |
| B1 Koszt | 2 | Karty, terminale, sieć płatnicza, HSM. | S5, A6 |
| B2 Interoperacyjność | 5 | Globalna akceptacja EMV. | S5 |
| B3 Skalowalność | 4 | Dojrzała infrastruktura, ale wymiana kart kosztuje. | S5 |
| C1 Tarcie | 5 | Przyłożenie karty. | S5 |
| C2 Czas | 5 | Około sekundy. | S5 |
| C3 Dostępność i odzyskiwanie | 4 | Bank wydaje nową kartę. | S5 |
| C4 Znajomość | 5 | Powszechnie znana. | S5 |
| D1 NIST AAL | n/d (3) | Nie dotyczy (płatności, nie logowanie). | N1 |
| D2 PSD2 SCA | częściowo (3) | Z PIN-em spełnia SCA; drobne płatności zbliżeniowe są zwolnione. | N3 |
| D3 Odporność na phishing | częściowo (3) | Chip odporny na powtórzenie, pasek i przekaźnik nie. | A5, A6 |
| D4 Dopasowanie B2B/B2C/C2C | B2C (4) | B2C w handlu. | S5, N7 |

### 9. MFA i ocena ryzyka

Połączenie co najmniej dwóch niezależnych składników, często dobieranych na bieżąco według ryzyka logowania.

| Kryterium | Ocena | Uzasadnienie | Źródła |
|---|:-:|---|---|
| A1 Phishing / AitM | 3 | Zależy od składników: z passkeyem odporne, z hasłem i kodem nie. | A1, N4 |
| A2 Przechwycenie kanału | 4 | Kilka niezależnych kanałów utrudnia przechwycenie. | N4, P10 |
| A3 Powtórzenie | 4 | Składniki dynamiczne wykluczają powtórzenie. | N4 |
| A4 SIM-swap | 3 | Słabe, jeśli SMS jest jednym ze składników lub ścieżką zapasową. | P11, X2 |
| A5 Socjotechnika | 3 | Wymaga oszukania na więcej niż jednym etapie; zmęczenie użytkownika zostaje. | A2, P9 |
| A6 Wyciek z serwera | 4 | Wyciek jednego składnika nie wystarcza. | N4 |
| A7 Utrata urządzenia | 4 | Utrata jednego urządzenia nie daje dostępu. | N4 |
| B1 Koszt | 3 | Koszt sumy składników i systemu oceny ryzyka. | P10, P7 |
| B2 Interoperacyjność | 3 | Zależy od wybranych składników. | P12 |
| B3 Skalowalność | 4 | Dobrze skaluje się z oceną ryzyka (więcej kroków tylko przy ryzyku). | P10 |
| C1 Tarcie | 2 | Kilka kroków przy logowaniu. | P9, P8 |
| C2 Czas | 2 | Najdłużej spośród badanych. | P8 |
| C3 Dostępność i odzyskiwanie | 2 | Odzyskiwanie bywa skomplikowane i osłabia całość. | P11 |
| C4 Znajomość | 3 | Znane, ale obowiązkowe MFA bez edukacji bywa nieskuteczne. | P9 |
| D1 NIST AAL | AAL2–AAL3 (4) | AAL2–AAL3 zależnie od składników. | N1 |
| D2 PSD2 SCA | tak (5) | To definicja SCA. | N3 |
| D3 Odporność na phishing | częściowo (3) | Tylko gdy składnik jest odporny na phishing. | N1, A1 |
| D4 Dopasowanie B2B/B2C/C2C | B2B, B2C (5) | B2B i B2C przy wysokiej stawce. | N4, N7 |

### 10. BLIK (rozszerzenie)

Polski system płatności: 6-cyfrowy kod z aplikacji banku, ważny 2 minuty, a potem potwierdzenie kwoty w aplikacji.

| Kryterium | Ocena | Uzasadnienie | Źródła |
|---|:-:|---|---|
| A1 Phishing / AitM | 3 | Kod wyłudzany na fałszywych stronach płatności, ale potwierdzenie pokazuje kwotę i odbiorcę. | X7, N3 |
| A2 Przechwycenie kanału | 4 | Kod bez potwierdzenia w aplikacji jest bezużyteczny. | X7 |
| A3 Powtórzenie | 5 | Kod jednorazowy, 2 minuty, potwierdzenie każdej transakcji. | X7 |
| A4 SIM-swap | 4 | Aktywacja aplikacji na nowym telefonie wymaga logowania do banku. | X7, X2 |
| A5 Socjotechnika | 2 | Główny wektor oszustw: „pożycz na BLIKa”, fałszywe „odbieranie płatności”. | X7, P9 |
| A6 Wyciek z serwera | 5 | Kody ulotne; bank przechowuje klucz publiczny aplikacji. | X7 |
| A7 Utrata urządzenia | 4 | Aplikacja chroniona PIN-em lub biometrią. | X7 |
| B1 Koszt | 3 | Tanio dla sprzedawców; banki potrzebują integracji z systemem BLIK. | X7 |
| B2 Interoperacyjność | 2 | Głównie Polska. | X7 |
| B3 Skalowalność | 4 | Działa w skali krajowej. | X7 |
| C1 Tarcie | 4 | Kod i jedno potwierdzenie. | X7 |
| C2 Czas | 4 | Kilka sekund. | X7 |
| C3 Dostępność i odzyskiwanie | 3 | Wymaga smartfona i aplikacji polskiego banku. | X7 |
| C4 Znajomość | 5 | Powszechny w Polsce. | X7 |
| D1 NIST AAL | n/d (3) | Nie dotyczy (płatności). | N1 |
| D2 PSD2 SCA | tak (5) | Spełnia SCA z dynamicznym powiązaniem. | N3, X7 |
| D3 Odporność na phishing | częściowo (3) | Potwierdzenie z kwotą pomaga, ale zależy od uwagi użytkownika. | X7 |
| D4 Dopasowanie B2B/B2C/C2C | C2C, B2C (PL) (4) | C2C i B2C w Polsce. | X7 |

## 7. Najefektywniejsze zastosowanie

| Mechanizm | Gdzie i po co | Główne słabości | Odporność na phishing |
|---|---|---|---|
| Hasło | Jako jeden z dwóch czynników albo w serwisach niskiego ryzyka; z menedżerem haseł i unikalnym hasłem na serwis. | Phishing, powtarzanie haseł w wielu serwisach, słabe hasła łamane po wycieku bazy. | nie |
| SMS OTP | Jako przejściowy drugi składnik tam, gdzie nie ma nic lepszego; nie do kont o wysokiej wartości. | SIM-swap, phishing w czasie rzeczywistym, przechwycenie w sieci (SS7), podgląd na zablokowanym ekranie. | nie |
| TOTP (aplikacja) | Jako drugi składnik zamiast SMS: działa offline i nie zależy od operatora. | Phishing w czasie rzeczywistym, kradzież sekretu (np. z niezaszyfrowanej kopii zapasowej), utrata telefonu bez kopii. | nie |
| Push + number matching | Firmy i banki z własną aplikacją; zawsze z dopasowaniem liczby i kontekstem (kto, skąd, co). | Zmęczenie powiadomieniami (bez dopasowania liczby), socjotechnika przez telefon, phishing w czasie rzeczywistym. | nie |
| Klucz sprzętowy FIDO2 | Konta uprzywilejowane i pracownicy firm (B2B), administratorzy, osoby szczególnie narażone. | Koszt i logistyka (zakup, zapasowy klucz), zgubienie, słabsze ścieżki odzyskiwania konta. | tak |
| Passkey | Logowanie klientów (B2C) zamiast hasła i SMS; w firmie w wersji związanej z urządzeniem. | Odzyskiwanie konta, przejęcie konta chmurowego (passkey synchronizowany), kradzież sesji po zalogowaniu. | tak |
| Biometria | Lokalne odblokowanie passkeya lub aplikacji banku; wygoda bez wysyłania danych biometrycznych na serwer. | Ataki prezentacji (sztuczny palec, zdjęcie), nie da się jej zmienić po wycieku, błędy dopasowania (FAR/FRR). | częściowo |
| Karta płatnicza | Płatności w sklepie (chip, zbliżeniowo); pasek magnetyczny tylko jako przestarzała rezerwa. | Skimming i klonowanie paska, przekaźnik NFC (relay), obejścia PIN w niektórych konfiguracjach, phishing danych karty online. | częściowo |
| MFA i ocena ryzyka | Wszędzie, gdzie stawka jest wysoka; z odpornym na phishing składnikiem i bez słabych ścieżek zapasowych. | Słabe metody zapasowe (SMS, pytania), zmęczenie użytkownika, kradzież sesji po zalogowaniu. | częściowo |
| BLIK | Płatności w internecie i wypłaty w Polsce (C2C, B2C) bez podawania danych karty. | Socjotechnika: „pożycz na BLIKa”, fałszywe „odbieranie płatności”, zatwierdzanie bez czytania. | częściowo |

## 8. Źródła użyte w matrycy

- **N1** — NIST SP 800-63B-4, Digital Identity Guidelines: Authentication and Authenticator Management (2025). https://pages.nist.gov/800-63-4/sp800-63b.html
- **N3** — Dyrektywa (UE) 2015/2366 (PSD2) oraz Rozporządzenie delegowane (UE) 2018/389 (RTS SCA) (2018). https://eur-lex.europa.eu/eli/reg_del/2018/389/oj
- **N4** — OWASP Multifactor Authentication Cheat Sheet oraz Authentication Cheat Sheet (2024). https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html
- **N5** — OWASP Top 10 (2021), A07: Identification and Authentication Failures (2021). https://cheatsheetseries.owasp.org/IndexTopTen.html
- **N6** — ISO/IEC 27001/27002, ISO/IEC 29115, ISO/IEC 30107-1/-3 (Presentation Attack Detection) (2022). https://www.iso.org/standard/27001
- **N7** — ENISA, On the security and privacy of eID and authentication in e-finance/e-payments (2013). https://www.enisa.europa.eu/sites/default/files/publications/eIDAS4eFinance_ePay.pdf
- **S1** — W3C, Web Authentication: An API for accessing Public Key Credentials, Level 3 (2026). https://www.w3.org/TR/webauthn-3/
- **S2** — FIDO Alliance, Client to Authenticator Protocol (CTAP) 2 i specyfikacje FIDO2 (2023). https://fidoalliance.org/specifications/
- **S3** — D. M'Raihi i in., RFC 6238: TOTP: Time-Based One-Time Password Algorithm (2011). https://datatracker.ietf.org/doc/rfc6238
- **S4** — D. M'Raihi i in., RFC 4226: HOTP: An HMAC-Based One-Time Password Algorithm (2005). https://datatracker.ietf.org/doc/html/rfc4226
- **S5** — EMVCo, EMV Contactless Specifications i EMV 3-D Secure (2024). https://www.emvco.com/specifications/
- **P1** — S. G. Lyastani i in., Is FIDO2 the Kingslayer of User Authentication? A Comparative Usability Study of FIDO2 Passwordless Authentication, IEEE S&P 2020 (2020). https://trust.cispa.saarland/publication/lyastani-20-sp/lyastani-20-sp.pdf
- **P2** — FIDO2 the Rescue? Platform vs. Roaming Authentication on Smartphones, ACM CHI 2023, DOI 10.1145/3544548.3580993 (2023). https://doi.org/10.1145/3544548.3580993
- **P3** — Challenges with Passwordless FIDO2 in an Enterprise Setting: A Usability Study, IEEE SecDev 2023 (2023). https://arxiv.org/html/2308.08096v2
- **P4** — L. Lassak i in., Why Aren't We Using Passkeys? Obstacles Companies Face Deploying FIDO2 Passwordless Authentication, USENIX Security 2024; badanie SOUPS 2025 (2025). https://www.usenix.org/system/files/soups2025-lassak.pdf
- **P5** — Device-Bound vs. Synced Credentials: A Comparative Evaluation of Passkey Authentication, ICISSP 2025 (2025). https://arxiv.org/pdf/2501.07380
- **P6** — NCSC (UK), Comparing the security properties of traditional user credentials and FIDO2 credentials for personal use (2024). https://www.ncsc.gov.uk/paper/traditional-user-and-fido2-credentials-personal-use
- **P7** — Karim i in., przegląd porównawczy metod MFA, International Journal of Data and Network Science, 2023 (2023). https://www.growingscience.com/ijds/Vol8/ijdns_2023_180.pdf
- **P8** — A Comparative Usability Study of Two-Factor Authentication, USEC 2014 (2014). https://arxiv.org/pdf/1309.5344
- **P9** — Evaluating User Perception of Multi-Factor Authentication: A Systematic Review (2019). https://www.researchgate.net/publication/335233025_Evaluating_User_Perception_of_Multi-Factor_Authentication_A_Systematic_Review
- **P10** — AuthGuide: Analyzing Security, Privacy and Usability Trade-offs in Multi-Factor Authentication, KU Leuven (2024). https://lirias.kuleuven.be/server/api/core/bitstreams/6c5421d7-dd23-4403-906d-59bf0eac3b8e/content
- **P11** — S. Amft i in., We've Disabled MFA for You: An Evaluation of the Security and Usability of Multi-Factor Authentication Recovery Deployments, arXiv 2306.09708 (2023). https://arxiv.org/pdf/2306.09708
- **P12** — S. G. Lyastani i in., A Systematic Study of the Consistency of Two-Factor Authentication User Journeys on Top-Ranked Websites, arXiv 2210.09373 (2023). https://arxiv.org/pdf/2210.09373
- **P13** — Audio-Visual Biometric Recognition and Presentation Attack Detection: A Comprehensive Survey, IEEE Access 9, 2021 (2021). https://arxiv.org/pdf/2101.09725
- **P14** — A comprehensive survey of fingerprint presentation attack detection, Journal of Surveillance, Security and Safety, 2021 (2021). https://www.oaepublish.com/articles/jsss.2021.07
- **P15** — E. Marasco i in., Biometric multi-factor authentication: on the usability of the FingerPIN scheme, Security and Privacy (Wiley), 2023 (2023). https://onlinelibrary.wiley.com/doi/full/10.1002/spy2.261
- **P16** — Presentation attack detection and biometric recognition in a challenge-response formalism, EURASIP Journal on Information Security, 2022 (2022). https://jis-eurasipjournals.springeropen.com/articles/10.1186/s13635-022-00131-y
- **A1** — Kikuchi, Impact Assessment of Adversary-in-the-Middle Attack: Evilginx Bypassing 2FA, Springer 2025 (2025). https://link.springer.com/chapter/10.1007/978-3-031-95652-2_14
- **A2** — MFA Fatigue / Push Bombing — włamanie do Uber, wrzesień 2022 (BleepingComputer) (2022). https://www.bleepingcomputer.com/news/security/mfa-fatigue-attacks-are-putting-your-organization-at-risk/
- **A3** — DEKRA, From SMS to SIM: Security Analysis of Phone Number Verification (2023). https://dekra.com/en/security-analysis-of-phone-number-verification
- **A4** — D. Basin i in., The EMV Standard: Break, Fix, Verify; obejście PIN w kartach zbliżeniowych (2021). https://www.bankinfosecurity.com/emv-credit-card-flaw-allows-pin-bypass-a-14956
- **A5** — Practical EMV Relay Protection, IEEE S&P 2022; Security Analysis and Implementation of Relay-Resistant Contactless Payments, ACM CCS 2020 (2022). https://ieeexplore.ieee.org/document/9833642/
- **A6** — Hofmeier, Basin i in., SoK: Attacks on Modern Card Payments, arXiv 2504.03363 (2025). https://arxiv.org/pdf/2504.03363
- **A8** — M. Roland, J. Langer, Cloning Credit Cards: A Combined Pre-play and Downgrade Attack on EMV Contactless, USENIX WOOT 2013 (2013). https://www.usenix.org/system/files/conference/woot13/woot13-roland.pdf
- **A9** — Security Analysis of Near-Field Communication (NFC) Payments, arXiv 1904.10623 (2019). https://arxiv.org/pdf/1904.10623
- **R1** — FIDO Alliance, Online Authentication Barometer 2024 (2024). https://fidoalliance.org/wp-content/uploads/2024/10/Barometer-Report-Oct-31-2024-2.pdf
- **R2** — FIDO Alliance, The State of Passkeys 2026: Global Consumer and Workforce Report (2026). https://fidoalliance.org/the-state-of-passkeys-2026-global-consumer-and-workforce-report/
- **W4** — yackermann/awesome-webauthn oraz passkeys.dev/demos (2025). https://github.com/yackermann/awesome-webauthn
- **X1** — J. Bonneau, C. Herley, P. C. van Oorschot, F. Stajano, The Quest to Replace Passwords: A Framework for Comparative Evaluation of Web Authentication Schemes, IEEE S&P 2012, DOI 10.1109/SP.2012.44 (2012). https://doi.org/10.1109/SP.2012.44
- **X2** — K. Lee, B. Kaiser, J. Mayer, A. Narayanan, An Empirical Study of Wireless Carrier Authentication for SIM Swaps, SOUPS 2020 (2020). https://www.usenix.org/conference/soups2020/presentation/lee
- **X3** — A. Biryukov i in., RFC 9106: Argon2 Memory-Hard Function for Password Hashing and Proof-of-Work Applications (2021). https://www.rfc-editor.org/rfc/rfc9106
- **X4** — OWASP Password Storage Cheat Sheet (2025). https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- **X5** — CISA, Implementing Number Matching in MFA Applications (fact sheet) (2022). https://www.cisa.gov/sites/default/files/publications/fact-sheet-implement-number-matching-in-mfa-applications-508c.pdf
- **X6** — ESET Research, NGate Android malware relays NFC traffic to steal cash (2024). https://www.welivesecurity.com/en/eset-research/ngate-android-malware-relays-nfc-traffic-to-steal-cash/
- **X7** — Polski Standard Płatności, BLIK — informacje o systemie (2026). https://blik.com/
- **X8** — Ministerstwo Cyfryzacji, Zastrzeż swój numer PESEL (2024). https://www.gov.pl/web/gov/zastrzez-swoj-numer-pesel
- **X9** — Microsoft Learn, How number matching works in MFA push notifications (2025). https://learn.microsoft.com/en-us/entra/identity/authentication/how-to-mfa-number-match
