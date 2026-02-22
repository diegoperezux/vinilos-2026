import { vinyls as seedVinyls } from '../data/vinyls';

const STORAGE_KEY = 'vinilos2026_vinyls';

export function loadVinyls() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) return JSON.parse(raw);
  } catch {
    // Corrupted JSON — fall through to re-seed
  }
  saveVinyls(seedVinyls);
  return seedVinyls;
}

export function saveVinyls(vinyls) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vinyls));
  } catch (e) {
    console.error('saveVinyls: localStorage write failed', e);
  }
}

export function exportVinyls() {
  const vinyls = loadVinyls();
  const json = JSON.stringify(vinyls, null, 2);
  const content = `export const vinyls = ${json};\n`;
  const blob = new Blob([content], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vinyls.js';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
