const renderers = {
  dashboard: renderDashboard,
  journal: renderJournal,
  journalWrite: renderJournalWrite,
  stock: renderStock,
  performance: renderPerformance,
  assets: renderAssets,
  memo: renderMemo,
  calendar: renderCalendar,
  settings: renderSettings
};

var activeModal = null;
var mobileSheetOpen = false;
var chartTooltip = null;
var assetCashBalance = 8480000;
var assetCashMode = "deposit";
var assetCashError = "";
var assetCashMessage = "";

const assetBaseNonCashBalance = 42750000;

function formatKRW(value) {
  return `${Math.max(0, Math.round(Number(value) || 0)).toLocaleString()}원`;
}

function getAssetCashBalance() {
  return assetCashBalance;
}

function getAssetTotalValue() {
  return assetBaseNonCashBalance + assetCashBalance;
}

function parseKRWInput(value) {
  return Math.max(0, Number(String(value).replace(/[^0-9]/g, "")) || 0);
}

function getChartTooltip() {
  if (chartTooltip) return chartTooltip;
  chartTooltip = document.createElement("div");
  chartTooltip.className = "chart-tooltip";
  chartTooltip.setAttribute("role", "tooltip");
  document.body.appendChild(chartTooltip);
  return chartTooltip;
}

function positionChartTooltip(event) {
  if (!chartTooltip) return;
  const gap = 14;
  const { offsetWidth, offsetHeight } = chartTooltip;
  const left = Math.min(event.clientX + gap, window.innerWidth - offsetWidth - gap);
  const top = Math.min(event.clientY + gap, window.innerHeight - offsetHeight - gap);
  chartTooltip.style.left = `${Math.max(gap, left)}px`;
  chartTooltip.style.top = `${Math.max(gap, top)}px`;
}

function showChartTooltip(target, event) {
  const tooltip = getChartTooltip();
  tooltip.textContent = target.dataset.chartTooltip;
  tooltip.classList.add("show");
  positionChartTooltip(event);
}

function hideChartTooltip() {
  if (!chartTooltip) return;
  chartTooltip.classList.remove("show");
}

