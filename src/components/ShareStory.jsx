import { useEffect, useState } from 'react';
import { renderStoryImage } from '../utils/storyImage';

function fileNameFor(album, monthKey) {
  const slug = `${album.artist}-${album.album}`
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `historia-${monthKey}-${slug}.png`;
}

// Dev-only tool (rendered behind import.meta.env.DEV in CoverFlow): builds
// a story image of the album in the center and offers it for download or,
// where the browser supports sharing files, the native share sheet — on a
// phone that's where Instagram shows up.
export default function ShareStory({ album, monthKey, monthLabel }) {
  const [state, setState] = useState({ status: 'idle' });

  // Free the preview's object URL when it's replaced or the dialog closes.
  useEffect(() => {
    if (state.status !== 'ready') return;
    return () => URL.revokeObjectURL(state.url);
  }, [state]);

  useEffect(() => {
    if (state.status === 'idle') return;
    function handleKey(e) {
      if (e.key === 'Escape') setState({ status: 'idle' });
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [state.status]);

  async function open() {
    setState({ status: 'loading' });
    try {
      const blob = await renderStoryImage({
        album,
        monthLabel,
        year: monthKey.slice(0, 4),
      });
      const file = new File([blob], fileNameFor(album, monthKey), { type: 'image/png' });
      setState({ status: 'ready', file, url: URL.createObjectURL(blob) });
    } catch (err) {
      setState({ status: 'error', message: err.message });
    }
  }

  function download() {
    const a = document.createElement('a');
    a.href = state.url;
    a.download = state.file.name;
    a.click();
  }

  async function share() {
    try {
      await navigator.share({ files: [state.file] });
    } catch {
      // user closed the share sheet — nothing to do
    }
  }

  // Sharing files needs a secure context (https or localhost) and browser
  // support — true on a phone over https, usually false on desktop.
  const canShareFile =
    state.status === 'ready' && navigator.canShare?.({ files: [state.file] });

  return (
    <>
      <button type="button" className="coverflow-listen-link story-trigger" onClick={open}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="6" y="2.5" width="12" height="19" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 8v7M9 11l3-3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Historia
      </button>

      {state.status !== 'idle' && (
        <div
          className="story-dialog-backdrop"
          onClick={() => setState({ status: 'idle' })}
        >
          <div
            className="story-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Compartir en historia"
            onClick={(e) => e.stopPropagation()}
          >
            {state.status === 'loading' && <p className="story-dialog-note">Generando historia…</p>}
            {state.status === 'error' && (
              <p className="story-dialog-note">No se pudo generar la imagen. {state.message}</p>
            )}
            {state.status === 'ready' && (
              <>
                <img className="story-dialog-preview" src={state.url} alt={`Historia de ${album.album}`} />
                <div className="story-dialog-actions">
                  {canShareFile && (
                    <button type="button" className="story-dialog-button story-dialog-button--primary" onClick={share}>
                      Compartir
                    </button>
                  )}
                  <button
                    type="button"
                    className={`story-dialog-button${canShareFile ? '' : ' story-dialog-button--primary'}`}
                    onClick={download}
                  >
                    Descargar
                  </button>
                  <button type="button" className="story-dialog-button" onClick={() => setState({ status: 'idle' })}>
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
