import { useState } from 'react';
import { parseTradesCsv, BULK_PROMPT_TEMPLATE } from '../lib/csv';
import type { Trade } from '../lib/types';

interface Props {
  onAddTrades: (trades: Trade[]) => void;
}

export default function BulkAddPanel({ onAddTrades }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [result, setResult] = useState<{ added: number; errors: { line: number; raw: string; message: string }[] } | null>(null);
  const [copied, setCopied] = useState(false);

  function handleCopyTemplate() {
    navigator.clipboard.writeText(BULK_PROMPT_TEMPLATE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function handleProcess() {
    const { trades, errors } = parseTradesCsv(text);
    if (trades.length) onAddTrades(trades);
    setResult({ added: trades.length, errors });
    if (trades.length && !errors.length) setText('');
  }

  return (
    <div className="border border-[#2c2c2a] bg-[#111110] rounded-lg p-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-xs font-semibold tracking-wide uppercase text-[#c3c2b7]">
          Tambah Cepat (Paste Banyak Trade Sekaligus)
        </h3>
        <span className="text-[#898781] text-xs">{open ? 'Tutup ▲' : 'Buka ▼'}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          <div className="bg-[#1a1a19] border border-[#2c2c2a] rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#898781]">
                Salin instruksi ini, kirim ke sesi AI lain (atau isi manual), lalu tempel hasilnya di kotak bawah. Satu baris = satu trade, format CSV.
              </p>
              <button
                onClick={handleCopyTemplate}
                className="shrink-0 ml-3 text-xs px-3 py-1.5 rounded border border-[#2c2c2a] text-[#c3c2b7] hover:border-[#3987e5] hover:text-white whitespace-nowrap"
              >
                {copied ? 'Tersalin ✓' : 'Salin Instruksi'}
              </button>
            </div>
            <pre className="text-[10px] text-[#5a5a57] whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
              {BULK_PROMPT_TEMPLATE}
            </pre>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={'2026-01-05,08:30,09:10,XAUUSD,buy,,,,15,45.20,london,\n2026-01-06,,,XAUUSD,sell,,,,12,-18.50,asia,'}
            rows={6}
            className="w-full bg-[#1a1a19] border border-[#2c2c2a] rounded px-3 py-2 text-xs text-white font-mono placeholder:text-[#5a5a57] focus:outline-none focus:border-[#3987e5]"
          />

          <div className="flex items-center gap-3">
            <button
              onClick={handleProcess}
              disabled={!text.trim()}
              className="bg-[#3987e5] hover:bg-[#2a78d6] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded"
            >
              Proses &amp; Tambahkan
            </button>
            {result && (
              <span className="text-xs text-[#898781]">
                {result.added} trade ditambahkan{result.errors.length > 0 ? `, ${result.errors.length} baris dilewati (error)` : ''}
              </span>
            )}
          </div>

          {result && result.errors.length > 0 && (
            <div className="text-xs bg-[#1a1211] border border-[#3b2c2c] rounded p-3 space-y-1 max-h-40 overflow-y-auto">
              {result.errors.map((e, i) => (
                <div key={i} className="text-[#e66767]">
                  Baris {e.line}: {e.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
