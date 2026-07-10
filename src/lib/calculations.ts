import type { Trade } from './types';

export interface EquityPoint {
  /** ISO datetime used for sorting/plotting */
  ts: string;
  date: string;
  equity: number;
  peak: number;
  drawdownPct: number;
}

export interface Metrics {
  hasTrades: boolean;
  initialDeposit: number;
  finalBalance: number;
  totalReturnPct: number;
  cagrPct: number | null;
  yearsSpan: number;
  totalTrades: number;
  winRatePct: number;
  profitFactor: number | null;
  maxDrawdownPct: number;
  equityCurve: EquityPoint[];
}

function tradeTimestamp(t: Trade): number {
  const time = t.exitTime || t.entryTime || '00:00';
  return new Date(`${t.date}T${time}:00`).getTime();
}

function sortedTrades(trades: Trade[]): Trade[] {
  return [...trades].sort((a, b) => tradeTimestamp(a) - tradeTimestamp(b));
}

export function computeMetrics(trades: Trade[], initialDeposit: number): Metrics {
  const ordered = sortedTrades(trades);
  const empty: Metrics = {
    hasTrades: false,
    initialDeposit,
    finalBalance: initialDeposit,
    totalReturnPct: 0,
    cagrPct: null,
    yearsSpan: 0,
    totalTrades: 0,
    winRatePct: 0,
    profitFactor: null,
    maxDrawdownPct: 0,
    equityCurve: [],
  };
  if (ordered.length === 0) return empty;

  // --- Equity curve & drawdown series ---
  const equityCurve: EquityPoint[] = [];
  let running = initialDeposit;
  let peak = initialDeposit;
  const startTs = new Date(`${ordered[0].date}T00:00:00`).getTime();
  equityCurve.push({ ts: new Date(startTs).toISOString(), date: ordered[0].date, equity: running, peak, drawdownPct: 0 });
  for (const t of ordered) {
    running += t.result;
    peak = Math.max(peak, running);
    const dd = peak > 0 ? ((running - peak) / peak) * 100 : 0;
    equityCurve.push({ ts: new Date(tradeTimestamp(t)).toISOString(), date: t.date, equity: running, peak, drawdownPct: dd });
  }
  const finalBalance = running;
  const totalReturnPct = ((finalBalance - initialDeposit) / initialDeposit) * 100;

  let maxDrawdownPct = 0;
  for (const p of equityCurve) maxDrawdownPct = Math.min(maxDrawdownPct, p.drawdownPct);

  // --- Win rate & profit factor ---
  const wins = ordered.filter((t) => t.result > 0);
  const losses = ordered.filter((t) => t.result < 0);
  const totalTrades = ordered.length;
  const winRatePct = (wins.length / totalTrades) * 100;
  const grossWin = wins.reduce((s, t) => s + t.result, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.result, 0));
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : null;

  // --- CAGR ---
  const firstDate = new Date(`${ordered[0].date}T00:00:00`);
  const lastDate = new Date(`${ordered[ordered.length - 1].date}T00:00:00`);
  const msSpan = lastDate.getTime() - firstDate.getTime();
  const yearsSpan = Math.max(msSpan / (365.25 * 86400000), 1 / 365.25);
  // Annualizing a short sample produces wildly misleading numbers (e.g. a good
  // week compounded into a "+400%/yr" figure), so CAGR only shows once there's
  // at least a full year of trades behind it.
  const cagrPct = yearsSpan >= 1 && initialDeposit > 0
    ? (Math.pow(finalBalance / initialDeposit, 1 / yearsSpan) - 1) * 100
    : null;

  return {
    hasTrades: true,
    initialDeposit,
    finalBalance,
    totalReturnPct,
    cagrPct,
    yearsSpan,
    totalTrades,
    winRatePct,
    profitFactor,
    maxDrawdownPct: Math.abs(maxDrawdownPct),
    equityCurve,
  };
}
