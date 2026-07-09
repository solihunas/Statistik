import type { Trade } from '../lib/types';
import { fmtMoney } from '../lib/format';

interface Props {
  trades: Trade[];
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
}

const SESSION_LABEL: Record<string, string> = { asia: 'Asia', london: 'London', newyork: 'New York', overlap: 'Overlap' };

export default function TradeTable({ trades, onEdit, onDelete }: Props) {
  const sorted = [...trades].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  if (trades.length === 0) {
    return (
      <div className="border border-[#2c2c2a] bg-[#111110] rounded-lg p-8 text-center text-sm text-[#898781]">
        Belum ada trade. Tambahkan trade pertama Anda lewat form di atas.
      </div>
    );
  }

  return (
    <div className="border border-[#2c2c2a] bg-[#111110] rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[#898781] uppercase tracking-wide border-b border-[#2c2c2a]">
              <th className="text-left py-2 px-3 font-medium">Tanggal</th>
              <th className="text-left py-2 px-3 font-medium">Symbol</th>
              <th className="text-left py-2 px-3 font-medium">Arah</th>
              <th className="text-left py-2 px-3 font-medium hidden sm:table-cell">Sesi</th>
              <th className="text-right py-2 px-3 font-medium hidden md:table-cell">Risk</th>
              <th className="text-right py-2 px-3 font-medium">Result</th>
              <th className="text-right py-2 px-3 font-medium hidden sm:table-cell">R</th>
              <th className="text-right py-2 px-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t) => {
              const r = t.riskAmount ? t.result / t.riskAmount : null;
              return (
                <tr key={t.id} className="border-b border-[#1f1f1e] hover:bg-[#161615]">
                  <td className="py-2 px-3 text-[#c3c2b7] whitespace-nowrap">{t.date}</td>
                  <td className="py-2 px-3 text-white font-medium">{t.symbol}</td>
                  <td className="py-2 px-3">
                    <span className={t.direction === 'buy' ? 'text-[#0ca30c]' : 'text-[#e66767]'}>
                      {t.direction === 'buy' ? 'Buy' : 'Sell'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-[#898781] hidden sm:table-cell">{t.session ? SESSION_LABEL[t.session] : '—'}</td>
                  <td className="py-2 px-3 text-right text-[#898781] tabular-nums hidden md:table-cell">{t.riskAmount ? fmtMoney(t.riskAmount) : '—'}</td>
                  <td className={`py-2 px-3 text-right font-semibold tabular-nums whitespace-nowrap ${t.result >= 0 ? 'text-[#0ca30c]' : 'text-[#e66767]'}`}>
                    {fmtMoney(t.result)}
                  </td>
                  <td className="py-2 px-3 text-right text-[#898781] tabular-nums hidden sm:table-cell">{r !== null ? `${r.toFixed(2)}R` : '—'}</td>
                  <td className="py-2 px-3 text-right whitespace-nowrap">
                    <button onClick={() => onEdit(t)} className="text-[#3987e5] hover:underline mr-3">Edit</button>
                    <button onClick={() => onDelete(t.id)} className="text-[#e66767] hover:underline">Hapus</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
