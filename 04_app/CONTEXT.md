# 04_app — aplikacja web

Jedno zadanie: zbudować i utrzymać aplikację (Explorer, autoplay/kiosk, porównanie) z danych `03_content`.

## Inputs
- Reference: `../_shared/specyfikacja-aplikacji.md`
- Reference: `../02_design-language/output/design-language.md`
- Working: `../03_content/data/`

## Process
1. `npm --prefix 04_app install`, potem `npm --prefix 04_app run dev`.
2. Sceny są czystą funkcją czasu (`src/engine`, `src/scene`); bez zegarów wewnątrz sceny.
3. Przed commitem: `npm --prefix 04_app run build` i `npm --prefix 04_app test`.

## Outputs
- kod w `src/`, build w `dist/` (nie w repo), zrzuty w `../06_report/figures/`

## Check
Build i testy przechodzą; zrzuty Playwright 1920×1080 obu motywów bez nachodzących etykiet.
