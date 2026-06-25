const SESSION_COOKIE_NAME = "tn_session";
const DATA_VERSION = 1;

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers
    }
  });
}

function badRequest(message) {
  return json({ ok: false, error: message }, 400);
}

function unauthorized(message = "로그인이 필요합니다.") {
  return json({ ok: false, error: message }, 401);
}

function serverError(message) {
  return json({ ok: false, error: message }, 500);
}

function getConfig(env) {
  return {
    encryptionKey: env.AUTH_ENCRYPTION_KEY || "",
    sessionSecret: env.AUTH_SESSION_SECRET || env.AUTH_ENCRYPTION_KEY || "",
    db: env.DB
  };
}

function assertConfig(config) {
  if (!config.encryptionKey) throw new Error("AUTH_ENCRYPTION_KEY secret이 필요합니다.");
  if (!config.sessionSecret) throw new Error("AUTH_SESSION_SECRET secret이 필요합니다.");
  if (!config.db) throw new Error("Cloudflare D1 DB 바인딩이 필요합니다.");
}

function base64UrlToBytes(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function bytesToBase64Url(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function importHmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

async function hmacBytes(secret, value) {
  const key = await importHmacKey(secret);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

function timingSafeEqual(left, right) {
  const leftBytes = new TextEncoder().encode(left || "");
  const rightBytes = new TextEncoder().encode(right || "");
  const length = Math.max(leftBytes.length, rightBytes.length);
  let diff = leftBytes.length === rightBytes.length ? 0 : 1;

  for (let index = 0; index < length; index += 1) {
    diff |= (leftBytes[index] || 0) ^ (rightBytes[index] || 0);
  }

  return diff === 0;
}

async function sha256KeyMaterial(secret) {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
}

async function importAesKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    await sha256KeyMaterial(secret),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptJson(value, secret) {
  const key = await importAesKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(value));
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext));

  return {
    v: 1,
    iv: bytesToBase64Url(iv),
    data: bytesToBase64Url(ciphertext)
  };
}

async function decryptJson(record, secret) {
  const key = await importAesKey(secret);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64UrlToBytes(record.iv) },
    key,
    base64UrlToBytes(record.data)
  );
  return JSON.parse(new TextDecoder().decode(plaintext));
}

function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  return cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1) || "";
}

async function readSession(config, request) {
  const token = getCookie(request, SESSION_COOKIE_NAME);
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = bytesToBase64Url(await hmacBytes(config.sessionSecret, payload));
  if (!timingSafeEqual(signature, expectedSignature)) return null;

  const session = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload)));
  const now = Math.floor(Date.now() / 1000);
  if (!session.userKey || !session.exp || session.exp <= now) return null;
  return session;
}

function emptyUserData() {
  return {
    version: DATA_VERSION,
    updatedAt: "",
    assets: {
      cashBalance: 0,
      holdings: []
    },
    trades: [],
    memos: []
  };
}

function sanitizeText(value, maxLength = 120) {
  return String(value || "").trim().slice(0, maxLength);
}

function sanitizeNumber(value) {
  return Math.max(0, Math.round(Number(value) || 0));
}

function sanitizeRate(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Number(number.toFixed(4)) : 0;
}

function sanitizeAssets(input = {}) {
  const holdings = Array.isArray(input.holdings) ? input.holdings.slice(0, 200) : [];

  return {
    version: DATA_VERSION,
    savedAt: sanitizeText(input.savedAt, 40) || new Date().toISOString(),
    cashBalance: sanitizeNumber(input.cashBalance),
    holdings: holdings.map((item) => ({
      name: sanitizeText(item.name, 80),
      code: sanitizeText(item.code, 32),
      quantity: sanitizeNumber(item.quantity),
      averagePrice: sanitizeNumber(item.averagePrice),
      currentPrice: sanitizeNumber(item.currentPrice),
      priceInputMode: item.priceInputMode === "quantity" ? "quantity" : "full",
      amount: sanitizeNumber(item.amount),
      costBasis: sanitizeNumber(item.costBasis),
      profit: Math.round(Number(item.profit) || 0),
      rate: sanitizeRate(item.rate)
    })).filter((item) => item.name && item.quantity > 0)
  };
}

async function requireSession(context) {
  const config = getConfig(context.env);
  assertConfig(config);
  const session = await readSession(config, context.request);
  if (!session) return { error: unauthorized() };
  return { config, session };
}

async function readUserData(config, userKey) {
  const row = await config.db
    .prepare("SELECT data_encrypted FROM user_data WHERE user_key = ?")
    .bind(userKey)
    .first();

  if (!row?.data_encrypted) return emptyUserData();
  const record = JSON.parse(row.data_encrypted);
  return {
    ...emptyUserData(),
    ...(await decryptJson(record, config.encryptionKey))
  };
}

async function saveUserData(config, userKey, data) {
  const nowIso = data.updatedAt || new Date().toISOString();
  const encryptedData = JSON.stringify(await encryptJson(data, config.encryptionKey));

  await config.db
    .prepare(`
      INSERT INTO user_data (user_key, data_encrypted, version, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_key) DO UPDATE SET
        data_encrypted = excluded.data_encrypted,
        version = excluded.version,
        updated_at = excluded.updated_at
    `)
    .bind(userKey, encryptedData, DATA_VERSION, nowIso, nowIso)
    .run();
}

export async function onRequestGet(context) {
  try {
    const sessionResult = await requireSession(context);
    if (sessionResult.error) return sessionResult.error;

    const { config, session } = sessionResult;
    const data = await readUserData(config, session.userKey);
    return json({ ok: true, data });
  } catch (error) {
    return serverError(error?.message || "데이터를 불러오지 못했습니다.");
  }
}

export async function onRequestPost(context) {
  try {
    const sessionResult = await requireSession(context);
    if (sessionResult.error) return sessionResult.error;

    const { config, session } = sessionResult;
    const body = await context.request.json().catch(() => ({}));
    if (body.action !== "save_assets") return badRequest("지원하지 않는 데이터 작업입니다.");

    const currentData = await readUserData(config, session.userKey);
    const nextData = {
      ...currentData,
      version: DATA_VERSION,
      updatedAt: new Date().toISOString(),
      assets: sanitizeAssets(body.assets)
    };

    await saveUserData(config, session.userKey, nextData);
    return json({ ok: true, data: nextData });
  } catch (error) {
    return serverError(error?.message || "데이터를 저장하지 못했습니다.");
  }
}
