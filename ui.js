/**
 * ui.js
 * ---------------------------------------------------------------------------
 * Bertanggung jawab PENUH atas tampilan (DOM).
 *
 * Prinsip penting:
 * - File ini HANYA menampilkan data yang diberikan oleh app.js (controller).
 * - File ini TIDAK menyimpan data, TIDAK menghitung statistik, dan
 *   TIDAK mengakses Local Storage.
 * - Setiap fungsi menerima data sebagai parameter dan merender ke DOM.
 * ---------------------------------------------------------------------------
 */

import { getTotalVotes, getPercentages, getRanking, getBarWidths, getProgressPercentage } from "./statistics.js";
import { ACTIVITY_LOG_DISPLAY_COUNT } from "./config.js";

// -----------------------------------------------------------------------
// CACHE ELEMEN DOM
// Mengambil referensi elemen sekali saja agar tidak query berulang-ulang.
// -----------------------------------------------------------------------
const dom = {
  pages: {
    landing: document.getElementById("page-landing"),
    dashboard: document.getElementById("page-dashboard"),
    result: document.getElementById("page-result"),
  },

  // Landing
  landingLogo: document.getElementById("landing-logo"),
  landingDashboardName: document.getElementById("landing-dashboard-name"),
  landingEventName: document.getElementById("landing-event-name"),
  landingOrganization: document.getElementById("landing-organization"),
  landingDescription: document.getElementById("landing-description"),
  btnStart: document.getElementById("btn-start"),

  // Dashboard - left panel
  brandLogo: document.getElementById("brand-logo"),
  brandEventName: document.getElementById("brand-event-name"),
  brandOrganization: document.getElementById("brand-organization"),
  liveClock: document.getElementById("live-clock"),
  liveDate: document.getElementById("live-date"),
  btnUndo: document.getElementById("btn-undo"),
  btnFinish: document.getElementById("btn-finish"),
  resetLink: document.getElementById("reset-link"),

  // Dashboard - center panel
  candidateGrid: document.getElementById("candidate-grid"),
  statTotalVotes: document.getElementById("stat-total-votes"),
  statProgressWrapper: document.getElementById("stat-progress-wrapper"),
  statProgressBar: document.getElementById("stat-progress-bar"),
  statProgressLabel: document.getElementById("stat-progress-label"),
  statPercentageList: document.getElementById("stat-percentage-list"),
  statChart: document.getElementById("stat-chart"),

  // Dashboard - right panel
  rankingList: document.getElementById("ranking-list"),
  activityLog: document.getElementById("activity-log"),

  // Result page
  resultRankingList: document.getElementById("result-ranking-list"),
  resultTotalVotes: document.getElementById("result-total-votes"),
  resultCandidateCount: document.getElementById("result-candidate-count"),
  resultFooterLogo: document.getElementById("result-footer-logo"),
  resultFooterDashboardName: document.getElementById("result-footer-dashboard-name"),
  resultFooterYear: document.getElementById("result-footer-year"),

  // Modals
  modalFinish: document.getElementById("modal-finish"),
  modalReset1: document.getElementById("modal-reset-1"),
  modalReset2: document.getElementById("modal-reset-2"),

  // Toast
  toastContainer: document.getElementById("toast-container"),
};

// Ikon avatar default (netral, sama untuk semua kandidat) sebagai fallback
// ketika foto kandidat gagal dimuat atau belum diisi.
const DEFAULT_AVATAR_DATA_URI =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#F1F1F1"/>
      <circle cx="100" cy="78" r="38" fill="#C9CDD3"/>
      <path d="M30 178c8-46 46-70 70-70s62 24 70 70" fill="#C9CDD3"/>
    </svg>
  `);

// Ikon logo default (netral) sebagai fallback ketika logo organisasi kosong
// atau gagal dimuat.
const DEFAULT_LOGO_DATA_URI =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="14" fill="#870000"/>
      <path d="M32 14 L50 24 V40 L32 50 L14 40 V24 Z" fill="none" stroke="#FFFFFF" stroke-width="3"/>
      <circle cx="32" cy="32" r="6" fill="#FFFFFF"/>
    </svg>
  `);

/**
 * Menentukan URL gambar yang aman untuk dipakai sebagai src awal.
 * Placeholder literal ("PASTE_..._URL_HERE") dianggap belum diisi,
 * sehingga langsung diarahkan ke ikon default tanpa perlu menunggu error.
 */
function resolveImageSrc(url, fallback) {
  if (!url || url.startsWith("PASTE_")) return fallback;
  return url;
}

