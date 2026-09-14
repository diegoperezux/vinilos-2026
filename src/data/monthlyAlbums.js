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
        link: "https://open.spotify.com/album/5jQFmLgCt7SJCPUgs10snC",
        genres: ["Post-Rock", "Indie"],
        review:
          "Debutan con un post-rock frío y técnico, de guitarras entrelazadas y silencios calculados. Hay algo de invierno en cómo construyen la tensión antes de soltarla.",
      },
      {
        album: "Can I Get A Pack Of Camel Lights?",
        artist: "Geologist",
        coverImage: "https://f4.bcbits.com/img/a3812022786_10.jpg",
        link: "https://open.spotify.com/album/1gBYIHCA0Hdn8BFCTK5TgV",
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
        link: "https://open.spotify.com/album/08xub706Kmakv4Ky9WXyMF",
        genres: ["Post-Hardcore"],
        review:
          "Post-hardcore directo y ansioso, con esa urgencia de banda que necesita sacarse algo de encima ya. No se anda con rodeos.",
      },
      {
        album: "Secret Love",
        artist: "Dry Cleaning",
        coverImage: "https://f4.bcbits.com/img/a4213216818_10.jpg",
        link: "https://open.spotify.com/album/79o6ZvFsXaAkL9MHCE6ts4",
        favorite: true,
        genres: ["Post-Punk", "Indie Rock"],
        review:
          "Dry Cleaning sigue fiel a su fórmula: post-punk seco con la voz hablada y deadpan de Florence Shaw flotando encima, casi indiferente. No grita nada, pero se queda pegado.",
      },
    ],
  },
  {
    key: "2026-02",
    label: "Febrero",
    albums: [
      {
        album: "Disco II – Monomyth",
        artist: "La Petite Mort / Little Death",
        coverImage: "https://i.scdn.co/image/ab67616d0000b273b9caa514825ace6e347ea76d",
        link: "https://open.spotify.com/album/4MNv7bAu0VG3IF8P0EA3Rq",
        favorite: true,
        genres: ["Screamo", "Math Rock"],
        review:
          "Su disco más accesible hasta ahora, aunque sigue siendo un caos calculado entre screamo, math rock y pop-punk. Cambian de humor cada 30 segundos y de alguna manera funciona.",
      },
      {
        album: "Casting Lines: A Museum of Memory (Vol. IV)",
        artist: "Birch Book",
        coverImage: "https://i.scdn.co/image/ab67616d0000b273dcd2be680e0bb000a833efed",
        link: "https://open.spotify.com/album/2Y1lyMrTPKWuz8Cfpt81vg",
        genres: ["Psych Folk", "Singer-Songwriter"],
        review:
          "Folk susurrado y fingerpicking delicado, con melodías que crecen despacio hasta sentirse casi fantasmales. Íntimo e invernal, para escuchar solo.",
      },
      {
        album: "Like A Poet, Keen To The Rustle Of Leaves",
        artist: "Limbs",
        coverImage: "https://i.scdn.co/image/ab67616d0000b273855f38f6c174d3fa2dc784de",
        link: "https://open.spotify.com/album/0d2GLDLlAqkkWUh1rtnVbg",
        genres: ["Screamo", "Mathcore"],
        review:
          "Screamo caótico y técnico que no se está quieto ni un segundo, puro mathcore nervioso con gritos que cortan. Agotador en el buen sentido.",
      },
      {
        album: "Existence is Bliss",
        artist: "DEADLETTER",
        coverImage: "https://i.scdn.co/image/ab67616d0000b27396b7028e2859fe8657fd7f00",
        link: "https://open.spotify.com/album/6NDqH5ZIddisuPe0z6BuFx",
        genres: ["Post-Punk", "Art Punk"],
        review:
          "Post-punk anguloso con saxofón al frente y un humor teatral y sarcástico. Este segundo disco se mete más en jazz y art-rock que su debut.",
      },
      {
        album: "Somersaults",
        artist: "deathcrash",
        coverImage: "https://i.scdn.co/image/ab67616d0000b273d63d8fd6406f8faa1ff73bed",
        link: "https://open.spotify.com/album/7hcLdGZHxJkqJQrbbE7tuv",
        genres: ["Slowcore", "Post-Rock"],
        review:
          "Slowcore melancólico que se pasea entre lo atmosférico del post-rock y estallidos de emo contenido. Su tercer disco, y el más maduro hasta ahora.",
      },
    ],
  },
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
