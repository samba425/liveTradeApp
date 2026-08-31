import { Component, OnInit, OnDestroy } from '@angular/core';
import { ColDef, GridApi } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import { CommonserviceService } from '../commonservice.service';

/** TradingView scanner column indexes (after price_book_fq at 58). */
const COL = {
  EMA9: 59,
  EMA100: 60,
  STOCH_K: 61,
  STOCH_D: 62,
  STOCH_K_1W: 63,
  STOCH_D_1W: 64,
  EMA9_1W: 65,
  EMA100_1W: 66,
  EMA9_60: 67,
  STOCH_K_60: 68,
  STOCH_D_60: 69,
  PIVOT_R1: 70,
  EMA9_5: 71,
  MACD_60: 72,
  MACD_SIGNAL_60: 73,
  CLOSE_60: 74,
  HIGH_60: 75,
};

/** Base columns used by intraday divergence (already in main scan). */
const BASE = {
  OPEN: 1,
  HIGH: 2,
  LOW: 3,
  CLOSE: 4,
  SMA200: 14,
  RSI_60: 42,
};

const MIN_VOLUME = 100000; // 1 lakh
const WATCHLIST_STORAGE_KEY = 'tradeSetupWatchlist';

type TradeMode = 'swing' | 'intraday';
type IntradaySide = 'long' | 'short';

interface SetupStock {
  name: string;
  close: number;
  side: 'LONG' | 'SHORT';
  divergence: boolean;
  divLabel: string;
  htfClose: number;
  htfEMA9: number;
  htfEMA100: number;
  htfStochK: number;
  htfStochD: number;
  htfLow: number;
  ltfEMA9: number;
  ltfStochK: number;
  ltfStochD: number;
  trendUp: boolean;
  oversold: boolean;
  aboveEMA9: boolean;
  ltfRetrace: boolean;
  ltfTrigger: boolean;
  stage: string;
  stageRank: number;
  signals: string;
  entry: number;
  stop: number;
  target: number;
  riskPct: number;
  rewardPct: number;
  rr: number;
  volume: number;
  relVol: number;
  sector: string;
  industry: string;
  sma200: number;
  sma200Cross: string;
  swingSmaMatch: boolean;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  tradeDate: string;
  tradeMode: TradeMode;
  stage: string;
  sma200Cross: string;
  side: string;
  close: number;
  entry: number;
  stop: number;
  target: number;
  rr: number;
  notes: string;
  status: 'todo' | 'done';
  autoCaptured: boolean;
  createdAt: string;
}

@Component({
  standalone: false,
  selector: 'app-swing-setup',
  templateUrl: './swing-setup.component.html',
  styleUrls: ['./swing-setup.component.css']
})
export class SwingSetupComponent implements OnInit, OnDestroy {

  private gridApi!: GridApi;
  private dataSub?: Subscription;

  tradeMode: TradeMode = 'swing';
  intradaySide: IntradaySide = 'long';
  activePanel: 'screener' | 'watchlist' = 'screener';

  watchlist: WatchlistItem[] = [];
  editingId: string | null = null;
  editDraft: Partial<WatchlistItem> = {};
  autoCaptureMatches = true;

  public rowSelection: 'single' | 'multiple' = 'multiple';
  public defaultColDef: ColDef = {
    editable: false,
    filter: true,
    flex: 1,
    minWidth: 100,
    resizable: true,
    sortable: true
  };

  inputValue: any[] = [];
  allData: SetupStock[] = [];
  filterData: SetupStock[] = [];
  rowData: SetupStock[] = [];

  pagination = true;
  paginationPageSize = 2500;

  isLoading = true;
  dataMessage = '';
  lastRefreshed: Date | null = null;
  private isFilteredView = false;

  htfMode: 'daily' | 'weekly' = 'daily';
  searchQuery = '';

  colDefs: ColDef[] = [];

  constructor(private commonservice: CommonserviceService) {
    this.buildColDefs();
  }

  ngOnInit(): void {
    this.loadWatchlist();
    this.dataSub = this.commonservice.getData.subscribe(data => {
      if (!data || data.length === 0) {
        this.isLoading = false;
        return;
      }
      this.isLoading = false;
      this.lastRefreshed = new Date();
      this.inputValue = data;
      this.processStocks();
    });
    this.commonservice.fetchLiveData(null);
  }

