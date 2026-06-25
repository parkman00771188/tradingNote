const SESSION_COOKIE_NAME = "tn_session";
const GOOGLE_TOKENINFO_URL = "https://www.googleapis.com/oauth2/v3/tokeninfo";
const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_BASE = "https://www.googleapis.com/upload/drive/v3";
const DRIVE_FOLDER_MIME = "application/vnd.google-apps.folder";
const DRIVE_FILE_SCOPE = "https://www.googleapis.com/auth/drive.file";

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
    googleClientId: env.GOOGLE_CLIENT_ID || "",
    encryptionKey: env.AUTH_ENCRYPTION_KEY || "",
    sessionSecret: env.AUTH_SESSION_SECRET || env.AUTH_ENCRYPTION_KEY || "",
    usersKv: env.USERS_KV
  };
}

function assertConfig(config) {
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

function driveStorageKey(userKey) {
  return `drive:${userKey}`;
}

function publicDriveConfig(record) {
  if (!record) return null;
  return {
    connected: true,
    folderId: record.folderId || "",
    folderName: record.folderName || "TradingNote",
    webViewLink: record.webViewLink || "",
    connectedAt: record.connectedAt || "",
    updatedAt: record.updatedAt || "",
    folders: record.folders || {},
    files: record.files || {}
  };
}

async function getUserRecord(config, userKey) {
  const record = await config.usersKv.get(userKey, "json");
  return record ? decryptJson(record, config.encryptionKey) : null;
}

async function getDriveRecord(config, userKey) {
  const record = await config.usersKv.get(driveStorageKey(userKey), "json");
  return record ? decryptJson(record, config.encryptionKey) : null;
}

async function saveDriveRecord(config, userKey, record) {
  await config.usersKv.put(driveStorageKey(userKey), JSON.stringify(await encryptJson(record, config.encryptionKey)));
}

async function requireSession(context) {
  const config = getConfig(context.env);
  assertConfig(config);
  const session = await readSession(config, context.request);
  if (!session) return { error: unauthorized() };

  const user = await getUserRecord(config, session.userKey);
  if (!user?.googleSub) return { error: unauthorized("가입된 Google 계정을 확인하지 못했습니다.") };

  return { config, session, user };
}

async function verifyDriveAccessToken(accessToken, config, user) {
  if (!accessToken) throw new Error("Google Drive 액세스 토큰이 필요합니다.");

  const response = await fetch(`${GOOGLE_TOKENINFO_URL}?access_token=${encodeURIComponent(accessToken)}`, {
    headers: { Accept: "application/json" }
  });
  const tokenInfo = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(getFriendlyDriveError(response.status, tokenInfo.error_description || tokenInfo.error || "Google Drive token verification failed."));
  }
  if (tokenInfo.aud !== config.googleClientId) {
    throw new Error("Google Drive 권한 토큰 대상 앱이 현재 앱과 일치하지 않습니다.");
  }
  if (Number(tokenInfo.expires_in || 0) <= 0) {
    throw new Error("Google Drive 권한 토큰이 만료되었습니다.");
  }

  const tokenSub = tokenInfo.sub || tokenInfo.user_id || "";
  if (tokenSub && tokenSub !== user.googleSub) {
    throw new Error("현재 로그인 계정과 Drive 권한을 허용한 Google 계정이 다릅니다.");
  }
  if (!tokenSub && tokenInfo.email && user.email && tokenInfo.email !== user.email) {
    throw new Error("현재 로그인 계정과 Drive 권한을 허용한 Google 계정이 다릅니다.");
  }

  const scopes = String(tokenInfo.scope || "").split(/\s+/);
  if (!scopes.includes(DRIVE_FILE_SCOPE)) {
    throw new Error("Google Drive 파일 생성 권한이 필요합니다.");
  }

  return tokenInfo;
}

