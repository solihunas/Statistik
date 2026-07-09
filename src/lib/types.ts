export type TradeDirection = 'buy' | 'sell';

export type TradeSession = 'asia' | 'london' | 'newyork' | 'overlap';

export interface Trade {
  id: string;
  /** ISO date string, e.g. 2026-07-09 */
  date: string;
  entryTime?: string;
  exitTime?: string;
  symbol: string;
  direction: TradeDirection;
  entryPrice?: number;
  exitPrice?: number;
  lotSize?: number;
  /** Amount risked on this trade, used to derive R-multiple. Optional. */
  riskAmount?: number;
  /** Net profit/loss in account currency. This is the source of truth for money math. */
  result: number;
  session?: TradeSession;
  notes?: string;
}

export interface AppSettings {
  initialDeposit: number;
  accountName: string;
  instrumentLabel: string;
}

export interface AppState {
  settings: AppSettings;
  trades: Trade[];
}

export const DEFAULT_SETTINGS: AppSettings = {
  initialDeposit: 1000,
  accountName: 'Trading Journal',
  instrumentLabel: 'Multi-Instrument',
};
