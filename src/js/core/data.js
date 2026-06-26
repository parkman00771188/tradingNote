const navItems = [
  { id: "dashboard", label: "대시보드", icon: "home" },
  { id: "journal", label: "매매 일지", icon: "journal" },
  { id: "stock", label: "종목 분석", icon: "chart" },
  { id: "performance", label: "성과 분석", icon: "performance" },
  { id: "assets", label: "자산 현황", icon: "wallet" },
  { id: "memo", label: "메모", icon: "memo" },
  { id: "calendar", label: "캘린더", icon: "calendar" },
  { id: "settings", label: "설정", icon: "settings" }
];

const pageMeta = {
  login: {
    title: "간편 로그인",
    description: "소셜 계정으로 빠르고 안전하게 로그인하세요."
  },
  dashboard: {
    title: "대시보드",
    description: "오늘의 투자 흐름과 주요 성과를 한눈에 확인하세요."
  },
  journal: {
    title: "매매 일지",
    description: "나의 모든 매매 기록을 확인하고 분석해보세요."
  },
  journalWrite: {
    title: "매매 일지 작성",
    description: "거래 정보, 투자 아이디어, 감정 기록을 빠짐없이 남겨보세요."
  },
  stock: {
    title: "종목 분석",
    description: "관심 종목의 가격, 재무, 뉴스, 리스크를 함께 점검하세요."
  },
  performance: {
    title: "성과 분석",
    description: "수익률, 승률, 전략별 성과를 비교하며 매매 습관을 개선하세요."
  },
  assets: {
    title: "자산 현황",
    description: "보유 자산과 손익, 비중을 한 화면에서 확인하세요."
  },
  memo: {
    title: "메모",
    description: "생각을 정리하고, 복기하며 더 나은 매매로 이어가세요."
  },
  calendar: {
    title: "캘린더",
    description: "월간 손익과 예정 이벤트를 날짜별로 확인하세요."
  },
  settings: {
    title: "설정",
    description: "계정, 알림, 태그, 표시 방식을 원하는 형태로 조정하세요."
  }
};

const trades = [
  ["06/20", "삼성전자", "매수", "10", "81,500", "-", "-", "-", "추세 추종", "반도체 수급 개선 기대"],
  ["06/20", "SK하이닉스", "매도", "5", "128,000", "130,500", "+12,500", "+1.95%", "단기 스윙", "목표가 도달"],
  ["06/19", "NAVER", "매수", "10", "201,500", "-", "-", "-", "중장기 투자", "광고 회복 모멘텀"],
  ["06/19", "카카오", "매도", "5", "57,700", "59,800", "+2,100", "+3.64%", "단기 스윙", "단기 반등 매도"],
  ["06/18", "현대차", "매수", "5", "168,000", "-", "-", "-", "가치 투자", "배당 매력 부각"],
  ["06/18", "삼성전자", "매도", "10", "78,500", "81,200", "+27,000", "+3.44%", "추세 추종", "단기 목표가 도달"],
  ["06/17", "LG에너지솔루션", "매수", "5", "385,000", "-", "-", "-", "중장기 투자", "2차전지 회복 기대"],
  ["06/17", "카카오", "매수", "10", "52,100", "-", "-", "-", "단기 스윙", "기술적 반등 구간"],
  ["06/14", "한미반도체", "매수", "8", "148,600", "-", "-", "-", "추세 추종", "HBM 장비 수요 확대"],
  ["06/14", "기아", "매도", "12", "115,200", "118,400", "+38,400", "+2.78%", "가치 투자", "목표 수익 구간"],
  ["06/13", "셀트리온", "매수", "6", "181,700", "-", "-", "-", "중장기 투자", "바이오시밀러 성장 기대"],
  ["06/12", "삼성SDI", "매도", "3", "392,000", "387,000", "-15,000", "-1.28%", "리스크 관리", "손절 기준 도달"],
  ["06/12", "NAVER", "매도", "4", "205,000", "210,000", "+20,000", "+2.44%", "단기 스윙", "단기 반등 수익 실현"],
  ["06/11", "현대차", "매수", "4", "246,000", "-", "-", "-", "가치 투자", "외국인 수급 개선"],
  ["06/10", "SK하이닉스", "매수", "3", "184,500", "-", "-", "-", "추세 추종", "신고가 돌파 관찰"],
  ["06/10", "카카오", "매도", "8", "53,600", "52,100", "-12,000", "-2.80%", "리스크 관리", "지지선 이탈"],
  ["06/07", "삼성전자", "매도", "7", "79,800", "82,400", "+18,200", "+3.26%", "추세 추종", "분할 익절"],
  ["06/07", "LG에너지솔루션", "매도", "2", "394,000", "389,000", "-10,000", "-1.27%", "리스크 관리", "단기 약세 전환"],
  ["06/05", "기아", "매수", "10", "113,000", "-", "-", "-", "가치 투자", "저평가 구간 진입"],
  ["06/04", "한미반도체", "매도", "5", "141,000", "148,600", "+38,000", "+5.39%", "단기 스윙", "강한 모멘텀 수익 실현"],
  ["06/03", "NAVER", "매도", "5", "206,000", "214,000", "+40,000", "+3.88%", "단기 스윙", "검색 광고 회복 기대 반영"],
  ["06/03", "현대차", "매도", "3", "247,000", "244,500", "-7,500", "-1.01%", "리스크 관리", "단기 변동성 확대"],
  ["06/02", "삼성전자", "매수", "12", "76,800", "-", "-", "-", "추세 추종", "외국인 순매수 재개"],
  ["06/01", "SK하이닉스", "매도", "2", "180,000", "184,000", "+8,000", "+2.22%", "단기 스윙", "저항 구간 분할 매도"]
];

