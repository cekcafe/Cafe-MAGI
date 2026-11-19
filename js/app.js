import { $, LABEL, status, isStale, validFilter, matchesFilter } from "./utils.js";
import { chipsHtml, authBarHtml, cardHtml } from "./views.js";
import { authReady, watchUser, login, register, logout, authError } from "./auth.js";
import { dbReady, subscribeCafes, addCafe, updateCount, removeCafe, loadHistory, saveError } from "./cafes.js";

let cafes = [], user = null, filter = "semua", cur = null, delArmed = false, authMode = "login";
const openMaps = new Set(), openHist = new Set(), hist = {};

function render() {
  filter = validFilter(cafes, filter);
  $("chips").innerHTML = chipsHtml(cafes, filter);
  $("authBar").innerHTML = authBarHtml(user);
  const q = $("q").value.trim().toLowerCase();
  const list = cafes
    .filter((c) => matchesFilter(c, filter) && (!q || (c.name + " " + c.address).toLowerCase().includes(q)))
    .sort((a, b) => (isStale(a) - isStale(b)) || (a.count / a.capacity - b.count / b.capacity));
  $("grid").innerHTML = list.length
    ? list.map((c) => cardHtml(c, { owner: !!user && c.ownerUid === user.uid, showMap: openMaps.has(c.id), showHist: openHist.has(c.id), rows: hist[c.id] })).join("")
    : `<div class="empty">${cafes.length ? "Tidak ada cafe yang cocok. Coba ubah pencarian atau filter." : "Belum ada cafe. Barista bisa masuk lalu klik “Daftarkan cafe”."}</div>`;
}
async function showHistory(id) {
  hist[id] = await loadHistory(id);
  render();
}

$("chips").addEventListener("click", (e) => { const b = e.target.closest("[data-f]"); if (b) { filter = b.dataset.f; render(); } });
$("q").addEventListener("input", render);

$("grid").addEventListener("click", async (e) => {
  const t = (a) => e.target.closest("[" + a + "]");
  let b;
  if ((b = t("data-map"))) { const id = b.dataset.map; openMaps.has(id) ? openMaps.delete(id) : openMaps.add(id); render(); }
  else if ((b = t("data-hist"))) {
    const id = b.dataset.hist;
    if (openHist.has(id)) { openHist.delete(id); render(); } else { openHist.add(id); render(); if (!hist[id]) showHistory(id); }
  }
  else if ((b = t("data-share"))) share(cafes.find((x) => x.id === b.dataset.share));
  else if ((b = t("data-upd"))) {
    cur = cafes.find((c) => c.id === b.dataset.upd); if (!cur) return;
    $("updName").textContent = cur.name; $("updCap").textContent = "Kapasitas " + cur.capacity + " kursi";
    $("updNum").value = cur.count; $("updMsg").textContent = ""; resetDelete(); $("updDlg").showModal();
  }
});

async function share(c) {
  if (!c) return;
  const text = isStale(c) ? `Cek kondisi ${c.name} di Cek Keramaian Cafe:`
    : `${c.name} lagi ${c.count >= c.capacity ? "penuh" : LABEL[status(c)].toLowerCase()} (${c.count} dari ${c.capacity} kursi). Lihat di Cek Keramaian Cafe:`;
  const url = location.origin + location.pathname;
  if (navigator.share) { try { await navigator.share({ title: "Cek Keramaian Cafe", text, url }); } catch (_) {} }
  else window.open("https://wa.me/?text=" + encodeURIComponent(text + " " + url), "_blank", "noopener");
}

const num = () => { const v = parseInt($("updNum").value, 10); return isNaN(v) || v < 0 ? 0 : v; };
$("minus").onclick = () => { $("updNum").value = Math.max(0, num() - 1); };
$("plus").onclick = () => { $("updNum").value = num() + 1; };
$("updCancel").onclick = () => $("updDlg").close();
function resetDelete() { delArmed = false; $("updDelete").textContent = "Hapus cafe"; $("updDelete").classList.remove("armed"); }

$("updSave").onclick = async () => {
  if (!cur || !dbReady) return;
  $("updSave").disabled = true;
  try {
    await updateCount(cur, num());
    delete hist[cur.id]; if (openHist.has(cur.id)) showHistory(cur.id);
    $("updDlg").close();
  } catch (e) { $("updMsg").textContent = saveError(e); }
  finally { $("updSave").disabled = false; }
};
$("updDelete").onclick = async function () {
  if (!cur || !dbReady) return;
  if (!delArmed) { delArmed = true; this.textContent = "Yakin hapus? Klik lagi"; this.classList.add("armed"); return; }
  try { await removeCafe(cur.id); $("updDlg").close(); }
  catch (e) { $("updMsg").textContent = saveError(e); resetDelete(); }
};

$("addBtn").onclick = () => {
  if (!user) { openAuth("Masuk dulu sebagai barista untuk mendaftarkan cafe."); return; }
  ["aName", "aAddr"].forEach((i) => ($(i).value = "")); $("aCap").value = 30; $("addMsg").textContent = ""; $("addDlg").showModal();
};
$("addCancel").onclick = () => $("addDlg").close();
$("addSave").onclick = async () => {
  const name = $("aName").value.trim(), address = $("aAddr").value.trim(), capacity = parseInt($("aCap").value, 10);
  if (!dbReady || !user) return;
  if (!name || !address) { $("addMsg").textContent = "Isi nama dan alamat cafe."; return; }
  if (!(capacity > 0 && capacity <= 1000)) { $("addMsg").textContent = "Kapasitas harus antara 1 dan 1000."; return; }
  $("addSave").disabled = true;
  try { await addCafe({ name, address, capacity }, user.uid); $("addDlg").close(); }
  catch (e) { $("addMsg").textContent = "Gagal menyimpan. Periksa koneksi lalu coba lagi."; }
  finally { $("addSave").disabled = false; }
};

function setMode(m) {
  authMode = m;
  $("authTitle").textContent = m === "login" ? "Masuk barista" : "Daftar akun barista";
  $("authSave").textContent = m === "login" ? "Masuk" : "Daftar";
  $("authToggle").textContent = m === "login" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk";
}
function openAuth(msg) { setMode("login"); $("authMsg").textContent = msg || ""; $("uPass").value = ""; $("authDlg").showModal(); }
$("authToggle").onclick = () => setMode(authMode === "login" ? "register" : "login");
$("authCancel").onclick = () => $("authDlg").close();
$("authSave").onclick = async () => {
  if (!authReady) { $("authMsg").textContent = "Firebase belum dikonfigurasi."; return; }
  const email = $("uEmail").value.trim(), pass = $("uPass").value;
  if (!email || pass.length < 6) { $("authMsg").textContent = "Isi email dan kata sandi minimal 6 karakter."; return; }
  $("authSave").disabled = true;
  try { await (authMode === "login" ? login : register)(email, pass); $("authDlg").close(); }
  catch (e) { $("authMsg").textContent = authError(e); }
  finally { $("authSave").disabled = false; }
};
$("authBar").addEventListener("click", (e) => {
  if (e.target.id === "login") openAuth();
  if (e.target.id === "logout") logout();
});

if (!dbReady) $("setup").hidden = false;
watchUser((u) => { user = u; render(); });
subscribeCafes(
  (data) => { cafes = data; render(); },
  () => { $("grid").innerHTML = `<div class="empty">Data tidak bisa dimuat. Periksa konfigurasi dan aturan Firestore.</div>`; }
);
render();
setInterval(render, 60000);
