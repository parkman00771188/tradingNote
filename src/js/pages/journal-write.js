function journalWriteField(label, control) {
  return `
    <div class="journal-entry-row">
      <label>${label}</label>
      <div>${control}</div>
    </div>
  `;
}

const journalDefaultHolding = {
  stock: "삼성전자",
  quantity: 10,
  amount: 785000,
  currentPrice: 77300
};

const journalWriteStockAliases = {
  NAVER: ["네이버"]
};

var journalStockSearchState = {
  query: "",
  loading: false,
  results: [],
  error: "",
  requestId: 0
};
var journalStockSearchTimer = 0;

function normalizeJournalCurrentPriceText(value) {
  return String(value || "").replace(/\s+/g, "").toLowerCase();
}

function getJournalStockCandidates(name, code = "") {
  return [name, code, ...(journalWriteStockAliases[name] || [])].filter(Boolean);
}

function journalStockMatchesQuery(stock, query) {
  const normalizedQuery = normalizeJournalCurrentPriceText(query);
  if (!normalizedQuery) return false;

  return getJournalStockCandidates(stock.name, stock.code).some((candidate) => {
    const normalizedCandidate = normalizeJournalCurrentPriceText(candidate);
    return normalizedCandidate === normalizedQuery || normalizedCandidate.includes(normalizedQuery);
  });
}

function findJournalHolding(name, code = "") {
  if (typeof getHoldingData === "function") {
    const holding = getHoldingData().find((item) => {
      if (typeof stockMatches === "function") return stockMatches(item.name, item.code, name, code);
      return normalizeJournalCurrentPriceText(item.name) === normalizeJournalCurrentPriceText(name);
    });

    if (!holding) return null;
    return {
      name: holding.name,
      quantity: holding.quantity,
      amount: holding.amount
    };
  }

  if (typeof holdings === "undefined" || !Array.isArray(holdings)) return null;
  const queryCandidates = getJournalStockCandidates(name, code).map(normalizeJournalCurrentPriceText);
  const row = holdings.find(([holdingName]) => {
    const candidates = getJournalStockCandidates(holdingName).map(normalizeJournalCurrentPriceText);
    return candidates.some((candidate) => queryCandidates.includes(candidate));
  });

  if (!row) return null;
  return {
    name: row[0],
    quantity: parseKRWInput(row[1]),
    amount: parseKRWInput(row[2])
  };
}

function findJournalWatchStock(name, code = "") {
  if (typeof getWatchStock === "function") {
    const match = getWatchStock(name, code);
    if (match) {
      const holding = findJournalHolding(match.name, match.code);
      return {
        name: match.name,
        code: match.code,
        price: match.price,
        holdingQuantity: holding ? holding.quantity : 0,
        holdingAmount: holding ? holding.amount : 0
      };
    }
  }

  const queries = getJournalStockCandidates(name, code).map(normalizeJournalCurrentPriceText);

  if (typeof watchList !== "undefined" && Array.isArray(watchList)) {
    const match = watchList.find(([watchName, watchCode]) => {
      const candidates = getJournalStockCandidates(watchName, watchCode).map(normalizeJournalCurrentPriceText);
      return candidates.some((candidate) => queries.includes(candidate));
    });
    if (match) {
      const holding = findJournalHolding(match[0], match[1]);
      return {
        name: match[0],
        code: match[1],
        price: parseKRWInput(match[2]),
        holdingQuantity: holding ? holding.quantity : 0,
        holdingAmount: holding ? holding.amount : 0
      };
    }
  }

  return null;
}

function normalizeJournalStockItem(item = {}) {
  const stock = typeof normalizeStockAnalysisItem === "function"
    ? normalizeStockAnalysisItem(item)
    : item;
  const priceMeta = typeof getStockAnalysisPriceMeta === "function"
    ? getStockAnalysisPriceMeta(stock)
    : { value: Number(stock.currentPriceKrw || stock.currentPrice || stock.price) || 0 };
  const holding = findJournalHolding(stock.name, stock.code || stock.symbol || "");

  return {
    name: stock.name || stock.symbol || stock.code || "",
    code: stock.code || stock.symbol || "",
    symbol: stock.symbol || stock.code || "",
    price: Number(priceMeta.value || stock.currentPriceKrw || stock.currentPrice || stock.price) || 0,
    currentPrice: Number(stock.currentPrice || stock.price) || 0,
    currentPriceKrw: Number(stock.currentPriceKrw || priceMeta.value || stock.price) || 0,
    currency: stock.currency || priceMeta.currency || "KRW",
    market: stock.market || "",
    exchange: stock.exchange || "",
    type: stock.type || "",
    quoteType: stock.quoteType || "",
    source: stock.source || "",
    holdingQuantity: holding ? holding.quantity : Number(stock.holdingQuantity) || 0,
    holdingAmount: holding ? holding.amount : Number(stock.holdingAmount) || 0
  };
}

