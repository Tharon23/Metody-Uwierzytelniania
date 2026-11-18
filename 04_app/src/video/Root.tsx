import { useEffect, useState } from 'react';
import { AbsoluteFill, Composition, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-sans/700.css';
import '@fontsource/ibm-plex-sans-condensed/500.css';
import '@fontsource/ibm-plex-sans-condensed/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import '../styles/tokens.css';
import '../styles/app.css';
import '../styles/stage.css';
import '../styles/show.css';
import { buildShow, buildTeaser, type Show } from '../engine/show';
import { ShowFrame } from '../show/ShowFrame';

const FPS = 30;
const full = buildShow();
const teaser = buildTeaser();

/** Klatka wideo = klatka pokazu w chwili frame / fps. Ten sam komponent co autoplay w przeglądarce. */
function ShowVideo({ which }: { which: 'full' | 'teaser' }) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const show: Show = which === 'full' ? full : teaser;
  const [handle] = useState(() => delayRender('fonty'));
  useEffect(() => {
    document.documentElement.dataset.theme = 'dark';
    document.fonts.ready.then(() => continueRender(handle));
  }, [handle]);
  return (
    <AbsoluteFill style={{ background: 'var(--paper)' }}>
      <ShowFrame show={show} t={frame / fps} width={width} height={height} />
    </AbsoluteFill>
  );
}

export function Root() {
  return (
    <>
      <Composition
        id="Zwiastun"
        component={ShowVideo}
        defaultProps={{ which: 'teaser' as const }}
        durationInFrames={Math.round(teaser.total * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Pokaz"
        component={ShowVideo}
        defaultProps={{ which: 'full' as const }}
        durationInFrames={Math.round(full.total * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
}