async function driveFetch(accessToken, url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    data = {};
  }
  if (!response.ok) {
    throw new Error(getFriendlyDriveError(response.status, data.error?.message || data.error_description || "Google Drive request failed."));
  }
  return data;
}

function getFriendlyDriveError(status, message) {
  const text = String(message || "");
  const lower = text.toLowerCase();

  if (lower.includes("has not been used") || lower.includes("disabled")) {
    return "Google Cloud Console에서 Google Drive API가 활성화되어 있지 않습니다. '사용 설정된 API 및 서비스'에서 Google Drive API를 사용 설정한 뒤 다시 시도하세요.";
  }
  if (lower.includes("insufficient authentication scopes") || lower.includes("insufficient permission")) {
    return "Google Drive 권한 범위가 부족합니다. OAuth 동의 화면의 데이터 액세스에 https://www.googleapis.com/auth/drive.file scope를 추가한 뒤 다시 연결하세요.";
  }
  if (status === 403) {
    return `Google Drive 접근 권한이 거부되었습니다. Drive API 사용 설정과 OAuth 테스트 사용자/Scope 설정을 확인하세요. 상세: ${text}`;
  }
  if (status === 401) {
    return "Google Drive 권한 토큰이 만료되었거나 유효하지 않습니다. Drive 연결 버튼을 눌러 다시 권한을 허용하세요.";
  }

  return text || "Google Drive 요청에 실패했습니다.";
}