function journalMarketResultToStock(result = {}) {
  const item = typeof stockMarketResultToItem === "function"
    ? stockMarketResultToItem(result, {})
    : result;
  return normalizeJournalStockItem(item);
}

function getJournalFavoriteStocks() {
  if (typeof stockFavoriteItems === "undefined" || !Array.isArray(stockFavoriteItems)) return [];
  return stockFavoriteItems
    .map((item) => normalizeJournalStockItem(item))
    .filter((item) => item.name || item.code);
}

function getJournalStockByQuery(query, mode = "buy") {
  const universe = getJournalStockOptionsForMode(mode);
  return universe.find((stock) => journalStockMatchesQuery(stock, query)) || null;
}

function getJournalStockOptionsForMode(mode = "buy") {
  if (mode === "sell" && typeof getHoldingData === "function") {
    return getHoldingData().map((holding) => ({
      name: holding.name,
      code: holding.code,
      price: holding.currentPrice,
      holdingQuantity: holding.quantity,
      holdingAmount: holding.amount
    }));
  }

  if (mode === "sell" && typeof holdings !== "undefined" && Array.isArray(holdings)) {
    return holdings.map(([name, quantity, amount]) => {
      const watch = findJournalWatchStock(name);
      return {
        name,
        code: watch ? watch.code : "",
        price: watch ? watch.price : Math.round(parseKRWInput(amount) / Math.max(1, parseKRWInput(quantity))),
        holdingQuantity: parseKRWInput(quantity),
        holdingAmount: parseKRWInput(amount)
      };
    });
  }

  const favorites = getJournalFavoriteStocks();
  if (favorites.length) return favorites;

  if (typeof watchList !== "undefined" && Array.isArray(watchList)) {
    return watchList.map(([name, code, price]) => {
      const holding = findJournalHolding(name, code);
      return {
        name,
        code,
        price: parseKRWInput(price),
        holdingQuantity: holding ? holding.quantity : 0,
        holdingAmount: holding ? holding.amount : 0
      };
    });
  }

  return [];
}

function resetJournalStockSearchState() {
  if (journalStockSearchTimer) window.clearTimeout(journalStockSearchTimer);
  journalStockSearchTimer = 0;
  journalStockSearchState = {
    query: "",
    loading: false,
    results: [],
    error: "",
    requestId: journalStockSearchState.requestId + 1
  };
}

function formatJournalStockSearchPrice(stock = {}) {
  if (typeof getStockAnalysisPriceMeta === "function") {
    return getStockAnalysisPriceMeta(stock).text;
  }
  return stock.price ? formatKRW(stock.price) : "-";
}