  ngOnDestroy(): void {
    this.dataSub?.unsubscribe();
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;
    if (this.searchQuery) {
      this.gridApi.setGridOption('quickFilterText', this.searchQuery);
    }
  }

  setTradeMode(mode: TradeMode): void {
    this.tradeMode = mode;
    this.isFilteredView = false;
    this.currentFilterFn = null;
    this.dataMessage = '';
    this.buildColDefs();
    this.processStocks();
  }

  setIntradaySide(side: IntradaySide): void {
    this.intradaySide = side;
    this.isFilteredView = false;
    this.currentFilterFn = null;
    this.dataMessage = '';
    this.processStocks();
  }

  private buildColDefs(): void {
    const stageStyle = (p: any) => {
      const s = p.value;
      if (s === 'ENTRY NOW') { return { backgroundColor: '#0a7d29', color: 'white', fontWeight: 'bold' }; }
      if (s === 'HTF READY') { return { backgroundColor: '#127d0a', color: 'white' }; }
      if (s === 'DIV READY' || s === 'DIV WATCH') { return { backgroundColor: '#0d6efd', color: 'white' }; }
      if (s === 'OVERSOLD - WAIT EMA9') { return { backgroundColor: '#8a6d0a', color: 'white' }; }
      if (s === 'PULLBACK - WATCH') { return { backgroundColor: '#7d5a0a', color: 'white' }; }
      return { backgroundColor: '#333', color: '#ccc' };
    };

    this.colDefs = [
      { field: 'name', headerName: 'Stock', minWidth: 110, pinned: 'left' },
      {
        headerName: 'Stage', field: 'stage', minWidth: 140, pinned: 'left',
        cellStyle: stageStyle
      }
    ];

    if (this.tradeMode === 'swing') {
      this.colDefs.push({
        headerName: 'SMA200', field: 'sma200Cross', minWidth: 120,
        cellStyle: (p) => {
          const v = p.value;
          if (v === 'Bullish Cross') { return { backgroundColor: '#0a7d29', color: 'white', fontWeight: 'bold' }; }
          if (v === 'Bearish Cross') { return { backgroundColor: '#b91c1c', color: 'white', fontWeight: 'bold' }; }
          return { backgroundColor: '#444', color: '#ccc' };
        }
      });
    }

    if (this.tradeMode === 'intraday') {
      this.colDefs.push(
        {
          headerName: 'Side', field: 'side', minWidth: 70, pinned: 'left',
          cellStyle: (p) => p.value === 'LONG'
            ? { backgroundColor: '#0a7d29', color: 'white', fontWeight: 'bold' }
            : { backgroundColor: '#b91c1c', color: 'white', fontWeight: 'bold' }
        },
        {
          headerName: 'Divergence', field: 'divLabel', minWidth: 110,
          cellStyle: (p) => p.data?.divergence
            ? { backgroundColor: '#1e40af', color: 'white', fontWeight: 'bold' }
            : { backgroundColor: '#444', color: '#ccc' }
        }
      );
    }

    this.colDefs.push(
      {
        headerName: 'Price', field: 'close', minWidth: 90, filter: 'agNumberColumnFilter',
        valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString()
      },
      {
        headerName: 'Volume', field: 'volume', minWidth: 100, filter: 'agNumberColumnFilter',
        valueFormatter: p => (Math.round(p.value)).toLocaleString()
      },
      { headerName: 'Signals', field: 'signals', minWidth: 220, flex: 2 },
      {
        headerName: 'Stop', field: 'stop', minWidth: 90, filter: 'agNumberColumnFilter',
        valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString()
      },
      {
        headerName: 'Target', field: 'target', minWidth: 90, filter: 'agNumberColumnFilter',
        valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString()
      },
      {
        headerName: 'R:R', field: 'rr', minWidth: 70, filter: 'agNumberColumnFilter',
        valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(),
        cellStyle: (p) => (p.value >= 2 ? { backgroundColor: 'green', color: 'white' } : (p.value >= 1 ? { backgroundColor: '#8a6d0a', color: 'white' } : { backgroundColor: 'red', color: 'white' }))
      },
      {
        headerName: 'Chart', field: 'name', sortable: false, minWidth: 70,
        cellRenderer: (params) => {
          const keyData = params.data.name;
          const interval = this.tradeMode === 'intraday' ? '5' : '60';
          return `<a style="color:#667eea;font-weight:600;" href="https://in.tradingview.com/chart/6QuU1TVy/?symbol=NSE%3A${keyData}&interval=${interval}" target="_blank">TV</a>`;
        }
      }
    );

    if (this.gridApi) {
      this.gridApi.setGridOption('columnDefs', this.colDefs);
    }
  }

