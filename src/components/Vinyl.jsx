function Vinyl({ vinyl, onClick }) {
  return (
    <button
      type="button"
      className="vinyl"
      onClick={() => onClick(vinyl)}
      aria-label={`Abrir ficha de ${vinyl.album} - ${vinyl.artist}`}
    >
      <div className="vinyl-tooltip">
        <span className="vinyl-tooltip-album">{vinyl.album}</span>
        <span className="vinyl-tooltip-artist">{vinyl.artist}</span>
      </div>
      <div className="vinyl-inner">
        {vinyl.coverImage ? (
          <img src={vinyl.coverImage} alt={`Portada de ${vinyl.album}`} className="vinyl-cover" />
        ) : (
          <div className="vinyl-placeholder">
            <span className="vinyl-placeholder-text">{vinyl.album}</span>
          </div>
        )}
      </div>
    </button>
  );
}

export default Vinyl;
