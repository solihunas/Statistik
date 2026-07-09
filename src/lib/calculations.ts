import type { Trade, TradeSession } from './types';

export interface EquityPoint {
  /** ISO datetime used for sorting/plotting */
  ts: string;
  date: string;
  equity: number;
  peak: number;
  drawdownPct: number;
}

export interface MonthlyReturnRow {
  year: number;
  /** 12 entries, Jan..Dec. null = no data (outside tracked range) */
  months: (number | null)[];
  yearReturnPct: number | null;
  endBalance: number | null;
}

export interface RBucket {
  label: string;
  pct: number;
  count: number;
}

export interface SessionStat {
  session: TradeSession;
  label: string;
  trades: number;
  winRate: number;
  totalPnl: number;
}

export interface Metrics {
  hasTrades: boolean;
  initialDeposit: number;
  finalBalance: number;
  totalReturnPct: number;
  cagrPct: number | null;
  yearsSpan: number;
  totalTrades: number;
  winCount: number;
  lossCount: number;
  winRatePct: number;
  lossRatePct: number;
  profitFactor: number | null;
  avgRRLabel: string | null;
  maxDrawdownPct: number;
  recoveryFactor: number | null;
  sharpeRatio: number | null;
  sortinoRatio: number | null;
  expectancyPct: number;
  bestMonth: { label: string; pct: number } | null;
  worstMonth: { label: string; pct: number } | null;
  largestWin: number;
  largestLoss: number;
  avgWin: number;
  avgLoss: number;
  equityCurve: EquityPoint[];
  monthlyReturns: MonthlyReturnRow[];
  avgDrawdownPct: number;
  longestDrawdownDays: number;
  longestRecoveryDays: number;
  rBuckets: RBucket[];
  rBucketsAvailable: boolean;
  avgWinR: number | null;
  avgLossR: number | null;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  avgTradesPerDay: number;
  avgHoldTimeMinutes: number | null;
  sessionStats: SessionStat[];
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SESSION_LABELS: Record<TradeSession, string> = {
  asia: 'Asia',
  london: 'London',
  newyork: 'New York',
  overlap: 'Overlap',
};

function tradeTimestamp(t: Trade): number {
  const time = t.exitTime || t.entryTime || '00:00';
  return new Date(`${t.date}T${time}:00`).getTime();
}

function sortedTrades(trades: Trade[]): Trade[] {
  return [...trades].sort((a, b) => tradeTimestamp(a) - tradeTimestamp(b));
}

function monthKey(dateIso: string): string {
  return dateIso.slice(0, 7); // YYYY-MM
}

function stddev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function downsideDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const sumSq = values.reduce((s, v) => s + Math.min(v, 0) ** 2, 0);
  return Math.sqrt(sumSq / values.length);
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
    winCount: 0,
    lossCount: 0,
    winRatePct: 0,
    lossRatePct: 0,
    profitFactor: null,
    avgRRLabel: null,
    maxDrawdownPct: 0,
    recoveryFactor: null,
    sharpeRatio: null,
    sortinoRatio: null,
    expectancyPct: 0,
    bestMonth: null,
    worstMonth: null,
    largestWin: 0,
    largestLoss: 0,
    avgWin: 0,
    avgLoss: 0,
    equityCurve: [],
    monthlyReturns: [],
    avgDrawdownPct: 0,
    longestDrawdownDays: 0,
    longestRecoveryDays: 0,
    rBuckets: [],
    rBucketsAvailable: false,
    avgWinR: null,
    avgLossR: null,
    maxConsecutiveWins: 0,
    maxConsecutiveLosses: 0,
    avgTradesPerDay: 0,
    avgHoldTimeMinutes: null,
    sessionStats: [],
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

