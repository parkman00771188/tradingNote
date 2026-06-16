function escapeChartText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "&#10;");
}

function lineChart({
  primary,
  secondary,
  tertiary = null,
  labels = ["01/02", "02/01", "03/01", "04/01", "05/02", "06/01"],
  min = -10,
  max = 30,
  unit = "%",
  endPrimary = "+14.20%",
  endSecondary = "+4.15%",
  endTertiary = "",
  ariaLabel = "추이 차트",
  primaryName = "주요 값",
  secondaryName = "비교 값",
  tertiaryName = "추가 값",
  tertiaryColor = "#2aa7a1",
  tooltipLabels = []
}) {
  const width = 760;
  const height = 270;
  const left = 54;
  const right = 64;
  const top = 22;
  const bottom = 36;
  const innerW = width - left - right;
  const innerH = height - top - bottom;
  const scaleY = (v) => top + ((max - v) / (max - min)) * innerH;
  const scaleX = (i, length) => left + (i / (length - 1)) * innerW;
  const pathFor = (values) =>
    values
      .map((v, i) => `${i === 0 ? "M" : "L"} ${scaleX(i, values.length).toFixed(1)} ${scaleY(v).toFixed(1)}`)
      .join(" ");
  const ticks = Array.from({ length: 5 }, (_, index) => max - ((max - min) * index) / 4);
  const xLabels = labels
    .map((label, index) => {
      const x = left + (index / (labels.length - 1)) * innerW;
      return `<text x="${x}" y="${height - 8}" fill="#64748b" font-size="12" text-anchor="middle">${label}</text>`;
    })
    .join("");
  const formatTooltipValue = (value) => `${Number(value).toLocaleString()}${unit}`;
  const tooltipLabelFor = (index, values) => {
    if (tooltipLabels[index]) return tooltipLabels[index];
    if (labels.length === values.length && labels[index]) return labels[index];
    return `${index + 1}번째 지점`;
  };
  const pointTooltips = (values, name) =>
    values
      .map((value, index) => {
        const tooltip = `${tooltipLabelFor(index, values)}\n${name}: ${formatTooltipValue(value)}`;
        return `
        <circle class="chart-hotspot" cx="${scaleX(index, values.length)}" cy="${scaleY(value)}" r="9" data-chart-tooltip="${escapeChartText(tooltip)}">
          <title>${escapeChartText(tooltip)}</title>
        </circle>
      `;
      })
      .join("");
  return `
    <div class="chart">
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${ariaLabel}">
        <defs>
          <linearGradient id="lineArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#2474f2" stop-opacity="0.16"/>
            <stop offset="100%" stop-color="#2474f2" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${ticks
          .map((tick) => {
            const y = scaleY(tick);
            return `
              <line x1="${left}" y1="${y}" x2="${width - right}" y2="${y}" stroke="#dfe7f1" stroke-dasharray="4 5"/>
              <text x="${left - 12}" y="${y + 4}" fill="#64748b" font-size="12" text-anchor="end">${Math.round(tick).toLocaleString()}${unit}</text>
            `;
          })
          .join("")}
        <path d="${pathFor(primary)} L ${width - right} ${height - bottom} L ${left} ${height - bottom} Z" fill="url(#lineArea)"/>
        ${tertiary ? `<path d="${pathFor(tertiary)}" fill="none" stroke="${tertiaryColor}" stroke-width="2.4"/>` : ""}
        <path d="${pathFor(secondary)}" fill="none" stroke="#b8c2d3" stroke-width="2.2"/>
        <path d="${pathFor(primary)}" fill="none" stroke="#2474f2" stroke-width="3.1"/>
        ${tertiary ? pointTooltips(tertiary, tertiaryName) : ""}
        ${pointTooltips(secondary, secondaryName)}
        ${pointTooltips(primary, primaryName)}
        <circle cx="${width - right}" cy="${scaleY(primary[primary.length - 1])}" r="4" fill="#2474f2"/>
        <circle cx="${width - right}" cy="${scaleY(secondary[secondary.length - 1])}" r="4" fill="#b8c2d3"/>
        ${tertiary ? `<circle cx="${width - right}" cy="${scaleY(tertiary[tertiary.length - 1])}" r="4" fill="${tertiaryColor}"/>` : ""}
        <rect x="${width - right - 2}" y="${scaleY(primary[primary.length - 1]) - 18}" width="62" height="26" rx="6" fill="#2474f2"/>
        <text x="${width - right + 29}" y="${scaleY(primary[primary.length - 1]) - 1}" fill="white" font-size="13" font-weight="800" text-anchor="middle">${endPrimary}</text>
        ${
          endSecondary
            ? `<rect x="${width - right + 4}" y="${scaleY(secondary[secondary.length - 1]) - 3}" width="58" height="24" rx="6" fill="#f1f5f9"/>
        <text x="${width - right + 33}" y="${scaleY(secondary[secondary.length - 1]) + 13}" fill="#64748b" font-size="13" font-weight="800" text-anchor="middle">${endSecondary}</text>`
            : ""
        }
        ${
          tertiary && endTertiary
            ? `<rect x="${width - right + 4}" y="${scaleY(tertiary[tertiary.length - 1]) - 3}" width="58" height="24" rx="6" fill="${tertiaryColor}"/>
        <text x="${width - right + 33}" y="${scaleY(tertiary[tertiary.length - 1]) + 13}" fill="white" font-size="13" font-weight="800" text-anchor="middle">${endTertiary}</text>`
            : ""
        }
        ${xLabels}
      </svg>
    </div>
  `;
}

