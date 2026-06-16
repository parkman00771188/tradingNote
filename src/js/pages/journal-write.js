function journalWriteField(label, control) {
  return `
    <div class="journal-entry-row">
      <label>${label}</label>
      <div>${control}</div>
    </div>
  `;
}

function inputWithSuffix({ value = "", placeholder = "", suffix = "", readonly = false }) {
  return `
    <div class="journal-input-shell ${readonly ? "readonly" : ""}">
      <input value="${value}" placeholder="${placeholder}" ${readonly ? "readonly" : ""}>
      ${suffix ? `<span>${suffix}</span>` : ""}
    </div>
  `;
}

function renderJournalWrite() {
  return `
    <form class="journal-entry-form">
      <div class="journal-entry-content">
        <h2 id="journalWriteModalTitle" class="journal-entry-title">매매 일지 작성</h2>

        ${journalWriteField(
          "일자",
          `<div class="input-with-icon">
            <input class="input" value="2024-06-20">
            <span class="field-icon">${icon("calendar")}</span>
          </div>`
        )}

        ${journalWriteField(
          "구분",
          `<div class="trade-toggle" aria-label="거래 구분">
            <button type="button">매수</button>
            <button class="active" type="button">매도</button>
          </div>`
        )}

        ${journalWriteField("종목명", `<input class="input" value="삼성전자">`)}

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

        ${journalWriteField("수량", inputWithSuffix({ placeholder: "수량을 입력하세요", suffix: "주" }))}
        ${journalWriteField("매수가", inputWithSuffix({ placeholder: "매수가를 입력하세요", suffix: "원" }))}
        ${journalWriteField("매도가", inputWithSuffix({ placeholder: "매도가를 입력하세요", suffix: "원" }))}
        ${journalWriteField("손익", inputWithSuffix({ value: "0", suffix: "원", readonly: true }))}
        ${journalWriteField("수익률", inputWithSuffix({ value: "0.00", suffix: "%", readonly: true }))}
        ${journalWriteField("메모", `<textarea class="textarea compact-textarea" placeholder="메모를 입력하세요"></textarea>`)}
      </div>

      <div class="journal-entry-actions">
        <button class="btn" type="button" data-modal-close="true">취소</button>
        <button class="btn primary" type="button" data-modal-close="true">저장</button>
      </div>
    </form>
  `;
}
