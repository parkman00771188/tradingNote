const renderers = {
  landing: renderLanding,
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
var pinnedChartTooltipTarget = null;
var chartTooltipPointerTapTarget = null;
var chartTooltipPositionFrame = 0;
var fitMetricValueFrame = 0;
var assetCashBalance = 8480000;
var assetCashMode = "deposit";
var assetCashError = "";
var assetCashMessage = "";
var assetCashDraftAmount = "";
var assetCashPendingAmount = 0;
var assetCashPendingMode = "deposit";
var assetSettingsDrafts = [];
var assetSettingsError = "";
var assetSettingsNextId = 1;
var assetSettingsOpenMenuId = null;
var assetSettingsEditingId = null;

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

function scrollPageToTop() {
  const html = document.documentElement;
  const body = document.body;
  const previousHtmlScrollBehavior = html ? html.style.scrollBehavior : "";
  const previousBodyScrollBehavior = body ? body.style.scrollBehavior : "";

  if (html) html.style.scrollBehavior = "auto";
  if (body) body.style.scrollBehavior = "auto";
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.querySelector(".main")?.scrollTo?.({ top: 0, left: 0, behavior: "auto" });

  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.querySelector(".main")?.scrollTo?.({ top: 0, left: 0, behavior: "auto" });
    if (html) html.style.scrollBehavior = previousHtmlScrollBehavior;
    if (body) body.style.scrollBehavior = previousBodyScrollBehavior;
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

function positionPinnedChartTooltip() {
  if (!chartTooltip || !pinnedChartTooltipTarget) return;

  if (!pinnedChartTooltipTarget.isConnected) {
    hideChartTooltip();
    return;
  }

  const gap = 10;
  const targetRect = pinnedChartTooltipTarget.getBoundingClientRect();

  if (targetRect.bottom < 0 || targetRect.top > window.innerHeight || targetRect.right < 0 || targetRect.left > window.innerWidth) {
    hideChartTooltip();
    return;
  }

  const { offsetWidth, offsetHeight } = chartTooltip;
  const canPlaceRight = targetRect.right + gap + offsetWidth <= window.innerWidth - gap;
  const canPlaceLeft = targetRect.left - gap - offsetWidth >= gap;
  let left = targetRect.right + gap;

  if (!canPlaceRight && canPlaceLeft) {
    left = targetRect.left - offsetWidth - gap;
  } else if (!canPlaceRight) {
    left = targetRect.left + targetRect.width / 2 - offsetWidth / 2;
  }

  const top = targetRect.top + targetRect.height / 2 - offsetHeight / 2;

  chartTooltip.style.left = `${Math.min(Math.max(gap, left), window.innerWidth - offsetWidth - gap)}px`;
  chartTooltip.style.top = `${Math.min(Math.max(gap, top), window.innerHeight - offsetHeight - gap)}px`;
}

function schedulePinnedChartTooltipPosition() {
  if (!pinnedChartTooltipTarget || !chartTooltip?.classList.contains("show")) return;
  if (chartTooltipPositionFrame) cancelAnimationFrame(chartTooltipPositionFrame);
  chartTooltipPositionFrame = requestAnimationFrame(() => {
    chartTooltipPositionFrame = 0;
    positionPinnedChartTooltip();
  });
}

function showChartTooltip(target, event) {
  const tooltip = getChartTooltip();
  tooltip.textContent = target.dataset.chartTooltip;
  tooltip.classList.add("show");
  positionChartTooltip(event);
}

function clearPinnedChartTooltipTarget() {
  if (chartTooltipPositionFrame) cancelAnimationFrame(chartTooltipPositionFrame);
  chartTooltipPositionFrame = 0;
  if (pinnedChartTooltipTarget) pinnedChartTooltipTarget.classList.remove("active");
  pinnedChartTooltipTarget?.closest(".donut")?.classList.remove("has-active-segment");
  pinnedChartTooltipTarget = null;
}

function hideChartTooltip() {
  clearPinnedChartTooltipTarget();
  if (!chartTooltip) return;
  chartTooltip.classList.remove("show");
}

function isTouchChartTooltipMode() {
  return window.matchMedia("(hover: none), (pointer: coarse), (any-pointer: coarse)").matches;
}

function togglePinnedChartTooltip(target, event) {
  if (pinnedChartTooltipTarget === target && chartTooltip?.classList.contains("show")) {
    hideChartTooltip();
    return;
  }

  if (pinnedChartTooltipTarget) pinnedChartTooltipTarget.classList.remove("active");
  pinnedChartTooltipTarget?.closest(".donut")?.classList.remove("has-active-segment");
  pinnedChartTooltipTarget = target;
  pinnedChartTooltipTarget.classList.add("active");
  pinnedChartTooltipTarget.closest(".donut")?.classList.add("has-active-segment");
  showChartTooltip(target, event);
  positionPinnedChartTooltip();
}

function createAssetSettingsDraft(item = {}) {
  return {
    id: `asset-setting-${assetSettingsNextId++}`,
    name: item.name || "",
    code: item.code || "",
    quantity: Math.max(0, Number(item.quantity) || 0),
    averagePrice: Math.max(0, Number(item.averagePrice) || 0),
    currentPrice: Math.max(0, Number(item.currentPrice) || 0)
  };
}

function beginAssetSettingsEdit() {
  const holdingData = typeof getHoldingData === "function" ? getHoldingData() : [];
  assetSettingsDrafts = holdingData.map((item) => createAssetSettingsDraft(item));
  assetSettingsError = "";
  assetSettingsOpenMenuId = null;
  assetSettingsEditingId = null;
}

function cancelAssetSettingsEdit() {
  assetSettingsDrafts = [];
  assetSettingsError = "";
  assetSettingsOpenMenuId = null;
  assetSettingsEditingId = null;
}

function addAssetSettingsDraft() {
  if (assetSettingsDrafts.length >= 12) return;
  const draft = createAssetSettingsDraft();
  assetSettingsDrafts.push(draft);
  assetSettingsError = "";
  assetSettingsOpenMenuId = null;
  assetSettingsEditingId = draft.id;
}

function removeAssetSettingsDraft(rowId) {
  const wasEditing = assetSettingsEditingId === rowId;
  assetSettingsDrafts = assetSettingsDrafts.filter((item) => item.id !== rowId);
  assetSettingsError = "";
  assetSettingsOpenMenuId = null;
  if (!assetSettingsDrafts.length) {
    const draft = createAssetSettingsDraft();
    assetSettingsDrafts.push(draft);
    assetSettingsEditingId = draft.id;
    return;
  }
  if (wasEditing || !assetSettingsEditingId) {
    assetSettingsEditingId = assetSettingsDrafts[0]?.id || null;
  }
}

function updateAssetSettingsDraft(rowId, field, value) {
  assetSettingsDrafts = assetSettingsDrafts.map((item) => {
    if (item.id !== rowId) return item;
    if (field === "name" || field === "code") {
      return { ...item, [field]: value };
    }
    return { ...item, [field]: parseKRWInput(value) };
  });
  assetSettingsError = "";
}

function isEmptyAssetSettingsDraft(item) {
  return !String(item.name || "").trim() &&
    !String(item.code || "").trim() &&
    !item.quantity &&
    !item.averagePrice &&
    !item.currentPrice;
}

function applyAssetSettingsEdit() {
  const rows = assetSettingsDrafts
    .filter((item) => !isEmptyAssetSettingsDraft(item))
    .map((item) => ({
      name: String(item.name || "").trim(),
      code: String(item.code || "").trim(),
      quantity: Math.max(0, Number(item.quantity) || 0),
      averagePrice: Math.max(0, Number(item.averagePrice) || 0),
      currentPrice: Math.max(0, Number(item.currentPrice) || Number(item.averagePrice) || 0)
    }));

  if (!rows.length) {
    assetSettingsError = "최소 1개 이상의 자산을 입력하세요.";
    return false;
  }

  const duplicateKeys = new Set();
  for (const row of rows) {
    if (!row.name) {
      assetSettingsError = "종목명을 입력하세요.";
      return false;
    }
    if (!row.quantity || !row.averagePrice) {
      assetSettingsError = "수량과 매수평균가는 1 이상으로 입력하세요.";
      return false;
    }

    const key = normalizeStockKey(`${row.name}-${row.code || row.name}`);
    if (duplicateKeys.has(key)) {
      assetSettingsError = "같은 자산이 중복되어 있습니다.";
      return false;
    }
    duplicateKeys.add(key);
  }

  holdings.splice(
    0,
    holdings.length,
    ...rows.map((row) => {
      const amount = Math.round(row.quantity * row.currentPrice);
      const costBasis = Math.round(row.quantity * row.averagePrice);
      const profit = amount - costBasis;
      const rate = costBasis ? (profit / costBasis) * 100 : 0;
      return [
        row.name,
        formatMarketNumber(row.quantity),
        formatMarketNumber(amount),
        formatSignedMarketNumber(profit),
        formatSignedRate(rate),
        "0%"
      ];
    })
  );

  rows.forEach((row) => {
    const watchRow = typeof findWatchListRow === "function" ? findWatchListRow(row.name, row.code) : null;
    if (watchRow) {
      watchRow[0] = row.name;
      watchRow[1] = row.code;
      watchRow[2] = formatMarketNumber(row.currentPrice);
      watchRow[3] = watchRow[3] || "+0.00%";
      watchRow[4] = watchRow[4] || "0";
      return;
    }

    if (typeof watchList !== "undefined") {
      watchList.push([row.name, row.code, formatMarketNumber(row.currentPrice), "+0.00%", "0"]);
    }
  });

  cancelAssetSettingsEdit();
  return true;
}

function renderAssetSettingsModal() {
  const drafts = assetSettingsDrafts;
  const canAdd = drafts.length < 12;

  return `
    <div class="modal-backdrop">
      <section class="modal-panel asset-settings-modal" role="dialog" aria-modal="true" aria-labelledby="assetSettingsModalTitle">
        <div class="modal-header">
          <div>
            <p class="eyebrow">Asset Settings</p>
            <h2 class="modal-title" id="assetSettingsModalTitle">자산 설정</h2>
          </div>
          <button class="icon-button" type="button" data-modal-close aria-label="닫기">X</button>
        </div>
        <div class="modal-body">
          <div class="asset-settings-help">
            <strong>보유 자산을 수정하거나 새 자산을 추가하세요.</strong>
            <span>저장하면 자산 요약, 보유자산 구성, 보유 자산 목록이 함께 갱신됩니다.</span>
          </div>
          <div class="asset-settings-cards" aria-label="자산 설정 카드 목록">
            ${drafts
              .map((item, index) => {
                const amount = Math.round((Number(item.quantity) || 0) * (Number(item.currentPrice) || 0));
                const costBasis = Math.round((Number(item.quantity) || 0) * (Number(item.averagePrice) || 0));
                const profit = amount - costBasis;
                const rate = costBasis ? (profit / costBasis) * 100 : 0;
                const profitClass = profit >= 0 ? "text-red" : "text-blue";
                const displayName = String(item.name || "").trim() || "새 자산";
                const displayCode = String(item.code || "").trim() || "코드 미입력";

                return `
                  <article class="asset-settings-card" data-asset-setting-card="${item.id}">
                    <div class="asset-settings-card-head">
                      <span>${index + 1}</span>
                      <div>
                        <strong>${escapeChartText(displayName)}</strong>
                        <em>${escapeChartText(displayCode)}</em>
                      </div>
                      <button class="mini-action asset-settings-remove" type="button" data-asset-settings-remove="${item.id}" aria-label="자산 삭제">${icon("trash")}</button>
                    </div>
                    <div class="asset-settings-card-body">
                      <div class="field asset-settings-name-field">
                        <label for="assetSettingName${index}">종목명</label>
                        <input id="assetSettingName${index}" class="input" type="text" value="${escapeChartText(item.name)}" autocomplete="off" placeholder="예: 삼성전자" data-asset-setting-field="name" data-asset-setting-id="${item.id}">
                      </div>
                      <div class="field">
                        <label for="assetSettingCode${index}">종목코드</label>
                        <input id="assetSettingCode${index}" class="input" type="text" value="${escapeChartText(item.code)}" autocomplete="off" placeholder="005930" data-asset-setting-field="code" data-asset-setting-id="${item.id}">
                      </div>
                      <div class="field">
                        <label for="assetSettingQuantity${index}">수량</label>
                        <div class="journal-input-shell">
                          <input id="assetSettingQuantity${index}" type="text" value="${item.quantity ? formatMarketNumber(item.quantity) : ""}" inputmode="numeric" autocomplete="off" placeholder="수량" data-number-input data-asset-setting-field="quantity" data-asset-setting-id="${item.id}">
                          <span>주</span>
                        </div>
                      </div>
                      <div class="field">
                        <label for="assetSettingAverage${index}">매수평균가</label>
                        <div class="journal-input-shell">
                          <input id="assetSettingAverage${index}" type="text" value="${item.averagePrice ? formatMarketNumber(item.averagePrice) : ""}" inputmode="numeric" autocomplete="off" placeholder="평단" data-number-input data-asset-setting-field="averagePrice" data-asset-setting-id="${item.id}">
                          <span>원</span>
                        </div>
                      </div>
                      <div class="field">
                        <label for="assetSettingCurrent${index}">현재가</label>
                        <div class="journal-input-shell">
                          <input id="assetSettingCurrent${index}" type="text" value="${item.currentPrice ? formatMarketNumber(item.currentPrice) : ""}" inputmode="numeric" autocomplete="off" placeholder="현재가" data-number-input data-asset-setting-field="currentPrice" data-asset-setting-id="${item.id}">
                          <span>원</span>
                        </div>
                      </div>
                    </div>
                    <div class="asset-settings-preview">
                      <p><span>평가금액</span><strong>${formatMarketNumber(amount)}원</strong></p>
                      <p><span>평가손익</span><strong class="${profitClass}">${formatSignedMarketNumber(profit)}원</strong></p>
                      <p><span>수익률</span><strong class="${profitClass}">${formatSignedRate(rate)}</strong></p>
                    </div>
                  </article>
                `;
              })
              .join("")}
            ${
              canAdd
                ? `<button class="asset-settings-add-card ${drafts.length ? "" : "is-empty"}" type="button" data-asset-settings-add aria-label="자산 추가">
                    <span>${icon("plus")}</span>
                    ${drafts.length ? "<strong>자산 추가</strong><em>새 보유 자산을 카드로 추가합니다.</em>" : ""}
                  </button>`
                : ""
            }
          </div>
          <div class="asset-settings-footer">
            <span>${drafts.length}/12</span>
          </div>
          <p class="asset-settings-feedback error">${assetSettingsError}</p>
          <div class="asset-cash-actions">
            <button class="btn" type="button" data-modal-close>취소</button>
            <button class="btn primary" type="button" data-asset-settings-apply>저장</button>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderAssetSettingsCardView(item, index) {
  const meta = typeof getAssetHoldingMeta === "function" ? getAssetHoldingMeta(item, index) : { sector: "국내 주식" };
  const amount = Math.round((Number(item.quantity) || 0) * (Number(item.currentPrice) || 0));
  const displayCode = String(item.code || "").trim() || "코드 미입력";
  const codeMeta = displayCode === "코드 미입력" ? displayCode : `${displayCode} · ${meta.sector || "국내 주식"}`;
  const isEditing = assetSettingsEditingId === item.id;
  const readOnlyAttr = isEditing ? "" : `readonly aria-readonly="true" tabindex="-1"`;
  const categoryLabel = "국내 주식";

  return `
    <article class="asset-settings-card asset-settings-display-card ${isEditing ? "is-editing" : ""}" data-asset-setting-card="${item.id}">
      <button class="mini-action asset-settings-menu" type="button" data-asset-settings-menu="${item.id}" aria-label="자산 메뉴" aria-expanded="${assetSettingsOpenMenuId === item.id ? "true" : "false"}">${icon("more")}</button>
      ${
        assetSettingsOpenMenuId === item.id
          ? `<div class="asset-settings-floating-menu" role="menu">
              <button type="button" data-asset-settings-edit="${item.id}" role="menuitem">${icon("edit")}수정</button>
              <button type="button" data-asset-settings-remove="${item.id}" role="menuitem">${icon("trash")}삭제</button>
            </div>`
          : ""
      }
      <div class="asset-settings-chip-row">
        <span class="asset-settings-chip">ASSET ${String(index + 1).padStart(2, "0")}</span>
        <span class="asset-settings-sector-chip domestic">${categoryLabel}</span>
      </div>
      <div class="asset-settings-title-wrap">
        <input class="asset-settings-title-input" type="text" value="${escapeChartText(item.name)}" autocomplete="off" placeholder="새 자산" data-asset-setting-field="name" data-asset-setting-id="${item.id}" ${readOnlyAttr}>
        <p>${escapeChartText(codeMeta)}</p>
      </div>

      <div class="asset-settings-tile-grid">
        <label class="asset-settings-tile">
          <span>보유 수량</span>
          <div class="asset-settings-tile-input">
            <input type="text" value="${item.quantity ? formatMarketNumber(item.quantity) : ""}" inputmode="numeric" autocomplete="off" placeholder="0" data-number-input data-asset-setting-field="quantity" data-asset-setting-id="${item.id}" ${readOnlyAttr}>
            <em>주</em>
          </div>
        </label>
        <label class="asset-settings-tile">
          <span>매수평균가</span>
          <div class="asset-settings-tile-input">
            <input type="text" value="${item.averagePrice ? formatMarketNumber(item.averagePrice) : ""}" inputmode="numeric" autocomplete="off" placeholder="0" data-number-input data-asset-setting-field="averagePrice" data-asset-setting-id="${item.id}" ${readOnlyAttr}>
            <em>원</em>
          </div>
        </label>
      </div>

      <div class="asset-settings-value-panel">
        <div>
          <span>평가금액</span>
          <strong>${formatMarketNumber(amount)}<small>원</small></strong>
          <em>보유 수량 기준</em>
        </div>
      </div>
      <div class="asset-settings-card-actions ${isEditing ? "" : "is-placeholder"}" ${isEditing ? "" : `aria-hidden="true"`}>
        <button class="btn" type="button" data-asset-settings-cancel>취소</button>
        <button class="btn primary" type="button" data-asset-settings-apply>변경사항 저장</button>
      </div>
      ${isEditing ? `<p class="asset-settings-feedback error">${assetSettingsError}</p>` : ""}
    </article>
  `;
}

function renderAssetSettingsModalCardView() {
  const drafts = assetSettingsDrafts;
  const canAdd = drafts.length < 12;
  const tabs = [
    ["모든 자산", drafts.length, true, ""],
    ["국내 주식", "", false, ""],
    ["최근 수정", "", false, ""],
    ["즐겨찾기", "", false, "asset-settings-tab-favorite"]
  ];

  return `
    <div class="modal-backdrop asset-settings-backdrop">
      <section class="modal-panel asset-settings-modal" role="dialog" aria-modal="true" aria-labelledby="assetSettingsModalTitle">
        <div class="modal-header asset-settings-header">
          <button class="asset-settings-nav-button asset-settings-back" type="button" data-modal-close aria-label="뒤로">${icon("chevronLeft")}</button>
          <div class="asset-settings-heading">
            <p class="eyebrow">Asset Settings</p>
            <h2 class="modal-title" id="assetSettingsModalTitle">자산 설정</h2>
          </div>
          <div class="asset-settings-header-actions">
            <button class="btn ghost asset-settings-header-add" type="button" data-asset-settings-add ${canAdd ? "" : "disabled"}>${icon("plus")}자산 추가</button>
            <button class="asset-settings-nav-button" type="button" data-modal-close aria-label="닫기">X</button>
          </div>
        </div>

        <div class="modal-body asset-settings-body">
          <div class="asset-settings-hero-row">
            <div class="asset-settings-hero-copy">
              <h3><span>보유 자산.</span> <b class="asset-settings-desktop-copy">필요한 정보만 한눈에.</b><b class="asset-settings-mobile-copy">한눈에 확인하세요.</b></h3>
              <p>큰 그래픽을 덜어내고 평가금액과 핵심 입력값 중심으로 재구성했습니다.</p>
            </div>
            <div class="asset-settings-tabs" role="tablist" aria-label="자산 설정 보기">
              ${tabs.map(([label, count, active, className]) => `
                <button class="${active ? "active" : ""} ${className}" type="button" role="tab" aria-selected="${active}">
                  ${label}${count !== "" ? `<span>${count}</span>` : ""}
                </button>
              `).join("")}
            </div>
          </div>

          <div class="asset-settings-cards" aria-label="자산 설정 카드 목록">
            ${drafts.map((item, index) => renderAssetSettingsCardView(item, index)).join("")}
            ${
              canAdd
                ? `<button class="asset-settings-add-card ${drafts.length ? "" : "is-empty"}" type="button" data-asset-settings-add aria-label="자산 추가">
                    <span>${icon("plus")}</span>
                    ${drafts.length ? "<strong>자산 추가</strong><em>새 보유 자산을 카드로 추가합니다.</em>" : ""}
                  </button>`
                : ""
            }
          </div>
          <div class="asset-settings-slide-dots" aria-hidden="true">
            ${drafts.map((_, index) => `<span class="${index === 0 ? "active" : ""}"></span>`).join("")}
          </div>
        </div>
      </section>
    </div>
  `;
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
  const modeClass = isWithdraw ? "withdraw" : "deposit";
  const question = `<strong>${formatKRW(assetCashPendingAmount)}</strong>을 <span>${actionLabel}</span>하시겠습니까?`;
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
          <div class="asset-cash-confirm-card ${modeClass}">
            <span>${icon(isWithdraw ? "minus" : "plus")}</span>
            <div>
              <p>${actionLabel}금액</p>
              <strong>${formatKRW(assetCashPendingAmount)}</strong>
              <em>처리 후 현금 자산 ${formatKRW(nextCashBalance)}</em>
            </div>
          </div>
          <p class="asset-cash-confirm-question ${modeClass}">${question}</p>
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
  if (modalName === "assetTrendTargets") cancelAssetTrendTargetEdit();
  if (modalName === "assetSettings") cancelAssetSettingsEdit();
}

function getRoute() {
  const route = window.location.hash.replace("#", "");
  if (!route) return "landing";
  return renderers[route] ? route : "dashboard";
}

function renderModal() {
  const modalRoot = document.querySelector("#modalRoot");
  if (!modalRoot) return;

  if (!["journalWrite", "assetCash", "assetCashConfirm", "assetTrendTargets", "assetSettings", "journalDateRange", "journalStockFilter", "journalTradeTypeFilter"].includes(activeModal)) {
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

  if (activeModal === "assetTrendTargets") {
    modalRoot.innerHTML = renderAssetTrendTargetsModal();
    return;
  }

  if (activeModal === "assetSettings") {
    modalRoot.innerHTML = renderAssetSettingsModalCardView();
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
        <button class="mobile-logout" type="button" data-route="landing">${icon("logout")}로그아웃</button>
      </section>
    </div>
  `;
}

function render() {
  const route = getRoute();
  const meta = pageMeta[route] || { title: "Trading Note", description: "" };
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
  if (route === "landing" && typeof setupLandingReveal === "function") {
    setupLandingReveal();
  }
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
    if (activeModal === "assetTrendTargets") {
      beginAssetTrendTargetEdit();
    }
    if (activeModal === "assetSettings") {
      beginAssetSettingsEdit();
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

    const assetTargetAdd = event.target.closest("[data-asset-target-add]");
    if (assetTargetAdd && activeModal === "assetTrendTargets") {
      addAssetTrendTargetDraft();
      renderModal();
      hydrateIcons(document);
      return;
    }

    const assetTargetRemove = event.target.closest("[data-asset-target-remove]");
    if (assetTargetRemove && activeModal === "assetTrendTargets") {
      removeAssetTrendTargetDraft(assetTargetRemove.dataset.assetTargetRemove);
      renderModal();
      hydrateIcons(document);
      return;
    }

    const assetTargetApply = event.target.closest("[data-asset-target-apply]");
    if (assetTargetApply && activeModal === "assetTrendTargets") {
      applyAssetTrendTargetEdit();
      activeModal = null;
      render();
      return;
    }

    const assetSettingsAdd = event.target.closest("[data-asset-settings-add]");
    if (assetSettingsAdd && activeModal === "assetSettings") {
      addAssetSettingsDraft();
      renderModal();
      hydrateIcons(document);
      return;
    }

    const assetSettingsMenu = event.target.closest("[data-asset-settings-menu]");
    if (assetSettingsMenu && activeModal === "assetSettings") {
      const menuId = assetSettingsMenu.dataset.assetSettingsMenu;
      assetSettingsOpenMenuId = assetSettingsOpenMenuId === menuId ? null : menuId;
      renderModal();
      hydrateIcons(document);
      return;
    }

    const assetSettingsRemove = event.target.closest("[data-asset-settings-remove]");
    if (assetSettingsRemove && activeModal === "assetSettings") {
      removeAssetSettingsDraft(assetSettingsRemove.dataset.assetSettingsRemove);
      renderModal();
      hydrateIcons(document);
      return;
    }

    const assetSettingsEdit = event.target.closest("[data-asset-settings-edit]");
    if (assetSettingsEdit && activeModal === "assetSettings") {
      assetSettingsEditingId = assetSettingsEdit.dataset.assetSettingsEdit;
      assetSettingsOpenMenuId = null;
      renderModal();
      hydrateIcons(document);
      const card = document.querySelector(`[data-asset-setting-card="${assetSettingsEdit.dataset.assetSettingsEdit}"]`);
      const input = card?.querySelector("[data-asset-setting-field]");
      input?.focus();
      return;
    }

    const assetSettingsCancel = event.target.closest("[data-asset-settings-cancel]");
    if (assetSettingsCancel && activeModal === "assetSettings") {
      beginAssetSettingsEdit();
      renderModal();
      hydrateIcons(document);
      return;
    }

    const assetSettingsApply = event.target.closest("[data-asset-settings-apply]");
    if (assetSettingsApply && activeModal === "assetSettings") {
      if (!applyAssetSettingsEdit()) {
        renderModal();
        hydrateIcons(document);
        return;
      }
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

  const landingScrollButton = event.target.closest("[data-landing-scroll]");
  if (landingScrollButton && getRoute() === "landing") {
    const target = document.getElementById(landingScrollButton.dataset.landingScroll);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const journalDeleteButton = event.target.closest("[data-journal-delete-selected]");
  if (journalDeleteButton && getRoute() === "journal") {
    journalSelectedTradeIds.forEach((id) => journalDeletedTradeIds.add(id));
    journalSelectedTradeIds.clear();
    render();
    return;
  }

  const routeButton = event.target.closest("button[data-route], a[data-route]");
  if (routeButton) {
    const route = routeButton.dataset.route;
    if (renderers[route]) {
      const currentRoute = getRoute();
      activeModal = null;
      mobileSheetOpen = false;
      window.location.hash = route;
      if (currentRoute === route) {
        render();
        scrollPageToTop();
      }
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

  const assetTargetVisible = event.target.closest("[data-asset-target-visible]");
  if (assetTargetVisible && activeModal === "assetTrendTargets") {
    updateAssetTrendTargetDraft(assetTargetVisible.dataset.assetTargetId, { visible: assetTargetVisible.checked });
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

  const assetTargetAmount = event.target.closest("[data-asset-target-amount]");
  if (assetTargetAmount && activeModal === "assetTrendTargets") {
    updateAssetTrendTargetDraft(assetTargetAmount.dataset.assetTargetId, { amount: parseKRWInput(assetTargetAmount.value) });
    return;
  }

  const assetTargetLabel = event.target.closest("[data-asset-target-label]");
  if (assetTargetLabel && activeModal === "assetTrendTargets") {
    updateAssetTrendTargetDraft(assetTargetLabel.dataset.assetTargetId, { label: assetTargetLabel.value });
    return;
  }

  const assetSettingField = event.target.closest("[data-asset-setting-field]");
  if (assetSettingField && activeModal === "assetSettings") {
    updateAssetSettingsDraft(
      assetSettingField.dataset.assetSettingId,
      assetSettingField.dataset.assetSettingField,
      assetSettingField.value
    );
    return;
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
  if (pinnedChartTooltipTarget) return;
  showChartTooltip(target, event);
});

document.addEventListener("pointermove", (event) => {
  const target = event.target.closest("[data-chart-tooltip]");
  if (!target) return;
  if (pinnedChartTooltipTarget) return;
  positionChartTooltip(event);
});

document.addEventListener("pointerout", (event) => {
  const target = event.target.closest("[data-chart-tooltip]");
  if (!target) return;
  if (pinnedChartTooltipTarget) return;
  const relatedTarget = event.relatedTarget && event.relatedTarget.closest ? event.relatedTarget.closest("[data-chart-tooltip]") : null;
  if (relatedTarget === target) return;
  hideChartTooltip();
});

document.addEventListener("pointerup", (event) => {
  const target = event.target.closest("[data-chart-tooltip]");
  if (!target || !isTouchChartTooltipMode()) return;

  chartTooltipPointerTapTarget = target;
  event.preventDefault();
  togglePinnedChartTooltip(target, event);
});

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-chart-tooltip]");
  if (target && isTouchChartTooltipMode()) {
    if (chartTooltipPointerTapTarget === target) {
      chartTooltipPointerTapTarget = null;
      return;
    }
    togglePinnedChartTooltip(target, event);
    return;
  }

  chartTooltipPointerTapTarget = null;
  if (pinnedChartTooltipTarget) hideChartTooltip();
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
  hideChartTooltip();
  render();
  scrollPageToTop();
});
document.addEventListener("scroll", schedulePinnedChartTooltipPosition, { capture: true, passive: true });
window.addEventListener("resize", () => {
  scheduleFitValueText();
  schedulePinnedChartTooltipPosition();
});
render();
