/**
 * statistics.js
 * ---------------------------------------------------------------------------
 * Berisi seluruh fungsi kalkulasi statistik.
 * Semua fungsi di file ini adalah PURE FUNCTION:
 * - Tidak mengubah data yang diterima (tidak ada mutasi).
 * - Tidak menyentuh DOM.
 * - Tidak menyentuh Local Storage.
 * Ini membuat logika kalkulasi mudah diuji dan mudah dipelihara.
 * ---------------------------------------------------------------------------
 */

/**
 * Menghitung total suara dari seluruh kandidat.
 * @param {Array<{votes:number}>} candidates
 * @returns {number} Total suara.
 */
export function getTotalVotes(candidates) {
  return candidates.reduce((total, candidate) => total + candidate.votes, 0);
}

/**
 * Menghitung persentase perolehan suara setiap kandidat terhadap total suara.
 * Jika total suara masih 0, seluruh persentase dikembalikan sebagai 0
 * agar tidak terjadi pembagian dengan nol.
 * @param {Array<{id:number, votes:number}>} candidates
 * @returns {Map<number, number>} Peta id kandidat -> persentase (0-100).
 */
export function getPercentages(candidates) {
  const total = getTotalVotes(candidates);
  const percentages = new Map();

  candidates.forEach((candidate) => {
    const percentage = total === 0 ? 0 : (candidate.votes / total) * 100;
    percentages.set(candidate.id, percentage);
  });

  return percentages;
}

/**
 * Mengembalikan daftar kandidat yang sudah diurutkan berdasarkan jumlah
 * suara terbanyak (descending). Array asli tidak diubah (non-mutating).
 * Jika jumlah suara sama, urutan asli (berdasarkan id) tetap dipertahankan
 * agar ranking tidak "melompat-lompat" secara acak.
 * @param {Array<Object>} candidates
 * @returns {Array<Object>} Kandidat baru yang sudah terurut.
 */
export function getRanking(candidates) {
  return [...candidates].sort((a, b) => {
    if (b.votes !== a.votes) return b.votes - a.votes;
    return a.id - b.id;
  });
}

/**
 * Menghitung lebar bar chart (dalam persen, 0-100) relatif terhadap
 * kandidat dengan suara terbanyak. Ini membuat kandidat dengan suara
 * tertinggi selalu tampil dengan bar penuh (100%), sehingga perbandingan
 * antar kandidat lebih mudah dibaca secara visual.
 * @param {Array<{id:number, votes:number}>} candidates
 * @returns {Map<number, number>} Peta id kandidat -> lebar bar (0-100).
 */
export function getBarWidths(candidates) {
  const maxVotes = Math.max(0, ...candidates.map((c) => c.votes));
  const widths = new Map();

  candidates.forEach((candidate) => {
    const width = maxVotes === 0 ? 0 : (candidate.votes / maxVotes) * 100;
    widths.set(candidate.id, width);
  });

  return widths;
}

/**
 * Menghitung persentase progres suara masuk terhadap total pemilih (DPT).
 * Mengembalikan null jika totalVoters tidak ditentukan (opsional),
 * sesuai aturan reusability pada spesifikasi proyek.
 * @param {number} totalVotesIn - Total suara yang sudah masuk.
 * @param {number|null} totalVoters - Total pemilih terdaftar (DPT).
 * @returns {number|null} Persentase progres (0-100) atau null.
 */
export function getProgressPercentage(totalVotesIn, totalVoters) {
  if (totalVoters === null || totalVoters === undefined || totalVoters <= 0) {
    return null;
  }
  const percentage = (totalVotesIn / totalVoters) * 100;
  return Math.min(100, percentage);
}
