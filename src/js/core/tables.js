function renderTable(headers, rows) {
  const safeRows = Array.isArray(rows) ? rows : [];

  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${headers.map((head) => `<th>${head}</th>`).join("")}</tr></thead>
        <tbody>${
          safeRows.length
            ? safeRows
              .map(
                (row) => `
              <tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>
            `
              )
              .join("")
            : `<tr><td class="table-empty-cell" colspan="${headers.length}">저장된 데이터가 없습니다.</td></tr>`
        }</tbody>
      </table>
    </div>
  `;
}

function renderTradeRows(limit = trades.length) {
  return trades.slice(0, limit).map((row) => {
    const [date, stock, type, qty, buy, sell, profit, rate, strategy, memo] = row;
    const isSell = type === "매도";
    const profitClass = profit.startsWith("+") ? "text-red" : profit.startsWith("-") ? "text-blue" : "";
    return [
      date,
      stock,
      `<span class="trade-type ${isSell ? "sell" : "buy"}">${type}</span>`,
      qty,
      buy,
      sell,
      `<span class="${profitClass}">${profit}</span>`,
      `<span class="${profitClass}">${rate}</span>`,
      tag(strategy, toneForStrategy(strategy)),
      memo,
      `<button class="menu-dots" type="button" aria-label="더보기">${icon("more")}</button>`
    ];
  });
}
