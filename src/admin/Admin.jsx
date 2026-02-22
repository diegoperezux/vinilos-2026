import { useState, useCallback } from 'react';
import { loadVinyls, saveVinyls, exportVinyls } from '../utils/storage';
import './Admin.css';

const EMPTY_VINYL = {
  id: '',
  album: '',
  artist: '',
  label: '',
  country: '',
  genre: '',
  purchaseDate: '',
  notes: '',
  coverImage: '',
  spotify: '',
  tidal: '',
  youtube: '',
  favoriteTracks: [],
};

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Field must live OUTSIDE VinylForm — defining it inside causes React to treat
// it as a new component type on every render, unmounting the input and losing focus.
function Field({ label, fieldName, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div className="admin-form__field">
      <label className="admin-form__label" htmlFor={`af-${fieldName}`}>{label}</label>
      <input
        id={`af-${fieldName}`}
        className="admin-form__input"
        type={type}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(fieldName, e.target.value)}
      />
    </div>
  );
}

function Thumb({ src, alt }) {
  if (!src) return <div className="admin-thumb admin-thumb--placeholder" aria-hidden />;
  return <img className="admin-thumb" src={src} alt={alt} />;
}

function VinylRow({ vinyl, onEdit, onDelete }) {
  return (
    <div className="admin-list__row">
      <Thumb src={vinyl.coverImage} alt={`Portada de ${vinyl.album}`} />
      <div className="admin-list__info">
        <span className="admin-list__album">{vinyl.album}</span>
        <span className="admin-list__artist">{vinyl.artist}</span>
      </div>
      <div className="admin-list__meta">
        <span className="admin-list__genre">{vinyl.genre}</span>
        <span className="admin-list__country">{vinyl.country}</span>
      </div>
      <div className="admin-list__actions">
        <button type="button" className="admin-btn admin-btn--secondary admin-btn--sm" onClick={() => onEdit(vinyl)}>
          Editar
        </button>
        <button type="button" className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => onDelete(vinyl.id)}>
          Eliminar
        </button>
      </div>
    </div>
  );
}