  private num(v: any): number {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  }

  private refreshGrid(): void {
    if (this.gridApi) {
      this.gridApi.setGridOption('rowData', this.rowData);
      this.gridApi.setGridOption('columnDefs', this.colDefs);
    }
  }

  private minColumns(): number {
    return this.tradeMode === 'intraday' ? COL.HIGH_60 + 1 : COL.PIVOT_R1 + 1;
  }

  processStocks(): void {
    this.allData = [];
    this.dataMessage = '';

    const sample = this.inputValue[0]?.['d'];
    if (!sample || sample.length < this.minColumns()) {
      this.dataMessage = 'Setup columns missing from API. Restart local server (node server.js) and refresh.';
      this.rowData = [];
      this.refreshGrid();
      return;
    }

    this.inputValue.forEach((res) => {
      const d = res['d'];
      const row = this.tradeMode === 'intraday'
        ? this.buildIntradayRow(res)
        : this.buildSwingRow(res);
      if (row && d) {
        this.allData.push(this.enrichSma200(row, d));
      }
    });

    if (!this.isFilteredView) {
      this.rowData = this.allData
        .filter(s => this.defaultRowFilter(s))
        .sort((a, b) => b.stageRank - a.stageRank || b.rr - a.rr);
      if (this.rowData.length === 0 && this.allData.length > 0) {
        this.dataMessage = this.tradeMode === 'intraday'
          ? 'No intraday setups right now. Try Divergence filter or switch Long/Short.'
          : 'No uptrend setups right now. Try Oversold or Reset, or switch HTF mode.';
      }
    } else {
      this.applyCurrentFilter();
    }
    if (this.autoCaptureMatches && this.tradeMode === 'swing') {
      this.captureTodayMatches(false);
    }
    this.refreshGrid();
  }

  private todayKey(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private detectSma200Cross(low: number, high: number, close: number, sma200: number): string {
    if (!sma200 || !close) { return '—'; }
    if (low <= sma200 && close >= sma200) { return 'Bullish Cross'; }
    if (high >= sma200 && close <= sma200) { return 'Bearish Cross'; }
    return '—';
  }

  private enrichSma200(row: SetupStock, d: any[]): SetupStock {
    const sma200 = this.num(d[BASE.SMA200]);
    const low = this.num(d[BASE.LOW]);
    const high = this.num(d[BASE.HIGH]);
    const close = this.num(d[BASE.CLOSE]);
    const sma200Cross = this.detectSma200Cross(low, high, close, sma200);
    const swingSmaMatch = this.tradeMode === 'swing'
      && sma200Cross === 'Bullish Cross'
      && row.stageRank >= 3;
    const signals = row.signals
      ? (sma200Cross !== '—' ? `${row.signals}, ${sma200Cross}` : row.signals)
      : sma200Cross;
    return { ...row, sma200, sma200Cross, swingSmaMatch, signals };
  }

  loadWatchlist(): void {
    try {
      const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      this.watchlist = raw ? JSON.parse(raw) : [];
    } catch {
      this.watchlist = [];
    }
  }

  private persistWatchlist(): void {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(this.watchlist));
  }

  private stockToWatchItem(stock: SetupStock, autoCaptured: boolean): WatchlistItem {
    return {
      id: `${stock.name}-${this.todayKey()}-${this.tradeMode}-${Date.now()}`,
      symbol: stock.name,
      tradeDate: this.todayKey(),
      tradeMode: this.tradeMode,
      stage: stock.stage,
      sma200Cross: stock.sma200Cross,
      side: stock.side,
      close: stock.close,
      entry: stock.entry,
      stop: stock.stop,
      target: stock.target,
      rr: stock.rr,
      notes: '',
      status: 'todo',
      autoCaptured,
      createdAt: new Date().toISOString()
    };
  }

