import { useRecentTrack } from './NowPlaying';
import { useRisingAlbum } from './RisingAlbum';

function EqualizerBars({ live }) {
  return (
    <span className={`listen-bars${live ? ' listen-bars--live' : ''}`} aria-hidden>
      <span /><span /><span /><span />
    </span>
  );
}

// One shape for every row (cover, title, artist, status) so the rising album
// and the latest scrobble read as a single list instead of two widgets.
function ListenRow({ href, image, title, subtitle, status }) {
  return (
    <a className="listen-row" href={href} target="_blank" rel="noopener noreferrer">
      {image ? (
        <img className="listen-row-cover" src={image} alt="" loading="lazy" />
      ) : (
        <span className="listen-row-cover listen-row-cover--empty" aria-hidden />
      )}
      <span className="listen-row-text">
        <span className="listen-row-title">{title}</span>
        <span className="listen-row-subtitle">{subtitle}</span>
        <span className="listen-row-status">{status}</span>
      </span>
    </a>
  );
}

export default function ListeningLately() {
  const rising = useRisingAlbum();
  const track = useRecentTrack();

  if (!rising && !track) return null;

  return (
    <section className="listening" aria-label="Lo que estoy escuchando">
      <p className="listening-title">Últimamente</p>
      {rising && (
        <ListenRow
          href={rising.url}
          image={rising.image}
          title={rising.album}
          subtitle={rising.artist}
          status={<>↑ En ascenso este mes</>}
        />
      )}
      {track && (
        <ListenRow
          href={track.url}
          image={track.image}
          title={track.title}
          subtitle={track.artist}
          status={
            <>
              <EqualizerBars live={track.nowPlaying} />
              {track.nowPlaying ? 'Escuchando ahora' : 'Última escucha'}
            </>
          }
        />
      )}
    </section>
  );
}