function renderJournalStockSearchPanel() {
  const query = String(journalStockSearchState.query || "").trim();
  if (!query || query.length < 2) return "";

  if (journalStockSearchState.loading) {
    return `<div class="asset-market-search-state">종목을 검색하고 있습니다.</div>`;
  }

  if (journalStockSearchState.error) {
    return `<div class="asset-market-search-state error">${escapeChartText(journalStockSearchState.error)}</div>`;
  }

  if (!journalStockSearchState.results.length) {
    return `<div class="asset-market-search-state">검색 결과가 없습니다. 종목명이나 코드를 입력해보세요.</div>`;
  }

  return `
    <div class="asset-market-search-results stock-search-results" role="listbox" aria-label="매매일지 종목 검색 결과">
      ${journalStockSearchState.results.map((result, index) => {
        const stock = normalizeJournalStockItem(result);
        const marketText = [
          stock.symbol || stock.code,
          typeof getStockMarketLabel === "function" ? getStockMarketLabel(stock) : stock.market,
          stock.exchange || stock.source
        ].filter(Boolean).join(" · ");
        const avatar = typeof renderStockAvatar === "function"
          ? renderStockAvatar(stock, "stock-search-avatar")
          : `<span class="stock-search-avatar">${escapeChartText((stock.name || stock.code || "?").slice(0, 2))}</span>`;
        return `
          <button class="asset-market-search-result stock-search-result" type="button" role="option" data-journal-stock-search-result="${index}">
            ${avatar}
            <span>
              <strong>${escapeChartText(stock.name || stock.code)}</strong>
              <em>${escapeChartText(marketText || stock.code)}</em>
            </span>
            <b>${escapeChartText(formatJournalStockSearchPrice(stock))}</b>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function updateJournalStockSearchPanel(form) {
  const targetForm = form || document.querySelector("[data-journal-entry-form]");
  const panel = targetForm ? targetForm.querySelector("[data-journal-stock-search-panel]") : null;
  if (!panel) return;
  panel.innerHTML = renderJournalStockSearchPanel();
}

async function runJournalStockSearch(query, requestId, form) {
  try {
    const response = await fetch(`/api/markets?action=search&q=${encodeURIComponent(query)}`, {
      credentials: "include",
      headers: { Accept: "application/json" }
    });
    const payload = await response.json().catch(() => ({}));
    if (journalStockSearchState.requestId !== requestId) return;
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "종목 검색에 실패했습니다.");
    }

    journalStockSearchState.loading = false;
    journalStockSearchState.results = (Array.isArray(payload.results) ? payload.results : [])
      .map((result) => journalMarketResultToStock(result))
      .filter((stock) => stock.name || stock.code);
    journalStockSearchState.error = "";
    updateJournalStockSearchPanel(form);
  } catch (error) {
    if (journalStockSearchState.requestId !== requestId) return;
    journalStockSearchState.loading = false;
    journalStockSearchState.results = [];
    journalStockSearchState.error = error?.message || "종목 검색에 실패했습니다.";
    updateJournalStockSearchPanel(form);
  }
}

function scheduleJournalStockSearch(input) {
  const form = input ? input.closest("[data-journal-entry-form]") : null;
  const query = String(input ? input.value : "").trim();
  if (journalStockSearchTimer) window.clearTimeout(journalStockSearchTimer);

  const requestId = journalStockSearchState.requestId + 1;
  journalStockSearchState = {
    query,
    loading: query.length >= 2,
    results: [],
    error: "",
    requestId
  };
  updateJournalStockSearchPanel(form);
  if (query.length < 2) return;

  journalStockSearchTimer = window.setTimeout(() => {
    journalStockSearchTimer = 0;
    runJournalStockSearch(query, requestId, form);
  }, 260);
}

function applyJournalStockSearchResult(button) {
  const form = button ? button.closest("[data-journal-entry-form]") : null;
  const stock = journalStockSearchState.results[Number(button?.dataset.journalStockSearchResult)];
  if (!form || !stock) return;
  setJournalSelectedStock(form, normalizeJournalStockItem(stock));
  resetJournalStockSearchState();
  updateJournalStockSearchPanel(form);
}

function fillJournalPriceFromStock(form, stock) {
  if (!form || !stock || !stock.price) return;

  const mode = form.dataset.tradeMode === "sell" ? "sell" : "buy";
  const priceInput = form.querySelector(mode === "sell" ? "[data-journal-trade-sell-price]" : "[data-journal-trade-buy-price]");
  if (priceInput) priceInput.value = Number(stock.price).toLocaleString();
}

function getJournalSelectedStock(form) {
  if (!form) return null;

  if (form.dataset.selectedStockName) {
    return {
      name: form.dataset.selectedStockName,
      code: form.dataset.selectedStockCode || "",
      price: Number(form.dataset.selectedStockPrice) || 0,
      holdingQuantity: Number(form.dataset.selectedHoldingQuantity) || 0,
      holdingAmount: Number(form.dataset.selectedHoldingAmount) || 0
    };
  }

  const input = form.querySelector("[data-journal-stock-name]");
  const query = input ? input.value : "";
  return getJournalStockByQuery(query, form.dataset.tradeMode === "sell" ? "sell" : "buy");
}