  private watchlistExists(symbol: string, tradeDate: string, mode: TradeMode): boolean {
    return this.watchlist.some(w =>
      w.symbol === symbol && w.tradeDate === tradeDate && w.tradeMode === mode && w.status === 'todo');
  }

  captureTodayMatches(showAlert = true): void {
    let added = 0;
    const date = this.todayKey();
    this.allData
      .filter(s => s.swingSmaMatch)
      .forEach(stock => {
        if (!this.watchlistExists(stock.name, date, this.tradeMode)) {
          this.watchlist.unshift(this.stockToWatchItem(stock, true));
          added++;
        }
      });
    if (added > 0) {
      this.persistWatchlist();
    }
    if (showAlert && added > 0) {
      this.dataMessage = `Added ${added} SMA200 + Swing match(es) to your watchlist for ${date}.`;
    }
  }

  addSelectedToWatchlist(): void {
    const selected = this.gridApi?.getSelectedRows() as SetupStock[] | undefined;
    if (!selected?.length) {
      this.dataMessage = 'Select one or more rows in the grid first.';
      return;
    }
    const date = this.todayKey();
    let added = 0;
    selected.forEach(stock => {
      if (!this.watchlistExists(stock.name, date, this.tradeMode)) {
        this.watchlist.unshift(this.stockToWatchItem(stock, false));
        added++;
      }
    });
    this.persistWatchlist();
    this.dataMessage = added
      ? `Added ${added} stock(s) to watchlist.`
      : 'Selected stocks are already on today\'s watchlist.';
    this.activePanel = 'watchlist';
  }

  setPanel(panel: 'screener' | 'watchlist'): void {
    this.activePanel = panel;
  }

  startEdit(item: WatchlistItem): void {
    this.editingId = item.id;
    this.editDraft = { ...item };
  }

  saveEdit(): void {
    if (!this.editingId) { return; }
    const idx = this.watchlist.findIndex(w => w.id === this.editingId);
    if (idx >= 0) {
      this.watchlist[idx] = {
        ...this.watchlist[idx],
        notes: this.editDraft.notes ?? '',
        entry: this.num(this.editDraft.entry),
        stop: this.num(this.editDraft.stop),
        target: this.num(this.editDraft.target),
        status: (this.editDraft.status as 'todo' | 'done') || 'todo'
      };
      this.persistWatchlist();
    }
    this.editingId = null;
    this.editDraft = {};
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editDraft = {};
  }

  deleteWatchlistItem(id: string): void {
    this.watchlist = this.watchlist.filter(w => w.id !== id);
    this.persistWatchlist();
    if (this.editingId === id) {
      this.cancelEdit();
    }
  }

  toggleWatchlistStatus(item: WatchlistItem): void {
    item.status = item.status === 'todo' ? 'done' : 'todo';
    this.persistWatchlist();
  }

  clearDoneWatchlist(): void {
    this.watchlist = this.watchlist.filter(w => w.status !== 'done');
    this.persistWatchlist();
  }

  get todoWatchlist(): WatchlistItem[] {
    return this.watchlist.filter(w => w.status === 'todo');
  }

  get doneWatchlist(): WatchlistItem[] {
    return this.watchlist.filter(w => w.status === 'done');
  }

  private defaultRowFilter(s: SetupStock): boolean {
    if (this.tradeMode === 'intraday') {
      return s.divergence || s.stageRank >= 2;
    }
    return s.trendUp;
  }