const holdings = [
  ["삼성전자", "50", "4,125,000", "+375,000", "+10.00%", "9.0%"],
  ["SK하이닉스", "20", "2,560,000", "+160,000", "+6.67%", "5.6%"],
  ["네이버", "10", "2,045,000", "+145,000", "+7.64%", "4.5%"],
  ["카카오", "15", "1,725,000", "-75,000", "-4.17%", "3.8%"],
  ["현대차", "10", "1,680,000", "+80,000", "+5.00%", "3.7%"]
];

const watchList = [
  ["삼성전자", "005930", "346,500", "+1.02%", "+3,500"],
  ["SK하이닉스", "000660", "2,521,000", "+5.84%", "+139,000"],
  ["NAVER", "035420", "243,500", "+0.62%", "+1,500"],
  ["카카오", "035720", "40,550", "+0.25%", "+100"],
  ["현대차", "005380", "618,000", "-3.44%", "-22,000"],
  ["LG에너지솔루션", "373220", "416,000", "+1.34%", "+5,500"],
  ["한미반도체", "042700", "319,500", "-2.74%", "-9,000"],
  ["삼성SDI", "006400", "550,000", "+0.18%", "+1,000"],
  ["기아", "000270", "166,300", "-2.29%", "-3,900"],
  ["셀트리온", "068270", "174,600", "+0.06%", "+100"]
];

const stockAliases = {
  네이버: ["NAVER"],
  NAVER: ["네이버"]
};

function normalizeStockKey(value) {
  return String(value || "").replace(/\s+/g, "").toLowerCase();
}

function getStockCandidates(name, code = "") {
  return [name, code, ...(stockAliases[name] || [])].filter(Boolean);
}

function parseMarketNumber(value) {
  return Number(String(value || "").replace(/[^0-9]/g, "")) || 0;
}

function parseSignedMarketNumber(value) {
  const text = String(value || "").trim();
  const sign = text.startsWith("-") ? -1 : 1;
  return sign * parseMarketNumber(text);
}

function formatMarketNumber(value) {
  return Math.round(Number(value) || 0).toLocaleString();
}

function formatSignedMarketNumber(value) {
  const amount = Math.round(Number(value) || 0);
  const sign = amount >= 0 ? "+" : "-";
  return `${sign}${Math.abs(amount).toLocaleString()}`;
}

function formatSignedRate(value) {
  const rate = Number(value) || 0;
  const sign = rate >= 0 ? "+" : "-";
  return `${sign}${Math.abs(rate).toFixed(2)}%`;
}

function stockMatches(name, code, queryName, queryCode = "") {
  const queries = getStockCandidates(queryName, queryCode).map(normalizeStockKey);
  return getStockCandidates(name, code)
    .map(normalizeStockKey)
    .some((candidate) => queries.includes(candidate));
}

function findWatchListRow(name, code = "") {
  return watchList.find(([watchName, watchCode]) => stockMatches(watchName, watchCode, name, code)) || null;
}

function isStoredAssetLogoUrl(value) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

function getWatchStock(name, code = "") {
  const row = findWatchListRow(name, code);
  if (!row) return null;
  const storedLogoOrCurrency = row[10] || "";
  const hasStoredLogo = isStoredAssetLogoUrl(storedLogoOrCurrency);

  return {
    name: row[0],
    code: row[1],
    price: parseMarketNumber(row[2]),
    priceText: row[2],
    rate: row[3],
    change: row[4] || "",
    type: row[5] || "",
    quoteType: row[6] || "",
    market: row[7] || "",
    exchange: row[8] || "",
    source: row[9] || "",
    logoUrl: hasStoredLogo ? storedLogoOrCurrency : "",
    currency: hasStoredLogo ? row[11] || "" : storedLogoOrCurrency,
    marketPrice: Number(hasStoredLogo ? row[12] : row[11]) || 0,
    exchangeRateToKrw: Number(hasStoredLogo ? row[13] : row[12]) || 0,
    priceDisplayCurrency: hasStoredLogo ? row[14] || "" : row[13] || ""
  };
}

