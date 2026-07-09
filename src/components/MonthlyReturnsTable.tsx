import type { MonthlyReturnRow } from '../lib/calculations';
import { fmtMoney } from '../lib/format';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface Props {
  rows: MonthlyReturnRow[];
}

function cellClass(v: number | null): string {
  if (v === null) return 'text-[#4a4a48]';
  if (v > 0) return 'text-[#0ca30c]';
  if (v < 0) return 'text-[#e66767]';
  return 'text-[#898781]';
}

export default function MonthlyReturnsTable({ rows }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse min-w-[820px]">
        <thead>
          <tr className="text-[#898781] uppercase tracking-wide">
            <th className="text-left py-1.5 pr-2 font-medium">Year</th>
            {MONTHS.map((m) => (
              <th key={m} className="text-right py-1.5 px-1.5 font-medium">{m}</th>
            ))}
            <th className="text-right py-1.5 px-2 font-medium">Year Return</th>
            <th className="text-right py-1.5 pl-2 font-medium">End Balance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.year} className="border-t border-[#2c2c2a]">
              <td className="py-1.5 pr-2 font-medium text-white">{row.year}</td>
              {row.months.map((m, i) => (
                <td key={i} className={`text-right py-1.5 px-1.5 tabular-nums ${cellClass(m)}`}>
                  {m === null ? '—' : m.toFixed(2)}
                </td>
              ))}
              <td className={`text-right py-1.5 px-2 font-semibold tabular-nums ${cellClass(row.yearReturnPct)}`}>
                {row.yearReturnPct === null ? '—' : `${row.yearReturnPct > 0 ? '+' : ''}${row.yearReturnPct.toFixed(2)}%`}
              </td>
              <td className="text-right py-1.5 pl-2 tabular-nums text-white">
                {row.endBalance === null ? '—' : fmtMoney(row.endBalance)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
