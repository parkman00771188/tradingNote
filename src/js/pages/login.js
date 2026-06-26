const loginLogo = "src/resources/assets/brand/tn_lockup_blue.svg";
const googleIdentityScriptUrl = "https://accounts.google.com/gsi/client";
var googleIdentityScriptPromise = null;
var googleTokenClient = null;
var loginMessage = "";
var loginMessageTone = "";
var loginHydrationToken = 0;
var loginGoogleClientId = "";
var loginGoogleRedirectUrl = "";
var loginGoogleRedirectHandled = false;
const googleOAuthStateKey = "trading-note-google-oauth-state";

function googleLogo() {
  return `
    <svg class="login-provider-icon" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5Z"/>
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.6 8.4 6.3 14.7Z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.8l-6.5 5C9.5 39.6 16.2 44 24 44Z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C36.9 39.1 44 34 44 24c0-1.3-.1-2.4-.4-3.5Z"/>
    </svg>
  `;
}

function appleLogo() {
  return `
    <svg class="login-provider-icon apple" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M17.05 12.38c-.03-2.02 1.66-2.99 1.73-3.04-.94-1.37-2.4-1.56-2.92-1.58-1.24-.13-2.43.73-3.06.73-.63 0-1.6-.71-2.63-.69-1.35.02-2.6.79-3.29 2-1.4 2.43-.36 6.03 1 8 .67.97 1.47 2.06 2.52 2.02 1.01-.04 1.39-.65 2.61-.65 1.22 0 1.56.65 2.63.63 1.09-.02 1.78-.99 2.44-1.96.77-1.12 1.08-2.2 1.1-2.26-.02-.01-2.11-.81-2.13-3.2ZM15.05 6.45c.55-.67.93-1.6.82-2.53-.8.03-1.77.53-2.35 1.2-.51.59-.97 1.54-.85 2.45.89.07 1.81-.45 2.38-1.12Z"/>
    </svg>
  `;
}

function setLoginMessage(message, tone = "") {
  loginMessage = message;
  loginMessageTone = tone;
  const node = document.querySelector("[data-login-message]");
  if (!node) return;
  node.textContent = message;
  node.className = `login-message ${tone}`.trim();
}

function loadGoogleIdentityScript() {
  if (window.google?.accounts?.id && window.google?.accounts?.oauth2) return Promise.resolve();
  if (googleIdentityScriptPromise) return googleIdentityScriptPromise;

  googleIdentityScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    let settled = false;
    const failTimer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      googleIdentityScriptPromise = null;
      script.remove();
      reject(new Error("Google 인증 준비가 지연되고 있습니다."));
    }, 7000);

    script.src = googleIdentityScriptUrl;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(failTimer);
      resolve();
    };
    script.onerror = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(failTimer);
      googleIdentityScriptPromise = null;
      script.remove();
      reject(new Error("Google 인증 준비가 지연되고 있습니다."));
    };
    document.head.appendChild(script);
  });

  return googleIdentityScriptPromise;
}

