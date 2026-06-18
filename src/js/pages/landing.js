var landingRevealObserver = null;

function setupLandingReveal() {
  const targets = document.querySelectorAll(".landing-reveal");
  if (!targets.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    targets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  if (landingRevealObserver) landingRevealObserver.disconnect();
  landingRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      landingRevealObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.16,
    rootMargin: "0px 0px -10% 0px"
  });

  targets.forEach((target) => landingRevealObserver.observe(target));
}

function renderLanding() {
  return `
    <div class="landing-page">
      <header class="landing-header">
        <button class="landing-brand" type="button" data-landing-scroll="landing" aria-label="Trading Note">
          <img src="src/resources/logo.png" alt="" />
          <span>Trading Note</span>
        </button>
        <nav class="landing-nav" aria-label="소개 메뉴">
          <button type="button" data-landing-scroll="landing-record">기록</button>
          <button type="button" data-landing-scroll="landing-dashboard">대시보드</button>
          <button type="button" data-landing-scroll="landing-insight">인사이트</button>
          <button class="landing-nav-cta" type="button" data-route="dashboard">대시보드 들어가기</button>
        </nav>
      </header>

      <section class="landing-hero" id="landing">
        <div class="landing-hero-copy landing-reveal">
          <p class="landing-kicker">Trading Journal for Better Decisions</p>
          <h1>기록이 쌓이면,<br />투자가 선명해집니다.</h1>
          <p>
            매매 일지, 자산 흐름, 보유 비중, 메모를 한 곳에서 정리하세요.
            오늘의 판단이 내일의 투자 원칙이 됩니다.
          </p>
          <div class="landing-hero-actions">
            <button class="landing-primary" type="button" data-route="dashboard">무료로 시작하기</button>
            <button class="landing-secondary" type="button" data-landing-scroll="landing-record">기능 둘러보기</button>
          </div>
        </div>

        <div class="landing-hero-scene landing-reveal" aria-hidden="true">
          <div class="landing-note-card">
            <span class="landing-card-tag">TODAY RECORD</span>
            <strong>삼성전자 분할 매수</strong>
            <p>계획 가격대 진입. 다음 저항선까지 보유.</p>
            <div class="landing-mini-table">
              <span>매수가</span><strong>81,500</strong>
              <span>수량</span><strong>10주</strong>
              <span>전략</span><strong>추세 추종</strong>
            </div>
          </div>
          <div class="landing-lens">
            <svg viewBox="0 0 240 150" role="img" aria-label="자산 추이 그래프">
              <path d="M8 128 C38 122 48 98 72 105 C92 111 103 76 130 82 C150 86 158 58 183 62 C205 65 210 42 232 36" />
              <circle cx="232" cy="36" r="6" />
            </svg>
            <span>+572.21%</span>
          </div>
          <div class="landing-float-chip chip-one">목표가 도달</div>
          <div class="landing-float-chip chip-two">매매 원칙 유지</div>
        </div>
      </section>

      <section class="landing-intro landing-section landing-reveal">
        <p class="landing-section-kicker">One Record, Better Decision</p>
        <h2>한 번의 기록이 다음 판단의 근거가 됩니다.</h2>
        <div class="landing-pill-row">
          <span>매매 일지</span>
          <span>자산 추이</span>
          <span>보유 비중</span>
          <span>투자 메모</span>
        </div>
      </section>

      <section class="landing-feature-band" id="landing-record">
        <div class="landing-section landing-reveal">
          <p class="landing-section-kicker">Record · Analyze · Review</p>
          <h2>투자의 전 과정을 하나의 흐름으로.</h2>
          <p class="landing-section-desc">기록하고, 확인하고, 되돌아보는 과정을 끊김 없이 이어갑니다.</p>
        </div>

        <div class="landing-feature-grid">
          ${[
            ["01 · RECORD", "투자 내역을 빠르게 기록", "종목, 가격, 수량, 전략, 메모까지 매매 직후 바로 남깁니다.", "journal"],
            ["02 · ANALYZE", "성과와 습관을 함께 분석", "수익률뿐 아니라 반복되는 판단과 전략의 흐름을 같이 봅니다.", "chart"],
            ["03 · REVIEW", "메모와 회고로 원칙 완성", "차트에 없던 생각까지 남겨 다음 투자 기준으로 바꿉니다.", "memo"]
          ].map(([kicker, title, desc, type]) => `
            <article class="landing-feature-card landing-reveal">
              <p>${kicker}</p>
              <h3>${title}</h3>
              <span>${desc}</span>
              <div class="landing-card-preview ${type}">
                <i></i><i></i><i></i>
              </div>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="landing-dashboard-section landing-section" id="landing-dashboard">
        <div class="landing-split-copy landing-reveal">
          <p class="landing-section-kicker">Own Dashboard</p>
          <h2>숫자와 판단의 맥락을<br />한 화면에서 확인하세요.</h2>
          <p>총자산, 보유 현금, 수익률, 포트폴리오 비중을 대시보드에서 빠르게 스캔합니다.</p>
        </div>
        <div class="landing-dashboard-mock landing-reveal" aria-label="Trading Note 대시보드 미리보기">
          <div class="landing-window-bar"><span></span><span></span><span></span></div>
          <div class="landing-mock-body">
            <aside>
              <b>TN</b>
              <span></span><span></span><span></span><span></span>
            </aside>
            <main>
              <div class="landing-metrics">
                <article><span>총자산</span><strong>85,448,250</strong></article>
                <article><span>평가손익</span><strong>+65,518,250</strong></article>
                <article><span>수익률</span><strong>+572.21%</strong></article>
              </div>
              <div class="landing-chart-panel">
                <svg viewBox="0 0 560 210">
                  <path class="area" d="M0 180 L0 148 C55 136 65 112 112 122 C158 134 167 65 220 74 C262 81 276 52 330 60 C378 67 405 34 448 42 C498 52 520 20 560 10 L560 180 Z" />
                  <path class="line" d="M0 148 C55 136 65 112 112 122 C158 134 167 65 220 74 C262 81 276 52 330 60 C378 67 405 34 448 42 C498 52 520 20 560 10" />
                </svg>
              </div>
              <div class="landing-donut-panel">
                <div class="landing-donut"></div>
                <div><span></span><span></span><span></span></div>
              </div>
            </main>
          </div>
        </div>
      </section>

      <section class="landing-note-section landing-section" id="landing-insight">
        <div class="landing-note-copy landing-reveal">
          <p class="landing-section-kicker">Think While Trading</p>
          <h2>숫자 뒤에 있던 생각까지 남기세요.</h2>
          <p>왜 샀는지, 무엇을 기다렸는지, 어떤 감정이 개입됐는지까지 기록하면 패턴이 보입니다.</p>
          <ul>
            <li>진입 근거와 목표가 기록</li>
            <li>감정, 실수, 개선점 회고</li>
            <li>반복되는 전략과 결과 추적</li>
          </ul>
        </div>
        <div class="landing-note-preview landing-reveal">
          <article>
            <span>S&P 500 ETF · 매수 노트</span>
            <h3>조정 구간 분할 매수</h3>
            <p>시장 변동성은 커졌지만 장기 추세는 유지. 현금 비중을 지키며 3회 분할 진입.</p>
            <div><b>원칙 준수</b><b>분할 매수</b><b>리스크 관리</b></div>
          </article>
          <aside>
            <span>이번 달 기록 완성도</span>
            <strong>78%</strong>
          </aside>
        </div>
      </section>

      <section class="landing-pattern-band">
        <div class="landing-section landing-reveal">
          <p class="landing-section-kicker">Your Investment Pattern</p>
          <h2>기록이 많아질수록 나만의 패턴이 선명해집니다.</h2>
        </div>
        <div class="landing-pattern-grid">
          <article class="landing-reveal">
            <span>Monthly Discipline</span>
            <div class="landing-heatmap">${Array.from({ length: 42 }, (_, index) => `<i class="${index % 7 === 0 || index % 11 === 0 ? "strong" : index % 4 === 0 ? "mid" : ""}"></i>`).join("")}</div>
          </article>
          <article class="landing-reveal">
            <span>Trade Consistency</span>
            <div class="landing-bars"><i></i><i></i><i></i><i></i><i></i></div>
          </article>
          <article class="landing-reveal">
            <span>Review Score</span>
            <div class="landing-score"><strong>78</strong></div>
          </article>
        </div>
      </section>

      <section class="landing-cta landing-reveal">
        <div>
          <p class="landing-section-kicker">Start Your Trading Journal</p>
          <h2>오늘의 한 줄이<br />내일의 투자 원칙이 됩니다.</h2>
          <p>지금 대시보드로 들어가 기록을 시작해보세요.</p>
        </div>
        <button class="landing-primary" type="button" data-route="dashboard">무료로 시작하기</button>
      </section>

      <footer class="landing-footer">
        <div class="landing-brand">
          <img src="src/resources/logo.png" alt="" />
          <span>Trading Note</span>
        </div>
        <p>Record better. Review clearer. Invest with your own rules.</p>
      </footer>
    </div>
  `;
}
