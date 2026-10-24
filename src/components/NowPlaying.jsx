import { useState, useEffect } from 'react';
import { LASTFM_API_KEY, LASTFM_USER } from '../utils/lastfmConfig';

const POLL_MS = 30_000;

// Last.fm's grey star placeholder for tracks without artwork.
const PLACEHOLDER_IMAGE = '2a96cbd8b46e442fc41c2b86b821562f';

async function fetchRecentTrack() {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json&limit=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Last.fm fetch failed');
  const data = await res.json();
  const track = data.recenttracks?.track?.[0];
  if (!track) return null;
  const image = track.image?.find((i) => i.size === 'extralarge')?.['#text'];
  return {
    title: track.name,
    artist: track.artist['#text'],
    nowPlaying: track['@attr']?.nowplaying === 'true',
    url: track.url,
    image: image && !image.includes(PLACEHOLDER_IMAGE) ? image : null,
  };
}

export function useRecentTrack() {
  const [track, setTrack] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const result = await fetchRecentTrack();
        if (!cancelled) setTrack(result);
      } catch {
        // silently fail — row just won't render
      }
    };

    load();
    const id = setInterval(load, POLL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return track;
}
