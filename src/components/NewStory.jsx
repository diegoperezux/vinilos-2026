import { useEffect, useState } from 'react';
import { StoryPreviewDialog } from './ShareStory';
import { storyFileName } from '../utils/storyImage';

const EMPTY = { link: '', album: '', artist: '', coverImage: '', genres: '', note: '' };

function spotifyAlbumId(link) {
  return link.match(/album[/:]([A-Za-z0-9]{22})/)?.[1] ?? null;
}

const normalize = (text) =>
  text.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Spotify's oEmbed endpoint is public and CORS-enabled: it gives the album
// title and a 300px cover, but not the artist.
async function lookupSpotifyAlbum(id) {
  const res = await fetch(
    `https://open.spotify.com/oembed?url=${encodeURIComponent(`https://open.spotify.com/album/${id}`)}`,
  );
  if (!res.ok) throw new Error('Spotify lookup failed');
  const data = await res.json();
  // Same image hash in the 640px size the monthly picks use.
  const hash = data.thumbnail_url?.split('/image/')[1];
  const coverImage = hash?.startsWith('ab67616d00001e02')
    ? `https://i.scdn.co/image/ab67616d0000b273${hash.slice('ab67616d00001e02'.length)}`
    : data.thumbnail_url;
  return { album: data.title, coverImage };
}

// Best-effort artist guess from the iTunes catalog: only used when exactly
// one artist has an album with this exact title, otherwise left blank.
async function guessArtist(album) {
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?entity=album&limit=25&term=${encodeURIComponent(album)}`,
    );
    const { results = [] } = await res.json();
    const artists = new Set(
      results.filter((r) => normalize(r.collectionName) === normalize(album)).map((r) => r.artistName),
    );
    return artists.size === 1 ? [...artists][0] : '';
  } catch {
    return '';
  }
}

// Dev-only (rendered behind import.meta.env.DEV in App): make a story for
// any album, not just the ones already on the site — paste a Spotify link,
// fill in what's missing, preview. Nothing is saved anywhere.
export default function NewStory() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  // Which album id the last Spotify lookup finished for, and whether it
  // worked — the lookup status is derived from it rather than set up front.
  const [lookupResult, setLookupResult] = useState({ id: null, ok: false });
  const [story, setStory] = useState(null);

  const albumId = spotifyAlbumId(form.link);
  let lookup = 'idle';
  if (albumId) {
    if (lookupResult.id !== albumId) lookup = 'loading';
    else lookup = lookupResult.ok ? 'done' : 'error';
  }

  useEffect(() => {
    if (!albumId) return;
    let cancelled = false;
    lookupSpotifyAlbum(albumId)
      .then(async ({ album, coverImage }) => {
        if (cancelled) return;
        setForm((f) => ({ ...f, album, coverImage }));
        setLookupResult({ id: albumId, ok: true });
        const artist = await guessArtist(album);
        if (!cancelled && artist) setForm((f) => (f.artist ? f : { ...f, artist }));
      })
      .catch(() => {
        if (!cancelled) setLookupResult({ id: albumId, ok: false });
      });
    return () => {
      cancelled = true;
    };
  }, [albumId]);

  useEffect(() => {
    if (!isOpen || story) return;
    function handleKey(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, story]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const canGenerate = form.coverImage && form.album.trim() && form.artist.trim();

  function generate(e) {
    e.preventDefault();
    if (!canGenerate) return;
    setStory({
      album: {
        album: form.album.trim(),
        artist: form.artist.trim(),
        coverImage: form.coverImage,
        genres: form.genres
          .split(',')
          .map((g) => g.trim())
          .filter(Boolean)
          .slice(0, 3),
        review: form.note.trim(),
      },
      label: 'Descubrimiento',
      heading: 'Escuchando ahora',
    });
  }

  function reset() {
    setForm(EMPTY);
  }

  return (
    <>
      <button type="button" className="new-story-trigger" onClick={() => setIsOpen(true)}>
        + Nueva historia
      </button>

      {isOpen && !story && (
        <div className="story-dialog-backdrop" onClick={() => setIsOpen(false)}>
          <form
            className="new-story-form"
            role="dialog"
            aria-modal="true"
            aria-label="Nueva historia"
            onClick={(e) => e.stopPropagation()}
            onSubmit={generate}
          >
            <p className="new-story-title">Nueva historia</p>

            <label className="new-story-field">
              <span>Link de Spotify</span>
              <input
                type="url"
                value={form.link}
                onChange={update('link')}
                placeholder="https://open.spotify.com/album/…"
                autoFocus
              />
              {lookup === 'loading' && <small>Buscando disco…</small>}
              {lookup === 'error' && <small>No se encontró ese disco en Spotify.</small>}
              {form.link && !albumId && <small>Pega el link de un álbum (no de una canción).</small>}
            </label>

            {form.coverImage && (
              <div className="new-story-found">
                <img src={form.coverImage} alt="" />
                <span>{form.album}</span>
              </div>
            )}

            <label className="new-story-field">
              <span>Disco</span>
              <input value={form.album} onChange={update('album')} />
            </label>

            <label className="new-story-field">
              <span>Artista</span>
              <input value={form.artist} onChange={update('artist')} />
            </label>

            <label className="new-story-field">
              <span>Géneros (opcional, separados por coma)</span>
              <input value={form.genres} onChange={update('genres')} placeholder="Post-Punk, Noise Rock" />
            </label>

            <label className="new-story-field">
              <span>Nota (opcional)</span>
              <textarea rows={3} value={form.note} onChange={update('note')} />
            </label>

            <div className="story-dialog-actions">
              <button
                type="submit"
                className="story-dialog-button story-dialog-button--primary"
                disabled={!canGenerate}
              >
                Generar historia
              </button>
              <button type="button" className="story-dialog-button" onClick={reset}>
                Limpiar
              </button>
              <button type="button" className="story-dialog-button" onClick={() => setIsOpen(false)}>
                Cerrar
              </button>
            </div>
          </form>
        </div>
      )}

      {story && (
        <StoryPreviewDialog
          story={story}
          fileName={storyFileName(story.album, 'descubrimiento')}
          // Back to the form (still filled in) so it's easy to tweak and regenerate.
          onClose={() => setStory(null)}
        />
      )}
    </>
  );
}
