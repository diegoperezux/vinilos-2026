import { useEffect, useState } from 'react';
import { LASTFM_API_KEY, LASTFM_USER } from '../utils/lastfmConfig';
import { monthlyAlbums } from '../data/monthlyAlbums';

const CANDIDATES = 30;
const CACHE_KEY = 'vinilos:rising-album';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

// "Goo (Deluxe Edition)" and "Goo" should count as the same album, and
// Last.fm vs MusicBrainz disagree on casing, accents and punctuation.
function normalize(text) {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s*[([][^)\]]*(deluxe|edition|remaster|expanded|anniversary|bonus)[^)\]]*[)\]]/gi, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

const albumKey = (album, artist) => `${normalize(artist)}|${normalize(album)}`;

// Albums already on the shelf aren't "rising" anymore — they made the cut.
const PICKED = new Set(
  monthlyAlbums.flatMap((m) => m.albums.map((a) => albumKey(a.album, a.artist))),
);

const quote = (s) => `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

async function findRisingAlbum() {
  const topUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getTopAlbums&period=1month&limit=${CANDIDATES}&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json`;
  const topRes = await fetch(topUrl);
  if (!topRes.ok) throw new Error('Last.fm fetch failed');
  const top = (await topRes.json()).topalbums?.album ?? [];
  const candidates = top.filter((a) => !PICKED.has(albumKey(a.name, a.artist.name)));
  if (candidates.length === 0) return null;

  // Last.fm has no reliable release dates, so ask MusicBrainz which of these
  // albums first came out this year — one batched query instead of one per
  // album, since MusicBrainz allows roughly a request per second. Its
  // first-release date ignores reissues (a 2026 deluxe Rubber Soul is 1965).
  const year = new Date().getFullYear();
  const clauses = candidates
    .map((a) => `(releasegroup:${quote(a.name)} AND artist:${quote(a.artist.name)})`)
    .join(' OR ');
  const query = `(${clauses}) AND firstreleasedate:[${year}-01-01 TO ${year}-12-31]`;
  const mbRes = await fetch(
    `https://musicbrainz.org/ws/2/release-group?fmt=json&limit=100&query=${encodeURIComponent(query)}`,
  );
  if (!mbRes.ok) throw new Error('MusicBrainz fetch failed');
  const groups = (await mbRes.json())['release-groups'] ?? [];

  // The search is fuzzy, so only trust exact title + artist matches.
  const releasedThisYear = new Set(
    groups.map((g) =>
      albumKey(
        g.title,
        (g['artist-credit'] ?? []).map((c) => c.name + (c.joinphrase ?? '')).join(''),
      ),
    ),
  );

  // Candidates are already sorted by plays, so the first match is the one
  // you've played most.
  const rising = candidates.find((a) => releasedThisYear.has(albumKey(a.name, a.artist.name)));
  if (!rising) return null;
  return {
    album: rising.name,
    artist: rising.artist.name,
    plays: Number(rising.playcount),
    url: rising.url,
    image: rising.image?.find((i) => i.size === 'extralarge')?.['#text'] || null,
  };
}

function readCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) return cached;
  } catch {
    // corrupt or unavailable storage — just refetch
  }
  return null;
}

// Shared across the sidebar and mobile footer copies so a visit makes at
// most one round of requests, and cached for a few hours across visits.
let pending = null;
function loadRisingAlbum() {
  const cached = readCache();
  if (cached) return Promise.resolve(cached.album);
  if (!pending) {
    pending = findRisingAlbum()
      .then((album) => {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ album, savedAt: Date.now() }));
        } catch {
          // storage full or blocked — fine, it just won't persist
        }
        return album;
      })
      .finally(() => {
        pending = null;
      });
  }
  return pending;
}

export function useRisingAlbum() {
  const [album, setAlbum] = useState(null);

  useEffect(() => {
    let cancelled = false;
    loadRisingAlbum()
      .then((result) => {
        if (!cancelled) setAlbum(result);
      })
      .catch(() => {
        // silently fail — row just won't render
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return album;
}
