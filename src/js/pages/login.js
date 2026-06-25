const loginLogo = "src/resources/assets/brand/tn_lockup_blue.svg";
const googleIdentityScriptUrl = "https://accounts.google.com/gsi/client";
var googleIdentityScriptPromise = null;
var loginMessage = "";
var loginMessageTone = "";
var loginHydrationToken = 0;

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

function setLoginMessage(message, tone = "") {
  loginMessage = message;
  loginMessageTone = tone;
  const node = document.querySelector("[data-login-message]");
  if (!node) return;
  node.textContent = message;
  node.className = `login-message ${tone}`.trim();
}

function loadGoogleIdentityScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (googleIdentityScriptPromise) return googleIdentityScriptPromise;

  googleIdentityScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = googleIdentityScriptUrl;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      googleIdentityScriptPromise = null;
      reject(new Error("Google 로그인 스크립트를 불러오지 못했습니다."));
    };
    document.head.appendChild(script);
  });

  return googleIdentityScriptPromise;
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

async function handleGoogleCredentialResponse(response) {
  if (!response?.credential) {
    setLoginMessage("Google 로그인 응답을 받지 못했습니다. 다시 시도해주세요.", "error");
    return;
  }

  setLoginMessage("Google 계정을 확인하고 있습니다.", "loading");

  try {
    const authResponse = await fetch("/api/auth", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        action: "google",
        credential: response.credential
      })
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

function renderFallbackGoogleButton(disabled = false) {
  return `
    <button class="login-social ${disabled ? "disabled" : ""}" type="button" data-google-login-fallback ${disabled ? "disabled aria-disabled=\"true\"" : ""}>
      ${googleLogo()}
      <strong>Google로 계속하기</strong>
    </button>
  `;
}

async function hydrateLoginPage() {
  const container = document.querySelector("[data-google-login-button]");
  if (!container) return;

  const token = ++loginHydrationToken;
  setLoginMessage("로그인 설정을 확인하고 있습니다.", "loading");

  try {
    const config = await fetchLoginConfig();
    if (token !== loginHydrationToken) return;

    if (!config.googleReady || !config.googleClientId) {
      container.innerHTML = renderFallbackGoogleButton(true);
      setLoginMessage("GOOGLE_CLIENT_ID 환경변수를 설정하면 Google 로그인이 활성화됩니다.", "error");
      return;
    }

    if (!config.authReady) {
      container.innerHTML = renderFallbackGoogleButton(true);
      setLoginMessage("Google 로그인 서버 설정이 아직 완료되지 않았습니다. AUTH_ENCRYPTION_KEY, AUTH_SESSION_SECRET, USERS_KV를 확인해주세요.", "error");
      return;
    }

    await loadGoogleIdentityScript();
    if (token !== loginHydrationToken) return;

    window.google.accounts.id.initialize({
      client_id: config.googleClientId,
      callback: handleGoogleCredentialResponse,
      ux_mode: "popup",
      auto_select: false
    });

    container.innerHTML = "";
    window.google.accounts.id.renderButton(container, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      logo_alignment: "left",
      width: Math.min(420, Math.max(280, container.clientWidth || 360)),
      locale: "ko"
    });
    setLoginMessage("", "");
  } catch (error) {
    container.innerHTML = renderFallbackGoogleButton(true);
    setLoginMessage(
      `${error?.message || "Google 로그인을 준비하지 못했습니다."} 로컬에서는 npx wrangler pages dev로 실행해야 인증 API가 동작합니다.`,
      "error"
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
            <span class="login-provider-icon apple">&#xF8FF;</span>
            <strong>Apple로 계속하기</strong>
          </button>
          <p class="login-message ${loginMessageTone}" data-login-message>${loginMessage}</p>
        </div>
      </section>
    </div>
  `;
}
