import { vinyls as seedVinyls } from "../data/vinyls";

const STORAGE_KEY = "vinilos2026_vinyls";

export function loadVinyls() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      try {
        return JSON.parse(raw);
      } catch (parseError) {
        console.error(
          "loadVinyls: JSON parse error, resetting to seed data",
          parseError,
        );
        // Corrupted JSON — fall through to re-seed
      }
    }
  } catch (storageError) {
    console.error("loadVinyls: localStorage read failed", storageError);
  }

  // Re-seed with default data
  saveVinyls(seedVinyls);
  return seedVinyls;
}

export function saveVinyls(vinyls) {
  if (!Array.isArray(vinyls)) {
    console.error("saveVinyls: vinyls must be an array", vinyls);
    return false;
  }

  try {
    const json = JSON.stringify(vinyls);
    localStorage.setItem(STORAGE_KEY, json);
    return true;
  } catch (e) {
    if (e.name === "QuotaExceededError") {
      console.error("saveVinyls: localStorage quota exceeded", e);
    } else {
      console.error("saveVinyls: localStorage write failed", e);
    }
    return false;
  }
}

export function exportVinyls() {
  try {
    const vinyls = loadVinyls();
    if (!Array.isArray(vinyls)) {
      console.error("exportVinyls: loaded vinyls is not an array", vinyls);
      return;
    }

    const json = JSON.stringify(vinyls, null, 2);
    const content = `export const vinyls = ${json};\n`;
    const blob = new Blob([content], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vinyls.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("exportVinyls: export failed", e);
  }
}
