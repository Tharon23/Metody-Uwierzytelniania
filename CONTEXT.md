# Przebieg prac

Sześć etapów. Wyjście etapu (`output/` albo kod) jest wejściem następnego.

```
01_research ──► 02_design-language ──► 04_app ──► 05_video
      │                                   ▲
      └──────► 03_content ────────────────┤
                    │                     │
                    └──────► 06_report ◄──┘ (zrzuty ekranu)
```

1. **01_research** — research zewnętrzny i jego ocena. Wynik: `01_research/output/ocena-researchu.md`.
2. **02_design-language** — język wizualny i ruchu aplikacji. Wynik: `02_design-language/output/design-language.md`.
3. **03_content** — jedno źródło prawdy o treści: mechanizmy, przepływy krok po kroku, warianty ataków, matryca 1–5 ze źródłami. Wynik: moduły danych w `03_content/data/` + wygenerowane `03_content/output/KM2-matryca.md`.
4. **04_app** — aplikacja (tryb interaktywny, autoplay/kiosk, porównanie). Czyta dane z `03_content/data/`.
5. **05_video** — render MP4 z kompozycji Remotion w `04_app/src/video/`. Wynik: `05_video/output/`.
6. **06_report** — raport LaTeX; tabele generowane z `03_content/data/`. Wynik: `06_report/output/raport.pdf`.

Specyfikacja aplikacji: `_shared/specyfikacja-aplikacji.md`.
