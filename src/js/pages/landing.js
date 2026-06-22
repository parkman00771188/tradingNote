var landingRevealObserver = null;

const landingAssetBase = "src/resources/assets";
const landingAssets = {
  logoWhite: `${landingAssetBase}/brand/tn_lockup_white.svg`,
  heroLens: `${landingAssetBase}/webp/2x/hero/hero_decision_lens@2x.webp`,
  dashboard: `${landingAssetBase}/webp/2x/dashboard/dashboard_browser@2x.webp`,
  journal: `${landingAssetBase}/webp/2x/journal/journal_composite@2x.webp`,
  cta: `${landingAssetBase}/webp/2x/cta/cta_composite@2x.webp`,
  features: {
    record: `${landingAssetBase}/webp/2x/feature/feature_record_visual@2x.webp`,
    analyze: `${landingAssetBase}/webp/2x/feature/feature_analyze_visual@2x.webp`,
    review: `${landingAssetBase}/webp/2x/feature/feature_review_visual@2x.webp`
  },
  insights: {
    heatmap: `${landingAssetBase}/webp/2x/insights/insight_monthly_consistency@2x.webp`,
    bars: `${landingAssetBase}/webp/2x/insights/insight_trade_frequency@2x.webp`,
    score: `${landingAssetBase}/webp/2x/insights/insight_rule_score@2x.webp`
  }
};

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

function landingImage(src, alt, className = "", loading = "lazy") {
  return `<img class="${className}" src="${src}" alt="${alt}" loading="${loading}" decoding="async">`;
}

