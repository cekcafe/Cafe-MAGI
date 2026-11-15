// Pembuat tampilan (HTML). Fungsi di sini hanya mengubah data menjadi teks HTML, tanpa menyentuh database.
import { LABEL, esc, status, isStale, ago, mapQuery, countByState } from "./utils.js";

const CHIPS = [["semua", "Semua"], ["sepi", "Sepi"], ["sedang", "Lumayan ramai"], ["ramai", "Ramai"], ["lama", "Data lama"]];

export function chipsHtml(cafes, filter) {
  if (!cafes.length) return "";
  const n = countByState(cafes);
  return CHIPS.filter(([k]) => k === "semua" || n[k] > 0)
    .map(([k, t]) => `<button class="chip" data-f="${k}" aria-pressed="${filter === k}">${t}</button>`).join("");
}

export function authBarHtml(user) {
  return user
    ? `<span>Masuk sebagai ${esc(user.email)}</span><button class="btn ghost sm" id="logout">Keluar</button>`
    : `<button class="btn ghost sm" id="login">Masuk barista</button>`;
}

export function historyHtml(rows) {
  if (!rows) return `<div class="hist"><p>Memuat riwayat…</p></div>`;
  if (rows.length < 3) return `<div class="hist"><p>Riwayat belum cukup. Datanya terkumpul setiap barista memperbarui jumlah orang.</p></div>`;
  const sum = Array(24).fill(0), n = Array(24).fill(0);
  rows.forEach((r) => { const h = new Date(r.ts).getHours(); sum[h] += r.count / Math.max(1, r.capacity); n[h]++; });
  const avg = sum.map((v, i) => (n[i] ? v / n[i] : null));
  const bars = avg.map((v, h) => {
    const cls = v == null ? "" : v < 0.4 ? "sepi" : v < 0.75 ? "sedang" : "ramai";
    const pct = v == null ? 0 : Math.min(100, Math.round(v * 100));
    return `<b class="${cls}" style="height:max(4px,${pct}%)" title="Jam ${h}.00: ${v == null ? "belum ada data" : "terisi " + pct + "%"}"></b>`;
  }).join("");
  const have = avg.map((v, h) => [v, h]).filter((x) => x[0] != null);
  let note = "";
  if (have.length > 1) {
    const lo = have.reduce((a, b) => (b[0] < a[0] ? b : a)), hi = have.reduce((a, b) => (b[0] > a[0] ? b : a));
    if (lo[1] !== hi[1]) note = `<p>Biasanya paling sepi sekitar jam ${lo[1]}.00 dan paling ramai sekitar jam ${hi[1]}.00.</p>`;
  }
  return `<div class="hist"><div class="bars" role="img" aria-label="Rata-rata keramaian per jam">${bars}</div>
    <div class="axis"><span>0</span><span>6</span><span>12</span><span>18</span><span>23</span></div>${note}</div>`;
}

// opts: { owner, showMap, showHist, rows }
export function cardHtml(c, opts) {
  const stale = isStale(c), s = status(c);
  const pct = Math.min(100, Math.round(c.count / Math.max(1, c.capacity) * 100));
  const badge = stale ? "Data lama" : c.count >= c.capacity ? "Penuh" : LABEL[s];
  const warn = c.updatedAt ? "Belum diperbarui lebih dari 2 jam, kondisi sebenarnya mungkin berbeda." : "Barista belum pernah memperbarui jumlah orang.";
  return `<article class="card ${s}${stale ? " stale" : ""}">
    <div class="top"><div><h2>${esc(c.name)}</h2><p class="addr">${esc(c.address)}</p></div><span class="badge">${badge}</span></div>
    <div class="count"><b>${c.count}</b><span>orang dari ${c.capacity} kursi</span></div>
    <div class="meter" role="img" aria-label="Terisi ${pct}%"><i style="width:${pct}%"></i></div>
    ${stale ? `<div class="warn">${warn}</div>` : ""}
    <div class="meta">Diperbarui ${ago(c.updatedAt)}</div>
    ${opts.showHist ? historyHtml(opts.rows) : ""}
    ${opts.showMap ? `<div class="map"><iframe loading="lazy" title="Peta ${esc(c.name)}" src="https://www.google.com/maps?q=${mapQuery(c)}&output=embed"></iframe></div>` : ""}
    <div class="actions">
      <button class="btn sm" data-hist="${esc(c.id)}">${opts.showHist ? "Tutup riwayat" : "Riwayat"}</button>
      <button class="btn sm" data-map="${esc(c.id)}">${opts.showMap ? "Tutup peta" : "Peta"}</button>
      <a class="btn ghost sm" href="https://www.google.com/maps/search/?api=1&query=${mapQuery(c)}" target="_blank" rel="noopener">Google Maps</a>
      <button class="btn ghost sm" data-share="${esc(c.id)}">Bagikan</button>
      ${opts.owner ? `<button class="btn ghost sm" data-upd="${esc(c.id)}">Perbarui jumlah</button>` : ""}
    </div></article>`;
}