function FavoriteTracksEditor({ tracks, onChange }) {
  function updateTrack(index, field, value) {
    const next = tracks.map((t, i) =>
      i === index ? { ...t, [field]: field === 'position' ? Number(value) : value } : t
    );
    onChange(next);
  }

  function addTrack() {
    onChange([...tracks, { position: tracks.length + 1, title: '' }]);
  }

  function removeTrack(index) {
    onChange(tracks.filter((_, i) => i !== index));
  }

  return (
    <div className="admin-tracks">
      <div className="admin-tracks__header">
        <span className="admin-form__label">Canciones favoritas</span>
        <button type="button" className="admin-btn admin-btn--secondary admin-btn--sm" onClick={addTrack}>
          + Añadir canción
        </button>
      </div>
      {tracks.length === 0 && <p className="admin-tracks__empty">Sin canciones favoritas aún.</p>}
      {tracks.map((track, i) => (
        <div key={i} className="admin-tracks__row">
          <input
            className="admin-form__input admin-tracks__position"
            type="number"
            min="1"
            placeholder="#"
            value={track.position}
            onChange={(e) => updateTrack(i, 'position', e.target.value)}
            aria-label={`Posición canción ${i + 1}`}
          />
          <input
            className="admin-form__input admin-tracks__title"
            type="text"
            placeholder="Título de la canción"
            value={track.title}
            onChange={(e) => updateTrack(i, 'title', e.target.value)}
            aria-label={`Título canción ${i + 1}`}
          />
          <button
            type="button"
            className="admin-btn admin-btn--danger admin-btn--sm"
            onClick={() => removeTrack(i)}
            aria-label={`Eliminar canción ${i + 1}`}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

function VinylForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_VINYL,
    ...initial,
    favoriteTracks: initial?.favoriteTracks ?? [],
    coverImage: initial?.coverImage ?? '',
    spotify: initial?.spotify ?? '',
    tidal: initial?.tidal ?? '',
    youtube: initial?.youtube ?? '',
  }));

  const isNew = !initial?.id;

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...form,
      id: form.id || generateId(),
      coverImage: form.coverImage.trim() || null,
      spotify: form.spotify.trim() || null,
      tidal: form.tidal.trim() || null,
      youtube: form.youtube.trim() || null,
    });
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit} noValidate>
      <h2 className="admin-form__title">
        {isNew ? 'Nuevo vinilo' : `Editar: ${form.album || '…'}`}
      </h2>

      <fieldset className="admin-form__fieldset">
        <legend className="admin-form__legend">Información del álbum</legend>
        <div className="admin-form__grid">
          <Field label="Álbum" fieldName="album" value={form.album} onChange={set} placeholder="Nombre del álbum" />
          <Field label="Artista" fieldName="artist" value={form.artist} onChange={set} placeholder="Nombre del artista" />
          <Field label="Sello" fieldName="label" value={form.label} onChange={set} placeholder="Warner Bros." />
          <Field label="Género" fieldName="genre" value={form.genre} onChange={set} placeholder="Rock, Jazz, Pop…" />
          <Field label="País" fieldName="country" value={form.country} onChange={set} placeholder="USA, UK…" />
          <Field label="Fecha de lanzamiento" fieldName="purchaseDate" value={form.purchaseDate} onChange={set} placeholder="15/03/2024" />
        </div>
        <div className="admin-form__field">
          <label className="admin-form__label" htmlFor="af-notes">Notas</label>
          <textarea
            id="af-notes"
            className="admin-form__input admin-form__textarea"
            value={form.notes ?? ''}
            placeholder="Edición original. Portada con ligero desgaste…"
            onChange={(e) => set('notes', e.target.value)}
            rows={3}
          />
        </div>
      </fieldset>

      <fieldset className="admin-form__fieldset">
        <legend className="admin-form__legend">Portada y streaming</legend>
        <div className="admin-form__grid">
          <Field label="URL portada" fieldName="coverImage" value={form.coverImage} onChange={set} placeholder="https://…" />
          <Field label="Spotify" fieldName="spotify" value={form.spotify} onChange={set} placeholder="https://open.spotify.com/…" />
          <Field label="Tidal" fieldName="tidal" value={form.tidal} onChange={set} placeholder="https://listen.tidal.com/…" />
          <Field label="YouTube" fieldName="youtube" value={form.youtube} onChange={set} placeholder="https://www.youtube.com/…" />
        </div>
        {form.coverImage && (
          <div className="admin-form__preview">
            <img
              src={form.coverImage}
              alt="Vista previa de portada"
              className="admin-form__preview-img"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        )}
      </fieldset>

      <fieldset className="admin-form__fieldset">
        <legend className="admin-form__legend">Canciones favoritas</legend>
        <FavoriteTracksEditor
          tracks={form.favoriteTracks}
          onChange={(tracks) => set('favoriteTracks', tracks)}
        />
      </fieldset>

      <div className="admin-form__actions">
        <button type="submit" className="admin-btn admin-btn--primary">
          {isNew ? 'Crear vinilo' : 'Guardar cambios'}
        </button>
        <button type="button" className="admin-btn admin-btn--secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function Admin() {
  const [vinyls, setVinyls] = useState(loadVinyls);
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [notification, setNotification] = useState('');

  function notify(msg) {
    setNotification(msg);
    setTimeout(() => setNotification(''), 2500);
  }

  const handleSave = useCallback((vinyl) => {
    setVinyls((prev) => {
      const next = isNew
        ? [...prev, vinyl]
        : prev.map((v) => (v.id === vinyl.id ? vinyl : v));
      saveVinyls(next);
      return next;
    });
    setEditing(null);
    setIsNew(false);
    notify(isNew ? 'Vinilo creado.' : 'Cambios guardados.');
  }, [isNew]);

  const handleDelete = useCallback((id) => {
    if (!window.confirm('¿Eliminar este vinilo? Esta acción no se puede deshacer.')) return;
    setVinyls((prev) => {
      const next = prev.filter((v) => v.id !== id);
      saveVinyls(next);
      return next;
    });
    notify('Vinilo eliminado.');
  }, []);

  const showForm = isNew || editing !== null;

  return (
    <div className="admin-root">
      <header className="admin-header">
        <div className="admin-header__left">
          <span className="admin-header__logo">Vinilos 2026</span>
          <span className="admin-header__badge">Admin</span>
        </div>
        <nav className="admin-header__nav">
          <button type="button" className="admin-btn admin-btn--secondary admin-btn--sm" onClick={exportVinyls}>
            Exportar vinyls.js
          </button>
          <a href="/" className="admin-btn admin-btn--ghost admin-btn--sm">← Volver al sitio</a>
        </nav>
      </header>

      {notification && (
        <div className="admin-notification" role="status" aria-live="polite">
          {notification}
        </div>
      )}

      <main className="admin-main">
        {showForm ? (
          <VinylForm
            initial={isNew ? undefined : editing}
            onSave={handleSave}
            onCancel={() => { setEditing(null); setIsNew(false); }}
          />
        ) : (
          <>
            <div className="admin-toolbar">
              <h1 className="admin-toolbar__title">
                Vinilos <span className="admin-toolbar__count">({vinyls.length})</span>
              </h1>
              <button type="button" className="admin-btn admin-btn--primary" onClick={() => setIsNew(true)}>
                + Añadir vinilo
              </button>
            </div>
            <div className="admin-list">
              {vinyls.length === 0 ? (
                <p className="admin-list__empty">No hay vinilos. Añade el primero.</p>
              ) : (
                vinyls.map((vinyl) => (
                  <VinylRow
                    key={vinyl.id}
                    vinyl={vinyl}
                    onEdit={(v) => { setEditing(v); setIsNew(false); }}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