/**
 * Memasang penanganan error pada elemen <img> sehingga jika gambar gagal
 * dimuat, otomatis diganti dengan gambar fallback (tanpa membuat aplikasi crash).
 */
function attachImageFallback(imgElement, fallbackSrc) {
  imgElement.addEventListener("error", () => {
    if (imgElement.src !== fallbackSrc) {
      imgElement.src = fallbackSrc;
    }
  });
}

// -----------------------------------------------------------------------
// NAVIGASI HALAMAN (SPA - tanpa reload)
// -----------------------------------------------------------------------

/**
 * Menampilkan salah satu dari tiga halaman utama dengan transisi fade halus.
 * @param {"landing"|"dashboard"|"result"} pageName
 */
export function showPage(pageName) {
  Object.entries(dom.pages).forEach(([name, element]) => {
    if (!element) return;
    if (name === pageName) {
      element.hidden = false;
      element.setAttribute("aria-hidden", "false");
      // Trigger reflow supaya animasi fade-in berjalan setiap kali halaman aktif.
      requestAnimationFrame(() => element.classList.add("page--active"));
    } else {
      element.classList.remove("page--active");
      element.setAttribute("aria-hidden", "true");
      element.hidden = true;
    }
  });
}

// -----------------------------------------------------------------------
// RENDER: BRANDING (Landing & Dashboard)
// -----------------------------------------------------------------------

export function renderBranding(config) {
  const logoSrc = resolveImageSrc(config.logo, DEFAULT_LOGO_DATA_URI);

  document.title = config.dashboardName;

  if (dom.landingLogo) {
    dom.landingLogo.src = logoSrc;
    dom.landingLogo.alt = `Logo ${config.organization}`;
    attachImageFallback(dom.landingLogo, DEFAULT_LOGO_DATA_URI);
  }
  if (dom.landingDashboardName) dom.landingDashboardName.textContent = config.dashboardName;
  if (dom.landingEventName) dom.landingEventName.textContent = config.eventName;
  if (dom.landingOrganization) dom.landingOrganization.textContent = config.organization;
  if (dom.landingDescription) dom.landingDescription.textContent = config.description;

  if (dom.brandLogo) {
    dom.brandLogo.src = logoSrc;
    dom.brandLogo.alt = `Logo ${config.organization}`;
    attachImageFallback(dom.brandLogo, DEFAULT_LOGO_DATA_URI);
  }
  if (dom.brandEventName) dom.brandEventName.textContent = config.eventName;
  if (dom.brandOrganization) dom.brandOrganization.textContent = config.organization;

  if (dom.resultFooterLogo) {
    dom.resultFooterLogo.src = logoSrc;
    dom.resultFooterLogo.alt = `Logo ${config.organization}`;
    attachImageFallback(dom.resultFooterLogo, DEFAULT_LOGO_DATA_URI);
  }
  if (dom.resultFooterDashboardName) dom.resultFooterDashboardName.textContent = config.dashboardName;
  if (dom.resultFooterYear) dom.resultFooterYear.textContent = config.year;
}

// -----------------------------------------------------------------------
// RENDER: JAM & TANGGAL REALTIME
// -----------------------------------------------------------------------

export function renderClock() {
  const now = new Date();

  const time = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const date = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (dom.liveClock) dom.liveClock.textContent = time;
  if (dom.liveDate) dom.liveDate.textContent = date;
}

// -----------------------------------------------------------------------
// RENDER: CANDIDATE GRID (Dashboard)
// -----------------------------------------------------------------------

/**
 * Membangun ulang seluruh grid kandidat. Dipanggil sekali saat inisialisasi.
 * @param {Array<Object>} candidates
 * @param {(id:number) => void} onVoteClick - Handler ketika tombol +1 diklik.
 */
export function renderCandidateGrid(candidates, onVoteClick) {
  if (!dom.candidateGrid) return;
  dom.candidateGrid.innerHTML = "";

  candidates.forEach((candidate) => {
    const card = document.createElement("article");
    card.className = "candidate-card";
    card.id = `candidate-card-${candidate.id}`;
    card.setAttribute("role", "listitem");
    card.setAttribute("aria-label", `Kandidat ${candidate.name}`);

    const imageSrc = resolveImageSrc(candidate.image, DEFAULT_AVATAR_DATA_URI);

    card.innerHTML = `
      <div class="candidate-card__photo-wrapper">
        <img
          class="candidate-card__photo"
          id="candidate-photo-${candidate.id}"
          src="${imageSrc}"
          alt="Foto ${candidate.name}"
          loading="lazy"
        />
      </div>
      <h3 class="candidate-card__name">${candidate.name}</h3>
      <div class="candidate-card__vote-block">
        <span class="candidate-card__vote-count" id="candidate-votes-${candidate.id}">${candidate.votes}</span>
        <span class="candidate-card__vote-label">Suara</span>
      </div>
      <button
        type="button"
        class="btn btn--vote"
        id="candidate-vote-btn-${candidate.id}"
        aria-label="Tambah satu suara untuk ${candidate.name}"
        title="Tambah satu suara untuk ${candidate.name}"
      >
        <span aria-hidden="true">+1</span>
      </button>
    `;

    dom.candidateGrid.appendChild(card);

    const photoEl = card.querySelector(`#candidate-photo-${candidate.id}`);
    attachImageFallback(photoEl, DEFAULT_AVATAR_DATA_URI);

    const voteBtn = card.querySelector(`#candidate-vote-btn-${candidate.id}`);
    voteBtn.addEventListener("click", () => onVoteClick(candidate.id));
  });
}