function renderLanding() {
  const featureCards = [
    ["01 · RECORD", "투자 내역을 빠르게 기록", "종목, 금액, 수량, 매매 이유를 한 화면에서 정리합니다.", landingAssets.features.record],
    ["02 · ANALYZE", "성과와 습관을 함께 분석", "수익률, 자산 배분, 매매 빈도와 원칙 준수를 비교합니다.", landingAssets.features.analyze],
    ["03 · REVIEW", "메모와 회고로 원칙 완성", "잘된 판단과 반복되는 실수를 주간·월간으로 복기합니다.", landingAssets.features.review]
  ];
  const insightCards = [
    ["Monthly Consistency", "이번 달 기록 습관", "거래와 메모가 함께 남은 날을 확인합니다.", landingAssets.insights.heatmap],
    ["Trade Frequency", "주간 매매 흐름", "계획보다 잦아진 매매를 빠르게 봅니다.", landingAssets.insights.bars],
    ["Rule Score", "투자 원칙 준수", "미리 정한 기준을 실제로 지켰는지 점수화합니다.", landingAssets.insights.score]
  ];

  return `
    <div class="landing-page">
      <header class="landing-header">
        <button class="landing-brand" type="button" data-landing-scroll="landing" aria-label="Trading Note">
          <img src="${landingAssets.logoWhite}" alt="Trading Note">
        </button>
        <nav class="landing-nav" aria-label="소개 메뉴">
          <button type="button" data-landing-scroll="landing-record">서비스</button>
          <button type="button" data-landing-scroll="landing-dashboard">대시보드</button>
          <button type="button" data-landing-scroll="landing-insight">투자 노트</button>
          <button type="button" data-landing-scroll="landing-pattern">통계</button>
          <button class="landing-nav-cta" type="button" data-route="login">무료로 시작하기</button>
        </nav>
      </header>

      <section class="landing-hero" id="landing">
        <div class="landing-hero-copy landing-reveal">
          <p class="landing-pill"><span></span>Investment Journal & Analytics</p>
          <h1>기록이 쌓이면,<br>투자가 보입니다.</h1>
          <p class="landing-hero-desc">
            어디에 투자했는지부터 수익률·자산 배분·매매 이유와 회고까지.
            흩어진 투자 경험을 한 곳에 모아 다음 판단의 근거로 바꿔보세요.
          </p>
          <div class="landing-hero-actions">
            <button class="landing-primary" type="button" data-route="login">내 투자 기록 시작하기</button>
            <button class="landing-secondary" type="button" data-landing-scroll="landing-record">서비스 둘러보기</button>
          </div>
        </div>
        <div class="landing-hero-art landing-reveal" aria-hidden="true">
          ${landingImage(landingAssets.heroLens, "", "landing-hero-art-img", "eager")}
        </div>
      </section>

      <section class="landing-intro landing-section landing-reveal">
        <p class="landing-section-kicker">One Record, Better Decision</p>
        <h2>한 번의 기록이 다음 판단의 근거가 됩니다.</h2>
        <p class="landing-section-desc">투자 내역과 생각을 함께 남기고, 통계로 반복되는 습관을 확인하세요.</p>
        <div class="landing-pill-row">
          <span>투자 내역 기록</span>
          <span>포트폴리오 통계</span>
          <span>매매 일지·메모</span>
          <span>기간별 성과 분석</span>
        </div>
      </section>

      <section class="landing-feature-band" id="landing-record">
        <div class="landing-section landing-reveal">
          <p class="landing-section-kicker">Record · Analyze · Review</p>
          <h2>투자의 전 과정을 하나의 흐름으로.</h2>
          <p class="landing-section-desc">거래 숫자만 저장하지 않습니다. 선택한 이유, 그때의 생각, 이후의 결과까지 연결해 나만의 투자 데이터로 만듭니다.</p>
        </div>
        <div class="landing-feature-grid">
          ${featureCards.map(([kicker, title, desc, image], index) => `
            <article class="landing-feature-card landing-reveal" style="--reveal-delay:${index * 90}ms">
              <p>${kicker}</p>
              <h3>${title}</h3>
              <span>${desc}</span>
              <div class="landing-feature-visual">${landingImage(image, "", "")}</div>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="landing-dashboard-band" id="landing-dashboard">
        <div class="landing-section landing-dashboard-layout">
          <div class="landing-split-copy landing-reveal">
            <p class="landing-section-kicker">One Dashboard</p>
            <h2>숫자와 판단의 맥락을<br>한 화면에서 확인하세요.</h2>
            <p class="landing-section-desc">보유 자산만 보여주는 대시보드가 아닙니다. 성과가 만들어진 과정과 기록한 생각을 나란히 비교해 더 나은 다음 행동을 찾습니다.</p>
          </div>
          <div class="landing-dashboard-preview landing-reveal">
            ${landingImage(landingAssets.dashboard, "Trading Note 대시보드 미리보기", "")}
          </div>
        </div>
      </section>

      <section class="landing-journal-band" id="landing-insight">
        <div class="landing-section landing-journal-layout">
          <div class="landing-journal-copy landing-reveal">
            <p class="landing-section-kicker">The Reason Behind The Trade</p>
            <h2>숫자 뒤에 있던<br>생각까지 남기세요.</h2>
            <p class="landing-section-desc">왜 샀는지, 무엇을 기대했는지, 어떤 위험을 감수했는지 적어두면 결과가 달라도 배울 것이 남습니다.</p>
            <div class="landing-step-list">
              <span><b>01</b> 매매 이유 기록</span>
              <span><b>02</b> 감정과 리스크 체크</span>
              <span><b>03</b> 결과와 비교해 회고</span>
            </div>
          </div>
          <div class="landing-journal-preview landing-reveal">
            ${landingImage(landingAssets.journal, "투자 노트와 기록 인사이트 미리보기", "")}
          </div>
        </div>
      </section>

      <section class="landing-pattern-band" id="landing-pattern">
        <div class="landing-section landing-reveal">
          <p class="landing-section-kicker">Your Investment Pattern</p>
          <h2>기록이 많아질수록 나만의 패턴이 선명해집니다.</h2>
          <p class="landing-section-desc">성과뿐 아니라 행동과 감정의 반복을 수치로 확인해 개선할 한 가지를 찾습니다.</p>
        </div>
        <div class="landing-insight-grid">
          ${insightCards.map(([kicker, title, desc, image], index) => `
            <article class="landing-insight-card landing-reveal" style="--reveal-delay:${index * 90}ms">
              <p>${kicker}</p>
              <h3>${title}</h3>
              <span>${desc}</span>
              ${landingImage(image, "", "")}
            </article>
          `).join("")}
        </div>
      </section>

      <section class="landing-cta landing-reveal">
        <div class="landing-cta-copy">
          <p class="landing-section-kicker">Start Your Trading Journal</p>
          <h2>오늘의 한 줄이<br>내일의 투자 원칙이 됩니다.</h2>
          <p>복잡한 설정 없이 첫 투자 기록부터 시작하세요. 내 선택을 가장 잘 아는 투자 데이터가 쌓입니다.</p>
          <div class="landing-cta-actions">
            <button class="landing-primary" type="button" data-route="login">무료로 시작하기</button>
            <button class="landing-secondary" type="button" data-landing-scroll="landing-record">기능 살펴보기</button>
          </div>
        </div>
        <div class="landing-cta-art" aria-hidden="true">
          ${landingImage(landingAssets.cta, "", "")}
        </div>
      </section>

      <footer class="landing-footer">
        <div class="landing-footer-inner">
          <div>
            <img src="${landingAssets.logoWhite}" alt="Trading Note">
          </div>
          <nav aria-label="하단 메뉴">
            <button type="button" data-landing-scroll="landing-record">투자 기록</button>
            <button type="button" data-landing-scroll="landing-dashboard">통계 분석</button>
            <button type="button" data-landing-scroll="landing-insight">투자 노트</button>
            <button type="button" data-route="login">대시보드</button>
          </nav>
        </div>
      </footer>
    </div>
  `;
}
