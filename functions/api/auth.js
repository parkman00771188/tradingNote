const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const SESSION_COOKIE_NAME = "tn_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

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

function serverError(message) {
  return json({ ok: false, error: message }, 500);
}

function getAuthConfig(env) {
  return {
    googleClientId: env.GOOGLE_CLIENT_ID || "",
    encryptionKey: env.AUTH_ENCRYPTION_KEY || "",
    sessionSecret: env.AUTH_SESSION_SECRET || env.AUTH_ENCRYPTION_KEY || "",
    hostedDomain: env.GOOGLE_HOSTED_DOMAIN || "",
    usersKv: env.USERS_KV
  };
}

function isAuthConfigured(config) {
  return Boolean(config.googleClientId && config.encryptionKey && config.sessionSecret && config.usersKv);
}

function assertServerConfig(config) {
  if (!config.googleClientId) throw new Error("GOOGLE_CLIENT_ID 환경변수가 필요합니다.");
  if (!config.encryptionKey) throw new Error("AUTH_ENCRYPTION_KEY secret이 필요합니다.");
  if (!config.sessionSecret) throw new Error("AUTH_SESSION_SECRET secret이 필요합니다.");
  if (!config.usersKv) throw new Error("USERS_KV KV 바인딩이 필요합니다.");
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

function decodeJwtPart(value) {
  return JSON.parse(new TextDecoder().decode(base64UrlToBytes(value)));
}

async function importHmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function hmacBytes(secret, value) {
  const key = await importHmacKey(secret);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

async function hmacHex(secret, value) {
  const bytes = await hmacBytes(secret, value);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
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
  const iv = base64UrlToBytes(record.iv);
  const ciphertext = base64UrlToBytes(record.data);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return JSON.parse(new TextDecoder().decode(plaintext));
}

async function getGoogleJwks() {
  const request = new Request(GOOGLE_JWKS_URL, {
    headers: { Accept: "application/json" }
  });
  const cache = typeof caches !== "undefined" ? caches.default : null;
  let response = cache ? await cache.match(request) : null;

  if (!response) {
    response = await fetch(request);
    if (!response.ok) throw new Error("Google 공개키를 가져오지 못했습니다.");
    if (cache) await cache.put(request, response.clone());
  }

  return response.json();
}

async function verifyGoogleIdToken(idToken, config) {
  const parts = String(idToken || "").split(".");
  if (parts.length !== 3) throw new Error("Google ID 토큰 형식이 올바르지 않습니다.");

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = decodeJwtPart(encodedHeader);
  const payload = decodeJwtPart(encodedPayload);

  if (header.alg !== "RS256") throw new Error("지원하지 않는 Google ID 토큰 서명 방식입니다.");

  const jwks = await getGoogleJwks();
  const jwk = jwks.keys?.find((key) => key.kid === header.kid && key.kty === "RSA");
  if (!jwk) throw new Error("Google ID 토큰 공개키를 찾지 못했습니다.");

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const validSignature = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    base64UrlToBytes(encodedSignature),
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
  );

  if (!validSignature) throw new Error("Google ID 토큰 서명이 유효하지 않습니다.");

  const now = Math.floor(Date.now() / 1000);
  const audience = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!["https://accounts.google.com", "accounts.google.com"].includes(payload.iss)) {
    throw new Error("Google ID 토큰 발급자가 올바르지 않습니다.");
  }
  if (!audience.includes(config.googleClientId)) {
    throw new Error("Google ID 토큰 대상 앱이 현재 앱과 일치하지 않습니다.");
  }
  if (!payload.exp || payload.exp <= now) {
    throw new Error("Google ID 토큰이 만료되었습니다.");
  }
  if (payload.nbf && payload.nbf > now + 60) {
    throw new Error("Google ID 토큰이 아직 유효하지 않습니다.");
  }
  if (payload.email_verified !== true && payload.email_verified !== "true") {
    throw new Error("Google에서 이메일 소유가 확인된 계정만 사용할 수 있습니다.");
  }
  if (config.hostedDomain && payload.hd !== config.hostedDomain) {
    throw new Error("허용된 Google Workspace 도메인의 계정만 로그인할 수 있습니다.");
  }

  return payload;
}

