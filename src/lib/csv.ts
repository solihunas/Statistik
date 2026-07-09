import type { Trade, TradeDirection, TradeSession } from './types';
import { makeTradeId } from './storage';

export const CSV_COLUMNS = [
  'date', 'entryTime', 'exitTime', 'symbol', 'direction',
  'entryPrice', 'exitPrice', 'lotSize', 'riskAmount', 'result', 'session', 'notes',
] as const;

const SESSION_VALUES: TradeSession[] = ['asia', 'london', 'newyork', 'overlap'];

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

export interface BulkParseResult {
  trades: Trade[];
  errors: { line: number; raw: string; message: string }[];
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export function parseTradesCsv(text: string): BulkParseResult {
  const trades: Trade[] = [];
  const errors: BulkParseResult['errors'] = [];

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const lineNo = i + 1;
    const cols = parseCsvLine(raw);

    // Skip an optional header row (e.g. "date,entryTime,...")
    if (i === 0 && cols[0]?.toLowerCase() === 'date' && cols[3]?.toLowerCase() === 'symbol') {
      continue;
    }

    if (cols.length < CSV_COLUMNS.length) {
      errors.push({ line: lineNo, raw, message: `Kolom kurang (dapat ${cols.length}, butuh ${CSV_COLUMNS.length}). Pastikan koma tetap ditulis untuk kolom kosong.` });
      continue;
    }

    const [date, entryTime, exitTime, symbol, directionRaw, entryPriceRaw, exitPriceRaw, lotSizeRaw, riskAmountRaw, resultRaw, sessionRaw, notes] = cols;

    if (!DATE_RE.test(date)) {
      errors.push({ line: lineNo, raw, message: `Tanggal "${date}" tidak valid, format harus YYYY-MM-DD.` });
      continue;
    }
    if (!symbol) {
      errors.push({ line: lineNo, raw, message: 'Symbol kosong.' });
      continue;
    }
    const direction = directionRaw.toLowerCase();
    if (direction !== 'buy' && direction !== 'sell') {
      errors.push({ line: lineNo, raw, message: `Arah "${directionRaw}" tidak valid, harus "buy" atau "sell".` });
      continue;
    }
    if (resultRaw === '' || Number.isNaN(Number(resultRaw))) {
      errors.push({ line: lineNo, raw, message: `Result "${resultRaw}" tidak valid, harus berupa angka.` });
      continue;
    }
    if (entryTime && !TIME_RE.test(entryTime)) {
      errors.push({ line: lineNo, raw, message: `Jam entry "${entryTime}" tidak valid, format harus HH:MM.` });
      continue;
    }
    if (exitTime && !TIME_RE.test(exitTime)) {
      errors.push({ line: lineNo, raw, message: `Jam exit "${exitTime}" tidak valid, format harus HH:MM.` });
      continue;
    }
    const session = sessionRaw.toLowerCase();
    if (session && !SESSION_VALUES.includes(session as TradeSession)) {
      errors.push({ line: lineNo, raw, message: `Sesi "${sessionRaw}" tidak valid, harus salah satu dari: asia, london, newyork, overlap (atau kosong).` });
      continue;
    }
    for (const [label, val] of [['Entry price', entryPriceRaw], ['Exit price', exitPriceRaw], ['Lot size', lotSizeRaw], ['Risk amount', riskAmountRaw]] as const) {
      if (val !== '' && Number.isNaN(Number(val))) {
        errors.push({ line: lineNo, raw, message: `${label} "${val}" harus berupa angka atau dikosongkan.` });
      }
    }
    if (errors.length && errors[errors.length - 1].line === lineNo) continue;

    trades.push({
      id: makeTradeId(),
      date,
      entryTime: entryTime || undefined,
      exitTime: exitTime || undefined,
      symbol: symbol.toUpperCase(),
      direction: direction as TradeDirection,
      entryPrice: entryPriceRaw ? Number(entryPriceRaw) : undefined,
      exitPrice: exitPriceRaw ? Number(exitPriceRaw) : undefined,
      lotSize: lotSizeRaw ? Number(lotSizeRaw) : undefined,
      riskAmount: riskAmountRaw ? Number(riskAmountRaw) : undefined,
      result: Number(resultRaw),
      session: (session || undefined) as TradeSession | undefined,
      notes: notes || undefined,
    });
  }

  return { trades, errors };
}

export const BULK_PROMPT_TEMPLATE = `Buatkan data trading dalam format CSV, satu baris per trade, dengan urutan kolom PERSIS seperti ini (jangan tambahkan header atau teks lain, langsung baris data):

date,entryTime,exitTime,symbol,direction,entryPrice,exitPrice,lotSize,riskAmount,result,session,notes

Ketentuan tiap kolom:
- date: format YYYY-MM-DD (wajib)
- entryTime, exitTime: format HH:MM 24 jam, boleh dikosongkan
- symbol: contoh XAUUSD, EURUSD (wajib)
- direction: hanya "buy" atau "sell" (wajib)
- entryPrice, exitPrice, lotSize: angka, boleh dikosongkan
- riskAmount: nominal risk dalam $ untuk trade ini, angka, boleh dikosongkan (dipakai untuk hitung R-multiple)
- result: hasil profit/loss trade dalam $, angka, boleh negatif untuk loss (wajib)
- session: hanya salah satu dari asia / london / newyork / overlap, boleh dikosongkan
- notes: teks bebas, boleh dikosongkan

PENTING: setiap baris harus tetap punya 12 kolom dipisah koma meskipun sebagian kosong (kosongkan tapi koma-nya tetap ditulis). Jangan bungkus dengan blok kode markdown, cukup teks polos.

Contoh:
2026-01-05,08:30,09:10,XAUUSD,buy,,,,15,45.20,london,
2026-01-06,,,XAUUSD,sell,,,,12,-18.50,asia,breakout gagal`;
