import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ColDef, GridOptions, GridApi } from 'ag-grid-community';
import { CommonserviceService } from '../commonservice.service';
import { Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-simple-moving',
  templateUrl: './simple-moving.component.html',
  styleUrls: ['./simple-moving.component.css']
})
export class SimpleMovingComponent implements OnInit, OnDestroy {

  private gridApi!: GridApi;
  private dataSubscription: Subscription;

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.dataSubscription) this.dataSubscription.unsubscribe();
  }
  public rowSelection: 'single' | 'multiple' = 'multiple';
  public defaultColDef: ColDef = {
    editable: false,
    filter: true,
    resizable: true,
    sortable: true
  };
  inputValue: any = []
  rowData = [];
  rowDataHigh = [];
  rowDataLow = [];
  pagination = true;
  paginationPageSize = 20;
  isLoading = false;
  filterData = []
  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [
    { 
      headerName: "📊 Stock",
      field: "name", 
      sortable: true, 
      resizable: true,
      width: 180,
      pinned: 'left',
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
      headerName: "💰 Close", 
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
      headerName: "📊 Change %", 
      field: "change_from_open", 
      resizable: true, 
      sortable: true, 
      width: 120,
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      },
      valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%', 
      cellStyle: function (params) {
        if (params.value > 0) {
          return { backgroundColor: '#d1fae5', color: '#065f46', fontWeight: 'bold' };
        } else {
          return { backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 'bold' };
        }
      }
    },
    // {
    //   headerName: "📊 SMA Diff %", 
    //   field: "sma2050Diff", 
    //   resizable: true, 
    //   sortable: true, 
    //   width: 130,
    //   valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%', 
    //   filter: "agNumberColumnFilter",
    //   filterParams: {
    //     numAlwaysVisibleConditions: 2,
    //     defaultJoinOperator: "OR"
    //   },
    //   cellStyle: params => {
    //     if (params.value > 5) {
    //       return { backgroundColor: '#dbeafe', color: '#1e40af', fontWeight: '600' };
    //     } else if (params.value < 2) {
    //       return { backgroundColor: '#fef3c7', color: '#92400e', fontWeight: '600' };
    //     }
    //     return {};
    //   }
    // },
    // {
    //   headerName: "📈 SMA 20", 
    //   field: "sma20", 
    //   resizable: true, 
    //   sortable: true, 
    //   width: 110,
    //   valueFormatter: p => '₹' + (Math.round(p.value * 100) / 100).toLocaleString(),
    //   filter: "agNumberColumnFilter",
    //   filterParams: {
    //     numAlwaysVisibleConditions: 2,
    //     defaultJoinOperator: "OR"
    //   }
    // },
    // {
    //   headerName: "📈 SMA 50", 
    //   field: "sma50", 
    //   resizable: true, 
    //   sortable: true, 
    //   width: 110,
    //   valueFormatter: p => '₹' + (Math.round(p.value * 100) / 100).toLocaleString(),
    //   filter: "agNumberColumnFilter",
    //   filterParams: {
    //     numAlwaysVisibleConditions: 2,
    //     defaultJoinOperator: "OR"
    //   }
    // },
    {
      headerName: "📈 SMA 200", 
      field: "godFather", 
      resizable: true, 
      sortable: true, 
      width: 120,
      valueFormatter: p => '₹' + (Math.round(p.value * 100) / 100).toLocaleString(), 
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      headerName: "📊 200 SMA Diff%", 
      field: "godFatherDiffPer", 
      resizable: true, 
      sortable: true, 
      width: 140,
      valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%', 
      filter: "agNumberColumnFilter",
      cellStyle: function (params) {
        if (params.value > 0) {
          return { backgroundColor: '#d1fae5', color: '#065f46', fontWeight: 'bold' };
        } else {
          return { backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 'bold' };
        }
      }, 
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      headerName: "🕯️ Pattern",
      field: "pattern",
      resizable: true,
      sortable: true,
      width: 180,
      filter: "agTextColumnFilter",
      hide: true,
      cellStyle: params => {
        const pattern = params.value || 'No Pattern';
        if (pattern.includes('Dragonfly')) return { backgroundColor: '#d1fae5', color: '#065f46', fontWeight: 'bold' };
        if (pattern.includes('Gravestone')) return { backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 'bold' };
        if (pattern.includes('Bullish Hammer')) return { backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 'bold' };
        if (pattern.includes('Bearish Hammer')) return { backgroundColor: '#fed7aa', color: '#9a3412', fontWeight: 'bold' };
        if (pattern.includes('Inverted')) return { backgroundColor: '#e0e7ff', color: '#3730a3', fontWeight: 'bold' };
        if (pattern.includes('Shooting Star')) return { backgroundColor: '#fecaca', color: '#7f1d1d', fontWeight: 'bold' };
        if (pattern.includes('Spinning Top')) return { backgroundColor: '#fef3c7', color: '#78350f', fontWeight: 'bold' };
        if (pattern.includes('Strong Bullish Cross')) return { backgroundColor: '#bbf7d0', color: '#14532d', fontWeight: 'bold' };
        if (pattern.includes('Bullish Marubozu')) return { backgroundColor: '#bfdbfe', color: '#1e3a8a', fontWeight: 'bold' };
        if (pattern.includes('Classic')) return { backgroundColor: '#fef3c7', color: '#92400e', fontWeight: 'bold' };
        return { color: '#9ca3af' };
      }
    },
    {
      headerName: "💪 Strength",
      field: "strength",
      resizable: true,
      sortable: true,
      width: 120,
      filter: "agNumberColumnFilter",
      hide: true,
      valueFormatter: p => {
        if (!p.value) return '-';
        const strength = p.value;
        if (strength >= 85) return `${strength} 🔥`;
        if (strength >= 75) return `${strength} ✅`;
        if (strength >= 65) return `${strength} 👍`;
        if (strength >= 55) return `${strength} 👌`;
        return `${strength}`;
      },
      cellStyle: params => {
        const strength = params.value || 0;
        if (strength >= 85) return { backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 'bold' };
        if (strength >= 75) return { backgroundColor: '#dbeafe', color: '#1e40af', fontWeight: 'bold' };
        if (strength >= 65) return { backgroundColor: '#fef3c7', color: '#92400e', fontWeight: 'bold' };
        return {};
      }
    },
    {
      headerName: "📍 SMA Position",
      field: "smaPosition",
      resizable: true,
      sortable: true,
      width: 160,
      filter: "agTextColumnFilter",
      hide: true,
      cellStyle: params => {
        const position = params.value || '';
        if (position.includes('Bouncing Above')) return { backgroundColor: '#d1fae5', color: '#065f46', fontWeight: 'bold' };
        if (position.includes('Testing Below')) return { backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 'bold' };
        if (position.includes('On SMA200')) return { backgroundColor: '#fef3c7', color: '#92400e', fontWeight: 'bold' };
        return {};
      }
    },
    {
      headerName: "🎯 Signal",
      field: "signal",
      resizable: true,
      sortable: true,
      width: 110,
      filter: "agTextColumnFilter",
      hide: true,
      cellStyle: params => {
        const signal = params.value || '';
        if (signal.includes('Bullish')) return { backgroundColor: '#d1fae5', color: '#065f46', fontWeight: 'bold' };
        if (signal.includes('Bearish')) return { backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 'bold' };
        return {};
      }
    },
    {
      headerName: "🏆 Fund Score",
      field: "fundScore",
      resizable: true,
      sortable: true,
      width: 130,
      filter: "agNumberColumnFilter",
      cellRenderer: params => {
        if (params.value == null) return '';
        const score = params.value;
        const rating = params.data?.fundRating || '';
        let color = '#ef4444'; let bg = '#fee2e2'; let emoji = '🔴';
        if (rating === 'Strong Buy') { color = '#047857'; bg = '#a7f3d0'; emoji = '🏆'; }
        else if (rating === 'Buy') { color = '#059669'; bg = '#d1fae5'; emoji = '🟢'; }
        else if (rating === 'Hold') { color = '#d97706'; bg = '#fef3c7'; emoji = '🟡'; }
        return `<span style="background:${bg}; color:${color}; padding:2px 8px; border-radius:12px; font-weight:bold; font-size:13px;">${emoji} ${score}/21.5</span>`;
      }
    },
    {
      headerName: "📊 Rating",
      field: "fundRating",
      resizable: true,
      sortable: true,
      width: 120,
      filter: "agTextColumnFilter",
      cellStyle: params => {
        if (params.value === 'Strong Buy') return { backgroundColor: '#a7f3d0', color: '#047857', fontWeight: 'bold', fontSize: '13px' };
        if (params.value === 'Buy') return { backgroundColor: '#d1fae5', color: '#059669', fontWeight: 'bold', fontSize: '13px' };
        if (params.value === 'Hold') return { backgroundColor: '#fef3c7', color: '#d97706', fontWeight: 'bold', fontSize: '13px' };
        if (params.value === 'Weak') return { backgroundColor: '#fee2e2', color: '#ef4444', fontWeight: 'bold', fontSize: '13px' };
        return {};
      }
    },
    {
      headerName: "🎯 Entry",
      field: "entryRisk",
      resizable: true,
      sortable: true,
      width: 140,
      filter: "agTextColumnFilter",
      cellRenderer: params => {
        if (!params.value) return '';
        const dist = Math.abs(params.data?.godFatherDiffPer || 0);
        if (params.value === 'Ideal Entry') return `<span style="background:#a7f3d0; color:#047857; padding:2px 8px; border-radius:12px; font-weight:bold; font-size:12px;">🎯 Ideal (${dist.toFixed(0)}%)</span>`;
        if (params.value === 'Good Entry') return `<span style="background:#d1fae5; color:#059669; padding:2px 8px; border-radius:12px; font-weight:bold; font-size:12px;">✅ Good (${dist.toFixed(0)}%)</span>`;
        if (params.value === 'Extended') return `<span style="background:#fef3c7; color:#92400e; padding:2px 8px; border-radius:12px; font-weight:bold; font-size:12px;">⚠️ Wait (${dist.toFixed(0)}%)</span>`;
        if (params.value === 'Overextended') return `<span style="background:#fee2e2; color:#991b1b; padding:2px 8px; border-radius:12px; font-weight:bold; font-size:12px;">🚫 Far (${dist.toFixed(0)}%)</span>`;
        return params.value;
      }
    },
    {
      headerName: "📋 Fund Details",
      field: "fundDetails",
      resizable: true,
      sortable: true,
      width: 200,
      filter: "agTextColumnFilter",
      hide: true,
      cellStyle: { fontSize: '12px', color: '#555' }
    },
    {
      headerName: "📦 Volume",
      field: "volume", 
      resizable: true, 
      sortable: true,
      width: 120,
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
      }
    },
    {
      headerName: "💹 RSI", 
      field: "RSI", 
      resizable: true, 
      sortable: true, 
      width: 100,
      valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), 
      filter: "agNumberColumnFilter",
      cellStyle: params => {
        if (params.value > 70) {
          return { backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 'bold' };
        } else if (params.value < 30) {
          return { backgroundColor: '#d1fae5', color: '#065f46', fontWeight: 'bold' };
        } else if (params.value >= 50 && params.value <= 70) {
          return { backgroundColor: '#dbeafe', color: '#1e40af' };
        }
        return {};
      },
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    // {
    //   headerName: "📊 MACD", 
    //   field: "MACD", 
    //   resizable: true, 
    //   sortable: true, 
    //   width: 110,
    //   valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), 
    //   filter: "agNumberColumnFilter",
    //   filterParams: {
    //     numAlwaysVisibleConditions: 2,
    //     defaultJoinOperator: "OR"
    //   }
    // },
    // {
    //   headerName: "🔵 MACD Signal", 
    //   field: "MACDMacd", 
    //   resizable: true, 
    //   sortable: true, 
    //   width: 130,
    //   valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), 
    //   filter: "agNumberColumnFilter",
    //   filterParams: {
    //     numAlwaysVisibleConditions: 2,
    //     defaultJoinOperator: "OR"
    //   }
    // },
    {
      headerName: "📈 52W High", 
      field: "HIGH52", 
      resizable: true, 
      sortable: true, 
      width: 120,
      valueFormatter: p => '₹' + (Math.round(p.value * 100) / 100).toLocaleString(), 
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      headerName: "52 Low", field: "LOW52", resizable: true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      headerName: "industry", field: "industry", resizable: true, sortable: true, filter: "agNumberColumnFilter",minWidth: 150,
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      headerName: "scannerLink", resizable: true, field: 'name', sortable: true, minWidth: 150,
      cellRenderer: function (params) {
        let keyData = params.data.name;
        let newLink =
          `<a style="color:#007bff;" href= https://www.screener.in/company/${keyData}
      target="_blank">screener</a>  |  <a style="color:#007bff;" href= https://in.tradingview.com/chart/6QuU1TVy/?symbol=NSE%3A${keyData}
      target="_blank">chart</a>`;
        return newLink;
      }
    },
    {
      headerName: "D/E", field: "debt_to_equity", resizable: true, sortable: true, width: 90,
      valueFormatter: p => p.value != null ? (Math.round(p.value * 100) / 100).toLocaleString() : '-',
      filter: "agNumberColumnFilter",
      cellStyle: p => p.value != null && p.value < 0.2 ? { color: '#059669', fontWeight: 'bold' } : {},
      filterParams: { numAlwaysVisibleConditions: 2, defaultJoinOperator: "OR" }
    },
    {
      headerName: "ROE%", field: "roe", resizable: true, sortable: true, width: 90,
      valueFormatter: p => p.value != null ? (Math.round(p.value * 100) / 100) + '%' : '-',
      filter: "agNumberColumnFilter",
      cellStyle: p => p.value != null && p.value >= 15 ? { color: '#059669', fontWeight: 'bold' } : {},
      filterParams: { numAlwaysVisibleConditions: 2, defaultJoinOperator: "OR" }
    },
    {
      headerName: "ROCE%", field: "roce", resizable: true, sortable: true, width: 90,
      valueFormatter: p => p.value != null ? (Math.round(p.value * 100) / 100) + '%' : '-',
      filter: "agNumberColumnFilter",
      cellStyle: p => p.value != null && p.value >= 15 ? { color: '#059669', fontWeight: 'bold' } : {},
      filterParams: { numAlwaysVisibleConditions: 2, defaultJoinOperator: "OR" }
    },
    {
      headerName: "PE", field: "pe", resizable: true, sortable: true, width: 90,
      valueFormatter: p => p.value != null ? (Math.round(p.value * 100) / 100).toLocaleString() : '-',
      filter: "agNumberColumnFilter",
      cellStyle: p => p.value != null && p.value > 0 && p.value < 25 ? { color: '#059669', fontWeight: 'bold' } : {},
      filterParams: { numAlwaysVisibleConditions: 2, defaultJoinOperator: "OR" }
    },
    {
      headerName: "1Y Rev%", field: "revenueGrowth1Y", resizable: true, sortable: true, width: 100,
      valueFormatter: p => p.value != null ? (Math.round(p.value * 100) / 100) + '%' : '-',
      filter: "agNumberColumnFilter",
      cellStyle: p => p.value != null && p.value >= 10 ? { color: '#059669', fontWeight: 'bold' } : {},
      filterParams: { numAlwaysVisibleConditions: 2, defaultJoinOperator: "OR" }
    },
    {
      headerName: "1Y Profit%", field: "profitGrowth1Y", resizable: true, sortable: true, width: 110,
      valueFormatter: p => p.value != null ? (Math.round(p.value * 100) / 100) + '%' : '-',
      filter: "agNumberColumnFilter",
      cellStyle: p => p.value != null && p.value >= 10 ? { color: '#059669', fontWeight: 'bold' } : {},
      filterParams: { numAlwaysVisibleConditions: 2, defaultJoinOperator: "OR" }
    },
    {
      headerName: "OPM%", field: "operatingMargin", resizable: true, sortable: true, width: 90,
      valueFormatter: p => p.value != null ? (Math.round(p.value * 100) / 100) + '%' : '-',
      filter: "agNumberColumnFilter",
      cellStyle: p => p.value != null && p.value > 15 ? { color: '#059669', fontWeight: 'bold' } : {},
      filterParams: { numAlwaysVisibleConditions: 2, defaultJoinOperator: "OR" }
    },
    {
      headerName: "5Y Rev%", field: "revenueGrowth5Y", resizable: true, sortable: true, width: 100,
      valueFormatter: p => p.value != null ? (Math.round(p.value * 100) / 100) + '%' : '-',
      filter: "agNumberColumnFilter",
      cellStyle: p => p.value != null && p.value >= 10 ? { color: '#059669', fontWeight: 'bold' } : {},
      filterParams: { numAlwaysVisibleConditions: 2, defaultJoinOperator: "OR" }
    },
    {
      headerName: "5Y Profit%", field: "profitGrowth5Y", resizable: true, sortable: true, width: 110,
      valueFormatter: p => p.value != null ? (Math.round(p.value * 100) / 100) + '%' : '-',
      filter: "agNumberColumnFilter",
      cellStyle: p => p.value != null && p.value >= 10 ? { color: '#059669', fontWeight: 'bold' } : {},
      filterParams: { numAlwaysVisibleConditions: 2, defaultJoinOperator: "OR" }
    },
    {
      headerName: "QoQ NI%", field: "qoqNetIncomeGrowth", resizable: true, sortable: true, width: 100,
      valueFormatter: p => p.value != null ? (Math.round(p.value * 100) / 100) + '%' : '-',
      filter: "agNumberColumnFilter",
      cellStyle: p => p.value != null && p.value > 0 ? { color: '#059669', fontWeight: 'bold' } : {},
      filterParams: { numAlwaysVisibleConditions: 2, defaultJoinOperator: "OR" }
    },
    {
      headerName: "Ind PE", field: "industryPE", resizable: true, sortable: true, width: 90,
      valueFormatter: p => p.value != null ? (Math.round(p.value * 10) / 10).toLocaleString() : '-',
      filter: "agNumberColumnFilter",
      filterParams: { numAlwaysVisibleConditions: 2, defaultJoinOperator: "OR" }
    },
    {
      headerName: "FCF%", field: "fcfMargin", resizable: true, sortable: true, width: 90,
      valueFormatter: p => p.value != null ? (Math.round(p.value * 100) / 100) + '%' : '-',
      filter: "agNumberColumnFilter",
      cellStyle: p => p.value != null && p.value > 5 ? { color: '#059669', fontWeight: 'bold' } : {},
      filterParams: { numAlwaysVisibleConditions: 2, defaultJoinOperator: "OR" }
    },
    {
      headerName: "Div%", field: "dividendYield", resizable: true, sortable: true, width: 80,
      valueFormatter: p => p.value != null ? (Math.round(p.value * 100) / 100) + '%' : '-',
      filter: "agNumberColumnFilter",
      cellStyle: p => p.value != null && p.value > 0 ? { color: '#059669', fontWeight: 'bold' } : {},
      filterParams: { numAlwaysVisibleConditions: 2, defaultJoinOperator: "OR" }
    },
    {
      headerName: "P/B", field: "priceToBook", resizable: true, sortable: true, width: 80,
      valueFormatter: p => p.value != null ? (Math.round(p.value * 100) / 100).toLocaleString() : '-',
      filter: "agNumberColumnFilter",
      cellStyle: p => p.value != null && p.value > 0 && p.value < 3 ? { color: '#059669', fontWeight: 'bold' } : {},
      filterParams: { numAlwaysVisibleConditions: 2, defaultJoinOperator: "OR" }
    },
  ];

  result = [];
  allData = []

  gridOptions: GridOptions;
  searchQuery: string = '';
  query: string = '';
  
  // Price range filter properties
  minPrice: number = 0;
  maxPrice: number = 200000;
  minPriceFilter: number = 0;
  maxPriceFilter: number = 200000;
  filteredByPriceCount: number = 0;
  activeSlider: 'min' | 'max' = 'max';
  
  // Pattern detection properties
  filteredallData = [];
  smaPatterns = [];
  showingPatterns = true;

  constructor(private http: HttpClient, private commonservice: CommonserviceService) {
    this.gridOptions = <GridOptions>{
      // serverSideFiltering: true
    };

    setTimeout(() => {
      this.fetchLiveData()
    }, 100)
  }


  fetchLiveData() {
    this.isLoading = true;
    if (this.dataSubscription) this.dataSubscription.unsubscribe();
    this.dataSubscription = this.commonservice.getData.subscribe(data => {
      this.inputValue = data || [];
      if (this.inputValue.length > 0) {
        this.getStocks();
      }
      this.isLoading = false;
    }, error => {
      console.error('Error fetching data:', error);
      this.isLoading = false;
    });
  }

  refreshData() {
    this.fetchLiveData();
  }


  // low,close,sma20,sma50,godFather,volume,RSI,MACD,HIGH52
  getStocks() {
    this.searchQuery = ''
    this.query = ''
    this.allData = []
    if (!this.inputValue || !Array.isArray(this.inputValue)) return;
    this.inputValue.forEach((res) => {
      if ((res['d'][7] || 0) < 50000) return;
      this.allData.push({
        change_from_open: res['d'][9],
        low: res['d'][3],
        high: res['d'][2],
        open: res['d'][1],
        name: res['d'][0],
        close: res['d'][4],
        sma20: res['d'][12],
        sma20closeDiff: (100 * (Number(res['d'][4]) - Number(res['d'][11]))) /
          ((Number(res['d'][11]) + Number(res['d'][4])) / 2),
        sma2050Diff: ((Math.abs(Number(res['d'][12]) - Number(res['d'][13]))) /
          ((Number(res['d'][12]) + Number(res['d'][13])) / 2) * 100),
        sma50: res['d'][13],
        godFatherDiffPer:
          (100 * (Number(res['d'][4]) - Number(res['d'][14]))) /
          ((Number(res['d'][14]) + Number(res['d'][4])) / 2),
        godFather: res['d'][14],
        volume: res['d'][7],
        RSI: res['d'][27],
        MACD: Math.abs(Math.abs(res['d'][29]) - Math.abs(res['d'][30])),
        MACDMacd: res['d'][29],
        MACDSignal: res['d'][30],
        HIGH52: res['d'][28],
        VWAP: res['d'][17],
        sector: res['d'][18],
        industry:res['d'][31],
        LOW52: res['d'][36],
        "EMA5|5": res['d'][37],
        "EMA10|5": res['d'][38],
        "EMA14|1H": res['d'][39],
        "EMA21|1H": res['d'][40],
        "EMA50|1H": res['d'][41],
        "RSI|1H":res['d'][42],
        "exchange":res['d'][43],
        "debt_to_equity":res['d'][44],
        roe: res['d'][45],
        roce: res['d'][46],
        revenueGrowth1Y: res['d'][47],
        profitGrowth1Y: res['d'][48],
        pe: res['d'][49],
        qoqRevenueGrowth: res['d'][50],
        qoqNetIncomeGrowth: res['d'][51],
        operatingMargin: res['d'][52],
        revenueGrowth5Y: res['d'][53],
        afterTaxMargin: res['d'][54],
        profitGrowth5Y: res['d'][55],
        fcfMargin: res['d'][56],
        dividendYield: res['d'][57],
        priceToBook: res['d'][58]
      });
    });

    this.buildIndustryPEMap();
    this.allData = this.allData.map(stock => {
      const fs = this.getFundamentalScore(stock);
      const dist = Math.abs(stock.godFatherDiffPer || 0);
      let entryRisk = 'Overextended';
      if (dist <= 3) entryRisk = 'Ideal Entry';
      else if (dist <= 8) entryRisk = 'Good Entry';
      else if (dist <= 15) entryRisk = 'Extended';

      return {
        ...stock,
        fundScore: fs.score,
        fundMaxScore: fs.maxScore,
        fundRating: fs.rating,
        fundDetails: fs.details.join(', '),
        entryRisk
      };
    });

    this.rowData = []
    setTimeout(() => {
      this.rowData = this.allData
      this.calculatePriceRange();
      this.filteredByPriceCount = this.rowData.length;
    }, 100)

  }

  calculatePriceRange() {
    if (this.allData.length > 0) {
      const prices = this.allData.map(stock => stock.close);
      this.minPrice = Math.floor(Math.min(...prices));
      this.maxPrice = Math.min(200000, Math.ceil(Math.max(...prices))); // Cap at 2 lakh
      this.minPriceFilter = this.minPrice;
      this.maxPriceFilter = this.maxPrice;
    }
  }

  onPriceFilterChange() {
    // Ensure min is always less than max
    if (this.minPriceFilter > this.maxPriceFilter) {
      const temp = this.minPriceFilter;
      this.minPriceFilter = this.maxPriceFilter;
      this.maxPriceFilter = temp;
    }

    // Filter data based on price range
    const filtered = this.allData.filter(stock => 
      stock.close >= this.minPriceFilter && stock.close <= this.maxPriceFilter
    );
    
    this.filteredByPriceCount = filtered.length;
    
    // Hide pattern columns for price filter
    this.hidePatternColumns();
    
    this.rowData = [];
    setTimeout(() => {
      this.rowData = filtered;
    }, 10);
  }

  bringToFront(slider: 'min' | 'max') {
    this.activeSlider = slider;
    // Update z-index dynamically
    const minSlider = document.querySelector('.min-slider') as HTMLElement;
    const maxSlider = document.querySelector('.max-slider') as HTMLElement;
    
    if (slider === 'min') {
      if (minSlider) minSlider.style.zIndex = '5';
      if (maxSlider) maxSlider.style.zIndex = '3';
    } else {
      if (minSlider) minSlider.style.zIndex = '3';
      if (maxSlider) maxSlider.style.zIndex = '5';
    }
  }
  
  reset() {
    this.rowData = []
    this.calculatePriceRange(); // Reset price sliders
    
    // Hide pattern columns on reset
    this.hidePatternColumns();
    
    setTimeout(() => {
      this.rowData = this.allData
      this.filteredByPriceCount = this.rowData.length;
    }, 100)
  }
  // 0: "name",
  // 1: "open",
  // 2: "high",
  // 3: "low",
  // 4: "close",
  // 5: "change",
  // 6: "change_abs",
  // 7: "volume",
  // 8: "Value.Traded",
  // 9: "change_from_open",
  // 10: "change_from_open_abs",
  // 11: "SMA20",
  // 12: "SMA20|5",
  // 13: "SMA50|5",
  // 14: "SMA200",
  // 15: "average_volume_10d_calc",
  // 16: "average_volume_30d_calc",
  // 17: "VWAP",
  // 18: "sector",
  // 19: "change_abs|5",
  // 20: "change|5"
  // 21 "BB|1W"
  // 22: "open|1W",
  // 23: "high|1W",
  // 24: "low|1W",
  // 25: "close|1W"
  // 26: "SMA20|1W",
  // 27: "RSI"
  // 28: "price_52_week_high",
  // 29: "MACD.macd",
  // 30: "MACD.signal"
  // 31: "industry"
  
  nearSMA() {
    this.filterData = []
    this.filteredallData = []
    this.smaPatterns = []
    
    this.allData.forEach((res) => {
      if (res['low'] <= res['godFather'] && res['close'] >= res['godFather'] && res['volume'] >= 200000) {
        const patternData = this.getPatternStrength(res);
        const industry = res.industry || res.sector;
        const enhancedStock = {
          ...res,
          pattern: patternData.pattern,
          strength: patternData.strength,
          signal: patternData.isBullish ? '🟢 Bullish' : '🔴 Bearish',
          smaPosition: patternData.smaPosition,
          industryPE: this.industryPEMap[industry] || null
        };
        
        this.filteredallData.push(enhancedStock);
        
        if (patternData.strength >= 50) {
          this.smaPatterns.push(enhancedStock);
        }
      }
    });

    // Log pattern breakdown
    console.log('=== SMA200 Pattern Analysis ===');
    console.log('Total stocks near SMA200:', this.filteredallData.length);
    console.log('High-quality patterns (≥50 strength):', this.smaPatterns.length);
    console.log('Weak patterns:', this.filteredallData.length - this.smaPatterns.length);
    
    const patternCounts = {};
    this.filteredallData.forEach(stock => {
      const pattern = stock.pattern || 'Unknown';
      patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
    });
    console.log('Pattern breakdown:', patternCounts);

    // Show high-quality patterns by default
    this.showingPatterns = true;
    this.rowData = []
    setTimeout(() => {
      this.rowData = this.smaPatterns
      // Show pattern columns after grid is ready
      setTimeout(() => {
        this.showPatternColumns();
      }, 200);
    }, 100)
  }

  near2050SMA() {
    this.filterData = []
    this.allData.forEach((res) => {
      if (res['close'] < 2500 && res['close'] >= 300 && res['sma2050Diff'] >= 0.4 && res['sma2050Diff'] <= 2 && res['volume'] >= 300000) {
        this.filterData.push(res);
      }
    });

    // Hide pattern columns for this filter
    this.hidePatternColumns();

    this.rowData = []
    setTimeout(() => {
      this.rowData = this.filterData
    }, 100)
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
  }

  onSearchInputChange() {
    if (this.gridApi) {
      this.gridApi.setGridOption('quickFilterText', this.searchQuery);
    }
  }

  querySearch() {
    if (this.query) {
      this.filterData = []
      try {
        this.query ? this.query : "res['close'] > 1"
        this.allData.forEach((res) => {
          // Use Function constructor instead of eval for safer evaluation
          const evaluator = new Function('res', `return ${this.query}`);
          if (evaluator(res)) {
            this.filterData.push(res);
          }
        });

        // Hide pattern columns for query search
        this.hidePatternColumns();

        this.rowData = []
        setTimeout(() => {
          this.rowData = this.filterData
        }, 100)
      } catch (err) {
        alert('invalid Query')
      }
    } else {
      alert('Empty Query')
    }
  }

  // Pattern Detection Methods (same as BB component)
  isDoji(open: number, close: number, high: number, low: number): { isDoji: boolean, type: string } {
    const bodySize = Math.abs(close - open);
    const totalRange = high - low;
    const upperShadow = high - Math.max(open, close);
    const lowerShadow = Math.min(open, close) - low;

    if (totalRange === 0) return { isDoji: false, type: '' };

    const bodyPercent = (bodySize / totalRange) * 100;
    const upperShadowPercent = (upperShadow / totalRange) * 100;
    const lowerShadowPercent = (lowerShadow / totalRange) * 100;

    // Dragonfly Doji: Long lower shadow, no/tiny upper shadow
    if (bodyPercent <= 5 && upperShadowPercent <= 10 && lowerShadowPercent >= 60) {
      return { isDoji: true, type: 'Dragonfly Doji' };
    }

    // Gravestone Doji: Long upper shadow, no/tiny lower shadow
    if (bodyPercent <= 5 && lowerShadowPercent <= 10 && upperShadowPercent >= 60) {
      return { isDoji: true, type: 'Gravestone Doji' };
    }

    // Classic Doji: Small body with balanced shadows
    if (bodyPercent <= 5 && upperShadowPercent >= 20 && lowerShadowPercent >= 20) {
      return { isDoji: true, type: 'Classic Doji' };
    }

    return { isDoji: false, type: '' };
  }

  isHammer(open: number, close: number, high: number, low: number): { isHammer: boolean, type: string } {
    const bodySize = Math.abs(close - open);
    const totalRange = high - low;
    const upperShadow = high - Math.max(open, close);
    const lowerShadow = Math.min(open, close) - low;

    if (totalRange === 0 || bodySize === 0) return { isHammer: false, type: '' };

    const bodyPercent = (bodySize / totalRange) * 100;
    const lowerShadowRatio = lowerShadow / bodySize;
    const upperShadowRatio = upperShadow / bodySize;

    // Bullish Hammer: Small body at top, long lower shadow
    if (bodyPercent >= 10 && bodyPercent <= 35 && lowerShadowRatio >= 2 && upperShadowRatio <= 0.5) {
      return { isHammer: true, type: close > open ? 'Bullish Hammer' : 'Bearish Hammer' };
    }

    return { isHammer: false, type: '' };
  }

  isInvertedHammer(open: number, close: number, high: number, low: number): { isInverted: boolean, type: string } {
    const bodySize = Math.abs(close - open);
    const totalRange = high - low;
    const upperShadow = high - Math.max(open, close);
    const lowerShadow = Math.min(open, close) - low;

    if (totalRange === 0 || bodySize === 0) return { isInverted: false, type: '' };

    const bodyPercent = (bodySize / totalRange) * 100;
    const upperShadowRatio = upperShadow / bodySize;
    const lowerShadowRatio = lowerShadow / bodySize;

    // Inverted Hammer: Small body at bottom, long upper shadow
    if (bodyPercent >= 10 && bodyPercent <= 35 && upperShadowRatio >= 2 && lowerShadowRatio <= 0.5) {
      return { isInverted: true, type: 'Inverted Hammer' };
    }

    return { isInverted: false, type: '' };
  }

  isShootingStar(open: number, close: number, high: number, low: number): { isShootingStar: boolean, type: string } {
    const bodySize = Math.abs(close - open);
    const totalRange = high - low;
    const upperShadow = high - Math.max(open, close);
    const lowerShadow = Math.min(open, close) - low;

    if (totalRange === 0 || bodySize === 0) return { isShootingStar: false, type: '' };

    const bodyPercent = (bodySize / totalRange) * 100;
    const upperShadowRatio = upperShadow / bodySize;
    const lowerShadowRatio = lowerShadow / bodySize;
    const bodyPosition = ((Math.min(open, close) - low) / totalRange) * 100;

    // Shooting Star: Small body at bottom (60%+ down), long upper shadow, bearish
    if (bodyPercent >= 10 && bodyPercent <= 35 && upperShadowRatio >= 2 && lowerShadowRatio <= 0.5 && bodyPosition <= 40) {
      return { isShootingStar: true, type: 'Shooting Star' };
    }

    return { isShootingStar: false, type: '' };
  }

  isSpinningTop(open: number, close: number, high: number, low: number): { isSpinning: boolean, type: string } {
    const bodySize = Math.abs(close - open);
    const totalRange = high - low;
    const upperShadow = high - Math.max(open, close);
    const lowerShadow = Math.min(open, close) - low;

    if (totalRange === 0) return { isSpinning: false, type: '' };

    const bodyPercent = (bodySize / totalRange) * 100;
    const upperShadowPercent = (upperShadow / totalRange) * 100;
    const lowerShadowPercent = (lowerShadow / totalRange) * 100;

    // Spinning Top: Small body (5-20%), both shadows significant (20%+)
    if (bodyPercent >= 5 && bodyPercent <= 20 && upperShadowPercent >= 20 && lowerShadowPercent >= 20) {
      return { isSpinning: true, type: 'Spinning Top' };
    }

    return { isSpinning: false, type: '' };
  }

  isBullishEngulfing(open: number, close: number, high: number, low: number): { isEngulfing: boolean, type: string } {
    const bodySize = Math.abs(close - open);
    const totalRange = high - low;

    if (totalRange === 0) return { isEngulfing: false, type: '' };

    const bodyPercent = (bodySize / totalRange) * 100;
    const upperShadow = high - Math.max(open, close);
    const lowerShadow = Math.min(open, close) - low;
    const upperShadowPercent = (upperShadow / totalRange) * 100;
    const lowerShadowPercent = (lowerShadow / totalRange) * 100;

    // Strong Bullish Candle: Large body (50%+), close > open, small shadows
    if (close > open && bodyPercent >= 50 && upperShadowPercent <= 25 && lowerShadowPercent <= 25) {
      // Extra strong if open near low (crossing from bottom)
      const openPosition = ((open - low) / totalRange) * 100;
      if (openPosition <= 30) {
        return { isEngulfing: true, type: 'Strong Bullish Cross' };
      }
      return { isEngulfing: true, type: 'Bullish Marubozu' };
    }

    return { isEngulfing: false, type: '' };
  }

  getPatternStrength(stock: any): { pattern: string, strength: number, isBullish: boolean, smaPosition: string } {
    const { open, close, high, low, godFather } = stock;
    
    let pattern = 'No Pattern';
    let baseStrength = 0;
    let isBullish = false;
    let smaPosition = '';

    // Check Doji
    const dojiResult = this.isDoji(open, close, high, low);
    if (dojiResult.isDoji) {
      pattern = dojiResult.type;
      baseStrength = 70;
      isBullish = dojiResult.type === 'Dragonfly Doji';
    }

    // Check Hammer
    const hammerResult = this.isHammer(open, close, high, low);
    if (hammerResult.isHammer) {
      pattern = hammerResult.type;
      baseStrength = 75;
      isBullish = hammerResult.type === 'Bullish Hammer';
    }

    // Check Inverted Hammer
    const invertedResult = this.isInvertedHammer(open, close, high, low);
    if (invertedResult.isInverted) {
      pattern = invertedResult.type;
      baseStrength = 65;
      isBullish = true;
    }

    // Check Shooting Star
    const shootingStarResult = this.isShootingStar(open, close, high, low);
    if (shootingStarResult.isShootingStar) {
      pattern = shootingStarResult.type;
      baseStrength = 60;
      isBullish = false;
    }

    // Check Spinning Top
    const spinningTopResult = this.isSpinningTop(open, close, high, low);
    if (spinningTopResult.isSpinning) {
      pattern = spinningTopResult.type;
      baseStrength = 55;
      isBullish = false; // Neutral/indecision
    }

    // Check Bullish Engulfing/Strong Cross
    const engulfingResult = this.isBullishEngulfing(open, close, high, low);
    if (engulfingResult.isEngulfing) {
      pattern = engulfingResult.type;
      baseStrength = engulfingResult.type === 'Strong Bullish Cross' ? 85 : 75;
      isBullish = true;
    }

    // Calculate SMA200 position
    const distanceFromSMA200 = Math.abs(((close - godFather) / godFather) * 100);
    
    if (low <= godFather && close >= godFather) {
      smaPosition = 'Bouncing Above 🟢';
      baseStrength += 15;
      isBullish = true;
    } else if (high >= godFather && close <= godFather) {
      smaPosition = 'Testing Below 🔴';
      baseStrength += 10;
      isBullish = false;
    } else if (distanceFromSMA200 <= 1) {
      smaPosition = 'On SMA200 🟡';
      baseStrength += 5;
    } else if (close > godFather) {
      smaPosition = `Above (+${distanceFromSMA200.toFixed(1)}%)`;
    } else {
      smaPosition = `Below (-${distanceFromSMA200.toFixed(1)}%)`;
    }

    // Bonus for tight distance to SMA200
    if (distanceFromSMA200 <= 0.5) {
      baseStrength += 10;
    } else if (distanceFromSMA200 <= 1) {
      baseStrength += 5;
    }

    return {
      pattern,
      strength: Math.min(baseStrength, 100),
      isBullish,
      smaPosition
    };
  }

  /**
   * Weighted Fundamental Scoring for SMA200 Trading
   * Tier 1 (Critical, 2 pts): ROE, D/E, PE < Industry
   * Tier 2 (Important, 1.5 pts): 1Y Rev, 1Y Profit, QoQ Rev, QoQ NI
   * Tier 3 (Quality, 1 pt): ROCE, OPM, 5Y Rev, 5Y Profit
   * Tier 2.5 (Long-Term, 1.5 pts): FCF Margin, Dividend, P/B
   * Max: 21.5 pts | Strong Buy >= 16 | Buy >= 12 | Hold >= 7
   */
  private industryPEMap: { [industry: string]: number } = {};

  buildIndustryPEMap() {
    const industryStocks: { [ind: string]: number[] } = {};
    this.allData.forEach((s: any) => {
      const ind = s.industry || s.sector;
      const pe = s.pe;
      if (ind && pe != null && pe > 0 && pe < 500) {
        if (!industryStocks[ind]) industryStocks[ind] = [];
        industryStocks[ind].push(pe);
      }
    });
    this.industryPEMap = {};
    Object.keys(industryStocks).forEach(ind => {
      const arr = industryStocks[ind].sort((a, b) => a - b);
      const mid = Math.floor(arr.length / 2);
      this.industryPEMap[ind] = arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
    });
  }

  getFundamentalScore(stock: any): { score: number, maxScore: number, rating: string, details: string[] } {
    let score = 0;
    const details: string[] = [];
    const maxScore = 21.5;

    // === TIER 1: Critical checks (2 pts each) ===

    // ROE >= 12%
    if (stock.roe != null && stock.roe >= 12) { score += 2; details.push('ROE ✓(2)'); }
    else if (stock.roe != null) { details.push(`ROE ${stock.roe.toFixed(0)}% ✗`); }
    else { details.push('ROE N/A'); }

    // D/E < 1.0 (sector-friendly — banks/infra won't get killed)
    if (stock.debt_to_equity != null && stock.debt_to_equity < 1.0) {
      score += 2;
      details.push(stock.debt_to_equity < 0.3 ? 'D/E ✓✓(2)' : 'D/E ✓(2)');
    } else if (stock.debt_to_equity != null) {
      details.push(`D/E ${stock.debt_to_equity.toFixed(1)} ✗`);
    } else { details.push('D/E N/A'); }

    // PE < Industry PE
    const industry = stock.industry || stock.sector;
    const indPE = this.industryPEMap[industry];
    if (stock.pe != null && stock.pe > 0 && indPE != null) {
      if (stock.pe < indPE) { score += 2; details.push(`PE<Ind(${indPE.toFixed(0)}) ✓(2)`); }
      else { details.push(`PE>Ind(${indPE.toFixed(0)}) ✗`); }
    } else {
      details.push('PE N/A');
    }

    // === TIER 2: Important checks (1.5 pts each) ===

    // 1Y Sales Growth > 0%
    if (stock.revenueGrowth1Y != null && stock.revenueGrowth1Y > 0) {
      score += 1.5; details.push('1Y Rev ✓(1.5)');
    } else if (stock.revenueGrowth1Y != null) {
      details.push(`1Y Rev ${stock.revenueGrowth1Y.toFixed(0)}% ✗`);
    } else { details.push('1Y Rev N/A'); }

    // 1Y Profit Growth > 0%
    if (stock.profitGrowth1Y != null && stock.profitGrowth1Y > 0) {
      score += 1.5; details.push('1Y Profit ✓(1.5)');
    } else if (stock.profitGrowth1Y != null) {
      details.push(`1Y Profit ${stock.profitGrowth1Y.toFixed(0)}% ✗`);
    } else { details.push('1Y Profit N/A'); }

    // QoQ Revenue Rising
    if (stock.qoqRevenueGrowth != null && stock.qoqRevenueGrowth > 0) {
      score += 1.5; details.push('QoQ Rev ✓(1.5)');
    } else if (stock.qoqRevenueGrowth != null) {
      details.push('QoQ Rev ✗');
    } else { details.push('QoQ Rev N/A'); }

    // QoQ Net Income Rising
    if (stock.qoqNetIncomeGrowth != null && stock.qoqNetIncomeGrowth > 0) {
      score += 1.5; details.push('QoQ NI ✓(1.5)');
    } else if (stock.qoqNetIncomeGrowth != null) {
      details.push('QoQ NI ✗');
    } else { details.push('QoQ NI N/A'); }

    // === TIER 3: Quality checks (1 pt each) ===

    // ROCE >= 12%
    if (stock.roce != null && stock.roce >= 12) { score += 1; details.push('ROCE ✓(1)'); }
    else if (stock.roce != null) { details.push(`ROCE ${stock.roce.toFixed(0)}% ✗`); }
    else { details.push('ROCE N/A'); }

    // OPM > 10%
    if (stock.operatingMargin != null && stock.operatingMargin > 10) {
      score += 1; details.push('OPM ✓(1)');
    } else if (stock.operatingMargin != null) {
      details.push(`OPM ${stock.operatingMargin.toFixed(0)}% ✗`);
    } else { details.push('OPM N/A'); }

    // 5Y Revenue Growth >= 10%
    if (stock.revenueGrowth5Y != null && stock.revenueGrowth5Y >= 10) {
      score += 1; details.push('5Y Rev ✓(1)');
    } else if (stock.revenueGrowth5Y == null) { details.push('5Y Rev N/A'); }
    else { details.push('5Y Rev ✗'); }

    // 5Y Profit Growth >= 10%
    if (stock.profitGrowth5Y != null && stock.profitGrowth5Y >= 10) {
      score += 1; details.push('5Y Profit ✓(1)');
    } else if (stock.profitGrowth5Y == null) { details.push('5Y Profit N/A'); }
    else { details.push('5Y Profit ✗'); }

    // === LONG-TERM checks (1.5 pts each) ===

    // Free Cash Flow Margin > 5%
    if (stock.fcfMargin != null && stock.fcfMargin > 5) {
      score += 1.5; details.push('FCF ✓(1.5)');
    } else if (stock.fcfMargin != null) {
      details.push(`FCF ${stock.fcfMargin.toFixed(0)}% ✗`);
    } else { details.push('FCF N/A'); }

    // Dividend Yield > 0%
    if (stock.dividendYield != null && stock.dividendYield > 0) {
      score += 1.5; details.push(`Div ${stock.dividendYield.toFixed(1)}% ✓(1.5)`);
    } else if (stock.dividendYield != null) {
      details.push('Div 0% ✗');
    } else { details.push('Div N/A'); }

    // Price/Book < 3
    if (stock.priceToBook != null && stock.priceToBook > 0 && stock.priceToBook < 3) {
      score += 1.5; details.push(`PB ${stock.priceToBook.toFixed(1)} ✓(1.5)`);
    } else if (stock.priceToBook != null) {
      details.push(`PB ${stock.priceToBook.toFixed(1)} ✗`);
    } else { details.push('PB N/A'); }

    let rating = 'Weak';
    if (score >= 16) rating = 'Strong Buy';
    else if (score >= 12) rating = 'Buy';
    else if (score >= 7) rating = 'Hold';

    return { score, maxScore, rating, details };
  }

  showAllFiltered() {
    this.showingPatterns = false;
    this.rowData = [];
    setTimeout(() => {
      this.rowData = this.filteredallData;
      // Keep pattern columns visible
      setTimeout(() => {
        this.showPatternColumns();
      }, 100);
    }, 100);
  }

  showPatternsOnly() {
    this.showingPatterns = true;
    this.rowData = [];
    setTimeout(() => {
      this.rowData = this.smaPatterns;
      // Keep pattern columns visible
      setTimeout(() => {
        this.showPatternColumns();
      }, 100);
    }, 100);
  }

  showAboveAvgFundamentals() {
    const aboveAvg = this.filteredallData.filter(s => s.fundScore >= 12);
    
    this.showingPatterns = false;
    this.rowData = [];
    setTimeout(() => {
      this.rowData = aboveAvg.length > 0 ? aboveAvg : this.filteredallData;
      if (aboveAvg.length === 0) {
        console.log('No stocks with Fund Score > 9. Showing all SMA200 crosses.');
      }
      setTimeout(() => this.showPatternColumns(), 200);
    }, 100);
  }

  showPatternColumns() {
    if (this.gridApi) {
      const fundCols = ['pattern', 'strength', 'smaPosition', 'signal', 'fundScore', 'fundRating', 'fundDetails'];
      this.gridApi.setColumnsVisible(fundCols, true);
    }
  }

  hidePatternColumns() {
    if (this.gridApi) {
      const fundCols = ['pattern', 'strength', 'smaPosition', 'signal', 'fundScore', 'fundRating', 'fundDetails'];
      this.gridApi.setColumnsVisible(fundCols, false);
    }
  }

  onBtnExport() {
    var d = new Date();
    this.gridApi.exportDataAsCsv({ fileName: `SMA(${d.toLocaleDateString()}).csv` });
  }
}

// // Calculate Pivot Points
// pivot = (highPrev + lowPrev + closePrev) / 3
// pivotBC = (highPrev + lowPrev) / 2
// pivotTC = pivot + (pivot - pivotBC)
// r1 = 2 * pivot - lowPrev
// s1 = 2 * pivot - highPrev
// r2 = pivot + (highPrev - lowPrev)
// s2 = pivot - (highPrev - lowPrev)
// r3 = highPrev + 2 * (pivot - lowPrev)
// s3 = lowPrev -2 * (highPrev - pivot)
// // Calculate Pivot Point (P)
// // Calculate Bottom Central Pivot (BC)
// bc = (highPrev + lowPrev) / 2
// // Calculate Top Central Pivot (TC)
// tc = pivot + (pivot - bc)