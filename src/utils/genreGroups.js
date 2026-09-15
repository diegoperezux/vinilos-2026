// The album data carries specific micro-genre tags (Sasscore, Midwest Emo,
// Neo-Psicodelia...) which is great on an album's own caption but is too
// granular for a browsable index — 40+ tags to scan. This maps each specific
// tag to one broad umbrella so the sidebar can list a handful of categories
// instead, while album cards keep showing their exact tag.
export const GENRE_GROUPS = {
  Punk: ["Post-Punk", "Art Punk", "Jazz Punk", "Synth Punk", "Industrial Punk", "Sasscore"],
  "Hardcore, Screamo & Metal": [
    "Post-Hardcore",
    "Screamo",
    "Mathcore",
    "Metalcore",
    "Midwest Emo",
    "Sludge Metal",
    "Post-Metal",
    "Alt Metal",
  ],
  "Rock & Indie": [
    "Indie Rock",
    "Indie",
    "Art Rock",
    "Prog Rock",
    "Space Rock",
    "Stoner Rock",
    "Alt-Country",
    "Chamber Pop",
  ],
  "Noise & Experimental": [
    "Noise Rock",
    "Math Rock",
    "Post-Rock",
    "Experimental Rock",
    "Shoegaze",
    "Slowcore",
  ],
  "Folk & Singer-Songwriter": ["Folk", "Indie Folk", "Psych Folk", "Singer-Songwriter", "Americana"],
  Electronic: ["IDM", "Ambient", "Electronic", "Synthwave", "Futurepop", "EBM"],
  "Jazz & Other": ["Jazz", "Minimalism", "Neo-Psicodelia", "Alt R&B", "Disco"],
};

const TAG_TO_GROUP = Object.fromEntries(
  Object.entries(GENRE_GROUPS).flatMap(([group, tags]) => tags.map((tag) => [tag, group])),
);

export function getGenreGroupNames() {
  return Object.keys(GENRE_GROUPS);
}

// Every album tagged with any genre that falls under this umbrella, across
// all months, newest-tag-match kept alongside so results can still show the
// album's specific tag.
export function getAlbumsByGenreGroup(monthlyAlbums, groupName) {
  const tagsInGroup = new Set(GENRE_GROUPS[groupName] ?? []);
  const results = [];
  monthlyAlbums.forEach((month) => {
    month.albums.forEach((album) => {
      const matchedTags = (album.genres ?? []).filter((tag) => tagsInGroup.has(tag));
      if (matchedTags.length > 0) {
        results.push({
          ...album,
          monthLabel: month.label,
          monthKey: month.key,
          matchedTags,
        });
      }
    });
  });
  return results;
}

// Which umbrella a specific tag belongs to — unused tags (typos, future
// additions not yet mapped) fall back to their own name so nothing vanishes.
export function groupForTag(tag) {
  return TAG_TO_GROUP[tag] ?? tag;
}
