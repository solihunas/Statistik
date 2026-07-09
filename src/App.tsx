import { useEffect, useMemo, useState } from 'react';
import type { AppSettings, Trade } from './lib/types';
import { loadState, saveState, exportStateToFile, importStateFromJson, exportTradesToCsv } from './lib/storage';
import { computeMetrics } from './lib/calculations';
import { generateSampleTrades } from './lib/sampleData';
import SettingsBar from './components/SettingsBar';
import TradeForm from './components/TradeForm';
import TradeTable from './components/TradeTable';
import Dashboard from './components/Dashboard';

type Tab = 'input' | 'dashboard';

function App() {
  const initial = useMemo(() => loadState(), []);
  const [settings, setSettings] = useState<AppSettings>(initial.settings);
  const [trades, setTrades] = useState<Trade[]>(initial.trades);
  const [tab, setTab] = useState<Tab>(initial.trades.length ? 'dashboard' : 'input');
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  useEffect(() => {
    saveState({ settings, trades });
  }, [settings, trades]);

  const metrics = useMemo(() => computeMetrics(trades, settings.initialDeposit), [trades, settings.initialDeposit]);

  function handleSaveTrade(trade: Trade) {
    setTrades((prev) => {
      const exists = prev.some((t) => t.id === trade.id);
      return exists ? prev.map((t) => (t.id === trade.id ? trade : t)) : [...prev, trade];
    });
    setEditingTrade(null);
  }

  function handleDeleteTrade(id: string) {
    if (!confirm('Hapus trade ini?')) return;
    setTrades((prev) => prev.filter((t) => t.id !== id));
    if (editingTrade?.id === id) setEditingTrade(null);
  }

  function handleImportJson(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = importStateFromJson(String(reader.result));
        setSettings(parsed.settings);
        setTrades(parsed.trades);
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Gagal membaca file backup.');
      }
    };
    reader.readAsText(file);
  }

  function handleClearAll() {
    if (!confirm('Hapus SEMUA trade? Tindakan ini tidak bisa dibatalkan (export backup dulu jika perlu).')) return;
    setTrades([]);
    setEditingTrade(null);
  }

  const lastSymbol = trades.length ? trades[trades.length - 1].symbol : 'XAUUSD';

  return (
    <div className="min-h-screen bg-[#0a0a0d]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-white">Trading Journal &amp; Report</h1>
            <p className="text-xs text-[#898781] mt-0.5">Catat trade Anda, laporan performa dihitung otomatis.</p>
          </div>
          <div className="flex gap-1 bg-[#141412] border border-[#2c2c2a] rounded-md p-1">
            <button
              onClick={() => setTab('input')}
              className={`text-xs px-3 py-1.5 rounded ${tab === 'input' ? 'bg-[#3987e5] text-white' : 'text-[#898781] hover:text-white'}`}
            >
              Input Data
            </button>
            <button
              onClick={() => setTab('dashboard')}
              className={`text-xs px-3 py-1.5 rounded ${tab === 'dashboard' ? 'bg-[#3987e5] text-white' : 'text-[#898781] hover:text-white'}`}
            >
              Dashboard
            </button>
          </div>
        </div>

        {tab === 'input' ? (
          <div className="space-y-4">
            <SettingsBar
              settings={settings}
              onChangeSettings={setSettings}
              onExportJson={() => exportStateToFile({ settings, trades })}
              onExportCsv={() => exportTradesToCsv(trades)}
              onImportJson={handleImportJson}
              onLoadSample={() => setTrades(generateSampleTrades())}
              onClearAll={handleClearAll}
              hasTrades={trades.length > 0}
            />
            <TradeForm
              editingTrade={editingTrade}
              onSave={handleSaveTrade}
              onCancelEdit={() => setEditingTrade(null)}
              lastSymbol={lastSymbol}
            />
            <TradeTable trades={trades} onEdit={setEditingTrade} onDelete={handleDeleteTrade} />
          </div>
        ) : (
          <Dashboard metrics={metrics} settings={settings} />
        )}
      </div>
    </div>
  );
}

export default App;