/**
 * Memperbarui angka suara satu kandidat di candidate card dengan animasi
 * "bump" singkat (150ms), tanpa membangun ulang seluruh grid.
 * @param {number} candidateId
 * @param {number} newVotes
 */
export function updateCandidateVoteDisplay(candidateId, newVotes) {
  const voteEl = document.getElementById(`candidate-votes-${candidateId}`);
  if (!voteEl) return;

  voteEl.textContent = newVotes;
  voteEl.classList.remove("count-bump");
  // Force reflow agar animasi dapat di-retrigger meskipun class sama.
  void voteEl.offsetWidth;
  voteEl.classList.add("count-bump");
}

// -----------------------------------------------------------------------
// RENDER: STATISTIK (Total, Persentase, Bar Chart)
// -----------------------------------------------------------------------

export function renderStatistics(candidates, config) {
  const total = getTotalVotes(candidates);
  const percentages = getPercentages(candidates);
  const barWidths = getBarWidths(candidates);
  const ranked = getRanking(candidates);

  if (dom.statTotalVotes) dom.statTotalVotes.textContent = total;

  // Progress terhadap DPT (opsional).
  const progress = getProgressPercentage(total, config.totalVoters);
  if (dom.statProgressWrapper) {
    if (progress === null) {
      dom.statProgressWrapper.hidden = true;
    } else {
      dom.statProgressWrapper.hidden = false;
      dom.statProgressBar.style.width = `${progress}%`;
      dom.statProgressLabel.textContent = `${total} dari ${config.totalVoters} pemilih (${progress.toFixed(1)}%)`;
    }
  }

  // Daftar persentase (diurutkan sama seperti ranking agar konsisten dibaca).
  if (dom.statPercentageList) {
    dom.statPercentageList.innerHTML = "";
    ranked.forEach((candidate) => {
      const pct = percentages.get(candidate.id) ?? 0;
      const item = document.createElement("div");
      item.className = "percentage-item";
      item.innerHTML = `
        <span class="percentage-item__name">${candidate.name}</span>
        <span class="percentage-item__value">${pct.toFixed(1)}%</span>
      `;
      dom.statPercentageList.appendChild(item);
    });
  }

  // Bar chart horizontal (CSS murni, tanpa library).
  if (dom.statChart) {
    dom.statChart.innerHTML = "";
    ranked.forEach((candidate) => {
      const width = barWidths.get(candidate.id) ?? 0;
      const bar = document.createElement("div");
      bar.className = "chart-bar";
      bar.innerHTML = `
        <span class="chart-bar__label">${candidate.name}</span>
        <div class="chart-bar__track">
          <div class="chart-bar__fill" style="width:${width}%"></div>
        </div>
        <span class="chart-bar__value">${candidate.votes}</span>
      `;
      dom.statChart.appendChild(bar);
    });
  }
}

// -----------------------------------------------------------------------
// RENDER: LIVE RANKING (Dashboard)
// -----------------------------------------------------------------------

const MEDAL_ICONS = ["🥇", "🥈", "🥉"];

export function renderRanking(candidates) {
  if (!dom.rankingList) return;
  const ranked = getRanking(candidates);

  dom.rankingList.innerHTML = "";
  ranked.forEach((candidate, index) => {
    const item = document.createElement("li");
    item.className = "ranking-item";
    const badge = MEDAL_ICONS[index] || `${index + 1}`;
    item.innerHTML = `
      <span class="ranking-item__badge" aria-hidden="true">${badge}</span>
      <span class="ranking-item__name">${candidate.name}</span>
      <span class="ranking-item__votes">${candidate.votes}</span>
    `;
    dom.rankingList.appendChild(item);
  });
}

