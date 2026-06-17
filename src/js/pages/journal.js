var journalSelectedTradeIds = new Set();
var journalDeletedTradeIds = new Set();
var journalDateRange = getDefaultJournalDateRange();
var journalDateRangeDraft = null;
var journalDateRangePreset = "month";
var journalDateRangePresetDraft = "month";
var journalStockFilter = "all";
var journalStockFilterDraft = "all";
var journalStockSearch = "";
var journalTradeTypeFilter = "all";
var journalTradeTypeFilterDraft = "all";

const journalDatePresets = [
  ["day", "1일"],
  ["week", "1주"],
  ["month", "1달"],
  ["sixMonths", "6달"],
  ["year", "1년"],
  ["custom", "기간별"]
];

const journalStockAliases = {
  네이버: ["네이버", "NAVER"],
  NAVER: ["NAVER", "네이버"]
};

function formatJournalDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDefaultJournalDateRange() {
  return getJournalDatePresetRange("month");
}

function formatJournalDisplayDate(value) {
  return String(value || "").replace(/-/g, ".");
}

function getJournalDateRangeLabel(range = journalDateRange) {
  return `${formatJournalDisplayDate(range.start)} ~ ${formatJournalDisplayDate(range.end)}`;
}

function getJournalDateRangeDraft() {
  return journalDateRangeDraft || journalDateRange;
}

function getJournalDatePresetRange(preset) {
  const end = new Date();
  const start = new Date(end);

  if (preset === "day") {
    return {
      start: formatJournalDateInput(start),
      end: formatJournalDateInput(end)
    };
  }

  if (preset === "week") start.setDate(start.getDate() - 7);
  if (preset === "month") start.setMonth(start.getMonth() - 1);
  if (preset === "sixMonths") start.setMonth(start.getMonth() - 6);
  if (preset === "year") start.setFullYear(start.getFullYear() - 1);

  return {
    start: formatJournalDateInput(start),
    end: formatJournalDateInput(end)
  };
}

function beginJournalDateRangeEdit() {
  journalDateRangeDraft = { ...journalDateRange };
  journalDateRangePresetDraft = journalDateRangePreset;
}

function setJournalDateRangeDraft(field, value) {
  if (!journalDateRangeDraft) beginJournalDateRangeEdit();
  journalDateRangeDraft[field] = value;
  journalDateRangePresetDraft = "custom";
}

function setJournalDateRangePresetDraft(preset) {
  if (!journalDateRangeDraft) beginJournalDateRangeEdit();
  journalDateRangePresetDraft = preset;
  if (preset !== "custom") {
    journalDateRangeDraft = getJournalDatePresetRange(preset);
  }
}

function cancelJournalDateRangeEdit() {
  journalDateRangeDraft = null;
  journalDateRangePresetDraft = journalDateRangePreset;
}

function applyJournalDateRangeEdit() {
  if (!journalDateRangeDraft) return;
  const nextRange = { ...journalDateRangeDraft };
  if (nextRange.start && nextRange.end && nextRange.start > nextRange.end) {
    [nextRange.start, nextRange.end] = [nextRange.end, nextRange.start];
  }
  journalDateRange = nextRange;
  journalDateRangePreset = journalDateRangePresetDraft;
  journalDateRangeDraft = null;
}

function normalizeJournalText(value) {
  return String(value || "").replace(/\s/g, "").toLowerCase();
}

function getJournalStockAliases(stock) {
  return journalStockAliases[stock] || [stock];
}

function getJournalStockOptions() {
  const rows = typeof getHoldingRows === "function" ? getHoldingRows() : holdings;

  return rows.map(([name, quantity, value, profit, rate]) => {
    const aliases = getJournalStockAliases(name).map(normalizeJournalText);
    const matchedWatch = watchList.find(([watchName]) => aliases.includes(normalizeJournalText(watchName)));
    return {
      name,
      code: matchedWatch ? matchedWatch[1] : "",
      quantity,
      value,
      profit,
      rate
    };
  });
}

function getJournalStockFilterLabel() {
  return journalStockFilter === "all" ? "전체" : journalStockFilter;
}

function getJournalTradeTypeFilterLabel(value = journalTradeTypeFilter) {
  return value === "all" ? "전체" : value;
}

