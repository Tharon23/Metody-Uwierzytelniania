# 06_report — raport LaTeX (KM4) i matryca (KM2)

Jedno zadanie: złożyć raport naukowy po polsku z tabelami generowanymi z danych.

## Inputs
- Working: `../03_content/data/` (przez `npm --prefix 04_app run gen:report`)
- Reference: `../KM1-Baza-Zrodel.md`, `../_shared/zasady-tresci.md`
- Working: `figures/` (zrzuty aplikacji)

## Process
1. `npm --prefix 04_app run gen:report` — odświeża `generated/*.tex`.
2. W tym folderze: `latexmk -lualatex -outdir=output raport.tex` oraz `latexmk -lualatex -outdir=output -jobname=km2-matryca km2.tex`.
3. Figury: zrzuty aplikacji w jasnym motywie, adresy w `figures/README.md`.

Uwaga: lokalny MiKTeX ma starsze jądro LaTeX — używamy `babel` (nie `polyglossia`) i `\colorbox` (nie `colortbl`).

## Outputs
- `output/raport.pdf`, `output/km2-matryca.pdf`

## Check
PDF kompiluje się bez błędów i nieokreślonych odwołań; każda tabela zgadza się z `03_content/output/KM2-matryca.md`.
