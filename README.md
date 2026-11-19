# Cek Keramaian Cafe

Website untuk mengecek apakah sebuah cafe sedang ramai atau sepi. Barista memasukkan jumlah orang di cafe, pengunjung melihat statusnya dan lokasinya lewat Google Maps.

## Struktur proyek

```
ngopi-radar/
├── index.html        Kerangka halaman (hanya HTML, tanpa JavaScript di dalamnya)
├── css/
│   └── style.css     Seluruh tampilan, warna, dan tampilan ponsel
├── js/
│   ├── config.js     Konfigurasi Firebase (satu-satunya file yang perlu Anda isi)
│   ├── firebase.js   Menyalakan Firebase, mengekspor db dan auth
│   ├── utils.js      Fungsi kecil bersama: status keramaian, data lama, filter, waktu
│   ├── auth.js       Login dan daftar barista
│   ├── cafes.js      Semua baca/tulis database (cafe, jumlah orang, riwayat)
│   ├── views.js      Pembuat tampilan HTML: kartu cafe, filter, grafik riwayat
│   └── app.js        Pintu masuk: menyimpan keadaan halaman dan menghubungkan semuanya
├── firestore.rules   Aturan keamanan database
└── README.md
```

Pembagian tugasnya: `views.js` hanya mengubah data menjadi tampilan, `cafes.js` dan `auth.js` hanya berurusan dengan Firebase, dan `app.js` yang menghubungkan keduanya. Jadi kalau ingin mengganti database (misalnya ke Supabase), cukup ubah `firebase.js`, `auth.js`, dan `cafes.js`. Kalau ingin mengubah tampilan kartu, cukup ubah `views.js` dan `style.css`.

Kode memakai ES Modules, jadi tidak bisa dibuka dengan klik dua kali pada `index.html`. Jalankan lewat server lokal, misalnya ekstensi **Live Server** di VS Code (klik kanan `index.html` lalu **Open with Live Server**), atau di GitHub Pages setelah diunggah.

## Ide pengembangan lanjutan

- Jam buka dan status "Tutup" otomatis
- Urutkan cafe berdasarkan jarak dari lokasi pengunjung
- Foto, menu singkat, dan label fasilitas (Wi-Fi, colokan, AC)
- Pemasangan seperti aplikasi (PWA) dan notifikasi
- Satu cafe dikelola beberapa barista
- Ringkasan riwayat keramaian dihitung di sisi server untuk data yang sangat banyak

Website ini memakai **Firebase Firestore** untuk menyimpan data dan **GitHub Pages** untuk hosting. Keduanya punya paket gratis.

---

## Bagian 1: Siapkan database Firebase

1. Buka https://console.firebase.google.com lalu masuk dengan akun Google.
2. Klik **Create a project** (Buat proyek), beri nama misalnya `ngopi-radar`, lalu selesaikan. Google Analytics boleh dimatikan.
3. Di menu kiri pilih **Build > Firestore Database**, klik **Create database**.
4. Pilih lokasi server. Untuk pengguna di Indonesia, pilih `asia-southeast2 (Jakarta)` atau `asia-southeast1 (Singapore)`.
5. Pilih **Start in production mode**, lalu klik **Enable**.
6. Buka tab **Rules**, hapus isinya, lalu salin seluruh isi file `firestore.rules`. Klik **Publish**.
   Aturan ini membuat semua orang bisa melihat data, tetapi hanya barista yang login dan menjadi pemilik cafe yang bisa mengubah jumlah atau menghapus cafe.
7. Aktifkan login barista: buka **Build > Authentication**, klik **Get started**, pilih **Email/Password**, aktifkan, lalu **Save**.

## Bagian 2: Ambil konfigurasi Firebase

1. Di Firebase, klik ikon roda gigi di samping **Project Overview**, pilih **Project settings**.
2. Gulir ke bagian **Your apps**, klik ikon web `</>`.
3. Beri nama aplikasi (misalnya `ngopi-radar-web`). Tidak perlu mencentang Firebase Hosting. Klik **Register app**.
4. Anda akan melihat blok `firebaseConfig`. Salin nilainya.
5. Buka `js/config.js`, lalu ganti semua nilai `ISI_...` dengan nilai dari Firebase:

```js
export const firebaseConfig = {
  apiKey: "ISI_API_KEY",
  authDomain: "ISI_PROJECT_ID.firebaseapp.com",
  projectId: "ISI_PROJECT_ID",
  storageBucket: "ISI_PROJECT_ID.appspot.com",
  messagingSenderId: "ISI_SENDER_ID",
  appId: "ISI_APP_ID"
};
```

