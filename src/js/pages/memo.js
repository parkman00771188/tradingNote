function renderMemo() {
  const notes = [
    ["2024.06.20 (목)", "장 마감 복기", ["복기", "일지", "감정"], "오늘은 장중 변동성이 컸던 하루였다. 오전에 매수한 종목이 오후에 큰 조정을 받아 손절을 고려했지만, 계획대로 대응하며 리스크를...", "+125,000원"],
    ["2024.06.19 (수)", "이번 주 실수", ["실수", "복기", "전략"], "이번 주 반복된 실수들을 정리해보자. 1. 추격 매수 2. 손절 기준 미준수 3. 뉴스에 과도한 반응...", "-78,000원"],
    ["2024.06.18 (화)", "종목 아이디어", ["아이디어", "관심종목", "성장주"], "반도체 장비 섹터에 관심. AI 투자확대와 함께 수혜 기대. 한미반도체 HBM 장비 수요 증가...", ""],
    ["2024.06.17 (월)", "시장 체크포인트", ["시장", "매크로", "체크리스트"], "이번 주 시장 체크포인트 · FOMC 결과 확인 · 엔비디아 실적 · 원/달러 환율 흐름...", ""],
    ["2024.06.16 (일)", "감정 복기", ["감정", "심리", "복기"], "손실 후 조급함을 느꼈던 순간이 있었다. 감정이 매매에 영향을 주지 않도록 명상과 루틴을...", "-32,000원"],
    ["2024.06.15 (토)", "매매 계획", ["계획", "전략", "루틴"], "다음 주 매매 계획 · 보유 종목 점검 · 신규 진입 조건 설정 · 리스크 관리 강화...", "+300,000원"]
  ];
  return `
    <div class="stack">
      <section class="toolbar memo-toolbar">
        <div class="field"><div class="input-with-icon"><input class="input" placeholder="메모 검색..."><span class="field-icon">${icon("search")}</span></div></div>
        <div class="field"><select class="select"><option>태그 필터</option></select></div>
        <div class="field"><select class="select"><option>전체 기간</option></select></div>
        <button class="btn primary" type="button">${icon("plus")}새 메모 작성</button>
      </section>

      <section class="memo-layout">
        <div>
          <div class="panel-header"><h2 class="panel-title">내 메모</h2></div>
          <div class="memo-grid">
            ${notes.map(([date, title, tags, body, profit], index) => `
              <article class="note-card ${index === 0 ? "active" : ""}">
                <div class="note-head">
                  <span class="tiny">${date} ${icon("pin")}</span>
                  <button class="menu-dots" type="button">${index % 2 ? icon("more") : icon("pin")}</button>
                </div>
                <h3 class="note-title">${title}</h3>
                <div class="tag-cloud">${tags.map((item) => tag(item, toneForTag(item))).join("")}</div>
                <p class="note-text">${body}</p>
                ${profit ? `<p>${profit.startsWith("+") ? "목표 손익" : "손익"} · <span class="${profit.startsWith("+") ? "text-red" : "text-blue"}">${profit}</span></p>` : `<p class="stars">★ ★ ★ ★ ☆</p>`}
              </article>
            `).join("")}
          </div>
        </div>

        <article class="panel">
          <div class="panel-header">
            <div><p class="tiny">2024.06.20 (목) 10:45 ${icon("pin")}</p><h2 class="panel-title">장 마감 복기</h2></div>
            <button class="menu-dots" type="button">${icon("more")}</button>
          </div>
          <div class="panel-header tight">
            <div class="tag-cloud">${["복기", "일지", "감정"].map((item) => tag(item, toneForTag(item))).join("")}</div>
            <strong>손익 <span class="text-red">+125,000원</span></strong>
          </div>
          <div class="note-detail-body">
            <p>오늘은 장중 변동성이 컸던 하루였다. 오전에 매수한 종목이 오후에 큰 조정을 받아 손절을 고려했지만, 계획대로 대응하며 리스크를 최소화할 수 있었다.</p>
            <div>
              <h3>오늘의 핵심 포인트</h3>
              <div class="check-list">
                <span class="check-row"><span class="check-box">✓</span>매매 계획 준수</span>
                <span class="check-row"><span class="check-box">✓</span>손절 라인 지키기</span>
                <span class="check-row"><span class="check-box">✓</span>감정 통제 유지</span>
                <span class="check-row"><span class="check-box empty"></span>수익 실현 타이밍 아쉬움</span>
              </div>
            </div>
            <div><h3>배운 점</h3><p>시장이 흔들릴 때일수록 원칙이 중요하다. 욕심을 줄이고 리스크 관리를 우선하자.</p></div>
            <div><h3>다음에 개선할 점</h3><p>분할 매도 전략을 더 연습하고, 수익 실현 목표를 구체화할 것.</p></div>
            <div class="related-trade">
              <p class="tiny">관련 매매</p>
              <div class="panel-header tight"><strong>현대차</strong><strong class="text-red">+42,500원</strong></div>
              <p class="list-sub">06/20 15:30 · 매수 후 익일 매도</p>
            </div>
          </div>
        </article>

        <aside class="side-card">
          <article class="panel">
            <div class="panel-header"><h2 class="panel-title">자주 사용하는 태그</h2><button class="mini-action" type="button">${icon("edit")}</button></div>
            <div class="tag-cloud">
              ${[
                ["복기", 24],
                ["전략", 18],
                ["실수", 14],
                ["아이디어", 12],
                ["시장", 10],
                ["감정", 9],
                ["계획", 8],
                ["관심종목", 7]
              ].map(([name, count]) => `<span>${tag(name, toneForTag(name))} <strong>${count}</strong></span>`).join("")}
            </div>
            <button class="btn ghost full" type="button">모든 태그 보기 ${icon("chevronRight")}</button>
          </article>
          <article class="panel">
            <div class="panel-header"><h2 class="panel-title">최근 복기</h2><button class="btn ghost" type="button">더보기 ${icon("chevronRight")}</button></div>
            <div class="list">
              ${notes.slice(1, 5).map(([date, title, tags, body, profit]) => `
                <div class="list-row"><div><p class="list-sub">${date}</p><p class="list-title">${title}</p></div><span class="${profit.startsWith("+") ? "text-red" : profit.startsWith("-") ? "text-blue" : ""}">${profit || tag(tags[0], toneForTag(tags[0]))}</span></div>
              `).join("")}
            </div>
            <button class="btn ghost full" type="button">모든 복기 보기 ${icon("chevronRight")}</button>
          </article>
        </aside>
      </section>
    </div>
  `;
}
