function renderStockWatchRows() {
  const favorites = typeof stockFavoriteItems !== "undefined" ? stockFavoriteItems : [];
  if (!favorites.length) return "";

  return favorites.slice(0, 10).map((item, index) => {
    const stock = normalizeStockAnalysisItem(item);
    const price = getStockAnalysisPriceMeta(stock);
    const change = getStockAnalysisChangeMeta(stock);
    return `
      <tr class="stock-watch-row" data-stock-favorite-select="${index}">
        <td>
          <span class="text-blue">${icon("star")}</span>
          <span class="stock-watch-name">${escapeChartText(stock.name)}</span>
          <span class="tiny">${escapeChartText(stock.code || stock.symbol)}</span>
        </td>
        <td>${escapeChartText(price.text)}</td>
        <td class="${change.className}">${formatSignedRate(change.changeRate)}</td>
      </tr>
    `;
  }).join("");
}

function renderStockWatchPanel() {
  const favorites = typeof stockFavoriteItems !== "undefined" ? stockFavoriteItems : [];
  if (!favorites.length) return "";

  return `
    <article class="panel watchlist-panel">
      <div class="panel-header">
        <h2 class="panel-title">관심 종목</h2>
        <button class="mini-action" type="button" data-stock-favorites-toggle aria-label="관심 종목 목록">${icon("star")}</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>종목명</th><th>현재가</th><th>등락률</th></tr></thead>
          <tbody>${renderStockWatchRows()}</tbody>
        </table>
      </div>
    </article>
  `;
}

function renderStockSearchToolbar() {
  const query = typeof stockSearchState !== "undefined" ? stockSearchState.query : "";
  const favoriteCount = typeof stockFavoriteItems !== "undefined" ? stockFavoriteItems.length : 0;
  const favoritesOpen = stockFavoritesOpen && favoriteCount > 0;
  return `
    <section class="toolbar stock-search-toolbar">
      <div class="stock-search-shell">
        <div class="stock-search-field">
          <div class="input-with-icon stock-search-input-wrap">
            <input class="input stock-search-input" type="search" placeholder="종목 검색 (종목명 또는 코드 입력)" value="${escapeChartText(query)}" autocomplete="off" data-stock-search-input>
            <span class="field-icon">${icon("search")}</span>
          </div>
          <div class="asset-market-search-panel stock-search-panel" data-stock-search-panel>${renderStockSearchPanel()}</div>
        </div>
        <button class="stock-favorites-toggle ${favoritesOpen ? "active" : ""}" type="button" data-stock-favorites-toggle aria-label="관심 종목 목록" aria-expanded="${favoritesOpen ? "true" : "false"}">
          ${icon("star")}
          ${favoriteCount ? `<span>${favoriteCount}</span>` : ""}
        </button>
        ${favoritesOpen ? renderStockFavoritesDropdown() : ""}
      </div>
    </section>
  `;
}

function renderStockHero(selected) {
  const price = getStockAnalysisPriceMeta(selected);
  const change = getStockAnalysisChangeMeta(selected);
  const favorite = isStockAnalysisFavorite(selected);
  const marketLabel = getStockMarketLabel(selected);
  const metaText = [selected.industry || selected.type || "관심 종목", selected.exchange || selected.source || selected.market]
    .filter(Boolean)
    .join(" | ");

  return `
    <article class="panel stock-hero-panel">
      <div class="stock-hero">
        <div class="stock-name">
          <button class="stock-favorite ${favorite ? "active" : ""}" type="button" data-stock-favorite-toggle aria-label="${favorite ? "관심 종목 해제" : "관심 종목 등록"}" aria-pressed="${favorite ? "true" : "false"}">
            ${icon("star")}
          </button>
          <div class="stock-title-block">
            <div class="stock-title-row">
              <h2>${escapeChartText(selected.name)}</h2>
              <div class="stock-badges">
                ${selected.code ? `<span class="stock-code">${escapeChartText(selected.code)}</span>` : ""}
                <span class="stock-market">${escapeChartText(marketLabel)}</span>
              </div>
            </div>
            <p class="list-sub">${escapeChartText(metaText || "시장 데이터")} </p>
          </div>
        </div>
        <div class="price-block">
          <strong>${escapeChartText(price.text)}</strong>
          <p class="list-sub">전일 대비 <span class="${change.className}">${escapeChartText(change.text)}</span></p>
        </div>
      </div>
    </article>
  `;
}

function renderStockEmptyState() {
  return `
    <article class="panel stock-empty-state">
      <span class="status-icon">${icon("search")}</span>
      <h2>분석할 종목을 선택하세요.</h2>
      <p>위 검색창에서 종목명이나 코드를 검색한 뒤 결과를 선택하면 가격, 차트, 요약 정보가 표시됩니다.</p>
      <p class="list-sub">관심 종목에 별표를 추가하면 다음에 종목 분석 화면을 열 때 바로 불러옵니다.</p>
    </article>
  `;
}

