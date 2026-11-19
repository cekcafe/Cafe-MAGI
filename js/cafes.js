import { collection, doc, setDoc, updateDoc, writeBatch, onSnapshot, getDocs, query, orderBy, limit }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase.js";

export const dbReady = !!db;

export function subscribeCafes(onData, onError) {
  if (!db) return;
  onSnapshot(collection(db, "cafes"),
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((c) => !c.deleted)),
    onError);
}

export function addCafe({ name, address, capacity }, ownerUid) {
  return setDoc(doc(collection(db, "cafes")),
    { name, address, capacity, count: 0, updatedAt: null, deleted: false, ownerUid });
}

export function updateCount(cafe, count) {
  const now = Date.now(), batch = writeBatch(db);
  batch.update(doc(db, "cafes", cafe.id), { count, updatedAt: now });
  batch.set(doc(collection(db, "cafes", cafe.id, "history")), { count, capacity: cafe.capacity, ts: now });
  return batch.commit();
}

export const removeCafe = (id) => updateDoc(doc(db, "cafes", id), { deleted: true, updatedAt: Date.now() });

export async function loadHistory(id) {
  try {
    const snap = await getDocs(query(collection(db, "cafes", id, "history"), orderBy("ts", "desc"), limit(300)));
    return snap.docs.map((d) => d.data());
  } catch (e) { return []; }
}

export const saveError = (e) =>
  e.code === "permission-denied" ? "Anda bukan pemilik cafe ini." : "Gagal menyimpan. Periksa koneksi lalu coba lagi.";