  // --- Max drawdown, average drawdown, longest DD / recovery ---
  let maxDrawdownPct = 0;
  const drawdownExcursions: number[] = [];
  let inDrawdown = false;
  let ddStartTs = 0;
  let troughTs = 0;
  let troughVal = 0;
  let longestDrawdownDays = 0;
  let longestRecoveryDays = 0;
  for (const p of equityCurve) {
    maxDrawdownPct = Math.min(maxDrawdownPct, p.drawdownPct);
    if (p.drawdownPct < -0.0001) {
      if (!inDrawdown) {
        inDrawdown = true;
        ddStartTs = new Date(p.ts).getTime();
        troughVal = p.drawdownPct;
        troughTs = new Date(p.ts).getTime();
      } else if (p.drawdownPct < troughVal) {
        troughVal = p.drawdownPct;
        troughTs = new Date(p.ts).getTime();
      }
      drawdownExcursions.push(p.drawdownPct);
    } else if (inDrawdown) {
      const nowTs = new Date(p.ts).getTime();
      const ddDays = (nowTs - ddStartTs) / 86400000;
      const recoveryDays = (nowTs - troughTs) / 86400000;
      longestDrawdownDays = Math.max(longestDrawdownDays, ddDays);
      longestRecoveryDays = Math.max(longestRecoveryDays, recoveryDays);
      inDrawdown = false;
    }
  }
  if (inDrawdown) {
    const nowTs = new Date(equityCurve[equityCurve.length - 1].ts).getTime();
    longestDrawdownDays = Math.max(longestDrawdownDays, (nowTs - ddStartTs) / 86400000);
  }
  const avgDrawdownPct = drawdownExcursions.length
    ? drawdownExcursions.reduce((s, v) => s + v, 0) / drawdownExcursions.length
    : 0;