  /** Bullish div proxy: 1H price weak vs high, RSI not overbought, MACD turning up. */
  private bullishDivergence(d: any[]): { ok: boolean; label: string } {
    const close = this.num(d[BASE.CLOSE]);
    const dayHigh = this.num(d[BASE.HIGH]);
    const htfClose = this.num(d[COL.CLOSE_60]) || close;
    const htfHigh = this.num(d[COL.HIGH_60]) || dayHigh;
    const rsi60 = this.num(d[BASE.RSI_60]);
    const macd = this.num(d[COL.MACD_60]);
    const signal = this.num(d[COL.MACD_SIGNAL_60]);

    const priceWeak = htfHigh > 0 && htfClose < htfHigh * 0.995;
    const momentumUp = macd > signal && rsi60 > 28 && rsi60 < 52;
    const ok = priceWeak && momentumUp;
    return { ok, label: ok ? 'Bullish Div' : '' };
  }

  /** Bearish div proxy: 1H price firm vs low, RSI elevated, MACD turning down. */
  private bearishDivergence(d: any[]): { ok: boolean; label: string } {
    const close = this.num(d[BASE.CLOSE]);
    const dayLow = this.num(d[BASE.LOW]);
    const htfClose = this.num(d[COL.CLOSE_60]) || close;
    const rsi60 = this.num(d[BASE.RSI_60]);
    const macd = this.num(d[COL.MACD_60]);
    const signal = this.num(d[COL.MACD_SIGNAL_60]);

    const priceStrong = dayLow > 0 && htfClose > dayLow * 1.005;
    const nearHigh = this.num(d[BASE.HIGH]) > 0 && close >= this.num(d[BASE.HIGH]) * 0.992;
    const momentumDown = macd < signal && rsi60 > 48 && rsi60 < 72;
    const ok = (priceStrong || nearHigh) && momentumDown;
    return { ok, label: ok ? 'Bearish Div' : '' };
  }

  private buildIntradayRow(res: any): SetupStock | null {
    const d = res['d'];
    if (!d) { return null; }

    const close = this.num(d[BASE.CLOSE]);
    const dayHigh = this.num(d[BASE.HIGH]);
    const dayLow = this.num(d[BASE.LOW]);
    const ltfEMA9 = this.num(d[COL.EMA9_5]);
    const htfClose = this.num(d[COL.CLOSE_60]) || close;
    const htfHigh = this.num(d[COL.HIGH_60]) || dayHigh;

    if (!close || !ltfEMA9) { return null; }
    if (this.num(d[7]) < MIN_VOLUME) { return null; }

    const isLong = this.intradaySide === 'long';
    const div = isLong ? this.bullishDivergence(d) : this.bearishDivergence(d);

    const aboveLtfEma9 = close > ltfEMA9;
    const belowLtfEma9 = close < ltfEMA9;
    const ltfTrigger = isLong ? aboveLtfEma9 : belowLtfEma9;
    const ltfRetrace = isLong ? belowLtfEma9 : aboveLtfEma9;

    let stage = 'WATCH';
    let stageRank = 1;
    if (div.ok && ltfTrigger) {
      stage = 'ENTRY NOW';
      stageRank = 5;
    } else if (div.ok) {
      stage = 'DIV READY';
      stageRank = 4;
    } else if (ltfRetrace && (isLong ? close > dayLow : close < dayHigh)) {
      stage = 'DIV WATCH';
      stageRank = 2;
    }

    const signals: string[] = [];
    if (div.ok) { signals.push(div.label); }
    if (ltfTrigger) { signals.push(isLong ? '5m above EMA9' : '5m below EMA9'); }
    if (ltfRetrace) { signals.push('5m retrace EMA9'); }
    if (isLong && close >= dayHigh * 0.99) { signals.push('Near day high'); }
    if (!isLong && close <= dayLow * 1.01) { signals.push('Near day low'); }

    const entry = close;
    const stop = isLong
      ? (dayLow > 0 ? dayLow : close * 0.99)
      : (htfHigh > 0 ? htfHigh : dayHigh > 0 ? dayHigh : close * 1.01);
    let target = isLong
      ? (dayHigh > entry ? dayHigh : entry * 1.01)
      : (dayLow > 0 && dayLow < entry ? dayLow : entry * 0.99);

    const riskPct = entry > 0 ? (Math.abs(entry - stop) / entry) * 100 : 0;
    const rewardPct = entry > 0 ? (Math.abs(target - entry) / entry) * 100 : 0;
    const rr = riskPct > 0 ? rewardPct / riskPct : 0;

    return {
      name: d[0],
      close,
      side: isLong ? 'LONG' : 'SHORT',
      divergence: div.ok,
      divLabel: div.label || '—',
      htfClose,
      htfEMA9: ltfEMA9,
      htfEMA100: 0,
      htfStochK: this.num(d[COL.STOCH_K_60]),
      htfStochD: this.num(d[COL.STOCH_D_60]),
      htfLow: dayLow,
      ltfEMA9,
      ltfStochK: this.num(d[COL.STOCH_K_60]),
      ltfStochD: this.num(d[COL.STOCH_D_60]),
      trendUp: isLong,
      oversold: div.ok,
      aboveEMA9: aboveLtfEma9,
      ltfRetrace,
      ltfTrigger,
      stage,
      stageRank,
      signals: signals.join(', '),
      entry,
      stop,
      target,
      riskPct,
      rewardPct,
      rr,
      volume: this.num(d[7]),
      relVol: this.num(d[33]),
      sector: d[18],
      industry: d[31],
      sma200: 0,
      sma200Cross: '—',
      swingSmaMatch: false
    };
  }

