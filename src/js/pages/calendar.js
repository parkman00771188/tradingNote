var calendarViewDate = new Date();
var calendarSelectedDate = new Date();
var calendarDayDetailDate = "";

function formatCalendarDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCalendarMonthStart(date = calendarViewDate) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function setCalendarMonthValue(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})$/);
  if (!match) return;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  if (!Number.isFinite(year) || !Number.isFinite(month)) return;
  calendarViewDate = new Date(year, month, 1);
}

function setCalendarSelectedDateValue(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const nextDate = new Date(year, month, day);
  if (
    nextDate.getFullYear() !== year ||
    nextDate.getMonth() !== month ||
    nextDate.getDate() !== day
  ) {
    return false;
  }
  calendarSelectedDate = nextDate;
  calendarViewDate = new Date(year, month, 1);
  return true;
}

function setCalendarDayDetailDate(value) {
  if (!setCalendarSelectedDateValue(value)) return false;
  calendarDayDetailDate = value;
  return true;
}

function shiftCalendarMonth(offset) {
  const start = getCalendarMonthStart();
  calendarViewDate = new Date(start.getFullYear(), start.getMonth() + Number(offset || 0), 1);
}

function resetCalendarMonth() {
  const today = new Date();
  calendarViewDate = today;
  calendarSelectedDate = today;
}

function parseCalendarTradeProfit(value) {
  if (typeof parseSignedMarketNumber === "function") return parseSignedMarketNumber(value);
  const text = String(value || "").trim();
  const sign = text.startsWith("-") ? -1 : 1;
  return sign * (Number(text.replace(/[^0-9]/g, "")) || 0);
}

function formatCalendarProfit(value) {
  const amount = Math.round(Number(value) || 0);
  if (!amount) return "";
  if (typeof formatSignedMarketNumber === "function") return `${formatSignedMarketNumber(amount)}원`;
  const sign = amount >= 0 ? "+" : "-";
  return `${sign}${Math.abs(amount).toLocaleString()}원`;
}

function getCalendarTradeRows() {
  return typeof getAllJournalTradeRows === "function"
    ? getAllJournalTradeRows()
    : (typeof trades !== "undefined" && Array.isArray(trades) ? trades : []);
}

function getCalendarTradeMap(year, monthIndex) {
  const rows = getCalendarTradeRows();
  const map = new Map();

  rows.forEach((trade) => {
    const fullDate = String(trade?.[10] || "");
    if (/^\d{4}-\d{2}-\d{2}$/.test(fullDate)) {
      const [rowYear, rowMonth, rowDay] = fullDate.split("-").map(Number);
      if (rowYear !== year || rowMonth - 1 !== monthIndex || !rowDay) return;
      const current = map.get(rowDay) || { profit: 0, count: 0, rows: [] };
      current.profit += parseCalendarTradeProfit(trade[6]);
      current.count += 1;
      current.rows.push(trade);
      map.set(rowDay, current);
      return;
    }

    const dateText = String(trade?.[0] || "");
    const match = dateText.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (!match) return;
    const month = Number(match[1]) - 1;
    const day = Number(match[2]);
    if (month !== monthIndex || !day) return;

    const current = map.get(day) || { profit: 0, count: 0, rows: [] };
    current.profit += parseCalendarTradeProfit(trade[6]);
    current.count += 1;
    current.rows.push(trade);
    map.set(day, current);
  });

  return map;
}

function getCalendarRowsForDateValue(value) {
  const dateValue = String(value || calendarDayDetailDate || formatCalendarDateValue(calendarSelectedDate));
  const mmdd = dateValue.slice(5).replace("-", "/");
  return getCalendarTradeRows().filter((row) => {
    if (row?.[10]) return row[10] === dateValue;
    return row?.[0] === mmdd;
  });
}

function formatCalendarDetailDate(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  return `${match[1]}년 ${Number(match[2])}월 ${Number(match[3])}일`;
}

function isCalendarSellRow(row) {
  const typeText = String(row?.[2] || "");
  return row?.[5] && row[5] !== "-" || typeText.includes("매도") || typeText.includes("留ㅻ룄");
}