function escapeDriveQueryValue(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

async function findChildByName(accessToken, parentId, name, mimeType = "") {
  const queryParts = [
    `'${escapeDriveQueryValue(parentId)}' in parents`,
    `name='${escapeDriveQueryValue(name)}'`,
    "trashed=false"
  ];
  if (mimeType) queryParts.push(`mimeType='${escapeDriveQueryValue(mimeType)}'`);

  const params = new URLSearchParams({
    q: queryParts.join(" and "),
    fields: "files(id,name,mimeType,webViewLink,capabilities,modifiedTime)",
    spaces: "drive",
    pageSize: "1",
    supportsAllDrives: "true"
  });

  const data = await driveFetch(accessToken, `${DRIVE_API_BASE}/files?${params}`);
  return data.files?.[0] || null;
}

async function findRootFolder(accessToken) {
  const params = new URLSearchParams({
    q: `name='TradingNote' and mimeType='${DRIVE_FOLDER_MIME}' and trashed=false`,
    fields: "files(id,name,mimeType,webViewLink,capabilities,modifiedTime)",
    spaces: "drive",
    pageSize: "1",
    supportsAllDrives: "true"
  });

  const data = await driveFetch(accessToken, `${DRIVE_API_BASE}/files?${params}`);
  return data.files?.[0] || null;
}

async function createFolder(accessToken, name, parentId = "") {
  return driveFetch(accessToken, `${DRIVE_API_BASE}/files?fields=id,name,mimeType,webViewLink,capabilities,modifiedTime&supportsAllDrives=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      name,
      mimeType: DRIVE_FOLDER_MIME,
      ...(parentId ? { parents: [parentId] } : {})
    })
  });
}

async function ensureFolder(accessToken, name, parentId = "") {
  const found = parentId ? await findChildByName(accessToken, parentId, name, DRIVE_FOLDER_MIME) : await findRootFolder(accessToken);
  return found || createFolder(accessToken, name, parentId);
}

function csvCell(value) {
  const text = value == null ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function buildCsv(headers, rows) {
  return `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}

function buildHoldingsCsv(snapshot = {}) {
  const headers = ["종목명", "종목코드", "보유수량", "매수평균가", "현재가", "입력방식", "평가금액", "매수금액", "평가손익", "수익률"];
  const rows = (snapshot.holdings || []).map((item) => [
    item.name,
    item.code,
    item.quantity,
    item.averagePrice,
    item.currentPrice,
    item.priceInputMode || "full",
    item.amount,
    item.costBasis,
    item.profit,
    item.rate
  ]);
  return buildCsv(headers, rows);
}

function buildCashCsv(snapshot = {}) {
  return buildCsv(["저장일시", "현금잔고"], [[new Date().toISOString(), snapshot.cashBalance || 0]]);
}

function getDefaultFiles(snapshot = {}) {
  return [
    { key: "holdings", name: "holdings.csv", parentKey: "assets", mimeType: "text/csv", content: buildHoldingsCsv(snapshot) },
    { key: "cash", name: "cash.csv", parentKey: "assets", mimeType: "text/csv", content: buildCashCsv(snapshot) },
    { key: "trades", name: "trades.csv", parentKey: "journal", mimeType: "text/csv", content: buildCsv(["일자", "종목명", "구분", "수량", "체결가", "손익", "수익률", "메모"], []) },
    { key: "memos", name: "memos.json", parentKey: "memo", mimeType: "application/json", content: "[]\n" },
    { key: "preferences", name: "preferences.json", parentKey: "settings", mimeType: "application/json", content: "{}\n" }
  ];
}

async function createMultipartFile(accessToken, metadata, content, mimeType) {
  const boundary = `tradingnote_${crypto.randomUUID()}`;
  const body = [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    JSON.stringify(metadata),
    `--${boundary}`,
    `Content-Type: ${mimeType}; charset=UTF-8`,
    "",
    content,
    `--${boundary}--`,
    ""
  ].join("\r\n");

  return driveFetch(accessToken, `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,modifiedTime&supportsAllDrives=true`, {
    method: "POST",
    headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
    body
  });
}

async function updateFileContent(accessToken, fileId, content, mimeType) {
  return driveFetch(accessToken, `${DRIVE_UPLOAD_BASE}/files/${encodeURIComponent(fileId)}?uploadType=media&fields=id,name,modifiedTime&supportsAllDrives=true`, {
    method: "PATCH",
    headers: { "Content-Type": `${mimeType}; charset=UTF-8` },
    body: content
  });
}

async function ensureFile(accessToken, fileSpec, folders) {
  const parentId = folders[fileSpec.parentKey]?.id;
  if (!parentId) throw new Error(`${fileSpec.parentKey} 폴더를 찾지 못했습니다.`);

  const found = await findChildByName(accessToken, parentId, fileSpec.name);
  if (found) return found;

  return createMultipartFile(
    accessToken,
    { name: fileSpec.name, parents: [parentId], mimeType: fileSpec.mimeType },
    fileSpec.content,
    fileSpec.mimeType
  );
}

async function upsertManifest(accessToken, root, folders, files) {
  const content = `${JSON.stringify({
    app: "TradingNote",
    version: 1,
    updatedAt: new Date().toISOString(),
    root: { id: root.id, name: root.name },
    folders,
    files
  }, null, 2)}\n`;
  const existing = await findChildByName(accessToken, root.id, "manifest.json");
  if (existing) {
    await updateFileContent(accessToken, existing.id, content, "application/json");
    return { ...existing, id: existing.id, name: "manifest.json" };
  }
  return createMultipartFile(
    accessToken,
    { name: "manifest.json", parents: [root.id], mimeType: "application/json" },
    content,
    "application/json"
  );
}

async function ensureDriveTree(accessToken, snapshot = {}) {
  const root = await ensureFolder(accessToken, "TradingNote");
  const capabilities = root.capabilities || {};
  if (capabilities.canAddChildren === false || capabilities.canEdit === false) {
    throw new Error("TradingNote 폴더에 파일을 만들 권한이 없습니다.");
  }

  const folders = {};
  for (const key of ["assets", "journal", "memo", "settings"]) {
    const folder = await ensureFolder(accessToken, key, root.id);
    folders[key] = {
      id: folder.id,
      name: folder.name,
      webViewLink: folder.webViewLink || ""
    };
  }

  const files = {};
  for (const fileSpec of getDefaultFiles(snapshot)) {
    const file = await ensureFile(accessToken, fileSpec, folders);
    files[fileSpec.key] = {
      id: file.id,
      name: file.name,
      webViewLink: file.webViewLink || "",
      mimeType: file.mimeType || fileSpec.mimeType
    };
  }

  const manifest = await upsertManifest(accessToken, root, folders, files);
  files.manifest = {
    id: manifest.id,
    name: "manifest.json",
    webViewLink: manifest.webViewLink || "",
    mimeType: "application/json"
  };

  return {
    root,
    folders,
    files
  };
}

async function saveAssetSnapshot(accessToken, driveRecord, snapshot) {
  const files = driveRecord.files || {};
  if (files.holdings?.id) {
    await updateFileContent(accessToken, files.holdings.id, buildHoldingsCsv(snapshot), "text/csv");
  }
  if (files.cash?.id) {
    await updateFileContent(accessToken, files.cash.id, buildCashCsv(snapshot), "text/csv");
  }
}

async function handleStatus(context) {
  const sessionContext = await requireSession(context);
  if (sessionContext.error) return sessionContext.error;

  const record = await getDriveRecord(sessionContext.config, sessionContext.session.userKey);
  return json({ ok: true, drive: publicDriveConfig(record) });
}

async function handleConnect(context) {
  const sessionContext = await requireSession(context);
  if (sessionContext.error) return sessionContext.error;

  const body = await context.request.json().catch(() => ({}));
  await verifyDriveAccessToken(body.accessToken, sessionContext.config, sessionContext.user);

  const snapshot = body.snapshot && typeof body.snapshot === "object" ? body.snapshot : {};
  const tree = await ensureDriveTree(body.accessToken, snapshot);
  const nowIso = new Date().toISOString();
  const record = {
    provider: "google-drive",
    folderId: tree.root.id,
    folderName: tree.root.name,
    webViewLink: tree.root.webViewLink || "",
    connectedAt: nowIso,
    updatedAt: nowIso,
    folders: tree.folders,
    files: tree.files
  };

  await saveDriveRecord(sessionContext.config, sessionContext.session.userKey, record);
  return json({ ok: true, drive: publicDriveConfig(record) });
}

async function handleSaveAssets(context) {
  const sessionContext = await requireSession(context);
  if (sessionContext.error) return sessionContext.error;

  const body = await context.request.json().catch(() => ({}));
  await verifyDriveAccessToken(body.accessToken, sessionContext.config, sessionContext.user);

  const record = await getDriveRecord(sessionContext.config, sessionContext.session.userKey);
  if (!record) return badRequest("Google Drive가 아직 연결되지 않았습니다.");

  await saveAssetSnapshot(body.accessToken, record, body.snapshot || {});
  const updatedRecord = {
    ...record,
    updatedAt: new Date().toISOString()
  };
  await saveDriveRecord(sessionContext.config, sessionContext.session.userKey, updatedRecord);
  return json({ ok: true, drive: publicDriveConfig(updatedRecord) });
}

async function handleDisconnect(context) {
  const sessionContext = await requireSession(context);
  if (sessionContext.error) return sessionContext.error;

  await sessionContext.config.usersKv.delete(driveStorageKey(sessionContext.session.userKey));
  return json({ ok: true, drive: null });
}

export async function onRequest(context) {
  try {
    const url = new URL(context.request.url);
    const action = url.searchParams.get("action");

    if (context.request.method === "GET" && action === "status") return await handleStatus(context);

    if (context.request.method === "POST") {
      const body = await context.request.clone().json().catch(() => ({}));
      if (body.action === "connect") return await handleConnect(context);
      if (body.action === "save_assets") return await handleSaveAssets(context);
      if (body.action === "disconnect") return await handleDisconnect(context);
    }

    return badRequest("지원하지 않는 Google Drive 요청입니다.");
  } catch (error) {
    return serverError(error?.message || "Google Drive 처리 중 오류가 발생했습니다.");
  }
}
