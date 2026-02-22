import { useState, useEffect } from 'react';

const API_KEY = import.meta.env.VITE_LASTFM_API_KEY;
const USER = import.meta.env.VITE_LASTFM_USER;
const POLL_MS = 30_000;

async function fetchRecentTrack() {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${USER}&api_key=${API_KEY}&format=json&limit=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Last.fm fetch failed');
  const data = await res.json();
  const track = data.recenttracks?.track?.[0];
  if (!track) return null;
  return {
    title: track.name,
    artist: track.artist['#text'],
    nowPlaying: track['@attr']?.nowplaying === 'true',
  };
}

export default function NowPlaying() {
  const [track, setTrack] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const result = await fetchRecentTrack();
        if (!cancelled) setTrack(result);
      } catch {
        // silently fail — widget just won't render
      }
    };

    load();
    const id = setInterval(load, POLL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  if (!track) return null;

  return (
    <a
      className="now-playing"
      href="https://www.last.fm/user/DiegoCorona"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Ver perfil de Last.fm"
    >
      <span className="now-playing-status">
        <span className="now-playing-bars" aria-hidden>
          <span /><span /><span /><span />
        </span>
        {track.nowPlaying ? 'Escuchando ahora' : 'Última escucha'}
      </span>
      <span className="now-playing-title">{track.title}</span>
      <span className="now-playing-artist">{track.artist}</span>
    </a>
  );
}
