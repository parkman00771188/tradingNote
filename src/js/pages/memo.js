function normalizeMemoItem(item, index) {
  if (Array.isArray(item)) {
    const [date, title, tags, body, profit] = item;
    return { date, title, tags: tags || [], body, profit };
  }

  return {
    date: item?.date || item?.createdAt || `Memo ${index + 1}`,
    title: item?.title || "제목 없는 메모",
    tags: Array.isArray(item?.tags) ? item.tags : [],
    body: item?.body || item?.content || "",
    profit: item?.profit || ""
  };
}

function renderMemoEmptyState() {
  return `
    <article class="panel empty-state memo-empty-state">
      <span class="status-icon">${icon("memo")}</span>
      <div>
        <strong>저장된 메모가 없습니다.</strong>
        <p>메모를 작성하면 이 계정의 데이터로 저장되고 여기에 표시됩니다.</p>
      </div>
      <button class="btn primary" type="button">${icon("plus")}메모 작성</button>
    </article>
  `;
}

function renderMemoCard(note, index) {
  const title = escapeHtml(note.title);
  const body = escapeHtml(note.body || "내용이 없습니다.");
  const date = escapeHtml(note.date);
  const tags = note.tags.length
    ? note.tags.map((item) => tag(escapeHtml(item), toneForTag(item))).join("")
    : tag("메모", "blue");
  const profit = String(note.profit || "");
  const profitClass = profit.startsWith("+") ? "text-red" : profit.startsWith("-") ? "text-blue" : "";

  return `
    <article class="note-card ${index === 0 ? "active" : ""}">
      <div class="note-head">
        <span class="tiny">${date}</span>
        <button class="menu-dots" type="button">${icon("more")}</button>
      </div>
      <h3 class="note-title">${title}</h3>
      <div class="tag-cloud">${tags}</div>
      <p class="note-text">${body}</p>
      ${profit ? `<p>손익 <span class="${profitClass}">${escapeHtml(profit)}</span></p>` : ""}
    </article>
  `;
}

function renderMemoDetail(note) {
  const tags = note.tags.length
    ? note.tags.map((item) => tag(escapeHtml(item), toneForTag(item))).join("")
    : tag("메모", "blue");

  return `
    <article class="panel">
      <div class="panel-header">
        <div>
          <p class="tiny">${escapeHtml(note.date)}</p>
          <h2 class="panel-title">${escapeHtml(note.title)}</h2>
        </div>
        <button class="menu-dots" type="button">${icon("more")}</button>
      </div>
      <div class="panel-header tight">
        <div class="tag-cloud">${tags}</div>
        ${note.profit ? `<strong>손익 <span class="${String(note.profit).startsWith("+") ? "text-red" : "text-blue"}">${escapeHtml(note.profit)}</span></strong>` : ""}
      </div>
      <div class="note-detail-body">
        <p>${escapeHtml(note.body || "내용이 없습니다.")}</p>
      </div>
    </article>
  `;
}

function renderMemo() {
  const notes = (typeof getUserMemos === "function" ? getUserMemos() : []).map(normalizeMemoItem);

  return `
    <div class="stack">
      <section class="toolbar memo-toolbar">
        <div class="field"><div class="input-with-icon"><input class="input" placeholder="메모 검색..."><span class="field-icon">${icon("search")}</span></div></div>
        <div class="field"><select class="select"><option>태그 필터</option></select></div>
        <div class="field"><select class="select"><option>전체 기간</option></select></div>
        <button class="btn primary" type="button">${icon("plus")}메모 작성</button>
      </section>

      ${
        notes.length
          ? `
            <section class="memo-layout">
              <div>
                <div class="panel-header"><h2 class="panel-title">내 메모</h2></div>
                <div class="memo-grid">
                  ${notes.map(renderMemoCard).join("")}
                </div>
              </div>
              ${renderMemoDetail(notes[0])}
            </section>
          `
          : renderMemoEmptyState()
      }
    </div>
  `;
}
