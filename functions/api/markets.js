const YAHOO_SEARCH_URL = "https://query1.finance.yahoo.com/v1/finance/search";
const YAHOO_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart";
const YAHOO_FUNDAMENTALS_URL = "https://query1.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries";
const KRX_CORP_LIST_URL = "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13";
const BINANCE_API_BASE_URLS = [
  "https://data-api.binance.vision",
  "https://api.binance.com",
  "https://api1.binance.com",
  "https://api2.binance.com",
  "https://api3.binance.com",
  "https://api4.binance.com",
  "https://api.binance.us",
  "https://www.binance.us"
];
const BINANCE_EXCHANGE_INFO_PATH = "/api/v3/exchangeInfo";
const BINANCE_TICKER_24H_PATH = "/api/v3/ticker/24hr";
const BINANCE_KLINES_PATH = "/api/v3/klines";

const BINANCE_QUOTE_PRIORITY = {
  USDT: 0,
  USDC: 1,
  FDUSD: 2,
  TUSD: 3,
  BUSD: 4,
  BTC: 10,
  ETH: 11,
  BNB: 12,
  EUR: 20,
  TRY: 21,
  KRW: 22
};

const BINANCE_STABLE_QUOTES = new Set(["USDT", "USDC", "FDUSD", "TUSD", "BUSD"]);
const BINANCE_QUOTE_ASSETS = Object.keys(BINANCE_QUOTE_PRIORITY);
const BINANCE_KLINE_INTERVALS = new Set(["1m", "5m", "15m", "30m", "1h", "1d", "1w", "1M"]);
const CRYPTO_NAME_ALIASES = {
  bitcoin: "BTC",
  btc: "BTC",
  ethereum: "ETH",
  ether: "ETH",
  eth: "ETH",
  ripple: "XRP",
  xrp: "XRP",
  stellar: "XLM",
  lumen: "XLM",
  lumens: "XLM",
  xlm: "XLM",
  dogecoin: "DOGE",
  doge: "DOGE",
  solana: "SOL",
  sol: "SOL",
  cardano: "ADA",
  ada: "ADA",
  chainlink: "LINK",
  link: "LINK",
  litecoin: "LTC",
  ltc: "LTC",
  polkadot: "DOT",
  dot: "DOT",
  polygon: "POL",
  matic: "MATIC",
  avalanche: "AVAX",
  avax: "AVAX",
  tron: "TRX",
  trx: "TRX",
  pepe: "PEPE",
  shiba: "SHIB",
  shib: "SHIB"
};

const REQUEST_HEADERS = {
  "User-Agent": "Mozilla/5.0 TradingNote/1.0",
  Accept: "application/json,text/html,*/*"
};

const POPULAR_KRX_CODE_BOOST = {
  "005930": 36,
  "000660": 30,
  "035420": 26,
  "035720": 24,
  "005380": 22,
  "373220": 20,
  "207940": 18,
  "000270": 16
};

const YAHOO_QUOTE_TYPE_LABELS = {
  CRYPTOCURRENCY: "암호화폐",
  CURRENCY: "환율",
  EQUITY: "주식",
  ETF: "ETF",
  FUTURE: "선물",
  INDEX: "지수",
  MUTUALFUND: "펀드"
};

const fxRateCache = new Map();
const FUNDAMENTAL_METRICS = [
  { type: "annualTotalRevenue", label: "매출액" },
  { type: "annualGrossProfit", label: "매출총이익" },
  { type: "annualOperatingIncome", label: "영업이익" },
  { type: "annualNetIncome", label: "순이익" }
];

function json(data, status = 200, options = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": status === 200 && !options.noStore ? "public, max-age=120" : "no-store"
    }
  });
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, "").toLowerCase();
}

function normalizeCurrency(value) {
  return String(value || "").trim().toUpperCase();
}