function getCalendarTradeTypeLabel(row) {
  return isCalendarSellRow(row) ? "매도" : "매수";
}

function getCalendarTradePrice(row) {
  return isCalendarSellRow(row) ? row?.[5] : row?.[4];
}

function getCalendarTradeTotal(row) {
  const quantity = typeof parseAssetDecimalInput === "function"
    ? parseAssetDecimalInput(row?.[3])
    : Number(String(row?.[3] || "").replace(/,/g, "")) || 0;
  const price = typeof parseMarketNumber === "function"
    ? parseMarketNumber(getCalendarTradePrice(row))
    : Number(String(getCalendarTradePrice(row) || "").replace(/[^0-9.-]/g, "")) || 0;
  return quantity * price;
}

function renderCalendarTradeTypeBadge(row) {
  const sell = isCalendarSellRow(row);
  return `<span class="trade-type ${sell ? "sell" : "buy"}">${sell ? "매도" : "매수"}</span>`;
}

function renderCalendarDayDetailModal() {
  const dateValue = calendarDayDetailDate || formatCalendarDateValue(calendarSelectedDate);
  const rows = getCalendarRowsForDateValue(dateValue);

  return `
    <div class="modal-backdrop">
      <section class="modal-panel calendar-day-modal" role="dialog" aria-modal="true" aria-labelledby="calendarDayModalTitle">
        <div class="modal-header">
          <div>
            <p class="eyebrow">Trading Day</p>
            <h2 class="modal-title" id="calendarDayModalTitle">${formatCalendarDetailDate(dateValue)}</h2>
          </div>
          <button class="icon-button" type="button" data-modal-close aria-label="닫기">X</button>
        </div>
        <div class="modal-body">
          ${rows.length
            ? `<div class="calendar-day-records">
                ${rows.map((row) => {
                  const recordId = row[12] || "";
                  const priceLabel = isCalendarSellRow(row) ? "매도가" : "매수가";
                  const totalLabel = isCalendarSellRow(row) ? "총 매도금액" : "총 매수금액";
                  return `
                    <article class="calendar-day-record">
                      <div class="calendar-day-record-main">
                        <strong>${escapeChartText(row[1] || "-")}</strong>
                        <p>${escapeChartText(row[11] || row[0] || "")}</p>
                        <div class="calendar-day-record-meta">
                          <span>${renderCalendarTradeTypeBadge(row)}</span>
                          <span><em>수량</em><b>${escapeChartText(row[3] || "0")}주</b></span>
                          <span><em>${priceLabel}</em><b>${escapeChartText(getCalendarTradePrice(row) || "-")}원</b></span>
                          <span><em>${totalLabel}</em><b>${formatKRW(getCalendarTradeTotal(row))}</b></span>
                          ${row[9] ? `<span class="calendar-day-record-note"><em>메모</em><b>${escapeChartText(row[9])}</b></span>` : ""}
                        </div>
                      </div>
                      ${recordId ? `
                        <div class="calendar-day-record-actions">
                          <button class="mini-action" type="button" data-calendar-edit-journal="${recordId}" aria-label="수정">${icon("edit")}</button>
                          <button class="mini-action danger" type="button" data-calendar-delete-journal="${recordId}" aria-label="삭제">${icon("trash")}</button>
                        </div>
                      ` : ""}
                    </article>
                  `;
                }).join("")}
              </div>`
            : `<div class="calendar-day-empty">
                <span class="status-icon">${icon("calendar")}</span>
                <strong>작성된 매매일지가 없습니다.</strong>
                <p>이 날짜의 매매 판단과 결과를 기록해두면 캘린더에서 바로 확인할 수 있습니다.</p>
              </div>`
          }
          <div class="calendar-day-actions">
            <button class="btn" type="button" data-modal-close>닫기</button>
            <button class="btn primary" type="button" data-calendar-write-journal="${dateValue}">${icon("plus")}매매일지 기록 작성</button>
          </div>
        </div>
      </section>
    </div>
  `;
}

