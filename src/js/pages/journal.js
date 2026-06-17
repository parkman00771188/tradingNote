var journalSelectedTradeIds = new Set();
var journalDeletedTradeIds = new Set();

function journalTradeId(index) {
  return `trade-${index}`;
}

function getJournalTrades() {
  return trades
    .map((trade, index) => ({ trade, id: journalTradeId(index) }))
    .filter(({ id }) => !journalDeletedTradeIds.has(id));
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
      <button type="button"><span>${icon("calendar")}</span><strong>기간</strong><em>2024.05.20 ~ 2024.06.20</em>${icon("chevronRight")}</button>
      <button type="button"><span>${icon("journal")}</span><strong>종목</strong><em>전체</em>${icon("chevronRight")}</button>
      <button type="button"><span>${icon("swap")}</span><strong>매수/매도</strong><em>전체</em>${icon("chevronRight")}</button>
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
  return `
    <section class="mobile-trade-list">
      ${getJournalTrades()
        .slice(0, limit)
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
      <section class="metric-grid three">
        ${metricCard({
          title: "이번달 거래수",
          value: `${journalTradeCount}회`,
          sub: `<span>전월 대비</span><strong class="text-red">+6회 (+33.3%)</strong>`,
          iconName: "target",
          className: "dashboard-metric journal-summary-metric",
          iconPosition: "end"
        })}
        ${metricCard({
          title: "실현손익",
          value: "+2,450,000원",
          sub: `<span>전월 대비</span><strong class="text-red">+620,000원 (+33.87%)</strong>`,
          iconName: "trend",
          tone: "red",
          valueClass: "text-red",
          className: "dashboard-metric journal-summary-metric",
          iconPosition: "end"
        })}
        ${metricCard({
          title: "평균 수익률",
          value: "+3.21%",
          sub: `<span>전월 대비</span><strong class="text-red">+1.12%p</strong>`,
          iconName: "target",
          tone: "red",
          valueClass: "text-red",
          className: "dashboard-metric journal-summary-metric",
          iconPosition: "end"
        })}
      </section>

      <section class="toolbar journal-filter-toolbar desktop-journal-filter">
        <div class="field"><label>기간</label><div class="input-with-icon"><input class="input" value="2024.05.20 ~ 2024.06.20" readonly><span class="field-icon">${icon("calendar")}</span></div></div>
        <div class="field"><label>종목</label><select class="select"><option>종목 선택</option></select></div>
        <div class="field"><label>매수/매도</label><select class="select"><option>전체</option><option>매수</option><option>매도</option></select></div>
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