function beginJournalStockFilterEdit() {
  journalStockFilterDraft = journalStockFilter;
  journalStockSearch = "";
}

function setJournalStockFilterDraft(stock) {
  journalStockFilterDraft = stock || "all";
}

function cancelJournalStockFilterEdit() {
  journalStockFilterDraft = journalStockFilter;
  journalStockSearch = "";
}

function applyJournalStockFilterEdit() {
  journalStockFilter = journalStockFilterDraft || "all";
  journalStockSearch = "";
}

function beginJournalTradeTypeFilterEdit() {
  journalTradeTypeFilterDraft = journalTradeTypeFilter;
}

function setJournalTradeTypeFilterDraft(type) {
  journalTradeTypeFilterDraft = type || "all";
}

function cancelJournalTradeTypeFilterEdit() {
  journalTradeTypeFilterDraft = journalTradeTypeFilter;
}

function applyJournalTradeTypeFilterEdit() {
  journalTradeTypeFilter = journalTradeTypeFilterDraft || "all";
}

function journalStockMatchesFilter(stock) {
  if (journalStockFilter === "all") return true;
  const aliases = getJournalStockAliases(journalStockFilter).map(normalizeJournalText);
  return aliases.includes(normalizeJournalText(stock));
}

function journalTradeTypeMatchesFilter(type) {
  return journalTradeTypeFilter === "all" || type === journalTradeTypeFilter;
}

