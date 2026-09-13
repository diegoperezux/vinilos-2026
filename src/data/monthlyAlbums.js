// Curated by hand, month by month — no APIs involved.
// Each month holds up to 5 favorite albums:
// { album, artist, coverImage, genres, review, nota, link, favorite }.
// `genres` is 1-3 short genre tags. `review` is a short hand-written blurb
// shown on the CoverFlow itself. `favorite: true` marks the one album that
// opens centered in the CoverFlow.
export const monthlyAlbums = [
  {
    key: "2026-01",
    label: "Enero",
    albums: [
      {
        album: "Shaking Hand",
        artist: "Shaking Hand",
        coverImage: "https://f4.bcbits.com/img/a1359376198_10.jpg",
        link: "https://shakinghandband.bandcamp.com/album/shaking-hand",
        genres: ["Post-Rock", "Indie"],
        review:
          "Debutan con un post-rock frío y técnico, de guitarras entrelazadas y silencios calculados. Hay algo de invierno en cómo construyen la tensión antes de soltarla.",
      },
      {
        album: "Can I Get A Pack Of Camel Lights?",
        artist: "Geologist",
        coverImage: "https://f4.bcbits.com/img/a3812022786_10.jpg",
        link: "https://geologist.bandcamp.com/album/can-i-get-a-pack-of-camel-lights",
        genres: ["Neo-Psicodelia", "Post-Rock"],
        review:
          "Geologist, de Animal Collective, firma un disco instrumental hipnótico de texturas psicodélicas. Se siente más para perderse de noche que para escuchar con atención.",
      },
      {
        album: "True Blue",
        artist: "Blanket",
        coverImage:
          "https://e.snmc.io/i/600/w/858f9f8db88730e00b3834d9416f0ff1/14172830/blanket-true-blue-Cover-Art.jpg",
        link: "https://open.spotify.com/album/1AhmI9HBzRpsappQBChYEN",
        genres: ["Shoegaze", "Alt Metal"],
        review:
          "Suavizan el shoegaze pesado de sus discos anteriores hacia algo más luminoso y nostálgico. Después de tanta oscuridad, aquí buscan belleza en los momentos pequeños.",
      },
      {
        album: "Please Delete This",
        artist: "Double Life",
        coverImage: "https://f4.bcbits.com/img/a2018850687_10.jpg",
        link: "https://doublelifehc.bandcamp.com/album/please-delete-this",
        genres: ["Post-Hardcore"],
        review:
          "Post-hardcore directo y ansioso, con esa urgencia de banda que necesita sacarse algo de encima ya. No se anda con rodeos.",
      },
      {
        album: "Secret Love",
        artist: "Dry Cleaning",
        coverImage: "https://f4.bcbits.com/img/a4213216818_10.jpg",
        link: "https://drycleaning.bandcamp.com/album/secret-love",
        favorite: true,
        genres: ["Post-Punk", "Indie Rock"],
        review:
          "Dry Cleaning sigue fiel a su fórmula: post-punk seco con la voz hablada y deadpan de Florence Shaw flotando encima, casi indiferente. No grita nada, pero se queda pegado.",
      },
    ],
  },
  { key: "2026-02", label: "Febrero", albums: [] },
  { key: "2026-03", label: "Marzo", albums: [] },
  { key: "2026-04", label: "Abril", albums: [] },
  { key: "2026-05", label: "Mayo", albums: [] },
  { key: "2026-06", label: "Junio", albums: [] },
  { key: "2026-07", label: "Julio", albums: [] },
  { key: "2026-08", label: "Agosto", albums: [] },
  { key: "2026-09", label: "Septiembre", albums: [] },
  { key: "2026-10", label: "Octubre", albums: [] },
  { key: "2026-11", label: "Noviembre", albums: [] },
  { key: "2026-12", label: "Diciembre", albums: [] },
];