function setJournalSelectedStock(form, stock) {
  if (!form || !stock) return;

  form.dataset.selectedStockName = stock.name;
  form.dataset.selectedStockCode = stock.code || "";
  form.dataset.selectedStockPrice = String(stock.price || 0);
  form.dataset.selectedHoldingQuantity = String(stock.holdingQuantity || 0);
  form.dataset.selectedHoldingAmount = String(stock.holdingAmount || 0);

  const stockInput = form.querySelector("[data-journal-stock-name]");
  if (stockInput) stockInput.value = stock.name;

  form.querySelectorAll("[data-journal-trade-buy-price], [data-journal-trade-sell-price], [data-journal-trade-quantity]").forEach((input) => {
    input.value = "";
  });
  fillJournalPriceFromStock(form, stock);
  resetJournalStockSearchState();
  updateJournalStockSearchPanel(form);

  updateJournalHoldingInfo(form);
  updateJournalTradeEstimate(form);
}

function clearJournalSelectedStock(form, { keepInput = false } = {}) {
  if (!form) return;

  delete form.dataset.selectedStockName;
  delete form.dataset.selectedStockCode;
  delete form.dataset.selectedStockPrice;
  delete form.dataset.selectedHoldingQuantity;
  delete form.dataset.selectedHoldingAmount;

  if (!keepInput) {
    const stockInput = form.querySelector("[data-journal-stock-name]");
    if (stockInput) stockInput.value = "";
  }

  updateJournalHoldingInfo(form);
  updateJournalTradeEstimate(form);
}

function syncJournalTradeMode(form) {
  if (!form) return;

  const stock = getJournalSelectedStock(form);
  const isSell = form.dataset.tradeMode === "sell";
  const selectedIsNotHeld = stock && form.dataset.selectedStockName && stock.holdingQuantity <= 0 && stock.holdingAmount <= 0;

  if (isSell && selectedIsNotHeld) {
    clearJournalSelectedStock(form);
    return;
  }

  if (stock && form.dataset.selectedStockName) fillJournalPriceFromStock(form, stock);
  updateJournalHoldingInfo(form);
  updateJournalTradeEstimate(form);
}

function updateJournalHoldingInfo(form) {
  const row = form ? form.querySelector("[data-journal-holding-row]") : null;
  if (!row) return;

  const stock = getJournalSelectedStock(form);
  if (!stock || !form.dataset.selectedStockName) {
    row.hidden = true;
    row.querySelector("[data-journal-holding-box]").innerHTML = "";
    return;
  }

  row.hidden = false;
  const hasHolding = stock.holdingQuantity > 0 || stock.holdingAmount > 0;
  row.querySelector("[data-journal-holding-box]").innerHTML = hasHolding
    ? `
      <strong>보유 정보 (${stock.name})</strong>
      <div>
        <span><em>보유 수량</em><b>${stock.holdingQuantity.toLocaleString()}주</b></span>
        <span><em>보유 금액</em><b>${formatKRW(stock.holdingAmount)}</b></span>
      </div>
    `
    : `
      <strong>보유 정보 (${stock.name})</strong>
      <p class="holding-empty">현재 보유 중인 수량이 없습니다.</p>
    `;
}

function getJournalCurrentPrice(form) {
  const stock = getJournalSelectedStock(form);
  if (stock && stock.price) return stock.price;

  const stockInput = form ? form.querySelector("[data-journal-stock-name]") : null;
  const query = stockInput && stockInput.value ? stockInput.value : "";
  const match = getJournalStockByQuery(query, form && form.dataset.tradeMode === "sell" ? "sell" : "buy");
  return match ? match.price : 0;
}

function inputWithSuffix({ value = "", placeholder = "", suffix = "", readonly = false, numeric = false, attrs = "" }) {
  const numericAttrs = numeric ? `inputmode="numeric" autocomplete="off" data-number-input` : "";

  return `
    <div class="journal-input-shell ${readonly ? "readonly" : ""}">
      <input value="${value}" placeholder="${placeholder}" ${readonly ? "readonly" : ""} ${numericAttrs} ${attrs}>
      ${suffix ? `<span>${suffix}</span>` : ""}
    </div>
  `;
}

function priceInputWithCurrentButton({ value = "", placeholder = "", attrs = "" }) {
  return `
    <div class="journal-price-control">
      ${inputWithSuffix({ value, placeholder, suffix: "원", numeric: true, attrs })}
      <button class="journal-current-price-button" type="button" data-journal-current-price>현재가</button>
    </div>
  `;
}