function getGoogleOAuthState() {
  const bytes = new Uint8Array(16);
  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
    return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getGoogleRedirectLoginUrl(clientId) {
  if (!clientId || window.location.protocol !== "https:") return "";
  const state = getGoogleOAuthState();
  try {
    sessionStorage.setItem(googleOAuthStateKey, state);
  } catch (error) {
    console.warn("Google OAuth state could not be stored.", error);
  }

  const redirectUri = `${window.location.origin}${window.location.pathname}`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "token",
    scope: "openid email profile",
    prompt: "select_account",
    include_granted_scopes: "true",
    state
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

function consumeGoogleOAuthRedirect() {
  if (loginGoogleRedirectHandled) return null;
  const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
  if (!hash || (!hash.includes("access_token=") && !hash.includes("error="))) return null;

  loginGoogleRedirectHandled = true;
  const params = new URLSearchParams(hash);
  const state = params.get("state") || "";
  let storedState = "";
  try {
    storedState = sessionStorage.getItem(googleOAuthStateKey) || "";
    sessionStorage.removeItem(googleOAuthStateKey);
  } catch (error) {
    console.warn("Google OAuth state could not be read.", error);
  }

  window.history.replaceState(null, "", `${window.location.origin}${window.location.pathname}${window.location.search}#login`);

  if (storedState && state && storedState !== state) {
    return { error: "Google 로그인 요청을 확인하지 못했습니다. 다시 시도해주세요." };
  }

  if (params.get("error")) {
    return { error: params.get("error_description") || "Google 계정 선택이 취소되었습니다." };
  }

  return { accessToken: params.get("access_token") || "" };
}

function getProductionLoginUrl() {
  const host = window.location.hostname;
  const isPagesPreview = host.endsWith(".tradingnote.pages.dev") && host !== "tradingnote.pages.dev";
  if (!isPagesPreview) return "";
  return "https://tradingnote.pages.dev/#login";
}

async function fetchLoginConfig() {
  const response = await fetch("/api/auth?action=config", {
    credentials: "include",
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error("Cloudflare Pages Functions에서 인증 설정을 읽지 못했습니다.");
  }

  return response.json();
}

async function completeGoogleLogin(payload) {
  setLoginMessage("Google 계정을 확인하고 있습니다.", "loading");

  try {
    const authResponse = await fetch("/api/auth", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });
    const authResult = await authResponse.json().catch(() => ({}));

    if (!authResponse.ok || !authResult.ok || !authResult.registered) {
      throw new Error(authResult.error || "Google 로그인에 실패했습니다.");
    }

    if (typeof setAuthenticatedUser === "function") {
      setAuthenticatedUser(authResult.user);
    }
    setLoginMessage("로그인되었습니다. 대시보드로 이동합니다.", "success");
    window.location.hash = "dashboard";
  } catch (error) {
    setLoginMessage(error?.message || "Google 로그인 중 오류가 발생했습니다.", "error");
  }
}

async function handleGoogleCredentialResponse(response) {
  if (!response?.credential) {
    setLoginMessage("Google 로그인 응답을 받지 못했습니다. 다시 시도해주세요.", "error");
    return;
  }

  await completeGoogleLogin({
    action: "google",
    credential: response.credential
  });
}

async function handleGoogleTokenResponse(response) {
  if (response?.error) {
    setLoginMessage(response.error_description || "Google 계정 선택이 취소되었습니다.", "error");
    return;
  }
  if (!response?.access_token) {
    setLoginMessage("Google 계정 선택 응답을 받지 못했습니다. 다시 시도해주세요.", "error");
    return;
  }

  await completeGoogleLogin({
    action: "google_access_token",
    accessToken: response.access_token
  });
}

function renderFallbackGoogleButton(disabled = false) {
  return `
    <button class="login-social ${disabled ? "disabled" : ""}" type="button" data-google-login-fallback ${disabled ? "disabled aria-disabled=\"true\"" : ""}>
      ${googleLogo()}
      <strong>Google로 계속하기</strong>
    </button>
  `;
}

function bindGoogleLoginButton(container) {
  const button = container.querySelector("[data-google-login-fallback]");
  if (!button || button.disabled) return;

  button.addEventListener("click", () => {
    if (googleTokenClient) {
      setLoginMessage("Google 계정을 선택해주세요.", "loading");
      googleTokenClient.requestAccessToken({ prompt: "select_account" });
      return;
    }

    if (loginGoogleRedirectUrl) {
      setLoginMessage("Google 로그인 화면으로 이동합니다.", "loading");
      window.location.assign(loginGoogleRedirectUrl);
      return;
    }

    setLoginMessage("Google 로그인을 준비하고 있습니다. 잠시 후 다시 눌러주세요.", "loading");
    hydrateLoginPage();
  });
}

async function hydrateLoginPage() {
  const container = document.querySelector("[data-google-login-button]");
  if (!container) return;

  const redirectResult = consumeGoogleOAuthRedirect();
  if (redirectResult) {
    container.innerHTML = renderFallbackGoogleButton(true);
    if (redirectResult.accessToken) {
      await completeGoogleLogin({
        action: "google_access_token",
        accessToken: redirectResult.accessToken
      });
    } else {
      setLoginMessage(redirectResult.error || "Google 로그인 응답을 확인하지 못했습니다.", "error");
    }
    return;
  }

  const productionLoginUrl = getProductionLoginUrl();
  if (productionLoginUrl) {
    container.innerHTML = renderFallbackGoogleButton(true);
    setLoginMessage("Google 로그인은 정식 배포 주소에서 진행합니다. 이동합니다.", "loading");
    window.location.replace(productionLoginUrl);
    return;
  }

  const token = ++loginHydrationToken;
  setLoginMessage("로그인 설정을 확인하고 있습니다.", "loading");

  try {
    const config = await fetchLoginConfig();
    if (token !== loginHydrationToken) return;
    loginGoogleClientId = config.googleClientId || "";
    loginGoogleRedirectUrl = getGoogleRedirectLoginUrl(loginGoogleClientId);

    if (!config.googleReady || !config.googleClientId) {
      container.innerHTML = renderFallbackGoogleButton(true);
      setLoginMessage("GOOGLE_CLIENT_ID 환경변수를 설정하면 Google 로그인이 활성화됩니다.", "error");
      return;
    }

    if (!config.authReady) {
      container.innerHTML = renderFallbackGoogleButton(true);
      setLoginMessage("Google 로그인 서버 설정이 아직 완료되지 않았습니다. AUTH_ENCRYPTION_KEY, AUTH_SESSION_SECRET, D1 DB 바인딩을 확인해주세요.", "error");
      return;
    }

    await loadGoogleIdentityScript();
    if (token !== loginHydrationToken) return;

    window.google.accounts.id.initialize({
      client_id: config.googleClientId,
      callback: handleGoogleCredentialResponse,
      ux_mode: "popup",
      auto_select: false,
      use_fedcm_for_button: false,
      button_auto_select: false
    });

    googleTokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: config.googleClientId,
      scope: "openid email profile",
      prompt: "select_account",
      callback: handleGoogleTokenResponse,
      error_callback: () => {
        setLoginMessage("Google 계정 선택이 취소되었습니다.", "error");
      }
    });

    container.innerHTML = renderFallbackGoogleButton(false);
    bindGoogleLoginButton(container);
    setLoginMessage("", "");
  } catch (error) {
    googleTokenClient = null;
    if (loginGoogleRedirectUrl) {
      container.innerHTML = renderFallbackGoogleButton(false);
      bindGoogleLoginButton(container);
      setLoginMessage("", "");
      return;
    }

    container.innerHTML = renderFallbackGoogleButton(false);
    bindGoogleLoginButton(container);
    const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    setLoginMessage(
      isLocal
        ? "로컬에서는 npx wrangler pages dev로 실행하면 Google 로그인을 확인할 수 있습니다."
        : "Google 로그인을 다시 눌러주세요.",
      isLocal ? "loading" : ""
    );
  }
}

function renderLogin() {
  return `
    <div class="login-page">
      <section class="login-card" aria-labelledby="loginTitle">
        <img class="login-logo" src="${loginLogo}" alt="Trading Note">
        <div class="login-heading">
          <h1 id="loginTitle">간편 로그인</h1>
          <p>Trading Note에 오신 것을 환영합니다.<br>소셜 계정으로 빠르고 안전하게 로그인하세요.</p>
        </div>

        <div class="login-form">
          <div class="login-google-shell" data-google-login-button>
            ${renderFallbackGoogleButton(true)}
          </div>
          <button class="login-social disabled" type="button" disabled aria-disabled="true">
            ${appleLogo()}
            <strong>Apple로 계속하기</strong>
          </button>
          <p class="login-message ${loginMessageTone}" data-login-message>${loginMessage}</p>
        </div>
      </section>
    </div>
  `;
}
