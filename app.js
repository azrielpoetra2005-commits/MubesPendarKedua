/**
 * app.js
 * ---------------------------------------------------------------------------
 * CONTROLLER UTAMA aplikasi.
 *
 * Alur data (single source of truth):
 *   Candidate Data (config.js) -> Application State (file ini) -> UI (ui.js)
 *                                                                -> Storage (storage.js)
 *
 * File ini TIDAK memanipulasi DOM secara langsung (itu tugas ui.js) dan
 * TIDAK memanggil localStorage secara langsung (itu tugas storage.js).
 * ---------------------------------------------------------------------------
 */

import { CONFIG, candidates as initialCandidates, MAX_HISTORY_LENGTH } from "./config.js";
import { saveState, loadState, clearState, isStorageAvailable } from "./storage.js";
import * as ui from "./ui.js";

// -----------------------------------------------------------------------
// APPLICATION STATE (single source of truth di sisi client)
// -----------------------------------------------------------------------

/** @type {{candidates: Array, voteActions: Array, activityLog: Array, phase: string}} */
let state = null;

function createDefaultState() {
  return {
    candidates: initialCandidates.map((candidate) => ({ ...candidate })),
    // Stack aksi ADD yang masih aktif (belum di-undo). Sumber kebenaran untuk Undo.
    voteActions: [],
    // Catatan lengkap seluruh aktivitas (ADD & UNDO) untuk ditampilkan di Activity Log.
    activityLog: [],
    // "landing" | "counting" | "finished"
    phase: "landing",
  };
}

function formatTime(date) {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

// -----------------------------------------------------------------------
// PERSISTENSI
// -----------------------------------------------------------------------

function persist() {
  const success = saveState(state);
  if (!success) {
    ui.showToast("Gagal menyimpan data ke penyimpanan lokal.", "danger");
  }
}

function pushActivity(entry) {
  state.activityLog.unshift(entry);
  if (state.activityLog.length > MAX_HISTORY_LENGTH) {
    state.activityLog.length = MAX_HISTORY_LENGTH;
  }
}

// -----------------------------------------------------------------------
// RENDER GABUNGAN (dipanggil setiap kali data berubah)
// -----------------------------------------------------------------------

function renderDynamicSections() {
  ui.renderStatistics(state.candidates, CONFIG);
  ui.renderRanking(state.candidates);
  ui.renderActivityLog(state.activityLog);
  ui.setUndoEnabled(state.voteActions.length > 0);
}

// -----------------------------------------------------------------------
// AKSI: TAMBAH SUARA (+1)
// -----------------------------------------------------------------------

function handleVote(candidateId) {
  if (state.phase !== "counting") return;

  const candidate = state.candidates.find((c) => c.id === candidateId);
  if (!candidate) return;

  candidate.votes += 1;

  const time = formatTime(new Date());
  state.voteActions.push({ candidateId, candidateName: candidate.name, time });
  pushActivity({ time, type: "ADD", candidateName: candidate.name });

  ui.updateCandidateVoteDisplay(candidate.id, candidate.votes);
  renderDynamicSections();
  persist();
}

// -----------------------------------------------------------------------
// AKSI: UNDO (selalu membatalkan AKSI TERAKHIR, bukan votes--)
// -----------------------------------------------------------------------

function handleUndo() {
  if (state.voteActions.length === 0) {
    ui.showToast("Belum ada aktivitas yang bisa dibatalkan.", "warning");
    return;
  }

  const lastAction = state.voteActions.pop();
  const candidate = state.candidates.find((c) => c.id === lastAction.candidateId);

  if (candidate) {
    candidate.votes = Math.max(0, candidate.votes - 1);
    ui.updateCandidateVoteDisplay(candidate.id, candidate.votes);
  }

  const time = formatTime(new Date());
  pushActivity({ time, type: "UNDO", candidateName: lastAction.candidateName });

  renderDynamicSections();
  persist();
}

// -----------------------------------------------------------------------
// AKSI: MULAI PENGHITUNGAN (Landing -> Dashboard)
// -----------------------------------------------------------------------

function handleStart() {
  state.phase = "counting";
  persist();
  ui.showPage("dashboard");
}

// -----------------------------------------------------------------------
// AKSI: SELESAIKAN PENGHITUNGAN (Dashboard -> Final Result)
// -----------------------------------------------------------------------

function handleFinishConfirmed() {
  state.phase = "finished";
  persist();
  ui.hideFinishModal();
  ui.renderFinalResult(state.candidates);
  ui.showPage("result");
}

// -----------------------------------------------------------------------
// AKSI: RESET SYSTEM (konfirmasi dua kali)
// -----------------------------------------------------------------------

function handleResetConfirmed() {
  clearState();
  state = createDefaultState();

  ui.renderCandidateGrid(state.candidates, handleVote);
  renderDynamicSections();
  ui.hideResetModalStep2();
  ui.showPage("landing");
  ui.showToast("Seluruh data penghitungan telah direset.", "info");
}

// -----------------------------------------------------------------------
// JAM REALTIME
// -----------------------------------------------------------------------

function startClock() {
  ui.renderClock();
  window.setInterval(ui.renderClock, 1000);
}

// -----------------------------------------------------------------------
// BINDING EVENT (dipasang sekali saat inisialisasi)
// -----------------------------------------------------------------------

function bindEvents() {
  ui.elements.btnStart?.addEventListener("click", handleStart);

  ui.elements.btnUndo?.addEventListener("click", handleUndo);

  // --- Finish flow ---
  ui.elements.btnFinish?.addEventListener("click", ui.showFinishModal);
  document.getElementById("modal-finish-cancel")?.addEventListener("click", ui.hideFinishModal);
  document.getElementById("modal-finish-confirm")?.addEventListener("click", handleFinishConfirmed);

  // --- Reset flow (dua tahap konfirmasi) ---
  ui.elements.resetLink?.addEventListener("click", ui.showResetModalStep1);
  document.getElementById("modal-reset-1-cancel")?.addEventListener("click", ui.hideResetModalStep1);
  document.getElementById("modal-reset-1-confirm")?.addEventListener("click", () => {
    ui.hideResetModalStep1();
    ui.showResetModalStep2();
  });
  document.getElementById("modal-reset-2-cancel")?.addEventListener("click", ui.hideResetModalStep2);
  document.getElementById("modal-reset-2-confirm")?.addEventListener("click", handleResetConfirmed);

  // Tutup modal aktif dengan tombol Escape (aksesibilitas keyboard).
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!ui.elements.modalFinish?.hidden) ui.hideFinishModal();
    if (!ui.elements.modalReset1?.hidden) ui.hideResetModalStep1();
    if (!ui.elements.modalReset2?.hidden) ui.hideResetModalStep2();
  });
}