  private buildSwingRow(res: any): SetupStock | null {
    const d = res['d'];
    if (!d) { return null; }

    const close = this.num(d[BASE.CLOSE]);
    const dailyLow = this.num(d[BASE.LOW]);

    let htfClose: number, htfEMA9: number, htfEMA100: number, htfStochK: number, htfStochD: number, htfLow: number;
    let ltfEMA9: number, ltfStochK: number, ltfStochD: number;

    if (this.htfMode === 'weekly') {
      htfClose = this.num(d[25]);
      htfEMA9 = this.num(d[COL.EMA9_1W]);
      htfEMA100 = this.num(d[COL.EMA100_1W]);
      htfStochK = this.num(d[COL.STOCH_K_1W]);
      htfStochD = this.num(d[COL.STOCH_D_1W]);
      htfLow = this.num(d[24]);
      ltfEMA9 = this.num(d[COL.EMA9]);
      ltfStochK = this.num(d[COL.STOCH_K]);
      ltfStochD = this.num(d[COL.STOCH_D]);
    } else {
      htfClose = close;
      htfEMA9 = this.num(d[COL.EMA9]);
      htfEMA100 = this.num(d[COL.EMA100]);
      htfStochK = this.num(d[COL.STOCH_K]);
      htfStochD = this.num(d[COL.STOCH_D]);
      htfLow = dailyLow;
      ltfEMA9 = this.num(d[COL.EMA9_60]);
      ltfStochK = this.num(d[COL.STOCH_K_60]);
      ltfStochD = this.num(d[COL.STOCH_D_60]);
    }

    if (!htfClose || !htfEMA100) { return null; }
    if (this.num(d[7]) < MIN_VOLUME) { return null; }

    const trendUp = htfClose > htfEMA100;
    const oversold = htfStochK > 0 && htfStochK < 20;
    const aboveEMA9 = htfClose > htfEMA9;
    const ltfRetrace = close < ltfEMA9;
    const ltfTrigger = close > ltfEMA9 && ltfStochK > ltfStochD;

    let stage = 'TREND';
    let stageRank = 1;
    if (trendUp && oversold && aboveEMA9 && ltfTrigger) {
      stage = 'ENTRY NOW'; stageRank = 5;
    } else if (trendUp && oversold && aboveEMA9) {
      stage = 'HTF READY'; stageRank = 4;
    } else if (trendUp && oversold && !aboveEMA9) {
      stage = 'OVERSOLD - WAIT EMA9'; stageRank = 3;
    } else if (trendUp && aboveEMA9 && ltfRetrace) {
      stage = 'PULLBACK - WATCH'; stageRank = 2;
    }

    const signals: string[] = [];
    if (trendUp) { signals.push('Above EMA100'); }
    if (oversold) { signals.push('Stoch<20'); }
    if (aboveEMA9) { signals.push('Above EMA9'); }
    if (ltfRetrace) { signals.push('LTF retrace'); }
    if (ltfTrigger) { signals.push('LTF trigger'); }

    const entry = htfClose;
    const stop = htfLow > 0 ? htfLow : dailyLow;
    const pivotHigh = this.num(d[COL.PIVOT_R1]);
    const high52 = this.num(d[28]);
    let target = pivotHigh > entry ? pivotHigh : high52;
    if (target <= entry) { target = entry * 1.05; }
    const riskPct = entry > 0 ? ((entry - stop) / entry) * 100 : 0;
    const rewardPct = entry > 0 ? ((target - entry) / entry) * 100 : 0;
    const rr = riskPct > 0 ? rewardPct / riskPct : 0;

    return {
      name: d[0],
      close,
      side: 'LONG',
      divergence: false,
      divLabel: '—',
      htfClose,
      htfEMA9,
      htfEMA100,
      htfStochK,
      htfStochD,
      htfLow,
      ltfEMA9,
      ltfStochK,
      ltfStochD,
      trendUp,
      oversold,
      aboveEMA9,
      ltfRetrace,
      ltfTrigger,
      stage,
      stageRank,
      signals: signals.join(', '),
      entry,
      stop,
      target,
      riskPct,
      rewardPct,
      rr,
      volume: this.num(d[7]),
      relVol: this.num(d[33]),
      sector: d[18],
      industry: d[31],
      sma200: 0,
      sma200Cross: '—',
      swingSmaMatch: false
    };
  }