function barChart(values, labels, max = 1500, min = -1000) {
  const width = 560;
  const height = 260;
  const left = 58;
  const right = 24;
  const top = 24;
  const bottom = 36;
  const innerW = width - left - right;
  const innerH = height - top - bottom;
  const y = (value) => top + ((max - value) / (max - min)) * innerH;
  const zeroY = y(0);
  const barW = 18;
  const ticks = [1500, 1000, 500, 0, -500, -1000];
  return `
    <div class="chart">
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="월간 손익 막대 차트">
        ${ticks
          .map(
            (tick) => `
              <line x1="${left}" y1="${y(tick)}" x2="${width - right}" y2="${y(tick)}" stroke="#dfe7f1" stroke-dasharray="4 5"/>
              <text x="${left - 12}" y="${y(tick) + 4}" fill="#64748b" font-size="12" text-anchor="end">${tick.toLocaleString()}</text>
            `
          )
          .join("")}
        <line x1="${left}" y1="${zeroY}" x2="${width - right}" y2="${zeroY}" stroke="#cbd5e1"/>
        ${values
          .map((value, index) => {
            const x = left + 38 + index * (innerW / values.length);
            const barY = value >= 0 ? y(value) : zeroY;
            const h = Math.abs(y(value) - zeroY);
            const fill = value >= 0 ? "#2474f2" : "#f04438";
            const tooltip = `${labels[index]}: ${value.toLocaleString()}`;
            return `
              <rect x="${x}" y="${barY}" width="${barW}" height="${h}" rx="3" fill="${fill}" data-chart-tooltip="${escapeChartText(tooltip)}">
                <title>${escapeChartText(tooltip)}</title>
              </rect>
              <text x="${x + barW / 2}" y="${height - 9}" fill="#475569" font-size="12" text-anchor="middle">${labels[index]}</text>
            `;
          })
          .join("")}
      </svg>
    </div>
  `;
}

