import { useCallback, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, v: string) {
  try {
    localStorage.setItem(key, v);
  } catch {
    /* tryb prywatny / brak pamięci — ustawienie tylko na tę sesję */
  }
}

export function useTheme(forced?: Theme | null) {
  const [theme, setTheme] = useState<Theme>(() => forced ?? ((read('jsl-theme') as Theme) || 'dark'));
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  const toggle = useCallback(() => {
    setTheme((t) => {
      const n = t === 'dark' ? 'light' : 'dark';
      write('jsl-theme', n);
      return n;
    });
  }, []);
  return [theme, toggle] as const;
}

export function useStoredFlag(key: string, initial: boolean) {
  const [v, setV] = useState<boolean>(() => {
    const r = read(key);
    return r === null ? initial : r === '1';
  });
  const set = useCallback(
    (n: boolean | ((p: boolean) => boolean)) => {
      setV((p) => {
        const next = typeof n === 'function' ? n(p) : n;
        write(key, next ? '1' : '0');
        return next;
      });
    },
    [key],
  );
  return [v, set] as const;
}
