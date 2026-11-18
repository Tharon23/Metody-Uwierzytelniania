import { useEffect, useState } from 'react';

export type Route =
  | { name: 'start' }
  | { name: 'explorer'; mech: string; variant?: string }
  | { name: 'porownanie' }
  | { name: 'autoplay' }
  | { name: 'o-projekcie' };

export interface Location {
  route: Route;
  query: URLSearchParams;
}

export function parse(hash: string): Location {
  const raw = hash.replace(/^#/, '') || '/';
  const [path, qs = ''] = raw.split('?');
  const parts = path.split('/').filter(Boolean);
  const query = new URLSearchParams(qs);
  let route: Route = { name: 'start' };
  if (parts[0] === 'm' && parts[1]) route = { name: 'explorer', mech: parts[1], variant: parts[2] };
  else if (parts[0] === 'porownanie') route = { name: 'porownanie' };
  else if (parts[0] === 'autoplay') route = { name: 'autoplay' };
  else if (parts[0] === 'o-projekcie') route = { name: 'o-projekcie' };
  return { route, query };
}

export function href(route: Route, query?: Record<string, string>): string {
  let path = '/';
  if (route.name === 'explorer') path = `/m/${route.mech}${route.variant ? `/${route.variant}` : ''}`;
  else if (route.name !== 'start') path = `/${route.name}`;
  const qs = query ? new URLSearchParams(query).toString() : '';
  return `#${path}${qs ? `?${qs}` : ''}`;
}

export function navigate(route: Route, query?: Record<string, string>, replace = false) {
  const h = href(route, query);
  if (replace) history.replaceState(null, '', h);
  else history.pushState(null, '', h);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

export function useLocation(): Location {
  const [loc, setLoc] = useState(() => parse(window.location.hash));
  useEffect(() => {
    const on = () => setLoc(parse(window.location.hash));
    window.addEventListener('hashchange', on);
    window.addEventListener('popstate', on);
    return () => {
      window.removeEventListener('hashchange', on);
      window.removeEventListener('popstate', on);
    };
  }, []);
  return loc;
}
