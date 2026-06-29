function escapeChartText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "&#10;");
}

function isCompactChart() {
  return typeof window !== "undefined" && window.innerWidth <= 560;
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
  tooltipLabels = [],
  className = "",
  compactViewBox = null,
  desktopViewBox = null,
  tickUnit = unit,
  targetLines = []
}) {
  const compact = isCompactChart();
  const compactBox = compactViewBox || {};
  const desktopBox = desktopViewBox || {};
  const width = compact ? compactBox.width || 430 : desktopBox.width || 760;
  const height = compact ? compactBox.height || 255 : desktopBox.height || 270;
  const left = compact ? compactBox.left || 62 : desktopBox.left || 72;
  const right = compact ? compactBox.right || 58 : desktopBox.right || 64;
  const top = compact ? compactBox.top || 22 : desktopBox.top || 22;
  const bottom = compact ? compactBox.bottom || 36 : desktopBox.bottom || 36;
  const labelFontSize = compact ? compactBox.labelFontSize || 11 : desktopBox.labelFontSize || 12;
  const xLabelFontSize = compact ? compactBox.xLabelFontSize || labelFontSize : desktopBox.xLabelFontSize || labelFontSize;
  const yLabelFontSize = compact ? compactBox.yLabelFontSize || labelFontSize : desktopBox.yLabelFontSize || labelFontSize;
  const endLabelFontSize = compact ? compactBox.endLabelFontSize || 13 : desktopBox.endLabelFontSize || 13;
  const primaryStrokeWidth = compact ? compactBox.primaryStrokeWidth || 3.1 : desktopBox.primaryStrokeWidth || 3.1;
  const secondaryStrokeWidth = compact ? compactBox.secondaryStrokeWidth || 2.2 : desktopBox.secondaryStrokeWidth || 2.2;
  const tertiaryStrokeWidth = compact ? compactBox.tertiaryStrokeWidth || 2.4 : desktopBox.tertiaryStrokeWidth || 2.4;
  const pointRadius = compact ? compactBox.pointRadius || 4 : desktopBox.pointRadius || 4;
  const badgeHeight = compact ? compactBox.badgeHeight || 26 : desktopBox.badgeHeight || 26;
  const primaryBadgeWidth = compact ? compactBox.primaryBadgeWidth || 62 : desktopBox.primaryBadgeWidth || 62;
  const secondaryBadgeWidth = compact ? compactBox.secondaryBadgeWidth || 58 : desktopBox.secondaryBadgeWidth || 58;
  const tertiaryBadgeWidth = compact ? compactBox.tertiaryBadgeWidth || secondaryBadgeWidth : desktopBox.tertiaryBadgeWidth || secondaryBadgeWidth;
  const secondaryBadgeOffsetY = compact ? compactBox.secondaryBadgeOffsetY || 0 : desktopBox.secondaryBadgeOffsetY || 0;
  const tertiaryBadgeOffsetY = compact ? compactBox.tertiaryBadgeOffsetY || 0 : desktopBox.tertiaryBadgeOffsetY || 0;
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
      return `<text x="${x}" y="${height - 8}" fill="#64748b" font-size="${xLabelFontSize}" text-anchor="middle">${label}</text>`;
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
  const chartTargetLines = targetLines
    .filter((line) => Number.isFinite(Number(line.value)))
    .map((line, index) => {
      const value = Number(line.value);
      const y = scaleY(value);
      const label = line.label || `목표 ${index + 1}`;
      const amount = line.amount || formatTooltipValue(value);
      const targetLabelFontSize = compact ? 10 : 11;
      const labelWidth = Math.min(
        innerW - 16,
        Math.max(compact ? 88 : 96, Math.ceil(label.length * targetLabelFontSize * 0.86) + 18)
      );
      const labelX = left + 8;
      const labelY = Math.min(Math.max(top + 2, y - 11), height - bottom - 22);
      const tooltip = line.tooltip || `${label}\n목표가: ${amount}`;

      return `
        <g class="chart-target-line" data-chart-tooltip="${escapeChartText(tooltip)}">
          <line class="chart-target-stroke" x1="${left}" y1="${y}" x2="${width - right}" y2="${y}" stroke="#e03137" stroke-width="${compact ? 1.6 : 1.8}" stroke-dasharray="6 6"/>
          <rect x="${labelX}" y="${labelY}" width="${labelWidth}" height="22" rx="6" fill="#fff1f1" stroke="#fecaca"/>
          <text x="${labelX + labelWidth / 2}" y="${labelY + 15}" fill="#e03137" font-size="${targetLabelFontSize}" font-weight="850" text-anchor="middle">${escapeChartText(label)}</text>
        </g>
      `;
    })
    .join("");
  return `
    <div class="chart${className ? ` ${className}` : ""}">
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
              <text x="${left - 10}" y="${y + 4}" fill="#64748b" font-size="${yLabelFontSize}" text-anchor="end">${Math.round(tick).toLocaleString()}${tickUnit}</text>
            `;
          })
          .join("")}
        <path class="chart-area-fill" d="${pathFor(primary)} L ${width - right} ${height - bottom} L ${left} ${height - bottom} Z" fill="url(#lineArea)"/>
        ${tertiary ? `<path class="chart-line chart-line-tertiary" d="${pathFor(tertiary)}" fill="none" stroke="${tertiaryColor}" stroke-width="${tertiaryStrokeWidth}" pathLength="1"/>` : ""}
        <path class="chart-line chart-line-secondary" d="${pathFor(secondary)}" fill="none" stroke="#b8c2d3" stroke-width="${secondaryStrokeWidth}" pathLength="1"/>
        <path class="chart-line chart-line-primary" d="${pathFor(primary)}" fill="none" stroke="#2474f2" stroke-width="${primaryStrokeWidth}" pathLength="1"/>
        ${chartTargetLines}
        ${tertiary ? pointTooltips(tertiary, tertiaryName) : ""}
        ${pointTooltips(secondary, secondaryName)}
        ${pointTooltips(primary, primaryName)}
        <circle cx="${width - right}" cy="${scaleY(primary[primary.length - 1])}" r="${pointRadius}" fill="#2474f2"/>
        <circle cx="${width - right}" cy="${scaleY(secondary[secondary.length - 1])}" r="${pointRadius}" fill="#b8c2d3"/>
        ${tertiary ? `<circle cx="${width - right}" cy="${scaleY(tertiary[tertiary.length - 1])}" r="${pointRadius}" fill="${tertiaryColor}"/>` : ""}
        <rect x="${width - right - 2}" y="${scaleY(primary[primary.length - 1]) - 18}" width="${primaryBadgeWidth}" height="${badgeHeight}" rx="6" fill="#2474f2"/>
        <text x="${width - right - 2 + primaryBadgeWidth / 2}" y="${scaleY(primary[primary.length - 1]) - 1}" fill="white" font-size="${endLabelFontSize}" font-weight="800" text-anchor="middle">${endPrimary}</text>
        ${
          endSecondary
            ? `<rect x="${width - right + 4}" y="${scaleY(secondary[secondary.length - 1]) - 3 + secondaryBadgeOffsetY}" width="${secondaryBadgeWidth}" height="24" rx="6" fill="#f1f5f9"/>
        <text x="${width - right + 4 + secondaryBadgeWidth / 2}" y="${scaleY(secondary[secondary.length - 1]) + 13 + secondaryBadgeOffsetY}" fill="#64748b" font-size="${endLabelFontSize}" font-weight="800" text-anchor="middle">${endSecondary}</text>`
            : ""
        }
        ${
          tertiary && endTertiary
            ? `<rect x="${width - right + 4}" y="${scaleY(tertiary[tertiary.length - 1]) - 3 + tertiaryBadgeOffsetY}" width="${tertiaryBadgeWidth}" height="24" rx="6" fill="${tertiaryColor}"/>
        <text x="${width - right + 4 + tertiaryBadgeWidth / 2}" y="${scaleY(tertiary[tertiary.length - 1]) + 13 + tertiaryBadgeOffsetY}" fill="white" font-size="${endLabelFontSize}" font-weight="800" text-anchor="middle">${endTertiary}</text>`
            : ""
        }
        ${xLabels}
      </svg>
    </div>
  `;
}

function barChart(values, labels, max = 1500, min = -1000) {
  const compact = isCompactChart();
  const width = compact ? 420 : 560;
  const height = compact ? 250 : 260;
  const left = compact ? 48 : 58;
  const right = compact ? 18 : 24;
  const top = 24;
  const bottom = 36;
  const innerW = width - left - right;
  const innerH = height - top - bottom;
  const y = (value) => top + ((max - value) / (max - min)) * innerH;
  const zeroY = y(0);
  const barW = compact ? 16 : 18;
  const ticks = [1500, 1000, 500, 0, -500, -1000];
  return `
    <div class="chart">
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="월간 손익 막대 차트">
        ${ticks
          .map(
            (tick) => `
              <line x1="${left}" y1="${y(tick)}" x2="${width - right}" y2="${y(tick)}" stroke="#dfe7f1" stroke-dasharray="4 5"/>
              <text x="${left - 10}" y="${y(tick) + 4}" fill="#64748b" font-size="${compact ? 11 : 12}" text-anchor="end">${tick.toLocaleString()}</text>
            `
          )
          .join("")}
        <line x1="${left}" y1="${zeroY}" x2="${width - right}" y2="${zeroY}" stroke="#cbd5e1"/>
        ${values
          .map((value, index) => {
            const x = left + (compact ? 24 : 38) + index * (innerW / values.length);
            const barY = value >= 0 ? y(value) : zeroY;
            const h = Math.abs(y(value) - zeroY);
            const fill = value >= 0 ? "#2474f2" : "#f04438";
            const tooltip = `${labels[index]}: ${value.toLocaleString()}`;
            return `
              <rect class="chart-bar" x="${x}" y="${barY}" width="${barW}" height="${h}" rx="3" fill="${fill}" data-chart-tooltip="${escapeChartText(tooltip)}">
                <title>${escapeChartText(tooltip)}</title>
              </rect>
              <text x="${x + barW / 2}" y="${height - 9}" fill="#475569" font-size="${compact ? 11 : 12}" text-anchor="middle">${labels[index]}</text>
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
        <path class="chart-area-fill" d="${area}" fill="url(#miniArea)"/>
        <path class="chart-line chart-line-primary" d="${path}" fill="none" stroke="#2474f2" stroke-width="2.6" pathLength="1"/>
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
  const safeSegments = (Array.isArray(segments) ? segments : []).filter((item) => Number(item.value) > 0);
  const total = safeSegments.reduce((sum, item) => sum + item.value, 0);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const circles = total > 0 ? safeSegments
    .map((item) => {
      const dash = (item.value / total) * circumference;
      const tooltip = item.amount ? `${item.label}\n비중: ${item.value}%\n금액: ${item.amount}` : `${item.label || "비중"}\n비중: ${item.value}%`;
      const circle = `
        <g class="donut-segment" data-chart-tooltip="${escapeChartText(tooltip)}">
          <title>${escapeChartText(tooltip)}</title>
          <circle class="donut-arc" cx="60" cy="60" r="${radius}" fill="none" stroke="${item.color}" stroke-width="14"
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
    .join("") : "";
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

const assetPortfolioColorPalette = [
  "#2474f2",
  "#f05267",
  "#22c55e",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#ef4444",
  "#14b8a6",
  "#a855f7",
  "#84cc16",
  "#ec4899",
  "#0ea5e9",
  "#f97316",
  "#10b981",
  "#6366f1",
  "#eab308",
  "#d946ef",
  "#38bdf8",
  "#fb7185",
  "#34d399",
  "#64748b",
  "#c084fc",
  "#2dd4bf",
  "#facc15",
  "#60a5fa",
  "#fb923c",
  "#4ade80",
  "#818cf8",
  "#f43f5e",
  "#0891b2"
];

function getAssetPortfolioColor(index = 0, key = "") {
  const normalizedIndex = Number.isFinite(Number(index)) ? Math.max(0, Math.floor(Number(index))) : 0;
  if (normalizedIndex < assetPortfolioColorPalette.length) {
    return assetPortfolioColorPalette[normalizedIndex];
  }

  const source = String(key || normalizedIndex);
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) >>> 0;
  }
  return assetPortfolioColorPalette[hash % assetPortfolioColorPalette.length];
}

function normalizeCandleInput(candles = []) {
  return (Array.isArray(candles) ? candles : [])
    .map((candle) => {
      const close = Number(candle.close);
      if (!Number.isFinite(close) || close <= 0) return null;
      const open = Number(candle.open);
      const high = Number(candle.high);
      const low = Number(candle.low);
      return {
        values: [
          Number.isFinite(open) && open > 0 ? open : close,
          Number.isFinite(high) && high > 0 ? high : close,
          Number.isFinite(low) && low > 0 ? low : close,
          close
        ],
        volume: Math.max(0, Number(candle.volume) || 0),
        time: Number(candle.time) || 0
      };
    })
    .filter(Boolean);
}

function formatCandleTick(value) {
  const number = Number(value) || 0;
  const abs = Math.abs(number);
  const maximumFractionDigits = abs >= 1000 ? 0 : abs >= 100 ? 1 : abs >= 10 ? 2 : 4;
  return number.toLocaleString(undefined, { maximumFractionDigits });
}

function formatCandleDate(timestamp, compact = false) {
  const date = new Date(Number(timestamp) || Date.now());
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return compact ? `${month}/${day}` : `${month}/${day} ${hour}:${minute}`;
}

function candleChart(stock = null, options = {}) {
  const compact = isCompactChart();
  const width = compact ? 420 : 900;
  const height = compact ? 300 : 320;
  const left = compact ? 42 : 46;
  const right = compact ? 14 : 18;
  const top = compact ? 18 : 20;
  const bottom = compact ? 38 : 42;
  const candleArea = compact ? 205 : 220;
  const rawPrices = [
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
  const providedRows = normalizeCandleInput(options.candles);
  const hasProvidedRows = providedRows.length >= 2;
  const currentStockPrice = stock && typeof stock === "object"
    ? Number(stock.currentPriceKrw || stock.price || stock.currentPrice || 0)
    : 0;
  const currentSamsungPrice = currentStockPrice || (typeof getWatchStock === "function" ? getWatchStock("삼성전자", "005930")?.price : 0);
  const baseLastClose = rawPrices[rawPrices.length - 1][3];
  const priceScale = currentSamsungPrice ? currentSamsungPrice / baseLastClose : 1;
  const scaledRawPrices = rawPrices.map((row) => row.map((value) => Math.round((value * priceScale) / 100) * 100));
  const chartRows = hasProvidedRows
    ? providedRows.slice(-(compact ? 42 : 92))
    : (compact ? scaledRawPrices.slice(-32) : scaledRawPrices).map((values, index) => ({ values, volume: 0, time: Date.now() - (scaledRawPrices.length - index) * 86400000 }));
  const prices = chartRows.map((row) => row.values);
  const visibleValues = prices.flat();
  const rawMin = Math.min(...visibleValues);
  const rawMax = Math.max(...visibleValues);
  const rawRange = Math.max(rawMax - rawMin, rawMax * 0.02, 1);
  const min = hasProvidedRows
    ? Math.max(0, rawMin - rawRange * 0.08)
    : Math.floor(rawMin / 10000) * 10000;
  const max = hasProvidedRows
    ? rawMax + rawRange * 0.08
    : Math.ceil(rawMax / 10000) * 10000;
  const priceTicks = Array.from({ length: 6 }, (_, index) => {
    const value = max - ((max - min) * index) / 5;
    return hasProvidedRows ? value : Math.round(value);
  });
  const sx = (i) => left + (i / (prices.length - 1)) * (width - left - right);
  const sy = (v) => top + ((max - v) / (max - min)) * candleArea;
  const closeValues = prices.map((p) => p[3]);
  const ma = (windowSize) =>
    closeValues.map((_, index) => {
      const slice = closeValues.slice(Math.max(0, index - windowSize + 1), index + 1);
      return slice.reduce((sum, value) => sum + value, 0) / slice.length;
    });
  const pathFor = (values) => values.map((v, i) => `${i === 0 ? "M" : "L"} ${sx(i).toFixed(1)} ${sy(v).toFixed(1)}`).join(" ");
  const rawVolumes = chartRows.map((row, index) => Number(row.volume) || (12 + ((prices[index][1] - prices[index][2]) / Math.max(1, rawRange)) * 40 + (index % 5) * 5));
  const maxVolume = Math.max(...rawVolumes, 1);
  const volumes = rawVolumes.map((value) => 8 + (value / maxVolume) * (compact ? 34 : 42));
  const labelIndexes = [...new Set([0, Math.floor((prices.length - 1) * 0.35), Math.floor((prices.length - 1) * 0.66), prices.length - 1])];
  const xLabels = labelIndexes
    .map((index) => {
      const row = chartRows[index];
      return `<text x="${sx(index)}" y="${height - 5}" fill="#64748b" font-size="${compact ? 10 : 12}" text-anchor="${index === 0 ? "start" : index === prices.length - 1 ? "end" : "middle"}">${escapeChartText(formatCandleDate(row?.time, compact))}</text>`;
    })
    .join("");
  return `
    <div class="chart candles">
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeChartText(stock?.name || "종목")} 캔들 차트">
        ${priceTicks
          .map(
            (tick) => `
              <line x1="${left}" y1="${sy(tick)}" x2="${width - right}" y2="${sy(tick)}" stroke="#e3eaf3" stroke-dasharray="4 5"/>
              <text x="${left - 7}" y="${sy(tick) + 4}" fill="#64748b" font-size="${compact ? 10 : 12}" text-anchor="end">${formatCandleTick(tick)}</text>
            `
          )
          .join("")}
        ${prices
          .map(([open, high, low, close], i) => {
            const x = sx(i);
            const up = close >= open;
            const color = up ? "#f04438" : "#2474f2";
            const yTop = Math.min(sy(open), sy(close));
            const bodyH = Math.max(4, Math.abs(sy(open) - sy(close)));
            const bodyW = compact ? 5 : 8;
            return `
              <line class="chart-candle-wick" x1="${x}" y1="${sy(high)}" x2="${x}" y2="${sy(low)}" stroke="${color}" stroke-width="${compact ? 1.25 : 1.6}"/>
              <rect class="chart-candle-body" x="${x - bodyW / 2}" y="${yTop}" width="${bodyW}" height="${bodyH}" rx="1.5" fill="${color}"/>
            `;
          })
          .join("")}
        <path class="chart-line chart-line-primary" d="${pathFor(ma(5))}" fill="none" stroke="#2474f2" stroke-width="${compact ? 1.15 : 1.35}" opacity=".62" pathLength="1"/>
        <path class="chart-line chart-line-secondary" d="${pathFor(ma(20))}" fill="none" stroke="#ef4444" stroke-width="${compact ? 1.2 : 1.4}" opacity=".65" pathLength="1"/>
        <path class="chart-line chart-line-tertiary" d="${pathFor(ma(60))}" fill="none" stroke="#22c55e" stroke-width="${compact ? 1.2 : 1.4}" opacity=".65" pathLength="1"/>
        ${volumes
          .map((v, i) => {
            const x = sx(i);
            const h = Math.min(compact ? 34 : 42, v);
            const up = prices[i][3] >= prices[i][0];
            const bodyW = compact ? 5 : 8;
            return `<rect class="chart-bar chart-volume-bar" x="${x - bodyW / 2}" y="${height - bottom - h + (compact ? 24 : 28)}" width="${bodyW}" height="${h}" rx="1" fill="${up ? "#ff9b9b" : "#8bbcff"}" opacity=".85"/>`;
          })
          .join("")}
        ${xLabels}
      </svg>
    </div>
  `;
}