// -----------------------------------------------------------------------
// RENDER: ACTIVITY LOG (Dashboard)
// -----------------------------------------------------------------------

/**
 * @param {Array<{time:string, type:"ADD"|"UNDO", candidateName:string}>} history
 *        History terurut dari yang PALING BARU ke yang paling lama.
 */
export function renderActivityLog(history) {
  if (!dom.activityLog) return;

  const recent = history.slice(0, ACTIVITY_LOG_DISPLAY_COUNT);
  dom.activityLog.innerHTML = "";

  if (recent.length === 0) {
    const empty = document.createElement("li");
    empty.className = "activity-item activity-item--empty";
    empty.textContent = "Belum ada aktivitas.";
    dom.activityLog.appendChild(empty);
    return;
  }

  recent.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "activity-item";
    const typeLabel = entry.type === "UNDO" ? "Undo" : "+1";
    const typeClass = entry.type === "UNDO" ? "activity-item__type--undo" : "activity-item__type--add";
    item.innerHTML = `
      <span class="activity-item__time">${entry.time}</span>
      <span class="activity-item__type ${typeClass}">${typeLabel}</span>
      <span class="activity-item__name">${entry.candidateName}</span>
    `;
    dom.activityLog.appendChild(item);
  });
}

// -----------------------------------------------------------------------
// RENDER: HALAMAN HASIL AKHIR
// -----------------------------------------------------------------------

export function renderFinalResult(candidates) {
  const ranked = getRanking(candidates);
  const total = getTotalVotes(candidates);

  if (dom.resultRankingList) {
    dom.resultRankingList.innerHTML = "";
    ranked.forEach((candidate, index) => {
      const card = document.createElement("article");
      const isTopTwo = index < 2;
      card.className = `result-card ${isTopTwo ? "result-card--top" : "result-card--normal"}`;
      card.setAttribute("role", "listitem");

      const badge = MEDAL_ICONS[index] || `${index + 1}`;

      card.innerHTML = `
        <span class="result-card__badge" aria-hidden="true">${badge}</span>
        <h3 class="result-card__name">${candidate.name}</h3>
        <p class="result-card__votes">${candidate.votes} Suara</p>
      `;
      dom.resultRankingList.appendChild(card);
    });
  }

  if (dom.resultTotalVotes) dom.resultTotalVotes.textContent = total;
  if (dom.resultCandidateCount) dom.resultCandidateCount.textContent = candidates.length;
}

// -----------------------------------------------------------------------
// MODAL (Konfirmasi Finish & Reset)
// -----------------------------------------------------------------------

function toggleModal(modalElement, show) {
  if (!modalElement) return;
  modalElement.hidden = !show;
  modalElement.setAttribute("aria-hidden", show ? "false" : "true");
  if (show) {
    requestAnimationFrame(() => modalElement.classList.add("modal--active"));
    const focusable = modalElement.querySelector("button");
    if (focusable) focusable.focus();
  } else {
    modalElement.classList.remove("modal--active");
  }
}

export function showFinishModal() {
  toggleModal(dom.modalFinish, true);
}
export function hideFinishModal() {
  toggleModal(dom.modalFinish, false);
}
export function showResetModalStep1() {
  toggleModal(dom.modalReset1, true);
}
export function hideResetModalStep1() {
  toggleModal(dom.modalReset1, false);
}
export function showResetModalStep2() {
  toggleModal(dom.modalReset2, true);
}
export function hideResetModalStep2() {
  toggleModal(dom.modalReset2, false);
}

// -----------------------------------------------------------------------
// TOAST (Pesan Error/Info yang Mudah Dipahami)
// -----------------------------------------------------------------------

/**
 * Menampilkan pesan singkat non-intrusif di pojok layar.
 * Digunakan untuk error handling agar pengguna tidak pernah melihat
 * stack trace teknis.
 * @param {string} message
 * @param {"info"|"warning"|"danger"} type
 */
export function showToast(message, type = "info") {
  if (!dom.toastContainer) return;

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.setAttribute("role", "status");
  toast.textContent = message;

  dom.toastContainer.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("toast--visible"));

  window.setTimeout(() => {
    toast.classList.remove("toast--visible");
    window.setTimeout(() => toast.remove(), 250);
  }, 3200);
}

// -----------------------------------------------------------------------
// UNDO BUTTON STATE
// -----------------------------------------------------------------------

/**
 * Menonaktifkan tombol Undo ketika belum ada aktivitas yang bisa dibatalkan.
 * @param {boolean} hasHistory
 */
export function setUndoEnabled(hasHistory) {
  if (!dom.btnUndo) return;
  dom.btnUndo.disabled = !hasHistory;
}

export const elements = dom;
