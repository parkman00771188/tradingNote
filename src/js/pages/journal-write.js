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

function getJournalStockByQuery(query, mode = "buy") {
  const universe = getJournalStockOptionsForMode(mode);
  return universe.find((stock) => journalStockMatchesQuery(stock, query)) || null;
}

function getJournalStockOptionsForMode(mode = "buy") {
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

  return [{
    name: journalDefaultHolding.stock,
    code: "",
    price: journalDefaultHolding.currentPrice,
    holdingQuantity: journalDefaultHolding.quantity,
    holdingAmount: journalDefaultHolding.amount
  }];
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

function priceInputWithCurrentButton({ placeholder = "", attrs = "" }) {
  return `
    <div class="journal-price-control">
      ${inputWithSuffix({ placeholder, suffix: "원", numeric: true, attrs })}
      <button class="journal-current-price-button" type="button" data-journal-current-price>현재가</button>
    </div>
  `;
}

function quantityInputWithPresets() {
  return `
    <div class="journal-quantity-control">
      ${inputWithSuffix({ placeholder: "수량을 입력하세요", suffix: "주", numeric: true, attrs: "data-journal-trade-quantity" })}
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

function renderJournalStockPickerOption(stock, active) {
  const hasHolding = stock.holdingQuantity > 0 || stock.holdingAmount > 0;

  return `
    <button class="journal-option journal-option-stock ${active ? "active" : ""}" type="button" data-journal-write-stock-option="${stock.name}" data-stock-code="${stock.code || ""}" data-search-text="${normalizeJournalCurrentPriceText(getJournalStockCandidates(stock.name, stock.code).join(" "))}">
      <span class="journal-option-icon">${icon("star")}</span>
      <span>
        <strong>${stock.name}</strong>
        <em>${stock.code || "코드 없음"} · 현재가 ${formatKRW(stock.price)}${hasHolding ? ` · 보유 ${stock.holdingQuantity.toLocaleString()}주` : ""}</em>
      </span>
      <b>${active ? "선택됨" : ""}</b>
    </button>
  `;
}

function renderJournalStockPicker(form) {
  const mode = form.dataset.tradeMode === "sell" ? "sell" : "buy";
  const title = mode === "sell" ? "보유 종목 선택" : "종목 선택";
  const description = mode === "sell" ? "보유 중인 종목만 표시됩니다." : "전체 관심 종목에서 선택합니다.";
  const selected = getJournalSelectedStock(form);
  const options = getJournalStockOptionsForMode(mode);

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
            ${options.map((stock) => renderJournalStockPickerOption(stock, selected && selected.name === stock.name)).join("")}
            <p class="journal-empty-option" data-journal-write-stock-empty hidden>검색 결과가 없습니다.</p>
          </div>
          <div class="journal-date-actions">
            <button class="btn" type="button" data-journal-write-stock-cancel>취소</button>
            <button class="btn primary" type="button" data-journal-write-stock-apply>확인</button>
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
  if (!picker) return;

  picker.querySelectorAll("[data-journal-write-stock-option]").forEach((button) => {
    const active = button === option;
    button.classList.toggle("active", active);
    const badge = button.querySelector("b");
    if (badge) badge.textContent = active ? "선택됨" : "";
  });
}

function applyJournalWriteStockSelection(button) {
  const form = button ? button.closest("[data-journal-entry-form]") : null;
  const picker = button ? button.closest(".journal-stock-picker-backdrop") : null;
  const activeOption = picker ? picker.querySelector("[data-journal-write-stock-option].active") : null;
  if (!form || !activeOption) return;

  const mode = form.dataset.tradeMode === "sell" ? "sell" : "buy";
  const stock = getJournalStockOptionsForMode(mode).find((item) => item.name === activeOption.dataset.journalWriteStockOption) || null;
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
  if (empty) empty.hidden = visibleCount > 0;
}

function journalTradeTotalBox(type) {
  const isSell = type === "sell";

  return `
    <div class="journal-entry-row journal-total-row" data-journal-total-row="${type}">
      <span>${isSell ? "총 매도금액" : "총 매수금액"}</span>
      <div class="journal-total-box ${isSell ? "sell" : "buy"}">
        <strong data-journal-total="${type}">0원</strong>
        <p data-journal-total-help="${type}">
          ${isSell ? `매도 가능 금액은 ${formatKRW(journalDefaultHolding.amount)}입니다.` : `매수 가능 현금은 ${formatKRW(getAssetCashBalance())}입니다.`}
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
  const quantity = parseKRWInput(quantityInput ? quantityInput.value : "");
  const price = parseKRWInput(priceInput ? priceInput.value : "");
  const total = quantity * price;
  const stock = getJournalSelectedStock(form);
  const limit = mode === "sell" ? (stock ? stock.holdingAmount : 0) : getAssetCashBalance();
  const invalid = mode === "sell" ? total > limit || (total > 0 && !stock) : total > limit;

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
          ? "현재 해당 주식의 총 보유금액보다 크게 매도할 수 없습니다."
          : "매도할 보유 종목을 먼저 선택하세요."
        : "현재 보유 현금보다 크게 매수할 수 없습니다."
      : "";
  }
  if (saveButton) saveButton.disabled = invalid;

  return !invalid;
}