function quantityInputWithPresets({ value = "" } = {}) {
  return `
    <div class="journal-quantity-control">
      ${inputWithSuffix({ value, placeholder: "수량을 입력하세요", suffix: "주", numeric: true, attrs: "data-journal-trade-quantity" })}
      <div class="journal-quantity-presets" aria-label="수량 빠른 입력">
        <button type="button" data-journal-quantity-preset="10">10%</button>
        <button type="button" data-journal-quantity-preset="50">50%</button>
        <button type="button" data-journal-quantity-preset="100">최대</button>
      </div>
    </div>
  `;
}

function applyJournalCurrentPrice(button) {
  const form = button ? button.closest("[data-journal-entry-form]") : null;
  if (!form) return;

  const mode = form.dataset.tradeMode === "sell" ? "sell" : "buy";
  const priceInput = form.querySelector(mode === "sell" ? "[data-journal-trade-sell-price]" : "[data-journal-trade-buy-price]");
  if (!priceInput) return;

  const currentPrice = getJournalCurrentPrice(form);
  if (!currentPrice) return;

  priceInput.value = currentPrice.toLocaleString();
  updateJournalTradeEstimate(form);
}

function applyJournalQuantityPreset(button) {
  const form = button ? button.closest("[data-journal-entry-form]") : null;
  if (!form) return;

  const percent = Number(button.dataset.journalQuantityPreset) || 0;
  const mode = form.dataset.tradeMode === "sell" ? "sell" : "buy";
  const quantityInput = form.querySelector("[data-journal-trade-quantity]");
  const priceInput = form.querySelector(mode === "sell" ? "[data-journal-trade-sell-price]" : "[data-journal-trade-buy-price]");
  if (!quantityInput || !priceInput) return;

  let price = parseKRWInput(priceInput.value);
  if (!price) {
    const currentPrice = getJournalCurrentPrice(form);
    if (currentPrice) {
      price = currentPrice;
      priceInput.value = currentPrice.toLocaleString();
    }
  }

  if (mode === "sell") {
    const stock = getJournalSelectedStock(form);
    const holdingQuantity = stock ? stock.holdingQuantity : 0;
    const quantity = percent >= 100 ? holdingQuantity : Math.round((holdingQuantity * percent) / 100);
    quantityInput.value = quantity ? quantity.toLocaleString() : "";
    updateJournalTradeEstimate(form);
    return;
  }

  if (!price) return;
  const budget = (getAssetCashBalance() * percent) / 100;
  const quantity = Math.floor(budget / price);
  quantityInput.value = quantity ? quantity.toLocaleString() : "";
  updateJournalTradeEstimate(form);
}

function renderJournalStockPickerOption(stock, active, index) {
  const hasHolding = stock.holdingQuantity > 0 || stock.holdingAmount > 0;
  const marketText = [
    stock.code,
    typeof getStockMarketLabel === "function" ? getStockMarketLabel(stock) : stock.market
  ].filter(Boolean).join(" · ");
  const priceText = stock.price ? formatKRW(stock.price) : "-";

  return `
    <button class="journal-option journal-option-stock ${active ? "active" : ""}" type="button" data-journal-write-stock-option="${stock.name}" data-journal-write-stock-index="${index}" data-stock-code="${stock.code || ""}" data-search-text="${normalizeJournalCurrentPriceText(getJournalStockCandidates(stock.name, stock.code).join(" "))}">
      <span class="journal-option-icon">${icon("star")}</span>
      <span>
        <strong>${escapeChartText(stock.name)}</strong>
        <em>${escapeChartText(marketText || "코드 없음")} · 현재가 ${escapeChartText(priceText)}${hasHolding ? ` · 보유 ${stock.holdingQuantity.toLocaleString()}주` : ""}</em>
      </span>
      <b>${active ? "선택됨" : ""}</b>
    </button>
  `;
}

function getJournalStockPickerOptions(mode = "buy") {
  return mode === "sell" ? getJournalStockOptionsForMode(mode) : getJournalFavoriteStocks();
}

