const YAHOO_SEARCH_URL = "https://query1.finance.yahoo.com/v1/finance/search";
const YAHOO_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart";
const KRX_CORP_LIST_URL = "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13";

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
    currentPrice: price ? Math.round(price * 100) / 100 : 0,
    change,
    changeRate,
    candles: options.includeCandles ? normalizeYahooCandles(result) : undefined
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
  const chart = await fetchYahooChart(item.symbol, { noStore: options.noStore });
  if (!chart) return item;
  const currency = normalizeCurrency(chart.currency || item.currency);
  const exchangeRateToKrw = await fetchFxRateToKrw(currency, { noStore: options.noStore }).catch(() => 0);
  const currentPriceKrw = chart.currentPrice && exchangeRateToKrw
    ? Math.round(chart.currentPrice * exchangeRateToKrw)
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
    changeRate: chart.changeRate || 0
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
  const [krxResults, yahooResults] = await Promise.all([
    shouldSearchDomestic ? searchKrx(trimmedQuery, limit).catch(() => []) : [],
    shouldSearchYahoo ? searchYahoo(trimmedQuery, limit).catch(() => []) : []
  ]);

  const combined = dedupeResults([...krxResults, ...yahooResults]).slice(0, limit);
  const enrichedLimit = Math.min(combined.length, 4);
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
    if (!["search", "chart", "news"].includes(action)) return json({ ok: false, error: "지원하지 않는 시장 데이터 작업입니다." }, 400);

    if (action === "chart") {
      const symbol = String(url.searchParams.get("symbol") || "").trim().slice(0, 80);
      if (!symbol) return json({ ok: false, error: "차트를 불러올 종목 코드가 필요합니다." }, 400);

      const chart = await fetchYahooChart(symbol, {
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

    const query = url.searchParams.get("q") || "";
    const results = await searchMarkets(query, { noStore });
    return json({ ok: true, results }, 200, { noStore });
  } catch (error) {
    return json({ ok: false, error: error?.message || "종목 검색을 처리하지 못했습니다." }, 500);
  }
}
