# Metody Uwierzytelniania — analiza porównawcza

Projekt na przedmiot **Bezpieczne Transakcje Elektroniczne**: porównawcza analiza mechanizmów uwierzytelniania (bezpieczeństwo, UX, uniwersalność, zgodność) wraz z interaktywną wizualizacją edukacyjną.

> **Cel:** porównać metody uwierzytelniania stosowane w transakcjach elektronicznych, pokazać plusy/minusy i najefektywniejsze zastosowanie każdej, ocenić odporność na ataki (phishing, MitM/AitM, SIM-swap, socjotechnika) oraz zbudować „zjadliwą" wizualizację webową (m.in. na dni otwarte uczelni).

## Zespół

Kamil Szkarłat (koordynator) · Jakub Szkaradek · Bartłomiej Ząbek · Radosław Chruściński · Wojciech Śliwa · Mikołaj Mierzwa

## Kamienie milowe

| KM | Termin | Zakres | Status |
|----|--------|--------|--------|
| **KM1** | 08.11 | Baza źródłowa + założenia + szczegółowy plan | ✅ gotowe — [`dokumenty/KM1-Baza-Zrodel.pdf`](dokumenty/KM1-Baza-Zrodel.pdf) |
| **KM2** | 13.12 | Analiza porównawcza + matryca zagrożeń | ⏳ |
| **KM3** | 15.01 | Prototyp wizualizacji + wersja robocza raportu | ⏳ |
| **KM4** | 23.01 | Raport końcowy + prezentacja | ⏳ |

## Struktura repozytorium

```
.
├── README.md                         ← ten plik
├── KM1-Baza-Zrodel.md                ← baza źródeł + kryteria oceny (edytowalne źródło)
├── Plan-Projektu-...pdf              ← plan projektu (PERT, Gantt, kamienie milowe)
├── dokumenty/
│   └── KM1-Baza-Zrodel.pdf           ← wersja PDF dla prowadzącego (do zatwierdzenia KM1)
├── zrodla/
│   ├── README.md                     ← indeks źródeł fizycznych + lista do pobrania ręcznie
│   └── open-access/                  ← PDF-y wolne do redystrybucji (NIST, USENIX, ENISA, OA)
└── wizualizacja/
    └── INSPIRACJE.md                 ← analiza referencji pod moduł demo (zadanie E)
```

## Badane mechanizmy

Hasło (baseline) · SMS OTP · TOTP (aplikacje) · Push (+ number matching) · klucze FIDO2/WebAuthn · passkeys (device-bound / synced) · biometria · karty zbliżeniowe/magnetyczne · MFA. Kontekst relacji **B2B / B2C / C2C**.

## Osie oceny (matryca KM2)

Skala **1–5** w wymiarach: **bezpieczeństwo** (phishing/AitM, MitM, replay, SIM-swap, socjotechnika, wyciek serwera, utrata urządzenia), **wdrażalność** (koszt, interoperacyjność, skalowalność), **UX** (tarcie, czas, recovery, krzywa uczenia), **zgodność** (NIST AAL, PSD2 SCA, phishing-resistant, dopasowanie B2B/B2C/C2C). Pełna metodyka: sekcja 8 w [`KM1-Baza-Zrodel.md`](KM1-Baza-Zrodel.md).

## Źródła

~45 pozycji w 6 kategoriach (normy/regulacje, specyfikacje/RFC, publikacje recenzowane, ataki/studia przypadków, raporty branżowe, repozytoria/wizualizacje). Wszystkie linki zweryfikowane (08.11); statusy recenzji preprintów ustalone. Szczegóły: [`KM1-Baza-Zrodel.md`](KM1-Baza-Zrodel.md) i [`zrodla/README.md`](zrodla/README.md).

## Narzędzia i współpraca

- **Kod/wizualizacja:** GitHub (to repo), HTML5/CSS/JS (lub React/Next.js pod demo).
- **Raport:** Overleaf (LaTeX).
- **Zasoby:** OneDrive/Google Drive (duże pliki, PDF-y zza paywalla).
- **Komunikacja:** Discord, cotygodniowe spotkania; peer-review rozdziałów.

## Uwaga o prawach autorskich

To repozytorium jest **publiczne**. W `zrodla/open-access/` znajdują się wyłącznie materiały wolne do redystrybucji (domena publiczna / open access / licencje otwarte). Artykuły z IEEE, ACM, Wiley, Springer, ISO **nie są** tu wrzucane — pobieramy je przez dostęp uczelniany i trzymamy lokalnie (poza repo). Lista: [`zrodla/README.md`](zrodla/README.md).
