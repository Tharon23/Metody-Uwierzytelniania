import { CELL, iso, PLANE, pts, type P } from '../iso';

/** Prostopadłościan: widoczne ściany górna, lewa (y = max) i prawa (x = max). Wymiary w jednostkach siatki. */
export function IsoBox({
  x, y, z = 0, w, d, h, className,
}: { x: number; y: number; z?: number; w: number; d: number; h: number; className?: string }) {
  const top = [iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h)];
  const left = [iso(x, y + d, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x, y + d, z + h)];
  const right = [iso(x + w, y, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x + w, y, z + h)];
  return (
    <g className={className}>
      <polygon className="f-left" points={pts(left)} />
      <polygon className="f-right" points={pts(right)} />
      <polygon className="f-top" points={pts(top)} />
    </g>
  );
}

/** Walec stojący (oś z). cx, cy — środek podstawy w jednostkach siatki. */
export function IsoCylinder({
  cx, cy, z = 0, r, h, rings = 0, className,
}: { cx: number; cy: number; z?: number; r: number; h: number; rings?: number; className?: string }) {
  const rx = 1.2247 * r * CELL;
  const ry = 0.7071 * r * CELL;
  const b = iso(cx, cy, z);
  const t = iso(cx, cy, z + h);
  const body = `M${b.x - rx} ${t.y} L${b.x - rx} ${b.y} A${rx} ${ry} 0 0 0 ${b.x + rx} ${b.y} L${b.x + rx} ${t.y} Z`;
  return (
    <g className={className}>
      <path className="f-left" d={body} />
      {Array.from({ length: rings }, (_, i) => {
        const yy = b.y - ((i + 1) * (b.y - t.y)) / (rings + 1);
        return <path key={i} className="detail" d={`M${b.x - rx} ${yy} A${rx} ${ry} 0 0 0 ${b.x + rx} ${yy}`} fill="none" />;
      })}
      <ellipse className="f-top" cx={t.x} cy={t.y} rx={rx} ry={ry} />
    </g>
  );
}

/** Linia na płaszczyźnie: punkty w jednostkach siatki (x, y, z). */
export function IsoLine({ a, b, className = 'detail' }: { a: [number, number, number]; b: [number, number, number]; className?: string }) {
  const p = iso(...a);
  const q = iso(...b);
  return <line className={className} x1={p.x} y1={p.y} x2={q.x} y2={q.y} />;
}

export function IsoPoly({ points, className }: { points: [number, number, number][]; className?: string }) {
  return <polygon className={className} points={pts(points.map((q) => iso(...q)))} />;
}

/** Grupa rysowana na płaszczyźnie x–z, x–y albo y–z, zaczepiona w punkcie siatki. */
export function OnPlane({
  plane, at, children,
}: { plane: 'xz' | 'yz' | 'xy'; at: [number, number, number]; children: React.ReactNode }) {
  const o: P = iso(...at);
  return <g transform={PLANE[plane](o)}>{children}</g>;
}
