import { useLocation } from './router';
import { useTheme } from './ui/prefs';
import { Explorer } from './views/Explorer';
import { Start } from './views/Start';
import { Porownanie } from './views/Porownanie';
import { OProjekcie } from './views/OProjekcie';
import { Autoplay } from './views/Autoplay';
import { LockCursor } from './ui/LockCursor';

export function App() {
  return (
    <>
      <View />
      <LockCursor />
    </>
  );
}

function View() {
  const { route, query } = useLocation();
  const [, toggleTheme] = useTheme((query.get('motyw') as 'dark' | 'light' | null) ?? null);
  const num = (k: string) => {
    const v = query.get(k);
    const n = v !== null && v !== '' ? Number(v) : NaN;
    return Number.isFinite(n) ? n : undefined;
  };

  switch (route.name) {
    case 'explorer':
      return (
        <Explorer
          mechId={route.mech}
          variantId={route.variant}
          onToggleTheme={toggleTheme}
          idleSeconds={num('idle')}
          initialT={num('t')}
          initialView={query.get('widok') === 'sekwencja' ? 'sekwencja' : undefined}
        />
      );
    case 'autoplay':
      return <Autoplay kiosk={query.has('kiosk')} startAt={num('t')} frozen={query.has('stop')} onToggleTheme={toggleTheme} />;
    case 'porownanie':
      return <Porownanie onToggleTheme={toggleTheme} />;
    case 'o-projekcie':
      return <OProjekcie onToggleTheme={toggleTheme} />;
    default:
      return <Start onToggleTheme={toggleTheme} />;
  }
}
