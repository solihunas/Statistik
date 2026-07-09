import type { Metrics } from '../lib/calculations';
import { formatHoldTime } from '../lib/calculations';
import type { AppSettings } from '../lib/types';
import { fmtMoney, fmtPct, fmtNum } from '../lib/format';
import StatCard from './StatCard';
import Panel from './Panel';
import EquityCurveChart from './EquityCurveChart';
import DrawdownChart from './DrawdownChart';
import MonthlyReturnsTable from './MonthlyReturnsTable';
import TradeDistributionChart from './TradeDistributionChart';
import WinLossDonut from './WinLossDonut';

interface Props {
  metrics: Metrics;
  settings: AppSettings;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#1f1f1e] last:border-0">
      <span className="text-[#898781]">{label}</span>
      <span className="text-white font-medium tabular-nums">{value}</span>
    </div>
  );
}

export default function Dashboard({ metrics: m, settings }: Props) {
  if (!m.hasTrades) {
    return (
      <div className="border border-[#2c2c2a] bg-[#111110] rounded-lg p-10 text-center text-sm text-[#898781]">
        Belum ada trade untuk ditampilkan. Tambahkan trade di tab "Input Data", atau muat data contoh dari sana untuk melihat pratinjau dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border border-[#2c2c2a] bg-[#111110] rounded-lg p-5">
        <div className="text-[11px] uppercase tracking-widest text-[#898781]">{settings.instrumentLabel}</div>
        <h2 className="text-xl md:text-2xl font-semibold text-white mt-1">{settings.accountName}</h2>
        <div className="flex flex-wrap gap-2 mt-4">
          <StatCard label="Initial Deposit" value={fmtMoney(m.initialDeposit)} />
          <StatCard label="Final Balance" value={fmtMoney(m.finalBalance)} />
          <StatCard label="Total Return" value={fmtPct(m.totalReturnPct)} tone={m.totalReturnPct >= 0 ? 'good' : 'bad'} />
          <StatCard
            label={m.cagrPct === null ? 'CAGR (butuh ≥1 thn data)' : `CAGR (${m.yearsSpan.toFixed(1)} Tahun)`}
            value={m.cagrPct === null ? 'N/A' : fmtPct(m.cagrPct)}
            tone={m.cagrPct !== null && m.cagrPct >= 0 ? 'good' : 'default'}
          />
          <StatCard label="Max Drawdown" value={fmtPct(-m.maxDrawdownPct)} tone="bad" />
        </div>
      </div>

      {/* Equity curve + performance summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="Equity Curve" className="lg:col-span-2">
          <EquityCurveChart data={m.equityCurve} />
        </Panel>
        <Panel title="Performance Summary">
          <div className="text-xs">
            <SummaryRow label="Initial Deposit" value={fmtMoney(m.initialDeposit)} />
            <SummaryRow label="Final Balance" value={fmtMoney(m.finalBalance)} />
            <SummaryRow label="Total Return" value={fmtPct(m.totalReturnPct)} />
            <SummaryRow label="CAGR" value={m.cagrPct === null ? 'N/A' : fmtPct(m.cagrPct)} />
            <SummaryRow label="Total Trades" value={String(m.totalTrades)} />
            <SummaryRow label="Win Rate" value={`${fmtNum(m.winRatePct)}%`} />
            <SummaryRow label="Profit Factor" value={m.profitFactor === null ? 'N/A' : fmtNum(m.profitFactor)} />
            <SummaryRow label="Average RR" value={m.avgRRLabel ?? 'N/A'} />
            <SummaryRow label="Max Drawdown" value={`${fmtNum(m.maxDrawdownPct)}%`} />
            <SummaryRow label="Recovery Factor" value={m.recoveryFactor === null ? 'N/A' : fmtNum(m.recoveryFactor)} />
            <SummaryRow label="Sharpe Ratio" value={m.sharpeRatio === null ? 'N/A' : fmtNum(m.sharpeRatio)} />
            <SummaryRow label="Sortino Ratio" value={m.sortinoRatio === null ? 'N/A' : fmtNum(m.sortinoRatio)} />
            <SummaryRow label="Expectancy" value={fmtPct(m.expectancyPct)} />
            <SummaryRow label="Best Month" value={m.bestMonth ? `${fmtPct(m.bestMonth.pct)} (${m.bestMonth.label})` : 'N/A'} />
            <SummaryRow label="Worst Month" value={m.worstMonth ? `${fmtPct(m.worstMonth.pct)} (${m.worstMonth.label})` : 'N/A'} />
          </div>
        </Panel>
      </div>

      {/* Monthly returns — full width to avoid clipping the 12-month table */}
      <Panel title="Monthly Returns (%) — Compounding">
        <MonthlyReturnsTable rows={m.monthlyReturns} />
      </Panel>

      {/* Drawdown + trade stats + R-multiple distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="Drawdown Analysis">
          <DrawdownChart data={m.equityCurve} />
          <div className="text-xs mt-3">
            <SummaryRow label="Maximum Drawdown" value={`${fmtNum(m.maxDrawdownPct)}%`} />
            <SummaryRow label="Average Drawdown" value={`${fmtNum(m.avgDrawdownPct)}%`} />
            <SummaryRow label="Longest Drawdown" value={`${m.longestDrawdownDays} Hari`} />
            <SummaryRow label="Longest Recovery" value={`${m.longestRecoveryDays} Hari`} />
          </div>
        </Panel>
        <Panel title="Trade Statistics">
          <div className="flex flex-col items-center gap-4">
            <WinLossDonut winCount={m.winCount} lossCount={m.lossCount} winRatePct={m.winRatePct} />
            <div className="text-xs w-full">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0ca30c] inline-block" />
                <span className="text-[#898781]">Winning Trades</span>
                <span className="ml-auto text-white font-medium">{m.winCount} ({fmtNum(m.winRatePct)}%)</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d03b3b] inline-block" />
                <span className="text-[#898781]">Losing Trades</span>
                <span className="ml-auto text-white font-medium">{m.lossCount} ({fmtNum(m.lossRatePct)}%)</span>
              </div>
              <SummaryRow label="Largest Win" value={fmtMoney(m.largestWin)} />
              <SummaryRow label="Largest Loss" value={fmtMoney(m.largestLoss)} />
              <SummaryRow label="Average Win" value={fmtMoney(m.avgWin)} />
              <SummaryRow label="Average Loss" value={fmtMoney(-m.avgLoss)} />
              <SummaryRow label="Total Trades" value={String(m.totalTrades)} />
            </div>
          </div>
        </Panel>
        <Panel title="Trade Distribution (R-Multiple)">
          {m.rBucketsAvailable ? (
            <>
              <TradeDistributionChart buckets={m.rBuckets} />
              <div className="text-center text-xs text-[#898781] mt-1">
                Average RR (Win/Loss): {m.avgWinR !== null && m.avgLossR !== null ? `1 : ${(m.avgWinR / m.avgLossR).toFixed(2)}` : 'N/A'}
              </div>
            </>
          ) : (
            <div className="text-xs text-[#898781] text-center py-10">
              Isi kolom "Risk Amount ($)" pada trade untuk melihat distribusi R-Multiple.
            </div>
          )}
        </Panel>
      </div>

      {/* Footer stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Panel title="Consecutive Stats">
          <SummaryRow label="Max Consecutive Wins" value={String(m.maxConsecutiveWins)} />
          <SummaryRow label="Max Consecutive Losses" value={String(m.maxConsecutiveLosses)} />
        </Panel>
        <Panel title="Daily Statistics">
          <SummaryRow label="Average Trades / Day" value={fmtNum(m.avgTradesPerDay)} />
          <SummaryRow label="Average Hold Time" value={formatHoldTime(m.avgHoldTimeMinutes)} />
        </Panel>
        <Panel title="Best / Worst">
          <SummaryRow label="Best Month" value={m.bestMonth ? `${fmtPct(m.bestMonth.pct)}` : 'N/A'} />
          <SummaryRow label="Worst Month" value={m.worstMonth ? `${fmtPct(m.worstMonth.pct)}` : 'N/A'} />
        </Panel>
        <Panel title="Execution Analysis">
          {m.sessionStats.length === 0 ? (
            <div className="text-xs text-[#898781]">Isi kolom "Sesi" pada trade untuk melihat analisis ini.</div>
          ) : (
            <>
              <SummaryRow label="Best Session" value={m.sessionStats[0]?.label ?? 'N/A'} />
              <SummaryRow label="Second Best" value={m.sessionStats[1]?.label ?? 'N/A'} />
              <SummaryRow label="Worst Session" value={m.sessionStats[m.sessionStats.length - 1]?.label ?? 'N/A'} />
            </>
          )}
        </Panel>
      </div>

      <p className="text-center text-[10px] text-[#5a5a57] pt-2">
        Semua angka dihitung otomatis dari trade yang Anda input. Past performance is not indicative of future results.
      </p>
    </div>
  );
}