Konfigurasi ini memang tampil publik di website, jadi tidak rahasia. Yang menjaga keamanan data adalah aturan Firestore di Bagian 1.

## Bagian 3: Unggah ke GitHub

1. Buat akun di https://github.com bila belum punya.
2. Klik **New repository**. Beri nama misalnya `ngopi-radar`, pilih **Public**, lalu klik **Create repository**.
3. Klik **uploading an existing file**, lalu seret seluruh isi folder proyek ke sana: `index.html`, folder `css`, folder `js`, `firestore.rules`, dan `README.md`.
4. Klik **Commit changes**.

Atau lewat terminal:

```bash
git init
git add .
git commit -m "Cek Keramaian Cafe"
git branch -M main
git remote add origin https://github.com/USERNAME/ngopi-radar.git
git push -u origin main
```

## Bagian 4: Aktifkan GitHub Pages

1. Di repository, buka **Settings > Pages**.
2. Pada **Build and deployment**, pilih **Source: Deploy from a branch**.
3. Pilih branch `main` dan folder `/ (root)`, lalu klik **Save**.
4. Tunggu 1 sampai 2 menit. Website Anda akan aktif di:

```
https://USERNAME.github.io/ngopi-radar/
```

## Bagian 5: Pakai domain sendiri (opsional)

Agar alamatnya misalnya `ngopiradar.id`:

1. Beli domain di penyedia domain pilihan Anda.
2. Di pengaturan DNS domain tersebut, tambahkan:
   - Untuk domain utama (`ngopiradar.id`), buat empat record **A** yang mengarah ke `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, dan `185.199.111.153`.
   - Untuk subdomain `www`, buat record **CNAME** yang mengarah ke `USERNAME.github.io`.
3. Di GitHub, buka **Settings > Pages > Custom domain**, isi domain Anda, lalu klik **Save**.
4. Centang **Enforce HTTPS** setelah tersedia (bisa butuh beberapa menit).

Alamat IP GitHub Pages bisa berubah, jadi cek ulang di dokumentasi resmi GitHub Pages saat mengatur DNS.

## Cara memakai website

- **Pengunjung**: buka website tanpa login. Lihat status tiap cafe, klik **Riwayat** untuk melihat jam-jam biasanya sepi atau ramai, **Peta** atau **Google Maps** untuk lokasi, dan **Bagikan** untuk mengirim kondisi cafe lewat WhatsApp atau aplikasi lain.
- **Barista**: klik **Masuk barista**, pilih **Daftar** untuk membuat akun (email dan kata sandi), lalu masuk.
- **Daftarkan cafe**: setelah masuk, klik **Daftarkan cafe** dan isi nama, alamat, dan kapasitas kursi. Akun Anda menjadi pemilik cafe itu. Satu akun bisa memiliki beberapa cafe.
- **Memperbarui jumlah orang**: tombol **Perbarui jumlah** hanya muncul di cafe milik akun yang sedang masuk. Setiap pembaruan juga tercatat ke riwayat.
- **Menghapus cafe**: di jendela yang sama, klik **Hapus cafe** dua kali.
- **Data lama**: jika jumlah orang belum diperbarui lebih dari 2 jam, kartu ditandai "Data lama" dan tidak ikut kelompok Sepi, Lumayan ramai, atau Ramai. Ubah batasnya lewat `STALE_MS` di `js/utils.js`.
- **Riwayat keramaian**: grafik dihitung dari 300 pembaruan terakhir dan dikelompokkan per jam (waktu perangkat pengunjung). Grafik baru muncul setelah ada minimal 3 pembaruan.

## Catatan keamanan

- Login memakai Firebase Authentication, dan server hanya mengizinkan pemilik cafe mengubah datanya. Kata sandi dikelola Firebase dan tidak pernah disimpan di website ini.
- Karena pendaftaran akun terbuka, siapa pun bisa membuat akun dan mendaftarkan cafe. Jika ada penyalahgunaan, hapus data langsung dari Firebase Console (Firestore Database > cafes) atau matikan pendaftaran di Authentication.
- Penghapusan cafe hanya menandai cafe sebagai terhapus, datanya tetap ada di database.
- Paket gratis Firebase punya batas pembacaan dan penulisan harian. Untuk penggunaan kecil sampai menengah, ini biasanya cukup.