function renderJournalWrite({ showTitle = true } = {}) {
  return `
    <form class="journal-entry-form" data-journal-entry-form data-trade-mode="buy">
      <div class="journal-entry-content">
        ${showTitle ? `<h2 id="journalWriteModalTitle" class="journal-entry-title">매매 일지 작성</h2>` : ""}

        ${journalWriteField(
          "일자",
          `<div class="input-with-icon journal-date-control">
            <input class="input" type="date" value="2024-06-20" data-date-picker>
            <button class="field-icon field-icon-button" type="button" data-date-picker-trigger aria-label="날짜 선택">${icon("calendar")}</button>
          </div>`
        )}

        ${journalWriteField(
          "구분",
          `<div class="trade-toggle" aria-label="거래 구분">
            <button class="active" type="button" data-journal-trade-mode="buy" aria-pressed="true">매수</button>
            <button type="button" data-journal-trade-mode="sell" aria-pressed="false">매도</button>
          </div>`
        )}

        <div data-visible-for="buy">
          ${journalWriteField(
            "현재 현금 보유량",
            `<div class="cash-balance-box">
              <div>
                <strong>${formatKRW(getAssetCashBalance())}</strong>
                <p>현재 계좌의 현금 보유량입니다.</p>
              </div>
            </div>`
          )}
        </div>

        ${journalWriteField(
          "종목명",
          `<div class="journal-stock-control">
            <input class="input" placeholder="종목명을 입력하세요" autocomplete="off" data-journal-stock-name>
            <button class="journal-stock-pick-button" type="button" data-journal-write-stock-open aria-label="종목 선택">${icon("star")}</button>
          </div>`
        )}

        <div class="journal-entry-row journal-holding-row" data-journal-holding-row hidden>
          <span></span>
          <div class="holding-box" data-journal-holding-box></div>
        </div>

        <div data-visible-for="buy">${journalWriteField("매수가", priceInputWithCurrentButton({ placeholder: "매수가를 입력하세요", attrs: "data-journal-trade-buy-price" }))}</div>
        <div data-visible-for="sell">${journalWriteField("매도가", priceInputWithCurrentButton({ placeholder: "매도가를 입력하세요", attrs: "data-journal-trade-sell-price" }))}</div>
        ${journalWriteField("수량", quantityInputWithPresets())}
        <div data-visible-for="buy">${journalTradeTotalBox("buy")}</div>
        <div data-visible-for="sell">${journalTradeTotalBox("sell")}</div>
        ${journalWriteField("메모", `<textarea class="textarea compact-textarea" placeholder="메모를 입력하세요"></textarea>`)}
      </div>

      <div class="journal-entry-actions">
        <button class="btn" type="button" data-modal-close="true">취소</button>
        <button class="btn primary" type="button" data-journal-entry-save>저장</button>
      </div>
    </form>
  `;
}