function renderJournalStockPicker(form) {
  const mode = form.dataset.tradeMode === "sell" ? "sell" : "buy";
  const title = mode === "sell" ? "보유 종목 선택" : "관심 종목 선택";
  const description = mode === "sell" ? "보유 중인 종목을 선택하면 현재가가 자동 입력됩니다." : "별표로 추가한 관심 종목을 선택하면 현재가가 매수가에 입력됩니다.";
  const selected = getJournalSelectedStock(form);
  const options = getJournalStockPickerOptions(mode);
  const emptyText = mode === "sell" ? "선택할 보유 종목이 없습니다." : "추가된 관심 종목이 없습니다.";

  return `
    <div class="journal-stock-picker-backdrop" data-journal-write-stock-backdrop>
      <section class="journal-stock-picker-panel" role="dialog" aria-modal="true" aria-labelledby="journalWriteStockTitle">
        <div class="modal-header">
          <div>
            <p class="eyebrow">${mode === "sell" ? "Holdings" : "Stocks"}</p>
            <h2 class="modal-title" id="journalWriteStockTitle">${title}</h2>
            <p class="journal-picker-description">${description}</p>
          </div>
          <button class="icon-button" type="button" data-journal-write-stock-cancel aria-label="닫기">X</button>
        </div>
        <div class="modal-body journal-stock-picker-body">
          <div class="journal-choice-search">
            <input class="input" type="search" placeholder="종목명 또는 코드 검색" data-journal-write-stock-search autofocus>
            <span>${icon("search")}</span>
          </div>
          <div class="journal-option-list" data-journal-write-stock-options>
            ${options.map((stock, index) => renderJournalStockPickerOption(stock, selected && selected.name === stock.name, index)).join("")}
            <p class="journal-empty-option" data-journal-write-stock-empty data-empty-text="${escapeChartText(emptyText)}" ${options.length ? "hidden" : ""}>${emptyText}</p>
          </div>
        </div>
      </section>
    </div>
  `;
}

function openJournalWriteStockPicker(button) {
  const form = button ? button.closest("[data-journal-entry-form]") : null;
  if (!form) return;

  closeJournalWriteStockPicker(form);
  form.insertAdjacentHTML("beforeend", renderJournalStockPicker(form));
  hydrateIcons(form);
  const searchInput = form.querySelector("[data-journal-write-stock-search]");
  if (searchInput) searchInput.focus();
}

function closeJournalWriteStockPicker(form) {
  if (!form) return;
  const picker = form.querySelector(".journal-stock-picker-backdrop");
  if (picker) picker.remove();
}

function selectJournalWriteStockDraft(option) {
  const picker = option ? option.closest(".journal-stock-picker-backdrop") : null;
  const form = option ? option.closest("[data-journal-entry-form]") : null;
  if (!picker || !form) return;

  picker.querySelectorAll("[data-journal-write-stock-option]").forEach((button) => {
    const active = button === option;
    button.classList.toggle("active", active);
    const badge = button.querySelector("b");
    if (badge) badge.textContent = active ? "선택됨" : "";
  });

  applyJournalWriteStockSelection(option);
}

function applyJournalWriteStockSelection(button) {
  const form = button ? button.closest("[data-journal-entry-form]") : null;
  const picker = button ? button.closest(".journal-stock-picker-backdrop") : null;
  const activeOption = picker ? picker.querySelector("[data-journal-write-stock-option].active") : null;
  if (!form || !activeOption) return;

  const mode = form.dataset.tradeMode === "sell" ? "sell" : "buy";
  const options = getJournalStockPickerOptions(mode);
  const stock = options[Number(activeOption.dataset.journalWriteStockIndex)]
    || options.find((item) => item.name === activeOption.dataset.journalWriteStockOption)
    || null;
  if (!stock) return;

  setJournalSelectedStock(form, stock);
  closeJournalWriteStockPicker(form);
}

