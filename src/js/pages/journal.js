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
          sub: `<span>전월 대비</span><strong class="text-blue">+6회 (+33.3%)</strong>`,
          iconName: "target",
          className: "dashboard-metric journal-summary-metric",
          iconPosition: "end"
        })}
        ${metricCard({
          title: "실현손익",
          value: "+2,450,000원",
          sub: `<span>전월 대비</span><strong class="text-green">+620,000원 (+33.87%)</strong>`,
          iconName: "trend",
          tone: "green",
          valueClass: "text-green",
          className: "dashboard-metric journal-summary-metric",
          iconPosition: "end"
        })}
        ${metricCard({
          title: "평균 수익률",
          value: "+3.21%",
          sub: `<span>전월 대비</span><strong class="text-green">+1.12%p</strong>`,
          iconName: "target",
          tone: "green",
          valueClass: "text-green",
          className: "dashboard-metric journal-summary-metric",
          iconPosition: "end"
        })}
      </section>

      <section class="toolbar journal-filter-toolbar">
        <div class="field"><label>기간</label><div class="input-with-icon"><input class="input" value="2024.05.20 ~ 2024.06.20" readonly><span class="field-icon">${icon("calendar")}</span></div></div>
        <div class="field"><label>종목</label><select class="select"><option>종목 선택</option></select></div>
        <div class="field"><label>매수/매도</label><select class="select"><option>전체</option><option>매수</option><option>매도</option></select></div>
        <button class="btn primary journal-search-button" type="button">${icon("search")}검색</button>
      </section>

      <section class="journal-layout">
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
