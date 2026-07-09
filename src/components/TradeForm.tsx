import { useEffect, useState } from 'react';
import type { Trade, TradeDirection, TradeSession } from '../lib/types';
import { makeTradeId } from '../lib/storage';

interface Props {
  editingTrade: Trade | null;
  onSave: (trade: Trade) => void;
  onCancelEdit: () => void;
  lastSymbol: string;
}

const emptyForm = (lastSymbol: string) => ({
  date: new Date().toISOString().slice(0, 10),
  entryTime: '',
  exitTime: '',
  symbol: lastSymbol,
  direction: 'buy' as TradeDirection,
  entryPrice: '',
  exitPrice: '',
  lotSize: '',
  riskAmount: '',
  result: '',
  session: '' as TradeSession | '',
  notes: '',
});

export default function TradeForm({ editingTrade, onSave, onCancelEdit, lastSymbol }: Props) {
  const [form, setForm] = useState(emptyForm(lastSymbol));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTrade) {
      setForm({
        date: editingTrade.date,
        entryTime: editingTrade.entryTime || '',
        exitTime: editingTrade.exitTime || '',
        symbol: editingTrade.symbol,
        direction: editingTrade.direction,
        entryPrice: editingTrade.entryPrice?.toString() ?? '',
        exitPrice: editingTrade.exitPrice?.toString() ?? '',
        lotSize: editingTrade.lotSize?.toString() ?? '',
        riskAmount: editingTrade.riskAmount?.toString() ?? '',
        result: editingTrade.result.toString(),
        session: editingTrade.session ?? '',
        notes: editingTrade.notes ?? '',
      });
    } else {
      setForm(emptyForm(lastSymbol));
    }
  }, [editingTrade, lastSymbol]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.date) return setError('Tanggal wajib diisi.');
    if (!form.symbol.trim()) return setError('Symbol/instrumen wajib diisi.');
    if (form.result === '' || Number.isNaN(Number(form.result))) return setError('Result ($) wajib diisi (boleh negatif untuk loss).');

    const trade: Trade = {
      id: editingTrade?.id ?? makeTradeId(),
      date: form.date,
      entryTime: form.entryTime || undefined,
      exitTime: form.exitTime || undefined,
      symbol: form.symbol.trim().toUpperCase(),
      direction: form.direction,
      entryPrice: form.entryPrice ? Number(form.entryPrice) : undefined,
      exitPrice: form.exitPrice ? Number(form.exitPrice) : undefined,
      lotSize: form.lotSize ? Number(form.lotSize) : undefined,
      riskAmount: form.riskAmount ? Number(form.riskAmount) : undefined,
      result: Number(form.result),
      session: form.session || undefined,
      notes: form.notes || undefined,
    };
    onSave(trade);
    if (!editingTrade) setForm(emptyForm(trade.symbol));
  }

  const inputCls =
    'w-full bg-[#1a1a19] border border-[#2c2c2a] rounded px-2.5 py-1.5 text-sm text-white placeholder:text-[#5a5a57] focus:outline-none focus:border-[#3987e5]';
  const labelCls = 'text-[11px] uppercase tracking-wide text-[#898781] mb-1 block';

  return (
    <form onSubmit={handleSubmit} className="border border-[#2c2c2a] bg-[#111110] rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold tracking-wide uppercase text-[#c3c2b7]">
          {editingTrade ? 'Edit Trade' : 'Catat Trade Baru'}
        </h3>
        {editingTrade && (
          <button type="button" onClick={onCancelEdit} className="text-xs text-[#898781] hover:text-white">
            Batal edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <div>
          <label className={labelCls}>Tanggal *</label>
          <input type="date" className={inputCls} value={form.date} onChange={(e) => set('date', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Symbol *</label>
          <input type="text" className={inputCls} placeholder="XAUUSD" value={form.symbol} onChange={(e) => set('symbol', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Arah</label>
          <select className={inputCls} value={form.direction} onChange={(e) => set('direction', e.target.value as TradeDirection)}>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Sesi</label>
          <select className={inputCls} value={form.session} onChange={(e) => set('session', e.target.value as TradeSession | '')}>
            <option value="">—</option>
            <option value="asia">Asia</option>
            <option value="london">London</option>
            <option value="newyork">New York</option>
            <option value="overlap">Overlap</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Entry Price</label>
          <input type="number" step="any" className={inputCls} value={form.entryPrice} onChange={(e) => set('entryPrice', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Exit Price</label>
          <input type="number" step="any" className={inputCls} value={form.exitPrice} onChange={(e) => set('exitPrice', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Lot Size</label>
          <input type="number" step="any" className={inputCls} value={form.lotSize} onChange={(e) => set('lotSize', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Risk Amount ($)</label>
          <input type="number" step="any" className={inputCls} value={form.riskAmount} onChange={(e) => set('riskAmount', e.target.value)} />
        </div>

        <div>
          <label className={labelCls}>Jam Entry</label>
          <input type="time" className={inputCls} value={form.entryTime} onChange={(e) => set('entryTime', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Jam Exit</label>
          <input type="time" className={inputCls} value={form.exitTime} onChange={(e) => set('exitTime', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Result ($) *</label>
          <input type="number" step="any" className={inputCls} placeholder="mis. 45.20 atau -18.50" value={form.result} onChange={(e) => set('result', e.target.value)} />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className={labelCls}>Catatan</label>
          <input type="text" className={inputCls} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </div>
      </div>

      {error && <div className="text-[#e66767] text-xs mt-3">{error}</div>}

      <div className="mt-4 flex gap-2">
        <button type="submit" className="bg-[#3987e5] hover:bg-[#2a78d6] text-white text-sm font-medium px-4 py-2 rounded">
          {editingTrade ? 'Simpan Perubahan' : 'Tambah Trade'}
        </button>
      </div>
    </form>
  );
}