function renderAssetCashModal() {
  const isWithdraw = assetCashMode === "withdraw";
  const actionLabel = isWithdraw ? "출금" : "입금";

  return `
    <div class="modal-backdrop">
      <section class="modal-panel asset-cash-modal" role="dialog" aria-modal="true" aria-labelledby="assetCashModalTitle">
        <div class="modal-header">
          <div>
            <p class="eyebrow">Cash Balance</p>
            <h2 class="modal-title" id="assetCashModalTitle">현금 입/출금</h2>
          </div>
          <button class="icon-button" type="button" data-modal-close aria-label="닫기">X</button>
        </div>
        <div class="modal-body">
          <div class="asset-cash-card">
            <span>${icon("wallet")}</span>
            <div>
              <p>현재 현금 자산</p>
              <strong>${formatKRW(assetCashBalance)}</strong>
              <em>총자산 ${formatKRW(getAssetTotalValue())}</em>
            </div>
          </div>

          <div class="asset-cash-mode" role="tablist" aria-label="입출금 선택">
            <button class="${assetCashMode === "deposit" ? "active" : ""}" type="button" data-asset-cash-mode="deposit" aria-pressed="${assetCashMode === "deposit"}">입금</button>
            <button class="${assetCashMode === "withdraw" ? "active" : ""}" type="button" data-asset-cash-mode="withdraw" aria-pressed="${assetCashMode === "withdraw"}">출금</button>
          </div>

          <div class="asset-cash-form" data-asset-cash-form data-mode="${assetCashMode}">
            <label for="assetCashAmount">${actionLabel}액</label>
            <div class="journal-input-shell">
              <input id="assetCashAmount" type="number" min="0" ${isWithdraw ? `max="${assetCashBalance}"` : ""} inputmode="numeric" placeholder="${actionLabel}액을 입력하세요" data-asset-cash-amount>
              <span>원</span>
            </div>
            <p class="asset-cash-help">${isWithdraw ? `출금 가능 금액은 ${formatKRW(assetCashBalance)}입니다.` : "입금액은 현금 자산에 더해집니다."}</p>
            <p class="asset-cash-feedback error" data-asset-cash-live-error>${assetCashError}</p>
            <p class="asset-cash-feedback success">${assetCashMessage}</p>
            <div class="asset-cash-actions">
              <button class="btn" type="button" data-modal-close>취소</button>
              <button class="btn primary" type="button" data-asset-cash-submit>${actionLabel}하기</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

function getRoute() {
  const route = window.location.hash.replace("#", "");
  return renderers[route] ? route : "dashboard";
}

function renderModal() {
  const modalRoot = document.querySelector("#modalRoot");
  if (!modalRoot) return;

  if (!["journalWrite", "assetCash"].includes(activeModal)) {
    modalRoot.innerHTML = "";
    if (document.body) document.body.classList.remove("modal-open");
    return;
  }

  if (document.body) document.body.classList.add("modal-open");
  if (activeModal === "assetCash") {
    modalRoot.innerHTML = renderAssetCashModal();
    return;
  }

  modalRoot.innerHTML = `
    <div class="modal-backdrop">
      <section class="modal-panel journal-write-modal" role="dialog" aria-modal="true" aria-labelledby="journalWriteModalTitle">
        <div class="modal-body">
          ${renderJournalWrite()}
        </div>
      </section>
    </div>
  `;
}

function renderMobileSheet() {
  const sheetRoot = document.querySelector("#mobileSheetRoot");
  if (!sheetRoot) return;

  if (!mobileSheetOpen) {
    sheetRoot.innerHTML = "";
    if (!activeModal && document.body) document.body.classList.remove("modal-open");
    return;
  }

  if (document.body) document.body.classList.add("modal-open");
  const quickItems = [
    ["dashboard", "home", "대시보드"],
    ["journal", "journal", "매매일지"],
    ["stock", "chart", "종목 분석"],
    ["assets", "wallet", "자산 현황"],
    ["memo", "memo", "메모"],
    ["calendar", "calendar", "캘린더"],
    ["settings", "settings", "설정"],
    ["performance", "performance", "리포트"]
  ];
  const supportItems = [
    ["tag", "태그 관리"],
    ["cloud", "데이터 백업"],
    ["report", "리포트"],
    ["headset", "고객센터"]
  ];

  sheetRoot.innerHTML = `
    <div class="mobile-sheet-backdrop" data-mobile-sheet-close>
      <section class="mobile-more-sheet" role="dialog" aria-modal="true" aria-label="더보기 메뉴">
        <button class="mobile-sheet-close" type="button" data-mobile-sheet-close aria-label="닫기">X</button>
        <div class="mobile-profile-row">
          <span class="mobile-profile-avatar">${icon("user")}</span>
          <div>
            <strong>투자자</strong>
            <p>investor@example.com</p>
          </div>
          <button class="btn ghost" type="button">내 정보</button>
        </div>
        <div class="mobile-more-grid">
          ${quickItems.map(([route, iconName, label]) => `
            <button type="button" data-route="${route}">
              <span>${icon(iconName)}</span>
              <strong>${label}</strong>
            </button>
          `).join("")}
          ${supportItems.map(([iconName, label]) => `
            <button type="button">
              <span>${icon(iconName)}</span>
              <strong>${label}</strong>
            </button>
          `).join("")}
        </div>
        <button class="mobile-logout" type="button">${icon("logout")}로그아웃</button>
      </section>
    </div>
  `;
}

function render() {
  const route = getRoute();
  const meta = pageMeta[route];
  document.body.dataset.route = route;
  document.querySelector("#pageTitle").textContent = meta.title;
  document.querySelector("#pageDescription").textContent = meta.description;
  document.querySelector("#pageEyebrow").textContent = route === "journalWrite" ? "New Record" : "Trading Journal";
  renderNav(route);
  renderPageActions(route);
  document.querySelector("#app").innerHTML = renderers[route]();
  renderModal();
  renderMobileSheet();
  hydrateIcons(document);
}

document.addEventListener("click", (event) => {
  const modalButton = event.target.closest("[data-modal]");
  if (modalButton) {
    activeModal = modalButton.dataset.modal;
    if (activeModal === "assetCash") {
      assetCashMode = "deposit";
      assetCashError = "";
      assetCashMessage = "";
    }
    renderModal();
    hydrateIcons(document);
    return;
  }

  const mobileMoreButton = event.target.closest("[data-mobile-more]");
  if (mobileMoreButton) {
    mobileSheetOpen = true;
    renderMobileSheet();
    hydrateIcons(document);
    return;
  }

  const mobileSheetClose = event.target.closest(".mobile-sheet-close") || event.target.matches(".mobile-sheet-backdrop");
  if (mobileSheetClose) {
    mobileSheetOpen = false;
    renderMobileSheet();
    return;
  }

  const modalClose = event.target.closest("[data-modal-close]");
  if (modalClose) {
    activeModal = null;
    assetCashError = "";
    assetCashMessage = "";
    renderModal();
    return;
  }

  const modalPanel = event.target.closest(".modal-panel");
  if (activeModal && event.target.closest(".modal-backdrop") && !modalPanel) {
    activeModal = null;
    assetCashError = "";
    assetCashMessage = "";
    renderModal();
    return;
  }

  const assetCashModeButton = event.target.closest("[data-asset-cash-mode]");
  if (assetCashModeButton && activeModal === "assetCash") {
    assetCashMode = assetCashModeButton.dataset.assetCashMode;
    assetCashError = "";
    assetCashMessage = "";
    renderModal();
    hydrateIcons(document);
    return;
  }

  const assetCashSubmit = event.target.closest("[data-asset-cash-submit]");
  if (assetCashSubmit && activeModal === "assetCash") {
    const amountInput = document.querySelector("[data-asset-cash-amount]");
    const amount = parseKRWInput(amountInput ? amountInput.value : "");

    assetCashMessage = "";
    if (amount <= 0) {
      assetCashError = "금액을 1원 이상 입력하세요.";
      renderModal();
      return;
    }

    if (assetCashMode === "withdraw" && amount > assetCashBalance) {
      assetCashError = "현재 현금 자산보다 큰 금액은 출금할 수 없습니다.";
      renderModal();
      return;
    }

    assetCashBalance = assetCashMode === "withdraw" ? assetCashBalance - amount : assetCashBalance + amount;
    assetCashError = "";
    assetCashMessage = `${assetCashMode === "withdraw" ? "출금" : "입금"} ${formatKRW(amount)}이 반영되었습니다.`;
    render();
    return;
  }

  const holdingsViewButton = event.target.closest("[data-dashboard-holdings-view]");
  if (holdingsViewButton && getRoute() === "dashboard") {
    dashboardHoldingsView = holdingsViewButton.dataset.dashboardHoldingsView;
    render();
    return;
  }

  const journalTradeModeButton = event.target.closest("[data-journal-trade-mode]");
  if (journalTradeModeButton) {
    const form = journalTradeModeButton.closest("[data-journal-entry-form]");
    if (form) {
      form.dataset.tradeMode = journalTradeModeButton.dataset.journalTradeMode;
      form.querySelectorAll("[data-journal-trade-mode]").forEach((button) => {
        const active = button === journalTradeModeButton;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }
    return;
  }

  const journalDeleteButton = event.target.closest("[data-journal-delete-selected]");
  if (journalDeleteButton && getRoute() === "journal") {
    journalSelectedTradeIds.forEach((id) => journalDeletedTradeIds.add(id));
    journalSelectedTradeIds.clear();
    render();
    return;
  }

  const routeButton = event.target.closest("[data-route]");
  if (routeButton) {
    const route = routeButton.dataset.route;
    if (renderers[route]) {
      activeModal = null;
      mobileSheetOpen = false;
      window.location.hash = route;
      if (getRoute() === route) render();
    }
  }

  const segmentedButton = event.target.closest(".segmented button");
  if (segmentedButton) {
    segmentedButton.parentElement.querySelectorAll("button").forEach((button) => button.classList.remove("active"));
    segmentedButton.classList.add("active");
  }

  const switchButton = event.target.closest(".switch");
  if (switchButton) {
    switchButton.classList.toggle("on");
  }
});

document.addEventListener("change", (event) => {
  const journalCheckbox = event.target.closest("[data-journal-select]");
  if (!journalCheckbox || getRoute() !== "journal") return;

  if (journalCheckbox.checked) {
    journalSelectedTradeIds.add(journalCheckbox.dataset.journalSelect);
  } else {
    journalSelectedTradeIds.delete(journalCheckbox.dataset.journalSelect);
  }

  render();
});

document.addEventListener("input", (event) => {
  const amountInput = event.target.closest("[data-asset-cash-amount]");
  if (!amountInput || activeModal !== "assetCash") return;

  const feedback = document.querySelector(".asset-cash-feedback.error");
  if (!feedback) return;

  const amount = parseKRWInput(amountInput.value);
  if (assetCashMode === "withdraw" && amount > assetCashBalance) {
    feedback.textContent = "현재 현금 자산보다 큰 금액은 출금할 수 없습니다.";
  } else {
    feedback.textContent = "";
  }
});

document.addEventListener("pointerover", (event) => {
  const target = event.target.closest("[data-chart-tooltip]");
  if (!target) return;
  showChartTooltip(target, event);
});

document.addEventListener("pointermove", (event) => {
  const target = event.target.closest("[data-chart-tooltip]");
  if (!target) return;
  positionChartTooltip(event);
});

document.addEventListener("pointerout", (event) => {
  const target = event.target.closest("[data-chart-tooltip]");
  if (!target) return;
  const relatedTarget = event.relatedTarget && event.relatedTarget.closest ? event.relatedTarget.closest("[data-chart-tooltip]") : null;
  if (relatedTarget === target) return;
  hideChartTooltip();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && activeModal) {
    activeModal = null;
    assetCashError = "";
    assetCashMessage = "";
    renderModal();
  }
  if (event.key === "Escape" && mobileSheetOpen) {
    mobileSheetOpen = false;
    renderMobileSheet();
  }
});

window.addEventListener("hashchange", render);
render();