async function getUserKey(config, googleSub) {
  const hash = await hmacHex(config.sessionSecret, `google:${googleSub}`);
  return `user:${hash}`;
}

function publicUser(user) {
  return {
    name: user.name || "",
    email: user.email || "",
    picture: user.picture || "",
    provider: user.provider || "google"
  };
}

async function createSessionCookie(config, request, userKey) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const payload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({ userKey, exp: expiresAt })));
  const signature = bytesToBase64Url(await hmacBytes(config.sessionSecret, payload));
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";

  return `${SESSION_COOKIE_NAME}=${payload}.${signature}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}${secure}`;
}

function expiredSessionCookie() {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
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

async function handleConfig(context) {
  const config = getAuthConfig(context.env);
  return json({
    ok: true,
    googleClientId: config.googleClientId,
    googleReady: Boolean(config.googleClientId),
    authReady: isAuthConfigured(config)
  });
}

async function handleGoogleLogin(context) {
  const config = getAuthConfig(context.env);
  assertServerConfig(config);

  const body = await context.request.json().catch(() => ({}));
  if (body.action !== "google") return badRequest("지원하지 않는 인증 요청입니다.");
  if (!body.credential) return badRequest("Google ID 토큰이 필요합니다.");

  const googleUser = await verifyGoogleIdToken(body.credential, config);
  const userKey = await getUserKey(config, googleUser.sub);
  const existingRecord = await config.usersKv.get(userKey, "json");
  const existingUser = existingRecord ? await decryptJson(existingRecord, config.encryptionKey) : null;
  const nowIso = new Date().toISOString();
  const user = {
    provider: "google",
    googleSub: googleUser.sub,
    email: googleUser.email || "",
    emailVerified: googleUser.email_verified === true || googleUser.email_verified === "true",
    name: googleUser.name || "",
    picture: googleUser.picture || "",
    locale: googleUser.locale || "",
    hostedDomain: googleUser.hd || "",
    createdAt: existingUser?.createdAt || nowIso,
    lastLoginAt: nowIso
  };

  await config.usersKv.put(userKey, JSON.stringify(await encryptJson(user, config.encryptionKey)));

  return json(
    {
      ok: true,
      registered: true,
      isNewUser: !existingRecord,
      user: publicUser(user)
    },
    200,
    {
      "Set-Cookie": await createSessionCookie(config, context.request, userKey)
    }
  );
}

async function handleSession(context) {
  const config = getAuthConfig(context.env);
  if (!isAuthConfigured(config)) {
    return json(
      { ok: true, authenticated: false, registered: false, authReady: false },
      200,
      { "Set-Cookie": expiredSessionCookie() }
    );
  }

  const session = await readSession(config, context.request);
  if (!session) return json({ ok: true, authenticated: false, registered: false });

  const record = await config.usersKv.get(session.userKey, "json");
  if (!record) {
    return json(
      { ok: true, authenticated: false, registered: false },
      200,
      { "Set-Cookie": expiredSessionCookie() }
    );
  }

  const user = await decryptJson(record, config.encryptionKey);
  return json({
    ok: true,
    authenticated: true,
    registered: true,
    user: publicUser(user)
  });
}

async function handleLogout() {
  return json(
    { ok: true },
    200,
    {
      "Set-Cookie": expiredSessionCookie()
    }
  );
}

export async function onRequest(context) {
  try {
    const url = new URL(context.request.url);
    const action = url.searchParams.get("action");

    if (context.request.method === "GET" && action === "config") return handleConfig(context);
    if (context.request.method === "GET" && action === "session") return handleSession(context);

    if (context.request.method === "POST") {
      const body = await context.request.clone().json().catch(() => ({}));
      if (body.action === "google") return handleGoogleLogin(context);
      if (body.action === "logout") return handleLogout(context);
    }

    return badRequest("지원하지 않는 인증 요청입니다.");
  } catch (error) {
    return serverError(error?.message || "인증 처리 중 오류가 발생했습니다.");
  }
}