function buildCalendarDays(year, monthIndex, tradeMap) {
  const firstDay = new Date(year, monthIndex, 1);
  const firstWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  return Array.from({ length: 42 }, (_, index) => {
    const dayOffset = index - firstWeekday + 1;
    const actualDate = new Date(year, monthIndex, dayOffset);
    const date = actualDate.getDate();
    const muted = dayOffset <= 0 || dayOffset > daysInMonth;

    const data = muted ? null : tradeMap.get(date);
    return {
      date,
      dateValue: formatCalendarDateValue(actualDate),
      muted,
      selected: isCalendarSelectedDate(actualDate),
      profit: data?.profit || 0,
      count: data?.count || 0
    };
  });
}

function isCalendarToday(year, monthIndex, date) {
  const today = new Date();
  return today.getFullYear() === year && today.getMonth() === monthIndex && today.getDate() === date;
}

function isCalendarSelectedDate(date) {
  return (
    calendarSelectedDate.getFullYear() === date.getFullYear() &&
    calendarSelectedDate.getMonth() === date.getMonth() &&
    calendarSelectedDate.getDate() === date.getDate()
  );
}

function renderCalendarGrid(days, mobile = false) {
  const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];
  const head = weekdayLabels
    .map((day, index) => `<div class="calendar-head ${index === 0 ? "text-red" : index === 6 ? "text-blue" : ""}">${day}</div>`)
    .join("");
  const cells = days.map((day, index) => {
    const profitClass = day.profit > 0 ? "text-red" : day.profit < 0 ? "text-blue" : "";
    const isSunday = index % 7 === 0;
    return `
      <button class="calendar-cell ${day.muted ? "muted-day" : ""} ${isSunday ? "sunday" : ""} ${day.selected ? "selected" : ""}" type="button" data-calendar-day="${day.dateValue}" aria-label="${day.dateValue} 매매일지 작성">
        <span class="date-num">${day.date}</span>
        ${day.profit ? `<div class="day-profit ${profitClass}">${formatCalendarProfit(day.profit)}</div>` : ""}
        ${day.count ? `<div class="day-dots">${Array.from({ length: Math.min(day.count, 3) }, () => `<span class="${day.profit < 0 ? "blue" : ""}"></span>`).join("")}</div>` : ""}
      </button>
    `;
  }).join("");

  if (!mobile) return `<section class="calendar-grid">${head}${cells}</section>`;

  return `
    <section class="mobile-calendar-card">
      ${weekdayLabels.map((day, index) => `<strong class="${index === 0 ? "text-red" : index === 6 ? "text-blue" : ""}">${day}</strong>`).join("")}
      ${days.map((day, index) => {
        const profitClass = day.profit > 0 ? "text-red" : day.profit < 0 ? "text-blue" : "";
        return `
          <button class="${day.muted ? "muted" : ""} ${index % 7 === 0 ? "sunday" : ""} ${day.selected ? "selected" : ""}" type="button" data-calendar-day="${day.dateValue}" aria-label="${day.dateValue} 매매일지 작성">
            <span>${day.date}</span>
            <em class="${profitClass}">${day.profit ? formatCalendarProfit(day.profit).replace("원", "") : ""}</em>
            ${day.count ? `<i class="mobile-day-dot ${day.profit < 0 ? "blue" : ""}" aria-hidden="true"></i>` : ""}
          </button>
        `;
      }).join("")}
    </section>
  `;
}

function getCalendarSummary(days) {
  const activeDays = days.filter((day) => !day.muted);
  const profit = activeDays.reduce((sum, day) => sum + Math.max(0, day.profit), 0);
  const loss = activeDays.reduce((sum, day) => sum + Math.min(0, day.profit), 0);
  const tradeCount = activeDays.reduce((sum, day) => sum + day.count, 0);
  const net = profit + loss;
  const winDays = activeDays.filter((day) => day.profit > 0).length;
  const tradeDays = activeDays.filter((day) => day.count > 0).length;
  const winRate = tradeDays ? (winDays / tradeDays) * 100 : 0;

  return { profit, loss, net, tradeCount, winRate };
}

