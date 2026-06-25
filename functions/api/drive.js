function json(data, status = 410) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

export async function onRequest() {
  return json({
    ok: false,
    error: "Google Drive 저장소는 Cloudflare D1 저장소로 대체되었습니다."
  });
}
