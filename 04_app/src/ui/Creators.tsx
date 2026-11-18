import { COURSE, TEAM } from '../content/team';

/** Blok „Twórcy” — wspólny dla strony startowej i „O projekcie”. */
export function Creators({ id = 'tworcy' }: { id?: string }) {
  return (
    <section className="creators" aria-labelledby={id}>
      <h2 id={id}>Twórcy</h2>
      <ul>
        {TEAM.map((p) => (
          <li key={p.name}>
            <span className="cr-name">{p.name}</span>
            {p.role && <span className="cr-role">{p.role}</span>}
          </li>
        ))}
      </ul>
      <p className="cr-course">{COURSE}</p>
    </section>
  );
}
