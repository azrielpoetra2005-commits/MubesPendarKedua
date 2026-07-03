/**
 * storage.js
 * ---------------------------------------------------------------------------
 * Bertanggung jawab PENUH atas persistensi data (baca & tulis).
 *
 * Prinsip penting:
 * - Modul lain (app.js) tidak boleh memanggil `localStorage` secara langsung.
 * - Semua akses penyimpanan HARUS melalui fungsi-fungsi di file ini.
 * - Struktur ini sengaja dibuat sebagai "adapter" sehingga di masa depan,
 *   jika penyimpanan ingin dipindahkan ke Firebase / Supabase / REST API,
 *   cukup mengganti isi fungsi di file ini tanpa mengubah app.js atau ui.js.
 * ---------------------------------------------------------------------------
 */

import { STORAGE_KEY } from "./config.js";

/**
 * Menyimpan seluruh application state ke Local Storage.
 * Dipanggil setiap kali terjadi perubahan data (tambah suara, undo, reset).
 * @param {Object} state - Application state yang akan disimpan.
 * @returns {boolean} true jika berhasil disimpan, false jika gagal.
 */
export function saveState(state) {
  try {
    const serialized = JSON.stringify(state);
    window.localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (error) {
    // Local Storage bisa gagal (mis. private browsing / kuota penuh).
    // Kegagalan menyimpan tidak boleh menghentikan aplikasi.
    console.error("[storage] Gagal menyimpan state:", error);
    return false;
  }
}

/**
 * Memuat application state dari Local Storage.
 * Jika data tidak ada atau rusak (corrupt), fungsi ini mengembalikan null
 * sehingga pemanggil (app.js) dapat memakai state default sebagai fallback.
 * @returns {Object|null} State yang tersimpan, atau null jika tidak valid.
 */
export function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // Validasi minimal agar struktur data yang rusak tidak menyebabkan crash.
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray(parsed.candidates) ||
      !Array.isArray(parsed.history)
    ) {
      console.warn("[storage] Struktur data tersimpan tidak valid. Menggunakan data default.");
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("[storage] Gagal membaca state, data mungkin rusak:", error);
    return null;
  }
}

/**
 * Menghapus seluruh data tersimpan secara permanen.
 * Digunakan oleh fitur Reset System.
 * @returns {boolean} true jika berhasil dihapus.
 */
export function clearState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("[storage] Gagal menghapus state:", error);
    return false;
  }
}

/**
 * Mengecek apakah Local Storage tersedia di browser saat ini.
 * Digunakan untuk menampilkan peringatan yang mudah dipahami jika
 * penyimpanan tidak dapat digunakan sama sekali (mis. mode privat ekstrem).
 * @returns {boolean}
 */
export function isStorageAvailable() {
  try {
    const testKey = "__pendar_storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}