function miniLineChart(values, label = "+125,000") {
  const width = 510;
  const height = 160;
  const left = 36;
  const right = 24;
  const top = 18;
  const bottom = 25;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const sx = (i) => left + (i / (values.length - 1)) * (width - left - right);
  const sy = (v) => top + ((max - v) / (max - min)) * (height - top - bottom);
  const path = values.map((v, i) => `${i === 0 ? "M" : "L"} ${sx(i).toFixed(1)} ${sy(v).toFixed(1)}`).join(" ");
  const area = `${path} L ${width - right} ${height - bottom} L ${left} ${height - bottom} Z`;
  return `
    <div class="chart small">
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="당일 수익 추이">
        <defs>
          <linearGradient id="miniArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#2474f2" stop-opacity="0.18"/>
            <stop offset="100%" stop-color="#2474f2" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${[-150, -75, 0, 75, 150]
          .map((tick) => {
            const value = tick * 1000;
            const ty = top + ((150 - tick) / 300) * (height - top - bottom);
            return `
              <line x1="${left}" y1="${ty}" x2="${width - right}" y2="${ty}" stroke="#e3eaf3" stroke-dasharray="4 5"/>
              <text x="${left - 9}" y="${ty + 4}" fill="#64748b" font-size="11" text-anchor="end">${tick === 0 ? "0" : tick > 0 ? `+${tick}K` : `${tick}K`}</text>
            `;
          })
          .join("")}
        <path d="${area}" fill="url(#miniArea)"/>
        <path d="${path}" fill="none" stroke="#2474f2" stroke-width="2.6"/>
        <rect x="${width - right - 58}" y="${sy(values[values.length - 1]) - 20}" width="64" height="25" rx="6" fill="#2474f2"/>
        <text x="${width - right - 26}" y="${sy(values[values.length - 1]) - 3}" fill="white" font-size="12" font-weight="800" text-anchor="middle">${label}</text>
        <text x="${left}" y="${height - 3}" fill="#64748b" font-size="11">09:00</text>
        <text x="${width / 2}" y="${height - 3}" fill="#64748b" font-size="11" text-anchor="middle">12:00</text>
        <text x="${width - right}" y="${height - 3}" fill="#64748b" font-size="11" text-anchor="end">15:00</text>
      </svg>
    </div>
  `;
}

function donutChart(segments, center, small = false) {
  const total = segments.reduce((sum, item) => sum + item.value, 0);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const circles = segments
    .map((item) => {
      const dash = (item.value / total) * circumference;
      const tooltip = item.amount ? `${item.label}\n비중: ${item.value}%\n금액: ${item.amount}` : `${item.label || "비중"}\n비중: ${item.value}%`;
      const circle = `
        <g class="donut-segment" data-chart-tooltip="${escapeChartText(tooltip)}">
          <title>${escapeChartText(tooltip)}</title>
          <circle cx="60" cy="60" r="${radius}" fill="none" stroke="${item.color}" stroke-width="14"
            stroke-dasharray="${dash} ${circumference - dash}" stroke-dashoffset="${-offset}"
            transform="rotate(-90 60 60)"/>
          <circle class="donut-hit-area" cx="60" cy="60" r="${radius}" fill="none" stroke="transparent" stroke-width="26"
            stroke-dasharray="${dash} ${circumference - dash}" stroke-dashoffset="${-offset}"
            transform="rotate(-90 60 60)"/>
        </g>
      `;
      offset += dash;
      return circle;
    })
    .join("");
  return `
    <div class="donut ${small ? "small" : ""}">
      <svg viewBox="0 0 120 120" aria-label="비중 도넛 차트">
        <circle cx="60" cy="60" r="${radius}" fill="none" stroke="#e7edf6" stroke-width="14"/>
        ${circles}
      </svg>
      <div class="donut-center">${center}</div>
    </div>
  `;
}

