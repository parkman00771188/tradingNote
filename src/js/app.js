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
var fitMetricValueFrame = 0;
var assetCashBalance = 8480000;
var assetCashMode = "deposit";
var assetCashError = "";
var assetCashMessage = "";
var assetCashDraftAmount = "";
var assetCashPendingAmount = 0;
var assetCashPendingMode = "deposit";

const fallbackAssetInvestedBalance = 42750000;

function formatKRW(value) {
  return `${Math.max(0, Math.round(Number(value) || 0)).toLocaleString()}원`;
}

function getAssetCashBalance() {
  return assetCashBalance;
}

function getAssetInvestedValue() {
  return typeof getHoldingTotalValue === "function" ? getHoldingTotalValue() : fallbackAssetInvestedBalance;
}

function getAssetTotalValue() {
  return getAssetInvestedValue() + assetCashBalance;
}

function parseKRWInput(value) {
  return Math.max(0, Number(String(value).replace(/[^0-9]/g, "")) || 0);
}

function formatNumberInput(input) {
  const digits = String(input.value).replace(/[^0-9]/g, "");
  input.value = digits ? Number(digits).toLocaleString() : "";
}

function fitValueText(root = document) {
  root.querySelectorAll("[data-fit-value]").forEach((node) => {
    node.style.fontSize = "";

    if (!node.clientWidth || !node.scrollWidth) return;

    const maxSize = parseFloat(window.getComputedStyle(node).fontSize);
    const minSize = Number(node.dataset.fitMin) || 12;
    let nextSize = maxSize;

    while (node.scrollWidth > node.clientWidth && nextSize > minSize) {
      nextSize -= 0.5;
      node.style.fontSize = `${nextSize}px`;
    }
  });
}

function scheduleFitValueText(root = document) {
  if (fitMetricValueFrame) cancelAnimationFrame(fitMetricValueFrame);
  fitMetricValueFrame = requestAnimationFrame(() => {
    fitMetricValueFrame = 0;
    fitValueText(root);
  });
}

