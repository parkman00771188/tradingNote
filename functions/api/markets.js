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

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": status === 200 ? "public, max-age=120" : "no-store"
    }
  });
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, "").toLowerCase();
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

async function fetchYahooChart(symbol) {
  if (!symbol) return null;

  const url = `${YAHOO_CHART_URL}/${encodeURIComponent(symbol)}?range=1d&interval=1d`;
  const response = await fetch(url, {
    headers: REQUEST_HEADERS,
    cf: { cacheTtl: 60, cacheEverything: true }
  });
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
    changeRate
  };
}

async function enrichWithChart(item) {
  const chart = await fetchYahooChart(item.symbol);
  if (!chart) return item;

  return {
    ...item,
    name: item.name || chart.name,
    symbol: chart.symbol || item.symbol,
    type: item.type,
    quoteType: item.quoteType,
    market: item.market || chart.market,
    exchange: item.exchange || chart.exchange,
    currency: item.currency || chart.currency,
    currentPrice: chart.currentPrice || item.currentPrice || 0,
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

async function searchMarkets(query) {
  const trimmedQuery = String(query || "").trim().slice(0, 80);
  if (trimmedQuery.length < 2) return [];

  const limit = 12;
  const shouldSearchYahoo = !hasHangul(trimmedQuery);
  const [krxResults, yahooResults] = await Promise.all([
    searchKrx(trimmedQuery, limit).catch(() => []),
    shouldSearchYahoo ? searchYahoo(trimmedQuery, limit).catch(() => []) : []
  ]);

  const combined = dedupeResults([...krxResults, ...yahooResults]).slice(0, limit);
  const enriched = await Promise.all(combined.map((item) => enrichWithChart(item).catch(() => item)));
  return enriched.map((item) => ({
    name: item.name,
    code: item.code,
    symbol: item.symbol,
    type: item.type || "",
    quoteType: item.quoteType || "",
    market: item.market,
    exchange: item.exchange,
    industry: item.industry || "",
    currency: item.currency || "",
    currentPrice: Number(item.currentPrice || 0),
    change: Number(item.change || 0),
    changeRate: Number(item.changeRate || 0),
    source: item.source || "Yahoo Finance"
  }));
}

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const action = url.searchParams.get("action") || "search";
    if (action !== "search") return json({ ok: false, error: "지원하지 않는 시장 데이터 작업입니다." }, 400);

    const query = url.searchParams.get("q") || "";
    const results = await searchMarkets(query);
    return json({ ok: true, results });
  } catch (error) {
    return json({ ok: false, error: error?.message || "종목 검색을 처리하지 못했습니다." }, 500);
  }
}