// -----------------------------------------------------------------------
// GLOBAL ERROR HANDLING
// Pengguna (operator) tidak boleh pernah melihat stack trace teknis.
// -----------------------------------------------------------------------

function bindGlobalErrorHandling() {
  window.addEventListener("error", (event) => {
    console.error("[app] Terjadi kesalahan:", event.error || event.message);
    ui.showToast("Terjadi kesalahan pada sistem. Data terakhir tetap tersimpan.", "danger");
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("[app] Promise error:", event.reason);
    ui.showToast("Terjadi kesalahan pada sistem. Data terakhir tetap tersimpan.", "danger");
  });
}

// -----------------------------------------------------------------------
// INISIALISASI APLIKASI
// -----------------------------------------------------------------------

function init() {
  bindGlobalErrorHandling();

  if (!isStorageAvailable()) {
    ui.showToast("Penyimpanan lokal tidak tersedia di browser ini. Data tidak akan tersimpan otomatis.", "warning");
  }

  const loaded = loadState();
  state = loaded || createDefaultState();

  ui.renderBranding(CONFIG);
  ui.renderCandidateGrid(state.candidates, handleVote);
  renderDynamicSections();
  bindEvents();
  startClock();

  // Menentukan halaman awal berdasarkan fase terakhir yang tersimpan,
  // sehingga reload browser tidak pernah kehilangan konteks operator.
  if (state.phase === "finished") {
    ui.renderFinalResult(state.candidates);
    ui.showPage("result");
  } else if (state.phase === "counting") {
    ui.showPage("dashboard");
  } else {
    ui.showPage("landing");
  }
}

document.addEventListener("DOMContentLoaded", init);
