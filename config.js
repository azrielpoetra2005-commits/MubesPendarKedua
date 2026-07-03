/**
 * config.js
 * ---------------------------------------------------------------------------
 * SATU-SATUNYA tempat untuk mengganti data event dan kandidat.
 * File lain TIDAK BOLEH menyimpan data kandidat/acara secara terpisah.
 *
 * Untuk menggunakan aplikasi ini pada acara berikutnya, cukup ubah nilai
 * di dalam file ini. Tidak perlu menyentuh file JavaScript lainnya.
 * ---------------------------------------------------------------------------
 */

// Konfigurasi umum acara & organisasi.
export const CONFIG = {
  // Nama dashboard yang tampil di header & landing page.
  dashboardName: "PENDAR Live Counting Dashboard",

  // Nama acara (baris pertama identitas acara).
  eventName: "Musyawarah Besar",

  // Nama organisasi (baris kedua identitas acara).
  organization: "PENA DARUSSALAM",

  // Deskripsi singkat yang tampil di landing page.
  description:
    "Sistem rekapitulasi suara secara langsung untuk mendukung proses penghitungan yang transparan, cepat, dan akurat.",

  // URL logo organisasi. Ganti dengan URL logo asli saat sudah tersedia.
  logo: "PASTE_LOGO_URL_HERE",

  // Total pemilih terdaftar (DPT). Isi angka jika ingin menampilkan progress
  // suara masuk terhadap DPT. Biarkan null jika tidak ingin menampilkan progress.
  totalVoters: null,

  // Tahun acara, digunakan pada footer halaman hasil akhir.
  year: new Date().getFullYear(),
};

// Data kandidat. Urutan array TIDAK memengaruhi ranking — ranking dihitung
// otomatis berdasarkan jumlah suara saat aplikasi berjalan.
// "votes" adalah nilai AWAL saja; nilai aktual disimpan pada Application State
// (lihat app.js) dan localStorage (lihat storage.js), bukan dibaca ulang dari sini.
export const candidates = [
  {
    id: 1,
    name: "Haekal Afriadi",
    image: "PASTE_IMAGE_URL_HERE",
    votes: 0,
  },
  {
    id: 2,
    name: "Husain Azhari",
    image: "PASTE_IMAGE_URL_HERE",
    votes: 0,
  },
  {
    id: 3,
    name: "Nidaul Khasanah",
    image: "PASTE_IMAGE_URL_HERE",
    votes: 0,
  },
  {
    id: 4,
    name: "Wilda Naimatul Mukarromah",
    image: "PASTE_IMAGE_URL_HERE",
    votes: 0,
  },
];

// Batas jumlah riwayat aktivitas yang disimpan (sesuai spesifikasi: maksimal 100).
export const MAX_HISTORY_LENGTH = 100;

// Jumlah aktivitas terakhir yang ditampilkan pada Activity Log di UI.
export const ACTIVITY_LOG_DISPLAY_COUNT = 10;

// Key yang digunakan untuk menyimpan seluruh state ke Local Storage.
export const STORAGE_KEY = "pendar-live-counting";
