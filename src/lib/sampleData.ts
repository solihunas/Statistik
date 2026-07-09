import type { Trade } from './types';
import { makeTradeId } from './storage';

/** Deterministic pseudo-random generator so the demo is reproducible. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SESSIONS: Trade['session'][] = ['asia', 'london', 'newyork', 'overlap'];

export function generateSampleTrades(): Trade[] {
  const rand = mulberry32(42);
  const trades: Trade[] = [];
  const start = new Date('2025-01-06T00:00:00');
  let day = new Date(start);
  let riskBase = 15;

  for (let i = 0; i < 90 && trades.length < 60; i++) {
    day = new Date(day.getTime() + 86400000);
    const dow = day.getDay();
    if (dow === 0 || dow === 6) continue; // skip weekends
    if (rand() < 0.35) continue; // not every weekday has a trade

    const win = rand() < 0.56;
    const riskAmount = Math.round((riskBase + rand() * 5) * 100) / 100;
    const rMultiple = win ? 0.5 + rand() * 2.5 : -(0.3 + rand() * 1.1);
    const result = Math.round(riskAmount * rMultiple * 100) / 100;
    const entryHour = 6 + Math.floor(rand() * 15);
    const entryTime = `${String(entryHour).padStart(2, '0')}:${String(Math.floor(rand() * 60)).padStart(2, '0')}`;
    const holdMinutes = 20 + Math.floor(rand() * 180);
    const exitDate = new Date(day.getTime());
    exitDate.setHours(entryHour, 0, 0, 0);
    const exitTotal = new Date(exitDate.getTime() + holdMinutes * 60000);
    const exitTime = `${String(exitTotal.getHours()).padStart(2, '0')}:${String(exitTotal.getMinutes()).padStart(2, '0')}`;

    trades.push({
      id: makeTradeId(),
      date: day.toISOString().slice(0, 10),
      entryTime,
      exitTime,
      symbol: 'XAUUSD',
      direction: rand() < 0.5 ? 'buy' : 'sell',
      riskAmount,
      result,
      session: SESSIONS[Math.floor(rand() * SESSIONS.length)],
      notes: 'Data contoh',
    });
  }
  return trades;
}