function cleanHtmlCell(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeKrxHtml(buffer) {
  try {
    return new TextDecoder("euc-kr").decode(buffer);
  } catch (error) {
    return new TextDecoder("utf-8").decode(buffer);
  }
}

function getDomesticSymbol(code, market) {
  const normalizedMarket = String(market || "");
  if (normalizedMarket.includes("코스닥") || normalizedMarket.toLowerCase().includes("kosdaq")) {
    return `${code}.KQ`;
  }
  return `${code}.KS`;
}

function getMarketLabel(market) {
  const value = String(market || "").trim();
  if (value === "유가" || value.toLowerCase() === "kospi") return "KOSPI";
  if (value === "코스닥" || value.toLowerCase() === "kosdaq") return "KOSDAQ";
  if (value === "코넥스" || value.toLowerCase() === "konex") return "KONEX";
  return value || "KRX";
}

function parseKrxRows(html) {
  const rows = [];
  const rowMatches = html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);

  for (const rowMatch of rowMatches) {
    const cellMatches = [...rowMatch[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)];
    const cells = cellMatches.map((match) => cleanHtmlCell(match[1]));
    if (cells.length < 3 || cells[0] === "회사명") continue;

    const [name, rawMarket, rawCode, industry] = cells;
    const code = String(rawCode || "").trim();
    if (!name || !code) continue;

    rows.push({
      name,
      code,
      symbol: getDomesticSymbol(code, rawMarket),
      market: getMarketLabel(rawMarket),
      exchange: "KRX",
      industry: industry || "",
      currency: "KRW",
      source: "KRX"
    });
  }

  return rows;
}

async function fetchKrxCompanies() {
  const response = await fetch(KRX_CORP_LIST_URL, {
    headers: REQUEST_HEADERS,
    cf: { cacheTtl: 21600, cacheEverything: true }
  });
  if (!response.ok) return [];

  const html = decodeKrxHtml(await response.arrayBuffer());
  return parseKrxRows(html);
}

function rankKrxResult(item, query, normalizedQuery) {
  const name = normalizeText(item.name);
  const code = normalizeText(item.code);
  const symbol = normalizeText(item.symbol);
  let score = 0;

  if (code === normalizedQuery || symbol === normalizedQuery) score += 120;
  if (name === normalizedQuery) score += 110;
  if (code.startsWith(normalizedQuery)) score += 80;
  if (name.startsWith(normalizedQuery)) score += 70;
  if (name.includes(normalizedQuery)) score += 45;
  if (symbol.includes(normalizedQuery)) score += 30;
  if (String(query).length >= 2 && item.name.includes(query)) score += 20;
  if (score > 0) score += POPULAR_KRX_CODE_BOOST[item.code] || 0;

  return score;
}

async function searchKrx(query, limit) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return [];

  const companies = await fetchKrxCompanies();
  return companies
    .map((item) => ({ ...item, score: rankKrxResult(item, query, normalizedQuery) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "ko"))
    .slice(0, limit);
}

function mapYahooQuote(quote) {
  const symbol = String(quote.symbol || "").trim();
  if (!symbol) return null;

  const name = quote.longname || quote.shortname || symbol;
  const code = symbol.replace(/\.(KS|KQ)$/i, "");
  const quoteType = String(quote.quoteType || "").trim().toUpperCase();
  const type = YAHOO_QUOTE_TYPE_LABELS[quoteType] || quote.typeDisp || quoteType;

  return {
    name,
    code,
    symbol,
    type,
    quoteType,
    market: quote.exchDisp || quote.exchange || "",
    exchange: quote.exchange || quote.exchDisp || "",
    industry: quote.industryDisp || quote.industry || "",
    logoUrl: quote.logoUrl || "",
    currency: "",
    source: "Yahoo Finance"
  };
}

