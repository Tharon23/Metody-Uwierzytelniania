# Wizualizacja — inspiracje i referencje (zadanie E)

Cel modułu: interaktywna, edukacyjna wizualizacja działania mechanizmów uwierzytelniania, w stylu „explorera" — przyjazna dla młodszego odbiorcy (licealiści, dni otwarte), ale merytorycznie poprawna. Prototyp na KM3 (15.01).

## Referencja wiodąca — styl/estetyka

- **Protocol Explorer** — https://protocol-explorer-alpha.vercel.app
  Docelowy *look & feel*: czysty, „explorerowy" układ, nawigacja po kolejnych pojęciach, lekka animacja. **Uwaga:** tamta strona dotyczy działania internetu/sieci, nie uwierzytelniania — bierzemy z niej **styl**, nie treść. Publicznego repo nie udało się jednoznacznie zlokalizować → plan: odtworzyć styl 1:1 od zera i wypełnić naszym tematem (prawdopodobny stack: Next.js/React + Tailwind).

## Referencja wiodąca — sposób opowiadania przepływu

- **„What happens when you sign in with a passkey?"** (Zack Proser) — https://zackproser.com/demos/what-happens-when-you-sign-in-with-a-passkey
  Wzorzec **„rozstrzelonej" (exploded-view) animacji warstwowej**: krok po kroku pokazuje challenge → authenticator → assertion → weryfikacja. Dokładnie ten sposób narracji chcemy zastosować dla każdej metody (SMS OTP, TOTP, Push, FIDO2, biometria).

## Komponenty demo do zapożyczenia / inspiracji

| Źródło | Co bierzemy | Link |
|--------|-------------|------|
| **crypto-lab-webauthn** (systemslibrarian) | Interaktywne demo WebAuthn z **prawdziwymi kluczami ECDSA P-256**; pokazuje challenge-response ORAZ symulację ataków (phishing/replay/clone) z przyciskiem *reset*. Idealny na „zobacz, dlaczego FIDO2 nie da się sphishować". | https://github.com/systemslibrarian/crypto-lab-webauthn |
| **awesome-webauthn** (yackermann) | Kuratorowana lista dem, bibliotek i narzędzi WebAuthn — baza gotowych klocków. | https://github.com/yackermann/awesome-webauthn |
| **passkeys.dev — test sites** | Lista działających stron testowych passkeys/WebAuthn do pokazania „na żywo". | https://passkeys.dev/docs/tools-libraries/test-sites/ |
| **Authgear Passkey Demo / WebAuthn Tester** | Pokazuje **krok po kroku weryfikację po stronie serwera** (dekodowanie credentiala, WebCrypto) — dobry model „pod maską" do odwzorowania w wizualizacji. | https://www.authgear.com/tools/passkey-demo/ |

## Pomysł na strukturę wizualizacji (wstępny)

1. **Ekran wyboru metody** (kafelki: Hasło, SMS, TOTP, Push, FIDO2, Biometria, Karta, MFA).
2. Dla każdej metody: **animowany przepływ** (exploded-view à la Proser) + **mini-panel ataku** (à la crypto-lab-webauthn: „spróbuj sphishować").
3. **Panel porównania**: interaktywna matryca 1–5 (te same osie co w raporcie) z filtrami B2B/B2C/C2C.
4. **Werdykt UX**: „gdzie, po co, dlaczego warto" — jedno zdanie na metodę.

## Do ustalenia w etapie E

- [ ] Stack: czysty HTML/CSS/JS vs. Next.js/React + Tailwind (pod styl Protocol Explorer).
- [ ] Czy demo FIDO2 działa na żywo (WebAuthn Virtual Authenticator w DevTools) czy symulacja.
- [ ] Hosting: Vercel (jak referencja) vs. GitHub Pages.
- [ ] Licencje zapożyczonych komponentów (sprawdzić przed kopiowaniem kodu — większość MIT, zweryfikować).
