function icon(name) {
  return icons[name] || icons.info;
}

function hydrateIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((node) => {
    node.innerHTML = icon(node.dataset.icon);
  });
}

function toneForStrategy(strategy) {
  if (strategy.includes("추세")) return "blue";
  if (strategy.includes("단기")) return "green";
  if (strategy.includes("중장기")) return "purple";
  if (strategy.includes("가치")) return "orange";
  return "";
}

function toneForTag(tag) {
  const map = {
    복기: "blue",
    일지: "blue",
    감정: "purple",
    실수: "red",
    아이디어: "green",
    시장: "cyan",
    전략: "blue",
    관심종목: "orange",
    계획: "",
    성장주: "green",
    가치주: "blue",
    배당주: "orange",
    ETF: "cyan"
  };
  return map[tag] || "";
}

function metricCard({
  title,
  value,
  sub = "",
  iconName,
  tone = "blue",
  valueClass = "",
  info = false,
  className = "",
  iconPosition = "end"
}) {
  const titleMarkup = `<p class="metric-title">${title}${info ? `<span class="tiny">${icon("info")}</span>` : ""}</p>`;
  const iconMarkup = `<span class="metric-icon ${tone}">${icon(iconName)}</span>`;

  return `
    <article class="metric-card ${className}">
      <div class="metric-head">
        ${iconPosition === "start" ? `${iconMarkup}${titleMarkup}` : `${titleMarkup}${iconMarkup}`}
      </div>
      <p class="metric-value ${valueClass}" data-fit-value data-fit-min="15">${value}</p>
      ${sub ? `<p class="metric-sub">${sub}</p>` : ""}
    </article>
  `;
}

function tag(text, tone = "") {
  return `<span class="tag ${tone}">${text}</span>`;
}

function renderNav(currentRoute) {
  const nav = document.querySelector("#navList");
  const mobileMoreActive = ["memo", "calendar", "settings", "performance"].includes(currentRoute);
  nav.innerHTML =
    navItems
    .map((item) => {
      const active = currentRoute === item.id || (currentRoute === "journalWrite" && item.id === "journal");
      return `
        <button class="nav-link ${active ? "active" : ""}" type="button" data-route="${item.id}">
          <span class="nav-icon">${icon(item.icon)}</span>
          <span>${item.label}</span>
        </button>
      `;
    })
    .join("") +
    `
      <button class="nav-link mobile-more-tab ${mobileMoreActive ? "active" : ""}" type="button" data-mobile-more>
        <span class="nav-icon">${icon("more")}</span>
        <span>더보기</span>
      </button>
    `;
}

function renderPageActions(route) {
  const actions = document.querySelector("#pageActions");
  const actionMap = {
    dashboard: "",
    journal: `<button class="btn primary" type="button" data-modal="journalWrite">${icon("edit")}매매 기록 작성</button>`,
    journalWrite: `<button class="btn ghost" type="button" data-route="journal">${icon("chevronLeft")}목록으로</button>`,
    memo: `<button class="btn primary" type="button">${icon("plus")}새 메모 작성</button>`,
    stock: "",
    performance: `<button class="btn" type="button">${icon("calendar")}전체 기간</button>`,
    assets: `<button class="btn ghost" type="button">${icon("upload")}내보내기</button><button class="btn primary asset-cash-action" type="button" data-modal="assetCash">${icon("wallet")}입/출금</button>`,
    calendar: "",
    settings: ""
  };
  actions.innerHTML = actionMap[route] || "";
}
