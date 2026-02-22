import { useState, useEffect } from 'react';

function Field({ label, value }) {
  return (
    <div className="ficha-field">
      <span className="ficha-label">{label}</span>
      <span className="ficha-value">{value ?? '—'}</span>
    </div>
  );
}

function extractAccentColor(src, onColor) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 20;
      canvas.height = 20;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 20, 20);
      const { data } = ctx.getImageData(0, 0, 20, 20);

      let bestColor = null;
      let bestSaturation = -1;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i] / 255;
        const g = data[i + 1] / 255;
        const b = data[i + 2] / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const l = (max + min) / 2;
        const s = max === min ? 0
          : l > 0.5
            ? (max - min) / (2 - max - min)
            : (max - min) / (max + min);

        if (s > bestSaturation && l > 0.15 && l < 0.85) {
          bestSaturation = s;
          bestColor = `rgb(${data[i]}, ${data[i + 1]}, ${data[i + 2]})`;
        }
      }

      if (bestColor) onColor(bestColor);
    } catch {
      // CORS or canvas tainted — keep default CSS color
    }
  };
  img.src = src;
}

function VinylDisc({ accentColor }) {
  return (
    <div className="vinyl-disc" aria-hidden>
      <div className="vinyl-disc-grooves" />
      <div className="vinyl-disc-label" style={accentColor ? { background: accentColor } : undefined} />
    </div>
  );
}

function VinylCard({ vinyl, onClose, isClosing = false }) {
  const [accentColor, setAccentColor] = useState(null);
  useEffect(() => {
    setAccentColor(null);
    if (vinyl.coverImage) {
      extractAccentColor(vinyl.coverImage, setAccentColor);
    }
  }, [vinyl.coverImage]);

  return (
    <div
      className={`card-overlay ${isClosing ? 'card-overlay-out' : ''}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-title"
    >
      <div
        className={`card-modal ${isClosing ? 'card-modal-out' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <button
          type="button"
          className="card-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>

        <div className="card-top">
          <div className="card-top-frame">
            <div className="card-cover-wrap">
              {vinyl.coverImage ? (
                <img src={vinyl.coverImage} alt={`Portada de ${vinyl.album}`} className="card-cover" />
              ) : (
                <div className="card-cover-placeholder">
                  <span>{vinyl.album}</span>
                </div>
              )}
            </div>
            <div className="card-disc-wrap">
              <VinylDisc accentColor={accentColor} />
            </div>
          </div>
        </div>

        <div className="card-heading">
          <p className="card-heading-album">{vinyl.album}</p>
          <p className="card-heading-artist">{vinyl.artist}</p>
        </div>

        <div className="card-ficha card-paper">
          <div className="ficha-column ficha-column-left">
            <Field label="SELLO" value={vinyl.label} />
            <Field label="GÉNERO" value={vinyl.genre} />
          </div>
          <div className="ficha-column ficha-column-right">
            <Field label="PAÍS" value={vinyl.country} />
            <Field label="FECHA DE LANZAMIENTO" value={vinyl.purchaseDate} />
          </div>
          <div className="ficha-field ficha-field-tags">
            <span className="ficha-label">DESCRIPTIVOS</span>
            {vinyl.tags?.length > 0 ? (
              <div className="ficha-tags">
                {vinyl.tags.map((tag, i) => (
                  <span key={i} className="ficha-tag">{tag}</span>
                ))}
              </div>
            ) : (
              <span className="ficha-value">—</span>
            )}
          </div>
        </div>

        {vinyl.favoriteTracks?.length > 0 && (
          <section className="card-tracks" aria-labelledby="tracks-heading">
            <h2 id="tracks-heading" className="card-tracks-title">Mis canciones favoritas</h2>
            <ol className="card-tracks-list">
              {vinyl.favoriteTracks.map((track, i) => (
                <li key={i} className="card-tracks-item">
                  <span className="card-tracks-note" aria-hidden>♪</span>
                  <span className="card-tracks-title-track">{track.title}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {(vinyl.spotify || vinyl.tidal || vinyl.youtube) && (
          <div className="card-streaming">
            {vinyl.spotify && (
              <a
                href={vinyl.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="card-streaming-link card-streaming-link--spotify"
                aria-label="Escuchar en Spotify"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                <span className="streaming-tooltip">Escuchar en Spotify</span>
              </a>
            )}
            {vinyl.tidal && (
              <a
                href={vinyl.tidal}
                target="_blank"
                rel="noopener noreferrer"
                className="card-streaming-link card-streaming-link--tidal"
                aria-label="Escuchar en Tidal"
              >
                {/* 3 diamonds top row + 1 diamond centered below */}
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M4 4L8 8 4 12 0 8ZM12 4L16 8 12 12 8 8ZM20 4L24 8 20 12 16 8ZM12 12L16 16 12 20 8 16Z"/>
                </svg>
                <span className="streaming-tooltip">Escuchar en Tidal</span>
              </a>
            )}
            {vinyl.youtube && (
              <a
                href={vinyl.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="card-streaming-link card-streaming-link--youtube"
                aria-label="Escuchar en YouTube"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span className="streaming-tooltip">Escuchar en YouTube</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VinylCard;
