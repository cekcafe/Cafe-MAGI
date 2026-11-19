export const $ = (id) => document.getElementById(id);
export const LABEL = { sepi: "Sepi", sedang: "Lumayan ramai", ramai: "Ramai" };
export const STALE_MS = 2 * 60 * 60 * 1000;

export const esc = (s) => { const d = document.createElement("div"); d.textContent = s ?? ""; return d.innerHTML; };
export const mapQuery = (c) => encodeURIComponent(c.name + " " + c.address);

export function status(c) {
  const r = c.count / Math.max(1, c.capacity);
  return r < 0.4 ? "sepi" : r < 0.75 ? "sedang" : "ramai";
}
export const isStale = (c) => !c.updatedAt || Date.now() - c.updatedAt > STALE_MS;

export function ago(t) {
  if (!t) return "belum pernah diperbarui";
  const m = Math.floor((Date.now() - t) / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return m + " menit lalu";
  const h = Math.floor(m / 60);
  return h < 24 ? h + " jam lalu" : Math.floor(h / 24) + " hari lalu";
}

export function countByState(cafes) {
  const n = { sepi: 0, sedang: 0, ramai: 0, lama: 0 };
  cafes.forEach((c) => n[isStale(c) ? "lama" : status(c)]++);
  return n;
}
export function validFilter(cafes, filter) {
  return filter === "semua" || countByState(cafes)[filter] ? filter : "semua";
}
export function matchesFilter(c, filter) {
  if (filter === "semua") return true;
  return filter === "lama" ? isStale(c) : !isStale(c) && status(c) === filter;
}
