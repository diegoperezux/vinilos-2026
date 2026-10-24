import { useEffect, useState } from 'react';
import { renderStoryImage, storyFileName } from '../utils/storyImage';

// Renders the story as soon as it opens, then offers download or — where
// the browser can share files — the native share sheet, which on a phone
// is where Instagram shows up. Shared by the monthly picks' Historia
// button and the "Nueva historia" form.
export function StoryPreviewDialog({ story, fileName, onClose }) {
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    let url = null;
    renderStoryImage(story)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        const file = new File([blob], fileName, { type: 'image/png' });
        setState({ status: 'ready', file, url });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: 'error', message: err.message });
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [story, fileName]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

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
    <div className="story-dialog-backdrop" onClick={onClose}>
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
            <img
              className="story-dialog-preview"
              src={state.url}
              alt={`Historia de ${story.album.album}`}
            />
            <div className="story-dialog-actions">
              {canShareFile && (
                <button
                  type="button"
                  className="story-dialog-button story-dialog-button--primary"
                  onClick={share}
                >
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
              <button type="button" className="story-dialog-button" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Dev-only (rendered behind import.meta.env.DEV in CoverFlow): story for
// the album in the center of the CoverFlow.
export default function ShareStory({ album, monthKey, monthLabel }) {
  const [story, setStory] = useState(null);

  function open() {
    const year = monthKey.slice(0, 4);
    setStory({
      album,
      label: album.favorite ? `Mi favorito de ${monthLabel}` : `Mi Top ${year}`,
      heading: album.favorite ? `Mi Top ${year}` : monthLabel,
    });
  }

  return (
    <>
      <button type="button" className="coverflow-listen-link story-trigger" onClick={open}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="6" y="2.5" width="12" height="19" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 8v7M9 11l3-3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Historia
      </button>

      {story && (
        <StoryPreviewDialog
          story={story}
          fileName={storyFileName(album, monthKey)}
          onClose={() => setStory(null)}
        />
      )}
    </>
  );
}
