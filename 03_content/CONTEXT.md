# 03_content — treść: mechanizmy, przepływy, matryca

Jedno zadanie: utrzymać jedno źródło prawdy o treści, z którego czytają aplikacja, wideo i raport.

## Inputs
- Reference: `../KM1-Baza-Zrodel.md` (źródła i kryteria §8)
- Reference: `../_shared/zasady-tresci.md`
- Reference: `../01_research/output/ocena-researchu.md` (co z researchu zewnętrznego jest wiarygodne)

Do NOT load: kodu aplikacji.

## Process
1. Typy w `data/types.ts`; jeden mechanizm = jeden plik w `data/mechanisms/`.
2. Oceny w `data/matrix.ts`: każda ma `v` (1–5), `why`, `src` (identyfikatory z `data/sources.ts`).
3. Po zmianie danych: `npm --prefix 04_app test` (integralność) i `npm --prefix 04_app run gen:km2` (odświeża `output/KM2-matryca.md`).

## Outputs
- `data/` (moduły TS), `output/KM2-matryca.md` (generowany, nie edytować ręcznie)

## Check
Test integralności w `04_app` przechodzi: każde źródło istnieje, każda para mechanizm × kryterium ma ocenę.
