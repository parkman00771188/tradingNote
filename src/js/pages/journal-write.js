function journalWriteField(label, control) {
  return `
    <div class="journal-entry-row">
      <label>${label}</label>
      <div>${control}</div>
    </div>
  `;
}

function inputWithSuffix({ value = "", placeholder = "", suffix = "", readonly = false, numeric = false }) {
  const numericAttrs = numeric ? `inputmode="numeric" autocomplete="off" data-number-input` : "";

  return `
    <div class="journal-input-shell ${readonly ? "readonly" : ""}">
      <input value="${value}" placeholder="${placeholder}" ${readonly ? "readonly" : ""} ${numericAttrs}>
      ${suffix ? `<span>${suffix}</span>` : ""}
    </div>
  `;
}

function renderJournalWrite({ showTitle = true } = {}) {
  return `
    <form class="journal-entry-form" data-journal-entry-form data-trade-mode="buy">
      <div class="journal-entry-content">
        ${showTitle ? `<h2 id="journalWriteModalTitle" class="journal-entry-title">매매 일지 작성</h2>` : ""}

        ${journalWriteField(
          "일자",
          `<div class="input-with-icon journal-date-control">
            <input class="input" type="date" value="2024-06-20" data-date-picker>
            <button class="field-icon field-icon-button" type="button" data-date-picker-trigger aria-label="날짜 선택">${icon("calendar")}</button>
          </div>`
        )}

        ${journalWriteField(
          "구분",
          `<div class="trade-toggle" aria-label="거래 구분">
            <button class="active" type="button" data-journal-trade-mode="buy" aria-pressed="true">매수</button>
            <button type="button" data-journal-trade-mode="sell" aria-pressed="false">매도</button>
          </div>`
        )}

        <div data-visible-for="buy">
          ${journalWriteField(
            "현재 현금 보유량",
            `<div class="cash-balance-box">
              <div>
                <strong>12,450,000원</strong>
                <p>현재 계좌의 현금 보유량입니다.</p>
              </div>
            </div>`
          )}
        </div>

        ${journalWriteField("종목명", `<input class="input" placeholder="종목명을 입력하세요">`)}

        <div class="journal-entry-row">
          <span></span>
          <div class="holding-box">
            <strong>보유 정보 (삼성전자)</strong>
            <div>
              <span><em>보유 수량</em><b>10주</b></span>
              <span><em>보유 금액</em><b>785,000원</b></span>
            </div>
          </div>
        </div>

        ${journalWriteField("수량", inputWithSuffix({ placeholder: "수량을 입력하세요", suffix: "주", numeric: true }))}
        <div data-visible-for="buy">${journalWriteField("매수가", inputWithSuffix({ placeholder: "매수가를 입력하세요", suffix: "원", numeric: true }))}</div>
        <div data-visible-for="sell">${journalWriteField("매도가", inputWithSuffix({ placeholder: "매도가를 입력하세요", suffix: "원", numeric: true }))}</div>
        ${journalWriteField("메모", `<textarea class="textarea compact-textarea" placeholder="메모를 입력하세요"></textarea>`)}
      </div>

      <div class="journal-entry-actions">
        <button class="btn" type="button" data-modal-close="true">취소</button>
        <button class="btn primary" type="button" data-modal-close="true">저장</button>
      </div>
    </form>
  `;
}