function renderStock() {
  const selected = getStockAnalysisSelectedStock();

  if (!selected) {
    return `
      <div class="stock-layout stock-layout-empty">
        <div class="stock-main-grid">
          ${renderStockSearchToolbar()}
          ${renderStockEmptyState()}
        </div>
      </div>
    `;
  }

  return `
    <div class="stock-layout">
      <div class="stock-main-grid">
        ${renderStockSearchToolbar()}
        ${renderStockHero(selected)}

        <article class="panel">
          <div class="panel-header">
            <div class="segmented">
              ${typeof renderStockChartControls === "function" ? renderStockChartControls() : `<button class="active" type="button">일봉</button><button type="button">주봉</button><button type="button">월봉</button>`}
            </div>
          </div>
          <div class="legend"><span><i class="dot"></i>MA 5</span><span><i class="dot red"></i>MA 20</span><span><i class="dot green"></i>MA 60</span></div>
          ${typeof renderStockAnalysisCandleChart === "function" ? renderStockAnalysisCandleChart(selected) : candleChart(selected)}
        </article>

        <section class="bottom-grid">
          <article class="panel">
            <div class="panel-header tight"><h2 class="panel-title">재무 요약 <small>연결 IFRS</small></h2></div>
            ${renderTable(["항목", "2021", "2022", "2023", "2024(E)"], [
              ["매출액", "2,796,048", "3,022,314", "2,589,355", "2,956,102"],
              ["영업이익", "516,339", "433,766", "65,670", "312,984"],
              ["당기순이익", "399,074", "556,541", "154,871", "245,100"],
              ["영업이익률", "18.46%", "14.35%", "2.54%", "10.59%"],
              ["ROE", "17.29%", "16.34%", "4.24%", "7.19%"]
            ])}
            <p class="footer-note">단위: 억원 / 출처: FnGuide</p>
          </article>
          <article class="panel">
            <div class="panel-header tight"><h2 class="panel-title">기술적 지표</h2></div>
            ${renderTable(["지표", "값", "신호"], [
              ["이동평균 정배열", "정배열", `<span class="text-red">매수</span>`],
              ["RSI (14)", "61.32", "중립"],
              ["MACD", "1,215.45", `<span class="text-red">매수</span>`],
              ["스토캐스틱 (K)", "72.48", "중립"],
              ["볼린저 밴드", "상단 근접", `<span class="text-orange">주의</span>`]
            ])}
          </article>
        </section>

        <section class="bottom-grid">
          <article class="panel">
            <div class="panel-header tight"><h2 class="panel-title">투자 포인트</h2></div>
            <div class="list">
              ${["실시간 가격 흐름과 보유 여부를 함께 확인", "관심 종목 저장 후 빠른 재조회 가능", "주요 가격 변동과 리스크 요인 지속 점검", "매매 일지와 연결해 투자 판단 근거 축적"].map((text) => `
                <div class="list-row"><span class="status-icon green">${icon("target")}</span><p class="list-title">${text}</p><span></span></div>
              `).join("")}
            </div>
          </article>
          <article class="panel">
            <div class="panel-header tight"><h2 class="panel-title">리스크 요인</h2></div>
            <div class="list">
              ${["시장 데이터 제공 지연 가능성", "환율 변동에 따른 원화 평가금액 차이", "단기 변동성 확대 가능성", "기업 이벤트와 공시 확인 필요"].map((text) => `
                <div class="list-row"><span class="status-icon red">${icon("warning")}</span><p class="list-title">${text}</p><span></span></div>
              `).join("")}
            </div>
          </article>
        </section>
      </div>

      <aside class="side-card">
        ${renderStockWatchPanel()}

        <article class="panel">
          <div class="panel-header tight"><h2 class="panel-title">핵심 뉴스 요약</h2></div>
          <div class="list">
            ${typeof renderStockNewsRows === "function" ? renderStockNewsRows(selected) : ""}
          </div>
        </article>

        <article class="panel">
          <div class="panel-header tight"><h2 class="panel-title">애널리스트 메모</h2><button class="mini-action" type="button">${icon("edit")}</button></div>
          <p class="note-text">${escapeChartText(selected.name)}의 가격 흐름과 거래량 변화를 함께 확인하세요. 관심 종목에 추가하면 다른 기기에서도 같은 목록을 불러올 수 있습니다.</p>
          <p class="footer-note">작성일: 2026.06.26 / 작성자: Trading Note</p>
        </article>
      </aside>
    </div>
  `;
}
