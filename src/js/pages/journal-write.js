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

const journalCurrentPriceAliases = {
  NAVER: ["네이버"]
};

function normalizeJournalCurrentPriceText(value) {
  return String(value || "").replace(/\s+/g, "").toLowerCase();
}

function getJournalCurrentPrice(form) {
  const stockInput = form ? form.querySelector("[data-journal-stock-name]") : null;
  const query = normalizeJournalCurrentPriceText(stockInput && stockInput.value ? stockInput.value : journalDefaultHolding.stock);

  if (typeof watchList !== "undefined" && Array.isArray(watchList)) {
    const match = watchList.find(([name, code]) => {
      const candidates = [name, code, ...(journalCurrentPriceAliases[name] || [])];
      return candidates.some((candidate) => normalizeJournalCurrentPriceText(candidate) === query);
    });
    if (match) return parseKRWInput(match[2]);
  }

  return journalDefaultHolding.currentPrice;
}

function inputWithSuffix({ value = "", placeholder = "", suffix = "", readonly = false, numeric = false, attrs = "", currentPrice = false }) {
  const numericAttrs = numeric ? `inputmode="numeric" autocomplete="off" data-number-input` : "";
  const currentPriceButton = currentPrice
    ? `<button class="journal-current-price-button" type="button" data-journal-current-price>현재가</button>`
    : "";

  return `
    <div class="journal-input-shell ${readonly ? "readonly" : ""} ${currentPrice ? "has-current-price" : ""}">
      <input value="${value}" placeholder="${placeholder}" ${readonly ? "readonly" : ""} ${numericAttrs} ${attrs}>
      ${currentPriceButton}
      ${suffix ? `<span>${suffix}</span>` : ""}
    </div>
  `;
}

function applyJournalCurrentPrice(button) {
  const form = button ? button.closest("[data-journal-entry-form]") : null;
  if (!form) return;

  const mode = form.dataset.tradeMode === "sell" ? "sell" : "buy";
  const priceInput = form.querySelector(mode === "sell" ? "[data-journal-trade-sell-price]" : "[data-journal-trade-buy-price]");
  if (!priceInput) return;

  priceInput.value = getJournalCurrentPrice(form).toLocaleString();
  updateJournalTradeEstimate(form);
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
  const limit = mode === "sell" ? journalDefaultHolding.amount : getAssetCashBalance();
  const invalid = total > limit;

  if (totalNode) totalNode.textContent = formatKRW(total);
  if (helpNode) {
    helpNode.textContent = mode === "sell" ? `매도 가능 금액은 ${formatKRW(journalDefaultHolding.amount)}입니다.` : `매수 가능 현금은 ${formatKRW(getAssetCashBalance())}입니다.`;
  }
  if (errorNode) {
    errorNode.textContent = invalid
      ? mode === "sell"
        ? "현재 해당 주식의 총 보유금액보다 크게 매도할 수 없습니다."
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

        ${journalWriteField("종목명", `<input class="input" placeholder="종목명을 입력하세요" data-journal-stock-name>`)}

        <div class="journal-entry-row">
          <span></span>
          <div class="holding-box">
            <strong>보유 정보 (${journalDefaultHolding.stock})</strong>
            <div>
              <span><em>보유 수량</em><b>${journalDefaultHolding.quantity}주</b></span>
              <span><em>보유 금액</em><b>${formatKRW(journalDefaultHolding.amount)}</b></span>
            </div>
          </div>
        </div>

        <div data-visible-for="buy">${journalWriteField("매수가", inputWithSuffix({ placeholder: "매수가를 입력하세요", suffix: "원", numeric: true, attrs: "data-journal-trade-buy-price", currentPrice: true }))}</div>
        <div data-visible-for="sell">${journalWriteField("매도가", inputWithSuffix({ placeholder: "매도가를 입력하세요", suffix: "원", numeric: true, attrs: "data-journal-trade-sell-price", currentPrice: true }))}</div>
        ${journalWriteField("수량", inputWithSuffix({ placeholder: "수량을 입력하세요", suffix: "주", numeric: true, attrs: "data-journal-trade-quantity" }))}
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
