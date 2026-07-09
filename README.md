# Trading Journal & Report

Aplikasi pencatat trade dengan dashboard performa yang dihitung otomatis dari data yang Anda input — terinspirasi dari format laporan backtest, tapi dipakai untuk trading nyata.

## Cara pakai

```
npm install
npm run dev
```

Buka tab **Input Data** untuk mencatat trade (tanggal, symbol, arah, entry/exit price, risk amount, result $, sesi). Tab **Dashboard** menampilkan laporan yang dihitung otomatis: equity curve, win rate, profit factor, drawdown, return bulanan, distribusi R-multiple, dan lainnya.

Data tersimpan di `localStorage` browser Anda (per device/browser). Gunakan tombol **Export Backup (JSON)** secara berkala untuk mem-backup data, dan **Import Backup** untuk memulihkannya di device lain.

## Kolom manual vs otomatis

**Input manual per trade:** tanggal, symbol, arah (buy/sell), entry/exit price, lot size, risk amount ($), result ($), sesi, jam entry/exit, catatan.

**Dihitung otomatis:** equity curve, total return, CAGR, win rate, profit factor, average RR, max/average drawdown, recovery factor, Sharpe & Sortino ratio, expectancy, return bulanan (compounding), distribusi R-multiple, consecutive win/loss, rata-rata trade/hari, rata-rata hold time, dan analisis sesi terbaik/terburuk.

CAGR baru ditampilkan setelah data mencakup ≥1 tahun — mengekstrapolasi sampel pendek ke angka tahunan mudah menyesatkan.
