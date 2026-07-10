import type { Metrics } from '../lib/calculations';
import type { AppSettings } from '../lib/types';
import { fmtMoney, fmtPct, fmtNum } from '../lib/format';
import StatCard from './StatCard';
import EquityCurveChart from './EquityCurveChart';

interface Props {
  metrics: Metrics;
  settings: AppSettings;
}

export default function Dashboard({ metrics: m, settings }: Props) {
  if (!m.hasTrades) {
    return (
      <div className="border border-[#2c2c2a] bg-[#111110] rounded-lg p-8 text-center text-sm text-[#898781]">
        Belum ada trade untuk ditampilkan. Tambahkan trade di tab "Admin", atau muat data contoh untuk melihat pratinjau.
      </div>
    );
  }

  return (
    <div className="border border-[#2c2c2a] bg-[#111110] rounded-lg p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-base font-semibold text-white">{settings.accountName}</h2>
        <span className="text-[10px] uppercase tracking-widest text-[#898781]">{settings.instrumentLabel}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <StatCard label="Initial Deposit" value={fmtMoney(m.initialDeposit)} />
        <StatCard label="Final Balance" value={fmtMoney(m.finalBalance)} />
        <StatCard label="Total Return" value={fmtPct(m.totalReturnPct)} tone={m.totalReturnPct >= 0 ? 'good' : 'bad'} />
        <StatCard
          label={m.cagrPct === null ? 'CAGR (butuh ≥1 thn)' : 'CAGR'}
          value={m.cagrPct === null ? 'N/A' : fmtPct(m.cagrPct)}
          tone={m.cagrPct !== null && m.cagrPct >= 0 ? 'good' : 'default'}
        />
        <StatCard label="Max Drawdown" value={fmtPct(-m.maxDrawdownPct)} tone="bad" />
        <StatCard label="Win Rate" value={`${fmtNum(m.winRatePct)}%`} />
        <StatCard label="Profit Factor" value={m.profitFactor === null ? 'N/A' : fmtNum(m.profitFactor)} />
        <StatCard label="Total Trades" value={String(m.totalTrades)} />
      </div>

      <EquityCurveChart data={m.equityCurve} />

      <p className="text-center text-[10px] text-[#5a5a57] pt-2">
        Past performance is not indicative of future results.
      </p>
    </div>
  );
}
