import { useRef } from 'react';
import type { AppSettings } from '../lib/types';

interface Props {
  settings: AppSettings;
  onChangeSettings: (s: AppSettings) => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  onImportJson: (file: File) => void;
  onLoadSample: () => void;
  onClearAll: () => void;
  hasTrades: boolean;
}

export default function SettingsBar({
  settings, onChangeSettings, onExportJson, onExportCsv, onImportJson, onLoadSample, onClearAll, hasTrades,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const inputCls = 'bg-[#1a1a19] border border-[#2c2c2a] rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-[#3987e5]';

  return (
    <div className="border border-[#2c2c2a] bg-[#111110] rounded-lg p-4 flex flex-wrap items-end gap-3">
      <div>
        <label className="text-[11px] uppercase tracking-wide text-[#898781] mb-1 block">Nama Akun</label>
        <input
          className={inputCls}
          value={settings.accountName}
          onChange={(e) => onChangeSettings({ ...settings, accountName: e.target.value })}
        />
      </div>
      <div>
        <label className="text-[11px] uppercase tracking-wide text-[#898781] mb-1 block">Instrumen</label>
        <input
          className={inputCls}
          value={settings.instrumentLabel}
          onChange={(e) => onChangeSettings({ ...settings, instrumentLabel: e.target.value })}
        />
      </div>
      <div>
        <label className="text-[11px] uppercase tracking-wide text-[#898781] mb-1 block">Initial Deposit ($)</label>
        <input
          type="number"
          step="any"
          className={`${inputCls} w-32`}
          value={settings.initialDeposit}
          onChange={(e) => onChangeSettings({ ...settings, initialDeposit: Number(e.target.value) || 0 })}
        />
      </div>

      <div className="flex-1" />

      <div className="flex flex-wrap gap-2">
        {!hasTrades && (
          <button onClick={onLoadSample} className="text-xs px-3 py-2 rounded border border-[#2c2c2a] text-[#c3c2b7] hover:border-[#3987e5] hover:text-white">
            Muat Data Contoh
          </button>
        )}
        <button onClick={onExportCsv} className="text-xs px-3 py-2 rounded border border-[#2c2c2a] text-[#c3c2b7] hover:border-[#3987e5] hover:text-white">
          Export CSV
        </button>
        <button onClick={onExportJson} className="text-xs px-3 py-2 rounded border border-[#2c2c2a] text-[#c3c2b7] hover:border-[#3987e5] hover:text-white">
          Export Backup (JSON)
        </button>
        <button onClick={() => fileRef.current?.click()} className="text-xs px-3 py-2 rounded border border-[#2c2c2a] text-[#c3c2b7] hover:border-[#3987e5] hover:text-white">
          Import Backup
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onImportJson(f);
            e.target.value = '';
          }}
        />
        {hasTrades && (
          <button onClick={onClearAll} className="text-xs px-3 py-2 rounded border border-[#2c2c2a] text-[#e66767] hover:border-[#e66767]">
            Hapus Semua
          </button>
        )}
      </div>
    </div>
  );
}