async function searchYahoo(query, limit) {
  const url = new URL(YAHOO_SEARCH_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("quotesCount", String(limit));
  url.searchParams.set("newsCount", "0");
  url.searchParams.set("lang", "en-US");
  url.searchParams.set("region", "US");

  const response = await fetch(url.toString(), {
    headers: REQUEST_HEADERS,
    cf: { cacheTtl: 120, cacheEverything: true }
  });
  if (!response.ok) return [];

  const payload = await response.json().catch(() => ({}));
  return (payload.quotes || [])
    .map(mapYahooQuote)
    .filter(Boolean)
    .slice(0, limit);
}

function normalizeBinanceAsset(value) {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function normalizeBinanceQuery(value) {
  return normalizeBinanceAsset(value);
}

function getBinanceAliasQuery(value) {
  const key = String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  return CRYPTO_NAME_ALIASES[key] || "";
}

function getBinanceQuotePriority(quoteAsset) {
  return BINANCE_QUOTE_PRIORITY[normalizeBinanceAsset(quoteAsset)] ?? 99;
}

function normalizeBinanceCurrency(quoteAsset) {
  const quote = normalizeBinanceAsset(quoteAsset);
  return BINANCE_STABLE_QUOTES.has(quote) ? "USD" : quote;
}

function splitBinanceSymbol(symbol) {
  const normalizedSymbol = normalizeBinanceAsset(symbol);
  const quote = [...BINANCE_QUOTE_ASSETS]
    .sort((a, b) => b.length - a.length)
    .find((candidate) => normalizedSymbol.endsWith(candidate) && normalizedSymbol.length > candidate.length);
  if (!quote) return { baseAsset: normalizedSymbol, quoteAsset: "" };
  return {
    baseAsset: normalizedSymbol.slice(0, -quote.length),
    quoteAsset: quote
  };
}

function getBinanceDisplayCode(baseAsset, quoteAsset) {
  const base = normalizeBinanceAsset(baseAsset);
  const quote = normalizeBinanceAsset(quoteAsset);
  if (!base) return "";
  return quote ? `${base}-${quote}` : base;
}

function getBinanceDisplayName(baseAsset, quoteAsset) {
  const base = normalizeBinanceAsset(baseAsset);
  const quote = normalizeBinanceAsset(quoteAsset);
  if (!base) return "";
  return `${base} ${normalizeBinanceCurrency(quote) || quote || ""}`.trim();
}

function getBinanceSearchQueries(query) {
  const normalizedQuery = normalizeBinanceQuery(query);
  const aliasQuery = getBinanceAliasQuery(query);
  return [...new Set([normalizedQuery, aliasQuery].filter(Boolean))];
}

function shouldSearchBinance(query) {
  const normalizedQuery = normalizeBinanceQuery(query);
  if (normalizedQuery.length < 2) return false;
  return !hasHangul(query);
}

async function fetchBinanceJson(path, params = {}, options = {}) {
  for (const baseUrl of BINANCE_API_BASE_URLS) {
    const url = new URL(path, baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
    });

    const fetchOptions = { headers: REQUEST_HEADERS };
    if (!options.noStore) {
      fetchOptions.cf = { cacheTtl: options.cacheTtl || 60, cacheEverything: true };
    }

    try {
      const response = await fetch(url.toString(), fetchOptions);
      if (!response.ok) continue;
      return await response.json().catch(() => null);
    } catch (error) {
      continue;
    }
  }
  return null;
}

async function fetchBinanceExchangeSymbols() {
  const payload = await fetchBinanceJson(BINANCE_EXCHANGE_INFO_PATH, {}, { cacheTtl: 21600 });
  return Array.isArray(payload?.symbols) ? payload.symbols : [];
}

function rankBinanceResult(item, queries) {
  const symbol = normalizeBinanceAsset(item.symbol);
  const baseAsset = normalizeBinanceAsset(item.baseAsset);
  const quoteAsset = normalizeBinanceAsset(item.quoteAsset);
  const priorityPenalty = getBinanceQuotePriority(quoteAsset);
  let score = 0;

  for (const query of queries) {
    if (!query) continue;
    if (symbol === query) score = Math.max(score, 220);
    if (getBinanceDisplayCode(baseAsset, quoteAsset).replace("-", "") === query) score = Math.max(score, 210);
    if (baseAsset === query) score = Math.max(score, 180);
    if (symbol.startsWith(query)) score = Math.max(score, 130);
    if (baseAsset.startsWith(query)) score = Math.max(score, 115);
    if (symbol.includes(query)) score = Math.max(score, 80);
    if (baseAsset.includes(query)) score = Math.max(score, 70);
  }

  if (!score) return 0;
  return score - priorityPenalty;
}

function mapBinanceSymbol(item) {
  const symbol = normalizeBinanceAsset(item.symbol);
  const baseAsset = normalizeBinanceAsset(item.baseAsset);
  const quoteAsset = normalizeBinanceAsset(item.quoteAsset);
  if (!symbol || !baseAsset || !quoteAsset) return null;

  return {
    name: getBinanceDisplayName(baseAsset, quoteAsset),
    code: getBinanceDisplayCode(baseAsset, quoteAsset),
    symbol,
    type: "암호화폐",
    quoteType: "CRYPTOCURRENCY",
    market: `${quoteAsset} 마켓`,
    exchange: "Binance",
    industry: "Cryptocurrency",
    logoUrl: "",
    currency: normalizeBinanceCurrency(quoteAsset),
    source: "Binance"
  };
}

async function searchBinanceCrypto(query, limit) {
  const queries = getBinanceSearchQueries(query);
  if (!queries.length) return [];

  const symbols = await fetchBinanceExchangeSymbols();
  return symbols
    .filter((item) => (
      item?.status === "TRADING"
      && item?.isSpotTradingAllowed !== false
      && BINANCE_QUOTE_ASSETS.includes(normalizeBinanceAsset(item.quoteAsset))
    ))
    .map((item) => ({ item, score: rankBinanceResult(item, queries) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => (
      b.score - a.score
      || getBinanceQuotePriority(a.item.quoteAsset) - getBinanceQuotePriority(b.item.quoteAsset)
      || String(a.item.symbol).localeCompare(String(b.item.symbol))
    ))
    .slice(0, limit)
    .map((entry) => mapBinanceSymbol(entry.item))
    .filter(Boolean);
}

function mapYahooNews(item) {
  const title = String(item.title || "").trim();
  if (!title) return null;

  const publishedAt = Number(item.providerPublishTime || item.providerPublishTimeMs / 1000 || 0);
  return {
    title,
    publisher: String(item.publisher || "").trim(),
    link: String(item.link || "").trim(),
    publishedAt: publishedAt ? new Date(publishedAt * 1000).toISOString() : "",
    source: "Yahoo Finance"
  };
}

async function fetchYahooNews(query, limit = 5) {
  const trimmedQuery = String(query || "").trim();
  if (!trimmedQuery) return [];

  const newsLimit = Math.min(Math.max(Number(limit) || 5, 1), 10);
  const requestNews = async (locale = {}) => {
    const url = new URL(YAHOO_SEARCH_URL);
    url.searchParams.set("q", trimmedQuery);
    url.searchParams.set("quotesCount", "0");
    url.searchParams.set("newsCount", String(newsLimit));
    if (locale.lang) url.searchParams.set("lang", locale.lang);
    if (locale.region) url.searchParams.set("region", locale.region);

    const response = await fetch(url.toString(), {
      headers: REQUEST_HEADERS,
      cf: { cacheTtl: 300, cacheEverything: true }
    });
    if (!response.ok) return [];

    const payload = await response.json().catch(() => ({}));
    return (payload.news || [])
      .map(mapYahooNews)
      .filter(Boolean)
      .slice(0, newsLimit);
  };

  const localizedNews = await requestNews({ lang: "ko-KR", region: "KR" });
  return localizedNews.length ? localizedNews : requestNews();
}

function addNewsQueryCandidate(candidates, seen, value) {
  const query = String(value || "").replace(/\s+/g, " ").trim();
  const key = normalizeText(query);
  if (!query || !key || seen.has(key)) return;
  seen.add(key);
  candidates.push(query);
}

function simplifyCompanyNewsQuery(value = "") {
  return String(value || "")
    .replace(/[.,]/g, " ")
    .replace(/\b(co|corp|corporation|inc|ltd|limited|plc|company)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function getNewsQueryCandidates(query, symbol = "") {
  const candidates = [];
  const seen = new Set();
  addNewsQueryCandidate(candidates, seen, query);

  const normalizedSymbol = String(symbol || "").trim();
  if (normalizedSymbol) {
    const chart = await fetchYahooChart(normalizedSymbol).catch(() => null);
    const chartName = chart?.name || "";
    addNewsQueryCandidate(candidates, seen, simplifyCompanyNewsQuery(chartName));
    addNewsQueryCandidate(candidates, seen, chartName);
    addNewsQueryCandidate(candidates, seen, normalizedSymbol);
  }

  return candidates;
}

async function fetchYahooNewsWithFallback(query, options = {}, limit = 5) {
  const candidates = await getNewsQueryCandidates(query, options.symbol || "");
  for (const candidate of candidates) {
    const news = await fetchYahooNews(candidate, limit);
    if (news.length) return news;
  }
  return [];
}

function sanitizeChartParam(value, fallback) {
  const normalized = String(value || "").trim();
  return /^[0-9]+[a-z]+$/i.test(normalized) ? normalized : fallback;
}

function normalizeYahooCandles(result) {
  const timestamps = Array.isArray(result?.timestamp) ? result.timestamp : [];
  const quote = result?.indicators?.quote?.[0] || {};
  const opens = Array.isArray(quote.open) ? quote.open : [];
  const highs = Array.isArray(quote.high) ? quote.high : [];
  const lows = Array.isArray(quote.low) ? quote.low : [];
  const closes = Array.isArray(quote.close) ? quote.close : [];
  const volumes = Array.isArray(quote.volume) ? quote.volume : [];

  return timestamps
    .map((timestamp, index) => {
      const close = Number(closes[index]);
      if (!Number.isFinite(close) || close <= 0) return null;

      const open = Number(opens[index]);
      const high = Number(highs[index]);
      const low = Number(lows[index]);

      return {
        time: Number(timestamp) * 1000,
        open: Number.isFinite(open) && open > 0 ? open : close,
        high: Number.isFinite(high) && high > 0 ? high : close,
        low: Number.isFinite(low) && low > 0 ? low : close,
        close,
        volume: Math.max(0, Number(volumes[index]) || 0)
      };
    })
    .filter(Boolean);
}

async function fetchYahooChart(symbol, options = {}) {
  if (!symbol) return null;

  const range = sanitizeChartParam(options.range, "1d");
  const interval = sanitizeChartParam(options.interval, "1d");
  const url = new URL(`${YAHOO_CHART_URL}/${encodeURIComponent(symbol)}`);
  url.searchParams.set("range", range);
  url.searchParams.set("interval", interval);
  url.searchParams.set("includePrePost", "false");
  url.searchParams.set("events", "div,splits");
  if (options.noStore) url.searchParams.set("_refresh", String(Date.now()));

  const fetchOptions = {
    headers: REQUEST_HEADERS
  };
  if (!options.noStore) {
    fetchOptions.cf = { cacheTtl: 60, cacheEverything: true };
  }

  const response = await fetch(url.toString(), fetchOptions);
  if (!response.ok) return null;

  const payload = await response.json().catch(() => ({}));
  const result = payload.chart?.result?.[0];
  const meta = result?.meta;
  if (!meta || payload.chart?.error) return null;

  const close = result.indicators?.quote?.[0]?.close || [];
  const lastClose = close.slice().reverse().find((value) => Number.isFinite(Number(value)));
  const price = Number(meta.regularMarketPrice ?? lastClose ?? 0) || 0;
  const previousClose = Number(meta.chartPreviousClose || 0) || 0;
  const change = price && previousClose ? price - previousClose : 0;
  const changeRate = previousClose ? (change / previousClose) * 100 : 0;

  return {
    name: meta.longName || meta.shortName || symbol,
    symbol: meta.symbol || symbol,
    market: meta.fullExchangeName || meta.exchangeName || "",
    exchange: meta.exchangeName || "",
    currency: meta.currency || "",
    currentPrice: roundMarketPrice(price),
    change,
    changeRate,
    candles: options.includeCandles ? normalizeYahooCandles(result) : undefined
  };
}

function roundMarketPrice(value) {
  const price = Number(value);
  if (!Number.isFinite(price) || price <= 0) return 0;
  if (price >= 1000) return Math.round(price * 100) / 100;
  if (price >= 1) return Math.round(price * 10000) / 10000;
  return Math.round(price * 100000000) / 100000000;
}

function roundKrwUnitPrice(value) {
  const price = Math.max(0, Number(value) || 0);
  if (!price) return 0;
  if (price >= 1) return Math.round(price);
  return Number(price.toPrecision(12));
}

function getBinanceSymbolCandidates(value) {
  const raw = String(value || "").trim().toUpperCase();
  if (!raw) return [];

  const parts = raw.split(/[-_/: ]+/).map(normalizeBinanceAsset).filter(Boolean);
  if (parts.length >= 2) {
    const [baseAsset, rawQuote] = parts;
    const quoteAsset = rawQuote === "USD" ? "USDT" : rawQuote;
    if (BINANCE_STABLE_QUOTES.has(quoteAsset) || BINANCE_QUOTE_ASSETS.includes(quoteAsset)) {
      const stableCandidates = rawQuote === "USD"
        ? ["USDT", "USDC", "FDUSD", "TUSD", "BUSD"].map((quote) => `${baseAsset}${quote}`)
        : [`${baseAsset}${quoteAsset}`];
      return [...new Set(stableCandidates)];
    }
  }

  const normalized = normalizeBinanceAsset(raw);
  const split = splitBinanceSymbol(normalized);
  if (split.quoteAsset) return [normalized];

  const alias = getBinanceAliasQuery(raw);
  const baseAsset = alias || normalized;
  return [...new Set(["USDT", "USDC", "FDUSD", "TUSD", "BUSD"].map((quote) => `${baseAsset}${quote}`))];
}

function normalizeBinanceInterval(interval) {
  const normalized = String(interval || "").trim();
  const mapped = {
    "1wk": "1w",
    "1mo": "1M",
    "60m": "1h"
  }[normalized] || normalized;
  return BINANCE_KLINE_INTERVALS.has(mapped) ? mapped : "1d";
}

function getBinanceKlineLimit(range, interval) {
  const normalizedRange = String(range || "").trim().toLowerCase();
  const normalizedInterval = normalizeBinanceInterval(interval);
  if (normalizedInterval !== "1d") return 240;
  if (normalizedRange === "1mo") return 35;
  if (normalizedRange === "3mo") return 95;
  if (normalizedRange === "6mo") return 190;
  if (normalizedRange === "1y") return 260;
  if (normalizedRange === "2y") return 520;
  return 200;
}

function normalizeBinanceCandles(rows) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => {
      const openTime = Number(row?.[0]);
      const open = Number(row?.[1]);
      const high = Number(row?.[2]);
      const low = Number(row?.[3]);
      const close = Number(row?.[4]);
      const volume = Number(row?.[5]);
      if (!Number.isFinite(openTime) || !Number.isFinite(close) || close <= 0) return null;
      return {
        time: openTime,
        open: Number.isFinite(open) && open > 0 ? open : close,
        high: Number.isFinite(high) && high > 0 ? high : close,
        low: Number.isFinite(low) && low > 0 ? low : close,
        close,
        volume: Math.max(0, Number.isFinite(volume) ? volume : 0)
      };
    })
    .filter(Boolean);
}

async function fetchBinanceTicker(symbol, options = {}) {
  const payload = await fetchBinanceJson(BINANCE_TICKER_24H_PATH, { symbol }, {
    noStore: options.noStore,
    cacheTtl: 30
  });
  return payload && !payload.code ? payload : null;
}

async function fetchBinanceKlines(symbol, options = {}) {
  const payload = await fetchBinanceJson(BINANCE_KLINES_PATH, {
    symbol,
    interval: normalizeBinanceInterval(options.interval),
    limit: getBinanceKlineLimit(options.range, options.interval)
  }, {
    noStore: options.noStore,
    cacheTtl: 60
  });
  return normalizeBinanceCandles(payload || []);
}

async function fetchBinanceChart(symbol, options = {}) {
  const candidates = getBinanceSymbolCandidates(symbol);
  for (const candidate of candidates) {
    const ticker = await fetchBinanceTicker(candidate, options);
    if (!ticker) continue;

    const { baseAsset, quoteAsset } = splitBinanceSymbol(candidate);
    const price = roundMarketPrice(ticker.lastPrice);
    const candles = options.includeCandles ? await fetchBinanceKlines(candidate, options) : undefined;
    return {
      name: getBinanceDisplayName(baseAsset, quoteAsset),
      symbol: candidate,
      market: `${quoteAsset} 마켓`,
      exchange: "Binance",
      currency: normalizeBinanceCurrency(quoteAsset),
      currentPrice: price,
      change: Number(ticker.priceChange || 0),
      changeRate: Number(ticker.priceChangePercent || 0),
      candles
    };
  }
  return null;
}

function getFundamentalPeriodWindow() {
  const now = new Date();
  const start = new Date(now.getFullYear() - 7, 0, 1);
  const end = new Date(now.getFullYear() + 1, 11, 31);
  return {
    period1: Math.floor(start.getTime() / 1000),
    period2: Math.floor(end.getTime() / 1000)
  };
}

function getFundamentalRawValue(item) {
  const value = Number(item?.reportedValue?.raw ?? item?.raw ?? NaN);
  return Number.isFinite(value) ? value : null;
}

function formatFundamentalValue(value, currency) {
  if (!Number.isFinite(Number(value))) return "-";
  const divisor = normalizeCurrency(currency) === "KRW" ? 100000000 : 1000000;
  return Math.round(Number(value) / divisor).toLocaleString("ko-KR");
}

function normalizeFundamentalResult(result) {
  const type = String(result?.meta?.type?.[0] || "").trim();
  const entries = Array.isArray(result?.[type]) ? result[type] : [];
  const valuesByYear = {};
  let currency = "";

  entries.forEach((entry) => {
    const raw = getFundamentalRawValue(entry);
    const year = String(entry?.asOfDate || "").slice(0, 4);
    if (!year || raw === null) return;
    valuesByYear[year] = raw;
    if (!currency) currency = normalizeCurrency(entry?.currencyCode || entry?.reportedValue?.currencyCode || "");
  });

  return { type, valuesByYear, currency };
}

async function fetchYahooFundamentals(symbol) {
  const normalizedSymbol = String(symbol || "").trim();
  if (!normalizedSymbol) return { headers: [], rows: [], currency: "", unit: "", source: "Yahoo Finance" };

  const { period1, period2 } = getFundamentalPeriodWindow();
  const url = new URL(`${YAHOO_FUNDAMENTALS_URL}/${encodeURIComponent(normalizedSymbol)}`);
  url.searchParams.set("type", FUNDAMENTAL_METRICS.map((metric) => metric.type).join(","));
  url.searchParams.set("period1", String(period1));
  url.searchParams.set("period2", String(period2));

  const response = await fetch(url.toString(), {
    headers: REQUEST_HEADERS,
    cf: { cacheTtl: 21600, cacheEverything: true }
  });
  if (!response.ok) return { headers: [], rows: [], currency: "", unit: "", source: "Yahoo Finance" };

  const payload = await response.json().catch(() => ({}));
  const results = Array.isArray(payload?.timeseries?.result) ? payload.timeseries.result : [];
  const normalized = results.map(normalizeFundamentalResult).filter((item) => item.type);
  const years = [...new Set(normalized.flatMap((item) => Object.keys(item.valuesByYear)))]
    .sort((a, b) => Number(a) - Number(b))
    .slice(-4);
  const currency = normalized.find((item) => item.currency)?.currency || "";
  const rows = FUNDAMENTAL_METRICS.map((metric) => {
    const item = normalized.find((entry) => entry.type === metric.type);
    return [metric.label, ...years.map((year) => formatFundamentalValue(item?.valuesByYear?.[year], currency))];
  }).filter((row) => row.slice(1).some((value) => value !== "-"));

  return {
    headers: ["항목", ...years],
    rows,
    currency,
    unit: normalizeCurrency(currency) === "KRW" ? "억원" : currency ? `백만 ${currency}` : "",
    source: "Yahoo Finance"
  };
}

async function fetchFxRateToKrw(currency, options = {}) {
  const normalizedCurrency = normalizeCurrency(currency);
  if (!normalizedCurrency) return 0;
  if (normalizedCurrency === "KRW") return 1;

  const cached = fxRateCache.get(normalizedCurrency);
  if (!options.noStore && cached && Date.now() - cached.time < 60000) return cached.rate;

  const chart = await fetchYahooChart(`${normalizedCurrency}KRW=X`, { noStore: options.noStore }).catch(() => null);
  const rate = Number(chart?.currentPrice || 0);
  if (!rate) return 0;

  fxRateCache.set(normalizedCurrency, { rate, time: Date.now() });
  return rate;
}

async function enrichWithChart(item, options = {}) {
  const chart = await fetchYahooChart(item.symbol, { noStore: options.noStore })
    || await fetchBinanceChart(item.symbol || item.code, { noStore: options.noStore });
  if (!chart) return item;
  const currency = normalizeCurrency(chart.currency || item.currency);
  const exchangeRateToKrw = await fetchFxRateToKrw(currency, { noStore: options.noStore }).catch(() => 0);
  const currentPriceKrw = chart.currentPrice && exchangeRateToKrw
    ? roundKrwUnitPrice(chart.currentPrice * exchangeRateToKrw)
    : 0;

  return {
    ...item,
    name: item.name || chart.name,
    symbol: chart.symbol || item.symbol,
    type: item.type,
    quoteType: item.quoteType,
    market: item.market || chart.market,
    exchange: item.exchange || chart.exchange,
    logoUrl: item.logoUrl || chart.logoUrl || "",
    currency,
    currentPrice: chart.currentPrice || item.currentPrice || 0,
    currentPriceKrw,
    exchangeRateToKrw,
    change: chart.change || 0,
    changeRate: chart.changeRate || 0,
    source: chart.exchange === "Binance" ? "Binance" : item.source
  };
}

function dedupeResults(results) {
  const seen = new Set();
  const deduped = [];

  for (const result of results) {
    const key = normalizeText(result.symbol || `${result.exchange}:${result.code}:${result.name}`);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(result);
  }

  return deduped;
}

function hasHangul(value) {
  return /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(String(value || ""));
}

function shouldSearchKrx(query) {
  const value = String(query || "").trim();
  return hasHangul(value) || /^\d{2,6}$/.test(value);
}

async function searchMarkets(query, options = {}) {
  const trimmedQuery = String(query || "").trim().slice(0, 80);
  if (trimmedQuery.length < 2) return [];

  const limit = 12;
  const shouldSearchYahoo = !hasHangul(trimmedQuery);
  const shouldSearchDomestic = shouldSearchKrx(trimmedQuery);
  const [krxResults, yahooResults, binanceResults] = await Promise.all([
    shouldSearchDomestic ? searchKrx(trimmedQuery, limit).catch(() => []) : [],
    shouldSearchYahoo ? searchYahoo(trimmedQuery, limit).catch(() => []) : [],
    shouldSearchBinance(trimmedQuery) ? searchBinanceCrypto(trimmedQuery, limit).catch(() => []) : []
  ]);

  const combined = dedupeResults([...krxResults, ...binanceResults, ...yahooResults]).slice(0, limit);
  const enrichedLimit = Math.min(combined.length, binanceResults.length ? 8 : 4);
  const enrichedHead = await Promise.all(combined.slice(0, enrichedLimit).map((item) => enrichWithChart(item, { noStore: options.noStore }).catch(() => item)));
  const enriched = [...enrichedHead, ...combined.slice(enrichedLimit)];
  return enriched.map((item) => ({
    name: item.name,
    code: item.code,
    symbol: item.symbol,
    type: item.type || "",
    quoteType: item.quoteType || "",
    market: item.market,
    exchange: item.exchange,
    industry: item.industry || "",
    logoUrl: item.logoUrl || "",
    currency: item.currency || "",
    currentPrice: Number(item.currentPrice || 0),
    currentPriceKrw: Number(item.currentPriceKrw || 0),
    exchangeRateToKrw: Number(item.exchangeRateToKrw || 0),
    change: Number(item.change || 0),
    changeRate: Number(item.changeRate || 0),
    source: item.source || "Yahoo Finance"
  }));
}

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const action = url.searchParams.get("action") || "search";
    const noStore = url.searchParams.get("refresh") === "1" || url.searchParams.get("noCache") === "1";
    if (!["search", "chart", "news", "fundamentals"].includes(action)) return json({ ok: false, error: "지원하지 않는 시장 데이터 작업입니다." }, 400);

    if (action === "chart") {
      const symbol = String(url.searchParams.get("symbol") || "").trim().slice(0, 80);
      if (!symbol) return json({ ok: false, error: "차트를 불러올 종목 코드가 필요합니다." }, 400);

      const chart = await fetchYahooChart(symbol, {
        range: url.searchParams.get("range") || "6mo",
        interval: url.searchParams.get("interval") || "1d",
        includeCandles: true,
        noStore
      }) || await fetchBinanceChart(symbol, {
        range: url.searchParams.get("range") || "6mo",
        interval: url.searchParams.get("interval") || "1d",
        includeCandles: true,
        noStore
      });
      if (!chart) return json({ ok: false, error: "차트 데이터를 불러오지 못했습니다." }, 404);

      return json({ ok: true, chart }, 200, { noStore });
    }

    if (action === "news") {
      const query = String(url.searchParams.get("q") || "").trim().slice(0, 120);
      const symbol = String(url.searchParams.get("symbol") || "").trim().slice(0, 80);
      if (!query) return json({ ok: true, news: [] });
      const news = await fetchYahooNewsWithFallback(query, { symbol }, 5);
      return json({ ok: true, news });
    }

    if (action === "fundamentals") {
      const symbol = String(url.searchParams.get("symbol") || "").trim().slice(0, 80);
      if (!symbol) return json({ ok: false, error: "재무 데이터를 불러올 종목 코드가 필요합니다." }, 400);
      const fundamentals = await fetchYahooFundamentals(symbol);
      return json({ ok: true, fundamentals });
    }

    const query = url.searchParams.get("q") || "";
    const results = await searchMarkets(query, { noStore });
    return json({ ok: true, results }, 200, { noStore });
  } catch (error) {
    return json({ ok: false, error: error?.message || "종목 검색을 처리하지 못했습니다." }, 500);
  }
}