function updateJournalStockSearchView(value) {
  journalStockSearch = value;
  const query = normalizeJournalText(value);
  let visibleCount = 0;

  document.querySelectorAll("[data-journal-stock-option][data-search-text]").forEach((button) => {
    const visible = !query || button.dataset.searchText.includes(query);
    button.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  const empty = document.querySelector("[data-journal-stock-empty]");
  if (empty) empty.hidden = visibleCount > 0;
}

function renderJournalStockFilterModal() {
  const stockOptions = getJournalStockOptions();
  const query = normalizeJournalText(journalStockSearch);
  const visibleOptions = stockOptions.filter(({ name, code }) => {
    const searchText = normalizeJournalText(`${name} ${code}`);
    return !query || searchText.includes(query);
  });

  return `
    <div class="modal-backdrop">
      <section class="modal-panel journal-filter-modal" role="dialog" aria-modal="true" aria-labelledby="journalStockModalTitle">
        <div class="modal-header">
          <div>
            <p class="eyebrow">Holdings</p>
            <h2 class="modal-title" id="journalStockModalTitle">종목 선택</h2>
          </div>
          <button class="icon-button" type="button" data-modal-close aria-label="닫기">X</button>
        </div>
        <div class="modal-body">
          <div class="journal-choice-search">
            <input class="input" type="search" value="${journalStockSearch}" placeholder="보유 종목 검색" data-journal-stock-search autofocus>
            <span>${icon("search")}</span>
          </div>
          <div class="journal-option-list">
            <button class="journal-option journal-option-neutral ${journalStockFilterDraft === "all" ? "active" : ""}" type="button" data-journal-stock-option="all">
              <span class="journal-option-icon">${icon("journal")}</span>
              <span><strong>전체 종목</strong><em>모든 매매 기록을 봅니다.</em></span>
              <b>${journalStockFilterDraft === "all" ? "선택됨" : ""}</b>
            </button>
            ${visibleOptions
              .map(({ name, code, quantity, value, profit, rate }) => {
                const active = journalStockFilterDraft === name;
                const profitClass = profit.startsWith("+") ? "text-red" : profit.startsWith("-") ? "text-blue" : "";
                return `
                  <button class="journal-option journal-option-stock ${active ? "active" : ""}" type="button" data-journal-stock-option="${name}" data-search-text="${normalizeJournalText(`${name} ${code}`)}">
                    <span class="journal-option-icon">${icon("chart")}</span>
                    <span>
                      <strong>${name}</strong>
                      <em>${code ? `${code} · ` : ""}${quantity}주 · ${value}원</em>
                    </span>
                    <b class="${profitClass}">${active ? "선택됨" : rate}</b>
                  </button>
                `;
              })
              .join("")}
            <p class="journal-empty-option" data-journal-stock-empty ${visibleOptions.length ? "hidden" : ""}>검색 결과가 없습니다.</p>
          </div>
          <div class="journal-date-actions">
            <button class="btn" type="button" data-modal-close>취소</button>
            <button class="btn primary" type="button" data-journal-stock-apply>확인</button>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderJournalTradeTypeFilterModal() {
  const options = [
    ["all", "전체", "매수와 매도를 모두 봅니다.", "swap", "journal-option-neutral"],
    ["매수", "매수", "매수 기록만 봅니다.", "plus", "journal-option-buy"],
    ["매도", "매도", "매도 기록만 봅니다.", "download", "journal-option-sell"]
  ];

  return `
    <div class="modal-backdrop">
      <section class="modal-panel journal-filter-modal journal-type-modal" role="dialog" aria-modal="true" aria-labelledby="journalTypeModalTitle">
        <div class="modal-header">
          <div>
            <p class="eyebrow">Trade Type</p>
            <h2 class="modal-title" id="journalTypeModalTitle">매수/매도 선택</h2>
          </div>
          <button class="icon-button" type="button" data-modal-close aria-label="닫기">X</button>
        </div>
        <div class="modal-body">
          <div class="journal-option-list">
            ${options
              .map(([value, label, description, iconName, toneClass]) => {
                const active = journalTradeTypeFilterDraft === value;
                return `
                  <button class="journal-option ${toneClass} ${active ? "active" : ""}" type="button" data-journal-type-filter-option="${value}">
                    <span class="journal-option-icon">${icon(iconName)}</span>
                    <span><strong>${label}</strong><em>${description}</em></span>
                    <b>${active ? "선택됨" : ""}</b>
                  </button>
                `;
              })
              .join("")}
          </div>
          <div class="journal-date-actions">
            <button class="btn" type="button" data-modal-close>취소</button>
            <button class="btn primary" type="button" data-journal-type-apply>확인</button>
          </div>
        </div>
      </section>
    </div>
  `;
}

function journalTradeId(index) {
  return `trade-${index}`;
}

function getJournalTrades() {
  return trades
    .map((trade, index) => ({ trade, id: journalTradeId(index) }))
    .filter(({ trade, id }) => !journalDeletedTradeIds.has(id) && journalStockMatchesFilter(trade[1]) && journalTradeTypeMatchesFilter(trade[2]));
}

function renderSelectableJournalRows(limit) {
  return getJournalTrades()
    .slice(0, limit)
    .map(({ trade, id }) => {
      const [date, stock, type, qty, buy, sell, profit, rate, , memo] = trade;
      const isSell = type === "매도";
      const profitClass = profit.startsWith("+") ? "text-red" : profit.startsWith("-") ? "text-blue" : "";
      const checked = journalSelectedTradeIds.has(id) ? "checked" : "";

      return [
        `<label class="row-check" aria-label="${stock} 거래 선택"><input type="checkbox" data-journal-select="${id}" ${checked}><span></span></label>`,
        date,
        stock,
        `<span class="trade-type ${isSell ? "sell" : "buy"}">${type}</span>`,
        qty,
        buy,
        sell,
        `<span class="${profitClass}">${profit}</span>`,
        `<span class="${profitClass}">${rate}</span>`,
        memo,
        `<button class="menu-dots" type="button" aria-label="더보기">${icon("more")}</button>`
      ];
    });
}

function renderMobileJournalFilters() {
  return `
    <section class="mobile-filter-card">
      <button type="button" data-modal="journalDateRange"><span>${icon("calendar")}</span><strong>기간</strong><em>${getJournalDateRangeLabel()}</em>${icon("chevronRight")}</button>
      <button type="button" data-modal="journalStockFilter"><span>${icon("journal")}</span><strong>종목</strong><em>${getJournalStockFilterLabel()}</em>${icon("chevronRight")}</button>
      <button type="button" data-modal="journalTradeTypeFilter"><span>${icon("swap")}</span><strong>매수/매도</strong><em>${getJournalTradeTypeFilterLabel()}</em>${icon("chevronRight")}</button>
    </section>
  `;
}

function renderMobileJournalCards(limit) {
  const weekdays = {
    "06/20": "목",
    "06/19": "수",
    "06/18": "화",
    "06/17": "월",
    "06/14": "금",
    "06/13": "목",
    "06/12": "수",
    "06/11": "화",
    "06/10": "월",
    "06/07": "금",
    "06/05": "수",
    "06/04": "화"
  };
  const visibleTrades = getJournalTrades().slice(0, limit);

  if (!visibleTrades.length) {
    return `
      <section class="mobile-trade-list">
        <article class="mobile-empty-state">
          <strong>조건에 맞는 기록이 없습니다.</strong>
          <p>종목이나 매수/매도 필터를 변경해보세요.</p>
        </article>
      </section>
    `;
  }

  return `
    <section class="mobile-trade-list">
      ${visibleTrades
        .map(({ trade }) => {
          const [date, stock, type, qty, buy, sell, profit, rate] = trade;
          const isSell = type === "매도";
          const resultLabel = profit === "-" ? "손익" : rate !== "-" && profit.startsWith("+") ? "손익" : "수익률";
          const result = profit === "-" ? "-" : rate !== "-" ? `${profit}<br>${rate}` : profit;
          const resultClass = profit.startsWith("+") ? "text-red" : profit.startsWith("-") ? "text-blue" : "";
          return `
            <article class="mobile-trade-card">
              <div>
                <p>2024.${date.replace("/", ".")} (${weekdays[date] || "목"})</p>
                <strong>${stock}</strong>
              </div>
              <span class="trade-type ${isSell ? "sell" : "buy"}">${type}</span>
              <div class="mobile-trade-price">
                <strong>${sell !== "-" ? sell : buy}원</strong>
                <span>${qty}주</span>
              </div>
              <div class="mobile-trade-result">
                <span>${resultLabel}</span>
                <strong class="${resultClass}">${result}</strong>
              </div>
              <button class="menu-dots" type="button" aria-label="상세 보기">${icon("chevronRight")}</button>
            </article>
          `;
        })
        .join("")}
    </section>
  `;
}

function renderJournal() {
  const visibleTradeLimit = 20;
  const journalTradeCount = getJournalTrades().length;
  const selectedCount = journalSelectedTradeIds.size;
  const journalPageCount = Math.max(1, Math.ceil(journalTradeCount / visibleTradeLimit));
  const journalRows = renderSelectableJournalRows(visibleTradeLimit);

  return `
    <div class="stack">
      <section class="toolbar journal-filter-toolbar desktop-journal-filter">
        <div class="field">
          <label>기간</label>
          <button class="date-range-trigger" type="button" data-modal="journalDateRange">
            <span>${getJournalDateRangeLabel()}</span>
            ${icon("calendar")}
          </button>
        </div>
        <div class="field">
          <label>종목</label>
          <button class="date-range-trigger" type="button" data-modal="journalStockFilter">
            <span>${getJournalStockFilterLabel()}</span>
            ${icon("chevronRight")}
          </button>
        </div>
        <div class="field">
          <label>매수/매도</label>
          <button class="date-range-trigger" type="button" data-modal="journalTradeTypeFilter">
            <span>${getJournalTradeTypeFilterLabel()}</span>
            ${icon("chevronRight")}
          </button>
        </div>
        <button class="btn primary journal-search-button" type="button">${icon("search")}검색</button>
      </section>

      ${renderMobileJournalFilters()}
      ${renderMobileJournalCards(6)}

      <section class="journal-layout desktop-journal-list">
        <article class="panel">
          <div class="panel-header">
            <h2 class="panel-title">매매 기록 목록 <small>총 ${journalTradeCount}건</small></h2>
            ${
              selectedCount
                ? `<button class="btn danger table-action" type="button" data-journal-delete-selected>${icon("trash")}선택 삭제 <span>${selectedCount}</span></button>`
                : ""
            }
          </div>
          <div class="journal-trade-table">
            ${renderTable(["", "일자", "종목명", "구분", "수량", "매수가", "매도가", "손익", "수익률", "메모", ""], journalRows)}
          </div>
          <div class="pagination">
            <span class="page-dot">${icon("chevronLeft")}</span>
            ${Array.from({ length: journalPageCount }, (_, index) => `<span class="page-dot ${index === 0 ? "active" : ""}">${index + 1}</span>`).join("")}
            <span class="page-dot">${icon("chevronRight")}</span>
          </div>
        </article>
      </section>
    </div>
  `;
}
