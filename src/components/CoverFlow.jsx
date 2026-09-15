import { useEffect, useMemo, useRef, useState } from 'react';
import { currentMonthKey } from '../utils/currentMonthKey';

// Puts the favorite album at the true middle of the row (same number of
// covers fanned out on each side), regardless of where it sits in the data.
function withFavoriteCentered(albums) {
  const favIndex = albums.findIndex((a) => a.favorite);
  if (favIndex < 0) return albums;
  const rest = albums.filter((_, i) => i !== favIndex);
  const middle = Math.floor(rest.length / 2);
  return [...rest.slice(0, middle), albums[favIndex], ...rest.slice(middle)];
}

function FavoriteStamp() {
  return (
    <svg className="coverflow-stamp" viewBox="0 0 24 24" role="img" aria-label="Favorito del mes">
      <polygon points="12,2 13.15,9.28 19.07,4.93 14.77,10.85 22,12 14.77,13.15 19.07,19.07 13.15,14.77 12,22 10.85,14.77 4.93,19.07 9.23,13.15 2,12 9.23,10.85 4.93,4.93 10.85,9.23" />
    </svg>
  );
}

function CoverFlowItem({ item, offset, isActive, onSelect }) {
  const abs = Math.abs(offset);
  const side = Math.sign(offset);
  const style = {
    zIndex: 50 - abs,
    transform: isActive
      ? 'translate(-50%, -50%)'
      : `translate(-50%, -50%) translateX(calc(var(--cf-spacing) * ${offset})) translateZ(calc(var(--cf-depth) * -1)) rotateY(${side * -34}deg) scale(0.82)`,
    opacity: abs > 4 ? 0 : 1,
    pointerEvents: abs > 4 ? 'none' : 'auto',
  };
  // Always the same element type (a button) whether active or not — if
  // active/inactive rendered as different tags, React would remount the
  // node on every switch instead of transitioning it, breaking the slide.
  return (
    <button
      type="button"
      className={`coverflow-item${isActive ? ' coverflow-item--active' : ''}`}
      style={style}
      onClick={isActive ? undefined : onSelect}
      aria-label={
        isActive
          ? undefined
          : `Mostrar ${item.album} - ${item.artist} al centro`
      }
      tabIndex={isActive ? -1 : 0}
    >
      {item.favorite && <FavoriteStamp />}
      <img
        className="coverflow-cover"
        src={item.coverImage}
        alt={`Portada de ${item.album}`}
        loading="lazy"
      />
    </button>
  );
}

function MonthTabs({ months, selectedKey, onSelect }) {
  const activeRef = useRef(null);
  const nowKey = currentMonthKey();

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [selectedKey]);

  return (
    <nav className="month-tabs" aria-label="Meses del año">
      {months.map((month) => {
        const isActive = month.key === selectedKey;
        // The current month and any future ones haven't happened yet, so
        // there's nothing to pick favorites from — keep them visible but
        // unclickable instead of hiding them.
        const isDisabled = month.key >= nowKey;
        return (
          <button
            key={month.key}
            ref={isActive ? activeRef : null}
            type="button"
            className={`month-tab${isActive ? ' month-tab--active' : ''}`}
            onClick={() => onSelect(month.key)}
            disabled={isDisabled}
          >
            {month.label}
          </button>
        );
      })}
    </nav>
  );
}

function CoverFlow({ monthlyAlbums, selectedMonthKey, onSelectMonth }) {
  const selectedMonth =
    monthlyAlbums.find((m) => m.key === selectedMonthKey) ?? monthlyAlbums[0];
  const albums = selectedMonth.albums;

  const orderedAlbums = useMemo(() => withFavoriteCentered(albums), [albums]);
  const favoriteIndex = orderedAlbums.findIndex((a) => a.favorite);
  const targetIndex = favoriteIndex >= 0 ? favoriteIndex : 0;

  const [renderedAlbums, setRenderedAlbums] = useState(orderedAlbums);
  const [activeIndex, setActiveIndex] = useState(targetIndex);
  // Separate from activeIndex on purpose: activeIndex drives the covers'
  // fan position (and gets nudged below so it has somewhere to animate
  // from), but the caption/ambient background should jump straight to the
  // target album — tying them to the nudged index made the text and blurred
  // backdrop flash to the wrong album for a frame before correcting.
  const [displayIndex, setDisplayIndex] = useState(targetIndex);

  // On a month switch, nudge one step off the target first so the effect
  // below always has somewhere to slide *from* — otherwise the leftover
  // index from whatever month you were just on sometimes already matched
  // this month's target, and the entrance animation silently skipped. Kept
  // to a single step (not the far edge) so it reads as a small settle
  // instead of a distracting sweep across the whole stage.
  if (orderedAlbums !== renderedAlbums) {
    setRenderedAlbums(orderedAlbums);
    const lastIndex = orderedAlbums.length - 1;
    const nudged = targetIndex < lastIndex ? targetIndex + 1 : targetIndex - 1;
    setActiveIndex(Math.max(0, Math.min(lastIndex, nudged)));
    setDisplayIndex(targetIndex);
  }

  const touchStartX = useRef(null);
  const stageRef = useRef(null);

  useEffect(() => {
    setActiveIndex(targetIndex);
    setDisplayIndex(targetIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderedAlbums]);

  const goTo = (i) => {
    const clamped = Math.max(0, Math.min(orderedAlbums.length - 1, i));
    setActiveIndex(clamped);
    setDisplayIndex(clamped);
  };
  const prev = () => goTo(activeIndex - 1);
  const next = () => goTo(activeIndex + 1);

  const active = orderedAlbums[displayIndex];

  useEffect(() => {
    const el = stageRef.current;
    if (!el || orderedAlbums.length === 0) return;
    function handleKey(e) {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    }
    el.addEventListener('keydown', handleKey);
    return () => el.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, orderedAlbums.length]);

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 40) prev();
    else if (delta < -40) next();
    touchStartX.current = null;
  }

  return (
    <div className="coverflow">
      {active && (
        <div
          className="coverflow-ambient"
          style={{ backgroundImage: `url(${active.coverImage})` }}
          aria-hidden
        />
      )}

      <MonthTabs
        months={monthlyAlbums}
        selectedKey={selectedMonth.key}
        onSelect={onSelectMonth}
      />

      {!active ? (
        <div className="shelf-empty-state">
          <p>Todavía no hay discos guardados para {selectedMonth.label}.</p>
        </div>
      ) : (
        <div className="coverflow-body">
          <div
            className="coverflow-stage"
            ref={stageRef}
            tabIndex={0}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {orderedAlbums.map((item, i) => (
              <CoverFlowItem
                key={item.album + item.artist}
                item={item}
                offset={i - activeIndex}
                isActive={i === activeIndex}
                onSelect={() => goTo(i)}
              />
            ))}
          </div>

          <div className="coverflow-caption">
            <p className="coverflow-caption-album">{active.album}</p>
            <p className="coverflow-caption-artist">{active.artist}</p>
            {active.genres?.length > 0 && (
              <div className="coverflow-genres">
                {active.genres.map((genre) => (
                  <span key={genre} className="coverflow-genre-tag">
                    {genre}
                  </span>
                ))}
              </div>
            )}
            {active.review && <p className="coverflow-review">{active.review}</p>}
          </div>

          {active.link && (
            <a
              href={active.link}
              target="_blank"
              rel="noopener noreferrer"
              className="coverflow-listen-link"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M3 18v-6a9 9 0 0 1 18 0v6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
              Escuchar
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default CoverFlow;
