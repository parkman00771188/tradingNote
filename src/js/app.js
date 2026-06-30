const renderers = {
  landing: renderLanding,
  login: renderLogin,
  dashboard: renderDashboard,
  journal: renderJournal,
  journalWrite: renderJournalWrite,
  stock: renderStock,
  performance: renderPerformance,
  assets: renderAssets,
  memo: renderMemo,
  calendar: renderCalendar,
  settings: renderSettings
};

var activeModal = null;
var mobileSheetOpen = false;
var mobileSheetDragState = null;
var mobileSheetScrollLockY = 0;
var mobileSheetScrollLocked = false;
var mobileSheetScrollLockStyles = null;
var chartTooltip = null;
var pinnedChartTooltipTarget = null;
var chartTooltipPointerTapTarget = null;
var chartTooltipPositionFrame = 0;
var fitMetricValueFrame = 0;
var mobileViewportInsetFrame = 0;
var authCheckPromise = null;
var sidebarUserMenuOpen = false;
var databaseState = {
  checked: false,
  loading: false,
  saving: false,
  connected: false,
  data: null,
  message: "",
  error: ""
};
var settingsDataResetFeedback = {
  message: "",
  error: ""
};
var userDataServerLoadedFor = "";
var userDataServerLoadingFor = "";
var userDataServerLoadPromise = null;
var userDataServerLoadPromiseFor = "";
var userDataServerLoadError = "";
var userDataServerSaveTimer = 0;
var userDataServerSavePendingFor = "";
var userDataServerSavePendingSource = "";
var userDataMutationVersion = 0;
var userJournalMutationVersion = 0;
var assetTrendDashboardSnapshotKey = "";
var pendingAssetStorageCleanupKey = "";
var assetLocalSnapshotSavedAt = "";
var authState = {
  checked: false,
  checking: false,
  authenticated: false,
  user: null
};
var assetCashBalance = 0;
var assetCashMode = "deposit";
var assetCashError = "";
var assetCashMessage = "";
var assetCashDraftAmount = "";
var assetCashPendingAmount = 0;
var assetCashPendingMode = "deposit";
var assetTrendRange = "1w";
var assetTrendIncludeCash = true;
var assetTrendHistory = [];
var assetSettingsDrafts = [];
var assetSettingsError = "";
var assetSettingsMessage = "";
var assetSettingsNextId = 1;
var assetSettingsOpenMenuId = null;
var assetSettingsEditingId = null;
var assetSettingsActiveIndex = 0;
var assetSettingsSlideFrame = null;
var assetSettingsMotion = null;
var assetSettingsMotionTimer = 0;
var assetSettingsPendingRemoveId = null;
var assetSettingsDeleteTargetId = "";
var assetSettingsSaving = false;
var assetMarketSearch = {
  rowId: "",
  query: "",
  loading: false,
  results: [],
  error: "",
  requestId: 0
};
var assetMarketFavoritesOpenId = "";
var assetMarketSearchTimer = 0;
var assetMarketMetaCache = new Map();
var assetPriceRefreshTimer = 0;
var assetPriceRefreshRunning = false;
var assetPriceRefreshQueued = false;
var assetPriceRefreshQueuedSyncRemote = false;
var assetHoldingsRevision = 0;
var stockAnalysisSelected = null;
var stockFavoriteItems = [];
var stockFavoritesOpen = false;
var stockFavoritesServerSaveTimer = 0;
var stockFavoritesServerSavePendingFor = "";
var stockFavoritesRefreshRunning = false;
var stockSearchState = {
  query: "",
  loading: false,
  results: [],
  error: "",
  requestId: 0
};
var stockSearchTimer = 0;
var stockAnalysisAutoRefreshKey = "";
var stockAnalysisRefreshKey = "";
var stockChartPeriod = "1d";
var stockChartState = {
  key: "",
  loading: false,
  error: "",
  candles: [],
  requestId: 0
};
var stockNewsState = {
  key: "",
  loading: false,
  loaded: false,
  error: "",
  items: [],
  requestId: 0
};
var stockFundamentalsState = {
  key: "",
  loading: false,
  loaded: false,
  error: "",
  headers: [],
  rows: [],
  unit: "",
  source: "",
  requestId: 0
};
var settingsActiveSection = "broker";
const assetSettingsVisibleDotLimit = 5;
const assetSettingsDotSize = 10;
const assetSettingsDotGap = 14;
const assetSettingsDotActiveWidth = 34;
const authRequiredRoutes = new Set(["dashboard", "journal", "journalWrite", "stock", "performance", "assets", "memo", "calendar", "settings"]);
const assetStorageKey = "trading-note-assets-v1";
const memoStorageKey = "trading-note-memos-v1";
const journalRecordsStorageKey = "trading-note-journals-v1";
const assetTrendRangeKeys = new Set(["1w", "1m", "3m", "6m", "1y"]);
var userDataInitializedFor = "";
var userMemos = [];
var userJournalRecords = [];
var userJournalServerSaveTimer = 0;
var userJournalServerSavePendingFor = "";
var journalEditingRecordId = "";
var journalWriteReturnToCalendarDay = false;
var assetPortfolioIncludeCash = true;
const assetXlsxLibraryUrl = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
var assetXlsxLibraryPromise = null;
const assetSpreadsheetHeaders = [
  "종목명",
  "종목코드",
  "보유수량",
  "매수평균가",
  "현재가",
  "통화",
  "외화현재가",
  "환율",
  "입력방식",
  "자산유형",
  "시장",
  "거래소",
  "평가금액",
  "매수금액",
  "평가손익",
  "수익률"
];
const assetSpreadsheetColumnAliases = {
  name: ["종목명", "자산명", "종목", "보유자산", "name", "asset", "stock", "symbol"],
  code: ["종목코드", "코드", "티커", "code", "ticker"],
  quantity: ["보유수량", "수량", "quantity", "qty", "shares"],
  averagePrice: ["매수평균가", "매수평균", "평균단가", "평단", "averageprice", "avgprice", "average cost", "avg cost"],
  currentPrice: ["현재가", "평가단가", "현재가격", "currentprice", "price", "marketprice", "lastprice"],
  priceInputMode: ["입력방식", "방식", "mode", "inputmode"],
  type: ["자산유형", "유형", "type", "assettype", "category"],
  quoteType: ["quoteType", "quote type"],
  market: ["시장", "거래시장", "market"],
  exchange: ["거래소", "exchange"],
  source: ["출처", "source"],
  currency: ["통화", "currency"],
  marketPrice: ["외화현재가", "원시현재가", "marketprice", "foreignprice"],
  exchangeRateToKrw: ["환율", "원화환율", "exchangerate", "exchangeratetokrw"],
  priceDisplayCurrency: ["표시통화", "displaycurrency", "pricedisplaycurrency"]
};

const fallbackAssetInvestedBalance = 42750000;
const knownDomesticMarketByCode = {
  "000270": "KOSPI",
  "000660": "KOSPI",
  "005380": "KOSPI",
  "005930": "KOSPI",
  "035420": "KOSPI",
  "035720": "KOSPI",
  "207940": "KOSPI",
  "373220": "KOSPI"
};
const stockChartPeriodOptions = [
  { key: "1d", label: "일봉", range: "6mo", interval: "1d" },
  { key: "1wk", label: "주봉", range: "2y", interval: "1wk" },
  { key: "1mo", label: "월봉", range: "5y", interval: "1mo" },
  { key: "1m", label: "1분", range: "1d", interval: "1m" },
  { key: "5m", label: "5분", range: "5d", interval: "5m" },
  { key: "15m", label: "15분", range: "5d", interval: "15m" },
  { key: "30m", label: "30분", range: "1mo", interval: "30m" },
  { key: "60m", label: "60분", range: "3mo", interval: "60m" }
];

const binanceClientBaseUrls = [
  "https://data-api.binance.vision",
  "https://api.binance.com",
  "https://api.binance.us",
  "https://www.binance.us"
];
const binanceClientQuotePriority = ["USDT", "USDC", "FDUSD", "USD", "EUR", "TRY", "KRW", "BTC", "ETH", "BNB"];
const binanceClientUsdQuotes = new Set(["USDT", "USDC", "FDUSD", "BUSD", "TUSD", "USD"]);
const binanceClientAliases = {
  BTC: ["BTC", "BITCOIN", "비트코인"],
  ETH: ["ETH", "ETHEREUM", "이더리움"],
  XRP: ["XRP", "RIPPLE", "리플"],
  DOGE: ["DOGE", "DOGECOIN", "도지"],
  SOL: ["SOL", "SOLANA", "솔라나"],
  ADA: ["ADA", "CARDANO"],
  BNB: ["BNB", "BINANCECOIN"],
  TRX: ["TRX", "TRON", "트론"],
  XLM: ["XLM", "STELLAR", "스텔라"],
  LINK: ["LINK", "CHAINLINK", "체인링크"],
  PEPE: ["PEPE"],
  SHIB: ["SHIB", "SHIBA", "SHIBAINU"],
  AVAX: ["AVAX", "AVALANCHE"],
  DOT: ["DOT", "POLKADOT"],
  MATIC: ["MATIC", "POLYGON"],
  SUI: ["SUI"],
  TON: ["TON", "TONCOIN"]
};
var binanceClientExchangeSymbolsCache = null;
var binanceClientExchangeSymbolsPromise = null;
var binanceClientUsdKrwRatePromise = null;
var binanceClientUsdKrwRateValue = 0;

function normalizeBinanceClientText(value = "") {
  return String(value || "").trim().replace(/[\s._/-]+/g, "").toUpperCase();
}

function normalizeBinanceClientAsset(value = "") {
  return normalizeBinanceClientText(value).replace(/USD[TC]?$/, "");
}

function getBinanceClientAliasQuery(query = "") {
  const normalized = normalizeBinanceClientText(query);
  const compact = normalizeBinanceClientAsset(query);
  if (!normalized && !compact) return "";

  for (const [asset, aliases] of Object.entries(binanceClientAliases)) {
    if (aliases.some((alias) => {
      const normalizedAlias = normalizeBinanceClientText(alias);
      return normalized === normalizedAlias || compact === normalizedAlias || normalizedAlias.includes(normalized) || normalized.includes(normalizedAlias);
    })) {
      return asset;
    }
  }

  return compact || normalized;
}

function shouldSearchClientBinance(query = "") {
  const text = String(query || "").trim();
  if (text.length < 2) return false;
  return /[A-Za-z0-9가-힣]/.test(text);
}

function getBinanceClientDisplayCode(symbol = "", baseAsset = "", quoteAsset = "") {
  const base = String(baseAsset || "").toUpperCase();
  const quote = String(quoteAsset || "").toUpperCase();
  if (base && quote) return `${base}-${quote}`;
  const text = String(symbol || "").toUpperCase();
  const quoteMatch = binanceClientQuotePriority.find((quoteCandidate) => text.endsWith(quoteCandidate) && text.length > quoteCandidate.length);
  return quoteMatch ? `${text.slice(0, -quoteMatch.length)}-${quoteMatch}` : text;
}

function getBinanceClientCurrency(quoteAsset = "") {
  const quote = String(quoteAsset || "").toUpperCase();
  return binanceClientUsdQuotes.has(quote) ? "USD" : quote || "USD";
}

function rankBinanceClientSymbol(item = {}, query = "") {
  const assetQuery = getBinanceClientAliasQuery(query);
  const normalizedQuery = normalizeBinanceClientText(query);
  const base = String(item.baseAsset || "").toUpperCase();
  const quote = String(item.quoteAsset || "").toUpperCase();
  const symbol = String(item.symbol || "").toUpperCase();
  const displayCode = getBinanceClientDisplayCode(symbol, base, quote);
  let score = 0;
  if (base === assetQuery) score += 1000;
  if (displayCode === normalizedQuery || symbol === normalizedQuery) score += 900;
  if (base.startsWith(assetQuery)) score += 500;
  if (symbol.includes(assetQuery)) score += 250;
  const quoteIndex = binanceClientQuotePriority.indexOf(quote);
  score += quoteIndex >= 0 ? 100 - quoteIndex * 6 : 10;
  return score;
}