function getHoldingData() {
  const rows = holdings.map((holdingRow) => {
    const [
      name,
      quantityText,
      amountText,
      profitText,
      ,
      ,
      storedCode,
      storedType,
      storedQuoteType,
      storedMarket,
      storedExchange,
      storedSource,
      storedLogoOrCurrency,
      storedCurrencyOrMarketPrice,
      storedMarketPriceOrExchangeRate,
      storedExchangeRateOrPriceDisplay,
      storedPriceDisplayCurrencyNew
    ] = holdingRow;
    const hasStoredLogo = isStoredAssetLogoUrl(storedLogoOrCurrency);
    const storedLogoUrl = hasStoredLogo ? storedLogoOrCurrency : "";
    const storedCurrency = hasStoredLogo ? storedCurrencyOrMarketPrice : storedLogoOrCurrency;
    const storedMarketPrice = hasStoredLogo ? storedMarketPriceOrExchangeRate : storedCurrencyOrMarketPrice;
    const storedExchangeRateToKrw = hasStoredLogo ? storedExchangeRateOrPriceDisplay : storedMarketPriceOrExchangeRate;
    const storedPriceDisplayCurrency = hasStoredLogo ? storedPriceDisplayCurrencyNew : storedExchangeRateOrPriceDisplay;
    const quantity = parseMarketNumber(quantityText);
    const previousAmount = parseMarketNumber(amountText);
    const previousProfit = parseSignedMarketNumber(profitText);
    const costBasis = Math.max(0, previousAmount - previousProfit);
    const watch = getWatchStock(name, storedCode);
    const currentPrice = watch && watch.price ? watch.price : Math.round(previousAmount / Math.max(1, quantity));
    const currentAmount = currentPrice * quantity;
    const profit = currentAmount - costBasis;
    const rate = costBasis ? (profit / costBasis) * 100 : 0;

    return {
      name,
      code: storedCode || (watch ? watch.code : ""),
      type: storedType || watch?.type || "",
      quoteType: storedQuoteType || watch?.quoteType || "",
      market: storedMarket || watch?.market || "",
      exchange: storedExchange || watch?.exchange || "",
      source: storedSource || watch?.source || "",
      logoUrl: storedLogoUrl || watch?.logoUrl || "",
      currency: storedCurrency || watch?.currency || "",
      marketPrice: Number(storedMarketPrice || watch?.marketPrice || 0),
      exchangeRateToKrw: Number(storedExchangeRateToKrw || watch?.exchangeRateToKrw || 0),
      priceDisplayCurrency: storedPriceDisplayCurrency || watch?.priceDisplayCurrency || "",
      quantity,
      averagePrice: quantity ? Math.round(costBasis / quantity) : 0,
      currentPrice,
      amount: currentAmount,
      costBasis,
      profit,
      rate
    };
  });
  const totalAmount = rows.reduce((sum, item) => sum + item.amount, 0);

  return rows.map((item) => ({
    ...item,
    weight: totalAmount ? (item.amount / totalAmount) * 100 : 0
  }));
}

function getHoldingRows() {
  return getHoldingData().map((item) => [
    item.name,
    formatMarketNumber(item.quantity),
    formatMarketNumber(item.amount),
    formatSignedMarketNumber(item.profit),
    formatSignedRate(item.rate),
    `${item.weight.toFixed(1)}%`
  ]);
}

function getHoldingDetailRows() {
  return getHoldingData().map((item) => [
    item.name,
    formatMarketNumber(item.quantity),
    formatMarketNumber(item.averagePrice),
    formatMarketNumber(item.currentPrice),
    formatSignedMarketNumber(item.profit),
    formatSignedRate(item.rate),
    `${item.weight.toFixed(1)}%`
  ]);
}

function getHoldingTotalValue() {
  return getHoldingData().reduce((sum, item) => sum + item.amount, 0);
}

function getHoldingTotalCostBasis() {
  return getHoldingData().reduce((sum, item) => sum + item.costBasis, 0);
}

function getHoldingTotalProfit() {
  return getHoldingData().reduce((sum, item) => sum + item.profit, 0);
}

function getHoldingTotalReturn() {
  const costBasis = getHoldingTotalCostBasis();
  return costBasis ? (getHoldingTotalProfit() / costBasis) * 100 : 0;
}

function getHoldingDailyChange() {
  return getHoldingData().reduce((sum, item) => {
    const watch = getWatchStock(item.name, item.code);
    return sum + (watch ? parseSignedMarketNumber(watch.change) * item.quantity : 0);
  }, 0);
}

function getHoldingDailyChangeRate() {
  const currentValue = getHoldingTotalValue();
  const dailyChange = getHoldingDailyChange();
  const previousValue = currentValue - dailyChange;
  return previousValue ? (dailyChange / previousValue) * 100 : 0;
}
