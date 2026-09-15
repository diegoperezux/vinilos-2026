import { getGenreGroupNames, getAlbumsByGenreGroup } from "../utils/genreGroups";

// Sidebar list of the broad genre umbrellas (Punk, Metal, Electronic...).
// Clicking one opens GenreResults in the main panel instead of the CoverFlow.
export function GenreIndex({ activeGroup, onSelectGroup }) {
  const groups = getGenreGroupNames();

  return (
    <div className="genre-index">
      <p className="genre-index-title">Géneros</p>
      <div className="genre-list">
        {groups.map((group) => (
          <button
            key={group}
            type="button"
            className={`genre-chip${group === activeGroup ? " genre-chip--active" : ""}`}
            onClick={() => onSelectGroup(group)}
          >
            {group}
          </button>
        ))}
      </div>
    </div>
  );
}

function GenreResultCard({ album }) {
  return (
    <li className="genre-result">
      <img
        className="genre-result-cover"
        src={album.coverImage}
        alt={`Portada de ${album.album}`}
        loading="lazy"
      />
      <div className="genre-result-body">
        <p className="genre-result-month">{album.monthLabel}</p>
        <p className="genre-result-album">{album.album}</p>
        <p className="genre-result-artist">{album.artist}</p>
        {album.matchedTags?.length > 0 && (
          <div className="genre-result-tags">
            {album.matchedTags.map((tag) => (
              <span key={tag} className="genre-result-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
        {album.review && <p className="genre-result-review">{album.review}</p>}
        {album.link && (
          <a
            href={album.link}
            target="_blank"
            rel="noopener noreferrer"
            className="genre-result-link"
          >
            Escuchar
          </a>
        )}
      </div>
    </li>
  );
}

// Full-panel search results for a genre umbrella, replacing the CoverFlow.
export function GenreResults({ monthlyAlbums, group, onClose }) {
  const albums = getAlbumsByGenreGroup(monthlyAlbums, group);

  return (
    <div className="genre-view">
      <button type="button" className="genre-view-back" onClick={onClose}>
        ← Volver
      </button>

      <h2 className="genre-view-title">
        {group}
        <span className="genre-view-count">
          {albums.length} {albums.length === 1 ? "disco" : "discos"}
        </span>
      </h2>

      <ul className="genre-results-list">
        {albums.map((album) => (
          <GenreResultCard key={album.monthKey + album.album + album.artist} album={album} />
        ))}
      </ul>
    </div>
  );
}
