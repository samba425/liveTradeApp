import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ColDef, GridApi } from 'ag-grid-community'; // Column Definition Type Interface
import { CommonserviceService } from '../commonservice.service';

@Component({
  standalone: false,
  selector: 'app-open-high-close',

  templateUrl: './open-high-close.component.html',
  styleUrls: ['./open-high-close.component.css']
})
export class OpenHighCloseComponent implements OnInit {

  ngOnInit() {
  }
  public rowSelection: 'single' | 'multiple' = 'multiple';
  public defaultColDef: ColDef = {
    editable: false,
    filter: true,
    resizable: true,
    sortable: true,
  };
  
  // Row height configuration to prevent overlapping
  public rowHeight = 42;
  public headerHeight = 45;
  
  // Grid APIs to prevent full re-render on updates
  private gridApiHigh: GridApi;
  private gridApiLow: GridApi;
  
  inputValue: any = []
  rowData = [];
  rowDataHigh = [];
  rowDataLow = [];
  pagination = true;
  paginationPageSize = 20;
  isLoading = false;
  
  // Filter options
  filterWholeNumberOpen = false;
  filterPriceFrom = 0;
  filterPriceTo = 5000;
 
  
  colDefsOpenHigh: ColDef[] = [
    { 
      field: "name", 
      headerName: "Stock",
      sortable: true, 
      resizable: true,
      pinned: 'left',
      width: 180,
      cellStyle: { fontWeight: 'bold', color: '#667eea', cursor: 'pointer', fontSize: '14px' },
      cellRenderer: (params) => {
        return `
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <a href="https://www.tradingview.com/chart/?symbol=NSE:${params.value}" target="_blank" style="color: #667eea; text-decoration: none; font-weight: bold; font-size: 14px;">${params.value}</a>
            <i class="fas fa-copy" onclick="navigator.clipboard.writeText('${params.value}'); event.stopPropagation();" style="cursor: pointer; color: #9ca3af; font-size: 11px; margin-left: 6px; opacity: 0.7;" title="Copy ${params.value}"></i>
          </div>
        `;
      }
    },
    {
      headerName: "Close", 
      field: "close", 
      sortable: true,
      width: 110,
      valueFormatter: p => '₹' + (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter", 
      resizable: true,
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      },
      cellStyle: { fontWeight: '600' }
    },
    { 
      field: "open",
      headerName: "Open",
      resizable: true,
      sortable: true,
      width: 110,
      valueFormatter: p => '₹' + (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    { 
      field: "high",
      headerName: "High",
      resizable: true,
      sortable: true,
      width: 110,
      valueFormatter: p => '₹' + (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      },
      cellStyle: params => {
        return { color: '#10b981', fontWeight: '600' };
      }
    },
    { 
      field: "low",
      headerName: "Low",
      resizable: true,
      sortable: true,
      width: 110,
      valueFormatter: p => '₹' + (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      },
      cellStyle: params => {
        return { color: '#ef4444', fontWeight: '600' };
      }
    },
    {
      headerName: "Change %", 
      field: "change_from_open",
      width: 120,
      resizable: true, 
      sortable: true, 
      valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%', 
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      },
      cellStyle: params => {
        if (params.value > 0) {
          return { backgroundColor: '#d1fae5', color: '#065f46', fontWeight: 'bold' };
        } else if (params.value < 0) {
          return { backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 'bold' };
        }
        return {};
      }
    },
    {
      headerName: "SMA 20-50 Diff %", 
      field: "sma2050Diff",
      width: 130,
      resizable: true, 
      sortable: true, 
      valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%', 
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      },
      cellStyle: params => {
        if (params.value > 5) {
          return { backgroundColor: '#dbeafe', color: '#1e40af', fontWeight: '600' };
        } else if (params.value < 2) {
          return { backgroundColor: '#fef3c7', color: '#92400e', fontWeight: '600' };
        }
        return {};
      }
    },
    {
      headerName: "RSI", 
      field: "RSI",
      width: 90,
      resizable: true, 
      sortable: true, 
      valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), 
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      },
      cellStyle: params => {
        if (params.value > 70) {
          return { backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 'bold' };
        } else if (params.value < 30) {
          return { backgroundColor: '#d1fae5', color: '#065f46', fontWeight: 'bold' };
        } else if (params.value >= 50 && params.value <= 70) {
          return { backgroundColor: '#dbeafe', color: '#1e40af' };
        }
        return {};
      }
    },
    {
      headerName: "52W High", 
      field: "HIGH52",
      width: 110,
      resizable: true, 
      sortable: true, 
      valueFormatter: p => '₹' + (Math.round(p.value * 100) / 100).toLocaleString(), 
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      headerName: "Volume", 
      field: "volume",
      width: 120,
      resizable: true, 
      sortable: true,
      valueFormatter: p => {
        const val = p.value;
        if (val >= 10000000) return (val / 10000000).toFixed(2) + 'Cr';
        if (val >= 100000) return (val / 100000).toFixed(2) + 'L';
        if (val >= 1000) return (val / 1000).toFixed(2) + 'K';
        return val.toLocaleString();
      },
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      },
      cellStyle: params => {
        if (params.value > 1000000) {
          return { backgroundColor: '#fef3c7', color: '#92400e', fontWeight: 'bold' };
        }
        return {};
      }
    },
    {
      headerName: "Industry", 
      field: "industry",
      width: 150,
      resizable: true, 
      sortable: true, 
      filter: "agTextColumnFilter",
      minWidth: 180,
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      },
      cellStyle: { fontSize: '0.85rem', color: '#6b7280' }
    }
  ];
  
  // colDefsOpenLow: ColDef[] = [
  //   { field: "name", resizable:true ,sortable: true },
  //   { field: "close", resizable:true ,sortable: true, valueFormatter: p => Math.floor(p.value).toLocaleString() },
  //   { field: "open", resizable:true ,sortable: true, valueFormatter: p => Math.floor(p.value).toLocaleString() },
  //   { field: "low", resizable:true ,sortable: true, valueFormatter: p => Math.floor(p.value).toLocaleString() },
  //   { headerName: 'prev-present %', field: "change", resizable:true ,sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%' },
  //   { headerName: 'High-low %',field: "daychange", resizable:true ,sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%' },
  // ];
  openHigh = [];
  openLow = [];
  allData = []
  
  constructor(private http: HttpClient, private commonservice: CommonserviceService) {
    setTimeout(() => {
      this.fetchFirst5MinData()
    }, 100)
  }


  fetchLiveData() {
    // OLD METHOD - kept for reference but not used
    this.commonservice.getData.subscribe(data => {
      this.inputValue = data;
      this.getHighLow();
    });
  }
  
  fetchFirst5MinData() {
    // Fetch first 5-minute candle data for ALL stocks (no index filter)
    const url = `${this.commonservice.importUrl}getFirst5MinCandle`;
    
    this.isLoading = true;
    this.http.get(url).subscribe((data: any) => {
      console.log('First 5-min candle data (all stocks):', data);
      this.inputValue = data && data.data ? data.data : [];
      this.getHighLow();
      this.isLoading = false;
    }, error => {
      console.error('Error fetching first 5-min candle data:', error);
      this.isLoading = false;
    });
  }

  applyFilters() {
    // Re-run the pattern detection with current filter values
    this.getHighLow();
  }
  
  resetFilters() {
    this.filterWholeNumberOpen = false;
    this.filterPriceFrom = 0;
    this.filterPriceTo = 5000;
    this.getHighLow();
  }

  getHighLow() {
    this.openHigh = [];
    this.openLow = [];
    this.allData = [];
    
    this.inputValue.forEach((res) => {
      // Data structure from /getFirst5MinCandle endpoint:
      // IMPORTANT: This uses day's OHLC which equals first 5-min candle
      // ONLY if data is fetched during 9:15-9:20 AM IST
      // res['d'][0] = name
      // res['d'][1] = open (day's open = 9:15 AM open)
      // res['d'][2] = high (day's high so far)
      // res['d'][3] = low (day's low so far)
      // res['d'][4] = close (current close)
      // res['d'][5] = volume (total volume)
      
      const dayOpen = Number(res['d'][1]);
      const dayHigh = Number(res['d'][2]);
      const dayLow = Number(res['d'][3]);
      const currentClose = Number(res['d'][4]);
      const totalVolume = Number(res['d'][5]);
      
      // Skip if no data available
      if (!dayOpen || !dayHigh || !dayLow) {
        return;
      }
      
      // Apply filter: Open ends with .00 (whole number)
      if (this.filterWholeNumberOpen) {
        if (Math.floor(dayOpen) !== dayOpen) {
          return; // Skip if not a whole number
        }
      }
      
      // Apply filter: Price range
      if (dayOpen < this.filterPriceFrom || dayOpen > this.filterPriceTo) {
        return; // Skip if outside price range
      }
      
      // Open = High pattern (Bearish)
      // When checked at 9:20 AM, dayHigh = first 5-min candle high
      if (!(dayOpen - dayHigh) && dayOpen < 3000 && totalVolume > 300000) {
        const stockName = res['d'][0];
        this.openHigh.push({
          change_from_open: res['d'][7] ? Math.abs(res['d'][7]) : 0,
          change_from_open_abs: res['d'][7] || 0,
          name: stockName,
          close: currentClose,
          open: dayOpen,
          high: dayHigh,
          low: dayLow,
          change: res['d'][6] || 0,
          daychange: Math.abs(
            (100 * (dayHigh - dayLow)) /
            ((dayHigh + dayLow) / 2)
          ),
          sma2050Diff: res['d'][8] && res['d'][9] ? 
            ((Math.abs(Number(res['d'][8]) - Number(res['d'][9]))) /
            ((Number(res['d'][8]) + Number(res['d'][9])) / 2) * 100) : 0,
          volume: totalVolume,
          RSI: res['d'][10] || 0,
          MACD: res['d'][13] && res['d'][14] ? 
            Math.abs(Math.abs(res['d'][13]) - Math.abs(res['d'][14])) : 0,
          MACDMacd: res['d'][13] || 0,
          MACDSignal: res['d'][14] || 0,
          HIGH52: res['d'][12] || 0,
          industry: res['d'][15] || ''
        });
      } 
      // Open = Low pattern (Bullish)
      // When checked at 9:20 AM, dayLow = first 5-min candle low
      else if (!(dayOpen - dayLow) && dayOpen > 30 && dayOpen < 3000 && totalVolume > 300000) {
        const stockName = res['d'][0];
        this.openLow.push({
          change_from_open: res['d'][7] || 0,
          change_from_open_abs: res['d'][7] || 0,
          name: stockName,
          close: currentClose,
          open: dayOpen,
          high: dayHigh,
          low: dayLow,
          change: res['d'][6] || 0,
          daychange: Math.abs(
            (100 * (dayHigh - dayLow)) /
            ((dayHigh + dayLow) / 2)
          ),
          sma2050Diff: res['d'][8] && res['d'][9] ? 
            ((Math.abs(Number(res['d'][8]) - Number(res['d'][9]))) /
            ((Number(res['d'][8]) + Number(res['d'][9])) / 2) * 100) : 0,
          volume: totalVolume,
          RSI: res['d'][10] || 0,
          MACD: res['d'][13] && res['d'][14] ? 
            Math.abs(Math.abs(res['d'][13]) - Math.abs(res['d'][14])) : 0,
          MACDMacd: res['d'][13] || 0,
          MACDSignal: res['d'][14] || 0,
          HIGH52: res['d'][12] || 0,
          industry: res['d'][15] || ''
        });
      }
    });
    
    console.log('Open High Count:', this.openHigh.length);
    console.log('Open Low Count:', this.openLow.length);
    console.log('Sample Open High item:', this.openHigh[0]);
    
    setTimeout(() => {
      // Update data using Grid API to prevent re-render
      if (this.gridApiHigh) {
        this.gridApiHigh.setGridOption('rowData', this.openHigh);
        this.gridApiHigh.flashCells();
      } else {
        this.rowDataHigh = this.openHigh;
      }
      
      if (this.gridApiLow) {
        this.gridApiLow.setGridOption('rowData', this.openLow);
        this.gridApiLow.flashCells();
      } else {
        this.rowDataLow = this.openLow;
      }
      
      console.log('RowDataHigh Count:', this.rowDataHigh.length);
      console.log('RowDataLow Count:', this.rowDataLow.length);
    }, 100);
  }

  // Grid ready event handlers
  onGridReadyHigh(params: any) {
    this.gridApiHigh = params.api;
  }

  onGridReadyLow(params: any) {
    this.gridApiLow = params.api;
  }

}