function renderCalendar() {
  const start = getCalendarMonthStart();
  const year = start.getFullYear();
  const monthIndex = start.getMonth();
  const monthValue = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const tradeMap = getCalendarTradeMap(year, monthIndex);
  const days = buildCalendarDays(year, monthIndex, tradeMap);
  const summary = getCalendarSummary(days);
  const selectedDay = days.find((day) => day.selected && !day.muted);
  const selectedRows = selectedDay ? tradeMap.get(selectedDay.date)?.rows || [] : [];

  return `
    <div class="mobile-calendar-page">
      <div class="mobile-month-nav">
        <button type="button" data-calendar-nav="-1">${icon("chevronLeft")}</button>
        <div class="mobile-month-title">
          <h2>${year}년 ${monthIndex + 1}월</h2>
          <input class="input calendar-month-input mobile-calendar-month-input" type="month" value="${monthValue}" data-calendar-month-input aria-label="월 선택">
        </div>
        <button type="button" data-calendar-nav="1">${icon("chevronRight")}</button>
      </div>
      ${renderCalendarGrid(days, true)}
      <section class="panel mobile-month-summary">
        <h2 class="panel-title">이번 달 요약</h2>
        <div>
          <span><em>총 수익</em><strong class="text-red">${formatCalendarProfit(summary.profit) || "0원"}</strong></span>
          <span><em>총 손실</em><strong class="text-blue">${formatCalendarProfit(summary.loss) || "0원"}</strong></span>
          <span><em>순손익</em><strong class="${summary.net >= 0 ? "text-red" : "text-blue"}">${formatCalendarProfit(summary.net) || "0원"}</strong></span>
          <span><em>거래 횟수</em><strong>${summary.tradeCount}회</strong></span>
          <span><em>승률</em><strong>${summary.winRate.toFixed(1)}%</strong></span>
        </div>
      </section>
    </div>

    <div class="calendar-layout desktop-calendar-layout">
      <div class="stack">
        <div class="calendar-top">
          <button class="icon-button" type="button" data-calendar-nav="-1" aria-label="이전 달">${icon("chevronLeft")}</button>
          <h2 class="month-title">${year}년 ${monthIndex + 1}월</h2>
          <input class="input calendar-month-input" type="month" value="${monthValue}" data-calendar-month-input aria-label="월 선택">
          <button class="icon-button" type="button" data-calendar-nav="1" aria-label="다음 달">${icon("chevronRight")}</button>
          <button class="btn ghost" type="button" data-calendar-today>오늘</button>
          <button class="btn primary" type="button" data-modal="journalWrite">${icon("plus")}매매 기록 작성</button>
        </div>
        ${renderCalendarGrid(days)}
        <section class="bottom-grid">
          <article class="panel">
            <div class="panel-header tight"><h2 class="panel-title">선택일 거래 내역</h2></div>
            ${selectedRows.length
              ? renderTable(["종목명", "구분", "수량", "체결가", "손익", "전략"], selectedRows.map((row) => [row[1], renderCalendarTradeTypeBadge(row), row[3], getCalendarTradePrice(row), row[6], row[8]]))
              : `<div class="empty-state compact"><span class="status-icon">${icon("calendar")}</span><div><strong>기록된 매매가 없습니다.</strong><p>빈 날짜도 캘린더에서 그대로 확인할 수 있습니다.</p></div></div>`}
          </article>
          <article class="panel">
            <div class="panel-header tight"><h2 class="panel-title">월간 손익 요약</h2></div>
            <div class="summary-grid">
              <div class="summary-item"><p>총 수익</p><strong class="text-red">${formatCalendarProfit(summary.profit) || "0원"}</strong></div>
              <div class="summary-item"><p>총 손실</p><strong class="text-blue">${formatCalendarProfit(summary.loss) || "0원"}</strong></div>
              <div class="summary-item"><p>순손익</p><strong class="${summary.net >= 0 ? "text-red" : "text-blue"}">${formatCalendarProfit(summary.net) || "0원"}</strong></div>
              <div class="summary-item"><p>거래 횟수</p><strong>${summary.tradeCount}회</strong></div>
              <div class="summary-item"><p>승률</p><strong>${summary.winRate.toFixed(1)}%</strong></div>
            </div>
          </article>
        </section>
      </div>
    </div>
  `;
}
