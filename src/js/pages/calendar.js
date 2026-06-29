var calendarViewDate = new Date();
var calendarSelectedDate = new Date();
var calendarDayDetailDate = "";
var calendarDayDetailFilter = "all";
const calendarDayDetailFilterKeys = new Set(["all", "buy", "sell"]);

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
  calendarDayDetailFilter = "all";
  return true;
}

function setCalendarDayDetailFilter(value) {
  const nextFilter = String(value || "all");
  if (!calendarDayDetailFilterKeys.has(nextFilter)) return false;
  calendarDayDetailFilter = nextFilter;
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

function createCalendarTradeBucket() {
  return {
    profit: 0,
    count: 0,
    rows: [],
    buyCount: 0,
    sellCount: 0,
    buyTotal: 0,
    sellTotal: 0
  };
}

function appendCalendarTradeToMap(map, day, trade) {
  const current = map.get(day) || createCalendarTradeBucket();
  const sell = isCalendarSellRow(trade);
  const total = getCalendarTradeTotal(trade);

  current.profit += parseCalendarTradeProfit(trade?.[6]);
  current.count += 1;
  current.rows.push(trade);

  if (sell) {
    current.sellCount += 1;
    current.sellTotal += total;
  } else {
    current.buyCount += 1;
    current.buyTotal += total;
  }

  map.set(day, current);
}

function getCalendarTradeMap(year, monthIndex) {
  const rows = getCalendarTradeRows();
  const map = new Map();

  rows.forEach((trade) => {
    const fullDate = String(trade?.[10] || "");
    if (/^\d{4}-\d{2}-\d{2}$/.test(fullDate)) {
      const [rowYear, rowMonth, rowDay] = fullDate.split("-").map(Number);
      if (rowYear !== year || rowMonth - 1 !== monthIndex || !rowDay) return;
      appendCalendarTradeToMap(map, rowDay, trade);
      return;
    }

    const dateText = String(trade?.[0] || "");
    const match = dateText.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (!match) return;
    const month = Number(match[1]) - 1;
    const day = Number(match[2]);
    if (month !== monthIndex || !day) return;

    appendCalendarTradeToMap(map, day, trade);
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

function formatCalendarDetailDateWithWeekday(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return formatCalendarDetailDate(value);
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return `${formatCalendarDetailDate(value)} (${weekdays[date.getDay()]})`;
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

function getCalendarRecordResultClass(row) {
  const profitText = String(row?.[6] || "").trim();
  if (/^-\s*[1-9]/.test(profitText)) return "text-blue";
  if (/^\+\s*[1-9]/.test(profitText)) return "text-red";
  return "";
}

function getCalendarDaySummary(rows) {
  return rows.reduce(
    (summary, row) => {
      const sell = isCalendarSellRow(row);
      const total = getCalendarTradeTotal(row);
      const profit = parseCalendarTradeProfit(row?.[6]);

      if (sell) {
        summary.sellTotal += total;
        summary.sellCount += 1;
      } else {
        summary.buyTotal += total;
        summary.buyCount += 1;
      }

      summary.profit += profit;
      summary.tradeCount += 1;
      return summary;
    },
    { buyTotal: 0, sellTotal: 0, profit: 0, tradeCount: 0, buyCount: 0, sellCount: 0 }
  );
}

function formatCalendarSignedKRW(value) {
  const amount = Math.round(Number(value) || 0);
  if (typeof formatSignedMarketNumber === "function") return `${formatSignedMarketNumber(amount)}원`;
  const sign = amount >= 0 ? "+" : "-";
  return `${sign}${Math.abs(amount).toLocaleString()}원`;
}

function formatCalendarSignedRateValue(value) {
  if (typeof formatSignedRate === "function") return formatSignedRate(value);
  const rate = Number(value) || 0;
  const sign = rate >= 0 ? "+" : "-";
  return `${sign}${Math.abs(rate).toFixed(2)}%`;
}

function formatCalendarProfitDisplay(value) {
  const text = String(value || "+0").trim();
  return text.includes("원") ? text : `${text}원`;
}

function getCalendarSummaryTone(value) {
  const amount = Number(value) || 0;
  if (amount > 0) return "text-red";
  if (amount < 0) return "text-blue";
  return "";
}

function renderCalendarDaySummary(summary) {
  const profitClass = getCalendarSummaryTone(summary.profit);
  const profitRate = summary.buyTotal ? (summary.profit / summary.buyTotal) * 100 : 0;
  return `
    <div class="calendar-day-summary-grid" aria-label="일자 매매 요약">
      <article class="calendar-day-summary-card buy">
        <span class="calendar-day-summary-icon">${icon("coin")}</span>
        <em>총 매수금액</em>
        <strong>${formatKRW(summary.buyTotal)}</strong>
      </article>
      <article class="calendar-day-summary-card sell">
        <span class="calendar-day-summary-icon">${icon("coin")}</span>
        <em>총 매도금액</em>
        <strong>${formatKRW(summary.sellTotal)}</strong>
      </article>
      <article class="calendar-day-summary-card profit">
        <span class="calendar-day-summary-icon">${icon("trend")}</span>
        <em>순손익</em>
        <strong class="${profitClass}">${formatCalendarSignedKRW(summary.profit)}</strong>
        <small>${formatCalendarSignedRateValue(profitRate)}</small>
      </article>
      <article class="calendar-day-summary-card count">
        <span class="calendar-day-summary-icon">${icon("journal")}</span>
        <em>거래 건수</em>
        <strong>${summary.tradeCount.toLocaleString()}건</strong>
        <small>매수 ${summary.buyCount.toLocaleString()} / 매도 ${summary.sellCount.toLocaleString()}</small>
      </article>
    </div>
  `;
}

function getCalendarFilteredDayRows(rows) {
  if (calendarDayDetailFilter === "buy") return rows.filter((row) => !isCalendarSellRow(row));
  if (calendarDayDetailFilter === "sell") return rows.filter((row) => isCalendarSellRow(row));
  return rows;
}

function renderCalendarDayFilters(summary) {
  const filters = [
    { key: "all", label: "전체", count: summary.tradeCount },
    { key: "buy", label: "매수", count: summary.buyCount },
    { key: "sell", label: "매도", count: summary.sellCount }
  ];

  return `
    <div class="calendar-day-filter-row" aria-label="거래 필터">
      ${filters.map((item) => `
        <button class="calendar-day-filter-chip ${calendarDayDetailFilter === item.key ? "active" : ""} ${item.key}" type="button" data-calendar-day-filter="${item.key}" aria-pressed="${calendarDayDetailFilter === item.key ? "true" : "false"}">
          <span aria-hidden="true"></span>
          ${item.label}
        </button>
      `).join("")}
    </div>
  `;
}

function renderCalendarDayRecordCard(row, dateValue) {
  const recordId = row[12] || "";
  const sell = isCalendarSellRow(row);
  const priceLabel = sell ? "매도가" : "매수가";
  const amountLabel = sell ? "매도금액" : "매수금액";
  const codeText = String(row[11] || "").trim();
  const resultClass = getCalendarRecordResultClass(row);
  const memoText = String(row[9] || "").trim();
  const profitText = row[6] || "+0";
  const rateText = row[7] || "+0.00%";
  const totalText = formatKRW(getCalendarTradeTotal(row));

  return `
    <article class="calendar-day-record ${sell ? "sell" : "buy"}">
      <div class="calendar-day-record-side">
        ${renderCalendarTradeTypeBadge(row)}
        <span><em>수량</em><b>${escapeChartText(row[3] || "0")}주</b></span>
      </div>
      <div class="calendar-day-record-main">
        <div class="calendar-day-record-top">
          <div class="calendar-day-record-title">
            <strong>${escapeChartText(row[1] || "-")}</strong>
            <p>${escapeChartText(codeText || dateValue)}</p>
          </div>
          <div class="calendar-day-record-amount">
            <b>${totalText}</b>
            <span class="${resultClass}">${escapeChartText(formatCalendarProfitDisplay(profitText))} (${escapeChartText(rateText)})</span>
          </div>
        </div>
        <div class="calendar-day-record-meta">
          <span><em>${priceLabel}</em><b>${escapeChartText(getCalendarTradePrice(row) || "-")}원</b></span>
          <span><em>수익률</em><b class="${resultClass}">${escapeChartText(rateText)}</b></span>
          <span><em>${amountLabel}</em><b>${totalText}</b></span>
        </div>
        ${memoText ? `<div class="calendar-day-record-note"><em>메모</em><b>${escapeChartText(memoText)}</b></div>` : ""}
      </div>
      ${recordId ? `
        <div class="calendar-day-record-actions">
          <button class="mini-action" type="button" data-calendar-edit-journal="${recordId}" aria-label="수정">${icon("edit")}</button>
          <button class="mini-action danger" type="button" data-calendar-delete-journal="${recordId}" aria-label="삭제">${icon("trash")}</button>
        </div>
      ` : ""}
    </article>
  `;
}

function renderCalendarDayDetailModal() {
  const dateValue = calendarDayDetailDate || formatCalendarDateValue(calendarSelectedDate);
  const rows = getCalendarRowsForDateValue(dateValue);
  const filteredRows = getCalendarFilteredDayRows(rows);
  const summary = getCalendarDaySummary(rows);

  return `
    <div class="modal-backdrop">
      <section class="modal-panel calendar-day-modal" role="dialog" aria-modal="true" aria-labelledby="calendarDayModalTitle">
        <div class="calendar-day-appbar">
          <button class="calendar-day-top-button menu" type="button" data-modal-close aria-label="닫기"><span></span></button>
          <div class="calendar-day-heading">
            <p>TRADING DAY</p>
            <h2 class="modal-title" id="calendarDayModalTitle">${formatCalendarDetailDateWithWeekday(dateValue)} <span>${icon("calendar")}</span></h2>
          </div>
          <button class="calendar-day-write-button" type="button" data-calendar-write-journal="${dateValue}" aria-label="매매일지 기록 작성">${icon("plus")}기록</button>
          <button class="calendar-day-top-button close" type="button" data-modal-close aria-label="닫기">X</button>
        </div>
        <div class="modal-body">
          ${rows.length
            ? `<div class="calendar-day-records">
                ${renderCalendarDaySummary(summary)}
                ${renderCalendarDayFilters(summary)}
                ${filteredRows.length
                  ? filteredRows.map((row) => renderCalendarDayRecordCard(row, dateValue)).join("")
                  : `<div class="calendar-day-filter-empty">선택한 조건에 해당하는 기록이 없습니다.</div>`
                }
              </div>`
            : `<div class="calendar-day-empty">
                <span class="status-icon">${icon("calendar")}</span>
                <strong>작성된 매매일지가 없습니다.</strong>
                <p>이 날짜의 매매 판단과 결과를 기록해두면 캘린더에서 바로 확인할 수 있습니다.</p>
              </div>`
          }
          ${rows.length
            ? ""
            : `<div class="calendar-day-actions">
                <button class="btn" type="button" data-modal-close>닫기</button>
                <button class="btn primary" type="button" data-calendar-write-journal="${dateValue}">${icon("plus")}매매일지 기록 작성</button>
              </div>`
          }
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
      count: data?.count || 0,
      buyCount: data?.buyCount || 0,
      sellCount: data?.sellCount || 0,
      buyTotal: data?.buyTotal || 0,
      sellTotal: data?.sellTotal || 0
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

function formatCalendarCompactKRW(value, options = {}) {
  const amount = Math.round(Number(value) || 0);
  if (!amount) return options.emptyZero ? "" : "0원";

  const sign = amount > 0 ? "+" : "-";
  const abs = Math.abs(amount);
  if (abs >= 100000000) {
    const valueText = (abs / 100000000).toFixed(abs >= 1000000000 ? 1 : 2).replace(/\.0+$|0+$/g, "");
    return `${sign}${valueText}억`;
  }
  if (abs >= 10000) return `${sign}${Math.round(abs / 10000).toLocaleString()}만`;
  return `${sign}${abs.toLocaleString()}원`;
}

function renderCalendarDayCellSummary(day, mobile = false) {
  if (!day.count) return "";

  const profitClass = day.profit > 0 ? "text-red" : day.profit < 0 ? "text-blue" : "";
  const profitText = formatCalendarCompactKRW(day.profit);

  if (mobile) {
    return `
      <em class="${profitClass}">${profitText}</em>
      <small>${day.count}건</small>
    `;
  }

  return `
    <div class="calendar-cell-summary">
      <span class="calendar-cell-count">매수 ${day.buyCount} · 매도 ${day.sellCount}</span>
      <span class="calendar-cell-profit ${profitClass}">손익 ${profitText}</span>
    </div>
  `;
}

function getCalendarProfitTrendPoints(days) {
  let cumulative = 0;
  return days
    .filter((day) => !day.muted)
    .map((day) => {
      cumulative += Number(day.profit) || 0;
      return {
        date: day.dateValue,
        day: day.date,
        dailyProfit: Number(day.profit) || 0,
        cumulative
      };
    });
}

function getCalendarProfitTrendMetric(points, compare) {
  if (!points.length) return { day: "-", cumulative: 0 };
  return points.reduce((best, point) => compare(point.cumulative, best.cumulative) ? point : best, points[0]);
}

function renderCalendarProfitTrendPanel(days, summary, mobile = false) {
  const points = getCalendarProfitTrendPoints(days);
  const finalPoint = points[points.length - 1] || { day: "-", cumulative: 0 };
  const bestPoint = getCalendarProfitTrendMetric(points, (next, current) => next > current);
  const worstPoint = getCalendarProfitTrendMetric(points, (next, current) => next < current);
  const maxAbs = Math.max(1, ...points.map((point) => Math.abs(point.cumulative)));
  const width = 680;
  const height = mobile ? 236 : 260;
  const padding = { top: 26, right: 28, bottom: 36, left: 62 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const zeroY = padding.top + chartHeight / 2;
  const scaleX = (index) => {
    if (points.length <= 1) return padding.left + chartWidth / 2;
    return padding.left + (chartWidth * index) / (points.length - 1);
  };
  const scaleY = (value) => zeroY - (value / maxAbs) * (chartHeight / 2);
  const linePath = points.length
    ? points.map((point, index) => `${index ? "L" : "M"}${scaleX(index).toFixed(2)},${scaleY(point.cumulative).toFixed(2)}`).join(" ")
    : `M${padding.left},${zeroY} L${width - padding.right},${zeroY}`;
  const areaPath = points.length
    ? `${linePath} L${scaleX(points.length - 1).toFixed(2)},${zeroY.toFixed(2)} L${padding.left},${zeroY.toFixed(2)} Z`
    : "";
  const ticks = [-maxAbs, -maxAbs / 2, 0, maxAbs / 2, maxAbs];
  const xLabels = points.filter((_, index) => index === 0 || index === Math.floor(points.length / 2) || index === points.length - 1);
  const finalClass = finalPoint.cumulative >= 0 ? "text-red" : "text-blue";

  return `
    <section class="panel calendar-profit-trend-panel">
      <div class="calendar-profit-trend-header">
        <div>
          <h2 class="panel-title">통합 손익 추이</h2>
          <p>매수와 매도 기록을 합산한 월간 누적 손익입니다.</p>
        </div>
        <span>이번 달</span>
      </div>
      <div class="calendar-profit-chart-wrap">
        <svg class="calendar-profit-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="통합 손익 추이 그래프">
          ${ticks.map((tick) => {
            const y = scaleY(tick);
            return `
              <line class="calendar-profit-gridline ${tick === 0 ? "zero" : ""}" x1="${padding.left}" x2="${width - padding.right}" y1="${y.toFixed(2)}" y2="${y.toFixed(2)}"></line>
              <text class="calendar-profit-axis-label" x="${padding.left - 12}" y="${(y + 4).toFixed(2)}" text-anchor="end">${formatCalendarCompactKRW(tick)}</text>
            `;
          }).join("")}
          ${xLabels.map((point, index) => {
            const pointIndex = points.indexOf(point);
            return `<text class="calendar-profit-axis-label x" x="${scaleX(pointIndex).toFixed(2)}" y="${height - 10}" text-anchor="${index === 0 ? "start" : index === xLabels.length - 1 ? "end" : "middle"}">${point.day}일</text>`;
          }).join("")}
          ${areaPath ? `<path class="calendar-profit-area" d="${areaPath}"></path>` : ""}
          <path class="calendar-profit-line" d="${linePath}"></path>
          ${points.filter((point) => point.dailyProfit).map((point, index, activePoints) => {
            const originalIndex = points.indexOf(point);
            const tone = point.dailyProfit > 0 ? "positive" : "negative";
            return `<circle class="calendar-profit-dot ${tone}" cx="${scaleX(originalIndex).toFixed(2)}" cy="${scaleY(point.cumulative).toFixed(2)}" r="${activePoints.length > 18 ? 2.6 : 3.6}"></circle>`;
          }).join("")}
        </svg>
      </div>
      <div class="calendar-profit-trend-metrics">
        <span><em>최고 손익</em><strong class="text-red">${formatCalendarCompactKRW(bestPoint.cumulative)}</strong></span>
        <span><em>최저 손익</em><strong class="text-blue">${formatCalendarCompactKRW(worstPoint.cumulative)}</strong></span>
        <span><em>최종 손익</em><strong class="${finalClass}">${formatCalendarCompactKRW(finalPoint.cumulative)}</strong></span>
        <span><em>거래 횟수</em><strong>${summary.tradeCount}회</strong></span>
        <span><em>승률</em><strong>${summary.winRate.toFixed(1)}%</strong></span>
      </div>
    </section>
  `;
}

function renderCalendarGrid(days, mobile = false) {
  const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];
  const head = weekdayLabels
    .map((day, index) => `<div class="calendar-head ${index === 0 ? "text-red" : index === 6 ? "text-blue" : ""}">${day}</div>`)
    .join("");
  const cells = days.map((day, index) => {
    const isSunday = index % 7 === 0;
    const dotTone = day.profit < 0 ? "blue" : day.profit > 0 ? "red" : "";
    return `
      <button class="calendar-cell ${day.muted ? "muted-day" : ""} ${isSunday ? "sunday" : ""} ${day.selected ? "selected" : ""}" type="button" data-calendar-day="${day.dateValue}" aria-label="${day.dateValue} 매매일지 확인">
        <span class="date-num">${day.date}</span>
        ${renderCalendarDayCellSummary(day)}
        ${day.count ? `<div class="day-dots">${Array.from({ length: Math.min(day.count, 3) }, () => `<span class="${dotTone}"></span>`).join("")}</div>` : ""}
      </button>
    `;
  }).join("");

  if (!mobile) return `<section class="calendar-grid">${head}${cells}</section>`;

  return `
    <section class="mobile-calendar-card">
      ${weekdayLabels.map((day, index) => `<strong class="${index === 0 ? "text-red" : index === 6 ? "text-blue" : ""}">${day}</strong>`).join("")}
      ${days.map((day, index) => {
        return `
          <button class="${day.muted ? "muted" : ""} ${index % 7 === 0 ? "sunday" : ""} ${day.selected ? "selected" : ""}" type="button" data-calendar-day="${day.dateValue}" aria-label="${day.dateValue} 매매일지 확인">
            <span>${day.date}</span>
            ${renderCalendarDayCellSummary(day, true)}
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
      ${renderCalendarProfitTrendPanel(days, summary, true)}
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
        ${renderCalendarProfitTrendPanel(days, summary)}
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