function openLinkedDatePicker(trigger) {
  const shell = trigger.closest(".input-with-icon");
  const input = shell ? shell.querySelector("[data-date-picker]") : null;
  if (!input) return;

  input.focus();
  if (typeof input.showPicker === "function") {
    try {
      input.showPicker();
      return;
    } catch (error) {
      input.click();
      return;
    }
  }
  input.click();
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
              <input id="assetCashAmount" type="text" value="${assetCashDraftAmount}" ${isWithdraw ? `data-max="${assetCashBalance}"` : ""} inputmode="numeric" autocomplete="off" placeholder="${actionLabel}액을 입력하세요" data-number-input data-asset-cash-amount>
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

function renderAssetCashConfirmModal() {
  const isWithdraw = assetCashPendingMode === "withdraw";
  const actionLabel = isWithdraw ? "출금" : "입금";
  const question = `${formatKRW(assetCashPendingAmount)}을 ${actionLabel}하시겠습니까?`;
  const nextCashBalance = isWithdraw ? assetCashBalance - assetCashPendingAmount : assetCashBalance + assetCashPendingAmount;

  return `
    <div class="modal-backdrop">
      <section class="modal-panel asset-cash-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="assetCashConfirmTitle">
        <div class="modal-header">
          <div>
            <p class="eyebrow">${isWithdraw ? "Withdraw" : "Deposit"}</p>
            <h2 class="modal-title" id="assetCashConfirmTitle">${actionLabel} 확인</h2>
          </div>
          <button class="icon-button" type="button" data-modal-close aria-label="닫기">X</button>
        </div>
        <div class="modal-body">
          <div class="asset-cash-confirm-card">
            <span>${icon(isWithdraw ? "download" : "plus")}</span>
            <div>
              <p>${actionLabel}금액</p>
              <strong>${formatKRW(assetCashPendingAmount)}</strong>
              <em>처리 후 현금 자산 ${formatKRW(nextCashBalance)}</em>
            </div>
          </div>
          <p class="asset-cash-confirm-question">${question}</p>
          <div class="asset-cash-actions">
            <button class="btn" type="button" data-asset-cash-confirm-cancel>취소</button>
            <button class="btn primary" type="button" data-asset-cash-confirm>${actionLabel}하기</button>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderJournalDateRangeModal() {
  const range = getJournalDateRangeDraft();
  const isCustomRange = journalDateRangePresetDraft === "custom";

  return `
    <div class="modal-backdrop">
      <section class="modal-panel journal-date-modal" role="dialog" aria-modal="true" aria-labelledby="journalDateModalTitle">
        <div class="modal-header">
          <div>
            <p class="eyebrow">Date Range</p>
            <h2 class="modal-title" id="journalDateModalTitle">기간 선택</h2>
          </div>
          <button class="icon-button" type="button" data-modal-close aria-label="닫기">X</button>
        </div>
        <div class="modal-body">
          <div class="journal-date-presets" role="tablist" aria-label="기간 빠른 선택">
            ${journalDatePresets
              .map(([value, label]) => `
                <button class="${journalDateRangePresetDraft === value ? "active" : ""}" type="button" data-journal-date-preset="${value}" aria-pressed="${journalDateRangePresetDraft === value}">${label}</button>
              `)
              .join("")}
          </div>
          ${
            isCustomRange
              ? `<div class="journal-date-range-picker">
                  <label class="journal-date-field">
                    <span>${icon("calendar")}시작일</span>
                    <input type="date" value="${range.start}" data-journal-date-input="start">
                  </label>
                  <label class="journal-date-field">
                    <span>${icon("calendar")}종료일</span>
                    <input type="date" value="${range.end}" data-journal-date-input="end">
                  </label>
                </div>`
              : ""
          }
          <div class="journal-date-actions">
            <button class="btn" type="button" data-modal-close>취소</button>
            <button class="btn primary" type="button" data-journal-date-apply>적용</button>
          </div>
        </div>
      </section>
    </div>
  `;
}

function cancelActiveModalDraft(modalName = activeModal) {
  if (modalName === "journalDateRange") cancelJournalDateRangeEdit();
  if (modalName === "journalStockFilter") cancelJournalStockFilterEdit();
  if (modalName === "journalTradeTypeFilter") cancelJournalTradeTypeFilterEdit();
}

function getRoute() {
  const route = window.location.hash.replace("#", "");
  return renderers[route] ? route : "dashboard";
}

function renderModal() {
  const modalRoot = document.querySelector("#modalRoot");
  if (!modalRoot) return;

  if (!["journalWrite", "assetCash", "assetCashConfirm", "journalDateRange", "journalStockFilter", "journalTradeTypeFilter"].includes(activeModal)) {
    modalRoot.innerHTML = "";
    if (document.body) document.body.classList.remove("modal-open");
    return;
  }

  if (document.body) document.body.classList.add("modal-open");
  if (activeModal === "journalDateRange") {
    modalRoot.innerHTML = renderJournalDateRangeModal();
    return;
  }

  if (activeModal === "journalStockFilter") {
    modalRoot.innerHTML = renderJournalStockFilterModal();
    return;
  }

  if (activeModal === "journalTradeTypeFilter") {
    modalRoot.innerHTML = renderJournalTradeTypeFilterModal();
    return;
  }

  if (activeModal === "assetCash") {
    modalRoot.innerHTML = renderAssetCashModal();
    return;
  }

  if (activeModal === "assetCashConfirm") {
    modalRoot.innerHTML = renderAssetCashConfirmModal();
    return;
  }

  modalRoot.innerHTML = `
    <div class="modal-backdrop">
      <section class="modal-panel journal-write-modal" role="dialog" aria-modal="true" aria-labelledby="journalWriteModalTitle">
        <div class="modal-header">
          <div>
            <p class="eyebrow">New Record</p>
            <h2 class="modal-title" id="journalWriteModalTitle">매매 일지 작성</h2>
          </div>
          <button class="icon-button" type="button" data-modal-close aria-label="닫기">X</button>
        </div>
        <div class="modal-body">
          ${renderJournalWrite({ showTitle: false })}
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
  scheduleFitValueText();
}

function handleJournalWriteExtraClick(event) {
  const pickerBackdrop = event.target.matches("[data-journal-write-stock-backdrop]");
  const pickerCancel = event.target.closest("[data-journal-write-stock-cancel]");
  if (pickerBackdrop || pickerCancel) {
    closeJournalWriteStockPicker(event.target.closest("[data-journal-entry-form]"));
    return true;
  }

  const stockOption = event.target.closest("[data-journal-write-stock-option]");
  if (stockOption) {
    selectJournalWriteStockDraft(stockOption);
    return true;
  }

  const stockApply = event.target.closest("[data-journal-write-stock-apply]");
  if (stockApply) {
    applyJournalWriteStockSelection(stockApply);
    return true;
  }

  const stockOpen = event.target.closest("[data-journal-write-stock-open]");
  if (stockOpen) {
    openJournalWriteStockPicker(stockOpen);
    return true;
  }

  const quantityPreset = event.target.closest("[data-journal-quantity-preset]");
  if (quantityPreset) {
    applyJournalQuantityPreset(quantityPreset);
    return true;
  }

  return false;
}

document.addEventListener("click", (event) => {
  const modalButton = event.target.closest("[data-modal]");
  if (modalButton) {
    activeModal = modalButton.dataset.modal;
    if (activeModal === "assetCash") {
      assetCashMode = "deposit";
      assetCashError = "";
      assetCashMessage = "";
      assetCashDraftAmount = "";
      assetCashPendingAmount = 0;
      assetCashPendingMode = "deposit";
    }
    if (activeModal === "journalDateRange") {
      beginJournalDateRangeEdit();
    }
    if (activeModal === "journalStockFilter") {
      beginJournalStockFilterEdit();
    }
    if (activeModal === "journalTradeTypeFilter") {
      beginJournalTradeTypeFilterEdit();
    }
    renderModal();
    hydrateIcons(document);
    return;
  }

  const modalPanel = event.target.closest(".modal-panel");
  if (activeModal) {
    const datePickerButton = event.target.closest("[data-date-picker-trigger]");
    if (datePickerButton && modalPanel) {
      openLinkedDatePicker(datePickerButton);
      return;
    }

    if (handleJournalWriteExtraClick(event)) return;

    const modalClose = event.target.closest("[data-modal-close]");
    if (modalClose && modalPanel) {
      cancelActiveModalDraft();
      activeModal = null;
      assetCashError = "";
      assetCashMessage = "";
      renderModal();
      return;
    }

    const journalStockOption = event.target.closest("[data-journal-stock-option]");
    if (journalStockOption && activeModal === "journalStockFilter") {
      setJournalStockFilterDraft(journalStockOption.dataset.journalStockOption);
      renderModal();
      hydrateIcons(document);
      return;
    }

    const journalTypeOption = event.target.closest("[data-journal-type-filter-option]");
    if (journalTypeOption && activeModal === "journalTradeTypeFilter") {
      setJournalTradeTypeFilterDraft(journalTypeOption.dataset.journalTypeFilterOption);
      renderModal();
      hydrateIcons(document);
      return;
    }

    const journalDatePreset = event.target.closest("[data-journal-date-preset]");
    if (journalDatePreset && activeModal === "journalDateRange") {
      setJournalDateRangePresetDraft(journalDatePreset.dataset.journalDatePreset);
      renderModal();
      hydrateIcons(document);
      return;
    }

    const journalDateApply = event.target.closest("[data-journal-date-apply]");
    if (journalDateApply && activeModal === "journalDateRange") {
      applyJournalDateRangeEdit();
      activeModal = null;
      render();
      return;
    }

    const journalStockApply = event.target.closest("[data-journal-stock-apply]");
    if (journalStockApply && activeModal === "journalStockFilter") {
      applyJournalStockFilterEdit();
      activeModal = null;
      render();
      return;
    }

    const journalTypeApply = event.target.closest("[data-journal-type-apply]");
    if (journalTypeApply && activeModal === "journalTradeTypeFilter") {
      applyJournalTradeTypeFilterEdit();
      activeModal = null;
      render();
      return;
    }

    const assetCashModeButton = event.target.closest("[data-asset-cash-mode]");
    if (assetCashModeButton && activeModal === "assetCash") {
      assetCashMode = assetCashModeButton.dataset.assetCashMode;
      assetCashError = "";
      assetCashMessage = "";
      assetCashDraftAmount = "";
      renderModal();
      hydrateIcons(document);
      return;
    }

    const assetCashSubmit = event.target.closest("[data-asset-cash-submit]");
    if (assetCashSubmit && activeModal === "assetCash") {
      const amountInput = document.querySelector("[data-asset-cash-amount]");
      const amount = parseKRWInput(amountInput ? amountInput.value : "");
      assetCashDraftAmount = amountInput ? amountInput.value : "";

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

      assetCashPendingAmount = amount;
      assetCashPendingMode = assetCashMode;
      assetCashError = "";
      assetCashMessage = "";
      activeModal = "assetCashConfirm";
      renderModal();
      hydrateIcons(document);
      return;
    }

    const assetCashConfirmCancel = event.target.closest("[data-asset-cash-confirm-cancel]");
    if (assetCashConfirmCancel && activeModal === "assetCashConfirm") {
      activeModal = "assetCash";
      assetCashError = "";
      assetCashMessage = "";
      renderModal();
      hydrateIcons(document);
      return;
    }

    const assetCashConfirm = event.target.closest("[data-asset-cash-confirm]");
    if (assetCashConfirm && activeModal === "assetCashConfirm") {
      if (assetCashPendingAmount <= 0) {
        activeModal = "assetCash";
        assetCashError = "금액을 1원 이상 입력하세요.";
        renderModal();
        return;
      }

      if (assetCashPendingMode === "withdraw" && assetCashPendingAmount > assetCashBalance) {
        activeModal = "assetCash";
        assetCashError = "현재 현금 자산보다 큰 금액은 출금할 수 없습니다.";
        renderModal();
        return;
      }

      assetCashBalance = assetCashPendingMode === "withdraw" ? assetCashBalance - assetCashPendingAmount : assetCashBalance + assetCashPendingAmount;
      assetCashError = "";
      assetCashMessage = "";
      assetCashDraftAmount = "";
      assetCashPendingAmount = 0;
      assetCashPendingMode = "deposit";
      activeModal = null;
      render();
      return;
    }

    const journalCurrentPriceButton = event.target.closest("[data-journal-current-price]");
    if (journalCurrentPriceButton) {
      applyJournalCurrentPrice(journalCurrentPriceButton);
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
        syncJournalTradeMode(form);
      }
      return;
    }

    const journalEntrySave = event.target.closest("[data-journal-entry-save]");
    if (journalEntrySave) {
      const form = journalEntrySave.closest("[data-journal-entry-form]");
      if (form && !updateJournalTradeEstimate(form)) return;
      activeModal = null;
      renderModal();
      return;
    }

    if (event.target.matches(".modal-backdrop")) {
      cancelActiveModalDraft();
      activeModal = null;
      assetCashError = "";
      assetCashMessage = "";
      assetCashDraftAmount = "";
      assetCashPendingAmount = 0;
      assetCashPendingMode = "deposit";
      renderModal();
      return;
    }

    if (modalPanel) return;
  }

  const pageDatePickerButton = event.target.closest("[data-date-picker-trigger]");
  if (pageDatePickerButton) {
    openLinkedDatePicker(pageDatePickerButton);
    return;
  }

  if (handleJournalWriteExtraClick(event)) return;

  const pageJournalTradeModeButton = event.target.closest("[data-journal-trade-mode]");
  if (pageJournalTradeModeButton) {
    const form = pageJournalTradeModeButton.closest("[data-journal-entry-form]");
    if (form) {
      form.dataset.tradeMode = pageJournalTradeModeButton.dataset.journalTradeMode;
      form.querySelectorAll("[data-journal-trade-mode]").forEach((button) => {
        const active = button === pageJournalTradeModeButton;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
      syncJournalTradeMode(form);
    }
    return;
  }

  const pageJournalCurrentPriceButton = event.target.closest("[data-journal-current-price]");
  if (pageJournalCurrentPriceButton) {
    applyJournalCurrentPrice(pageJournalCurrentPriceButton);
    return;
  }

  const pageJournalEntrySave = event.target.closest("[data-journal-entry-save]");
  if (pageJournalEntrySave) {
    const form = pageJournalEntrySave.closest("[data-journal-entry-form]");
    if (form && !updateJournalTradeEstimate(form)) return;
    if (getRoute() === "journalWrite") {
      window.location.hash = "#journal";
    }
    return;
  }

  const holdingsViewButton = event.target.closest("[data-dashboard-holdings-view]");
  if (holdingsViewButton && getRoute() === "dashboard") {
    dashboardHoldingsView = holdingsViewButton.dataset.dashboardHoldingsView;
    render();
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

document.addEventListener("submit", (event) => {
  if (!event.target.closest(".modal-panel form")) return;
  event.preventDefault();
});

document.addEventListener("change", (event) => {
  const journalDateInput = event.target.closest("[data-journal-date-input]");
  if (journalDateInput && activeModal === "journalDateRange") {
    setJournalDateRangeDraft(journalDateInput.dataset.journalDateInput, journalDateInput.value);
    return;
  }

  if (activeModal && event.target.closest(".modal-panel")) return;

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
  const numberInput = event.target.closest("[data-number-input]");
  if (numberInput) {
    formatNumberInput(numberInput);
  }

  const journalEntryForm = event.target.closest("[data-journal-entry-form]");
  if (journalEntryForm) {
    updateJournalTradeEstimate(journalEntryForm);
  }

  const journalWriteStockSearch = event.target.closest("[data-journal-write-stock-search]");
  if (journalWriteStockSearch) {
    filterJournalWriteStockPicker(journalWriteStockSearch);
    return;
  }

  const journalWriteStockName = event.target.closest("[data-journal-stock-name]");
  if (journalWriteStockName) {
    const form = journalWriteStockName.closest("[data-journal-entry-form]");
    clearJournalSelectedStock(form, { keepInput: true });
    return;
  }

  const journalStockSearchInput = event.target.closest("[data-journal-stock-search]");
  if (journalStockSearchInput && activeModal === "journalStockFilter") {
    updateJournalStockSearchView(journalStockSearchInput.value);
    return;
  }

  const amountInput = event.target.closest("[data-asset-cash-amount]");
  if (!amountInput || activeModal !== "assetCash") return;

  const feedback = document.querySelector(".asset-cash-feedback.error");
  if (!feedback) return;

  const amount = parseKRWInput(amountInput.value);
  assetCashDraftAmount = amountInput.value;
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
    cancelActiveModalDraft();
    activeModal = null;
    assetCashError = "";
    assetCashMessage = "";
    assetCashDraftAmount = "";
    assetCashPendingAmount = 0;
    assetCashPendingMode = "deposit";
    renderModal();
  }
  if (event.key === "Escape" && mobileSheetOpen) {
    mobileSheetOpen = false;
    renderMobileSheet();
  }
});

window.addEventListener("hashchange", () => {
  cancelActiveModalDraft();
  activeModal = null;
  assetCashError = "";
  assetCashMessage = "";
  assetCashDraftAmount = "";
  assetCashPendingAmount = 0;
  assetCashPendingMode = "deposit";
  mobileSheetOpen = false;
  render();
});
window.addEventListener("resize", () => scheduleFitValueText());
render();
