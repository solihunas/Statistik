import type { AppState, Trade } from './types';
import { DEFAULT_SETTINGS } from './types';

const STORAGE_KEY = 'statistik.trading-journal.v1';

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { settings: DEFAULT_SETTINGS, trades: [] };
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      trades: Array.isArray(parsed.trades) ? parsed.trades : [],
    };
  } catch {
    return { settings: DEFAULT_SETTINGS, trades: [] };
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function makeTradeId(): string {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function exportStateToFile(state: AppState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const stamp = new Date().toISOString().slice(0, 10);
  a.download = `trading-journal-backup-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importStateFromJson(json: string): AppState {
  const parsed = JSON.parse(json) as Partial<AppState>;
  if (!Array.isArray(parsed.trades)) throw new Error('File tidak valid: field "trades" tidak ditemukan.');
  return {
    settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
    trades: parsed.trades as Trade[],
  };
}

export function exportTradesToCsv(trades: Trade[]): void {
  const headers = [
    'date', 'entryTime', 'exitTime', 'symbol', 'direction',
    'entryPrice', 'exitPrice', 'lotSize', 'riskAmount', 'result', 'session', 'notes',
  ];
  const rows = trades.map((t) =>
    headers.map((h) => {
      const v = (t as unknown as Record<string, unknown>)[h];
      if (v === undefined || v === null) return '';
      const s = String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    }).join(','),
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const stamp = new Date().toISOString().slice(0, 10);
  a.download = `trades-${stamp}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
