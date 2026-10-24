// Renders one album pick as a 1080×1920 Instagram story PNG, drawn on a
// canvas in the site's own look (blurred cover backdrop, cream type).

const W = 1080;
const H = 1920;
// Instagram covers roughly the top and bottom 250px with its own UI
// (progress bar, profile, reply box) — keep all content between these.
const SAFE_TOP = 250;
const SAFE_BOTTOM = H - 250;
// Left empty on purpose: room above Instagram's reply bar to drop a link
// sticker (to the website) when posting. All drawn content ends above it.
const STICKER_ZONE_TOP = SAFE_BOTTOM - 170;

const COLORS = {
  title: '#f0e6d0',
  muted: '#9f9485',
  faint: 'rgba(240, 230, 208, 0.45)',
  line: 'rgba(255, 255, 255, 0.22)',
  star: '#f2c94c',
};

const SANS = "'DM Sans', system-ui, sans-serif";
const MONO = "'Space Mono', 'Courier New', monospace";

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Spotify's CDN sends Access-Control-Allow-Origin: *, so the cover can
    // be drawn without tainting the canvas (which would block toBlob).
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar la portada: ${src}`));
    img.src = src;
  });
}

// Canvas text only uses a web font if it's already loaded, otherwise it
// silently falls back to the system font.
async function ensureFonts() {
  await Promise.all([
    document.fonts.load(`800 64px ${SANS}`),
    document.fonts.load(`400 40px ${SANS}`),
    document.fonts.load(`400 28px ${MONO}`),
  ]);
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, s, l];
}

const hsl = (h, s, l, a = 1) =>
  `hsla(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%, ${a})`;

// The cover's main color: bucket pixels by hue, weighting each by how
// saturated it is, so a red jacket on a mostly grey photo still reads as
// red. Near-black/white pixels are ignored; a fully grey cover falls back
// to a desaturated average.
function dominantHue(img) {
  const size = 48;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const cctx = c.getContext('2d', { willReadFrequently: true });
  cctx.drawImage(img, 0, 0, size, size);
  const { data } = cctx.getImageData(0, 0, size, size);

  const BINS = 18;
  const bins = Array.from({ length: BINS }, () => ({ weight: 0, h: 0, s: 0 }));
  let greyL = 0;
  let greyCount = 0;
  for (let i = 0; i < data.length; i += 4) {
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    if (l < 0.08 || l > 0.95) continue;
    greyL += l;
    greyCount++;
    if (s < 0.15) continue;
    // Mid-lightness pixels carry the color best; fade out the extremes.
    const weight = s * (1 - Math.abs(l - 0.5) * 1.4);
    const bin = bins[Math.floor(h / (360 / BINS)) % BINS];
    bin.weight += weight;
    bin.h += h * weight;
    bin.s += s * weight;
  }

  const best = bins.reduce((a, b) => (b.weight > a.weight ? b : a));
  if (best.weight < size * size * 0.02) {
    return { h: 30, s: 0.08, l: greyCount ? greyL / greyCount : 0.3 };
  }
  return { h: best.h / best.weight, s: best.s / best.weight, l: 0.5 };
}

// Canvas filter blur where supported (Chrome, Firefox, Safari 18+);
// older browsers ignore the property and keep it at 'none'.
function supportsCanvasFilter(ctx) {
  ctx.filter = 'blur(1px)';
  const ok = ctx.filter === 'blur(1px)';
  ctx.filter = 'none';
  return ok;
}

// Blurred cover tinted with its main color. The cover is first shrunk to a
// handful of pixels (a blur that works everywhere), then scaled up through
// a real blur filter when available to melt the remaining blockiness.
function drawBlurredBackdrop(ctx, img) {
  const tint = dominantHue(img);
  // Keep the tint rich but never neon, and dark enough for cream text.
  const sat = Math.min(0.7, Math.max(tint.s, tint.s < 0.15 ? tint.s : 0.4));

  ctx.fillStyle = hsl(tint.h, sat, 0.16);
  ctx.fillRect(0, 0, W, H);

  const small = document.createElement('canvas');
  small.width = 6;
  small.height = 10;
  small.getContext('2d').drawImage(img, 0, 0, small.width, small.height);

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  if (supportsCanvasFilter(ctx)) ctx.filter = 'blur(140px) saturate(1.2)';
  ctx.globalAlpha = 0.75;
  // Generous overscan so the blur's soft edges never show at the borders.
  ctx.drawImage(small, -400, -400, W + 800, H + 800);
  ctx.restore();

  // Recolor toward the main hue while keeping the cover's light and dark
  // areas, then lay a translucent wash of the same color on top.
  ctx.save();
  ctx.globalCompositeOperation = 'color';
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = hsl(tint.h, sat, 0.5);
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  ctx.fillStyle = hsl(tint.h, sat, 0.2, 0.35);
  ctx.fillRect(0, 0, W, H);

  // Darken toward the edges into a deep shade of the tint, not plain black,
  // so the color carries all the way out like the site's ambient backdrop.
  const vignette = ctx.createRadialGradient(W / 2, H * 0.36, 0, W / 2, H * 0.36, H * 0.8);
  vignette.addColorStop(0, hsl(tint.h, sat, 0.06, 0));
  vignette.addColorStop(0.65, hsl(tint.h, sat, 0.06, 0.5));
  vignette.addColorStop(1, hsl(tint.h, sat, 0.04, 0.9));
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

function roundedRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCover(ctx, img, x, y, size) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 24;
  roundedRectPath(ctx, x, y, size, size, 14);
  ctx.fillStyle = '#000';
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundedRectPath(ctx, x, y, size, size, 14);
  ctx.clip();
  ctx.drawImage(img, x, y, size, size);
  ctx.restore();
}

// Same 8-point star as the CoverFlow's FavoriteStamp, scaled from its
// 24×24 viewBox.
const STAR_POINTS = [
  12, 2, 13.15, 9.28, 19.07, 4.93, 14.77, 10.85, 22, 12, 14.77, 13.15, 19.07, 19.07,
  13.15, 14.77, 12, 22, 10.85, 14.77, 4.93, 19.07, 9.23, 13.15, 2, 12, 9.23, 10.85,
  4.93, 4.93, 10.85, 9.23,
];

function drawStar(ctx, x, y, size) {
  const s = size / 24;
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < STAR_POINTS.length; i += 2) {
    const px = x + STAR_POINTS[i] * s;
    const py = y + STAR_POINTS[i + 1] * s;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 12;
  ctx.fillStyle = COLORS.star;
  ctx.fill();
  ctx.restore();
}

// Greedy word wrap; the last allowed line gets an ellipsis if text remains.
function wrapLines(ctx, text, maxWidth, maxLines) {
  if (maxLines <= 0) return [];
  const words = text.split(/\s+/);
  const lines = [];
  let current = '';
  for (let i = 0; i < words.length; i++) {
    const candidate = current ? `${current} ${words[i]}` : words[i];
    if (ctx.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
      continue;
    }
    lines.push(current);
    current = words[i];
    if (lines.length === maxLines) {
      current = null;
      break;
    }
  }
  if (current) lines.push(current);

  const truncated = lines.length === maxLines && lines.join(' ').length < text.length;
  if (truncated) {
    let last = lines[maxLines - 1];
    while (last && ctx.measureText(`${last}…`).width > maxWidth) {
      last = last.slice(0, -1);
    }
    lines[maxLines - 1] = `${last.replace(/[\s,.;:]+$/, '')}…`;
  }
  return lines;
}

function drawCenteredLines(ctx, lines, y, lineHeight) {
  lines.forEach((line, i) => ctx.fillText(line, W / 2, y + i * lineHeight));
  return y + lines.length * lineHeight;
}

// Mono letter-spaced label, like the site's uppercase section headings.
function drawSpacedLabel(ctx, text, y) {
  ctx.font = `400 28px ${MONO}`;
  ctx.fillStyle = COLORS.muted;
  if ('letterSpacing' in ctx) ctx.letterSpacing = '6px';
  ctx.fillText(text.toUpperCase(), W / 2, y);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
}

function drawGenrePills(ctx, genres, y) {
  if (!genres?.length) return y;
  ctx.font = `400 28px ${MONO}`;
  const padX = 26;
  const height = 56;
  const gap = 16;
  const widths = genres.map((g) => ctx.measureText(g).width + padX * 2);
  const total = widths.reduce((a, b) => a + b, 0) + gap * (genres.length - 1);
  let x = (W - total) / 2;

  genres.forEach((genre, i) => {
    roundedRectPath(ctx, x, y, widths[i], height, height / 2);
    ctx.strokeStyle = COLORS.line;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = COLORS.muted;
    ctx.textBaseline = 'middle';
    ctx.fillText(genre, x + widths[i] / 2, y + height / 2 + 1);
    ctx.textBaseline = 'alphabetic';
    x += widths[i] + gap;
  });
  return y + height;
}

export async function renderStoryImage({ album, monthLabel, year }) {
  await ensureFonts();
  const cover = await loadImage(album.coverImage);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.textAlign = 'center';

  drawBlurredBackdrop(ctx, cover);

  // Header: what this is and which month.
  drawSpacedLabel(ctx, album.favorite ? `Mi favorito de ${monthLabel}` : `Mi Top ${year}`, SAFE_TOP + 30);
  ctx.font = `800 72px ${SANS}`;
  ctx.fillStyle = COLORS.title;
  ctx.fillText(album.favorite ? `Mi Top ${year}` : monthLabel, W / 2, SAFE_TOP + 115);

  // Cover.
  const coverSize = 600;
  const coverX = (W - coverSize) / 2;
  const coverY = SAFE_TOP + 165;
  drawCover(ctx, cover, coverX, coverY, coverSize);
  if (album.favorite) drawStar(ctx, coverX + coverSize - 92, coverY + 26, 66);

  // Caption: album, artist, genres, review — stacked, each pushing the next.
  let y = coverY + coverSize + 95;
  ctx.font = `800 62px ${SANS}`;
  ctx.fillStyle = COLORS.title;
  y = drawCenteredLines(ctx, wrapLines(ctx, album.album, W - 180, 2), y, 72);

  ctx.font = `400 42px ${SANS}`;
  ctx.fillStyle = COLORS.muted;
  y = drawCenteredLines(ctx, [album.artist], y - 8, 56);

  y = drawGenrePills(ctx, album.genres, y + 14);

  if (album.review) {
    ctx.font = `400 32px ${SANS}`;
    ctx.fillStyle = COLORS.faint;
    const reviewTop = y + 60;
    const lineHeight = 46;
    const roomForLines = Math.floor((STICKER_ZONE_TOP - 20 - reviewTop) / lineHeight) + 1;
    const lines = wrapLines(ctx, album.review, W - 200, Math.max(0, Math.min(4, roomForLines)));
    drawCenteredLines(ctx, lines, reviewTop, lineHeight);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/png');
  });
}
