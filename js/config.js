// Konfigurasi Firebase untuk project "Mau Ngecafe Cek Keramaian Dulu".
// Nilai ini memang bersifat publik; keamanan data dijaga oleh aturan di firestore.rules.
export const firebaseConfig = {
  apiKey: "AIzaSyBu2T9MVYCJtE2Qh1I7YD_YLr_zVU0sCug",
  authDomain: "mau-ngecafe-cek-keramaian-dulu.firebaseapp.com",
  projectId: "mau-ngecafe-cek-keramaian-dulu",
  storageBucket: "mau-ngecafe-cek-keramaian-dulu.firebasestorage.app",
  messagingSenderId: "727556476493",
  appId: "1:727556476493:web:de7705f98ea4f98a835604"
};

export const isConfigured = !firebaseConfig.apiKey.startsWith("ISI_");