  // --- Win/loss stats ---
  const wins = ordered.filter((t) => t.result > 0);
  const losses = ordered.filter((t) => t.result < 0);
  const winCount = wins.length;
  const lossCount = losses.length;
  const totalTrades = ordered.length;
  const winRatePct = (winCount / totalTrades) * 100;
  const lossRatePct = (lossCount / totalTrades) * 100;
  const grossWin = wins.reduce((s, t) => s + t.result, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.result, 0));
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : null;
  const avgWin = winCount ? grossWin / winCount : 0;
  const avgLoss = lossCount ? grossLoss / lossCount : 0;
  const avgRRLabel = avgLoss > 0 ? `1 : ${(avgWin / avgLoss).toFixed(2)}` : null;
  const largestWin = wins.length ? Math.max(...wins.map((t) => t.result)) : 0;
  const largestLoss = losses.length ? Math.min(...losses.map((t) => t.result)) : 0;

  // --- Monthly returns (compounding) ---
  const monthlyMap = new Map<string, number>(); // key YYYY-MM -> balance at end of month
  let runningBal = initialDeposit;
  const monthStartBal = new Map<string, number>();
  for (const t of ordered) {
    const key = monthKey(t.date);
    if (!monthStartBal.has(key)) monthStartBal.set(key, runningBal);
    runningBal += t.result;
    monthlyMap.set(key, runningBal);
  }
  const firstDate = new Date(`${ordered[0].date}T00:00:00`);
  const lastDate = new Date(`${ordered[ordered.length - 1].date}T00:00:00`);
  const years = new Set<number>();
  for (let y = firstDate.getFullYear(); y <= lastDate.getFullYear(); y++) years.add(y);

  const monthlyReturns: MonthlyReturnRow[] = [];
  let bestMonth: { label: string; pct: number } | null = null;
  let worstMonth: { label: string; pct: number } | null = null;
  const nowKey = monthKey(new Date().toISOString().slice(0, 10));

  for (const year of Array.from(years).sort()) {
    const months: (number | null)[] = [];
    let yearHasData = false;
    let yearStartBal: number | null = null;
    let yearEndBal: number | null = null;
    for (let m = 0; m < 12; m++) {
      const key = `${year}-${String(m + 1).padStart(2, '0')}`;
      const inRange = key >= monthKey(ordered[0].date) && key <= nowKey && key <= monthKey(ordered[ordered.length - 1].date);
      if (monthlyMap.has(key)) {
        const startB = monthStartBal.get(key)!;
        const endB = monthlyMap.get(key)!;
        const pct = startB !== 0 ? ((endB - startB) / startB) * 100 : 0;
        months.push(pct);
        yearHasData = true;
        if (yearStartBal === null) yearStartBal = startB;
        yearEndBal = endB;
        const label = `${MONTH_LABELS[m]} ${year}`;
        if (!bestMonth || pct > bestMonth.pct) bestMonth = { label, pct };
        if (!worstMonth || pct < worstMonth.pct) worstMonth = { label, pct };
      } else if (inRange) {
        months.push(0);
      } else {
        months.push(null);
      }
    }
    const yearReturnPct = yearHasData && yearStartBal ? ((yearEndBal! - yearStartBal) / yearStartBal) * 100 : null;
    monthlyReturns.push({ year, months, yearReturnPct, endBalance: yearHasData ? yearEndBal : null });
  }

  // --- CAGR ---
  const msSpan = new Date(`${ordered[ordered.length - 1].date}T00:00:00`).getTime() - new Date(`${ordered[0].date}T00:00:00`).getTime();
  const yearsSpan = Math.max(msSpan / (365.25 * 86400000), 1 / 365.25);
  // Annualizing a short sample produces wildly misleading numbers (e.g. a good
  // week compounded into a "+400%/yr" figure), so CAGR only shows once there's
  // at least a full year of trades behind it.
  const cagrPct = yearsSpan >= 1 && initialDeposit > 0
    ? (Math.pow(finalBalance / initialDeposit, 1 / yearsSpan) - 1) * 100
    : null;

  // --- Recovery factor ---
  const maxDrawdownAmount = (Math.abs(maxDrawdownPct) / 100) * peak;
  const recoveryFactor = maxDrawdownAmount > 0 ? (finalBalance - initialDeposit) / maxDrawdownAmount : null;

  // --- Sharpe / Sortino (based on monthly returns %) ---
  const monthlyPctSeries: number[] = [];
  for (const row of monthlyReturns) {
    for (const m of row.months) if (m !== null) monthlyPctSeries.push(m);
  }
  let sharpeRatio: number | null = null;
  let sortinoRatio: number | null = null;
  if (monthlyPctSeries.length >= 2) {
    const mean = monthlyPctSeries.reduce((s, v) => s + v, 0) / monthlyPctSeries.length;
    const sd = stddev(monthlyPctSeries);
    const dd = downsideDeviation(monthlyPctSeries);
    sharpeRatio = sd > 0 ? (mean / sd) * Math.sqrt(12) : null;
    sortinoRatio = dd > 0 ? (mean / dd) * Math.sqrt(12) : null;
  }

  // --- Expectancy (% per trade relative to balance before trade) ---
  let bal = initialDeposit;
  let expSum = 0;
  for (const t of ordered) {
    const before = bal;
    if (before > 0) expSum += (t.result / before) * 100;
    bal += t.result;
  }
  const expectancyPct = expSum / totalTrades;

  // --- R-multiple distribution ---
  const withR = ordered.filter((t) => t.riskAmount && t.riskAmount > 0);
  const rValues = withR.map((t) => t.result / (t.riskAmount as number));
  const bucketDefs: [string, (r: number) => boolean][] = [
    ['<-3R', (r) => r < -3],
    ['-3R to -2R', (r) => r >= -3 && r < -2],
    ['-2R to -1R', (r) => r >= -2 && r < -1],
    ['-1R to 0R', (r) => r >= -1 && r < 0],
    ['0R to 1R', (r) => r >= 0 && r < 1],
    ['1R to 2R', (r) => r >= 1 && r < 2],
    ['2R to 3R', (r) => r >= 2 && r < 3],
    ['>3R', (r) => r >= 3],
  ];
  const rBuckets: RBucket[] = bucketDefs.map(([label, test]) => {
    const count = rValues.filter(test).length;
    return { label, count, pct: rValues.length ? (count / rValues.length) * 100 : 0 };
  });
  const winRs = rValues.filter((r) => r > 0);
  const lossRs = rValues.filter((r) => r < 0);
  const avgWinR = winRs.length ? winRs.reduce((s, v) => s + v, 0) / winRs.length : null;
  const avgLossR = lossRs.length ? Math.abs(lossRs.reduce((s, v) => s + v, 0) / lossRs.length) : null;

  // --- Consecutive win/loss streaks ---
  let maxConsecutiveWins = 0;
  let maxConsecutiveLosses = 0;
  let curWin = 0;
  let curLoss = 0;
  for (const t of ordered) {
    if (t.result > 0) {
      curWin += 1;
      curLoss = 0;
    } else if (t.result < 0) {
      curLoss += 1;
      curWin = 0;
    } else {
      curWin = 0;
      curLoss = 0;
    }
    maxConsecutiveWins = Math.max(maxConsecutiveWins, curWin);
    maxConsecutiveLosses = Math.max(maxConsecutiveLosses, curLoss);
  }

  // --- Avg trades/day & avg hold time ---
  const dayCount = Math.max(1, Math.round((lastDate.getTime() - firstDate.getTime()) / 86400000) + 1);
  const avgTradesPerDay = totalTrades / dayCount;
  const holdTimes: number[] = [];
  for (const t of ordered) {
    if (t.entryTime && t.exitTime) {
      const start = new Date(`${t.date}T${t.entryTime}:00`).getTime();
      let end = new Date(`${t.date}T${t.exitTime}:00`).getTime();
      if (end < start) end += 86400000; // crossed midnight
      holdTimes.push((end - start) / 60000);
    }
  }
  const avgHoldTimeMinutes = holdTimes.length ? holdTimes.reduce((s, v) => s + v, 0) / holdTimes.length : null;

  // --- Session stats ---
  const sessionMap = new Map<TradeSession, Trade[]>();
  for (const t of ordered) {
    if (!t.session) continue;
    if (!sessionMap.has(t.session)) sessionMap.set(t.session, []);
    sessionMap.get(t.session)!.push(t);
  }
  const sessionStats: SessionStat[] = Array.from(sessionMap.entries()).map(([session, ts]) => {
    const w = ts.filter((t) => t.result > 0).length;
    return {
      session,
      label: SESSION_LABELS[session],
      trades: ts.length,
      winRate: (w / ts.length) * 100,
      totalPnl: ts.reduce((s, t) => s + t.result, 0),
    };
  }).sort((a, b) => b.totalPnl - a.totalPnl);

  return {
    hasTrades: true,
    initialDeposit,
    finalBalance,
    totalReturnPct,
    cagrPct,
    yearsSpan,
    totalTrades,
    winCount,
    lossCount,
    winRatePct,
    lossRatePct,
    profitFactor,
    avgRRLabel,
    maxDrawdownPct: Math.abs(maxDrawdownPct),
    recoveryFactor,
    sharpeRatio,
    sortinoRatio,
    expectancyPct,
    bestMonth,
    worstMonth,
    largestWin,
    largestLoss,
    avgWin,
    avgLoss,
    equityCurve,
    monthlyReturns,
    avgDrawdownPct: Math.abs(avgDrawdownPct),
    longestDrawdownDays: Math.round(longestDrawdownDays),
    longestRecoveryDays: Math.round(longestRecoveryDays),
    rBuckets,
    rBucketsAvailable: withR.length > 0,
    avgWinR,
    avgLossR,
    maxConsecutiveWins,
    maxConsecutiveLosses,
    avgTradesPerDay,
    avgHoldTimeMinutes,
    sessionStats,
  };
}

export function formatHoldTime(minutes: number | null): string {
  if (minutes === null) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
