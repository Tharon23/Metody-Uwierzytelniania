/**
 * Znak „Jak się logujemy?”: dwie warstwy (płytki izometryczne). W interfejsie górna warstwa
 * leciutko unosi się i opada, a po jej krawędzi co kilka sekund przebiega zielony znacznik —
 * jak sprawdzanie podpisu. W wideo (`still`) bez animacji CSS, żeby klatki były deterministyczne.
 */
export function Mark({ still = false }: { still?: boolean }) {
  const top = 'M6 12.5 16 18l10-5.5L16 7z';
  return (
    <svg className={`mark ${still ? '' : 'is-live'}`} viewBox="0 0 32 32" aria-hidden>
      <path className="mark-base" d="M6 19.5 16 25l10-5.5L16 14z" />
      <g className="mark-top">
        <path className="mark-plate" d={top} />
        {!still && <path className="mark-scan" d={top} pathLength={1} />}
      </g>
    </svg>
  );
}