  private currentFilterFn: ((s: SetupStock) => boolean) | null = null;

  private applyCurrentFilter(): void {
    if (this.currentFilterFn) {
      this.filterData = this.allData
        .filter(this.currentFilterFn)
        .sort((a, b) => b.stageRank - a.stageRank || b.rr - a.rr);
      this.rowData = this.filterData;
      this.refreshGrid();
    }
  }

  entryNow(): void {
    this.currentFilterFn = (s) => s.stage === 'ENTRY NOW';
    this.isFilteredView = true;
    this.applyCurrentFilter();
  }

  htfReady(): void {
    if (this.tradeMode === 'intraday') {
      this.currentFilterFn = (s) => s.divergence && (s.stage === 'DIV READY' || s.stage === 'ENTRY NOW');
    } else {
      this.currentFilterFn = (s) => s.stage === 'HTF READY' || s.stage === 'ENTRY NOW';
    }
    this.isFilteredView = true;
    this.applyCurrentFilter();
  }

  divergenceOnly(): void {
    this.currentFilterFn = (s) => s.divergence;
    this.isFilteredView = true;
    this.applyCurrentFilter();
  }

  oversoldWatch(): void {
    if (this.tradeMode === 'intraday') {
      this.divergenceOnly();
      return;
    }
    this.currentFilterFn = (s) => s.trendUp && s.oversold;
    this.isFilteredView = true;
    this.applyCurrentFilter();
  }

  pullback(): void {
    this.currentFilterFn = (s) =>
      s.stage === 'PULLBACK - WATCH' || s.stage === 'DIV WATCH';
    this.isFilteredView = true;
    this.applyCurrentFilter();
  }

  swingSmaMatch(): void {
    this.currentFilterFn = (s) => s.swingSmaMatch;
    this.isFilteredView = true;
    this.applyCurrentFilter();
  }

  goodRR(): void {
    this.currentFilterFn = (s) => s.stageRank >= 3 && s.rr >= 2;
    this.isFilteredView = true;
    this.applyCurrentFilter();
  }

  setHtf(mode: 'daily' | 'weekly'): void {
    this.htfMode = mode;
    this.processStocks();
  }

  reset(): void {
    this.isFilteredView = false;
    this.currentFilterFn = null;
    this.dataMessage = '';
    this.processStocks();
  }

  refreshData(): void {
    this.isLoading = true;
    this.dataMessage = '';
    this.commonservice.fetchLiveData(null);
  }

  onSearchInputChange(): void {
    if (this.gridApi) {
      this.gridApi.setGridOption('quickFilterText', this.searchQuery);
    }
  }

  onBtnExport(): void {
    const dte = new Date();
    const label = this.tradeMode === 'intraday' ? 'IntradaySetup' : 'SwingSetup';
    this.gridApi?.exportDataAsCsv({ fileName: `${label}(${dte.toLocaleDateString()}).csv` });
  }
}
