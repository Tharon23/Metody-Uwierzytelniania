# 05_video — wideo z tych samych scen

Jedno zadanie: wyrenderować MP4 z kompozycji Remotion (`../04_app/src/video/`).

## Inputs
- Working: `../04_app/src/video/` (kompozycje), `../04_app/src/scene/` (sceny)

## Process
1. `npm --prefix 04_app run video:teaser` (zwiastun ~75 s) lub `video:full` (pełna pętla).
2. Pliki trafiają do `output/`.

## Outputs
- `output/*.mp4`

## Check
Odtwórz plik: podpisy czytelne, brak zgubionych klatek, długość zgodna z kompozycją.