function filterJournalWriteStockPicker(input) {
  const picker = input ? input.closest(".journal-stock-picker-backdrop") : null;
  if (!picker) return;

  const query = normalizeJournalCurrentPriceText(input.value);
  let visibleCount = 0;
  picker.querySelectorAll("[data-journal-write-stock-option]").forEach((option) => {
    const visible = !query || option.dataset.searchText.includes(query);
    option.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  const empty = picker.querySelector("[data-journal-write-stock-empty]");
  if (empty) {
    empty.textContent = query ? "검색 결과가 없습니다." : (empty.dataset.emptyText || empty.textContent);
    empty.hidden = visibleCount > 0;
  }
}

function journalTradeTotalBox(type) {
  const isSell = type === "sell";

  return `
    <div class="journal-entry-row journal-total-row" data-journal-total-row="${type}">
      <span>${isSell ? "총 매도금액" : "총 매수금액"}</span>
      <div class="journal-total-box ${isSell ? "sell" : "buy"}">
        <strong data-journal-total="${type}">0원</strong>
        <p data-journal-total-help="${type}">
          ${isSell ? "매도할 보유 종목을 먼저 선택하세요." : `매수 가능 현금은 ${formatKRW(getAssetCashBalance())}입니다.`}
        </p>
        <em data-journal-total-error="${type}"></em>
      </div>
    </div>
  `;
}

function updateJournalTradeEstimate(form) {
  if (!form) return true;

  const mode = form.dataset.tradeMode === "sell" ? "sell" : "buy";
  const quantityInput = form.querySelector("[data-journal-trade-quantity]");
  const priceInput = form.querySelector(mode === "sell" ? "[data-journal-trade-sell-price]" : "[data-journal-trade-buy-price]");
  const totalNode = form.querySelector(`[data-journal-total="${mode}"]`);
  const helpNode = form.querySelector(`[data-journal-total-help="${mode}"]`);
  const errorNode = form.querySelector(`[data-journal-total-error="${mode}"]`);
  const saveButton = form.querySelector("[data-journal-entry-save]");
  const quantity = typeof parseAssetDecimalInput === "function"
    ? parseAssetDecimalInput(quantityInput ? quantityInput.value : "")
    : parseKRWInput(quantityInput ? quantityInput.value : "");
  const price = parseKRWInput(priceInput ? priceInput.value : "");
  const total = quantity * price;
  const stock = getJournalSelectedStock(form);
  const editingRecord = typeof getJournalRecordById === "function"
    ? getJournalRecordById(form.dataset.journalEditId || "")
    : null;
  const editingSameMode = editingRecord && editingRecord.type === mode;
  const editingTotalAllowance = editingSameMode && typeof getJournalRecordTotal === "function"
    ? getJournalRecordTotal(editingRecord)
    : 0;
  const editingQuantityAllowance = editingSameMode ? Number(editingRecord.quantity) || 0 : 0;
  const limit = mode === "sell"
    ? (stock ? stock.holdingAmount : 0) + editingTotalAllowance
    : getAssetCashBalance() + editingTotalAllowance;
  const sellQuantityLimit = (stock ? stock.holdingQuantity : 0) + editingQuantityAllowance;
  const invalid = mode === "sell"
    ? total > limit || quantity > sellQuantityLimit || (total > 0 && !stock)
    : total > limit;

  if (totalNode) totalNode.textContent = formatKRW(total);
  if (helpNode) {
    helpNode.textContent = mode === "sell"
      ? stock
        ? `매도 가능 금액은 ${formatKRW(stock.holdingAmount)}입니다.`
        : "매도할 보유 종목을 먼저 선택하세요."
      : `매수 가능 현금은 ${formatKRW(getAssetCashBalance())}입니다.`;
  }
  if (errorNode) {
    errorNode.textContent = invalid
      ? mode === "sell"
        ? stock
          ? quantity > sellQuantityLimit
            ? "현재 해당 주식의 보유 수량보다 많이 매도할 수 없습니다."
            : "현재 해당 주식의 총 보유금액보다 크게 매도할 수 없습니다."
          : "매도할 보유 종목을 먼저 선택하세요."
        : "현재 보유 현금보다 크게 매수할 수 없습니다."
      : "";
  }
  if (saveButton) saveButton.disabled = invalid;

  return !invalid;
}

var journalWriteInitialDate = "";

function getJournalWriteTodayValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getJournalWriteDateValue() {
  return /^\d{4}-\d{2}-\d{2}$/.test(journalWriteInitialDate)
    ? journalWriteInitialDate
    : getJournalWriteTodayValue();
}

function setJournalWriteInitialDate(value) {
  journalWriteInitialDate = /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) ? String(value) : "";
}

function clearJournalWriteInitialDate() {
  journalWriteInitialDate = "";
}

function renderJournalWrite({ showTitle = true } = {}) {
  const editingRecord = typeof getJournalEditingRecord === "function" ? getJournalEditingRecord() : null;
  const mode = editingRecord?.type === "sell" ? "sell" : "buy";
  const recordPrice = editingRecord && typeof getJournalRecordPrice === "function" ? getJournalRecordPrice(editingRecord) : 0;
  const selectedStock = editingRecord
    ? normalizeJournalStockItem({
      name: editingRecord.name,
      code: editingRecord.code || editingRecord.symbol,
      symbol: editingRecord.symbol || editingRecord.code,
      price: recordPrice,
      currentPriceKrw: recordPrice
    })
    : null;
  const journalDateValue = editingRecord?.date || getJournalWriteDateValue();
  const stockNameValue = editingRecord ? escapeChartText(editingRecord.name || "") : "";
  const quantityValue = editingRecord ? escapeChartText(formatAssetDecimal(editingRecord.quantity) || String(editingRecord.quantity || "")) : "";
  const priceValue = recordPrice ? escapeChartText(formatMarketNumber(recordPrice)) : "";
  const memoValue = editingRecord ? escapeChartText(editingRecord.memo || "") : "";
  const selectedAttrs = selectedStock
    ? `data-selected-stock-name="${escapeChartText(selectedStock.name)}" data-selected-stock-code="${escapeChartText(selectedStock.code || "")}" data-selected-stock-price="${selectedStock.price || 0}" data-selected-holding-quantity="${selectedStock.holdingQuantity || 0}" data-selected-holding-amount="${selectedStock.holdingAmount || 0}"`
    : "";
  return `
    <form class="journal-entry-form" data-journal-entry-form data-trade-mode="${mode}" data-journal-edit-id="${editingRecord?.id || ""}" ${selectedAttrs}>
      <div class="journal-entry-content">
        ${showTitle ? `<h2 id="journalWriteModalTitle" class="journal-entry-title">${editingRecord ? "매매 일지 수정" : "매매 일지 작성"}</h2>` : ""}

        ${journalWriteField(
          "일자",
          `<div class="input-with-icon journal-date-control">
            <input class="input" type="date" value="${journalDateValue}" data-date-picker>
            <button class="field-icon field-icon-button" type="button" data-date-picker-trigger aria-label="날짜 선택">${icon("calendar")}</button>
          </div>`
        )}

        ${journalWriteField(
          "구분",
          `<div class="trade-toggle" aria-label="거래 구분">
            <button class="${mode === "buy" ? "active" : ""}" type="button" data-journal-trade-mode="buy" aria-pressed="${mode === "buy" ? "true" : "false"}">매수</button>
            <button class="${mode === "sell" ? "active" : ""}" type="button" data-journal-trade-mode="sell" aria-pressed="${mode === "sell" ? "true" : "false"}">매도</button>
          </div>`
        )}

        ${journalWriteField(
          "종목명",
          `<div class="journal-stock-control" data-journal-stock-control>
            <div class="journal-stock-search-field">
              <input class="input" placeholder="종목명을 입력하세요" autocomplete="off" data-journal-stock-name value="${stockNameValue}">
              <div class="asset-market-search-panel journal-stock-search-panel" data-journal-stock-search-panel></div>
            </div>
            <button class="journal-stock-pick-button" type="button" data-journal-write-stock-open aria-label="종목 선택">${icon("star")}</button>
          </div>`
        )}

        <div class="journal-entry-row journal-holding-row" data-journal-holding-row hidden>
          <span></span>
          <div class="holding-box" data-journal-holding-box></div>
        </div>

        <div data-visible-for="buy">${journalWriteField("매수가", priceInputWithCurrentButton({ value: mode === "buy" ? priceValue : "", placeholder: "매수가를 입력하세요", attrs: "data-journal-trade-buy-price" }))}</div>
        <div data-visible-for="sell">${journalWriteField("매도가", priceInputWithCurrentButton({ value: mode === "sell" ? priceValue : "", placeholder: "매도가를 입력하세요", attrs: "data-journal-trade-sell-price" }))}</div>
        ${journalWriteField("수량", quantityInputWithPresets({ value: quantityValue }))}
        <div data-visible-for="buy">${journalTradeTotalBox("buy")}</div>
        <div data-visible-for="sell">${journalTradeTotalBox("sell")}</div>
        ${journalWriteField("메모", `<textarea class="textarea compact-textarea" placeholder="메모를 입력하세요">${memoValue}</textarea>`)}
      </div>

      <div class="journal-entry-actions">
        <button class="btn" type="button" data-modal-close="true">취소</button>
        <button class="btn primary" type="button" data-journal-entry-save>저장</button>
      </div>
    </form>
  `;
}