function candleChart() {
  const width = 900;
  const height = 320;
  const left = 46;
  const right = 18;
  const top = 20;
  const bottom = 42;
  const candleArea = 220;
  const prices = [
    [62500, 64200, 61700, 63800],
    [63800, 65300, 63200, 64800],
    [64800, 66600, 64500, 66200],
    [66200, 68000, 65700, 67500],
    [67500, 70100, 66800, 69800],
    [69800, 71500, 69200, 70600],
    [70600, 72600, 69900, 71900],
    [71900, 73300, 71300, 72400],
    [72400, 71800, 70100, 70900],
    [70900, 73500, 70600, 73100],
    [73100, 74800, 72400, 74200],
    [74200, 76800, 73500, 76000],
    [76000, 78200, 75600, 77400],
    [77400, 78800, 76500, 77100],
    [77100, 79500, 76700, 78900],
    [78900, 80600, 78100, 79800],
    [79800, 81600, 79000, 81100],
    [81100, 83500, 80400, 82600],
    [82600, 84600, 81300, 81900],
    [81900, 83900, 80800, 83200],
    [83200, 82400, 79800, 80600],
    [80600, 81500, 78500, 79300],
    [79300, 81000, 78000, 80400],
    [80400, 82100, 79900, 81600],
    [81600, 80700, 78200, 79000],
    [79000, 80100, 77100, 77800],
    [77800, 79400, 76900, 78600],
    [78600, 81200, 78100, 80700],
    [80700, 82800, 79800, 82100],
    [82100, 81800, 79100, 79900],
    [79900, 81300, 78600, 79200],
    [79200, 80600, 78100, 80100],
    [80100, 82000, 79500, 81600],
    [81600, 83300, 80500, 82800],
    [82800, 84600, 81700, 84100],
    [84100, 82700, 80800, 81500],
    [81500, 80600, 78000, 78900],
    [78900, 80200, 77000, 77300],
    [77300, 79000, 76200, 78100]
  ];
  const min = 60000;
  const max = 86000;
  const sx = (i) => left + (i / (prices.length - 1)) * (width - left - right);
  const sy = (v) => top + ((max - v) / (max - min)) * candleArea;
  const closeValues = prices.map((p) => p[3]);
  const ma = (windowSize) =>
    closeValues.map((_, index) => {
      const slice = closeValues.slice(Math.max(0, index - windowSize + 1), index + 1);
      return slice.reduce((sum, value) => sum + value, 0) / slice.length;
    });
  const pathFor = (values) => values.map((v, i) => `${i === 0 ? "M" : "L"} ${sx(i).toFixed(1)} ${sy(v).toFixed(1)}`).join(" ");
  const volumes = prices.map((p, i) => 12 + ((p[1] - p[2]) / 800) + (i % 5) * 5);
  return `
    <div class="chart candles">
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="삼성전자 캔들 차트">
        ${[85000, 80000, 75000, 70000, 65000, 60000]
          .map(
            (tick) => `
              <line x1="${left}" y1="${sy(tick)}" x2="${width - right}" y2="${sy(tick)}" stroke="#e3eaf3" stroke-dasharray="4 5"/>
              <text x="${left - 8}" y="${sy(tick) + 4}" fill="#64748b" font-size="12" text-anchor="end">${tick.toLocaleString()}</text>
            `
          )
          .join("")}
        ${prices
          .map(([open, high, low, close], i) => {
            const x = sx(i);
            const up = close >= open;
            const color = up ? "#2474f2" : "#f04438";
            const yTop = Math.min(sy(open), sy(close));
            const bodyH = Math.max(4, Math.abs(sy(open) - sy(close)));
            return `
              <line x1="${x}" y1="${sy(high)}" x2="${x}" y2="${sy(low)}" stroke="${color}" stroke-width="1.6"/>
              <rect x="${x - 4}" y="${yTop}" width="8" height="${bodyH}" rx="1.5" fill="${color}"/>
            `;
          })
          .join("")}
        <path d="${pathFor(ma(5))}" fill="none" stroke="#ef4444" stroke-width="1.4" opacity=".65"/>
        <path d="${pathFor(ma(20))}" fill="none" stroke="#22c55e" stroke-width="1.4" opacity=".65"/>
        ${volumes
          .map((v, i) => {
            const x = sx(i);
            const h = Math.min(42, v);
            const up = prices[i][3] >= prices[i][0];
            return `<rect x="${x - 4}" y="${height - bottom - h + 28}" width="8" height="${h}" rx="1" fill="${up ? "#8bbcff" : "#ff9b9b"}" opacity=".85"/>`;
          })
          .join("")}
        <text x="${left}" y="${height - 5}" fill="#64748b" font-size="12">02/19</text>
        <text x="${width * 0.35}" y="${height - 5}" fill="#64748b" font-size="12" text-anchor="middle">04/01</text>
        <text x="${width * 0.62}" y="${height - 5}" fill="#64748b" font-size="12" text-anchor="middle">05/13</text>
        <text x="${width - right}" y="${height - 5}" fill="#64748b" font-size="12" text-anchor="end">06/10</text>
      </svg>
    </div>
  `;
}
