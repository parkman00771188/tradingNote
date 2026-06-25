function renderStockWatchRows() {
  return watchList.slice(0, 10).map(([name, code, price, rate], index) => {
    return `
      <tr>
        <td>${index === 0 ? `<span class="text-blue">${icon("star")}</span>` : `<span class="muted">${icon("star")}</span>`} ${name} <span class="tiny">${code}</span></td>
        <td>${price}</td>
        <td class="${rate.startsWith("+") ? "text-red" : "text-blue"}">${rate}</td>
      </tr>
    `;
  }).join("");
}

function renderStock() {
  if (typeof watchList !== "undefined" && !watchList.length) {
    return `
      <div class="stack">
        <article class="panel empty-state">
          <span class="status-icon">${icon("chart")}</span>
          <div>
            <strong>종목 데이터가 없습니다.</strong>
            <p>자산 설정에서 보유 종목을 저장하면 이 계정의 종목 정보가 표시됩니다.</p>
          </div>
          <button class="btn primary" type="button" data-modal="assetSettings">${icon("plus")}자산 설정</button>
        </article>
      </div>
    `;
  }
  const heroStock = typeof getWatchStock === "function" ? getWatchStock("삼성전자", "005930") : null;
  const heroPrice = heroStock ? heroStock.priceText : "346,500";
  const heroChange = heroStock && heroStock.change ? `${heroStock.change} (${heroStock.rate})` : "+3,500 (+1.02%)";
  const heroChangeClass = heroChange.startsWith("+") ? "text-red" : "text-blue";

  return `
    <div class="stock-layout">
      <div class="stock-main-grid">
        <section class="toolbar stock-search-toolbar">
          <div class="field"><div class="input-with-icon"><input class="input stock-search-input" placeholder="종목 검색 (종목명 또는 코드 입력)" value=""><span class="field-icon">${icon("search")}</span></div></div>
        </section>
        <article class="panel stock-hero-panel">
          <div class="stock-hero">
            <div class="stock-name">
              <button class="stock-favorite" type="button" aria-label="관심 종목 등록">${icon("star")}</button>
              <div class="stock-title-block">
                <div class="stock-title-row">
                  <h2>삼성전자</h2>
                  <div class="stock-badges">
                    <span class="stock-code">005930</span>
                    <span class="stock-market">코스피</span>
                  </div>
                </div>
                <p class="list-sub">전자제품 <span>|</span> 시가총액 2,025.74조</p>
              </div>
            </div>
            <div class="price-block">
              <strong>${heroPrice}원</strong>
              <p class="list-sub">전일 대비 <span class="${heroChangeClass}">${heroChange}</span></p>
            </div>
          </div>
        </article>

        <article class="panel">
          <div class="panel-header">
            <div class="segmented">
              <button class="active" type="button">일봉</button><button type="button">주봉</button><button type="button">월봉</button>
              <button type="button">1분</button><button type="button">5분</button><button type="button">15분</button><button type="button">30분</button><button type="button">60분</button>
            </div>
          </div>
          <div class="legend"><span><i class="dot"></i>MA 5</span><span><i class="dot red"></i>MA 20</span><span><i class="dot green"></i>MA 60</span></div>
          ${candleChart()}
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
              ${["AI 반도체 수요 증가에 따른 메모리 사업 경쟁력 지속", "HBM 및 고부가 제품 중심 믹스 개선", "파운드리 고객 다변화 및 수익성 개선 기대", "견조한 재무구조와 현금흐름 바탕의 주주환원 정책"].map((text) => `
                <div class="list-row"><span class="status-icon green">${icon("target")}</span><p class="list-title">${text}</p><span></span></div>
              `).join("")}
            </div>
          </article>
          <article class="panel">
            <div class="panel-header tight"><h2 class="panel-title">리스크 요인</h2></div>
            <div class="list">
              ${["글로벌 경기 둔화에 따른 IT 수요 감소 우려", "미·중 반도체 규제 리스크 지속", "메모리 가격 변동성 확대 가능성", "파운드리 수율 및 기술 경쟁 심화"].map((text) => `
                <div class="list-row"><span class="status-icon red">${icon("warning")}</span><p class="list-title">${text}</p><span></span></div>
              `).join("")}
            </div>
          </article>
        </section>
      </div>

      <aside class="side-card">
        <article class="panel watchlist-panel">
          <div class="panel-header"><h2 class="panel-title">관심 종목</h2><button class="mini-action" type="button">${icon("plus")}</button></div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>종목명</th><th>현재가</th><th>등락률</th></tr></thead>
              <tbody>${renderStockWatchRows()}</tbody>
            </table>
          </div>
        </article>

        <article class="panel">
          <div class="panel-header tight"><h2 class="panel-title">핵심 뉴스 요약</h2></div>
          <div class="list">
            ${[
              ["삼성전자, 2분기 반도체 실적 개선 기대", "06/19"],
              ["HBM 공급 확대...AI 시장 점유율 강화", "06/18"],
              ["파운드리 수주 회복 움직임 가시화", "06/17"],
              ["갤럭시 신제품 흥행...스마트폰 점유율 회복", "06/16"],
              ["증권사 목표가 상향 조정 잇따라", "06/15"]
            ].map(([title, date]) => `<div class="list-row news-row"><p class="news-title">${title}</p><span class="tiny">${date}</span></div>`).join("")}
          </div>
        </article>

        <article class="panel">
          <div class="panel-header tight"><h2 class="panel-title">애널리스트 메모</h2><button class="mini-action" type="button">${icon("edit")}</button></div>
          <p class="note-text">메모리 업황 회복과 HBM 확대 수혜가 기대됩니다. 단기적으로는 주가 변동성 확대 가능성은 있으나 중장기 관점에서 우상향 흐름 유지를 주요 판단합니다.</p>
          <p class="footer-note">작성일: 2024.06.20 / 작성자: Analyst J</p>
        </article>
      </aside>
    </div>
  `;
}