async function fetchClientBinanceJson(path, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  });

  let lastError = null;
  for (const baseUrl of binanceClientBaseUrls) {
    try {
      const url = `${baseUrl}${path}${query.toString() ? `?${query}` : ""}`;
      const response = await fetch(url, {
        cache: "no-store",
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error(`Binance ${response.status}`);
      return await response.json();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Binance request failed");
}

async function fetchClientBinanceExchangeSymbols() {
  if (Array.isArray(binanceClientExchangeSymbolsCache)) return binanceClientExchangeSymbolsCache;
  if (binanceClientExchangeSymbolsPromise) return binanceClientExchangeSymbolsPromise;

  binanceClientExchangeSymbolsPromise = fetchClientBinanceJson("/api/v3/exchangeInfo")
    .then((payload) => {
      const symbols = (Array.isArray(payload?.symbols) ? payload.symbols : [])
        .filter((item) => item && item.status === "TRADING" && item.isSpotTradingAllowed !== false && item.symbol && item.baseAsset && item.quoteAsset);
      binanceClientExchangeSymbolsCache = symbols;
      return symbols;
    })
    .finally(() => {
      binanceClientExchangeSymbolsPromise = null;
    });
  return binanceClientExchangeSymbolsPromise;
}

async function fetchClientUsdKrwRate() {
  if (binanceClientUsdKrwRateValue > 0) return binanceClientUsdKrwRateValue;
  if (binanceClientUsdKrwRatePromise) return binanceClientUsdKrwRatePromise;

  binanceClientUsdKrwRatePromise = fetch(`/api/markets?action=chart&symbol=${encodeURIComponent("USDKRW=X")}&range=5d&interval=1d`, {
    cache: "no-store",
    credentials: "include",
    headers: { Accept: "application/json" }
  })
    .then((response) => response.ok ? response.json() : null)
    .then((payload) => {
      const candles = Array.isArray(payload?.chart?.candles) ? payload.chart.candles : [];
      const latest = [...candles].reverse().find((item) => Number(item?.close) > 0);
      binanceClientUsdKrwRateValue = Number(latest?.close) || 0;
      return binanceClientUsdKrwRateValue;
    })
    .catch(() => 0)
    .finally(() => {
      binanceClientUsdKrwRatePromise = null;
    });
  return binanceClientUsdKrwRatePromise;
}

async function mapClientBinanceSymbol(item = {}) {
  const symbol = String(item.symbol || "").toUpperCase();
  const base = String(item.baseAsset || "").toUpperCase();
  const quote = String(item.quoteAsset || "").toUpperCase();
  const currency = getBinanceClientCurrency(quote);
  let ticker = null;
  try {
    ticker = await fetchClientBinanceJson("/api/v3/ticker/24hr", { symbol });
  } catch (error) {
    ticker = null;
  }
  const currentPrice = Math.max(0, Number(ticker?.lastPrice) || 0);
  const change = Number(ticker?.priceChange) || 0;
  const changeRate = Number(ticker?.priceChangePercent) || 0;
  const exchangeRateToKrw = currency === "USD" ? await fetchClientUsdKrwRate() : 0;
  const currentPriceKrw = exchangeRateToKrw && currentPrice ? convertMarketPriceToKrwUnitPrice(currentPrice, exchangeRateToKrw) : 0;

  return {
    name: `${base} ${quote}`.trim() || symbol,
    code: getBinanceClientDisplayCode(symbol, base, quote),
    symbol,
    type: "Crypto",
    quoteType: "CRYPTOCURRENCY",
    market: "Binance",
    exchange: "BINANCE",
    source: "Binance",
    currency,
    currentPrice,
    currentPriceKrw,
    exchangeRateToKrw,
    change,
    changeRate
  };
}

async function searchClientBinanceCrypto(query = "", limit = 8) {
  if (!shouldSearchClientBinance(query)) return [];
  const symbols = await fetchClientBinanceExchangeSymbols();
  const assetQuery = getBinanceClientAliasQuery(query);
  const normalizedQuery = normalizeBinanceClientText(query);
  const matches = symbols
    .filter((item) => {
      const base = String(item.baseAsset || "").toUpperCase();
      const quote = String(item.quoteAsset || "").toUpperCase();
      const symbol = String(item.symbol || "").toUpperCase();
      const displayCode = getBinanceClientDisplayCode(symbol, base, quote);
      return base.includes(assetQuery) || symbol.includes(assetQuery) || displayCode.replace("-", "").includes(normalizedQuery);
    })
    .sort((a, b) => rankBinanceClientSymbol(b, query) - rankBinanceClientSymbol(a, query))
    .slice(0, limit);

  return Promise.all(matches.map((item) => mapClientBinanceSymbol(item)));
}

function getMarketResultKey(item = {}) {
  const symbol = String(item.symbol || "").trim().toUpperCase();
  const code = String(item.code || "").trim().toUpperCase();
  const source = String(item.source || item.exchange || "").trim().toUpperCase();
  return symbol || code ? `${source}:${symbol || code}` : normalizeBinanceClientText(item.name || "");
}

function mergeMarketSearchResults(primary = [], extra = []) {
  const merged = [];
  const seen = new Set();
  [...extra, ...primary].forEach((item) => {
    const key = getMarketResultKey(item);
    if (!key || seen.has(key)) return;
    seen.add(key);
    merged.push(item);
  });
  return merged;
}

async function fetchServerMarketSearchResults(query = "", { force = false } = {}) {
  const url = `/api/markets?action=search&q=${encodeURIComponent(query)}${force ? `&refresh=1&t=${Date.now()}` : ""}`;
  const response = await fetch(url, {
    cache: force ? "no-store" : "default",
    credentials: "include",
    headers: { Accept: "application/json" }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Market search failed.");
  }
  return Array.isArray(payload.results) ? payload.results : [];
}

async function fetchMarketSearchResults(query = "", options = {}) {
  const [serverResult, binanceResult] = await Promise.allSettled([
    fetchServerMarketSearchResults(query, options),
    searchClientBinanceCrypto(query, options.binanceLimit || 8)
  ]);
  const serverResults = serverResult.status === "fulfilled" ? serverResult.value : [];
  const binanceResults = binanceResult.status === "fulfilled" ? binanceResult.value : [];
  const merged = mergeMarketSearchResults(serverResults, binanceResults);
  if (merged.length) return merged.slice(0, options.limit || 12);
  if (serverResult.status === "rejected") throw serverResult.reason;
  return [];
}

function isLikelyBinanceSymbol(symbol = "") {
  const text = String(symbol || "").trim().toUpperCase().replace("-", "");
  if (!text || /\./.test(text)) return false;
  return binanceClientQuotePriority.some((quote) => text.endsWith(quote) && text.length > quote.length);
}

function normalizeClientBinanceChartSymbol(symbol = "") {
  return String(symbol || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function getClientBinanceInterval(interval = "1d") {
  return {
    "1wk": "1w",
    "1mo": "1M",
    "60m": "1h"
  }[interval] || interval || "1d";
}

function getClientBinanceKlineLimit(range = "6mo", interval = "1d") {
  if (interval === "1m" && range === "1d") return 390;
  if (/m$/.test(interval)) return 240;
  if (range === "5y") return 260;
  if (range === "2y") return 210;
  return 190;
}

function normalizeClientBinanceCandles(rows = []) {
  return (Array.isArray(rows) ? rows : [])
    .map((row) => ({
      timestamp: Number(row?.[0]) || 0,
      open: Number(row?.[1]) || 0,
      high: Number(row?.[2]) || 0,
      low: Number(row?.[3]) || 0,
      close: Number(row?.[4]) || 0,
      volume: Number(row?.[5]) || 0
    }))
    .filter((row) => row.timestamp && row.open > 0 && row.high > 0 && row.low > 0 && row.close > 0);
}

async function fetchClientBinanceChart(symbol = "", config = {}) {
  const normalizedSymbol = normalizeClientBinanceChartSymbol(symbol);
  if (!isLikelyBinanceSymbol(normalizedSymbol)) return null;
  const interval = getClientBinanceInterval(config.interval);
  const limit = getClientBinanceKlineLimit(config.range, interval);
  const rows = await fetchClientBinanceJson("/api/v3/klines", {
    symbol: normalizedSymbol,
    interval,
    limit
  });
  const candles = normalizeClientBinanceCandles(rows);
  if (candles.length < 2) return null;
  return {
    symbol: normalizedSymbol,
    exchange: "Binance",
    currency: "USD",
    candles
  };
}

async function fetchServerMarketChart(symbol = "", config = {}) {
  const chartUrl = `/api/markets?action=chart&symbol=${encodeURIComponent(symbol)}&range=${encodeURIComponent(config.range)}&interval=${encodeURIComponent(config.interval)}`;
  const response = await fetch(chartUrl, {
    credentials: "include",
    headers: { Accept: "application/json" }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Chart request failed.");
  }
  return payload.chart || null;
}

async function fetchMarketChart(symbol = "", config = {}) {
  let serverChart = null;
  try {
    serverChart = await fetchServerMarketChart(symbol, config);
    if (Array.isArray(serverChart?.candles) && serverChart.candles.length >= 2) return serverChart;
  } catch (error) {
    serverChart = null;
  }

  const binanceChart = await fetchClientBinanceChart(symbol, config).catch(() => null);
  return binanceChart || serverChart;
}

window.fetchMarketSearchResults = fetchMarketSearchResults;
window.fetchMarketChart = fetchMarketChart;

function formatKRW(value) {
  return `${Math.max(0, Math.round(Number(value) || 0)).toLocaleString()}원`;
}

function getAssetCashBalance() {
  return assetCashBalance;
}

function getAssetInvestedValue() {
  return typeof getHoldingTotalValue === "function" ? getHoldingTotalValue() : fallbackAssetInvestedBalance;
}

function getAssetTotalValue() {
  return getAssetInvestedValue() + assetCashBalance;
}

function getAssetTrendDateKey(date = new Date()) {
  const value = date instanceof Date ? date : new Date(date);
  const safeDate = Number.isNaN(value.getTime()) ? new Date() : value;
  const year = safeDate.getFullYear();
  const month = String(safeDate.getMonth() + 1).padStart(2, "0");
  const day = String(safeDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseAssetTrendDateKey(value = "") {
  const text = String(value || "").trim();
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const time = Date.parse(text);
  return Number.isFinite(time) ? new Date(time) : null;
}

function normalizeAssetTrendEntry(entry = {}) {
  const rawDate = entry.date || entry.savedAt || entry.updatedAt || "";
  const dateValue = parseAssetTrendDateKey(rawDate);
  if (!dateValue) return null;

  const totalAssets = Math.max(0, Math.round(Number(
    entry.totalAssets ?? entry.totalValue ?? entry.total ?? 0
  ) || 0));
  const investmentPrincipal = Math.max(0, Math.round(Number(
    entry.investmentPrincipal ?? entry.principal ?? entry.costBasis ?? 0
  ) || 0));
  const cashBalanceValue = Math.max(0, Math.round(Number(
    entry.cashBalance ?? entry.cash ?? 0
  ) || 0));
  if (totalAssets <= 0 && investmentPrincipal <= 0 && cashBalanceValue <= 0) return null;

  const savedAtTime = Date.parse(entry.savedAt || entry.updatedAt || "");
  return {
    date: getAssetTrendDateKey(dateValue),
    savedAt: Number.isFinite(savedAtTime) ? new Date(savedAtTime).toISOString() : dateValue.toISOString(),
    totalAssets,
    investmentPrincipal,
    cashBalance: cashBalanceValue
  };
}

function normalizeAssetTrendHistory(history = []) {
  const byDate = new Map();

  (Array.isArray(history) ? history : []).forEach((entry) => {
    const normalized = normalizeAssetTrendEntry(entry);
    if (!normalized) return;

    const previous = byDate.get(normalized.date);
    const previousTime = Date.parse(previous?.savedAt || "");
    const nextTime = Date.parse(normalized.savedAt || "");
    if (!previous || !Number.isFinite(previousTime) || nextTime >= previousTime) {
      byDate.set(normalized.date, normalized);
    }
  });

  return Array.from(byDate.values())
    .sort((left, right) => String(left.date).localeCompare(String(right.date)))
    .slice(-730);
}

function mergeAssetTrendHistories(...histories) {
  return normalizeAssetTrendHistory(histories.flatMap((history) => Array.isArray(history) ? history : []));
}

function buildAssetTrendEntryFromSnapshot(snapshot = {}) {
  const holdingsSnapshot = Array.isArray(snapshot.holdings) ? snapshot.holdings : [];
  const cashBalanceValue = Math.max(0, Math.round(Number(snapshot.cashBalance) || 0));
  const investedValue = holdingsSnapshot.reduce((sum, item) => {
    const amount = Number(item.amount);
    if (Number.isFinite(amount) && amount > 0) return sum + amount;
    return sum + (Number(item.quantity) || 0) * (Number(item.currentPrice) || 0);
  }, 0);
  const investmentPrincipal = holdingsSnapshot.reduce((sum, item) => {
    const costBasis = Number(item.costBasis);
    if (Number.isFinite(costBasis) && costBasis > 0) return sum + costBasis;
    return sum + (Number(item.quantity) || 0) * (Number(item.averagePrice) || 0);
  }, 0);
  const savedAt = snapshot.savedAt || snapshot.updatedAt || new Date().toISOString();

  return normalizeAssetTrendEntry({
    date: savedAt,
    savedAt,
    totalAssets: investedValue + cashBalanceValue,
    investmentPrincipal,
    cashBalance: cashBalanceValue
  });
}

function getCurrentAssetTrendEntry(savedAt = new Date()) {
  const savedAtDate = savedAt instanceof Date ? savedAt : new Date(savedAt);
  const safeDate = Number.isNaN(savedAtDate.getTime()) ? new Date() : savedAtDate;
  const cashBalanceValue = getAssetCashBalance();
  const totalAssets = getAssetTotalValue();
  const investmentPrincipal = typeof getHoldingTotalCostBasis === "function" ? getHoldingTotalCostBasis() : getAssetInvestedValue();

  return normalizeAssetTrendEntry({
    date: getAssetTrendDateKey(safeDate),
    savedAt: safeDate.toISOString(),
    totalAssets,
    investmentPrincipal,
    cashBalance: cashBalanceValue
  });
}

function getAssetTrendHistoryFromSnapshot(snapshot = {}) {
  const savedHistory = normalizeAssetTrendHistory(snapshot.trendHistory);
  const snapshotEntry = buildAssetTrendEntryFromSnapshot(snapshot);
  return snapshotEntry ? mergeAssetTrendHistories(savedHistory, [snapshotEntry]) : savedHistory;
}

function applyAssetTrendHistoryFromSnapshot(snapshot = {}) {
  assetTrendHistory = getAssetTrendHistoryFromSnapshot(snapshot);
}

function recordAssetTrendSnapshot(savedAt = new Date()) {
  const currentEntry = getCurrentAssetTrendEntry(savedAt);
  if (!currentEntry) {
    assetTrendHistory = [];
    return assetTrendHistory;
  }

  assetTrendHistory = mergeAssetTrendHistories(assetTrendHistory, [currentEntry]);
  return assetTrendHistory;
}

function getAssetTrendSnapshotKey(entry = {}) {
  return [
    getCurrentUserStorageId(),
    entry.date || "",
    Math.round(Number(entry.totalAssets) || 0),
    Math.round(Number(entry.investmentPrincipal) || 0),
    Math.round(Number(entry.cashBalance) || 0)
  ].join(":");
}

function syncDashboardAssetTrendSnapshot() {
  if (!authState.authenticated) return;
  const userId = getCurrentUserStorageId();
  if (!userId || userDataServerLoadedFor !== userId) return;

  const currentEntry = getCurrentAssetTrendEntry();
  if (!currentEntry) return;

  const snapshotKey = getAssetTrendSnapshotKey(currentEntry);
  if (assetTrendDashboardSnapshotKey === snapshotKey) return;
  assetTrendDashboardSnapshotKey = snapshotKey;

  saveAssetStateToStorage({ source: "system_dashboard" }).catch((error) => {
    console.warn("Dashboard asset trend snapshot could not be saved.", error);
    assetTrendDashboardSnapshotKey = "";
  });
}

function getAssetTrendHistory({ includeCurrent = true } = {}) {
  const currentEntry = includeCurrent ? getCurrentAssetTrendEntry() : null;
  return currentEntry ? mergeAssetTrendHistories(assetTrendHistory, [currentEntry]) : normalizeAssetTrendHistory(assetTrendHistory);
}

function getAssetTrendRange() {
  return assetTrendRangeKeys.has(assetTrendRange) ? assetTrendRange : "1w";
}

function setAssetTrendRange(nextRange = "1w") {
  if (!assetTrendRangeKeys.has(nextRange)) return false;
  assetTrendRange = nextRange;
  return true;
}

function getAssetTrendIncludeCash() {
  return assetTrendIncludeCash;
}

function setAssetTrendIncludeCash(includeCash = true) {
  assetTrendIncludeCash = Boolean(includeCash);
}

function parseKRWInput(value) {
  return Math.max(0, Number(String(value).replace(/[^0-9]/g, "")) || 0);
}

function parseAssetDecimalInput(value) {
  const normalized = String(value ?? "")
    .replace(/,/g, "")
    .replace(/[^0-9.]/g, "");
  const [integerPart, ...decimalParts] = normalized.split(".");
  const numericText = `${integerPart || "0"}${decimalParts.length ? `.${decimalParts.join("")}` : ""}`;
  return Math.max(0, Number(numericText) || 0);
}

function roundAssetKrwUnitPrice(value) {
  const price = Math.max(0, Number(value) || 0);
  if (!price) return 0;
  if (price >= 1) return Math.round(price);
  return Number(price.toPrecision(12));
}

function parseAssetUnitPriceInput(value) {
  return roundAssetKrwUnitPrice(parseAssetDecimalInput(value));
}

function convertMarketPriceToKrwUnitPrice(price, exchangeRateToKrw) {
  return roundAssetKrwUnitPrice((Number(price) || 0) * (Number(exchangeRateToKrw) || 0));
}

function isDecimalNumberInput(input) {
  const assetField = input?.dataset?.assetSettingField;
  return assetField === "quantity" ||
    assetField === "averagePrice" ||
    assetField === "currentPrice" ||
    input?.hasAttribute("data-journal-trade-quantity");
}

function formatAssetDecimal(value) {
  const number = Number(value) || 0;
  if (!number) return "";
  return number.toLocaleString(undefined, {
    maximumFractionDigits: number >= 100 ? 2 : 6
  });
}

function formatDecimalNumberInput(input) {
  const raw = String(input.value ?? "").replace(/,/g, "").replace(/[^0-9.]/g, "");
  const hasDecimalPoint = raw.includes(".");
  const [integerPart, ...decimalParts] = raw.split(".");
  const integerDigits = integerPart.replace(/^0+(?=\d)/, "");
  const integerText = integerDigits ? Number(integerDigits).toLocaleString() : "";
  const decimalText = decimalParts.join("").slice(0, 8);
  input.value = hasDecimalPoint ? `${integerText || "0"}.${decimalText}` : integerText;
}

function formatNumberInput(input) {
  if (isDecimalNumberInput(input)) {
    formatDecimalNumberInput(input);
    return;
  }

  const digits = String(input.value).replace(/[^0-9]/g, "");
  input.value = digits ? Number(digits).toLocaleString() : "";
}

function getStoredAuthUser() {
  try {
    return JSON.parse(localStorage.getItem("trading-note-auth-user") || "null");
  } catch (error) {
    return null;
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getCurrentUser() {
  return authState.user || getStoredAuthUser() || null;
}

function getUserDisplayName(user = getCurrentUser()) {
  return user?.name || user?.email?.split("@")[0] || "투자자";
}

function getUserEmail(user = getCurrentUser()) {
  return user?.email || "Google 계정";
}

function getUserInitial(user = getCurrentUser()) {
  return (getUserDisplayName(user).trim()[0] || "T").toUpperCase();
}

function getSafeUserPicture(user = getCurrentUser()) {
  const value = user?.picture || "";
  if (!value) return "";

  try {
    const url = new URL(value, window.location.origin);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch (error) {
    return "";
  }
}

function renderUserAvatar(user = getCurrentUser(), className = "user-avatar") {
  const picture = getSafeUserPicture(user);
  const name = getUserDisplayName(user);

  if (picture) {
    return `<span class="${className} has-image"><img src="${escapeHtml(picture)}" alt="${escapeHtml(name)} 프로필 이미지" referrerpolicy="no-referrer"></span>`;
  }

  return `<span class="${className}" aria-hidden="true">${escapeHtml(getUserInitial(user))}</span>`;
}

function normalizeUserStorageId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, "_");
}

function getCurrentUserStorageId() {
  const user = getCurrentUser();
  return normalizeUserStorageId(user?.email || user?.name || "");
}

function getUserScopedStorageKey(baseKey) {
  const userId = getCurrentUserStorageId();
  return userId ? `${baseKey}:${userId}` : "";
}

function clearRuntimeUserData() {
  assetCashBalance = 0;
  assetLocalSnapshotSavedAt = "";
  assetTrendRange = "1w";
  assetTrendIncludeCash = true;
  assetTrendHistory = [];
  assetTrendDashboardSnapshotKey = "";
  userMemos = [];
  userJournalRecords = [];
  journalEditingRecordId = "";
  assetPortfolioIncludeCash = true;
  stockAnalysisSelected = null;
  stockFavoriteItems = [];
  stockFavoritesOpen = false;
  stockAnalysisAutoRefreshKey = "";
  stockAnalysisRefreshKey = "";
  stockChartState = {
    key: "",
    loading: false,
    error: "",
    candles: [],
    requestId: stockChartState.requestId + 1
  };
  stockNewsState = {
    key: "",
    loading: false,
    loaded: false,
    error: "",
    items: [],
    requestId: stockNewsState.requestId + 1
  };
  stockFundamentalsState = {
    key: "",
    loading: false,
    loaded: false,
    error: "",
    headers: [],
    rows: [],
    unit: "",
    source: "",
    requestId: stockFundamentalsState.requestId + 1
  };
  if (stockFavoritesServerSaveTimer) window.clearTimeout(stockFavoritesServerSaveTimer);
  stockFavoritesServerSaveTimer = 0;
  stockFavoritesServerSavePendingFor = "";
  if (userJournalServerSaveTimer) window.clearTimeout(userJournalServerSaveTimer);
  userJournalServerSaveTimer = 0;
  userJournalServerSavePendingFor = "";
  clearPendingUserAssetSave();
  resetStockSearchState();

  if (typeof holdings !== "undefined") holdings.splice(0, holdings.length);
  if (typeof watchList !== "undefined") watchList.splice(0, watchList.length);
  if (typeof trades !== "undefined") trades.splice(0, trades.length);
  assetHoldingsRevision += 1;
  if (typeof journalSelectedTradeIds !== "undefined") journalSelectedTradeIds.clear();
  if (typeof journalDeletedTradeIds !== "undefined") journalDeletedTradeIds.clear();
  if (typeof assetTrendTargets !== "undefined") assetTrendTargets = [];
}

function clearAssetHoldingsRuntime() {
  if (typeof holdings !== "undefined") holdings.splice(0, holdings.length);
  if (typeof watchList !== "undefined") watchList.splice(0, watchList.length);
  assetHoldingsRevision += 1;
  assetSettingsError = "";
  assetSettingsMessage = "";
}

function getUserMemos() {
  return userMemos.slice();
}

function normalizeJournalRecord(record = {}) {
  const now = new Date().toISOString();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(record.date || "")) ? String(record.date) : getJournalWriteTodayValue();
  const type = String(record.type || "buy") === "sell" ? "sell" : "buy";
  const price = Math.max(0, Number(record.price || (type === "sell" ? record.sellPrice : record.buyPrice)) || 0);

  return {
    id: String(record.id || `journal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    date,
    type,
    name: String(record.name || "").trim(),
    code: String(record.code || "").trim(),
    symbol: String(record.symbol || record.code || "").trim(),
    quantity: Math.max(0, Number(record.quantity) || 0),
    price,
    buyPrice: Math.max(0, Number(record.buyPrice || (type === "buy" ? price : 0)) || 0),
    sellPrice: Math.max(0, Number(record.sellPrice || (type === "sell" ? price : 0)) || 0),
    memo: String(record.memo || "").trim(),
    createdAt: record.createdAt || now,
    updatedAt: record.updatedAt || now
  };
}

function parseLegacyJournalNumber(value = "") {
  if (typeof parseMarketNumber === "function") return parseMarketNumber(value);
  return Number(String(value ?? "").replace(/[^0-9.-]/g, "")) || 0;
}

function parseLegacyJournalDate(value = "") {
  const text = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const shortDate = text.match(/^(\d{1,2})[./-](\d{1,2})$/);
  if (!shortDate) return "";

  const year = new Date().getFullYear();
  const month = String(Number(shortDate[1])).padStart(2, "0");
  const day = String(Number(shortDate[2])).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function convertLegacyTradeRowToJournalRecord(row = [], index = 0) {
  if (!Array.isArray(row)) return null;

  const date = parseLegacyJournalDate(row[0]);
  const name = String(row[1] || "").trim();
  const quantity = parseLegacyJournalNumber(row[3]);
  const buyPrice = parseLegacyJournalNumber(row[4]);
  const sellPrice = parseLegacyJournalNumber(row[5]);
  const isSell = sellPrice > 0 && String(row[5] || "").trim() !== "-";
  const price = isSell ? sellPrice : buyPrice;
  const code = String(row[12] || "").trim();

  if (!date || !name || quantity <= 0 || price <= 0) return null;

  const safeKey = normalizeUserStorageId(`${date}-${name}-${code}-${quantity}-${price}-${index}`).slice(0, 80);
  return normalizeJournalRecord({
    id: `legacy-${safeKey || index}`,
    date,
    type: isSell ? "sell" : "buy",
    name,
    code,
    symbol: code,
    quantity,
    price,
    buyPrice: isSell ? 0 : price,
    sellPrice: isSell ? price : 0,
    memo: String(row[9] || "").trim(),
    createdAt: `${date}T00:00:00.000Z`,
    updatedAt: `${date}T00:00:00.000Z`
  });
}

function mergeRemoteJournalRecords(records = [], legacyTrades = []) {
  const merged = [];
  const seen = new Set();
  const addRecord = (record) => {
    if (!record) return;
    const normalized = normalizeJournalRecord(record);
    if (!normalized.name || normalized.quantity <= 0) return;

    const idKey = normalized.id ? `id:${normalized.id}` : "";
    const valueKey = [
      "value",
      normalized.date,
      normalized.type,
      normalizeUserStorageId(normalized.name),
      normalizeUserStorageId(normalized.code || normalized.symbol),
      normalized.quantity,
      getJournalRecordPrice(normalized)
    ].join("|");

    if ((idKey && seen.has(idKey)) || seen.has(valueKey)) return;
    if (idKey) seen.add(idKey);
    seen.add(valueKey);
    merged.push(normalized);
  };

  (Array.isArray(records) ? records : []).forEach(addRecord);
  (Array.isArray(legacyTrades) ? legacyTrades : []).forEach((row, index) => {
    addRecord(convertLegacyTradeRowToJournalRecord(row, index));
  });

  return merged;
}

function applyUserJournalRecords(records = []) {
  userJournalRecords = (Array.isArray(records) ? records : [])
    .map((record) => normalizeJournalRecord(record))
    .filter((record) => record.name && record.quantity > 0)
    .slice(0, 500);
}

function getJournalRecordsSnapshot() {
  return userJournalRecords.map((record) => normalizeJournalRecord(record));
}

function formatJournalRecordDate(record = {}) {
  const match = String(record.date || "").match(/^\d{4}-(\d{2})-(\d{2})$/);
  return match ? `${match[1]}/${match[2]}` : "";
}

function getJournalRecordDisplayType(record = {}) {
  return record.type === "sell" ? "매도" : "매수";
}

function getJournalRecordRows() {
  return getJournalRecordsSnapshot().map((record) => {
    const price = Math.round(Number(record.price || record.buyPrice || record.sellPrice) || 0);
    const priceText = price ? formatMarketNumber(price) : "-";
    const quantity = Number(record.quantity || 0);
    return [
      formatJournalRecordDate(record),
      record.name,
      getJournalRecordDisplayType(record),
      Number.isInteger(quantity) ? String(quantity) : String(quantity),
      record.type === "sell" ? "-" : priceText,
      record.type === "sell" ? priceText : "-",
      "+0",
      "+0.00%",
      "직접 기록",
      record.memo || "",
      record.date,
      record.code || record.symbol || "",
      record.id || ""
    ];
  });
}

function getAllJournalTradeRows() {
  const runtimeRows = typeof trades !== "undefined" && Array.isArray(trades) ? trades : [];
  return [...getJournalRecordRows(), ...runtimeRows];
}

function getJournalRecordById(recordId = "") {
  const key = String(recordId || "");
  if (!key) return null;
  return userJournalRecords.find((record) => String(record.id || "") === key) || null;
}

function getJournalEditingRecord() {
  return getJournalRecordById(journalEditingRecordId);
}

function setJournalEditingRecord(recordId = "") {
  journalEditingRecordId = String(recordId || "");
}

function getAssetPortfolioIncludeCash() {
  return assetPortfolioIncludeCash;
}

function getJournalRecordPrice(record = {}) {
  return Math.round(Number(record.type === "sell" ? record.sellPrice || record.price : record.buyPrice || record.price) || 0);
}

function getJournalRecordTotal(record = {}) {
  return Math.round((Number(record.quantity) || 0) * getJournalRecordPrice(record));
}

function normalizeJournalMatchKey(value = "") {
  if (typeof normalizeStockKey === "function") return normalizeStockKey(value);
  return String(value || "").replace(/\s+/g, "").toLowerCase();
}

function getJournalAssetRowsForMutation() {
  return getHoldingData().map((item) => ({
    name: item.name,
    code: item.code,
    quantity: Number(item.quantity) || 0,
    averagePrice: roundAssetKrwUnitPrice(Number(item.averagePrice) || 0),
    currentPrice: roundAssetKrwUnitPrice(Number(item.currentPrice) || 0),
    currency: item.currency || "KRW",
    exchange: item.exchange || "",
    market: item.market || "",
    quoteType: item.quoteType || item.type || "",
    type: item.type || "",
    unit: item.unit || "",
    priceInputMode: item.priceInputMode || "full"
  }));
}

function applyJournalAssetRowsForMutation(rows = []) {
  const nextRows = rows.filter((row) => (Number(row.quantity) || 0) > 0);
  if (!nextRows.length) {
    clearAssetHoldingsRuntime();
    return true;
  }
  return replaceAssetHoldings(nextRows);
}

function getJournalAssetMutationSnapshot() {
  return {
    cashBalance: Number(assetCashBalance) || 0,
    rows: getJournalAssetRowsForMutation()
  };
}

function restoreJournalAssetMutationSnapshot(snapshot = {}) {
  assetCashBalance = Math.max(0, Math.round(Number(snapshot.cashBalance) || 0));
  applyJournalAssetRowsForMutation(Array.isArray(snapshot.rows) ? snapshot.rows : []);
}

function findJournalAssetRowIndex(rows = [], record = {}) {
  const code = record.code || record.symbol || "";
  const name = record.name || "";
  if (typeof stockMatches === "function") {
    return rows.findIndex((row) => stockMatches(row.name, row.code, name, code));
  }
  const codeKey = normalizeJournalMatchKey(code);
  const nameKey = normalizeJournalMatchKey(name);
  return rows.findIndex((row) => {
    const rowCode = normalizeJournalMatchKey(row.code);
    const rowName = normalizeJournalMatchKey(row.name);
    return (codeKey && rowCode === codeKey) || (nameKey && rowName === nameKey);
  });
}

function applyJournalRecordAssetEffect(record = {}, direction = 1) {
  const normalized = normalizeJournalRecord(record);
  if (!normalized.name && !normalized.code) return false;

  const quantity = Number(normalized.quantity) || 0;
  const price = getJournalRecordPrice(normalized);
  const total = getJournalRecordTotal(normalized);
  if (!quantity || !price) return false;

  const rows = getJournalAssetRowsForMutation();
  const isSell = normalized.type === "sell";
  const quantityDelta = (isSell ? -quantity : quantity) * direction;
  const cashDelta = (isSell ? total : -total) * direction;
  if (!isSell && direction > 0 && total > (Number(assetCashBalance) || 0) + 0.000001) return false;

  let rowIndex = findJournalAssetRowIndex(rows, normalized);
  if (rowIndex < 0 && quantityDelta > 0) {
    rows.push({
      name: normalized.name || normalized.code,
      code: normalized.code || normalized.symbol || "",
      quantity: 0,
      averagePrice: price,
      currentPrice: price,
      currency: "KRW",
      exchange: "",
      market: "",
      quoteType: "",
      type: "",
      unit: "",
      priceInputMode: "full"
    });
    rowIndex = rows.length - 1;
  }

  if (rowIndex < 0) return false;

  if (rowIndex >= 0) {
    const row = rows[rowIndex];
    const previousQuantity = Number(row.quantity) || 0;
    const rawNextQuantity = previousQuantity + quantityDelta;
    if (rawNextQuantity < -0.000001) return false;
    const nextQuantity = Math.max(0, rawNextQuantity);
    if (!isSell && direction > 0 && nextQuantity > 0) {
      const previousCost = Math.max(0, previousQuantity) * (Number(row.averagePrice) || price);
      row.averagePrice = Math.round((previousCost + quantity * price) / nextQuantity);
    }
    row.quantity = nextQuantity;
    row.currentPrice = price || row.currentPrice;
    row.priceInputMode = row.priceInputMode || "full";
  }

  if (!applyJournalAssetRowsForMutation(rows)) return false;
  assetCashBalance = Math.max(0, Math.round((Number(assetCashBalance) || 0) + cashDelta));
  return true;
}

async function saveJournalAndAssetStateToServer({ assetsSnapshot = null, journalSnapshot = null } = {}) {
  if (!authState.authenticated) return false;
  const userId = getCurrentUserStorageId();
  if (!userId) return false;

  const assets = assetsSnapshot || getAssetSnapshot();
  const journalRecords = Array.isArray(journalSnapshot)
    ? journalSnapshot.map((record) => normalizeJournalRecord(record))
    : getJournalRecordsSnapshot();
  const saveStartedMutationVersion = userDataMutationVersion;
  const saveStartedJournalMutationVersion = userJournalMutationVersion;
  assertSavableAssetSnapshot(assets, { source: "journal" });

  try {
    const response = await fetchWithTimeout("/api/data", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        action: "save_assets_and_journal",
        assets,
        journalRecords,
        allowEmptyAssets: true
      })
    });
    const { data, text } = await readApiJsonResponse(response);
    if (!response.ok || !data.ok) {
      throw new Error(getApiErrorMessage(response, data, text, "Journal and asset data could not be saved."));
    }

    const savedData = data.data || {};
    const savedAssets = savedData.assets || {};
    assertServerSavedAssetSnapshot(assets, savedAssets, { source: "journal" });

    if (saveStartedMutationVersion === userDataMutationVersion) {
      applyUserAssetSnapshot(savedAssets);
      clearPendingUserAssetSave();
      clearPlainAssetStateFromStorage(pendingAssetStorageCleanupKey || undefined);
      pendingAssetStorageCleanupKey = "";
    }
    if (
      saveStartedJournalMutationVersion === userJournalMutationVersion &&
      Array.isArray(savedData.journalRecords)
    ) {
      applyUserJournalRecords(savedData.journalRecords);
      userJournalServerSavePendingFor = "";
    }

    userDataServerLoadedFor = userId;
    userDataServerLoadError = "";
    setDatabaseState({
      checked: true,
      connected: true,
      data: summarizeDatabaseData(savedData),
      message: "Journal and asset data were saved to Cloudflare D1.",
      error: ""
    });
    return true;
  } catch (error) {
    console.warn("Journal and asset data could not be saved to the server.", error);
    throw error;
  }
}

async function persistJournalAndAssetState() {
  const userId = getCurrentUserStorageId();
  markJournalDataMutation();
  if (userDataServerSaveTimer) window.clearTimeout(userDataServerSaveTimer);
  if (userJournalServerSaveTimer) window.clearTimeout(userJournalServerSaveTimer);
  userDataServerSaveTimer = 0;
  userJournalServerSaveTimer = 0;
  userJournalServerSavePendingFor = "";
  clearPendingUserAssetSave();

  await saveAssetStateToStorage({ syncRemote: false, source: "journal" });
  const assetsSnapshot = getAssetSnapshot();
  const journalSnapshot = getJournalRecordsSnapshot();

  if (authState.authenticated && userId) {
    await saveJournalAndAssetStateToServer({ assetsSnapshot, journalSnapshot });
  }
  return true;
}

async function deleteJournalRecordById(recordId = "") {
  const record = getJournalRecordById(recordId);
  if (!record) return false;
  const assetSnapshot = getJournalAssetMutationSnapshot();
  const journalSnapshot = getJournalRecordsSnapshot();
  if (!applyJournalRecordAssetEffect(record, -1)) {
    restoreJournalAssetMutationSnapshot(assetSnapshot);
    return false;
  }
  userJournalRecords = userJournalRecords.filter((item) => String(item.id || "") !== String(recordId));
  try {
    await persistJournalAndAssetState();
  } catch (error) {
    restoreJournalAssetMutationSnapshot(assetSnapshot);
    applyUserJournalRecords(journalSnapshot);
    await saveAssetStateToStorage({ syncRemote: false, source: "system" });
    console.warn("Journal record could not be deleted.", error);
    return false;
  }
  return true;
}

async function deleteJournalRecordsByIds(recordIds = []) {
  const idSet = new Set(recordIds.map((id) => String(id || "")).filter(Boolean));
  if (!idSet.size) return false;
  const assetSnapshot = getJournalAssetMutationSnapshot();
  const journalSnapshot = getJournalRecordsSnapshot();
  for (const record of userJournalRecords) {
    if (!idSet.has(String(record.id || ""))) continue;
    if (!applyJournalRecordAssetEffect(record, -1)) {
      restoreJournalAssetMutationSnapshot(assetSnapshot);
      return false;
    }
  }
  userJournalRecords = userJournalRecords.filter((item) => !idSet.has(String(item.id || "")));
  try {
    await persistJournalAndAssetState();
  } catch (error) {
    restoreJournalAssetMutationSnapshot(assetSnapshot);
    applyUserJournalRecords(journalSnapshot);
    await saveAssetStateToStorage({ syncRemote: false, source: "system" });
    console.warn("Journal records could not be deleted.", error);
    return false;
  }
  return true;
}

async function resetUserAssetAndJournalData() {
  if (!authState.authenticated) return false;
  const userId = getCurrentUserStorageId();
  if (!userId) return false;

  settingsDataResetFeedback = {
    message: "자산 현황과 매매기록을 삭제하고 있습니다.",
    error: ""
  };
  setDatabaseState({
    saving: true,
    message: "자산 현황과 매매기록을 삭제하고 있습니다.",
    error: ""
  });
  if (getRoute() === "settings") render();

  try {
    if (userDataServerLoadedFor !== userId) {
      const loaded = await loadUserDataFromServer(userId);
      if (!loaded && userDataServerLoadedFor !== userId) {
        throw new Error("저장된 데이터를 먼저 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }
    }

    if (userDataServerSaveTimer) window.clearTimeout(userDataServerSaveTimer);
    userDataServerSaveTimer = 0;
    clearPendingUserAssetSave();
    if (userJournalServerSaveTimer) window.clearTimeout(userJournalServerSaveTimer);
    userJournalServerSaveTimer = 0;
    userJournalServerSavePendingFor = "";

    assetCashBalance = 0;
    assetTrendHistory = [];
    assetTrendDashboardSnapshotKey = "";
    clearAssetHoldingsRuntime();
    if (typeof assetTrendTargets !== "undefined") assetTrendTargets = [];

    userJournalRecords = [];
    markJournalDataMutation();
    journalEditingRecordId = "";
    if (typeof trades !== "undefined") trades.splice(0, trades.length);
    if (typeof journalSelectedTradeIds !== "undefined") journalSelectedTradeIds.clear();
    if (typeof journalDeletedTradeIds !== "undefined") journalDeletedTradeIds.clear();

    await saveAssetStateToStorage({ source: "user_clear", immediate: true });
    const journalSaved = await saveJournalRecordsToServer();
    if (!journalSaved) {
      throw new Error("매매기록 삭제 내용을 서버에 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }

    settingsDataResetFeedback = {
      message: "자산 현황과 매매기록이 삭제되었습니다.",
      error: ""
    };
    setDatabaseState({
      saving: false,
      connected: true,
      message: "자산 현황과 매매기록이 삭제되었습니다.",
      error: ""
    });
    render();
    return true;
  } catch (error) {
    const resetError = error?.message || "데이터 초기화에 실패했습니다.";
    settingsDataResetFeedback = {
      message: "",
      error: resetError
    };
    setDatabaseState({
      saving: false,
      message: "",
      error: resetError
    });
    render();
    return false;
  }
}

function openJournalRecordEditor(recordId = "") {
  const record = getJournalRecordById(recordId);
  if (!record) return false;
  setJournalEditingRecord(record.id);
  setJournalWriteInitialDate(record.date);
  activeModal = "journalWrite";
  render();
  hydrateIcons(document);
  return true;
}

function hasAssetSnapshotData(snapshot = {}) {
  return Number(snapshot.cashBalance || 0) > 0 || (Array.isArray(snapshot.holdings) && snapshot.holdings.length > 0);
}

function getAssetSnapshotTimestamp(snapshot = {}) {
  const time = Date.parse(snapshot.savedAt || snapshot.updatedAt || "");
  return Number.isFinite(time) ? time : 0;
}

function hasPersistedRemoteAssetSnapshot(remoteSnapshot = {}) {
  return hasAssetSnapshotData(remoteSnapshot) ||
    getAssetSnapshotTimestamp(remoteSnapshot) > 0;
}

function shouldPreferLocalAssetSnapshot(localSnapshot = {}, remoteSnapshot = {}) {
  if (!hasAssetSnapshotData(localSnapshot)) return false;
  if (!hasPersistedRemoteAssetSnapshot(remoteSnapshot)) return true;

  const localTime = getAssetSnapshotTimestamp(localSnapshot);
  const remoteTime = getAssetSnapshotTimestamp(remoteSnapshot);
  if (localTime > 0 && (!remoteTime || localTime > remoteTime + 1000)) return true;
  if (remoteTime > 0 && (!localTime || remoteTime >= localTime - 1000)) return false;

  return !hasAssetSnapshotData(remoteSnapshot);
}

function shouldAllowEmptyAssetSave(source = "") {
  return source === "user_clear" || source === "user_cash" || source === "journal";
}

function isUserAssetSaveSource(source = "") {
  const normalizedSource = String(source || "");
  return normalizedSource.startsWith("user") || normalizedSource === "journal" || normalizedSource === "migration";
}

function clearPendingUserAssetSave() {
  userDataServerSavePendingFor = "";
  userDataServerSavePendingSource = "";
}

function markUserDataMutation() {
  userDataMutationVersion += 1;
}

function markJournalDataMutation() {
  userJournalMutationVersion += 1;
}

function getAssetHoldingSaveKey(item = {}) {
  const code = String(item.code || item.symbol || "").trim();
  const name = String(item.name || "").trim();
  const rawKey = code ? `${code}|${name}` : name;
  if (!rawKey) return "";
  return typeof normalizeStockKey === "function"
    ? normalizeStockKey(rawKey)
    : rawKey.toLowerCase().replace(/\s+/g, "");
}

function getPositiveAssetSnapshotHoldings(snapshot = {}) {
  return (Array.isArray(snapshot.holdings) ? snapshot.holdings : [])
    .filter((item) => String(item.name || "").trim() && Number(item.quantity) > 0);
}

function getMissingSavedAssetHoldings(expectedSnapshot = {}, savedSnapshot = {}) {
  const expectedHoldings = getPositiveAssetSnapshotHoldings(expectedSnapshot);
  if (!expectedHoldings.length) return [];

  const savedKeys = new Set(
    getPositiveAssetSnapshotHoldings(savedSnapshot)
      .map((item) => getAssetHoldingSaveKey(item))
      .filter(Boolean)
  );

  return expectedHoldings.filter((item) => {
    const key = getAssetHoldingSaveKey(item);
    return key && !savedKeys.has(key);
  });
}

function getInvalidSavedAssetHoldings(expectedSnapshot = {}, savedSnapshot = {}) {
  const expectedHoldings = getPositiveAssetSnapshotHoldings(expectedSnapshot);
  if (!expectedHoldings.length) return [];

  const savedByKey = new Map(
    getPositiveAssetSnapshotHoldings(savedSnapshot)
      .map((item) => [getAssetHoldingSaveKey(item), item])
      .filter(([key]) => key)
  );

  return expectedHoldings.filter((item) => {
    const savedItem = savedByKey.get(getAssetHoldingSaveKey(item));
    if (!savedItem) return false;
    return Number(savedItem.averagePrice) <= 0 || Number(savedItem.currentPrice) <= 0;
  });
}

function getInvalidAssetSnapshotHoldings(snapshot = {}) {
  return getPositiveAssetSnapshotHoldings(snapshot)
    .filter((item) => Number(item.averagePrice) <= 0 || Number(item.currentPrice) <= 0);
}

function assertSavableAssetSnapshot(snapshot = {}, { source = "user" } = {}) {
  if (!isUserAssetSaveSource(source)) return;
  if (source === "user_clear") return;

  const invalidHoldings = getInvalidAssetSnapshotHoldings(snapshot);
  if (!invalidHoldings.length) return;

  const invalidNames = invalidHoldings
    .slice(0, 3)
    .map((item) => item.name || item.code)
    .filter(Boolean)
    .join(", ");
  throw new Error(`저장할 수 없는 자산이 있습니다. 현재가 또는 평균단가를 다시 확인해 주세요: ${invalidNames || "확인 필요"}`);
}

function assertServerSavedAssetSnapshot(expectedSnapshot = {}, savedSnapshot = {}, { source = "user" } = {}) {
  if (!isUserAssetSaveSource(source)) return;
  if (source === "user_clear") return;

  const missingHoldings = getMissingSavedAssetHoldings(expectedSnapshot, savedSnapshot);
  if (missingHoldings.length) {
    const sampleNames = missingHoldings
      .slice(0, 3)
      .map((item) => item.name || item.code)
      .filter(Boolean)
      .join(", ");
    throw new Error(`서버 저장 확인에 실패했습니다. 저장되지 않은 자산: ${sampleNames || "확인 필요"}`);
  }

  const invalidHoldings = getInvalidSavedAssetHoldings(expectedSnapshot, savedSnapshot);
  if (!invalidHoldings.length) return;

  const invalidNames = invalidHoldings
    .slice(0, 3)
    .map((item) => item.name || item.code)
    .filter(Boolean)
    .join(", ");
  throw new Error(`서버 저장값을 확인하지 못했습니다. 현재가 또는 평균단가를 다시 확인해 주세요: ${invalidNames || "확인 필요"}`);
}

function applyUserAssetSnapshot(snapshot = {}) {
  assetLocalSnapshotSavedAt = String(snapshot.savedAt || snapshot.updatedAt || "").trim();
  assetCashBalance = Math.max(0, Math.round(Number(snapshot.cashBalance) || 0));
  applyAssetTrendHistoryFromSnapshot(snapshot);

  if (Array.isArray(snapshot.holdings) && snapshot.holdings.length) {
    replaceAssetHoldings(snapshot.holdings);
  } else {
    clearAssetHoldingsRuntime();
  }
}

function scheduleUserDataSave({ source = "user" } = {}) {
  if (!authState.authenticated) return;
  const userId = getCurrentUserStorageId();
  if (!userId) return;
  const snapshot = getAssetSnapshot();
  const hasLocalAssets = hasAssetSnapshotData(snapshot);
  const allowEmpty = shouldAllowEmptyAssetSave(source);

  if (userDataServerLoadedFor !== userId) {
    if (!hasLocalAssets && !allowEmpty) {
      if (userDataServerLoadingFor !== userId) {
        loadUserDataFromServer(userId);
      }
      return;
    }
    userDataServerSavePendingFor = userId;
    userDataServerSavePendingSource = source;
    if (userDataServerLoadingFor !== userId) {
      loadUserDataFromServer(userId);
    }
    return;
  }

  if (!hasLocalAssets && !allowEmpty) return;

  if (userDataServerSaveTimer) window.clearTimeout(userDataServerSaveTimer);
  userDataServerSaveTimer = window.setTimeout(() => {
    userDataServerSaveTimer = 0;
    saveUserAssetStateToServer({ allowEmpty, source }).catch((error) => {
      console.warn("Scheduled user asset save failed.", error);
    });
  }, 700);
}

async function saveUserAssetStateToServer({ allowEmpty = false, source = "user", waitForLoad = false } = {}) {
  if (!authState.authenticated) return false;
  const userId = getCurrentUserStorageId();
  if (!userId) return false;
  if (source === "user_clear") {
    assetTrendHistory = [];
  } else {
    recordAssetTrendSnapshot();
  }
  const snapshot = getAssetSnapshot();
  assertSavableAssetSnapshot(snapshot, { source });
  if (!hasAssetSnapshotData(snapshot) && !allowEmpty) return false;
  const saveStartedMutationVersion = userDataMutationVersion;

  if (userDataServerLoadedFor !== userId) {
    if (!hasAssetSnapshotData(snapshot) && !allowEmpty) {
      if (userDataServerLoadingFor !== userId) {
        loadUserDataFromServer(userId);
      }
      return false;
    }
    userDataServerSavePendingFor = userId;
    userDataServerSavePendingSource = source;
    const loadResult = loadUserDataFromServer(userId);
    if (waitForLoad) {
      const loaded = await loadResult;
      if (!loaded || userDataServerLoadedFor !== userId) {
        throw new Error("저장된 자산 데이터를 먼저 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } else {
      return false;
    }
  }

  try {
    const response = await fetchWithTimeout("/api/data", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        action: "save_assets",
        assets: snapshot,
        allowEmptyAssets: allowEmpty
      })
    });
    const { data, text } = await readApiJsonResponse(response);
    if (!response.ok || !data.ok) {
      throw new Error(getApiErrorMessage(response, data, text, "자산 데이터를 저장하지 못했습니다."));
    }

    if (response.ok && data.ok) {
      const savedAssets = data?.data?.assets || {};
      assertServerSavedAssetSnapshot(snapshot, savedAssets, { source });
      userDataServerLoadedFor = userId;
      if (saveStartedMutationVersion === userDataMutationVersion) {
        applyUserAssetSnapshot(savedAssets);
        clearPendingUserAssetSave();
        clearPlainAssetStateFromStorage(pendingAssetStorageCleanupKey || undefined);
        pendingAssetStorageCleanupKey = "";
      }

      setDatabaseState({
        checked: true,
        connected: true,
        data: summarizeDatabaseData(data.data || {}),
        message: "Cloudflare D1에 자동 저장되었습니다.",
        error: ""
      });
    }
    return true;
  } catch (error) {
    console.warn("User asset data could not be saved to the server.", error);
    throw error;
  }
}

async function loadUserDataFromServer(userId = getCurrentUserStorageId()) {
  if (!authState.authenticated || !userId) return false;
  if (userDataServerLoadedFor === userId) return true;
  if (userDataServerLoadingFor === userId && userDataServerLoadPromiseFor === userId && userDataServerLoadPromise) {
    return userDataServerLoadPromise;
  }

  userDataServerLoadingFor = userId;
  userDataServerLoadPromiseFor = userId;
  userDataServerLoadError = "";
  userDataServerLoadPromise = doLoadUserDataFromServer(userId);
  return userDataServerLoadPromise;
}

async function doLoadUserDataFromServer(userId) {
  const localAssetSnapshotAtStart = getAssetSnapshot({ savedAt: assetLocalSnapshotSavedAt });
  const loadStartedMutationVersion = userDataMutationVersion;
  const loadStartedJournalMutationVersion = userJournalMutationVersion;

  try {
    const response = await fetchWithTimeout("/api/data", {
      credentials: "include",
      headers: { Accept: "application/json" }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || `자산 데이터를 불러오지 못했습니다. (HTTP ${response.status})`);
    }
    if (getCurrentUserStorageId() !== userId) return false;
    userDataServerLoadError = "";

    const remoteData = payload.data || {};
    const remoteAssets = remoteData.assets || {};
    const remoteStockFavorites = Array.isArray(remoteData.stockFavorites) ? remoteData.stockFavorites : [];
    const remoteJournalRecords = mergeRemoteJournalRecords(remoteData.journalRecords, remoteData.trades);
    const remoteAssetTrendHistory = getAssetTrendHistoryFromSnapshot(remoteAssets);
    const pendingAssetSave = userDataServerSavePendingFor === userId;
    const pendingSource = userDataServerSavePendingSource;
    const assetChangedDuringLoad = loadStartedMutationVersion !== userDataMutationVersion;
    const journalChangedDuringLoad = loadStartedJournalMutationVersion !== userJournalMutationVersion;
    const localAssetSnapshot = pendingAssetSave || assetChangedDuringLoad ? getAssetSnapshot() : localAssetSnapshotAtStart;
    const localHasAssets = hasAssetSnapshotData(localAssetSnapshot);
    const pendingAllowsEmpty = shouldAllowEmptyAssetSave(pendingSource);
    const pendingCanOverwriteRemote = isUserAssetSaveSource(pendingSource);
    const shouldApplyStockFavorites = stockFavoritesServerSavePendingFor !== userId;
    const shouldApplyJournalRecords = userJournalServerSavePendingFor !== userId && !journalChangedDuringLoad;
    if (shouldApplyStockFavorites) {
      applyUserStockFavorites(remoteStockFavorites);
    }
    if (shouldApplyJournalRecords) {
      applyUserJournalRecords(remoteJournalRecords);
    }

    if (pendingAssetSave) {
      userDataServerLoadedFor = userId;
      clearPendingUserAssetSave();

      if (pendingCanOverwriteRemote && (localHasAssets || pendingAllowsEmpty)) {
        if (!pendingAllowsEmpty) {
          assetTrendHistory = mergeAssetTrendHistories(remoteAssetTrendHistory, assetTrendHistory);
        }
        await saveUserAssetStateToServer({ allowEmpty: pendingAllowsEmpty, source: pendingSource });
      } else {
        applyUserAssetSnapshot(remoteAssets);
        render();
      }
    } else if (shouldPreferLocalAssetSnapshot(localAssetSnapshot, remoteAssets)) {
      userDataServerLoadedFor = userId;
      assetTrendHistory = mergeAssetTrendHistories(remoteAssetTrendHistory, assetTrendHistory);
      if (journalChangedDuringLoad) {
        render();
      } else {
        await saveUserAssetStateToServer({ source: "migration" });
      }
    } else {
      applyUserAssetSnapshot(remoteAssets);
      userDataServerLoadedFor = userId;
      render();
    }

    if (stockFavoritesServerSavePendingFor === userId) {
      stockFavoritesServerSavePendingFor = "";
      await saveStockFavoritesToServer();
    }

    if (userJournalServerSavePendingFor === userId) {
      userJournalServerSavePendingFor = "";
      await saveJournalRecordsToServer();
    }

    queueStoredAssetMarketPriceRefresh({ delay: 0, syncRemote: true });
    refreshStockFavoritesMarketPrices({ syncRemote: true }).catch((error) => {
      console.warn("Stock favorite prices could not be refreshed.", error);
    });
    if (shouldApplyStockFavorites && getRoute() === "stock") render();
    return true;
  } catch (error) {
    console.warn("User data could not be loaded from the server.", error);
    userDataServerLoadError = error?.message || "저장된 자산 데이터를 불러오지 못했습니다.";
    queueStoredAssetMarketPriceRefresh({ delay: 0, syncRemote: false });
    return false;
  } finally {
    if (userDataServerLoadingFor === userId) userDataServerLoadingFor = "";
    if (userDataServerLoadPromiseFor === userId) {
      userDataServerLoadPromise = null;
      userDataServerLoadPromiseFor = "";
    }
    if (getCurrentUserStorageId() === userId && isAuthRequiredRoute(getRoute())) {
      window.setTimeout(() => {
        if (getCurrentUserStorageId() === userId && userDataServerLoadingFor !== userId) render();
      }, 0);
    }
  }
}

function loadMemoStateFromStorage() {
  userMemos = [];
  if (typeof localStorage === "undefined") return;

  const storageKey = getUserScopedStorageKey(memoStorageKey);
  if (!storageKey) return;

  try {
    const rawState = localStorage.getItem(storageKey);
    if (!rawState) return;

    const state = JSON.parse(rawState);
    userMemos = Array.isArray(state?.memos) ? state.memos : [];
  } catch (error) {
    console.warn("Saved memo data could not be loaded.", error);
  }
}

function initializeUserDataState({ force = false } = {}) {
  const userId = getCurrentUserStorageId();
  if (!userId) return;
  if (!authState.authenticated) return;

  if (!force && userDataInitializedFor === userId) {
    if (userDataServerLoadedFor !== userId && userDataServerLoadingFor !== userId) {
      loadUserDataFromServer(userId);
    }
    return;
  }

  userDataInitializedFor = userId;
  clearRuntimeUserData();
  loadAssetStateFromStorage();
  loadMemoStateFromStorage();
  loadUserDataFromServer(userId);
}

function renderSidebarUser() {
  const root = document.querySelector("#sidebarUserRoot");
  if (!root) return;

  const user = getCurrentUser();
  const isAuthenticated = Boolean(authState.authenticated || user?.email);
  if (!isAuthenticated) {
    sidebarUserMenuOpen = false;
    root.innerHTML = "";
    return;
  }

  const name = getUserDisplayName(user);
  const email = getUserEmail(user);

  root.innerHTML = `
    <div class="sidebar-user ${sidebarUserMenuOpen ? "open" : ""}" data-sidebar-user-panel>
      <button class="sidebar-user-card" type="button" data-sidebar-user-toggle aria-expanded="${sidebarUserMenuOpen ? "true" : "false"}">
        ${renderUserAvatar(user, "sidebar-user-avatar")}
        <span class="sidebar-user-meta">
          <strong>${escapeHtml(name)}</strong>
          <span>${escapeHtml(email)}</span>
        </span>
        <span class="sidebar-user-caret" aria-hidden="true">${icon("chevronRight")}</span>
      </button>
      <div class="sidebar-user-menu" role="menu" aria-label="사용자 메뉴">
        <button class="sidebar-user-menu-button" type="button" data-auth-logout role="menuitem">
          ${icon("logout")}
          <span>로그아웃</span>
        </button>
      </div>
    </div>
  `;
}

function setAuthenticatedUser(user) {
  authState = {
    checked: true,
    checking: false,
    authenticated: true,
    user: user || null
  };

  try {
    localStorage.setItem("trading-note-auth-user", JSON.stringify(user || null));
  } catch (error) {
    console.warn("로그인 사용자 정보를 브라우저 저장소에 저장하지 못했습니다.", error);
  }

  const userId = getCurrentUserStorageId();
  initializeUserDataState({
    force: userDataInitializedFor !== userId || (userDataServerLoadedFor !== userId && userDataServerLoadingFor !== userId)
  });
}

function clearAuthenticatedUser() {
  authState = {
    checked: true,
    checking: false,
    authenticated: false,
    user: null
  };

  try {
    localStorage.removeItem("trading-note-auth-user");
  } catch (error) {
    console.warn("로그인 사용자 정보를 브라우저 저장소에서 제거하지 못했습니다.", error);
  }

  userDataInitializedFor = "";
  userDataServerLoadedFor = "";
  userDataServerLoadingFor = "";
  userDataServerLoadPromise = null;
  userDataServerLoadPromiseFor = "";
  userDataServerLoadError = "";
  clearPendingUserAssetSave();
  if (userDataServerSaveTimer) window.clearTimeout(userDataServerSaveTimer);
  userDataServerSaveTimer = 0;
  pendingAssetStorageCleanupKey = "";
  clearRuntimeUserData();
}

function isAuthRequiredRoute(route) {
  return authRequiredRoutes.has(route);
}

async function checkAuthSession({ force = false } = {}) {
  if (!force && authState.checked) return authState;
  if (authCheckPromise) return authCheckPromise;

  authState.checking = true;
  authCheckPromise = fetch("/api/auth?action=session", {
    credentials: "include",
    headers: { Accept: "application/json" }
  })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.authenticated && data.registered) {
        setAuthenticatedUser(data.user);
        return authState;
      }

      clearAuthenticatedUser();
      return authState;
    })
    .catch(() => {
      clearAuthenticatedUser();
      return authState;
    })
    .finally(() => {
      authCheckPromise = null;
    });

  return authCheckPromise;
}

function renderAuthGate(message = "로그인 상태를 확인하고 있습니다.") {
  return `
    <div class="auth-gate">
      <div class="auth-gate-panel">
        <span class="auth-gate-icon">${icon("shield")}</span>
        <strong>${message}</strong>
        <p>잠시만 기다려주세요.</p>
      </div>
    </div>
  `;
}

function renderUserDataLoadError() {
  return `
    <div class="auth-gate">
      <div class="auth-gate-panel">
        <span class="auth-gate-icon">${icon("warning")}</span>
        <strong>저장된 자산 데이터를 불러오지 못했습니다.</strong>
        <p>${escapeHtml(userDataServerLoadError || "잠시 후 다시 시도해 주세요.")}</p>
        <button class="btn primary" type="button" data-user-data-retry>다시 불러오기</button>
      </div>
    </div>
  `;
}

function logoutUser() {
  fetch("/api/auth", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({ action: "logout" })
  }).catch(() => {});

  if (window.google?.accounts?.id) {
    window.google.accounts.id.disableAutoSelect();
  }
  clearAuthenticatedUser();
  activeModal = null;
  mobileSheetOpen = false;
  sidebarUserMenuOpen = false;
  setDatabaseState({
    checked: false,
    loading: false,
    saving: false,
    connected: false,
    data: null,
    message: "",
    error: ""
  });
  window.location.hash = "landing";
  render();
}

function loadAssetXlsxLibrary() {
  if (window.XLSX?.utils) return Promise.resolve(true);
  if (assetXlsxLibraryPromise) return assetXlsxLibraryPromise;

  assetXlsxLibraryPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = assetXlsxLibraryUrl;
    script.async = true;
    script.onload = () => {
      if (window.XLSX?.utils) {
        resolve(true);
        return;
      }
      assetXlsxLibraryPromise = null;
      reject(new Error("엑셀 라이브러리를 불러오지 못했습니다."));
    };
    script.onerror = () => {
      assetXlsxLibraryPromise = null;
      reject(new Error("엑셀 라이브러리를 불러오지 못했습니다."));
    };
    document.head.appendChild(script);
  });

  return assetXlsxLibraryPromise;
}

function normalizeAssetSpreadsheetHeader(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .replace(/[()[\]{}]/g, "")
    .toLowerCase();
}

function getCanonicalAssetSpreadsheetField(header) {
  const key = normalizeAssetSpreadsheetHeader(header);
  return Object.entries(assetSpreadsheetColumnAliases).find(([, aliases]) =>
    aliases.some((alias) => normalizeAssetSpreadsheetHeader(alias) === key)
  )?.[0] || "";
}

function parseAssetSheetNumber(value) {
  if (typeof value === "number") return Math.max(0, value);
  const text = String(value ?? "").trim();
  if (!text || text === "-") return 0;
  const normalized = text.replace(/[,원주%]/g, "").replace(/[^0-9.]/g, "");
  return Math.max(0, Number(normalized) || 0);
}

function normalizeAssetRowInput(item) {
  const modeText = String(item.priceInputMode || "").trim().toLowerCase();
  const quantity = parseAssetSheetNumber(item.quantity);
  let averagePrice = parseAssetSheetNumber(item.averagePrice);
  let currentPrice = parseAssetSheetNumber(item.currentPrice);
  const currency = String(item.currency || "").trim().toUpperCase();
  const marketPrice = parseAssetDecimalInput(item.marketPrice);
  const exchangeRateToKrw = parseAssetDecimalInput(item.exchangeRateToKrw);
  const convertedMarketPrice = currency && currency !== "KRW" && marketPrice > 0 && exchangeRateToKrw > 0
    ? convertMarketPriceToKrwUnitPrice(marketPrice, exchangeRateToKrw)
    : 0;

  if (!currentPrice && convertedMarketPrice) currentPrice = convertedMarketPrice;
  if (!currentPrice && averagePrice) currentPrice = averagePrice;
  if (!averagePrice && currentPrice) averagePrice = currentPrice;

  const priceInputMode = modeText.includes("수량") || modeText.includes("quantity")
    ? "quantity"
    : "full";

  return {
    name: String(item.name || "").trim(),
    code: String(item.code || "").trim(),
    quantity,
    averagePrice,
    currentPrice,
    priceInputMode,
    type: String(item.type || "").trim(),
    quoteType: String(item.quoteType || "").trim(),
    market: String(item.market || "").trim(),
    exchange: String(item.exchange || "").trim(),
    source: String(item.source || "").trim(),
    logoUrl: String(item.logoUrl || "").trim(),
    currency,
    marketPrice,
    exchangeRateToKrw,
    priceDisplayCurrency: String(item.priceDisplayCurrency || "").trim().toUpperCase()
  };
}

function validateAssetRows(rows) {
  if (!rows.length) return "최소 1개 이상의 자산을 입력하세요.";

  const duplicateKeys = new Set();
  for (const row of rows) {
    if (!row.name) return "종목명을 입력하세요.";
    if (!row.quantity) return "보유 수량은 1 이상으로 입력하세요.";
    if (!row.currentPrice) return "현재가 또는 매수평균가를 입력하세요.";
    if (!row.averagePrice) return "매수평균가 또는 현재가를 입력하세요.";

    const key = normalizeStockKey(`${row.name}-${row.code || row.name}`);
    if (duplicateKeys.has(key)) return "같은 자산이 중복되어 있습니다.";
    duplicateKeys.add(key);
  }

  return "";
}

function replaceAssetHoldings(rows) {
  const normalizedRows = rows.map((row) => normalizeAssetRowInput(row));
  const validationError = validateAssetRows(normalizedRows);
  if (validationError) {
    assetSettingsError = validationError;
    assetSettingsMessage = "";
    return false;
  }

  holdings.splice(
    0,
    holdings.length,
    ...normalizedRows.map((row) => {
      const amount = Math.round(row.quantity * row.currentPrice);
      const costBasis = Math.round(row.quantity * row.averagePrice);
      const profit = amount - costBasis;
      const rate = costBasis ? (profit / costBasis) * 100 : 0;
      return [
        row.name,
        formatMarketNumber(row.quantity),
        formatMarketNumber(amount),
        formatSignedMarketNumber(profit),
        formatSignedRate(rate),
        "0%",
        row.code,
        row.type,
        row.quoteType,
        row.market,
        row.exchange,
        row.source,
        row.logoUrl,
        row.currency,
        row.marketPrice,
        row.exchangeRateToKrw,
        row.priceDisplayCurrency
      ];
    })
  );

  if (typeof watchList !== "undefined") watchList.splice(0, watchList.length);

  normalizedRows.forEach((row) => {
    const watchRow = typeof findWatchListRow === "function" ? findWatchListRow(row.name, row.code) : null;
    if (watchRow) {
      watchRow[0] = row.name;
      watchRow[1] = row.code;
      watchRow[2] = formatMarketNumber(row.currentPrice);
      watchRow[3] = watchRow[3] || "+0.00%";
      watchRow[4] = watchRow[4] || "0";
      watchRow[5] = row.type;
      watchRow[6] = row.quoteType;
      watchRow[7] = row.market;
      watchRow[8] = row.exchange;
      watchRow[9] = row.source;
      watchRow[10] = row.logoUrl;
      watchRow[11] = row.currency;
      watchRow[12] = row.marketPrice;
      watchRow[13] = row.exchangeRateToKrw;
      watchRow[14] = row.priceDisplayCurrency;
      return;
    }

    if (typeof watchList !== "undefined") {
      watchList.push([
        row.name,
        row.code,
        formatMarketNumber(row.currentPrice),
        "+0.00%",
        "0",
        row.type,
        row.quoteType,
        row.market,
        row.exchange,
        row.source,
        row.logoUrl,
        row.currency,
        row.marketPrice,
        row.exchangeRateToKrw,
        row.priceDisplayCurrency
      ]);
    }
  });

  assetSettingsError = "";
  assetHoldingsRevision += 1;
  return true;
}

function clearPlainAssetStateFromStorage(storageKey = getUserScopedStorageKey(assetStorageKey)) {
  if (typeof localStorage === "undefined" || !storageKey) return;

  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.warn("브라우저의 평문 자산 캐시를 제거하지 못했습니다.", error);
  }
}

function saveAssetStateToStorage({ syncRemote = true, source = "user", immediate = false } = {}) {
  if (isUserAssetSaveSource(source)) {
    markUserDataMutation();
  }

  if (source === "user_clear") {
    assetTrendHistory = [];
  } else {
    recordAssetTrendSnapshot();
  }
  const snapshot = getAssetSnapshot();
  assetLocalSnapshotSavedAt = snapshot.savedAt || "";
  const storageKey = getUserScopedStorageKey(assetStorageKey);

  if (typeof localStorage !== "undefined" && storageKey) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(snapshot));
      pendingAssetStorageCleanupKey = storageKey;
    } catch (error) {
      console.warn("Asset fallback cache could not be written.", error);
    }
  }

  if (syncRemote) {
    if (immediate) {
      return saveUserAssetStateToServer({
        allowEmpty: shouldAllowEmptyAssetSave(source),
        source,
        waitForLoad: true
      });
    }
    scheduleUserDataSave({ source });
  }

  return Promise.resolve(false);
}

function loadAssetStateFromStorage() {
  if (typeof localStorage === "undefined") return;

  try {
    const storageKey = getUserScopedStorageKey(assetStorageKey);
    if (!storageKey) return;

    const rawState = localStorage.getItem(storageKey);
    if (!rawState) return;

    const state = JSON.parse(rawState);
    pendingAssetStorageCleanupKey = storageKey;
    assetLocalSnapshotSavedAt = String(state.savedAt || state.updatedAt || "").trim();
    applyAssetTrendHistoryFromSnapshot(state);
    if (Number.isFinite(Number(state.cashBalance))) {
      assetCashBalance = Math.max(0, Math.round(Number(state.cashBalance)));
    }

    if (Array.isArray(state.holdings)) {
      if (state.holdings.length) {
        replaceAssetHoldings(state.holdings);
      } else {
        clearAssetHoldingsRuntime();
      }
      assetSettingsError = "";
      assetSettingsMessage = "";
    }
  } catch (error) {
    console.warn("저장된 자산 데이터를 불러오지 못했습니다.", error);
  }
}

function escapeAssetCsvCell(value) {
  const text = value == null ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function buildAssetCsv(rows) {
  const lines = [
    assetSpreadsheetHeaders,
    ...rows.map((row) => assetSpreadsheetHeaders.map((header) => row[header] ?? ""))
  ];
  return `\uFEFF${lines.map((line) => line.map(escapeAssetCsvCell).join(",")).join("\r\n")}`;
}

function downloadAssetBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function getAssetSpreadsheetRows() {
  const holdingData = typeof getHoldingData === "function" ? getHoldingData() : [];
  return holdingData.map((item) => ({
    "종목명": item.name,
    "종목코드": item.code,
    "보유수량": item.quantity,
    "매수평균가": item.averagePrice,
    "현재가": item.currentPrice,
    "통화": item.currency || "KRW",
    "외화현재가": item.marketPrice || item.currentPrice,
    "환율": item.exchangeRateToKrw || 1,
    "입력방식": "수량+평단",
    "자산유형": getAssetMarketLabel(item),
    "시장": item.market || "",
    "거래소": item.exchange || "",
    "평가금액": item.amount,
    "매수금액": item.costBasis,
    "평가손익": item.profit,
    "수익률": Number(item.rate.toFixed(2))
  }));
}

function getAssetSnapshot(options = {}) {
  const savedAt = Object.prototype.hasOwnProperty.call(options, "savedAt")
    ? String(options.savedAt || "").trim()
    : new Date().toISOString();
  const holdingData = typeof getHoldingData === "function" ? getHoldingData() : [];
  return {
    version: 1,
    savedAt,
    cashBalance: assetCashBalance,
    trendHistory: normalizeAssetTrendHistory(assetTrendHistory),
    holdings: holdingData.map((item) => ({
      name: item.name,
      code: item.code,
      quantity: item.quantity,
      averagePrice: item.averagePrice,
      currentPrice: item.currentPrice,
      priceInputMode: item.priceInputMode || "full",
      type: item.type || "",
      quoteType: item.quoteType || "",
      market: item.market || "",
      exchange: item.exchange || "",
      source: item.source || "",
      logoUrl: item.logoUrl || "",
      currency: item.currency || "",
      marketPrice: item.marketPrice || 0,
      exchangeRateToKrw: item.exchangeRateToKrw || 0,
      priceDisplayCurrency: item.priceDisplayCurrency || "",
      amount: item.amount,
      costBasis: item.costBasis,
      profit: item.profit,
      rate: Number(item.rate.toFixed(2))
    }))
  };
}

function setDatabaseState(nextState) {
  databaseState = {
    ...databaseState,
    ...nextState
  };
}

async function readApiJsonResponse(response) {
  const text = await response.text();
  try {
    return { data: text ? JSON.parse(text) : {}, text };
  } catch (error) {
    return { data: {}, text };
  }
}

async function fetchWithTimeout(input, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("요청 시간이 초과되었습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.");
    }
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

function getApiErrorMessage(response, data, text, fallback) {
  if (data?.error) return data.error;
  const cleanText = String(text || "").trim();
  if (cleanText && !cleanText.startsWith("<")) return cleanText.slice(0, 500);
  return `${fallback} (HTTP ${response.status})`;
}

function formatStorageDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function summarizeDatabaseData(data = {}) {
  const assets = data.assets || {};
  const stockFavorites = Array.isArray(data.stockFavorites) ? data.stockFavorites : [];
  return {
    updatedAt: data.updatedAt || assets.savedAt || "",
    assetCount: Array.isArray(assets.holdings) ? assets.holdings.length : 0,
    cashBalance: Number(assets.cashBalance || 0),
    stockFavoriteCount: stockFavorites.length
  };
}

function normalizeStockSymbolCode(symbol = "") {
  return String(symbol || "").trim().replace(/\.(KS|KQ)$/i, "");
}

function getCanonicalStockSymbol(value = "") {
  return String(value || "").trim().toUpperCase();
}

function getCanonicalDomesticStockCode(value = "") {
  const normalized = normalizeStockSymbolCode(getCanonicalStockSymbol(value));
  return /^\d{6}$/.test(normalized) ? normalized : "";
}

function getStockItemKey(item = {}) {
  item = item || {};
  const symbol = getCanonicalStockSymbol(item.symbol);
  const domesticSymbolCode = getCanonicalDomesticStockCode(symbol);
  if (domesticSymbolCode) return `KRX:${domesticSymbolCode}`;
  if (symbol) return symbol;

  const code = getCanonicalStockSymbol(item.code);
  const domesticCode = getCanonicalDomesticStockCode(code);
  if (domesticCode) return `KRX:${domesticCode}`;

  const exchange = String(item.exchange || item.market || "").trim().toUpperCase();
  if (code) return `${exchange || "MARKET"}:${code}`;
  return normalizeStockKey(item.name || "");
}

function getStockItemDisplayName(item = {}) {
  item = item || {};
  return String(item.name || item.symbol || item.code || "선택 종목").trim();
}

function getStockInitials(item = {}) {
  const source = getStockItemDisplayName(item).replace(/\s+/g, "");
  return (source.slice(0, 2) || "TN").toUpperCase();
}

function getStockAvatarColor(item = {}) {
  const marketLabel = getStockMarketLabel(item).toUpperCase();
  const quoteType = String(item.quoteType || "").toUpperCase();
  if (marketLabel === "KOSPI") return "#2474f2";
  if (marketLabel === "KOSDAQ") return "#0ea5e9";
  if (marketLabel === "KONEX") return "#38bdf8";
  if (marketLabel === "암호화폐" || quoteType === "CRYPTOCURRENCY") return "#10b981";
  if (marketLabel === "ETF" || quoteType === "ETF") return "#7c3aed";
  if (marketLabel === "선물" || quoteType === "FUTURE") return "#f59e0b";

  const key = getStockItemKey(item);
  if (typeof getAssetPortfolioColor === "function") return getAssetPortfolioColor(32, key);

  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  const colors = ["#2474f2", "#16a34a", "#7c3aed", "#0891b2", "#dc2626", "#ea580c"];
  return colors[hash % colors.length];
}

function renderStockAvatar(item = {}, className = "stock-symbol-avatar") {
  return `<span class="${className}" style="--stock-avatar-color:${getStockAvatarColor(item)}">${escapeChartText(getStockInitials(item))}</span>`;
}

function getStockMarketLabel(item = {}) {
  const label = typeof getAssetMarketLabel === "function" ? getAssetMarketLabel(item) : "";
  if (label) return label;

  const quoteType = String(item.quoteType || "").toUpperCase();
  if (quoteType === "CRYPTOCURRENCY") return "암호화폐";
  if (quoteType === "ETF") return "ETF";

  const market = String(item.market || item.exchange || "").trim();
  if (/KOSDAQ/i.test(market)) return "KOSDAQ";
  if (/KOSPI|KSC|KRX/i.test(market)) return "KOSPI";
  return market || (String(item.code || "").match(/^\d{6}$/) ? "KOSPI" : "시장");
}

function normalizeStockAnalysisItem(item = {}) {
  item = item || {};
  const symbol = String(item.symbol || "").trim();
  const code = String(item.code || normalizeStockSymbolCode(symbol)).trim();
  const currency = normalizeAssetCurrency(item.currency || (Number(item.currentPriceKrw || 0) ? "KRW" : ""));
  const exchangeRateToKrw = Math.max(0, Number(item.exchangeRateToKrw) || (currency === "KRW" ? 1 : 0));
  const parsedPriceText = parseMarketNumber(item.priceText || item.price);
  const marketPrice = Math.max(0, Number(item.currentPrice || item.marketPrice || item.price || 0));
  const currentPriceKrw = Number(item.currentPriceKrw || 0) > 0
    ? roundAssetKrwUnitPrice(Number(item.currentPriceKrw))
    : currency === "KRW" && marketPrice > 0
      ? roundAssetKrwUnitPrice(marketPrice)
      : marketPrice && exchangeRateToKrw
        ? convertMarketPriceToKrwUnitPrice(marketPrice, exchangeRateToKrw)
        : parsedPriceText;
  const rawChange = typeof item.change === "string" ? parseSignedMarketNumber(item.change) : Number(item.change || 0);
  const rawRate = Number.isFinite(Number(item.changeRate))
    ? Number(item.changeRate)
    : Number(String(item.rate || "").replace(/[^0-9.-]/g, "")) || 0;

  return {
    name: getStockItemDisplayName(item),
    code,
    symbol: symbol || code,
    type: String(item.type || "").trim(),
    quoteType: String(item.quoteType || "").trim(),
    market: String(item.market || "").trim(),
    exchange: String(item.exchange || "").trim(),
    industry: String(item.industry || "").trim(),
    currency: currency || (currentPriceKrw ? "KRW" : ""),
    currentPrice: marketPrice || currentPriceKrw,
    currentPriceKrw,
    exchangeRateToKrw,
    change: rawChange,
    changeRate: rawRate,
    source: String(item.source || "").trim(),
    savedAt: item.savedAt || ""
  };
}

function stockMarketResultToItem(result = {}, current = {}) {
  const patch = typeof getAssetMarketResultPatch === "function"
    ? getAssetMarketResultPatch(result, current, { includeIdentity: true })
    : {};
  return normalizeStockAnalysisItem({
    ...current,
    ...result,
    ...patch,
    currentPrice: result.currentPrice || patch.marketPrice || patch.currentPrice || current.currentPrice,
    currentPriceKrw: result.currentPriceKrw || patch.currentPrice || current.currentPriceKrw,
    change: result.change,
    changeRate: result.changeRate
  });
}

function getStockAnalysisDefaultStock() {
  const favorite = stockFavoriteItems[0];
  if (favorite) return normalizeStockAnalysisItem(favorite);
  return null;
}

function getStockAnalysisSelectedStock() {
  if (stockAnalysisSelected) return normalizeStockAnalysisItem(stockAnalysisSelected);
  return getStockAnalysisDefaultStock();
}

function getStockAnalysisPriceMeta(item = getStockAnalysisSelectedStock()) {
  if (!item) return { value: 0, text: "-", currency: "" };
  const stock = normalizeStockAnalysisItem(item);
  if (stock.currentPriceKrw) {
    return {
      value: stock.currentPriceKrw,
      text: `${formatMarketNumber(stock.currentPriceKrw)}원`,
      currency: "KRW"
    };
  }

  const price = Number(stock.currentPrice || 0);
  const currency = stock.currency || "";
  return {
    value: price,
    text: price ? `${price.toLocaleString(undefined, { maximumFractionDigits: 6 })}${currency ? ` ${currency}` : ""}` : "-",
    currency
  };
}

function getStockAnalysisChangeMeta(item = getStockAnalysisSelectedStock()) {
  if (!item) return { change: 0, changeRate: 0, text: "+0 (+0.00%)", className: "text-red" };
  const stock = normalizeStockAnalysisItem(item);
  const changeRate = Number(stock.changeRate || 0);
  const currency = stock.currency || "";
  const changeKrw = stock.currentPriceKrw && currency !== "KRW" && stock.exchangeRateToKrw
    ? Number(stock.change || 0) * stock.exchangeRateToKrw
    : Number(stock.change || 0);
  const changeText = stock.currentPriceKrw || currency === "KRW"
    ? `${formatSignedMarketNumber(changeKrw)}원`
    : `${changeKrw >= 0 ? "+" : "-"}${Math.abs(changeKrw).toLocaleString(undefined, { maximumFractionDigits: 4 })}${currency ? ` ${currency}` : ""}`;

  return {
    change: changeKrw,
    changeRate,
    text: `${changeText} (${formatSignedRate(changeRate)})`,
    className: changeKrw >= 0 ? "text-red" : "text-blue"
  };
}

function getStockChartPeriodConfig(period = stockChartPeriod) {
  return stockChartPeriodOptions.find((item) => item.key === period) || stockChartPeriodOptions[0];
}

function renderStockChartControls() {
  return stockChartPeriodOptions
    .map((item) => `<button class="${item.key === stockChartPeriod ? "active" : ""}" type="button" data-stock-chart-period="${item.key}">${item.label}</button>`)
    .join("");
}

function getStockChartSymbol(item = getStockAnalysisSelectedStock()) {
  if (!item) return "";
  const stock = normalizeStockAnalysisItem(item);
  const symbol = String(stock.symbol || "").trim();
  if (symbol && symbol !== stock.code) return symbol;

  const code = String(stock.code || symbol || "").trim();
  if (/^\d{6}$/.test(code)) {
    const market = getStockMarketLabel(stock).toUpperCase();
    return `${code}.${market === "KOSDAQ" ? "KQ" : "KS"}`;
  }

  return code || stock.name;
}

function getStockChartKey(item = getStockAnalysisSelectedStock(), period = stockChartPeriod) {
  if (!item) return "";
  const symbol = getStockChartSymbol(item);
  return symbol ? `${symbol.toUpperCase()}:${period}` : "";
}

function renderStockAnalysisCandleChart(selected = getStockAnalysisSelectedStock()) {
  const chartKey = getStockChartKey(selected);
  const hasCurrentCandles = stockChartState.key === chartKey && Array.isArray(stockChartState.candles) && stockChartState.candles.length >= 2;

  if (stockChartState.key === chartKey && stockChartState.loading) {
    return `
      <div class="stock-chart-status">
        <span class="status-icon">${icon("chart")}</span>
        <strong>차트 데이터를 불러오고 있습니다.</strong>
      </div>
      ${candleChart(selected, { candles: hasCurrentCandles ? stockChartState.candles : [] })}
    `;
  }

  if (stockChartState.key === chartKey && stockChartState.error && !hasCurrentCandles) {
    return `
      <div class="stock-chart-status error">
        <span class="status-icon red">${icon("warning")}</span>
        <strong>${escapeHtml(stockChartState.error)}</strong>
      </div>
      ${candleChart(selected)}
    `;
  }

  return candleChart(selected, { candles: hasCurrentCandles ? stockChartState.candles : [] });
}

async function loadStockChartForSelection(item = getStockAnalysisSelectedStock(), { force = false } = {}) {
  if (!item) return false;
  const stock = normalizeStockAnalysisItem(item);
  const config = getStockChartPeriodConfig();
  const symbol = getStockChartSymbol(stock);
  const key = getStockChartKey(stock, config.key);
  if (!symbol || !key) return false;
  if (!force && stockChartState.key === key && (stockChartState.loading || stockChartState.candles.length || stockChartState.error)) return true;

  const requestId = stockChartState.requestId + 1;
  stockChartState = {
    key,
    loading: true,
    error: "",
    candles: stockChartState.key === key ? stockChartState.candles : [],
    requestId
  };
  if (getRoute() === "stock") render();

  try {
    const chart = await fetchMarketChart(symbol, config);
    const payload = { error: "Chart data could not be loaded.", chart };
    if (stockChartState.requestId !== requestId) return false;
    if (!payload.chart) {
      throw new Error(payload.error || "차트 데이터를 불러오지 못했습니다.");
    }

    const candles = Array.isArray(payload.chart?.candles) ? payload.chart.candles : [];
    stockChartState = {
      key,
      loading: false,
      error: candles.length >= 2 ? "" : "표시할 차트 데이터가 충분하지 않습니다.",
      candles,
      requestId
    };
    if (getRoute() === "stock") render();
    return true;
  } catch (error) {
    if (stockChartState.requestId !== requestId) return false;
    stockChartState = {
      key,
      loading: false,
      error: error?.message || "차트 데이터를 불러오지 못했습니다.",
      candles: [],
      requestId
    };
    if (getRoute() === "stock") render();
    return false;
  }
}

function ensureStockChartForSelection() {
  const selected = getStockAnalysisSelectedStock();
  if (!selected) return;
  const key = getStockChartKey(selected);
  if (!key) return;
  if (stockChartState.key === key && (stockChartState.loading || stockChartState.candles.length || stockChartState.error)) return;
  window.setTimeout(() => {
    if (getRoute() === "stock") loadStockChartForSelection(selected).catch((error) => {
      console.warn("Stock chart could not be loaded.", error);
    });
  }, 0);
}

function getStockNewsKey(item = getStockAnalysisSelectedStock()) {
  if (!item) return "";
  return getStockItemKey(item);
}

function formatStockNewsDate(value) {
  const time = Date.parse(value || "");
  if (!Number.isFinite(time)) return "";
  const date = new Date(time);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}/${day}`;
}

function renderStockNewsRows(selected = getStockAnalysisSelectedStock()) {
  const key = getStockNewsKey(selected);
  if (!selected || !key) return "";

  if (stockNewsState.key === key && stockNewsState.loading) {
    return `<div class="list-row news-row"><p class="news-title">뉴스를 불러오고 있습니다.</p><span class="tiny">-</span></div>`;
  }

  if (stockNewsState.key === key && stockNewsState.items.length) {
    return stockNewsState.items.map((item) => {
      const dateText = formatStockNewsDate(item.publishedAt) || item.publisher || "";
      const content = `
        <p class="news-title">${escapeChartText(item.title)}</p>
        <span class="tiny">${escapeChartText(dateText)}</span>
      `;
      return item.link
        ? `<a class="list-row news-row stock-news-link" href="${escapeChartText(item.link)}" target="_blank" rel="noopener noreferrer">${content}</a>`
        : `<div class="list-row news-row">${content}</div>`;
    }).join("");
  }

  if (stockNewsState.key === key && stockNewsState.error) {
    return `<div class="list-row news-row"><p class="news-title">${escapeChartText(stockNewsState.error)}</p><span class="tiny">-</span></div>`;
  }

  if (stockNewsState.key === key && !stockNewsState.loading) {
    return `<div class="list-row news-row"><p class="news-title">불러온 뉴스가 없습니다.</p><span class="tiny">-</span></div>`;
  }

  return `<div class="list-row news-row"><p class="news-title">${escapeChartText(selected.name)} 관련 뉴스를 준비하고 있습니다.</p><span class="tiny">-</span></div>`;
}

async function loadStockNewsForSelection(item = getStockAnalysisSelectedStock(), { force = false } = {}) {
  if (!item) return false;
  const selected = normalizeStockAnalysisItem(item);
  const key = getStockNewsKey(selected);
  if (!key) return false;
  if (!force && stockNewsState.key === key && (stockNewsState.loading || stockNewsState.loaded || stockNewsState.items.length || stockNewsState.error)) return true;

  const requestId = stockNewsState.requestId + 1;
  stockNewsState = {
    key,
    loading: true,
    loaded: false,
    error: "",
    items: stockNewsState.key === key ? stockNewsState.items : [],
    requestId
  };
  if (getRoute() === "stock") render();

  try {
    const marketHint = `${selected.market || ""} ${selected.exchange || ""} ${selected.symbol || ""}`;
    const isKoreanMarket = /(KOSPI|KOSDAQ|KONEX|KRX|\.KS|\.KQ)/i.test(marketHint);
    const query = isKoreanMarket
      ? selected.name || selected.code || selected.symbol
      : selected.symbol || selected.code || selected.name;
    const symbol = getStockChartSymbol(selected);
    const newsUrl = `/api/markets?action=news&q=${encodeURIComponent(query)}${symbol ? `&symbol=${encodeURIComponent(symbol)}` : ""}`;
    const response = await fetchWithTimeout(newsUrl, {
      credentials: "include",
      headers: { Accept: "application/json" },
      timeout: 9000
    });
    const { data, text } = await readApiJsonResponse(response);
    if (stockNewsState.requestId !== requestId) return false;
    if (!response.ok || !data.ok) {
      throw new Error(getApiErrorMessage(response, data, text, "뉴스를 불러오지 못했습니다."));
    }

    stockNewsState = {
      key,
      loading: false,
      loaded: true,
      error: "",
      items: Array.isArray(data.news) ? data.news : [],
      requestId
    };
    if (getRoute() === "stock") render();
    return true;
  } catch (error) {
    if (stockNewsState.requestId !== requestId) return false;
    stockNewsState = {
      key,
      loading: false,
      loaded: true,
      error: error?.message || "뉴스를 불러오지 못했습니다.",
      items: [],
      requestId
    };
    if (getRoute() === "stock") render();
    return false;
  }
}

function ensureStockNewsForSelection() {
  const selected = getStockAnalysisSelectedStock();
  if (!selected) return;
  const key = getStockNewsKey(selected);
  if (!key) return;
  if (stockNewsState.key === key && (stockNewsState.loading || stockNewsState.loaded || stockNewsState.items.length || stockNewsState.error)) return;
  window.setTimeout(() => {
    if (getRoute() === "stock") loadStockNewsForSelection(selected).catch((error) => {
      console.warn("Stock news could not be loaded.", error);
    });
  }, 0);
}

function getStockFundamentalsKey(item = getStockAnalysisSelectedStock()) {
  if (!item) return "";
  const symbol = getStockChartSymbol(item);
  return symbol ? symbol.toUpperCase() : "";
}

function renderStockFundamentalsSummary(selected = getStockAnalysisSelectedStock()) {
  const key = getStockFundamentalsKey(selected);

  if (!selected || !key) {
    return `<div class="table-empty-cell">종목을 선택하면 재무 데이터가 표시됩니다.</div>`;
  }

  if (stockFundamentalsState.key === key && stockFundamentalsState.loading) {
    return `
      <div class="stock-chart-status compact">
        <span class="status-icon">${icon("report")}</span>
        <strong>재무 데이터를 불러오고 있습니다.</strong>
      </div>
    `;
  }

  if (stockFundamentalsState.key === key && stockFundamentalsState.error) {
    return `
      <div class="stock-chart-status error compact">
        <span class="status-icon red">${icon("warning")}</span>
        <strong>${escapeChartText(stockFundamentalsState.error)}</strong>
      </div>
    `;
  }

  if (stockFundamentalsState.key === key && stockFundamentalsState.loaded) {
    const headers = stockFundamentalsState.headers.length ? stockFundamentalsState.headers : ["항목"];
    const rows = stockFundamentalsState.rows;
    const footer = [
      stockFundamentalsState.unit ? `단위: ${stockFundamentalsState.unit}` : "",
      stockFundamentalsState.source ? `출처: ${stockFundamentalsState.source}` : ""
    ].filter(Boolean).join(" / ");

    return `
      ${rows.length
        ? renderTable(headers, rows)
        : renderTable(["항목", "값"], [])}
      <p class="footer-note">${escapeChartText(rows.length ? footer : "재무 데이터를 제공하지 않는 종목입니다.")}</p>
    `;
  }

  return `
    <div class="stock-chart-status compact">
      <span class="status-icon">${icon("report")}</span>
      <strong>${escapeChartText(selected.name)} 재무 데이터를 준비하고 있습니다.</strong>
    </div>
  `;
}

async function loadStockFundamentalsForSelection(item = getStockAnalysisSelectedStock(), { force = false } = {}) {
  if (!item) return false;
  const selected = normalizeStockAnalysisItem(item);
  const symbol = getStockChartSymbol(selected);
  const key = getStockFundamentalsKey(selected);
  if (!symbol || !key) return false;
  if (!force && stockFundamentalsState.key === key && (stockFundamentalsState.loading || stockFundamentalsState.loaded || stockFundamentalsState.error)) return true;

  const requestId = stockFundamentalsState.requestId + 1;
  stockFundamentalsState = {
    key,
    loading: true,
    loaded: false,
    error: "",
    headers: [],
    rows: [],
    unit: "",
    source: "",
    requestId
  };
  if (getRoute() === "stock") render();

  try {
    const response = await fetchWithTimeout(`/api/markets?action=fundamentals&symbol=${encodeURIComponent(symbol)}`, {
      credentials: "include",
      headers: { Accept: "application/json" },
      timeout: 10000
    });
    const { data, text } = await readApiJsonResponse(response);
    if (stockFundamentalsState.requestId !== requestId) return false;
    if (!response.ok || !data.ok) {
      throw new Error(getApiErrorMessage(response, data, text, "재무 데이터를 불러오지 못했습니다."));
    }

    const fundamentals = data.fundamentals || {};
    stockFundamentalsState = {
      key,
      loading: false,
      loaded: true,
      error: "",
      headers: Array.isArray(fundamentals.headers) ? fundamentals.headers : [],
      rows: Array.isArray(fundamentals.rows) ? fundamentals.rows : [],
      unit: fundamentals.unit || "",
      source: fundamentals.source || "Yahoo Finance",
      requestId
    };
    if (getRoute() === "stock") render();
    return true;
  } catch (error) {
    if (stockFundamentalsState.requestId !== requestId) return false;
    stockFundamentalsState = {
      key,
      loading: false,
      loaded: true,
      error: error?.message || "재무 데이터를 불러오지 못했습니다.",
      headers: [],
      rows: [],
      unit: "",
      source: "",
      requestId
    };
    if (getRoute() === "stock") render();
    return false;
  }
}

function ensureStockFundamentalsForSelection() {
  const selected = getStockAnalysisSelectedStock();
  if (!selected) return;
  const key = getStockFundamentalsKey(selected);
  if (!key) return;
  if (stockFundamentalsState.key === key && (stockFundamentalsState.loading || stockFundamentalsState.loaded || stockFundamentalsState.error)) return;
  window.setTimeout(() => {
    if (getRoute() === "stock") loadStockFundamentalsForSelection(selected).catch((error) => {
      console.warn("Stock fundamentals could not be loaded.", error);
    });
  }, 0);
}

function getStockChartCandlesForIndicators(selected = getStockAnalysisSelectedStock()) {
  const key = getStockChartKey(selected);
  if (!key || stockChartState.key !== key || !Array.isArray(stockChartState.candles)) return [];
  return stockChartState.candles.filter((row) => Number(row?.close) > 0);
}

function getLastFiniteValue(values = []) {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = Number(values[index]);
    if (Number.isFinite(value)) return value;
  }
  return NaN;
}

function averageNumbers(values = []) {
  const finite = values.map(Number).filter(Number.isFinite);
  if (!finite.length) return NaN;
  return finite.reduce((sum, value) => sum + value, 0) / finite.length;
}

function getSimpleMovingAverage(values = [], size = 5) {
  if (values.length < size) return NaN;
  return averageNumbers(values.slice(-size));
}

function getEmaSeries(values = [], size = 12) {
  const finite = values.map(Number).filter(Number.isFinite);
  if (finite.length < size) return [];
  const multiplier = 2 / (size + 1);
  const series = [];
  let previous = averageNumbers(finite.slice(0, size));
  series[size - 1] = previous;
  for (let index = size; index < finite.length; index += 1) {
    previous = (finite[index] - previous) * multiplier + previous;
    series[index] = previous;
  }
  return series;
}

function getRsiValue(values = [], size = 14) {
  const finite = values.map(Number).filter(Number.isFinite);
  if (finite.length <= size) return NaN;
  const changes = [];
  for (let index = 1; index < finite.length; index += 1) changes.push(finite[index] - finite[index - 1]);
  const recent = changes.slice(-size);
  const gains = recent.map((value) => Math.max(value, 0));
  const losses = recent.map((value) => Math.max(-value, 0));
  const avgGain = averageNumbers(gains);
  const avgLoss = averageNumbers(losses);
  if (!Number.isFinite(avgGain) || !Number.isFinite(avgLoss)) return NaN;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function getMacdMeta(values = []) {
  const ema12 = getEmaSeries(values, 12);
  const ema26 = getEmaSeries(values, 26);
  const macdSeries = values.map((_, index) => {
    const fast = Number(ema12[index]);
    const slow = Number(ema26[index]);
    return Number.isFinite(fast) && Number.isFinite(slow) ? fast - slow : NaN;
  });
  const compactMacd = macdSeries.filter(Number.isFinite);
  const signalSeries = getEmaSeries(compactMacd, 9);
  return {
    macd: getLastFiniteValue(compactMacd),
    signal: getLastFiniteValue(signalSeries)
  };
}

function getBollingerMeta(values = [], size = 20) {
  const recent = values.map(Number).filter(Number.isFinite).slice(-size);
  if (recent.length < size) return null;
  const middle = averageNumbers(recent);
  const variance = averageNumbers(recent.map((value) => (value - middle) ** 2));
  const deviation = Math.sqrt(variance);
  return {
    middle,
    upper: middle + deviation * 2,
    lower: middle - deviation * 2,
    close: recent[recent.length - 1]
  };
}

function technicalSignal(text, tone = "") {
  const className = tone === "buy" ? "text-red" : tone === "sell" ? "text-blue" : tone === "warn" ? "text-orange" : "";
  return className ? `<span class="${className}">${text}</span>` : text;
}

function formatTechnicalValue(value, digits = 2) {
  return Number.isFinite(Number(value)) ? Number(value).toLocaleString("ko-KR", { maximumFractionDigits: digits }) : "-";
}

function getStockTechnicalIndicatorRows(selected = getStockAnalysisSelectedStock()) {
  const candles = getStockChartCandlesForIndicators(selected);
  const closes = candles.map((row) => Number(row.close)).filter(Number.isFinite);
  if (closes.length < 2) return [];

  const latest = closes[closes.length - 1];
  const ma5 = getSimpleMovingAverage(closes, 5);
  const ma20 = getSimpleMovingAverage(closes, 20);
  const ma60 = getSimpleMovingAverage(closes, 60);
  const rsi = getRsiValue(closes, 14);
  const macd = getMacdMeta(closes);
  const bollinger = getBollingerMeta(closes, 20);

  const rows = [];
  if (Number.isFinite(ma5) && Number.isFinite(ma20)) {
    const hasMa60 = Number.isFinite(ma60);
    const bull = ma5 > ma20 && (!hasMa60 || ma20 > ma60);
    const bear = ma5 < ma20 && (!hasMa60 || ma20 < ma60);
    rows.push([
      "이동평균",
      hasMa60 ? `MA5 ${formatTechnicalValue(ma5)} / MA20 ${formatTechnicalValue(ma20)} / MA60 ${formatTechnicalValue(ma60)}` : `MA5 ${formatTechnicalValue(ma5)} / MA20 ${formatTechnicalValue(ma20)}`,
      bull ? technicalSignal("상승 배열", "buy") : bear ? technicalSignal("하락 배열", "sell") : "혼조"
    ]);
  }
  if (Number.isFinite(rsi)) {
    rows.push([
      "RSI (14)",
      formatTechnicalValue(rsi),
      rsi >= 70 ? technicalSignal("과열", "warn") : rsi <= 30 ? technicalSignal("침체", "buy") : "중립"
    ]);
  }
  if (Number.isFinite(macd.macd) && Number.isFinite(macd.signal)) {
    rows.push([
      "MACD",
      `${formatTechnicalValue(macd.macd, 4)} / Signal ${formatTechnicalValue(macd.signal, 4)}`,
      macd.macd >= macd.signal ? technicalSignal("상승", "buy") : technicalSignal("하락", "sell")
    ]);
  }
  if (bollinger) {
    rows.push([
      "볼린저 밴드",
      `${formatTechnicalValue(bollinger.lower)} ~ ${formatTechnicalValue(bollinger.upper)}`,
      latest >= bollinger.upper * 0.98
        ? technicalSignal("상단 근접", "warn")
        : latest <= bollinger.lower * 1.02
          ? technicalSignal("하단 근접", "buy")
          : "중립"
    ]);
  }

  return rows;
}

function renderStockTechnicalIndicators(selected = getStockAnalysisSelectedStock()) {
  if (stockChartState.key === getStockChartKey(selected) && stockChartState.loading) {
    return `
      <div class="stock-chart-status compact">
        <span class="status-icon">${icon("chart")}</span>
        <strong>기술적 지표를 계산하고 있습니다.</strong>
      </div>
    `;
  }

  const rows = getStockTechnicalIndicatorRows(selected);
  if (!rows.length) {
    return `
      ${renderTable(["지표", "값", "신호"], [])}
      <p class="footer-note">차트 데이터가 충분하면 자동 계산됩니다.</p>
    `;
  }

  return `
    ${renderTable(["지표", "값", "신호"], rows)}
    <p class="footer-note">기준: 선택한 차트 기간의 Yahoo Finance 가격 데이터</p>
  `;
}

function getStockFavoritesSnapshot() {
  return stockFavoriteItems.map((item) => {
    const stock = normalizeStockAnalysisItem(item);
    return {
      name: stock.name,
      code: stock.code,
      symbol: stock.symbol,
      type: stock.type,
      quoteType: stock.quoteType,
      market: stock.market,
      exchange: stock.exchange,
      industry: stock.industry,
      currency: stock.currency,
      currentPrice: stock.currentPrice,
      currentPriceKrw: stock.currentPriceKrw,
      exchangeRateToKrw: stock.exchangeRateToKrw,
      change: stock.change,
      changeRate: stock.changeRate,
      source: stock.source,
      savedAt: stock.savedAt || new Date().toISOString()
    };
  });
}

function applyUserStockFavorites(items = []) {
  const seen = new Set();
  stockFavoriteItems = (Array.isArray(items) ? items : [])
    .map((item) => normalizeStockAnalysisItem(item))
    .filter((item) => {
      const key = getStockItemKey(item);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 100);
}

function isStockAnalysisFavorite(item = getStockAnalysisSelectedStock()) {
  const key = getStockItemKey(item);
  return Boolean(key && stockFavoriteItems.some((favorite) => getStockItemKey(favorite) === key));
}

function updateStockFavoriteItem(item = getStockAnalysisSelectedStock()) {
  const stock = normalizeStockAnalysisItem(item);
  const key = getStockItemKey(stock);
  stockFavoriteItems = stockFavoriteItems.map((favorite) =>
    getStockItemKey(favorite) === key ? { ...favorite, ...stock } : favorite
  );
}

function scheduleStockFavoritesSave() {
  if (!authState.authenticated) return;
  const userId = getCurrentUserStorageId();
  if (!userId) return;
  if (userDataServerLoadedFor !== userId) {
    stockFavoritesServerSavePendingFor = userId;
    if (userDataServerLoadingFor !== userId) {
      loadUserDataFromServer(userId);
    }
    return;
  }

  if (stockFavoritesServerSaveTimer) window.clearTimeout(stockFavoritesServerSaveTimer);
  stockFavoritesServerSaveTimer = window.setTimeout(() => {
    stockFavoritesServerSaveTimer = 0;
    saveStockFavoritesToServer();
  }, 600);
}

async function saveStockFavoritesToServer() {
  if (!authState.authenticated) return;
  const userId = getCurrentUserStorageId();
  if (!userId) return;
  if (userDataServerLoadedFor !== userId) {
    stockFavoritesServerSavePendingFor = userId;
    if (userDataServerLoadingFor !== userId) {
      loadUserDataFromServer(userId);
    }
    return;
  }

  try {
    const response = await fetchWithTimeout("/api/data", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        action: "save_stock_favorites",
        stockFavorites: getStockFavoritesSnapshot()
      })
    });
    const { data } = await readApiJsonResponse(response);
    if (response.ok && data.ok) {
      setDatabaseState({
        checked: true,
        connected: true,
        data: summarizeDatabaseData(data.data || {}),
        message: "관심 종목이 Cloudflare D1에 저장되었습니다.",
        error: ""
      });
    }
  } catch (error) {
    console.warn("Stock favorites could not be saved to the server.", error);
  }
}

function scheduleJournalRecordsSave() {
  if (!authState.authenticated) return;
  const userId = getCurrentUserStorageId();
  if (!userId) return;
  if (userDataServerLoadedFor !== userId) {
    userJournalServerSavePendingFor = userId;
    if (userDataServerLoadingFor !== userId) {
      loadUserDataFromServer(userId);
    }
    return;
  }

  if (userJournalServerSaveTimer) window.clearTimeout(userJournalServerSaveTimer);
  userJournalServerSaveTimer = window.setTimeout(() => {
    userJournalServerSaveTimer = 0;
    saveJournalRecordsToServer();
  }, 500);
}

async function saveJournalRecordsToServer({ waitForLoad = false, recordsSnapshot = null } = {}) {
  if (!authState.authenticated) return false;
  const userId = getCurrentUserStorageId();
  if (!userId) return false;
  const journalSnapshot = Array.isArray(recordsSnapshot)
    ? recordsSnapshot.map((record) => normalizeJournalRecord(record))
    : getJournalRecordsSnapshot();
  if (userDataServerLoadedFor !== userId) {
    userJournalServerSavePendingFor = userId;
    const loadResult = loadUserDataFromServer(userId);
    if (!waitForLoad) return false;

    const loaded = await loadResult;
    if (!loaded && userDataServerLoadedFor !== userId) {
      throw new Error("Saved journal data could not be loaded before sync.");
    }
    if (userJournalServerSavePendingFor === userId) userJournalServerSavePendingFor = "";
  }

  try {
    const response = await fetchWithTimeout("/api/data", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        action: "save_journal_records",
        journalRecords: journalSnapshot
      })
    });
    const { data } = await readApiJsonResponse(response);
    if (response.ok && data.ok) {
      setDatabaseState({
        checked: true,
        connected: true,
        data: summarizeDatabaseData(data.data || {}),
        message: "매매일지가 Cloudflare D1에 저장되었습니다.",
        error: ""
      });
      return true;
    }
  } catch (error) {
    console.warn("Journal records could not be saved to the server.", error);
  }

  return false;
}

function createJournalRecordFromForm(form) {
  if (!form) return null;
  const mode = form.dataset.tradeMode === "sell" ? "sell" : "buy";
  const editingRecord = getJournalRecordById(form.dataset.journalEditId || journalEditingRecordId || "");
  const stock = typeof getJournalSelectedStock === "function" ? getJournalSelectedStock(form) : null;
  const nameInput = form.querySelector("[data-journal-stock-name]");
  const dateInput = form.querySelector("[data-date-picker]");
  const quantityInput = form.querySelector("[data-journal-trade-quantity]");
  const priceInput = form.querySelector(mode === "sell" ? "[data-journal-trade-sell-price]" : "[data-journal-trade-buy-price]");
  const memoInput = form.querySelector("textarea");
  const price = parseKRWInput(priceInput ? priceInput.value : "");
  const quantity = typeof parseAssetDecimalInput === "function"
    ? parseAssetDecimalInput(quantityInput ? quantityInput.value : "")
    : parseKRWInput(quantityInput ? quantityInput.value : "");
  const now = new Date().toISOString();
  const record = normalizeJournalRecord({
    id: editingRecord?.id || `journal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: dateInput ? dateInput.value : "",
    type: mode,
    name: stock?.name || (nameInput ? nameInput.value : "") || editingRecord?.name || "",
    code: stock?.code || editingRecord?.code || "",
    symbol: stock?.symbol || stock?.code || editingRecord?.symbol || editingRecord?.code || "",
    quantity,
    price,
    buyPrice: mode === "buy" ? price : 0,
    sellPrice: mode === "sell" ? price : 0,
    memo: memoInput ? memoInput.value : "",
    createdAt: editingRecord?.createdAt || now,
    updatedAt: now
  });

  return record.name && record.quantity > 0 && record.price > 0 ? record : null;
}

function setJournalFormSubmitError(form, message = "") {
  if (!form) return;
  const mode = form.dataset.tradeMode === "sell" ? "sell" : "buy";
  const errorNode = form.querySelector(`[data-journal-total-error="${mode}"]`);
  if (errorNode) errorNode.textContent = message;
}

async function saveJournalEntryFromForm(form) {
  if (!form) return false;
  const editingRecord = getJournalRecordById(form.dataset.journalEditId || journalEditingRecordId || "");
  const record = createJournalRecordFromForm(form);
  if (!record) {
    setJournalFormSubmitError(form, "종목, 수량, 가격을 확인해 주세요.");
    return false;
  }
  const assetSnapshot = getJournalAssetMutationSnapshot();
  const journalSnapshot = getJournalRecordsSnapshot();
  if (editingRecord) {
    if (!applyJournalRecordAssetEffect(editingRecord, -1)) {
      restoreJournalAssetMutationSnapshot(assetSnapshot);
      setJournalFormSubmitError(form, "기존 매매 기록을 자산에서 되돌릴 수 없습니다.");
      return false;
    }
  }
  if (!applyJournalRecordAssetEffect(record, 1)) {
    restoreJournalAssetMutationSnapshot(assetSnapshot);
    setJournalFormSubmitError(
      form,
      record.type === "sell"
        ? "매도할 보유 종목과 수량을 확인해 주세요."
        : "매수 가능 현금과 종목 정보를 확인해 주세요."
    );
    return false;
  }
  userJournalRecords = [record, ...userJournalRecords.filter((item) => item.id !== record.id)].slice(0, 500);
  setJournalEditingRecord("");
  try {
    await persistJournalAndAssetState();
  } catch (error) {
    restoreJournalAssetMutationSnapshot(assetSnapshot);
    applyUserJournalRecords(journalSnapshot);
    await saveAssetStateToStorage({ syncRemote: false, source: "system" });
    setJournalFormSubmitError(form, "저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    console.warn("Journal entry could not be saved.", error);
    return false;
  }
  return true;
}

function toggleStockAnalysisFavorite() {
  const selected = getStockAnalysisSelectedStock();
  if (!selected) return;
  const stock = normalizeStockAnalysisItem(selected);
  const key = getStockItemKey(stock);
  if (!key) return;

  if (isStockAnalysisFavorite(stock)) {
    stockFavoriteItems = stockFavoriteItems.filter((favorite) => getStockItemKey(favorite) !== key);
  } else {
    stockFavoriteItems = [{ ...stock, savedAt: new Date().toISOString() }, ...stockFavoriteItems]
      .filter((item, index, list) => list.findIndex((other) => getStockItemKey(other) === getStockItemKey(item)) === index)
      .slice(0, 100);
  }

  stockFavoritesOpen = false;
  scheduleStockFavoritesSave();
  render();
}

function setStockAnalysisSelection(item = {}, { refresh = true } = {}) {
  if (!item) return;
  const previousKey = getStockItemKey(getStockAnalysisSelectedStock());
  const selected = normalizeStockAnalysisItem(item);
  const nextKey = getStockItemKey(selected);
  const changed = previousKey !== nextKey;
  stockAnalysisSelected = selected;
  stockSearchState = {
    query: "",
    loading: false,
    results: [],
    error: "",
    requestId: stockSearchState.requestId + 1
  };
  stockFavoritesOpen = false;
  render();

  if (refresh && changed) {
    refreshStockAnalysisSelection(stockAnalysisSelected).catch((error) => {
      console.warn("Selected stock could not be refreshed.", error);
    });
  }
  loadStockChartForSelection(stockAnalysisSelected, { force: changed }).catch((error) => {
    console.warn("Selected stock chart could not be refreshed.", error);
  });
  loadStockNewsForSelection(stockAnalysisSelected, { force: changed }).catch((error) => {
    console.warn("Selected stock news could not be refreshed.", error);
  });
  loadStockFundamentalsForSelection(stockAnalysisSelected, { force: changed }).catch((error) => {
    console.warn("Selected stock fundamentals could not be refreshed.", error);
  });
}

async function refreshStockAnalysisSelection(item = getStockAnalysisSelectedStock()) {
  if (!item) return;
  const target = normalizeStockAnalysisItem(item);
  const targetKey = getStockItemKey(target);
  if (!targetKey) return;
  if (stockAnalysisRefreshKey === targetKey) return;

  stockAnalysisRefreshKey = targetKey;

  try {
    const beforeSignature = JSON.stringify(getStockAnalysisSelectedStock() || {});
    const result = await fetchAssetMarketMeta(target).catch(() => null);
    if (!result) return;

    const refreshed = stockMarketResultToItem(result, target);
    if (getStockItemKey(getStockAnalysisSelectedStock()) === targetKey) {
      stockAnalysisSelected = refreshed;
    }
    if (isStockAnalysisFavorite(refreshed)) {
      updateStockFavoriteItem(refreshed);
      scheduleStockFavoritesSave();
    }
    const afterSignature = JSON.stringify(getStockAnalysisSelectedStock() || {});
    if (getRoute() === "stock" && beforeSignature !== afterSignature) render();
    loadStockChartForSelection(refreshed).catch((error) => {
      console.warn("Refreshed stock chart could not be loaded.", error);
    });
    loadStockNewsForSelection(refreshed).catch((error) => {
      console.warn("Refreshed stock news could not be loaded.", error);
    });
    loadStockFundamentalsForSelection(refreshed).catch((error) => {
      console.warn("Refreshed stock fundamentals could not be loaded.", error);
    });
  } finally {
    if (stockAnalysisRefreshKey === targetKey) stockAnalysisRefreshKey = "";
  }
}

function refreshCurrentStockAnalysisPrices() {
  const selected = getStockAnalysisSelectedStock();
  if (!selected) return;
  refreshStockAnalysisSelection(selected).catch((error) => {
    console.warn("Stock analysis price could not be refreshed.", error);
  });
}

async function refreshStockFavoritesMarketPrices({ syncRemote = true } = {}) {
  if (stockFavoritesRefreshRunning || !stockFavoriteItems.length) return false;

  stockFavoritesRefreshRunning = true;
  const selectedKey = getStockItemKey(getStockAnalysisSelectedStock());
  let changed = false;

  try {
    const refreshedFavorites = [];
    for (const favorite of stockFavoriteItems) {
      const result = await fetchAssetMarketMeta(favorite, { force: true }).catch(() => null);
      if (!result) {
        refreshedFavorites.push(favorite);
        continue;
      }

      const refreshed = {
        ...stockMarketResultToItem(result, favorite),
        savedAt: favorite.savedAt || new Date().toISOString()
      };
      if (JSON.stringify(normalizeStockAnalysisItem(favorite)) !== JSON.stringify(normalizeStockAnalysisItem(refreshed))) {
        changed = true;
      }
      refreshedFavorites.push(refreshed);
    }

    if (!changed) return false;
    stockFavoriteItems = refreshedFavorites;

    if (selectedKey) {
      const refreshedSelected = stockFavoriteItems.find((favorite) => getStockItemKey(favorite) === selectedKey);
      if (refreshedSelected && stockAnalysisSelected && getStockItemKey(stockAnalysisSelected) === selectedKey) {
        stockAnalysisSelected = normalizeStockAnalysisItem(refreshedSelected);
      }
    }

    if (syncRemote) scheduleStockFavoritesSave();
    if (getRoute() === "stock") render();
    return true;
  } finally {
    stockFavoritesRefreshRunning = false;
  }
}

function resetStockSearchState() {
  if (stockSearchTimer) window.clearTimeout(stockSearchTimer);
  stockSearchTimer = 0;
  stockSearchState = {
    query: "",
    loading: false,
    results: [],
    error: "",
    requestId: stockSearchState.requestId + 1
  };
}

function formatStockSearchPrice(result = {}) {
  const normalized = normalizeStockAnalysisItem(result);
  return getStockAnalysisPriceMeta(normalized).text;
}

function renderStockSearchPanel() {
  const query = String(stockSearchState.query || "").trim();
  if (stockSearchState.loading) {
    return `<div class="asset-market-search-state">종목을 검색하고 있습니다.</div>`;
  }

  if (stockSearchState.error) {
    return `<div class="asset-market-search-state error">${escapeChartText(stockSearchState.error)}</div>`;
  }

  if (!query || query.length < 2) return "";

  if (!stockSearchState.results.length) {
    return `<div class="asset-market-search-state">검색 결과가 없습니다. 종목명이나 코드를 입력해보세요.</div>`;
  }

  return `
    <div class="asset-market-search-results stock-search-results" role="listbox" aria-label="종목 검색 결과">
      ${stockSearchState.results.map((result, index) => {
        const stock = normalizeStockAnalysisItem(result);
        const marketText = [stock.symbol, getStockMarketLabel(stock), stock.exchange || stock.source]
          .filter(Boolean)
          .join(" · ");
        return `
          <button class="asset-market-search-result stock-search-result" type="button" role="option" data-stock-search-result="${index}">
            ${renderStockAvatar(stock, "stock-search-avatar")}
            <span>
              <strong>${escapeChartText(stock.name)}</strong>
              <em>${escapeChartText(marketText || stock.code)}</em>
            </span>
            <b>${escapeChartText(formatStockSearchPrice(stock))}</b>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function updateStockSearchPanel() {
  const panel = document.querySelector("[data-stock-search-panel]");
  if (!panel) return;
  panel.innerHTML = renderStockSearchPanel();
}

async function runStockSearch(query, requestId) {
  try {
    const results = await fetchMarketSearchResults(query);
    const response = { ok: true };
    const payload = { ok: true, results };
    if (stockSearchState.requestId !== requestId) return;
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "종목 검색에 실패했습니다.");
    }

    stockSearchState.loading = false;
    stockSearchState.results = Array.isArray(payload.results) ? payload.results : [];
    stockSearchState.error = "";
    updateStockSearchPanel();
  } catch (error) {
    if (stockSearchState.requestId !== requestId) return;
    stockSearchState.loading = false;
    stockSearchState.results = [];
    stockSearchState.error = error?.message || "종목 검색에 실패했습니다.";
    updateStockSearchPanel();
  }
}

function scheduleStockSearch(query) {
  const nextQuery = String(query || "").trim();
  if (stockSearchTimer) window.clearTimeout(stockSearchTimer);

  const requestId = stockSearchState.requestId + 1;
  stockSearchState = {
    query: nextQuery,
    loading: nextQuery.length >= 2,
    results: [],
    error: "",
    requestId
  };
  stockFavoritesOpen = false;
  updateStockSearchPanel();

  if (nextQuery.length < 2) return;

  stockSearchTimer = window.setTimeout(() => {
    stockSearchTimer = 0;
    runStockSearch(nextQuery, requestId);
  }, 260);
}

function applyStockSearchResult(resultIndex) {
  const result = stockSearchState.results[Number(resultIndex)];
  if (!result) return;
  setStockAnalysisSelection(stockMarketResultToItem(result, getStockAnalysisSelectedStock() || {}), { refresh: false });
}

function renderStockFavoritesDropdown() {
  if (!stockFavoritesOpen) return "";

  if (!stockFavoriteItems.length) return "";

  return `
    <div class="stock-favorites-dropdown" role="listbox" aria-label="관심 종목 목록">
      ${stockFavoriteItems.map((item, index) => {
        const stock = normalizeStockAnalysisItem(item);
        const change = getStockAnalysisChangeMeta(stock);
        return `
          <button class="stock-favorite-option" type="button" role="option" data-stock-favorite-select="${index}">
            ${renderStockAvatar(stock, "stock-search-avatar")}
            <span>
              <strong>${escapeChartText(stock.name)}</strong>
              <em>${escapeChartText([stock.code, getStockMarketLabel(stock)].filter(Boolean).join(" · "))}</em>
            </span>
            <b class="${change.className}">${escapeChartText(getStockAnalysisPriceMeta(stock).text)}</b>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

async function fetchDatabaseStatus({ rerender = false } = {}) {
  if (databaseState.loading) return databaseState;
  setDatabaseState({ loading: true, error: "" });

  try {
    const response = await fetchWithTimeout("/api/data", {
      credentials: "include",
      headers: { Accept: "application/json" }
    });
    const { data, text } = await readApiJsonResponse(response);

    if (!response.ok || !data.ok) {
      throw new Error(getApiErrorMessage(response, data, text, "Cloudflare D1 저장소 상태를 확인하지 못했습니다."));
    }

    setDatabaseState({
      checked: true,
      loading: false,
      connected: true,
      data: summarizeDatabaseData(data.data || {}),
      message: "Cloudflare D1 저장소에 연결되어 있습니다.",
      error: ""
    });
  } catch (error) {
    setDatabaseState({
      checked: true,
      loading: false,
      connected: false,
      data: null,
      message: "",
      error: error?.message || "Cloudflare D1 저장소 상태를 확인하지 못했습니다."
    });
  }

  if (rerender && getRoute() === "settings") render();
  return databaseState;
}

function hydrateDatabaseSettingsPage() {
  if (!authState.authenticated) return;
  if (databaseState.checked || databaseState.loading) return;
  fetchDatabaseStatus({ rerender: true });
}

async function saveDatabaseAssets({ manual = false } = {}) {
  if (!authState.authenticated || databaseState.saving) return;
  const userId = getCurrentUserStorageId();

  setDatabaseState({
    saving: true,
    connected: true,
    message: manual ? "자산 데이터를 Cloudflare D1에 저장하고 있습니다." : databaseState.message,
    error: ""
  });
  if (manual && getRoute() === "settings") render();

  try {
    if (userId && userDataServerLoadedFor !== userId) {
      await loadUserDataFromServer(userId);
      if (userDataServerLoadedFor !== userId) {
        throw new Error("Cloudflare D1 데이터를 먼저 불러오지 못했습니다. 잠시 후 다시 저장해 주세요.");
      }
    }

    recordAssetTrendSnapshot();
    const snapshot = getAssetSnapshot();
    if (!hasAssetSnapshotData(snapshot)) {
      throw new Error("현재 화면에 저장할 자산 데이터가 없습니다. 원격 데이터를 먼저 불러온 뒤 다시 시도하세요.");
    }

    const response = await fetchWithTimeout("/api/data", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        action: "save_assets",
        assets: snapshot,
        allowEmptyAssets: false
      })
    });
    const { data, text } = await readApiJsonResponse(response);

    if (!response.ok || !data.ok) {
      throw new Error(getApiErrorMessage(response, data, text, "Cloudflare D1 저장에 실패했습니다."));
    }

    setDatabaseState({
      checked: true,
      saving: false,
      connected: true,
      data: summarizeDatabaseData(data.data || {}),
      message: "자산 데이터가 Cloudflare D1에 저장되었습니다.",
      error: ""
    });
  } catch (error) {
    setDatabaseState({
      saving: false,
      message: "",
      error: error?.message || "Cloudflare D1 저장에 실패했습니다."
    });
  }

  if (getRoute() === "settings") render();
}

function renderDatabaseSettingsPanel() {
  const storage = databaseState.data || {};
  const statusTone = databaseState.connected ? "green" : databaseState.error ? "red" : "blue";
  const statusText = databaseState.loading
    ? "확인 중"
    : databaseState.connected
      ? "연결됨"
      : "대기 중";

  return `
    <article class="panel drive-settings-panel">
      <div class="panel-header tight">
        <h2 class="panel-title">Cloudflare D1 데이터 저장소</h2>
        ${tag(statusText, statusTone)}
      </div>
      <div class="drive-settings-body">
        <span class="drive-settings-icon">${icon("cloud")}</span>
        <div>
          <strong>자동 저장 사용 중</strong>
          <p class="list-sub">
            로그인한 사용자별 자산 데이터와 설정을 Cloudflare D1에 암호화해서 저장합니다. 별도의 Drive 권한 연결은 필요하지 않습니다.
          </p>
        </div>
      </div>

      ${databaseState.checked ? `
        <div class="drive-info-grid">
          <div><p class="tiny">저장소</p><strong>D1</strong></div>
          <div><p class="tiny">최근 저장</p><strong>${formatStorageDate(storage.updatedAt)}</strong></div>
          <div><p class="tiny">보유 자산</p><strong>${Number(storage.assetCount || 0)}개</strong></div>
        </div>
      ` : ""}

      ${databaseState.message ? `<p class="drive-settings-feedback success">${escapeHtml(databaseState.message)}</p>` : ""}
      ${databaseState.error ? `<p class="drive-settings-feedback error">${escapeHtml(databaseState.error)}</p>` : ""}

      <div class="drive-settings-actions">
        <button class="btn ghost" type="button" data-database-refresh ${databaseState.loading ? "disabled" : ""}>새로고침</button>
        <button class="btn primary" type="button" data-database-save-assets ${databaseState.saving ? "disabled" : ""}>${databaseState.saving ? "저장 중" : "지금 저장"}</button>
      </div>
    </article>
  `;
}

function getAssetSpreadsheetFileBaseName() {
  const dateText = new Date().toISOString().slice(0, 10);
  return `trading-note-assets-${dateText}`;
}

async function exportAssetSettingsFile() {
  const rows = getAssetSpreadsheetRows();

  try {
    await loadAssetXlsxLibrary();
  } catch (error) {
    console.warn("엑셀 파일 내보내기를 CSV로 대체합니다.", error);
  }

  if (window.XLSX?.utils && window.XLSX?.writeFile) {
    const worksheet = XLSX.utils.json_to_sheet(rows, { header: assetSpreadsheetHeaders });
    worksheet["!cols"] = [
      { wch: 18 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 10 }
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Assets");
    XLSX.writeFile(workbook, `${getAssetSpreadsheetFileBaseName()}.xlsx`);
    return "xlsx";
  }

  const csv = buildAssetCsv(rows);
  downloadAssetBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `${getAssetSpreadsheetFileBaseName()}.csv`);
  return "csv";
}

function parseAssetCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  const source = String(text || "").replace(/^\uFEFF/, "");

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const nextChar = source[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => String(value).trim())) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  if (row.some((value) => String(value).trim())) rows.push(row);
  return rows;
}

function convertAssetAoaToObjects(aoaRows) {
  const rows = (aoaRows || []).filter((row) => Array.isArray(row) && row.some((cell) => String(cell ?? "").trim()));
  if (!rows.length) return [];

  const headerFields = rows[0].map(getCanonicalAssetSpreadsheetField);
  const hasHeader = headerFields.some(Boolean);
  const fields = hasHeader
    ? headerFields
    : ["name", "code", "quantity", "averagePrice", "currentPrice", "priceInputMode"];
  const dataRows = hasHeader ? rows.slice(1) : rows;

  return dataRows.map((row) => {
    const item = {};
    fields.forEach((field, index) => {
      if (field) item[field] = row[index];
    });
    return item;
  });
}

function normalizeImportedAssetRows(rawRows) {
  const rows = rawRows
    .map((row) => normalizeAssetRowInput(row))
    .filter((row) => row.name || row.code || row.quantity || row.averagePrice || row.currentPrice);
  const validationError = validateAssetRows(rows);

  if (validationError) {
    throw new Error(validationError);
  }

  return rows;
}

async function readAssetSettingsFile(file) {
  const extension = file.name.split(".").pop().toLowerCase();

  if (extension === "csv" || extension === "txt") {
    return convertAssetAoaToObjects(parseAssetCsv(await file.text()));
  }

  if (["xlsx", "xls"].includes(extension)) {
    try {
      await loadAssetXlsxLibrary();
    } catch (error) {
      throw new Error("엑셀 파일을 읽을 수 없습니다. 인터넷 연결 후 다시 시도하거나 CSV 파일로 저장해서 불러오세요.");
    }

    if (!window.XLSX?.read) {
      throw new Error("엑셀 파일을 읽을 수 없습니다. 인터넷 연결 후 다시 시도하거나 CSV 파일로 저장해서 불러오세요.");
    }

    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new Error("엑셀 파일에 시트가 없습니다.");

    const aoaRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: "" });
    return convertAssetAoaToObjects(aoaRows);
  }

  throw new Error("CSV, XLSX, XLS 파일만 불러올 수 있습니다.");
}

async function importAssetSettingsFile(file) {
  if (!file) return;

  try {
    const rawRows = await readAssetSettingsFile(file);
    const rows = normalizeImportedAssetRows(rawRows);
    if (!replaceAssetHoldings(rows)) throw new Error(assetSettingsError || "자산 데이터를 적용하지 못했습니다.");
    await saveAssetStateToStorage({ source: "user_import", immediate: true });
    assetSettingsDrafts = rows.map((row) => createAssetSettingsDraft(row));
    assetSettingsError = "";
    assetSettingsMessage = `${file.name}에서 ${rows.length}개 자산을 불러왔습니다.`;
    assetSettingsOpenMenuId = null;
    assetSettingsEditingId = null;
    assetSettingsActiveIndex = 0;
    assetSettingsMotion = null;
    assetSettingsPendingRemoveId = null;
    assetSettingsDeleteTargetId = "";
  } catch (error) {
    assetSettingsError = error?.message || "자산 파일을 불러오지 못했습니다.";
    assetSettingsMessage = "";
  }

  render();
}

function fitValueText(root = document) {
  root.querySelectorAll("[data-fit-value]").forEach((node) => {
    node.style.fontSize = "";

    if (!node.clientWidth || !node.scrollWidth) return;

    const maxSize = parseFloat(window.getComputedStyle(node).fontSize);
    const minSize = Number(node.dataset.fitMin) || 12;
    let nextSize = maxSize;

    while (node.scrollWidth > node.clientWidth && nextSize > minSize) {
      nextSize -= 0.5;
      node.style.fontSize = `${nextSize}px`;
    }
  });
}

function scheduleFitValueText(root = document) {
  if (fitMetricValueFrame) cancelAnimationFrame(fitMetricValueFrame);
  fitMetricValueFrame = requestAnimationFrame(() => {
    fitMetricValueFrame = 0;
    fitValueText(root);
  });
}

function updateMobileViewportInset() {
  const viewport = window.visualViewport;
  const bottomInset = viewport
    ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
    : 0;
  document.documentElement.style.setProperty("--mobile-browser-bottom-offset", `${Math.min(Math.round(bottomInset), 120)}px`);
}

function scheduleMobileViewportInset() {
  if (mobileViewportInsetFrame) cancelAnimationFrame(mobileViewportInsetFrame);
  mobileViewportInsetFrame = requestAnimationFrame(() => {
    mobileViewportInsetFrame = 0;
    updateMobileViewportInset();
  });
}

function shouldReduceMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
}

function getAnimatedNumberParts(text) {
  const value = String(text || "").trim();
  const match = value.match(/^([+-]?)(\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!match) return null;

  const [, sign, rawNumber, suffix] = match;
  const decimals = rawNumber.includes(".") ? rawNumber.split(".")[1].length : 0;
  const numericValue = Number(rawNumber.replace(/,/g, ""));
  if (!Number.isFinite(numericValue)) return null;

  return {
    target: sign === "-" ? -numericValue : numericValue,
    decimals,
    suffix,
    showPlus: sign === "+"
  };
}

function formatAnimatedNumber(value, parts) {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : parts.showPlus ? "+" : "";
  const formatted = absValue.toLocaleString("ko-KR", {
    minimumFractionDigits: parts.decimals,
    maximumFractionDigits: parts.decimals
  });

  return `${sign}${formatted}${parts.suffix}`;
}

function animateNumericValues(root = document) {
  if (shouldReduceMotion()) return;

  const targets = root.querySelectorAll(".metric-value, .metric-sub strong, .list-row > strong, .donut-center strong");
  targets.forEach((node, index) => {
    const originalText = node.textContent;
    const parts = getAnimatedNumberParts(originalText);
    if (!parts || parts.target === 0) return;

    const duration = 720 + Math.min(index, 4) * 55;
    const startedAt = performance.now();
    node.classList.add("number-animating");

    const step = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = formatAnimatedNumber(parts.target * eased, parts);

      if (progress < 1) {
        requestAnimationFrame(step);
        return;
      }

      node.textContent = originalText;
      node.classList.remove("number-animating");
      scheduleFitValueText(root);
    };

    node.textContent = formatAnimatedNumber(0, parts);
    requestAnimationFrame(step);
  });
}

function scrollPageToTop() {
  const html = document.documentElement;
  const body = document.body;
  const previousHtmlScrollBehavior = html ? html.style.scrollBehavior : "";
  const previousBodyScrollBehavior = body ? body.style.scrollBehavior : "";

  if (html) html.style.scrollBehavior = "auto";
  if (body) body.style.scrollBehavior = "auto";
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.querySelector(".main")?.scrollTo?.({ top: 0, left: 0, behavior: "auto" });

  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.querySelector(".main")?.scrollTo?.({ top: 0, left: 0, behavior: "auto" });
    if (html) html.style.scrollBehavior = previousHtmlScrollBehavior;
    if (body) body.style.scrollBehavior = previousBodyScrollBehavior;
  });
}

function openLinkedDatePicker(trigger) {
  const shell = trigger.closest(".input-with-icon");
  const input = shell ? shell.querySelector("[data-date-picker]") : null;
  if (!input) return;

  input.focus();
  if (typeof input.showPicker === "function") {
    try {
      input.showPicker();
      return;
    } catch (error) {
      input.click();
      return;
    }
  }
  input.click();
}

function getChartTooltip() {
  if (chartTooltip) return chartTooltip;
  chartTooltip = document.createElement("div");
  chartTooltip.className = "chart-tooltip";
  chartTooltip.setAttribute("role", "tooltip");
  document.body.appendChild(chartTooltip);
  return chartTooltip;
}

function positionChartTooltip(event) {
  if (!chartTooltip) return;
  const gap = 14;
  const { offsetWidth, offsetHeight } = chartTooltip;
  const left = Math.min(event.clientX + gap, window.innerWidth - offsetWidth - gap);
  const top = Math.min(event.clientY + gap, window.innerHeight - offsetHeight - gap);
  chartTooltip.style.left = `${Math.max(gap, left)}px`;
  chartTooltip.style.top = `${Math.max(gap, top)}px`;
}

function positionPinnedChartTooltip() {
  if (!chartTooltip || !pinnedChartTooltipTarget) return;

  if (!pinnedChartTooltipTarget.isConnected) {
    hideChartTooltip();
    return;
  }

  const gap = 10;
  const targetRect = pinnedChartTooltipTarget.getBoundingClientRect();

  if (targetRect.bottom < 0 || targetRect.top > window.innerHeight || targetRect.right < 0 || targetRect.left > window.innerWidth) {
    hideChartTooltip();
    return;
  }

  const { offsetWidth, offsetHeight } = chartTooltip;
  const canPlaceRight = targetRect.right + gap + offsetWidth <= window.innerWidth - gap;
  const canPlaceLeft = targetRect.left - gap - offsetWidth >= gap;
  let left = targetRect.right + gap;

  if (!canPlaceRight && canPlaceLeft) {
    left = targetRect.left - offsetWidth - gap;
  } else if (!canPlaceRight) {
    left = targetRect.left + targetRect.width / 2 - offsetWidth / 2;
  }

  const top = targetRect.top + targetRect.height / 2 - offsetHeight / 2;

  chartTooltip.style.left = `${Math.min(Math.max(gap, left), window.innerWidth - offsetWidth - gap)}px`;
  chartTooltip.style.top = `${Math.min(Math.max(gap, top), window.innerHeight - offsetHeight - gap)}px`;
}

function schedulePinnedChartTooltipPosition() {
  if (!pinnedChartTooltipTarget || !chartTooltip?.classList.contains("show")) return;
  if (chartTooltipPositionFrame) cancelAnimationFrame(chartTooltipPositionFrame);
  chartTooltipPositionFrame = requestAnimationFrame(() => {
    chartTooltipPositionFrame = 0;
    positionPinnedChartTooltip();
  });
}

function showChartTooltip(target, event) {
  const tooltip = getChartTooltip();
  tooltip.textContent = target.dataset.chartTooltip;
  tooltip.classList.add("show");
  positionChartTooltip(event);
}

function clearPinnedChartTooltipTarget() {
  if (chartTooltipPositionFrame) cancelAnimationFrame(chartTooltipPositionFrame);
  chartTooltipPositionFrame = 0;
  if (pinnedChartTooltipTarget) pinnedChartTooltipTarget.classList.remove("active");
  pinnedChartTooltipTarget?.closest(".donut")?.classList.remove("has-active-segment");
  pinnedChartTooltipTarget = null;
}

function hideChartTooltip() {
  clearPinnedChartTooltipTarget();
  if (!chartTooltip) return;
  chartTooltip.classList.remove("show");
}

function isTouchChartTooltipMode() {
  return window.matchMedia("(hover: none), (pointer: coarse), (any-pointer: coarse)").matches;
}

function togglePinnedChartTooltip(target, event) {
  if (pinnedChartTooltipTarget === target && chartTooltip?.classList.contains("show")) {
    hideChartTooltip();
    return;
  }

  if (pinnedChartTooltipTarget) pinnedChartTooltipTarget.classList.remove("active");
  pinnedChartTooltipTarget?.closest(".donut")?.classList.remove("has-active-segment");
  pinnedChartTooltipTarget = target;
  pinnedChartTooltipTarget.classList.add("active");
  pinnedChartTooltipTarget.closest(".donut")?.classList.add("has-active-segment");
  showChartTooltip(target, event);
  positionPinnedChartTooltip();
}

function createAssetSettingsDraft(item = {}) {
  return {
    id: `asset-setting-${assetSettingsNextId++}`,
    name: item.name || "",
    code: item.code || "",
    quantity: Math.max(0, Number(item.quantity) || 0),
    averagePrice: Math.max(0, Number(item.averagePrice) || 0),
    currentPrice: Math.max(0, Number(item.currentPrice) || 0),
    priceInputMode: item.priceInputMode || (item.averagePrice || item.currentPrice ? "full" : "quantity"),
    type: item.type || "",
    quoteType: item.quoteType || "",
    market: item.market || "",
    exchange: item.exchange || "",
    source: item.source || "",
    logoUrl: item.logoUrl || "",
    currency: normalizeAssetCurrency(item.currency || ""),
    marketPrice: Math.max(0, Number(item.marketPrice) || 0),
    exchangeRateToKrw: Math.max(0, Number(item.exchangeRateToKrw) || 0),
    priceDisplayCurrency: normalizeAssetCurrency(item.priceDisplayCurrency || "")
  };
}

function normalizeAssetCurrency(value) {
  return String(value || "").trim().toUpperCase();
}

function inferAssetCurrencyFromCode(code) {
  const match = String(code || "").trim().toUpperCase().match(/^[A-Z0-9]+-([A-Z]{3})$/);
  return match ? match[1] : "";
}

function getAssetCurrency(item = {}) {
  return normalizeAssetCurrency(item.currency) || inferAssetCurrencyFromCode(item.code) || "KRW";
}

function getAssetExchangeRateToKrw(item = {}) {
  const currency = getAssetCurrency(item);
  if (currency === "KRW") return 1;
  return Math.max(0, Number(item.exchangeRateToKrw) || 0);
}

function hasAssetForeignDisplay(item = {}) {
  const currency = getAssetCurrency(item);
  return currency && currency !== "KRW" && getAssetExchangeRateToKrw(item) > 0;
}

function getAssetDisplayCurrency(item = {}) {
  const currency = getAssetCurrency(item);
  if (!hasAssetForeignDisplay(item)) return "KRW";
  return normalizeAssetCurrency(item.priceDisplayCurrency) === currency ? currency : "KRW";
}

function getAssetMarketPrice(item = {}) {
  const marketPrice = Math.max(0, Number(item.marketPrice) || 0);
  if (marketPrice) return marketPrice;

  const rate = getAssetExchangeRateToKrw(item);
  const currentPrice = Math.max(0, Number(item.currentPrice) || 0);
  return hasAssetForeignDisplay(item) && rate ? currentPrice / rate : currentPrice;
}

function getAssetCurrentPriceInputValue(item = {}) {
  const displayCurrency = getAssetDisplayCurrency(item);
  return displayCurrency === "KRW"
    ? (item.currentPrice ? formatMarketNumber(item.currentPrice) : "")
    : formatAssetDecimal(getAssetMarketPrice(item));
}

function getAssetCurrentPriceUnit(item = {}) {
  const displayCurrency = getAssetDisplayCurrency(item);
  return displayCurrency === "KRW" ? "원" : displayCurrency;
}

function getAssetMarketLabel(item = {}) {
  const type = String(item.type || "").trim();
  const quoteType = String(item.quoteType || "").trim().toUpperCase();
  const market = String(item.market || "").trim();
  const exchange = String(item.exchange || "").trim();
  const code = String(item.code || item.symbol || "").trim().toUpperCase();
  const marketUpper = market.toUpperCase();
  const exchangeUpper = exchange.toUpperCase();

  if (["KOSPI", "KOSDAQ", "KONEX"].includes(marketUpper)) return marketUpper;
  if (["KOSPI", "KOSDAQ", "KONEX"].includes(exchangeUpper)) return exchangeUpper;
  if (quoteType === "CRYPTOCURRENCY" || type === "암호화폐") return "암호화폐";
  if (quoteType === "FUTURE" || type === "선물") return "선물";
  if (quoteType === "ETF" || type.toUpperCase() === "ETF") return "ETF";
  if (quoteType === "INDEX" || type === "지수") return "지수";
  if (quoteType === "CURRENCY" || type === "환율") return "환율";
  if (/^[A-Z0-9]+-[A-Z]{3}$/.test(code)) return "암호화폐";
  if (/=F$/.test(code)) return "선물";
  if (/\.KS$/.test(code)) return "KOSPI";
  if (/\.KQ$/.test(code)) return "KOSDAQ";
  const domesticMarket = getDomesticMarketFallback(code);
  if (domesticMarket) return domesticMarket;
  if (quoteType === "EQUITY") return type || "주식";
  return type || market || "";
}

function getDomesticMarketFallback(code) {
  const text = String(code || "").trim().toUpperCase();
  const normalizedCode = text.replace(/\.(KS|KQ)$/i, "");
  if (/\.KS$/i.test(text)) return "KOSPI";
  if (/\.KQ$/i.test(text)) return "KOSDAQ";
  if (knownDomesticMarketByCode[normalizedCode]) return knownDomesticMarketByCode[normalizedCode];
  return /^\d{6}$/.test(normalizedCode) ? "KRX" : "";
}

function getAssetMarketChipTone(label) {
  const text = String(label || "");
  if (/암호화폐|crypto/i.test(text)) return "crypto";
  if (/선물|future/i.test(text)) return "future";
  if (/ETF/i.test(text)) return "etf";
  if (/KOSPI|KOSDAQ|KONEX|국내/i.test(text)) return "domestic";
  return "global";
}

function getAssetLogoInitials(item = {}) {
  const source = String(item.name || item.code || item.symbol || "?").trim().replace(/\s+/g, "");
  const initials = Array.from(source).slice(0, 2).join("");
  return /[a-z]/i.test(initials) ? initials.toUpperCase() : initials || "?";
}

function renderAssetLogoMark(item = {}) {
  const categoryLabel = getAssetMarketLabel(item);
  const tone = getAssetMarketChipTone(categoryLabel);
  return `
    <span class="asset-settings-logo-mark ${tone}" aria-hidden="true">
      <span class="asset-settings-logo-fallback">${escapeChartText(getAssetLogoInitials(item))}</span>
    </span>
  `;
}

function clearAssetMarketMeta(item = {}) {
  return {
    ...item,
    type: "",
    quoteType: "",
    market: "",
    exchange: "",
    source: "",
    currency: "",
    marketPrice: 0,
    exchangeRateToKrw: 0,
    priceDisplayCurrency: ""
  };
}

function updateAssetCurrentPriceDraftValue(item, value) {
  const displayCurrency = getAssetDisplayCurrency(item);
  const rate = getAssetExchangeRateToKrw(item);

  if (displayCurrency === "KRW") {
    const currentPrice = parseAssetUnitPriceInput(value);
    return {
      ...item,
      currentPrice,
      marketPrice: hasAssetForeignDisplay(item) && rate ? Math.round((currentPrice / rate) * 1000000) / 1000000 : currentPrice
    };
  }

  const marketPrice = parseAssetDecimalInput(value);
  return {
    ...item,
    marketPrice,
    currentPrice: convertMarketPriceToKrwUnitPrice(marketPrice, rate)
  };
}

function updateAssetPriceDisplayCurrency(rowId, currency) {
  const normalizedCurrency = normalizeAssetCurrency(currency);
  assetSettingsDrafts = assetSettingsDrafts.map((item) => {
    if (item.id !== rowId) return item;
    const baseCurrency = getAssetCurrency(item);
    return {
      ...item,
      priceDisplayCurrency: normalizedCurrency === baseCurrency && hasAssetForeignDisplay(item) ? baseCurrency : "KRW"
    };
  });
  assetSettingsError = "";
  assetSettingsMessage = "";
}

function beginAssetSettingsEdit() {
  const holdingData = typeof getHoldingData === "function" ? getHoldingData() : [];
  assetSettingsDrafts = holdingData.map((item) => createAssetSettingsDraft(item));
  assetSettingsError = "";
  assetSettingsMessage = "";
  assetSettingsOpenMenuId = null;
  assetSettingsEditingId = null;
  assetSettingsActiveIndex = 0;
  assetSettingsMotion = null;
  assetSettingsPendingRemoveId = null;
  assetSettingsDeleteTargetId = "";
  assetMarketFavoritesOpenId = "";
  resetAssetMarketSearch();
  queueAssetSettingsMarketMetaEnrichment();
}

function cancelAssetSettingsEdit() {
  assetSettingsDrafts = [];
  assetSettingsError = "";
  assetSettingsMessage = "";
  assetSettingsOpenMenuId = null;
  assetSettingsEditingId = null;
  assetSettingsActiveIndex = 0;
  assetSettingsMotion = null;
  assetSettingsPendingRemoveId = null;
  assetSettingsDeleteTargetId = "";
  assetMarketFavoritesOpenId = "";
  if (assetSettingsMotionTimer) window.clearTimeout(assetSettingsMotionTimer);
  assetSettingsMotionTimer = 0;
  resetAssetMarketSearch();
}

function addAssetSettingsDraft() {
  const draft = createAssetSettingsDraft();
  const insertIndex = assetSettingsDrafts.length;
  assetSettingsDrafts.push(draft);
  assetSettingsError = "";
  assetSettingsMessage = "";
  assetSettingsOpenMenuId = null;
  assetMarketFavoritesOpenId = "";
  assetSettingsEditingId = draft.id;
  assetSettingsActiveIndex = insertIndex;
  resetAssetMarketSearch(draft.id);
  assetSettingsMotion = {
    type: "add",
    id: draft.id,
    adjacentIndex: Math.max(insertIndex - 1, 0)
  };
}

function removeAssetSettingsDraft(rowId) {
  const removedIndex = assetSettingsDrafts.findIndex((item) => item.id === rowId);
  const wasEditing = assetSettingsEditingId === rowId;
  assetSettingsDrafts = assetSettingsDrafts.filter((item) => item.id !== rowId);
  assetSettingsError = "";
  assetSettingsMessage = "";
  assetSettingsOpenMenuId = null;
  if (assetMarketFavoritesOpenId === rowId) assetMarketFavoritesOpenId = "";
  if (assetMarketSearch.rowId === rowId) resetAssetMarketSearch();
  if (!assetSettingsDrafts.length) {
    const draft = createAssetSettingsDraft();
    assetSettingsDrafts.push(draft);
    assetSettingsEditingId = draft.id;
    assetSettingsActiveIndex = 0;
    assetSettingsMotion = { type: "add", id: draft.id, adjacentIndex: 0 };
    return;
  }
  if (removedIndex >= 0 && removedIndex < assetSettingsActiveIndex) {
    assetSettingsActiveIndex -= 1;
  }
  assetSettingsActiveIndex = Math.min(assetSettingsActiveIndex, assetSettingsDrafts.length - 1);
  if (wasEditing || !assetSettingsEditingId) {
    assetSettingsEditingId = assetSettingsDrafts[Math.min(Math.max(removedIndex, 0), assetSettingsDrafts.length - 1)]?.id || null;
  }
  assetSettingsMotion = {
    type: "remove",
    settleIndex: Math.min(Math.max(removedIndex, 0), assetSettingsDrafts.length - 1)
  };
}

function updateAssetSettingsDraft(rowId, field, value) {
  assetSettingsDrafts = assetSettingsDrafts.map((item) => {
    if (item.id !== rowId) return item;
    if (field === "priceInputMode") {
      return { ...item, priceInputMode: value === "full" ? "full" : "quantity" };
    }
    if (field === "name" || field === "code") {
      return clearAssetMarketMeta({ ...item, [field]: value });
    }
    if (field === "currentPrice") {
      return updateAssetCurrentPriceDraftValue(item, value);
    }
    if (field === "quantity") {
      return { ...item, [field]: parseAssetDecimalInput(value) };
    }
    return { ...item, [field]: parseAssetUnitPriceInput(value) };
  });
  assetSettingsError = "";
  assetSettingsMessage = "";
}

function syncAssetSettingsDraftFieldsFromDom(root = document) {
  root.querySelectorAll("[data-asset-setting-field][data-asset-setting-id]").forEach((field) => {
    const rowId = field.dataset.assetSettingId;
    const fieldName = field.dataset.assetSettingField;
    const current = assetSettingsDrafts.find((item) => item.id === rowId);
    if (!current || !fieldName) return;

    const rawValue = field.value;
    if (fieldName === "name" || fieldName === "code") {
      if (String(current[fieldName] || "") !== String(rawValue || "")) {
        updateAssetSettingsDraft(rowId, fieldName, rawValue);
      }
      return;
    }

    if (fieldName === "currentPrice") {
      const nextValue = parseAssetUnitPriceInput(rawValue);
      if (Number(current.currentPrice || 0) !== nextValue) {
        updateAssetSettingsDraft(rowId, fieldName, rawValue);
      }
      return;
    }

    if (fieldName === "quantity") {
      const nextValue = parseAssetDecimalInput(rawValue);
      if (Number(current[fieldName] || 0) !== nextValue) {
        updateAssetSettingsDraft(rowId, fieldName, rawValue);
      }
      return;
    }

    if (fieldName === "averagePrice") {
      const nextValue = parseAssetUnitPriceInput(rawValue);
      if (Number(current[fieldName] || 0) !== nextValue) {
        updateAssetSettingsDraft(rowId, fieldName, rawValue);
      }
    }
  });
}

function patchAssetSettingsDraft(rowId, patch = {}) {
  assetSettingsDrafts = assetSettingsDrafts.map((item) =>
    item.id === rowId ? { ...item, ...patch } : item
  );
  assetSettingsError = "";
  assetSettingsMessage = "";
}

function resetAssetMarketSearch(rowId = "") {
  if (assetMarketSearchTimer) window.clearTimeout(assetMarketSearchTimer);
  assetMarketSearchTimer = 0;
  assetMarketSearch = {
    rowId,
    query: "",
    loading: false,
    results: [],
    error: "",
    requestId: assetMarketSearch.requestId + 1
  };
}

function formatAssetMarketPrice(result) {
  const price = Number(result?.currentPrice || 0);
  if (!price) return "";
  const currency = result.currency || "";
  const priceKrw = Number(result?.currentPriceKrw || 0);
  if (currency && currency !== "KRW" && priceKrw) {
    return `${formatMarketNumber(price)} ${currency} · ${formatMarketNumber(priceKrw)}원`;
  }
  const formatted = currency === "KRW"
    ? `${formatMarketNumber(price)}원`
    : `${formatMarketNumber(price)}${currency ? ` ${currency}` : ""}`;
  return formatted;
}

function getAssetMarketSourceBadge(result = {}) {
  const sourceText = [result.source, result.market, result.exchange]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (sourceText.includes("binance")) return "Binance";
  if (sourceText.includes("yahoo")) return "Yahoo";
  return "";
}

function isAssetMarketSourceText(value = "", sourceBadge = "") {
  if (!sourceBadge) return false;
  const text = String(value || "").toLowerCase();
  const source = String(sourceBadge || "").toLowerCase();
  return text === source || text.includes(source);
}

function getAssetFavoriteMarketItems() {
  return stockFavoriteItems
    .map((item, index) => ({ item: normalizeStockAnalysisItem(item), index }))
    .filter(({ item }) => String(item.name || item.code || item.symbol || "").trim())
    .slice(0, 8);
}

function renderAssetMarketFavorites(rowId) {
  const favorites = getAssetFavoriteMarketItems();
  if (assetMarketFavoritesOpenId !== rowId) return "";

  return `
    <div class="asset-market-favorites-menu" role="listbox" aria-label="즐겨찾기 종목">
      ${favorites.length
        ? favorites.map(({ item, index }) => {
          const priceText = formatAssetMarketPrice(item);
          const metaText = [item.code || item.symbol, getStockMarketLabel(item)].filter(Boolean).join(" · ");
          return `
            <button class="asset-market-favorite-option" type="button" role="option" data-asset-market-favorite="${index}" data-asset-setting-id="${rowId}">
              <span>
                <strong>${escapeChartText(item.name)}</strong>
                <em>${escapeChartText(metaText || item.symbol || "")}</em>
              </span>
              ${priceText ? `<b>${escapeChartText(priceText)}</b>` : ""}
            </button>
          `;
        }).join("")
        : `<div class="asset-market-favorites-empty">즐겨찾기한 종목이 없습니다.</div>`}
    </div>
  `;
}

function renderAssetMarketSearchPanel(rowId) {
  if (assetMarketSearch.rowId !== rowId) return "";

  const query = String(assetMarketSearch.query || "").trim();
  if (assetMarketSearch.loading) {
    return `<div class="asset-market-search-state">종목을 검색하고 있습니다.</div>`;
  }

  if (assetMarketSearch.error) {
    return `<div class="asset-market-search-state error">${escapeChartText(assetMarketSearch.error)}</div>`;
  }

  if (!query || query.length < 2) {
    return "";
  }

  if (!assetMarketSearch.results.length) {
    return `<div class="asset-market-search-state">검색 결과가 없습니다. 종목명이나 6자리 코드를 입력해보세요.</div>`;
  }

  return `
    <div class="asset-market-search-results" role="listbox" aria-label="종목 검색 결과">
      ${assetMarketSearch.results.map((result, index) => {
        const priceText = formatAssetMarketPrice(result);
        const sourceBadge = getAssetMarketSourceBadge(result);
        const marketText = [result.symbol, result.type || result.quoteType, result.market || result.exchange]
          .filter((part) => !isAssetMarketSourceText(part, sourceBadge))
          .filter(Boolean)
          .join(" · ");
        return `
          <button class="asset-market-search-result" type="button" role="option" data-asset-market-result="${index}" data-asset-setting-id="${rowId}">
            <span>
              <strong>${escapeChartText(result.name || result.symbol || result.code)}</strong>
              <span class="asset-market-result-meta">
                ${sourceBadge ? `<i class="asset-market-source-badge source-${sourceBadge.toLowerCase()}">${sourceBadge}</i>` : ""}
                <em>${escapeChartText(marketText || result.code || "")}</em>
              </span>
            </span>
            ${priceText ? `<b>${escapeChartText(priceText)}</b>` : ""}
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function updateAssetMarketSearchPanel(rowId) {
  const panel = document.querySelector(`[data-asset-market-search-panel="${rowId}"]`);
  if (!panel) return;
  panel.innerHTML = renderAssetMarketSearchPanel(rowId);
}

async function runAssetMarketSearch(rowId, query, requestId) {
  try {
    const results = await fetchMarketSearchResults(query);
    const response = { ok: true };
    const payload = { ok: true, results };
    if (assetMarketSearch.requestId !== requestId || assetMarketSearch.rowId !== rowId) return;
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "종목 검색에 실패했습니다.");
    }

    assetMarketSearch.loading = false;
    assetMarketSearch.results = Array.isArray(payload.results) ? payload.results : [];
    assetMarketSearch.error = "";
    updateAssetMarketSearchPanel(rowId);
  } catch (error) {
    if (assetMarketSearch.requestId !== requestId || assetMarketSearch.rowId !== rowId) return;
    assetMarketSearch.loading = false;
    assetMarketSearch.results = [];
    assetMarketSearch.error = error?.message || "종목 검색에 실패했습니다.";
    updateAssetMarketSearchPanel(rowId);
  }
}

function getAssetMarketMetaCacheKey(item = {}) {
  return String(item.code || item.symbol || item.name || "").trim().toUpperCase();
}

function shouldEnrichAssetMarketMeta(item = {}) {
  const code = String(item.code || item.symbol || "").trim();
  const metadata = String(item.market || item.exchange || item.quoteType || item.type || "").trim();
  return Boolean(code) && !metadata;
}

function findAssetMarketMetaResult(results = [], item = {}) {
  const code = String(item.code || item.symbol || "").trim().toUpperCase();
  const normalizedCode = code.replace(/\.(KS|KQ)$/i, "");
  if (!code) return null;

  return results.find((result) => {
    const resultCode = String(result.code || "").trim().toUpperCase();
    const resultSymbol = String(result.symbol || "").trim().toUpperCase();
    const normalizedSymbol = resultSymbol.replace(/\.(KS|KQ)$/i, "");
    return resultCode === normalizedCode || resultSymbol === code || normalizedSymbol === normalizedCode;
  }) || results[0] || null;
}

async function fetchAssetMarketMeta(item = {}, { force = false } = {}) {
  const cacheKey = getAssetMarketMetaCacheKey(item);
  if (!cacheKey) return null;
  if (!force && assetMarketMetaCache.has(cacheKey)) return assetMarketMetaCache.get(cacheKey);

  const results = await fetchMarketSearchResults(cacheKey, { force }).catch(() => []);
  const result = findAssetMarketMetaResult(Array.isArray(results) ? results : [], item);
  assetMarketMetaCache.set(cacheKey, result || null);
  return result || null;
}

function getAssetMarketMetaPatch(result = {}) {
  const patch = {
    type: result.type || "",
    quoteType: result.quoteType || "",
    market: result.market || "",
    exchange: result.exchange || "",
    source: result.source || "",
    logoUrl: result.logoUrl || "",
    currency: normalizeAssetCurrency(result.currency || "")
  };
  return Object.fromEntries(Object.entries(patch).filter(([, value]) => value));
}

function getAssetMarketResultPatch(result = {}, currentDraft = {}, { includeIdentity = false } = {}) {
  const resultCurrency = normalizeAssetCurrency(result.currency || "");
  const exchangeRateToKrw = Math.max(0, Number(result.exchangeRateToKrw) || (resultCurrency === "KRW" ? 1 : 0));
  const marketPrice = Math.max(0, Number(result.currentPrice) || 0);
  const currentPrice = Number(result.currentPriceKrw || 0) > 0
    ? roundAssetKrwUnitPrice(Number(result.currentPriceKrw))
    : resultCurrency === "KRW" && marketPrice > 0
      ? roundAssetKrwUnitPrice(marketPrice)
      : marketPrice && exchangeRateToKrw
        ? convertMarketPriceToKrwUnitPrice(marketPrice, exchangeRateToKrw)
        : Math.max(0, Number(currentDraft.currentPrice) || 0);

  return {
    ...(includeIdentity
      ? {
          name: result.name || currentDraft.name || result.symbol || "",
          code: result.code || result.symbol || currentDraft.code || ""
        }
      : {}),
    currentPrice: roundAssetKrwUnitPrice(currentPrice),
    type: result.type || currentDraft.type || "",
    quoteType: result.quoteType || currentDraft.quoteType || "",
    market: result.market || currentDraft.market || "",
    exchange: result.exchange || currentDraft.exchange || "",
    source: result.source || currentDraft.source || "",
    logoUrl: result.logoUrl || currentDraft.logoUrl || "",
    currency: resultCurrency || getAssetCurrency(currentDraft),
    marketPrice: marketPrice || getAssetMarketPrice(currentDraft),
    exchangeRateToKrw: exchangeRateToKrw || getAssetExchangeRateToKrw(currentDraft),
    priceDisplayCurrency: "KRW"
  };
}

async function enrichAssetSettingsMarketMeta() {
  if (activeModal !== "assetSettings" || !assetSettingsDrafts.length) return;

  const targets = assetSettingsDrafts.filter(shouldEnrichAssetMarketMeta);
  if (!targets.length) return;

  let changed = false;
  for (const target of targets) {
    const cacheKey = getAssetMarketMetaCacheKey(target);
    const result = await fetchAssetMarketMeta(target).catch(() => null);
    if (!result || activeModal !== "assetSettings") continue;

    const current = assetSettingsDrafts.find((item) => item.id === target.id);
    if (!current || getAssetMarketMetaCacheKey(current) !== cacheKey || !shouldEnrichAssetMarketMeta(current)) continue;

    const patch = getAssetMarketMetaPatch(result);
    if (!Object.keys(patch).length) continue;

    assetSettingsDrafts = assetSettingsDrafts.map((item) => item.id === target.id ? { ...item, ...patch } : item);
    changed = true;
  }

  if (changed && activeModal === "assetSettings") {
    renderModal();
    hydrateIcons(document);
  }
}

function queueAssetSettingsMarketMetaEnrichment() {
  window.setTimeout(() => {
    enrichAssetSettingsMarketMeta().catch((error) => {
      console.warn("Asset market metadata could not be enriched.", error);
    });
  }, 0);
}

function hasAssetMarketPatchChanged(previous = {}, next = {}) {
  return Math.abs((Number(previous.currentPrice) || 0) - (Number(next.currentPrice) || 0)) > 0.000000001 ||
    Math.round(Number(previous.marketPrice) * 1000000 || 0) !== Math.round(Number(next.marketPrice) * 1000000 || 0) ||
    String(previous.type || "") !== String(next.type || "") ||
    String(previous.quoteType || "") !== String(next.quoteType || "") ||
    String(previous.market || "") !== String(next.market || "") ||
    String(previous.exchange || "") !== String(next.exchange || "") ||
    String(previous.currency || "") !== String(next.currency || "") ||
    Number(previous.exchangeRateToKrw || 0) !== Number(next.exchangeRateToKrw || 0);
}

async function refreshStoredAssetMarketPrices({ syncRemote = true } = {}) {
  if (assetPriceRefreshRunning) {
    assetPriceRefreshQueued = true;
    assetPriceRefreshQueuedSyncRemote = assetPriceRefreshQueuedSyncRemote || Boolean(syncRemote);
    return false;
  }
  if (activeModal === "assetSettings") return false;
  if (typeof getHoldingData !== "function") return false;

  const holdingData = getHoldingData().filter((item) => String(item.code || item.name || "").trim());
  if (!holdingData.length) return false;

  assetPriceRefreshRunning = true;
  const refreshRevision = assetHoldingsRevision;
  let changed = false;
  const refreshedRows = [];

  try {
    for (const item of holdingData) {
      const result = await fetchAssetMarketMeta(item, { force: true }).catch(() => null);
      if (!result) {
        refreshedRows.push(item);
        continue;
      }

      const patch = getAssetMarketResultPatch(result, item);
      const nextItem = { ...item, ...patch };
      if (hasAssetMarketPatchChanged(item, nextItem)) changed = true;
      refreshedRows.push(nextItem);
    }

    if (refreshRevision !== assetHoldingsRevision) {
      assetPriceRefreshQueued = true;
      return false;
    }

    if (!changed) return false;
    if (!replaceAssetHoldings(refreshedRows)) return false;

    await saveAssetStateToStorage({ syncRemote, source: "system" });
    if (!activeModal) {
      render();
    } else if (activeModal !== "assetSettings") {
      renderModal();
      hydrateIcons(document);
    }
    return true;
  } finally {
    assetPriceRefreshRunning = false;
    if (assetPriceRefreshQueued) {
      const queuedSyncRemote = assetPriceRefreshQueuedSyncRemote || Boolean(syncRemote);
      assetPriceRefreshQueued = false;
      assetPriceRefreshQueuedSyncRemote = false;
      queueStoredAssetMarketPriceRefresh({ delay: 0, syncRemote: queuedSyncRemote });
    }
  }
}

function queueStoredAssetMarketPriceRefresh({ delay = 700, syncRemote = true } = {}) {
  if (assetPriceRefreshTimer) window.clearTimeout(assetPriceRefreshTimer);
  assetPriceRefreshTimer = window.setTimeout(() => {
    assetPriceRefreshTimer = 0;
    refreshStoredAssetMarketPrices({ syncRemote }).catch((error) => {
      console.warn("Stored asset prices could not be refreshed.", error);
    });
  }, delay);
}

function refreshVisibleMarketData({ syncRemote = true } = {}) {
  const userId = getCurrentUserStorageId();
  if (!authState.authenticated || !userId || userDataServerLoadedFor !== userId) return;
  if (!isAuthRequiredRoute(getRoute())) return;

  queueStoredAssetMarketPriceRefresh({ delay: 0, syncRemote });
  refreshStockFavoritesMarketPrices({ syncRemote }).catch((error) => {
    console.warn("Visible stock favorite prices could not be refreshed.", error);
  });
  if (getRoute() === "stock") refreshCurrentStockAnalysisPrices();
}

function scheduleAssetMarketSearch(rowId, query) {
  const nextQuery = String(query || "").trim();
  if (assetMarketSearchTimer) window.clearTimeout(assetMarketSearchTimer);
  assetMarketFavoritesOpenId = "";

  const requestId = assetMarketSearch.requestId + 1;
  assetMarketSearch = {
    rowId,
    query: nextQuery,
    loading: nextQuery.length >= 2,
    results: [],
    error: "",
    requestId
  };
  updateAssetMarketSearchPanel(rowId);

  if (nextQuery.length < 2) return;

  assetMarketSearchTimer = window.setTimeout(() => {
    assetMarketSearchTimer = 0;
    runAssetMarketSearch(rowId, nextQuery, requestId);
  }, 260);
}

function applyAssetMarketResult(rowId, resultIndex) {
  const result = assetMarketSearch.rowId === rowId
    ? assetMarketSearch.results[Number(resultIndex)]
    : null;
  if (!result) return false;

  const currentDraft = assetSettingsDrafts.find((item) => item.id === rowId) || {};
  const patch = getAssetMarketResultPatch(result, currentDraft, { includeIdentity: true });
  if (!Number(currentDraft.averagePrice || 0) && Number(patch.currentPrice || 0)) {
    patch.averagePrice = patch.currentPrice;
  }
  patchAssetSettingsDraft(rowId, patch);

  assetSettingsEditingId = rowId;
  assetSettingsOpenMenuId = null;
  assetMarketFavoritesOpenId = "";
  resetAssetMarketSearch(rowId);
  return true;
}

function applyAssetFavoriteResult(rowId, favoriteIndex) {
  const favorite = stockFavoriteItems[Number(favoriteIndex)];
  if (!favorite) return false;

  const currentDraft = assetSettingsDrafts.find((item) => item.id === rowId) || {};
  const patch = getAssetMarketResultPatch(normalizeStockAnalysisItem(favorite), currentDraft, { includeIdentity: true });
  if (!Number(currentDraft.averagePrice || 0) && Number(patch.currentPrice || 0)) {
    patch.averagePrice = patch.currentPrice;
  }
  patchAssetSettingsDraft(rowId, patch);

  assetSettingsEditingId = rowId;
  assetSettingsOpenMenuId = null;
  assetMarketFavoritesOpenId = "";
  resetAssetMarketSearch(rowId);
  return true;
}

async function refreshAssetAveragePriceFromMarket(rowId) {
  const currentDraft = assetSettingsDrafts.find((item) => item.id === rowId);
  if (!currentDraft || !String(currentDraft.code || currentDraft.name || "").trim()) {
    throw new Error("먼저 종목을 선택해 주세요.");
  }

  const result = await fetchAssetMarketMeta(currentDraft, { force: true });
  if (!result) throw new Error("현재가를 불러오지 못했습니다.");

  const patch = getAssetMarketResultPatch(result, currentDraft, { includeIdentity: true });
  if (!Number(patch.currentPrice || 0)) throw new Error("현재가를 확인하지 못했습니다.");

  patch.averagePrice = patch.currentPrice;
  patchAssetSettingsDraft(rowId, patch);
  assetSettingsMessage = "현재가를 평균단가에 반영했습니다.";
  return true;
}

function isEmptyAssetSettingsDraft(item) {
  return !String(item.name || "").trim() &&
    !String(item.code || "").trim() &&
    !item.quantity &&
    !item.averagePrice &&
    !item.currentPrice;
}

function getAssetSettingsWatchPrice(item) {
  const watch = typeof getWatchStock === "function" ? getWatchStock(item.name, item.code) : null;
  return Math.max(0, Number(watch?.price) || 0);
}

function getAssetSettingsValuationPrice(item, mode = item.priceInputMode) {
  const inputMode = mode === "quantity" ? "quantity" : "full";
  const averagePrice = Math.max(0, Number(item.averagePrice) || 0);
  const currentPrice = Math.max(0, Number(item.currentPrice) || 0);
  const watchPrice = getAssetSettingsWatchPrice(item);
  if (inputMode === "full") return currentPrice || watchPrice || averagePrice;

  return Math.max(0, currentPrice || watchPrice || averagePrice);
}

function getAssetSettingsPreviewAmount(item, mode = item.priceInputMode) {
  return Math.round((Number(item.quantity) || 0) * getAssetSettingsValuationPrice(item, mode));
}

function updateAssetSettingsMarketMeta(rowId) {
  const item = assetSettingsDrafts.find((draft) => draft.id === rowId);
  const card = document.querySelector(`[data-asset-setting-card="${rowId}"]`);
  if (!item || !card) return;

  const categoryLabel = getAssetMarketLabel(item);
  const chipRow = card.querySelector(".asset-settings-chip-row");
  let sectorChip = card.querySelector(".asset-settings-sector-chip");

  if (categoryLabel && chipRow) {
    if (!sectorChip) {
      sectorChip = document.createElement("span");
      chipRow.appendChild(sectorChip);
    }
    sectorChip.className = `asset-settings-sector-chip ${getAssetMarketChipTone(categoryLabel)}`;
    sectorChip.textContent = categoryLabel;
  } else if (sectorChip) {
    sectorChip.remove();
  }
}

function updateAssetSettingsCardPreview(rowId) {
  const item = assetSettingsDrafts.find((draft) => draft.id === rowId);
  const card = document.querySelector(`[data-asset-setting-card="${rowId}"]`);
  if (!item || !card) return;

  const amount = getAssetSettingsPreviewAmount(item);
  const valueNode = card.querySelector(".asset-settings-value-panel strong");
  if (valueNode) {
    valueNode.innerHTML = `${formatMarketNumber(amount)}<small>\uC6D0</small>`;
  }

  const legacyAmountNode = card.querySelector(".asset-settings-preview p:first-child strong");
  if (legacyAmountNode) {
    legacyAmountNode.textContent = `${formatMarketNumber(amount)}\uC6D0`;
  }

  updateAssetSettingsMarketMeta(rowId);
}

function normalizeAssetSettingsRow(item) {
  const mode = "quantity";
  const quantity = Math.max(0, Number(item.quantity) || 0);
  const valuationPrice = getAssetSettingsValuationPrice(item, mode);
  const amount = Math.round(quantity * valuationPrice);
  const averagePrice = Math.max(0, Number(item.averagePrice) || 0) || valuationPrice;
  const currentPrice = valuationPrice || averagePrice;

  return {
    name: String(item.name || "").trim(),
    code: String(item.code || "").trim(),
    quantity,
    averagePrice,
    currentPrice,
    priceInputMode: mode,
    type: String(item.type || "").trim(),
    quoteType: String(item.quoteType || "").trim(),
    market: String(item.market || "").trim(),
    exchange: String(item.exchange || "").trim(),
    source: String(item.source || "").trim(),
    logoUrl: String(item.logoUrl || "").trim(),
    currency: getAssetCurrency(item),
    marketPrice: getAssetMarketPrice(item),
    exchangeRateToKrw: getAssetExchangeRateToKrw(item),
    priceDisplayCurrency: getAssetDisplayCurrency(item)
  };
}

function getAssetSettingsCardMotionClass(item, index) {
  if (!assetSettingsMotion) return "";
  const classes = [];

  if (assetSettingsMotion.type === "add") {
    if (assetSettingsMotion.id === item.id) classes.push("is-entering");
    if (index === assetSettingsMotion.adjacentIndex) classes.push("is-pushed");
  }

  if (assetSettingsMotion.type === "remove" && index >= assetSettingsMotion.settleIndex) {
    classes.push("is-settling");
  }

  return classes.join(" ");
}

function clearAssetSettingsMotionClasses(root = document) {
  const cards = root.querySelector(".asset-settings-cards");
  cards?.removeAttribute("data-motion");
  root.querySelectorAll(".asset-settings-display-card").forEach((card) => {
    card.classList.remove("is-entering", "is-pushed", "is-removing", "is-settling", "is-remove-neighbor");
  });
}

function scheduleAssetSettingsMotionClear() {
  if (!assetSettingsMotion) return;
  if (assetSettingsMotionTimer) window.clearTimeout(assetSettingsMotionTimer);
  const clearDelay = assetSettingsMotion.type === "add" ? 920 : 720;
  assetSettingsMotionTimer = window.setTimeout(() => {
    assetSettingsMotion = null;
    assetSettingsMotionTimer = 0;
    clearAssetSettingsMotionClasses();
  }, shouldReduceMotion() ? 0 : clearDelay);
}

async function persistAssetSettingsChange(source = "user") {
  try {
    const saved = await saveAssetStateToStorage({ source, immediate: true });
    if (authState.authenticated && !saved) {
      throw new Error("서버 저장이 완료되지 않았습니다. 잠시 후 다시 시도해 주세요.");
    }
    assetSettingsError = "";
    return true;
  } catch (error) {
    assetSettingsError = error?.message || "자산 데이터를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    assetSettingsMessage = "";
    return false;
  }
}

async function applyAssetSettingsEdit() {
  const rows = assetSettingsDrafts
    .filter((item) => !isEmptyAssetSettingsDraft(item))
    .map((item) => normalizeAssetSettingsRow(item));

  if (!rows.length) {
    clearAssetHoldingsRuntime();
    if (!(await persistAssetSettingsChange("user_clear"))) return false;
    cancelAssetSettingsEdit();
    return true;
  }

  if (!replaceAssetHoldings(rows)) return false;

  if (!(await persistAssetSettingsChange("user"))) return false;
  cancelAssetSettingsEdit();
  return true;
}

function getAssetSettingsDeleteTarget() {
  return assetSettingsDrafts.find((item) => item.id === assetSettingsDeleteTargetId) || null;
}

function requestAssetSettingsDelete(rowId) {
  assetSettingsDeleteTargetId = rowId;
  assetSettingsOpenMenuId = null;
  activeModal = "assetSettingsDeleteConfirm";
}

function cancelAssetSettingsDelete() {
  assetSettingsDeleteTargetId = "";
  activeModal = "assetSettings";
}

async function confirmAssetSettingsDelete() {
  const target = getAssetSettingsDeleteTarget();
  if (!target) {
    assetSettingsDeleteTargetId = "";
    activeModal = "assetSettings";
    return false;
  }

  const previousSnapshot = getAssetSnapshot();
  const rows = assetSettingsDrafts
    .filter((item) => item.id !== target.id && !isEmptyAssetSettingsDraft(item))
    .map((item) => normalizeAssetSettingsRow(item));

  if (rows.length) {
    if (!replaceAssetHoldings(rows)) {
      activeModal = "assetSettings";
      assetSettingsDeleteTargetId = "";
      return false;
    }
  } else {
    clearAssetHoldingsRuntime();
  }

  if (!(await persistAssetSettingsChange(rows.length ? "user" : "user_clear"))) {
    applyUserAssetSnapshot(previousSnapshot);
    activeModal = "assetSettings";
    assetSettingsDeleteTargetId = "";
    return false;
  }

  const deletedName = String(target.name || target.code || "자산").trim();
  beginAssetSettingsEdit();
  assetSettingsMessage = `${deletedName}을 삭제했습니다.`;
  assetSettingsDeleteTargetId = "";
  activeModal = "assetSettings";
  return true;
}

function renderAssetSettingsDeleteConfirmModal() {
  const target = getAssetSettingsDeleteTarget();
  const targetName = String(target?.name || target?.code || "선택한 자산").trim();
  const targetCode = String(target?.code || "").trim();

  return `
    <div class="modal-backdrop">
      <section class="modal-panel asset-cash-confirm-modal asset-delete-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="assetDeleteConfirmTitle">
        <div class="modal-header">
          <div>
            <p class="eyebrow">Delete Asset</p>
            <h2 class="modal-title" id="assetDeleteConfirmTitle">자산 삭제</h2>
          </div>
          <button class="icon-button" type="button" data-modal-close aria-label="닫기">X</button>
        </div>
        <div class="modal-body">
          <div class="asset-cash-confirm-card delete">
            <span>${icon("trash")}</span>
            <div>
              <p>삭제 대상</p>
              <strong>${escapeChartText(targetName)}</strong>
              ${targetCode ? `<em>${escapeChartText(targetCode)}</em>` : ""}
            </div>
          </div>
          <p class="asset-cash-confirm-question delete">삭제하시겠습니까?</p>
          <div class="asset-cash-actions">
            <button class="btn" type="button" data-asset-settings-delete-cancel>취소</button>
            <button class="btn danger" type="button" data-asset-settings-delete-confirm>확인</button>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderAssetSettingsModal() {
  const drafts = assetSettingsDrafts;
  const canAdd = true;

  return `
    <div class="modal-backdrop">
      <section class="modal-panel asset-settings-modal" role="dialog" aria-modal="true" aria-labelledby="assetSettingsModalTitle">
        <div class="modal-header">
          <div>
            <p class="eyebrow">Asset Settings</p>
            <h2 class="modal-title" id="assetSettingsModalTitle">자산 설정</h2>
          </div>
          <button class="icon-button" type="button" data-modal-close aria-label="닫기">X</button>
        </div>
        <div class="modal-body">
          <div class="asset-settings-help">
            <strong>보유 자산을 수정하거나 새 자산을 추가하세요.</strong>
            <span>저장하면 자산 요약, 보유자산 구성, 보유 자산 목록이 함께 갱신됩니다.</span>
          </div>
          <div class="asset-settings-cards" aria-label="자산 설정 카드 목록">
            ${drafts
              .map((item, index) => {
                const amount = getAssetSettingsPreviewAmount(item);
                const costBasis = Math.round((Number(item.quantity) || 0) * (Number(item.averagePrice) || 0));
                const profit = amount - costBasis;
                const rate = costBasis ? (profit / costBasis) * 100 : 0;
                const profitClass = profit >= 0 ? "text-red" : "text-blue";
                const displayName = String(item.name || "").trim() || "새 자산";
                const displayCode = String(item.code || "").trim() || "코드 미입력";

                return `
                  <article class="asset-settings-card" data-asset-setting-card="${item.id}">
                    <div class="asset-settings-card-head">
                      <span>${index + 1}</span>
                      <div>
                        <strong>${escapeChartText(displayName)}</strong>
                        <em>${escapeChartText(displayCode)}</em>
                      </div>
                      <button class="mini-action asset-settings-remove" type="button" data-asset-settings-remove="${item.id}" aria-label="자산 삭제">${icon("trash")}</button>
                    </div>
                    <div class="asset-settings-card-body">
                      <div class="field asset-settings-name-field">
                        <label for="assetSettingName${index}">종목명</label>
                        <input id="assetSettingName${index}" class="input" type="text" value="${escapeChartText(item.name)}" autocomplete="off" placeholder="예: 삼성전자" data-asset-setting-field="name" data-asset-setting-id="${item.id}">
                      </div>
                      <div class="field">
                        <label for="assetSettingCode${index}">종목코드</label>
                        <input id="assetSettingCode${index}" class="input" type="text" value="${escapeChartText(item.code)}" autocomplete="off" placeholder="005930" data-asset-setting-field="code" data-asset-setting-id="${item.id}">
                      </div>
                      <div class="field">
                        <label for="assetSettingQuantity${index}">수량</label>
                        <div class="journal-input-shell">
                          <input id="assetSettingQuantity${index}" type="text" value="${item.quantity ? formatMarketNumber(item.quantity) : ""}" inputmode="decimal" autocomplete="off" placeholder="수량" data-number-input data-asset-setting-field="quantity" data-asset-setting-id="${item.id}">
                          <span>주</span>
                        </div>
                      </div>
                      <div class="field">
                        <label for="assetSettingAverage${index}">매수평균가 <span class="asset-settings-inline-badge">현재가</span></label>
                        <div class="journal-input-shell">
                          <input id="assetSettingAverage${index}" type="text" value="${item.averagePrice ? formatMarketNumber(item.averagePrice) : ""}" inputmode="decimal" autocomplete="off" placeholder="평단" data-number-input data-asset-setting-field="averagePrice" data-asset-setting-id="${item.id}">
                          <span>원</span>
                        </div>
                      </div>
                    </div>
                    <div class="asset-settings-preview">
                      <p><span>평가금액</span><strong>${formatMarketNumber(amount)}원</strong></p>
                      <p><span>평가손익</span><strong class="${profitClass}">${formatSignedMarketNumber(profit)}원</strong></p>
                      <p><span>수익률</span><strong class="${profitClass}">${formatSignedRate(rate)}</strong></p>
                    </div>
                  </article>
                `;
              })
              .join("")}
            ${
              canAdd
                ? `<button class="asset-settings-add-card ${drafts.length ? "" : "is-empty"}" type="button" data-asset-settings-add aria-label="자산 추가">
                    <span>${icon("plus")}</span>
                    ${drafts.length ? "<strong>자산 추가</strong><em>새 보유 자산을 카드로 추가합니다.</em>" : ""}
                  </button>`
                : ""
            }
          </div>
          <div class="asset-settings-footer">
            <span>${drafts.length}</span>
          </div>
          <p class="asset-settings-feedback error">${assetSettingsError}</p>
          <div class="asset-cash-actions">
            <button class="btn" type="button" data-modal-close>취소</button>
            <button class="btn primary" type="button" data-asset-settings-apply>저장</button>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderAssetSettingsCardView(item, index) {
  const inputMode = "quantity";
  const amount = getAssetSettingsPreviewAmount(item, inputMode);
  const categoryLabel = getAssetMarketLabel(item);
  const categoryTone = getAssetMarketChipTone(categoryLabel);
  const isEditing = assetSettingsEditingId === item.id;
  const readOnlyAttr = isEditing ? "" : `readonly aria-readonly="true" tabindex="-1"`;
  const displayName = String(item.name || "").trim() || "새 자산";
  const displayCode = String(item.code || item.symbol || "").trim();
  const readOnlyMeta = [displayCode, categoryLabel].filter(Boolean).join(" · ");
  const motionClass = getAssetSettingsCardMotionClass(item, index);
  const searchPanel = renderAssetMarketSearchPanel(item.id);
  const favoriteList = isEditing ? renderAssetMarketFavorites(item.id) : "";
  const favoriteCount = getAssetFavoriteMarketItems().length;
  if (!isEditing) {
    const quantityText = formatMarketNumber(Number(item.quantity) || 0);
    const priceText = formatMarketNumber(Number(item.averagePrice) || getAssetSettingsValuationPrice(item, inputMode) || 0);
    const amountText = formatMarketNumber(amount);
    const assetCodeText = displayCode || "코드 미입력";

    return `
      <article class="asset-settings-card asset-settings-display-card asset-settings-summary-card ${motionClass}" data-asset-setting-card="${item.id}">
        <button class="mini-action asset-settings-menu" type="button" data-asset-settings-menu="${item.id}" aria-label="자산 메뉴" aria-expanded="${assetSettingsOpenMenuId === item.id ? "true" : "false"}">${icon("more")}</button>
        ${
          assetSettingsOpenMenuId === item.id
            ? `<div class="asset-settings-floating-menu" role="menu">
                <button type="button" data-asset-settings-edit="${item.id}" role="menuitem">${icon("edit")}수정</button>
                <button type="button" data-asset-settings-remove="${item.id}" role="menuitem">${icon("trash")}삭제</button>
              </div>`
            : ""
        }

        <div class="asset-settings-summary-hero">
          <svg class="asset-settings-summary-wave" viewBox="0 0 640 190" aria-hidden="true" preserveAspectRatio="none">
            <path d="M0 154 C84 130 122 138 168 148 C214 158 238 122 286 130 C340 138 352 88 402 94 C452 100 462 128 514 102 C570 74 580 18 640 54" />
            <path d="M0 170 C88 152 130 150 186 160 C236 170 248 134 294 142 C348 150 358 106 410 110 C470 114 490 142 540 118 C592 92 600 50 640 72" />
          </svg>
          <div class="asset-settings-summary-content">
            ${renderAssetLogoMark(item)}
            <div class="asset-settings-summary-title">
              <div class="asset-settings-summary-badge-row">
                <span class="asset-settings-chip">ASSET ${String(index + 1).padStart(2, "0")}</span>
                ${categoryLabel ? `<span class="asset-settings-sector-chip ${categoryTone}">${escapeChartText(categoryLabel)}</span>` : ""}
              </div>
              <strong>${escapeChartText(displayName)}</strong>
              <span>${escapeChartText(assetCodeText)}</span>
            </div>
          </div>
        </div>

        <div class="asset-settings-summary-metrics">
          <div class="asset-settings-summary-metric asset-settings-summary-quantity">
            <span class="asset-settings-summary-icon" aria-hidden="true">${icon("coin")}</span>
            <span class="asset-settings-summary-label">보유 수량</span>
            <strong>${quantityText}<small>주</small></strong>
          </div>
          <div class="asset-settings-summary-metric asset-settings-summary-price">
            <span class="asset-settings-summary-icon" aria-hidden="true">${icon("chart")}</span>
            <span class="asset-settings-summary-label">평균단가</span>
            <strong>${priceText}<small>원</small></strong>
          </div>
          <div class="asset-settings-summary-metric asset-settings-summary-value">
            <span class="asset-settings-summary-icon" aria-hidden="true">${icon("performance")}</span>
            <span class="asset-settings-summary-label">평가금액</span>
            <strong>${amountText}<small>원</small></strong>
          </div>
        </div>

        <div class="asset-settings-summary-note">
          <span aria-hidden="true">${icon("info")}</span>
          <p>평가금액은 보유 수량과 현재가를 기준으로 계산됩니다.</p>
        </div>
      </article>
    `;
  }

  return `
    <article class="asset-settings-card asset-settings-display-card ${isEditing ? "is-editing" : ""} ${motionClass}" data-asset-setting-card="${item.id}">
      <button class="mini-action asset-settings-menu" type="button" data-asset-settings-menu="${item.id}" aria-label="자산 메뉴" aria-expanded="${assetSettingsOpenMenuId === item.id ? "true" : "false"}">${icon("more")}</button>
      ${
        assetSettingsOpenMenuId === item.id
          ? `<div class="asset-settings-floating-menu" role="menu">
              <button type="button" data-asset-settings-edit="${item.id}" role="menuitem">${icon("edit")}수정</button>
              <button type="button" data-asset-settings-remove="${item.id}" role="menuitem">${icon("trash")}삭제</button>
            </div>`
          : ""
      }
      <div class="asset-settings-chip-row">
        <span class="asset-settings-chip">ASSET ${String(index + 1).padStart(2, "0")}</span>
        ${categoryLabel ? `<span class="asset-settings-sector-chip ${categoryTone}">${escapeChartText(categoryLabel)}</span>` : ""}
      </div>
      <div class="asset-settings-title-wrap ${isEditing ? "is-editing" : "is-readonly"}">
        ${
          isEditing
            ? `<div class="asset-market-search">
                <div class="asset-market-search-box">
                  <span aria-hidden="true">${icon("search")}</span>
                  <input class="asset-settings-title-input asset-market-search-input" type="text" value="${escapeChartText(item.name)}" autocomplete="off" placeholder="종목명 또는 코드 검색" data-asset-setting-field="name" data-asset-setting-id="${item.id}" data-asset-market-search-input>
                  <button class="asset-market-favorite-toggle ${assetMarketFavoritesOpenId === item.id ? "active" : ""}" type="button" data-asset-market-favorite-toggle="${item.id}" aria-label="즐겨찾기 종목 보기" aria-expanded="${assetMarketFavoritesOpenId === item.id ? "true" : "false"}" ${favoriteCount ? "" : "disabled"}>${icon("star")}</button>
                </div>
                ${favoriteList}
                <div class="asset-market-search-panel" data-asset-market-search-panel="${item.id}">${searchPanel}</div>
              </div>
              <label class="asset-market-code-field">
                <span>종목코드</span>
                <input class="asset-settings-code-input" type="text" value="${escapeChartText(item.code)}" autocomplete="off" placeholder="종목 선택 시 자동 입력" data-asset-setting-field="code" data-asset-setting-id="${item.id}" readonly aria-readonly="true">
              </label>`
            : `<input class="asset-settings-title-input" type="text" value="${escapeChartText(item.name)}" autocomplete="off" placeholder="새 자산" data-asset-setting-field="name" data-asset-setting-id="${item.id}" ${readOnlyAttr}>`
        }
        ${!isEditing && readOnlyMeta ? `<span class="asset-settings-read-meta">${escapeChartText(readOnlyMeta)}</span>` : ""}
      </div>

      <div class="asset-settings-tile-grid">
        <label class="asset-settings-tile">
          <span class="asset-settings-tile-icon" aria-hidden="true">${icon("wallet")}</span>
          <span>보유 수량</span>
          <div class="asset-settings-tile-input">
            <input type="text" value="${item.quantity ? formatMarketNumber(item.quantity) : ""}" inputmode="decimal" autocomplete="off" placeholder="0" data-number-input data-asset-setting-field="quantity" data-asset-setting-id="${item.id}" ${readOnlyAttr}>
            <em>주</em>
          </div>
        </label>
        <div class="asset-settings-tile">
          <span class="asset-settings-tile-icon" aria-hidden="true">${icon("performance")}</span>
          <span class="asset-settings-tile-label">
            <b>평균단가</b>
            <button type="button" data-asset-current-price-fill="${item.id}" aria-label="현재가 다시 불러오기">현재가</button>
          </span>
          <div class="asset-settings-tile-input">
            <input type="text" value="${item.averagePrice ? formatMarketNumber(item.averagePrice) : ""}" inputmode="decimal" autocomplete="off" placeholder="0" data-number-input data-asset-setting-field="averagePrice" data-asset-setting-id="${item.id}" ${readOnlyAttr}>
            <em>원</em>
          </div>
        </div>
      </div>

      <div class="asset-settings-value-panel">
        <span class="asset-settings-value-icon" aria-hidden="true">${icon("chart")}</span>
        <div>
          <span>평가금액</span>
          <strong>${formatMarketNumber(amount)}<small>원</small></strong>
          <em>보유 수량 기준</em>
        </div>
      </div>
      <div class="asset-settings-card-actions ${isEditing ? "" : "is-placeholder"}" ${isEditing ? "" : `aria-hidden="true"`}>
        <button class="btn" type="button" data-asset-settings-cancel>취소</button>
        <button class="btn primary" type="button" data-asset-settings-apply>저장</button>
      </div>
      ${isEditing ? `<p class="asset-settings-feedback error">${assetSettingsError}</p>` : ""}
    </article>
  `;
}

function getAssetSettingsVisibleDotCount(total) {
  return Math.min(Math.max(total, 0), assetSettingsVisibleDotLimit);
}

function getAssetSettingsDotStep() {
  return assetSettingsDotSize + assetSettingsDotGap;
}

function getAssetSettingsDotTrackWidth(visibleCount) {
  if (!visibleCount) return 0;
  return assetSettingsDotActiveWidth + Math.max(visibleCount - 1, 0) * getAssetSettingsDotStep();
}

function getAssetSettingsDotFullTrackWidth(total) {
  if (!total) return 0;
  return assetSettingsDotActiveWidth + Math.max(total - 1, 0) * getAssetSettingsDotStep();
}

function getAssetSettingsDotTrackX(total, activeIndex) {
  const visibleCount = getAssetSettingsVisibleDotCount(total);
  if (total <= visibleCount || total <= 1) return 0;

  const safeIndex = Math.min(Math.max(activeIndex, 0), total - 1);
  const windowWidth = getAssetSettingsDotTrackWidth(visibleCount);
  const fullWidth = getAssetSettingsDotFullTrackWidth(total);
  const activeCenter = safeIndex * getAssetSettingsDotStep() + assetSettingsDotActiveWidth / 2;
  const maxTrackX = Math.max(0, fullWidth - windowWidth);
  return Math.min(Math.max(activeCenter - windowWidth / 2, 0), maxTrackX);
}

function getAssetSettingsScrollIndex(cards, slideCards) {
  if (slideCards.length <= 1) return 0;

  const cardsRect = cards.getBoundingClientRect();
  const viewportCenter = cards.scrollLeft + cardsRect.width / 2;
  const centers = slideCards.map((card) => {
    const rect = card.getBoundingClientRect();
    return cards.scrollLeft + rect.left - cardsRect.left + rect.width / 2;
  });

  if (viewportCenter <= centers[0]) return 0;

  const lastIndex = centers.length - 1;
  if (viewportCenter >= centers[lastIndex]) return lastIndex;

  for (let index = 0; index < lastIndex; index += 1) {
    const start = centers[index];
    const end = centers[index + 1];
    if (viewportCenter >= start && viewportCenter <= end) {
      const distance = Math.max(end - start, 1);
      return index + (viewportCenter - start) / distance;
    }
  }

  return 0;
}

function updateAssetSettingsDotElement(dots, total, activeIndex) {
  const visibleCount = getAssetSettingsVisibleDotCount(total);
  const safeActiveIndex = Math.min(Math.max(Math.round(activeIndex), 0), Math.max(total - 1, 0));
  const trackX = getAssetSettingsDotTrackX(total, safeActiveIndex);
  const maxTrackX = Math.max(0, getAssetSettingsDotFullTrackWidth(total) - getAssetSettingsDotTrackWidth(visibleCount));

  dots.style.setProperty("--asset-settings-dot-track-width", `${getAssetSettingsDotTrackWidth(visibleCount)}px`);
  dots.style.setProperty("--asset-settings-dot-full-width", `${getAssetSettingsDotFullTrackWidth(total)}px`);
  dots.style.setProperty("--asset-settings-dot-track-x", `${(-trackX).toFixed(2)}px`);
  dots.classList.toggle("has-left-overflow", total > visibleCount && trackX > 0.4);
  dots.classList.toggle("has-right-overflow", total > visibleCount && trackX < maxTrackX - 0.4);
  dots.querySelectorAll(".asset-settings-dot-track span").forEach((dot, index) => {
    dot.classList.toggle("active", index === safeActiveIndex);
  });
}

function renderAssetSettingsSlideDots(total, activeIndex) {
  const safeTotal = Math.max(0, total);
  if (safeTotal <= 1) {
    return "";
  }

  const safeActiveIndex = Math.min(Math.max(activeIndex, 0), safeTotal - 1);
  const visibleCount = getAssetSettingsVisibleDotCount(safeTotal);
  const classes = [
    "asset-settings-slide-dots",
    safeTotal > visibleCount && safeActiveIndex > 0 ? "has-left-overflow" : "",
    safeTotal > visibleCount && safeActiveIndex < safeTotal - 1 ? "has-right-overflow" : ""
  ].filter(Boolean).join(" ");
  const trackWidth = getAssetSettingsDotTrackWidth(visibleCount);
  const fullTrackWidth = getAssetSettingsDotFullTrackWidth(safeTotal);
  const trackX = getAssetSettingsDotTrackX(safeTotal, safeActiveIndex);

  return `
    <div class="${classes}" style="--asset-settings-dot-track-width: ${trackWidth}px; --asset-settings-dot-full-width: ${fullTrackWidth}px; --asset-settings-dot-track-x: ${(-trackX).toFixed(2)}px;" aria-hidden="true">
      <div class="asset-settings-dot-window">
        <div class="asset-settings-dot-track">
          ${Array.from({ length: safeTotal }, (_, index) => `<span class="${index === safeActiveIndex ? "active" : ""}"></span>`).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderAssetSettingsEmptyState() {
  return `
    <button class="asset-settings-empty-state" type="button" data-asset-settings-add aria-label="자산 추가">
      <span>${icon("plus")}</span>
      <strong>자산 추가</strong>
      <em>새 보유 자산을 추가합니다.</em>
    </button>
  `;
}

function renderAssetSettingsModalCardView() {
  const drafts = assetSettingsDrafts;
  const canAdd = true;
  const activeDotIndex = Math.min(Math.max(assetSettingsActiveIndex, 0), Math.max(drafts.length - 1, 0));
  const hasMultipleCards = drafts.length > 1;
  const cardsClass = `asset-settings-cards${drafts.length ? "" : " is-empty"}${drafts.length === 1 ? " is-single" : ""}`;
  const motionAttr = assetSettingsMotion ? ` data-motion="${assetSettingsMotion.type}"` : "";
  const tabs = [
    ["모든 자산", drafts.length, true, ""],
    ["국내 주식", "", false, ""],
    ["최근 수정", "", false, ""],
    ["즐겨찾기", "", false, "asset-settings-tab-favorite"]
  ];

  return `
    <div class="modal-backdrop asset-settings-backdrop">
      <section class="modal-panel asset-settings-modal" role="dialog" aria-modal="true" aria-labelledby="assetSettingsModalTitle">
        <div class="modal-header asset-settings-header">
          <button class="asset-settings-nav-button asset-settings-back" type="button" data-modal-close aria-label="뒤로">${icon("chevronLeft")}</button>
          <div class="asset-settings-heading">
            <p class="eyebrow">Asset Settings</p>
            <h2 class="modal-title" id="assetSettingsModalTitle">자산 설정</h2>
          </div>
          <div class="asset-settings-header-actions">
            <button class="btn ghost asset-settings-header-add" type="button" data-asset-settings-add ${canAdd ? "" : "disabled"}>${icon("plus")}자산 추가</button>
            <button class="asset-settings-nav-button" type="button" data-modal-close aria-label="닫기">X</button>
          </div>
          ${
            assetSettingsError || assetSettingsMessage
              ? `<p class="asset-settings-sync-status ${assetSettingsError ? "error" : ""}">${escapeChartText(assetSettingsError || assetSettingsMessage)}</p>`
              : ""
          }
        </div>

        <div class="modal-body asset-settings-body">
          <div class="asset-settings-hero-row">
            <div class="asset-settings-hero-copy">
              <h3><span>보유 자산.</span> <b class="asset-settings-desktop-copy">필요한 정보만 한눈에.</b><b class="asset-settings-mobile-copy">한눈에 확인하세요.</b></h3>
              <p>큰 그래픽을 덜어내고 평가금액과 핵심 입력값 중심으로 재구성했습니다.</p>
            </div>
            <div class="asset-settings-tabs" role="tablist" aria-label="자산 설정 보기">
              ${tabs.map(([label, count, active, className]) => `
                <button class="${active ? "active" : ""} ${className}" type="button" role="tab" aria-selected="${active}">
                  ${label}${count !== "" ? `<span>${count}</span>` : ""}
                </button>
              `).join("")}
            </div>
          </div>

          <div class="${cardsClass}" aria-label="자산 설정 카드 목록"${motionAttr}>
            ${drafts.length ? drafts.map((item, index) => renderAssetSettingsCardView(item, index)).join("") : renderAssetSettingsEmptyState()}
          </div>
          ${
            hasMultipleCards
              ? `<button class="asset-settings-slide-nav prev" type="button" data-asset-settings-slide="prev" aria-label="이전 자산" ${activeDotIndex <= 0 ? "disabled" : ""}>${icon("chevronLeft")}</button>
                <button class="asset-settings-slide-nav next" type="button" data-asset-settings-slide="next" aria-label="다음 자산" ${activeDotIndex >= drafts.length - 1 ? "disabled" : ""}>${icon("chevronRight")}</button>`
              : ""
          }
          ${hasMultipleCards ? renderAssetSettingsSlideDots(drafts.length, activeDotIndex) : ""}
        </div>
      </section>
    </div>
  `;
}

function getAssetSettingsSlideCards(cards) {
  return Array.from(cards?.querySelectorAll(".asset-settings-display-card") || []);
}

function getAssetSettingsCardLayoutLeft(cards, card) {
  if (card.offsetParent === cards) return card.offsetLeft;
  if (card.offsetParent && card.offsetParent === cards.offsetParent) {
    return card.offsetLeft - cards.offsetLeft;
  }

  const cardsRect = cards.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  return cards.scrollLeft + cardRect.left - cardsRect.left;
}

function centerAssetSettingsCard(cards, card, behavior = "auto") {
  if (!cards || !card) return;
  const cardLeft = getAssetSettingsCardLayoutLeft(cards, card);
  const targetLeft = cardLeft - (cards.clientWidth - card.offsetWidth) / 2;
  const maxLeft = Math.max(0, cards.scrollWidth - cards.clientWidth);
  cards.scrollTo({
    left: Math.min(Math.max(targetLeft, 0), maxLeft),
    behavior: shouldReduceMotion() ? "auto" : behavior
  });
}

function updateAssetSettingsSlideNavButtons(cards, activeIndex = assetSettingsActiveIndex) {
  const slideCards = getAssetSettingsSlideCards(cards);
  const total = slideCards.length;
  document.querySelectorAll("[data-asset-settings-slide]").forEach((button) => {
    const direction = button.dataset.assetSettingsSlide;
    const disabled = total <= 1 ||
      (direction === "prev" && activeIndex <= 0.2) ||
      (direction === "next" && activeIndex >= total - 1.2);
    button.disabled = disabled;
    button.setAttribute("aria-disabled", disabled ? "true" : "false");
  });
}

function updateAssetSettingsSlideDots(cards) {
  const slideCards = getAssetSettingsSlideCards(cards);
  if (!slideCards.length) {
    assetSettingsActiveIndex = 0;
    updateAssetSettingsSlideNavButtons(cards, 0);
    return;
  }
  const scrollIndex = getAssetSettingsScrollIndex(cards, slideCards);
  assetSettingsActiveIndex = Math.min(Math.max(Math.round(scrollIndex), 0), slideCards.length - 1);
  const dots = document.querySelector(".asset-settings-slide-dots");
  if (dots) updateAssetSettingsDotElement(dots, slideCards.length, scrollIndex);
  updateAssetSettingsSlideNavButtons(cards, scrollIndex);
}

function syncAssetSettingsActiveIndexFromDom() {
  const cards = document.querySelector(".asset-settings-cards");
  if (!cards) return;
  updateAssetSettingsSlideDots(cards);
}

function hydrateAssetSettingsSlider() {
  const cards = document.querySelector(".asset-settings-cards");
  if (!cards) return;
  const slideCards = getAssetSettingsSlideCards(cards);
  if (!slideCards.length) return;
  assetSettingsActiveIndex = Math.min(Math.max(assetSettingsActiveIndex, 0), slideCards.length - 1);
  centerAssetSettingsCard(cards, slideCards[assetSettingsActiveIndex], "auto");
  window.requestAnimationFrame(() => {
    updateAssetSettingsSlideDots(cards);
    scheduleAssetSettingsMotionClear();
  });
  cards.addEventListener("scroll", () => {
    if (assetSettingsSlideFrame) window.cancelAnimationFrame(assetSettingsSlideFrame);
    assetSettingsSlideFrame = window.requestAnimationFrame(() => {
      assetSettingsSlideFrame = null;
      updateAssetSettingsSlideDots(cards);
    });
  }, { passive: true });
}

function scrollAssetSettingsCards(direction) {
  const cards = document.querySelector(".asset-settings-cards");
  const slideCards = getAssetSettingsSlideCards(cards);
  if (!cards || slideCards.length <= 1) return;

  const currentIndex = Math.min(Math.max(Math.round(getAssetSettingsScrollIndex(cards, slideCards)), 0), slideCards.length - 1);
  const nextIndex = Math.min(Math.max(currentIndex + (direction === "prev" ? -1 : 1), 0), slideCards.length - 1);
  assetSettingsActiveIndex = nextIndex;
  centerAssetSettingsCard(cards, slideCards[nextIndex], "smooth");
  updateAssetSettingsSlideDots(cards);
}

function animateAssetSettingsRemoval(rowId) {
  if (assetSettingsPendingRemoveId) return;

  const card = document.querySelector(`[data-asset-setting-card="${rowId}"]`);
  const cards = card?.closest(".asset-settings-cards");

  if (!card || shouldReduceMotion()) {
    removeAssetSettingsDraft(rowId);
    renderModal();
    hydrateIcons(document);
    return;
  }

  assetSettingsPendingRemoveId = rowId;
  cards?.setAttribute("data-motion", "remove");
  card.classList.add("is-removing");
  cards?.querySelectorAll(".asset-settings-display-card:not(.is-removing)").forEach((item) => {
    item.classList.add("is-remove-neighbor");
  });

  window.setTimeout(() => {
    if (assetSettingsPendingRemoveId !== rowId) return;
    assetSettingsPendingRemoveId = null;
    removeAssetSettingsDraft(rowId);
    renderModal();
    hydrateIcons(document);
  }, 320);
}

function renderAssetCashModal() {
  const isWithdraw = assetCashMode === "withdraw";
  const actionLabel = isWithdraw ? "출금" : "입금";

  return `
    <div class="modal-backdrop">
      <section class="modal-panel asset-cash-modal" role="dialog" aria-modal="true" aria-labelledby="assetCashModalTitle">
        <div class="modal-header">
          <div>
            <p class="eyebrow">Cash Balance</p>
            <h2 class="modal-title" id="assetCashModalTitle">현금 입/출금</h2>
          </div>
          <button class="icon-button" type="button" data-modal-close aria-label="닫기">X</button>
        </div>
        <div class="modal-body">
          <div class="asset-cash-card">
            <span>${icon("wallet")}</span>
            <div>
              <p>현재 현금 자산</p>
              <strong>${formatKRW(assetCashBalance)}</strong>
              <em>총자산 ${formatKRW(getAssetTotalValue())}</em>
            </div>
          </div>

          <div class="asset-cash-mode" role="tablist" aria-label="입출금 선택">
            <button class="${assetCashMode === "deposit" ? "active" : ""}" type="button" data-asset-cash-mode="deposit" aria-pressed="${assetCashMode === "deposit"}">입금</button>
            <button class="${assetCashMode === "withdraw" ? "active" : ""}" type="button" data-asset-cash-mode="withdraw" aria-pressed="${assetCashMode === "withdraw"}">출금</button>
          </div>

          <div class="asset-cash-form" data-asset-cash-form data-mode="${assetCashMode}">
            <label for="assetCashAmount">${actionLabel}액</label>
            <div class="journal-input-shell">
              <input id="assetCashAmount" type="text" value="${assetCashDraftAmount}" ${isWithdraw ? `data-max="${assetCashBalance}"` : ""} inputmode="numeric" autocomplete="off" placeholder="${actionLabel}액을 입력하세요" data-number-input data-asset-cash-amount>
              ${isWithdraw ? `<button class="field-chip-button" type="button" data-asset-cash-max>전액</button>` : ""}
              <span>원</span>
            </div>
            <p class="asset-cash-help">${isWithdraw ? `출금 가능 금액은 ${formatKRW(assetCashBalance)}입니다.` : "입금액은 현금 자산에 더해집니다."}</p>
            <p class="asset-cash-feedback error" data-asset-cash-live-error>${assetCashError}</p>
            <p class="asset-cash-feedback success">${assetCashMessage}</p>
            <div class="asset-cash-actions">
              <button class="btn" type="button" data-modal-close>취소</button>
              <button class="btn primary" type="button" data-asset-cash-submit>${actionLabel}하기</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderAssetCashConfirmModal() {
  const isWithdraw = assetCashPendingMode === "withdraw";
  const actionLabel = isWithdraw ? "출금" : "입금";
  const modeClass = isWithdraw ? "withdraw" : "deposit";
  const question = `<strong>${formatKRW(assetCashPendingAmount)}</strong>을 <span>${actionLabel}</span>하시겠습니까?`;
  const nextCashBalance = isWithdraw ? assetCashBalance - assetCashPendingAmount : assetCashBalance + assetCashPendingAmount;

  return `
    <div class="modal-backdrop">
      <section class="modal-panel asset-cash-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="assetCashConfirmTitle">
        <div class="modal-header">
          <div>
            <p class="eyebrow">${isWithdraw ? "Withdraw" : "Deposit"}</p>
            <h2 class="modal-title" id="assetCashConfirmTitle">${actionLabel} 확인</h2>
          </div>
          <button class="icon-button" type="button" data-modal-close aria-label="닫기">X</button>
        </div>
        <div class="modal-body">
          <div class="asset-cash-confirm-card ${modeClass}">
            <span>${icon(isWithdraw ? "minus" : "plus")}</span>
            <div>
              <p>${actionLabel}금액</p>
              <strong>${formatKRW(assetCashPendingAmount)}</strong>
              <em>처리 후 현금 자산 ${formatKRW(nextCashBalance)}</em>
            </div>
          </div>
          <p class="asset-cash-confirm-question ${modeClass}">${question}</p>
          <div class="asset-cash-actions">
            <button class="btn" type="button" data-asset-cash-confirm-cancel>취소</button>
            <button class="btn primary" type="button" data-asset-cash-confirm>${actionLabel}하기</button>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderJournalDateRangeModal() {
  const range = getJournalDateRangeDraft();
  const isCustomRange = journalDateRangePresetDraft === "custom";

  return `
    <div class="modal-backdrop">
      <section class="modal-panel journal-date-modal" role="dialog" aria-modal="true" aria-labelledby="journalDateModalTitle">
        <div class="modal-header">
          <div>
            <p class="eyebrow">Date Range</p>
            <h2 class="modal-title" id="journalDateModalTitle">기간 선택</h2>
          </div>
          <button class="icon-button" type="button" data-modal-close aria-label="닫기">X</button>
        </div>
        <div class="modal-body">
          <div class="journal-date-presets" role="tablist" aria-label="기간 빠른 선택">
            ${journalDatePresets
              .map(([value, label]) => `
                <button class="${journalDateRangePresetDraft === value ? "active" : ""}" type="button" data-journal-date-preset="${value}" aria-pressed="${journalDateRangePresetDraft === value}">${label}</button>
              `)
              .join("")}
          </div>
          ${
            isCustomRange
              ? `<div class="journal-date-range-picker">
                  <label class="journal-date-field">
                    <span>${icon("calendar")}시작일</span>
                    <input type="date" value="${range.start}" data-journal-date-input="start">
                  </label>
                  <label class="journal-date-field">
                    <span>${icon("calendar")}종료일</span>
                    <input type="date" value="${range.end}" data-journal-date-input="end">
                  </label>
                </div>`
              : ""
          }
          <div class="journal-date-actions">
            <button class="btn" type="button" data-modal-close>취소</button>
            <button class="btn primary" type="button" data-journal-date-apply>적용</button>
          </div>
        </div>
      </section>
    </div>
  `;
}

function cancelActiveModalDraft(modalName = activeModal) {
  if (modalName === "journalWrite" && typeof clearJournalWriteInitialDate === "function") {
    clearJournalWriteInitialDate();
    setJournalEditingRecord("");
    journalWriteReturnToCalendarDay = false;
  }
  if (modalName === "journalDateRange") cancelJournalDateRangeEdit();
  if (modalName === "journalStockFilter") cancelJournalStockFilterEdit();
  if (modalName === "journalTradeTypeFilter") cancelJournalTradeTypeFilterEdit();
  if (modalName === "assetTrendTargets") cancelAssetTrendTargetEdit();
  if (modalName === "assetSettings") cancelAssetSettingsEdit();
  if (modalName === "assetSettingsDeleteConfirm") cancelAssetSettingsDelete();
}

function getRoute() {
  const route = window.location.hash.replace("#", "");
  if (route.includes("access_token=") || route.includes("error=")) return "login";
  if (!route) return "landing";
  return renderers[route] ? route : "dashboard";
}

function renderModal() {
  const modalRoot = document.querySelector("#modalRoot");
  if (!modalRoot) return;

  if (!["journalWrite", "calendarDayDetail", "assetCash", "assetCashConfirm", "assetTrendTargets", "assetSettings", "assetSettingsDeleteConfirm", "journalDateRange", "journalStockFilter", "journalTradeTypeFilter"].includes(activeModal)) {
    modalRoot.innerHTML = "";
    if (document.body) document.body.classList.remove("modal-open");
    return;
  }

  if (document.body) document.body.classList.add("modal-open");
  if (activeModal === "journalDateRange") {
    modalRoot.innerHTML = renderJournalDateRangeModal();
    return;
  }

  if (activeModal === "journalStockFilter") {
    modalRoot.innerHTML = renderJournalStockFilterModal();
    return;
  }

  if (activeModal === "journalTradeTypeFilter") {
    modalRoot.innerHTML = renderJournalTradeTypeFilterModal();
    return;
  }

  if (activeModal === "calendarDayDetail" && typeof renderCalendarDayDetailModal === "function") {
    modalRoot.innerHTML = renderCalendarDayDetailModal();
    return;
  }

  if (activeModal === "assetCash") {
    modalRoot.innerHTML = renderAssetCashModal();
    return;
  }

  if (activeModal === "assetCashConfirm") {
    modalRoot.innerHTML = renderAssetCashConfirmModal();
    return;
  }

  if (activeModal === "assetTrendTargets") {
    modalRoot.innerHTML = renderAssetTrendTargetsModal();
    return;
  }

  if (activeModal === "assetSettings") {
    modalRoot.innerHTML = renderAssetSettingsModalCardView();
    hydrateAssetSettingsSlider();
    return;
  }

  if (activeModal === "assetSettingsDeleteConfirm") {
    modalRoot.innerHTML = renderAssetSettingsDeleteConfirmModal();
    return;
  }

  modalRoot.innerHTML = `
    <div class="modal-backdrop">
      <section class="modal-panel journal-write-modal" role="dialog" aria-modal="true" aria-labelledby="journalWriteModalTitle">
        <div class="modal-header">
          <div>
            <p class="eyebrow">New Record</p>
            <h2 class="modal-title" id="journalWriteModalTitle">매매 일지 작성</h2>
          </div>
          <button class="icon-button" type="button" data-modal-close aria-label="닫기">X</button>
        </div>
        <div class="modal-body">
          ${renderJournalWrite({ showTitle: false })}
        </div>
      </section>
    </div>
  `;
  const journalForm = modalRoot.querySelector("[data-journal-entry-form]");
  if (journalForm && typeof syncJournalTradeMode === "function") syncJournalTradeMode(journalForm);
}

function renderMobileSheetLegacy() {
  const sheetRoot = document.querySelector("#mobileSheetRoot");
  if (!sheetRoot) return;

  if (!mobileSheetOpen) {
    sheetRoot.innerHTML = "";
    unlockMobileSheetPageScroll();
    if (!activeModal && document.body) document.body.classList.remove("modal-open");
    return;
  }

  if (document.body) document.body.classList.add("modal-open");
  lockMobileSheetPageScroll();
  const quickItems = [
    ["dashboard", "home", "대시보드"],
    ["calendar", "calendar", "캘린더"],
    ["stock", "chart", "종목 분석"],
    ["assets", "wallet", "자산 현황"],
    ["memo", "memo", "메모"],
    ["journal", "journal", "매매일지"],
    ["performance", "performance", "리포트"],
    ["settings", "settings", "설정"]
  ];

  sheetRoot.innerHTML = `
    <div class="mobile-sheet-backdrop" data-mobile-sheet-close>
      <section class="mobile-more-sheet" role="dialog" aria-modal="true" aria-label="더보기 메뉴">
        <div class="mobile-profile-row">
          ${renderUserAvatar(getCurrentUser(), "mobile-profile-avatar")}
          <div>
            <strong>${escapeHtml(getUserDisplayName())}</strong>
            <p>${escapeHtml(getUserEmail())}</p>
          </div>
          <button class="mobile-profile-logout" type="button" data-auth-logout>로그아웃</button>
        </div>
        <div class="mobile-more-grid">
          ${quickItems.map(([route, iconName, label]) => `
            <button type="button" data-route="${route}">
              <span>${icon(iconName)}</span>
              <strong>${label}</strong>
            </button>
          `).join("")}
        </div>
      </section>
    </div>
  `;
}

const mobileMoreIconBase = "src/resources/assets/icon_assets/svg/default";

function mobileMoreIcon(slug, className = "") {
  return `<img class="${className}" src="${mobileMoreIconBase}/${slug}.svg" alt="" aria-hidden="true" loading="lazy">`;
}

function clearMobileSheetDragState() {
  if (mobileSheetDragState?.sheet) {
    mobileSheetDragState.sheet.classList.remove("is-dragging", "is-dismissing");
    mobileSheetDragState.sheet.style.transform = "";
  }
  mobileSheetDragState = null;
}

function lockMobileSheetPageScroll() {
  if (mobileSheetScrollLocked || !document.body) return;

  const body = document.body;
  mobileSheetScrollLockY = window.scrollY || document.documentElement.scrollTop || 0;
  mobileSheetScrollLockStyles = {
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width
  };
  body.style.position = "fixed";
  body.style.top = `-${mobileSheetScrollLockY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.classList.add("mobile-sheet-scroll-locked");
  document.documentElement.classList.add("mobile-sheet-scroll-locked");
  mobileSheetScrollLocked = true;
}

function unlockMobileSheetPageScroll() {
  if (!mobileSheetScrollLocked || !document.body) return;

  const body = document.body;
  const restoreY = mobileSheetScrollLockY;
  const styles = mobileSheetScrollLockStyles || {};
  body.style.position = styles.position || "";
  body.style.top = styles.top || "";
  body.style.left = styles.left || "";
  body.style.right = styles.right || "";
  body.style.width = styles.width || "";
  body.classList.remove("mobile-sheet-scroll-locked");
  document.documentElement.classList.remove("mobile-sheet-scroll-locked");
  mobileSheetScrollLockY = 0;
  mobileSheetScrollLockStyles = null;
  mobileSheetScrollLocked = false;
  window.scrollTo(0, restoreY);
}

function preventMobileSheetBackdropScroll(event) {
  if (!mobileSheetOpen) return;
  if (event.target?.closest?.(".mobile-more-sheet")) return;
  event.preventDefault();
}

function beginMobileSheetDrag(event) {
  const handle = event.target.closest("[data-mobile-sheet-drag]");
  if (!handle || !mobileSheetOpen) return false;

  const sheet = handle.closest(".mobile-more-sheet");
  if (!sheet) return false;

  mobileSheetDragState = {
    pointerId: event.pointerId,
    startY: event.clientY,
    deltaY: 0,
    sheet,
    handle
  };
  sheet.classList.add("is-dragging");
  handle.setPointerCapture?.(event.pointerId);
  event.preventDefault();
  return true;
}

function moveMobileSheetDrag(event) {
  if (!mobileSheetDragState || event.pointerId !== mobileSheetDragState.pointerId) return false;

  const deltaY = Math.max(0, event.clientY - mobileSheetDragState.startY);
  mobileSheetDragState.deltaY = deltaY;
  mobileSheetDragState.sheet.style.transform = `translateY(${deltaY}px)`;
  event.preventDefault();
  return true;
}

function endMobileSheetDrag(event) {
  if (!mobileSheetDragState || event.pointerId !== mobileSheetDragState.pointerId) return false;

  const { deltaY, sheet, handle } = mobileSheetDragState;
  handle?.releasePointerCapture?.(event.pointerId);
  sheet.classList.remove("is-dragging");

  if (deltaY >= 84) {
    sheet.classList.add("is-dismissing");
    sheet.style.transform = "translateY(100%)";
    window.setTimeout(() => {
      mobileSheetOpen = false;
      clearMobileSheetDragState();
      renderMobileSheet();
    }, 190);
  } else {
    sheet.style.transform = "";
    mobileSheetDragState = null;
  }

  event.preventDefault();
  return true;
}

function renderMobileSheet() {
  const sheetRoot = document.querySelector("#mobileSheetRoot");
  if (!sheetRoot) return;

  if (!mobileSheetOpen) {
    clearMobileSheetDragState();
    sheetRoot.innerHTML = "";
    unlockMobileSheetPageScroll();
    if (!activeModal && document.body) document.body.classList.remove("modal-open");
    return;
  }

  if (document.body) document.body.classList.add("modal-open");
  lockMobileSheetPageScroll();

  const quickItems = [
    ["dashboard", "dashboard_home", "대시보드"],
    ["calendar", "calendar", "캘린더"],
    ["stock", "stock_analysis", "종목 분석"],
    ["assets", "asset_status", "자산 현황"],
    ["memo", "memo", "메모"],
    ["journal", "trading_journal", "매매일지"],
    ["performance", "report_chart", "리포트"],
    ["settings", "settings", "설정"]
  ];

  sheetRoot.innerHTML = `
    <div class="mobile-sheet-backdrop" data-mobile-sheet-close>
      <section class="mobile-more-sheet" role="dialog" aria-modal="true" aria-label="더보기 메뉴">
        <span class="mobile-sheet-handle" data-mobile-sheet-drag aria-hidden="true">${mobileMoreIcon("drag_handle")}</span>
        <div class="mobile-profile-row">
          ${renderUserAvatar(getCurrentUser(), "mobile-profile-avatar")}
          <div>
            <strong>${escapeHtml(getUserDisplayName())}</strong>
            <p>${escapeHtml(getUserEmail())}</p>
          </div>
          <button class="mobile-profile-logout" type="button" data-auth-logout>로그아웃</button>
        </div>
        <div class="mobile-more-grid">
          ${quickItems.map(([route, iconSlug, label]) => `
            <button type="button" data-route="${route}">
              <span>${mobileMoreIcon(iconSlug)}</span>
              <strong>${label}</strong>
            </button>
          `).join("")}
        </div>
      </section>
    </div>
  `;
}

function render() {
  const route = getRoute();
  const meta = pageMeta[route] || { title: "Trading Note", description: "" };

  if (isAuthRequiredRoute(route) && !authState.checked) {
    document.body.dataset.route = route;
    document.querySelector("#pageTitle").textContent = meta.title;
    document.querySelector("#pageDescription").textContent = meta.description;
    document.querySelector("#pageEyebrow").textContent = "Trading Journal";
    renderNav(route);
    renderSidebarUser();
    renderPageActions(route);
    document.querySelector("#app").innerHTML = renderAuthGate();
    renderModal();
    renderMobileSheet();
    hydrateIcons(document);
    checkAuthSession().then(() => {
      if (isAuthRequiredRoute(getRoute())) render();
    });
    return;
  }

  if (isAuthRequiredRoute(route) && !authState.authenticated) {
    window.location.hash = "login";
    return;
  }

  if (route === "login" && authState.authenticated) {
    window.location.hash = "dashboard";
    return;
  }

  const currentUserId = getCurrentUserStorageId();
  if (
    isAuthRequiredRoute(route) &&
    authState.authenticated &&
    currentUserId &&
    userDataInitializedFor === currentUserId &&
    userDataServerLoadingFor === currentUserId &&
    userDataServerLoadedFor !== currentUserId
  ) {
    document.body.dataset.route = route;
    document.querySelector("#pageTitle").textContent = meta.title;
    document.querySelector("#pageDescription").textContent = meta.description;
    document.querySelector("#pageEyebrow").textContent = route === "journalWrite" ? "New Record" : "Trading Journal";
    renderNav(route);
    renderSidebarUser();
    renderPageActions(route);
    document.querySelector("#app").innerHTML = renderAuthGate("저장된 자산 데이터를 불러오고 있습니다.");
    renderModal();
    renderMobileSheet();
    hydrateIcons(document);
    return;
  }

  if (
    isAuthRequiredRoute(route) &&
    authState.authenticated &&
    currentUserId &&
    userDataInitializedFor === currentUserId &&
    userDataServerLoadedFor !== currentUserId &&
    userDataServerLoadError
  ) {
    document.body.dataset.route = route;
    document.querySelector("#pageTitle").textContent = meta.title;
    document.querySelector("#pageDescription").textContent = meta.description;
    document.querySelector("#pageEyebrow").textContent = route === "journalWrite" ? "New Record" : "Trading Journal";
    renderNav(route);
    renderSidebarUser();
    renderPageActions(route);
    document.querySelector("#app").innerHTML = renderUserDataLoadError();
    renderModal();
    renderMobileSheet();
    hydrateIcons(document);
    return;
  }

  document.body.dataset.route = route;
  document.querySelector("#pageTitle").textContent = meta.title;
  document.querySelector("#pageDescription").textContent = meta.description;
  document.querySelector("#pageEyebrow").textContent = route === "journalWrite" ? "New Record" : "Trading Journal";
  renderNav(route);
  renderSidebarUser();
  renderPageActions(route);
  document.querySelector("#app").innerHTML = renderers[route]();
  renderModal();
  renderMobileSheet();
  hydrateIcons(document);
  if (route === "landing" && typeof setupLandingReveal === "function") {
    setupLandingReveal();
  }
  if (route === "login" && typeof hydrateLoginPage === "function") {
    hydrateLoginPage();
    if (!authState.checked) {
      checkAuthSession().then(() => {
        if (authState.authenticated && getRoute() === "login") render();
      });
    }
  }
  if (route === "dashboard") {
    syncDashboardAssetTrendSnapshot();
  }
  if (route === "stock") {
    ensureStockChartForSelection();
    ensureStockNewsForSelection();
    ensureStockFundamentalsForSelection();
    const refreshKey = getStockItemKey(getStockAnalysisSelectedStock());
    if (refreshKey && stockAnalysisAutoRefreshKey !== refreshKey) {
      stockAnalysisAutoRefreshKey = refreshKey;
      window.setTimeout(() => {
        if (getRoute() === "stock") refreshCurrentStockAnalysisPrices();
      }, 0);
    }
  }
  animateNumericValues(document.querySelector("#app"));
  scheduleFitValueText();
}

function handleJournalWriteExtraClick(event) {
  const pickerBackdrop = event.target.matches("[data-journal-write-stock-backdrop]");
  const pickerCancel = event.target.closest("[data-journal-write-stock-cancel]");
  if (pickerBackdrop || pickerCancel) {
    closeJournalWriteStockPicker(event.target.closest("[data-journal-entry-form]"));
    return true;
  }

  const journalStockSearchResult = event.target.closest("[data-journal-stock-search-result]");
  if (journalStockSearchResult) {
    applyJournalStockSearchResult(journalStockSearchResult);
    return true;
  }

  const stockOption = event.target.closest("[data-journal-write-stock-option]");
  if (stockOption) {
    selectJournalWriteStockDraft(stockOption);
    return true;
  }

  const stockApply = event.target.closest("[data-journal-write-stock-apply]");
  if (stockApply) {
    applyJournalWriteStockSelection(stockApply);
    return true;
  }

  const stockOpen = event.target.closest("[data-journal-write-stock-open]");
  if (stockOpen) {
    openJournalWriteStockPicker(stockOpen);
    return true;
  }

  const quantityPreset = event.target.closest("[data-journal-quantity-preset]");
  if (quantityPreset) {
    applyJournalQuantityPreset(quantityPreset);
    return true;
  }

  return false;
}

document.addEventListener("click", async (event) => {
  const logoutButton = event.target.closest("[data-auth-logout]");
  if (logoutButton) {
    logoutUser();
    return;
  }

  const sidebarUserToggle = event.target.closest("[data-sidebar-user-toggle]");
  if (sidebarUserToggle) {
    sidebarUserMenuOpen = !sidebarUserMenuOpen;
    renderSidebarUser();
    return;
  }

  if (sidebarUserMenuOpen && !event.target.closest("[data-sidebar-user-panel]")) {
    sidebarUserMenuOpen = false;
    renderSidebarUser();
  }

  const settingsSectionButton = event.target.closest("[data-settings-section]");
  if (settingsSectionButton && getRoute() === "settings") {
    settingsActiveSection = settingsSectionButton.dataset.settingsSection || "broker";
    render();
    return;
  }

  const settingsResetUserDataButton = event.target.closest("[data-settings-reset-user-data]");
  if (settingsResetUserDataButton && getRoute() === "settings") {
    if (databaseState.saving) return;
    if (!window.confirm("삭제하시겠습니까?")) return;
    await resetUserAssetAndJournalData();
    return;
  }

  const databaseSaveAssetsButton = event.target.closest("[data-database-save-assets]");
  if (databaseSaveAssetsButton) {
    saveDatabaseAssets({ manual: true });
    return;
  }

  const databaseRefreshButton = event.target.closest("[data-database-refresh]");
  if (databaseRefreshButton) {
    fetchDatabaseStatus({ rerender: true });
    return;
  }

  const userDataRetryButton = event.target.closest("[data-user-data-retry]");
  if (userDataRetryButton) {
    const userId = getCurrentUserStorageId();
    if (userId) {
      userDataServerLoadError = "";
      userDataServerLoadedFor = "";
      loadUserDataFromServer(userId);
      render();
    }
    return;
  }

  const calendarNavButton = event.target.closest("[data-calendar-nav]");
  if (calendarNavButton && getRoute() === "calendar" && typeof shiftCalendarMonth === "function") {
    shiftCalendarMonth(Number(calendarNavButton.dataset.calendarNav || 0));
    render();
    return;
  }

  const calendarTodayButton = event.target.closest("[data-calendar-today]");
  if (calendarTodayButton && getRoute() === "calendar" && typeof resetCalendarMonth === "function") {
    resetCalendarMonth();
    render();
    return;
  }

  const calendarDayButton = event.target.closest("[data-calendar-day]");
  if (calendarDayButton && getRoute() === "calendar") {
    const selectedDate = calendarDayButton.dataset.calendarDay || "";
    if (typeof setCalendarDayDetailDate === "function") {
      if (!setCalendarDayDetailDate(selectedDate)) return;
    } else if (typeof setCalendarSelectedDateValue === "function" && !setCalendarSelectedDateValue(selectedDate)) {
      return;
    }
    activeModal = "calendarDayDetail";
    render();
    return;
  }

  const stockSearchResult = event.target.closest("[data-stock-search-result]");
  if (stockSearchResult && getRoute() === "stock") {
    applyStockSearchResult(stockSearchResult.dataset.stockSearchResult);
    return;
  }

  const stockFavoriteToggle = event.target.closest("[data-stock-favorite-toggle]");
  if (stockFavoriteToggle && getRoute() === "stock") {
    toggleStockAnalysisFavorite();
    return;
  }

  const stockChartPeriodButton = event.target.closest("[data-stock-chart-period]");
  if (stockChartPeriodButton && getRoute() === "stock") {
    const nextPeriod = stockChartPeriodButton.dataset.stockChartPeriod;
    if (stockChartPeriodOptions.some((item) => item.key === nextPeriod)) {
      stockChartPeriod = nextPeriod;
      loadStockChartForSelection(getStockAnalysisSelectedStock(), { force: true }).catch((error) => {
        console.warn("Stock chart period could not be loaded.", error);
      });
    }
    return;
  }

  const stockFavoritesToggle = event.target.closest("[data-stock-favorites-toggle]");
  if (stockFavoritesToggle && getRoute() === "stock") {
    stockFavoritesOpen = !stockFavoritesOpen;
    stockSearchState = {
      query: "",
      loading: false,
      results: [],
      error: "",
      requestId: stockSearchState.requestId + 1
    };
    render();
    return;
  }

  const stockFavoriteSelect = event.target.closest("[data-stock-favorite-select]");
  if (stockFavoriteSelect && getRoute() === "stock") {
    const favorite = stockFavoriteItems[Number(stockFavoriteSelect.dataset.stockFavoriteSelect)];
    if (favorite) setStockAnalysisSelection(favorite, { refresh: true });
    return;
  }

  const modalButton = event.target.closest("[data-modal]");
  if (modalButton) {
    activeModal = modalButton.dataset.modal;
    if (activeModal === "journalWrite" && typeof clearJournalWriteInitialDate === "function") {
      setJournalEditingRecord("");
      clearJournalWriteInitialDate();
    }
    if (activeModal === "assetCash") {
      assetCashMode = "deposit";
      assetCashError = "";
      assetCashMessage = "";
      assetCashDraftAmount = "";
      assetCashPendingAmount = 0;
      assetCashPendingMode = "deposit";
    }
    if (activeModal === "journalDateRange") {
      beginJournalDateRangeEdit();
    }
    if (activeModal === "journalStockFilter") {
      beginJournalStockFilterEdit();
    }
    if (activeModal === "journalTradeTypeFilter") {
      beginJournalTradeTypeFilterEdit();
    }
    if (activeModal === "assetTrendTargets") {
      beginAssetTrendTargetEdit();
    }
    if (activeModal === "assetSettings") {
      beginAssetSettingsEdit();
    }
    renderModal();
    hydrateIcons(document);
    return;
  }

  const modalPanel = event.target.closest(".modal-panel");
  if (activeModal) {
    const datePickerButton = event.target.closest("[data-date-picker-trigger]");
    if (datePickerButton && modalPanel) {
      openLinkedDatePicker(datePickerButton);
      return;
    }

    if (handleJournalWriteExtraClick(event)) return;

    const calendarDayFilter = event.target.closest("[data-calendar-day-filter]");
    if (calendarDayFilter && activeModal === "calendarDayDetail") {
      const nextFilter = calendarDayFilter.dataset.calendarDayFilter || "all";
      if (typeof setCalendarDayDetailFilter === "function" && setCalendarDayDetailFilter(nextFilter)) {
        renderModal();
        hydrateIcons(document);
      }
      return;
    }

    const calendarWriteJournal = event.target.closest("[data-calendar-write-journal]");
    if (calendarWriteJournal && activeModal === "calendarDayDetail") {
      const selectedDate = calendarWriteJournal.dataset.calendarWriteJournal || "";
      setJournalEditingRecord("");
      journalWriteReturnToCalendarDay = true;
      if (typeof setJournalWriteInitialDate === "function") setJournalWriteInitialDate(selectedDate);
      activeModal = "journalWrite";
      renderModal();
      hydrateIcons(document);
      return;
    }

    const calendarEditJournal = event.target.closest("[data-calendar-edit-journal]");
    if (calendarEditJournal && activeModal === "calendarDayDetail") {
      journalWriteReturnToCalendarDay = true;
      openJournalRecordEditor(calendarEditJournal.dataset.calendarEditJournal);
      return;
    }

    const calendarDeleteJournal = event.target.closest("[data-calendar-delete-journal]");
    if (calendarDeleteJournal && activeModal === "calendarDayDetail") {
      if (window.confirm("이 매매일지를 삭제하시겠습니까?")) {
        await deleteJournalRecordById(calendarDeleteJournal.dataset.calendarDeleteJournal);
        activeModal = "calendarDayDetail";
        renderModal();
        hydrateIcons(document);
      }
      return;
    }

    const modalClose = event.target.closest("[data-modal-close]");
    if (modalClose && modalPanel) {
      cancelActiveModalDraft();
      setJournalEditingRecord("");
      journalWriteReturnToCalendarDay = false;
      activeModal = null;
      assetCashError = "";
      assetCashMessage = "";
      renderModal();
      return;
    }

    const journalStockOption = event.target.closest("[data-journal-stock-option]");
    if (journalStockOption && activeModal === "journalStockFilter") {
      setJournalStockFilterDraft(journalStockOption.dataset.journalStockOption);
      renderModal();
      hydrateIcons(document);
      return;
    }

    const journalTypeOption = event.target.closest("[data-journal-type-filter-option]");
    if (journalTypeOption && activeModal === "journalTradeTypeFilter") {
      setJournalTradeTypeFilterDraft(journalTypeOption.dataset.journalTypeFilterOption);
      renderModal();
      hydrateIcons(document);
      return;
    }

    const journalDatePreset = event.target.closest("[data-journal-date-preset]");
    if (journalDatePreset && activeModal === "journalDateRange") {
      setJournalDateRangePresetDraft(journalDatePreset.dataset.journalDatePreset);
      renderModal();
      hydrateIcons(document);
      return;
    }

    const journalDateApply = event.target.closest("[data-journal-date-apply]");
    if (journalDateApply && activeModal === "journalDateRange") {
      applyJournalDateRangeEdit();
      activeModal = null;
      render();
      return;
    }

    const journalStockApply = event.target.closest("[data-journal-stock-apply]");
    if (journalStockApply && activeModal === "journalStockFilter") {
      applyJournalStockFilterEdit();
      activeModal = null;
      render();
      return;
    }

    const journalTypeApply = event.target.closest("[data-journal-type-apply]");
    if (journalTypeApply && activeModal === "journalTradeTypeFilter") {
      applyJournalTradeTypeFilterEdit();
      activeModal = null;
      render();
      return;
    }

    const assetCashModeButton = event.target.closest("[data-asset-cash-mode]");
    if (assetCashModeButton && activeModal === "assetCash") {
      assetCashMode = assetCashModeButton.dataset.assetCashMode;
      assetCashError = "";
      assetCashMessage = "";
      assetCashDraftAmount = "";
      renderModal();
      hydrateIcons(document);
      return;
    }

    const assetCashMaxButton = event.target.closest("[data-asset-cash-max]");
    if (assetCashMaxButton && activeModal === "assetCash") {
      assetCashDraftAmount = formatMarketNumber(assetCashBalance);
      assetCashError = "";
      assetCashMessage = "";
      renderModal();
      const amountInput = document.querySelector("[data-asset-cash-amount]");
      if (amountInput) {
        amountInput.focus();
        amountInput.setSelectionRange(amountInput.value.length, amountInput.value.length);
      }
      return;
    }

    const assetCashSubmit = event.target.closest("[data-asset-cash-submit]");
    if (assetCashSubmit && activeModal === "assetCash") {
      const amountInput = document.querySelector("[data-asset-cash-amount]");
      const amount = parseKRWInput(amountInput ? amountInput.value : "");
      assetCashDraftAmount = amountInput ? amountInput.value : "";

      assetCashMessage = "";
      if (amount <= 0) {
        assetCashError = "금액을 1원 이상 입력하세요.";
        renderModal();
        return;
      }

      if (assetCashMode === "withdraw" && amount > assetCashBalance) {
        assetCashError = "현재 현금 자산보다 큰 금액은 출금할 수 없습니다.";
        renderModal();
        return;
      }

      assetCashPendingAmount = amount;
      assetCashPendingMode = assetCashMode;
      assetCashError = "";
      assetCashMessage = "";
      activeModal = "assetCashConfirm";
      renderModal();
      hydrateIcons(document);
      return;
    }

    const assetCashConfirmCancel = event.target.closest("[data-asset-cash-confirm-cancel]");
    if (assetCashConfirmCancel && activeModal === "assetCashConfirm") {
      activeModal = "assetCash";
      assetCashError = "";
      assetCashMessage = "";
      renderModal();
      hydrateIcons(document);
      return;
    }

    const assetCashConfirm = event.target.closest("[data-asset-cash-confirm]");
    if (assetCashConfirm && activeModal === "assetCashConfirm") {
      if (assetCashPendingAmount <= 0) {
        activeModal = "assetCash";
        assetCashError = "금액을 1원 이상 입력하세요.";
        renderModal();
        return;
      }

      if (assetCashPendingMode === "withdraw" && assetCashPendingAmount > assetCashBalance) {
        activeModal = "assetCash";
        assetCashError = "현재 현금 자산보다 큰 금액은 출금할 수 없습니다.";
        renderModal();
        return;
      }

      assetCashBalance = assetCashPendingMode === "withdraw" ? assetCashBalance - assetCashPendingAmount : assetCashBalance + assetCashPendingAmount;
      saveAssetStateToStorage({ source: "user_cash", immediate: true }).catch((error) => {
        console.warn("Cash balance could not be saved immediately.", error);
      });
      assetCashError = "";
      assetCashMessage = "";
      assetCashDraftAmount = "";
      assetCashPendingAmount = 0;
      assetCashPendingMode = "deposit";
      activeModal = null;
      render();
      return;
    }

    const assetSettingsDeleteCancel = event.target.closest("[data-asset-settings-delete-cancel]");
    if (assetSettingsDeleteCancel && activeModal === "assetSettingsDeleteConfirm") {
      cancelAssetSettingsDelete();
      renderModal();
      hydrateIcons(document);
      return;
    }

    const assetSettingsDeleteConfirm = event.target.closest("[data-asset-settings-delete-confirm]");
    if (assetSettingsDeleteConfirm && activeModal === "assetSettingsDeleteConfirm") {
      if (assetSettingsSaving) return;
      assetSettingsSaving = true;
      if (await confirmAssetSettingsDelete()) {
        assetSettingsSaving = false;
        render();
        return;
      }

      assetSettingsSaving = false;
      renderModal();
      hydrateIcons(document);
      return;
    }

    const assetTargetAdd = event.target.closest("[data-asset-target-add]");
    if (assetTargetAdd && activeModal === "assetTrendTargets") {
      addAssetTrendTargetDraft();
      renderModal();
      hydrateIcons(document);
      return;
    }

    const assetTargetRemove = event.target.closest("[data-asset-target-remove]");
    if (assetTargetRemove && activeModal === "assetTrendTargets") {
      removeAssetTrendTargetDraft(assetTargetRemove.dataset.assetTargetRemove);
      renderModal();
      hydrateIcons(document);
      return;
    }

    const assetTargetApply = event.target.closest("[data-asset-target-apply]");
    if (assetTargetApply && activeModal === "assetTrendTargets") {
      applyAssetTrendTargetEdit();
      activeModal = null;
      render();
      return;
    }

    const assetSettingsImport = event.target.closest("[data-asset-settings-import]");
    if (assetSettingsImport && activeModal === "assetSettings") {
      document.querySelector("[data-asset-settings-file]")?.click();
      return;
    }

    const assetSettingsExport = event.target.closest("[data-asset-settings-export]");
    if (assetSettingsExport && activeModal === "assetSettings") {
      exportAssetSettingsFile()
        .then((exportedType) => {
          assetSettingsError = "";
          assetSettingsMessage = exportedType === "xlsx"
            ? "현재 자산 데이터를 엑셀 파일로 내보냈습니다."
            : "현재 자산 데이터를 엑셀에서 열 수 있는 CSV 파일로 내보냈습니다.";
          renderModal();
          hydrateIcons(document);
        })
        .catch((error) => {
          assetSettingsError = error?.message || "자산 데이터를 내보내지 못했습니다.";
          assetSettingsMessage = "";
          renderModal();
          hydrateIcons(document);
        });
      return;
    }

    const assetSettingsSlide = event.target.closest("[data-asset-settings-slide]");
    if (assetSettingsSlide && activeModal === "assetSettings") {
      scrollAssetSettingsCards(assetSettingsSlide.dataset.assetSettingsSlide);
      return;
    }

    const assetMarketResult = event.target.closest("[data-asset-market-result]");
    if (assetMarketResult && activeModal === "assetSettings") {
      syncAssetSettingsActiveIndexFromDom();
      const rowId = assetMarketResult.dataset.assetSettingId;
      if (applyAssetMarketResult(rowId, assetMarketResult.dataset.assetMarketResult)) {
        renderModal();
        hydrateIcons(document);
        const card = document.querySelector(`[data-asset-setting-card="${rowId}"]`);
        card?.querySelector("[data-asset-setting-field='quantity']")?.focus();
      }
      return;
    }

    const assetMarketFavoriteToggle = event.target.closest("[data-asset-market-favorite-toggle]");
    if (assetMarketFavoriteToggle && activeModal === "assetSettings") {
      syncAssetSettingsActiveIndexFromDom();
      const rowId = assetMarketFavoriteToggle.dataset.assetMarketFavoriteToggle;
      assetMarketFavoritesOpenId = assetMarketFavoritesOpenId === rowId ? "" : rowId;
      renderModal();
      hydrateIcons(document);
      return;
    }

    const assetMarketFavorite = event.target.closest("[data-asset-market-favorite]");
    if (assetMarketFavorite && activeModal === "assetSettings") {
      syncAssetSettingsActiveIndexFromDom();
      const rowId = assetMarketFavorite.dataset.assetSettingId;
      if (applyAssetFavoriteResult(rowId, assetMarketFavorite.dataset.assetMarketFavorite)) {
        renderModal();
        hydrateIcons(document);
        const card = document.querySelector(`[data-asset-setting-card="${rowId}"]`);
        card?.querySelector("[data-asset-setting-field='quantity']")?.focus();
      }
      return;
    }

    const assetSettingsAdd = event.target.closest("[data-asset-settings-add]");
    if (assetSettingsAdd && activeModal === "assetSettings") {
      syncAssetSettingsActiveIndexFromDom();
      addAssetSettingsDraft();
      renderModal();
      hydrateIcons(document);
      return;
    }

    const assetSettingsInputMode = event.target.closest("[data-asset-settings-input-mode]");
    if (assetSettingsInputMode && activeModal === "assetSettings") {
      syncAssetSettingsActiveIndexFromDom();
      updateAssetSettingsDraft(
        assetSettingsInputMode.dataset.assetSettingId,
        "priceInputMode",
        assetSettingsInputMode.dataset.assetSettingsInputMode
      );
      renderModal();
      hydrateIcons(document);
      return;
    }

    const assetSettingsPriceCurrency = event.target.closest("[data-asset-settings-price-currency]");
    if (assetSettingsPriceCurrency && activeModal === "assetSettings") {
      syncAssetSettingsActiveIndexFromDom();
      updateAssetPriceDisplayCurrency(
        assetSettingsPriceCurrency.dataset.assetSettingId,
        assetSettingsPriceCurrency.dataset.assetSettingsPriceCurrency
      );
      renderModal();
      hydrateIcons(document);
      const card = document.querySelector(`[data-asset-setting-card="${assetSettingsPriceCurrency.dataset.assetSettingId}"]`);
      card?.querySelector("[data-asset-setting-field='currentPrice']")?.focus();
      return;
    }

    const assetCurrentPriceFill = event.target.closest("[data-asset-current-price-fill]");
    if (assetCurrentPriceFill && activeModal === "assetSettings") {
      syncAssetSettingsActiveIndexFromDom();
      const rowId = assetCurrentPriceFill.dataset.assetCurrentPriceFill;
      assetSettingsError = "";
      assetSettingsMessage = "현재가를 불러오고 있습니다.";
      renderModal();
      hydrateIcons(document);
      try {
        await refreshAssetAveragePriceFromMarket(rowId);
      } catch (error) {
        assetSettingsError = error?.message || "현재가를 불러오지 못했습니다.";
        assetSettingsMessage = "";
      }
      renderModal();
      hydrateIcons(document);
      const card = document.querySelector(`[data-asset-setting-card="${rowId}"]`);
      card?.querySelector("[data-asset-setting-field='averagePrice']")?.focus();
      return;
    }

    const assetSettingsMenu = event.target.closest("[data-asset-settings-menu]");
    if (assetSettingsMenu && activeModal === "assetSettings") {
      syncAssetSettingsActiveIndexFromDom();
      const menuId = assetSettingsMenu.dataset.assetSettingsMenu;
      assetSettingsOpenMenuId = assetSettingsOpenMenuId === menuId ? null : menuId;
      renderModal();
      hydrateIcons(document);
      return;
    }

    const assetSettingsRemove = event.target.closest("[data-asset-settings-remove]");
    if (assetSettingsRemove && activeModal === "assetSettings") {
      syncAssetSettingsActiveIndexFromDom();
      requestAssetSettingsDelete(assetSettingsRemove.dataset.assetSettingsRemove);
      renderModal();
      hydrateIcons(document);
      return;
    }

    const assetSettingsEdit = event.target.closest("[data-asset-settings-edit]");
    if (assetSettingsEdit && activeModal === "assetSettings") {
      syncAssetSettingsActiveIndexFromDom();
      assetSettingsEditingId = assetSettingsEdit.dataset.assetSettingsEdit;
      assetSettingsOpenMenuId = null;
      renderModal();
      hydrateIcons(document);
      const card = document.querySelector(`[data-asset-setting-card="${assetSettingsEdit.dataset.assetSettingsEdit}"]`);
      const input = card?.querySelector("[data-asset-setting-field]");
      input?.focus();
      return;
    }

    const assetSettingsCancel = event.target.closest("[data-asset-settings-cancel]");
    if (assetSettingsCancel && activeModal === "assetSettings") {
      beginAssetSettingsEdit();
      renderModal();
      hydrateIcons(document);
      return;
    }

    const assetSettingsApply = event.target.closest("[data-asset-settings-apply]");
    if (assetSettingsApply && activeModal === "assetSettings") {
      if (assetSettingsSaving) return;
      assetSettingsSaving = true;
      assetSettingsError = "";
      syncAssetSettingsDraftFieldsFromDom();
      syncAssetSettingsActiveIndexFromDom();
      assetSettingsMessage = "자산 데이터를 저장하고 있습니다.";
      renderModal();
      hydrateIcons(document);

      if (!(await applyAssetSettingsEdit())) {
        assetSettingsSaving = false;
        renderModal();
        hydrateIcons(document);
        return;
      }

      assetSettingsSaving = false;
      activeModal = null;
      render();
      window.setTimeout(() => {
        if (!activeModal && getRoute() === "assets") render();
      }, 0);
      return;
    }

    const journalCurrentPriceButton = event.target.closest("[data-journal-current-price]");
    if (journalCurrentPriceButton) {
      applyJournalCurrentPrice(journalCurrentPriceButton);
      return;
    }

    const journalTradeModeButton = event.target.closest("[data-journal-trade-mode]");
    if (journalTradeModeButton) {
      const form = journalTradeModeButton.closest("[data-journal-entry-form]");
      if (form) {
        form.dataset.tradeMode = journalTradeModeButton.dataset.journalTradeMode;
        form.querySelectorAll("[data-journal-trade-mode]").forEach((button) => {
          const active = button === journalTradeModeButton;
          button.classList.toggle("active", active);
          button.setAttribute("aria-pressed", active ? "true" : "false");
        });
        syncJournalTradeMode(form);
      }
      return;
    }

    const journalEntrySave = event.target.closest("[data-journal-entry-save]");
    if (journalEntrySave) {
      const form = journalEntrySave.closest("[data-journal-entry-form]");
      const savedJournalDate = form?.querySelector("[data-date-picker]")?.value || "";
      const returnToCalendarDay = activeModal === "journalWrite" && journalWriteReturnToCalendarDay && savedJournalDate;
      if (form && !updateJournalTradeEstimate(form)) return;
      if (form && !(await saveJournalEntryFromForm(form))) return;
      setJournalEditingRecord("");
      if (typeof clearJournalWriteInitialDate === "function") clearJournalWriteInitialDate();
      journalWriteReturnToCalendarDay = false;
      if (returnToCalendarDay && typeof setCalendarDayDetailDate === "function") {
        setCalendarDayDetailDate(savedJournalDate);
        activeModal = "calendarDayDetail";
        render();
        hydrateIcons(document);
        return;
      }
      activeModal = null;
      render();
      return;
    }

    if (event.target.matches(".modal-backdrop")) {
      cancelActiveModalDraft();
      setJournalEditingRecord("");
      journalWriteReturnToCalendarDay = false;
      activeModal = null;
      assetCashError = "";
      assetCashMessage = "";
      assetCashDraftAmount = "";
      assetCashPendingAmount = 0;
      assetCashPendingMode = "deposit";
      renderModal();
      return;
    }

    if (modalPanel) return;
  }

  const pageDatePickerButton = event.target.closest("[data-date-picker-trigger]");
  if (pageDatePickerButton) {
    openLinkedDatePicker(pageDatePickerButton);
    return;
  }

  if (handleJournalWriteExtraClick(event)) return;

  const pageJournalTradeModeButton = event.target.closest("[data-journal-trade-mode]");
  if (pageJournalTradeModeButton) {
    const form = pageJournalTradeModeButton.closest("[data-journal-entry-form]");
    if (form) {
      form.dataset.tradeMode = pageJournalTradeModeButton.dataset.journalTradeMode;
      form.querySelectorAll("[data-journal-trade-mode]").forEach((button) => {
        const active = button === pageJournalTradeModeButton;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
      syncJournalTradeMode(form);
    }
    return;
  }

  const pageJournalCurrentPriceButton = event.target.closest("[data-journal-current-price]");
  if (pageJournalCurrentPriceButton) {
    applyJournalCurrentPrice(pageJournalCurrentPriceButton);
    return;
  }

  const pageJournalEntrySave = event.target.closest("[data-journal-entry-save]");
  if (pageJournalEntrySave) {
    const form = pageJournalEntrySave.closest("[data-journal-entry-form]");
    if (form && !updateJournalTradeEstimate(form)) return;
    if (form && !(await saveJournalEntryFromForm(form))) return;
    setJournalEditingRecord("");
    if (getRoute() === "journalWrite") {
      window.location.hash = "#calendar";
    }
    return;
  }

  const assetTrendRangeButton = event.target.closest("[data-asset-trend-range]");
  if (assetTrendRangeButton) {
    if (setAssetTrendRange(assetTrendRangeButton.dataset.assetTrendRange)) {
      render();
    }
    return;
  }

  const holdingsViewButton = event.target.closest("[data-dashboard-holdings-view]");
  if (holdingsViewButton && getRoute() === "dashboard") {
    dashboardHoldingsView = holdingsViewButton.dataset.dashboardHoldingsView;
    render();
    return;
  }

  const mobileMoreButton = event.target.closest("[data-mobile-more]");
  if (mobileMoreButton) {
    mobileSheetOpen = true;
    renderMobileSheet();
    hydrateIcons(document);
    return;
  }

  const mobileSheetClose = event.target.matches(".mobile-sheet-backdrop");
  if (mobileSheetClose) {
    mobileSheetOpen = false;
    renderMobileSheet();
    return;
  }

  const landingScrollButton = event.target.closest("[data-landing-scroll]");
  if (landingScrollButton && getRoute() === "landing") {
    const target = document.getElementById(landingScrollButton.dataset.landingScroll);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const journalDeleteButton = event.target.closest("[data-journal-delete-selected]");
  if (journalDeleteButton && getRoute() === "journal") {
    const selectedIds = Array.from(journalSelectedTradeIds);
    const realRecordIds = selectedIds.filter((id) => getJournalRecordById(id));
    const sampleIds = selectedIds.filter((id) => !getJournalRecordById(id));
    if (realRecordIds.length) await deleteJournalRecordsByIds(realRecordIds);
    sampleIds.forEach((id) => journalDeletedTradeIds.add(id));
    journalSelectedTradeIds.clear();
    render();
    return;
  }

  const journalEditRecordButton = event.target.closest("[data-journal-edit-record]");
  if (journalEditRecordButton && getRoute() === "journal") {
    openJournalRecordEditor(journalEditRecordButton.dataset.journalEditRecord);
    return;
  }

  const journalDeleteRecordButton = event.target.closest("[data-journal-delete-record]");
  if (journalDeleteRecordButton && getRoute() === "journal") {
    if (window.confirm("이 매매일지를 삭제하시겠습니까?")) {
      await deleteJournalRecordById(journalDeleteRecordButton.dataset.journalDeleteRecord);
      render();
    }
    return;
  }

  const routeButton = event.target.closest("button[data-route], a[data-route]");
  if (routeButton) {
    const route = routeButton.dataset.route;
    if (renderers[route]) {
      const currentRoute = getRoute();
      activeModal = null;
      setJournalEditingRecord("");
      mobileSheetOpen = false;
      window.location.hash = route;
      if (currentRoute === route) {
        render();
        scrollPageToTop();
      }
    }
  }

  const segmentedButton = event.target.closest(".segmented button");
  if (segmentedButton) {
    segmentedButton.parentElement.querySelectorAll("button").forEach((button) => button.classList.remove("active"));
    segmentedButton.classList.add("active");
  }

  const switchButton = event.target.closest(".switch");
  if (switchButton) {
    switchButton.classList.toggle("on");
  }
});

document.addEventListener("submit", (event) => {
  if (!event.target.closest(".modal-panel form")) return;
  event.preventDefault();
});

document.addEventListener("change", (event) => {
  const journalDateInput = event.target.closest("[data-journal-date-input]");
  if (journalDateInput && activeModal === "journalDateRange") {
    setJournalDateRangeDraft(journalDateInput.dataset.journalDateInput, journalDateInput.value);
    return;
  }

  const assetTargetVisible = event.target.closest("[data-asset-target-visible]");
  if (assetTargetVisible && activeModal === "assetTrendTargets") {
    updateAssetTrendTargetDraft(assetTargetVisible.dataset.assetTargetId, { visible: assetTargetVisible.checked });
    return;
  }

  const assetSettingsFileInput = event.target.closest("[data-asset-settings-file]");
  if (assetSettingsFileInput && activeModal === "assetSettings") {
    const [file] = assetSettingsFileInput.files || [];
    assetSettingsFileInput.value = "";
    importAssetSettingsFile(file);
    return;
  }

  const assetPortfolioCashToggle = event.target.closest("[data-asset-portfolio-cash-toggle]");
  if (assetPortfolioCashToggle && getRoute() === "assets") {
    assetPortfolioIncludeCash = assetPortfolioCashToggle.checked;
    render();
    return;
  }

  const assetTrendCashToggle = event.target.closest("[data-asset-trend-cash-toggle]");
  if (assetTrendCashToggle && getRoute() === "dashboard") {
    setAssetTrendIncludeCash(assetTrendCashToggle.checked);
    render();
    return;
  }

  if (activeModal && event.target.closest(".modal-panel")) return;

  const journalCheckbox = event.target.closest("[data-journal-select]");
  if (!journalCheckbox || getRoute() !== "journal") return;

  if (journalCheckbox.checked) {
    journalSelectedTradeIds.add(journalCheckbox.dataset.journalSelect);
  } else {
    journalSelectedTradeIds.delete(journalCheckbox.dataset.journalSelect);
  }

  render();
});

document.addEventListener("input", (event) => {
  const numberInput = event.target.closest("[data-number-input]");
  if (numberInput) {
    formatNumberInput(numberInput);
  }

  const stockSearchInput = event.target.closest("[data-stock-search-input]");
  if (stockSearchInput && getRoute() === "stock") {
    scheduleStockSearch(stockSearchInput.value);
    return;
  }

  const calendarMonthInput = event.target.closest("[data-calendar-month-input]");
  if (calendarMonthInput && getRoute() === "calendar" && typeof setCalendarMonthValue === "function") {
    setCalendarMonthValue(calendarMonthInput.value);
    render();
    return;
  }

  const assetTargetAmount = event.target.closest("[data-asset-target-amount]");
  if (assetTargetAmount && activeModal === "assetTrendTargets") {
    updateAssetTrendTargetDraft(assetTargetAmount.dataset.assetTargetId, { amount: parseKRWInput(assetTargetAmount.value) });
    return;
  }

  const assetTargetLabel = event.target.closest("[data-asset-target-label]");
  if (assetTargetLabel && activeModal === "assetTrendTargets") {
    updateAssetTrendTargetDraft(assetTargetLabel.dataset.assetTargetId, { label: assetTargetLabel.value });
    return;
  }

  const assetSettingField = event.target.closest("[data-asset-setting-field]");
  if (assetSettingField && activeModal === "assetSettings") {
    const rowId = assetSettingField.dataset.assetSettingId;
    const fieldName = assetSettingField.dataset.assetSettingField;
    updateAssetSettingsDraft(
      rowId,
      fieldName,
      assetSettingField.value
    );
    if (fieldName === "name" || fieldName === "code") {
      scheduleAssetMarketSearch(rowId, assetSettingField.value);
    }
    updateAssetSettingsCardPreview(rowId);
    return;
  }

  const journalEntryForm = event.target.closest("[data-journal-entry-form]");
  if (journalEntryForm) {
    updateJournalTradeEstimate(journalEntryForm);
  }

  const journalWriteStockSearch = event.target.closest("[data-journal-write-stock-search]");
  if (journalWriteStockSearch) {
    filterJournalWriteStockPicker(journalWriteStockSearch);
    return;
  }

  const journalWriteStockName = event.target.closest("[data-journal-stock-name]");
  if (journalWriteStockName) {
    const form = journalWriteStockName.closest("[data-journal-entry-form]");
    clearJournalSelectedStock(form, { keepInput: true });
    scheduleJournalStockSearch(journalWriteStockName);
    return;
  }

  const journalStockSearchInput = event.target.closest("[data-journal-stock-search]");
  if (journalStockSearchInput && activeModal === "journalStockFilter") {
    updateJournalStockSearchView(journalStockSearchInput.value);
    return;
  }

  const amountInput = event.target.closest("[data-asset-cash-amount]");
  if (!amountInput || activeModal !== "assetCash") return;

  const feedback = document.querySelector(".asset-cash-feedback.error");
  if (!feedback) return;

  const amount = parseKRWInput(amountInput.value);
  assetCashDraftAmount = amountInput.value;
  if (assetCashMode === "withdraw" && amount > assetCashBalance) {
    feedback.textContent = "현재 현금 자산보다 큰 금액은 출금할 수 없습니다.";
  } else {
    feedback.textContent = "";
  }
});

document.addEventListener("pointerdown", (event) => {
  beginMobileSheetDrag(event);
});

document.addEventListener("touchmove", preventMobileSheetBackdropScroll, { passive: false });
document.addEventListener("wheel", preventMobileSheetBackdropScroll, { passive: false });

document.addEventListener("pointerover", (event) => {
  const target = event.target.closest("[data-chart-tooltip]");
  if (!target) return;
  if (pinnedChartTooltipTarget) return;
  showChartTooltip(target, event);
});

document.addEventListener("pointermove", (event) => {
  if (moveMobileSheetDrag(event)) return;

  const target = event.target.closest("[data-chart-tooltip]");
  if (!target) return;
  if (pinnedChartTooltipTarget) return;
  positionChartTooltip(event);
});

document.addEventListener("pointercancel", (event) => {
  endMobileSheetDrag(event);
});

document.addEventListener("change", (event) => {
  const calendarMonthInput = event.target.closest("[data-calendar-month-input]");
  if (calendarMonthInput && getRoute() === "calendar" && typeof setCalendarMonthValue === "function") {
    setCalendarMonthValue(calendarMonthInput.value);
    render();
  }
});

document.addEventListener("pointerout", (event) => {
  const target = event.target.closest("[data-chart-tooltip]");
  if (!target) return;
  if (pinnedChartTooltipTarget) return;
  const relatedTarget = event.relatedTarget && event.relatedTarget.closest ? event.relatedTarget.closest("[data-chart-tooltip]") : null;
  if (relatedTarget === target) return;
  hideChartTooltip();
});

document.addEventListener("pointerup", (event) => {
  if (endMobileSheetDrag(event)) return;

  const target = event.target.closest("[data-chart-tooltip]");
  if (!target || !isTouchChartTooltipMode()) return;

  chartTooltipPointerTapTarget = target;
  event.preventDefault();
  togglePinnedChartTooltip(target, event);
});

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-chart-tooltip]");
  if (target && isTouchChartTooltipMode()) {
    if (chartTooltipPointerTapTarget === target) {
      chartTooltipPointerTapTarget = null;
      return;
    }
    togglePinnedChartTooltip(target, event);
    return;
  }

  chartTooltipPointerTapTarget = null;
  if (pinnedChartTooltipTarget) hideChartTooltip();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && activeModal) {
    cancelActiveModalDraft();
    activeModal = null;
    assetCashError = "";
    assetCashMessage = "";
    assetCashDraftAmount = "";
    assetCashPendingAmount = 0;
    assetCashPendingMode = "deposit";
    renderModal();
  }
  if (event.key === "Escape" && mobileSheetOpen) {
    mobileSheetOpen = false;
    renderMobileSheet();
  }
  if (event.key === "Escape" && sidebarUserMenuOpen) {
    sidebarUserMenuOpen = false;
    renderSidebarUser();
  }
});

window.addEventListener("hashchange", () => {
  cancelActiveModalDraft();
  activeModal = null;
  assetCashError = "";
  assetCashMessage = "";
  assetCashDraftAmount = "";
  assetCashPendingAmount = 0;
  assetCashPendingMode = "deposit";
  mobileSheetOpen = false;
  sidebarUserMenuOpen = false;
  hideChartTooltip();
  render();
  scrollPageToTop();
  refreshVisibleMarketData({ syncRemote: false });
});
document.addEventListener("scroll", schedulePinnedChartTooltipPosition, { capture: true, passive: true });
window.addEventListener("resize", () => {
  scheduleFitValueText();
  schedulePinnedChartTooltipPosition();
  scheduleMobileViewportInset();
});
window.addEventListener("pageshow", () => {
  refreshVisibleMarketData({ syncRemote: true });
});
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    refreshVisibleMarketData({ syncRemote: true });
  }
});
window.visualViewport?.addEventListener("resize", scheduleMobileViewportInset, { passive: true });
window.visualViewport?.addEventListener("scroll", scheduleMobileViewportInset, { passive: true });
initializeUserDataState();
updateMobileViewportInset();
render();
