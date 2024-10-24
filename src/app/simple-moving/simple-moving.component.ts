import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ColDef, GridOptions } from 'ag-grid-community';
import { CommonserviceService } from '../commonservice.service';

@Component({
  selector: 'app-simple-moving',
  templateUrl: './simple-moving.component.html',
  styleUrls: ['./simple-moving.component.css']
})
export class SimpleMovingComponent implements OnInit {

  ngOnInit() {
  }
  public rowSelection: 'single' | 'multiple' = 'multiple';
  public defaultColDef: ColDef = {
    editable: true,
    filter: true,
    flex: 1,
    minWidth: 100
  };
  inputValue: any = []
  rowData = [];
  rowDataHigh = [];
  rowDataLow = [];
  pagination = true;
  paginationPageSize = 2500;
  filterData = []
  paginationPageSizeSelector = [200, 500, 1000];
  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [
    { field: "name", sortable: true, resizable: true },
    {
      headerName: "C.Price", field: "close", sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter", resizable: true,
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      headerName: "open %", field: "change_from_open", resizable: true, sortable: true, filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      },
      valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%', cellStyle: function (params) {
        if (params.value > 0) {
          return { backgroundColor: 'green' };
        } else {
          return { backgroundColor: 'red' };
        }
      }
    },
    // { field: "preChange", sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%' },
    // { field: "change_from_open_abs", sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() },
    {
      headerName: "20-50%", field: "sma2050Diff", resizable: true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%', filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      headerName: "20 SMA", field: "sma20", resizable: true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      headerName: "50 SMA", field: "sma50", resizable: true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      headerName: "200 SMA", field: "godFather", resizable: true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      headerName: "200SMAClose%", field: "godFatherDiffPer", resizable: true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%', filter: "agNumberColumnFilter",
      cellStyle: function (params) {
        if (params.value > 0) {
          return { backgroundColor: 'green' };
        } else {
          return { backgroundColor: 'red' };
        }
      }, filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      field: "volume", resizable: true, sortable: true,
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      headerName: "RSI", field: "RSI", resizable: true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      headerName: "MACD", field: "MACD", resizable: true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      headerName: "MACDBlue", field: "MACDMacd", resizable: true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    // {
    //   headerName: "S-MACD", field: "MACDSignal", resizable: true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), filter: "agNumberColumnFilter",
    //   filterParams: {
    //     numAlwaysVisibleConditions: 2,
    //     defaultJoinOperator: "OR"
    //   }
    // },
    {
      headerName: "52 High", field: "HIGH52", resizable: true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      headerName: "52 Low", field: "Low52", resizable: true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      headerName: "scannerLink", resizable: true, field: 'name', sortable: true,minWidth: 150,
      cellRenderer: function (params) {
        let keyData = params.data.name;
        let newLink =
          `<a style="color:white;" href= https://www.screener.in/company/${keyData}
      target="_blank">sceener</a>  |  <a style="color:white;" href= https://in.tradingview.com/chart/6QuU1TVy/?symbol=NSE%3A${keyData}
      target="_blank">chart</a>`;
        return newLink;
      }
    },
    {
      headerName: "industry", field: "industry", resizable: true, sortable: true, filter: "agNumberColumnFilter",minWidth: 150,
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    }
    
    // onCellClicked: (event: CellClickedEvent) =>
    //   window.open( `https://www.screener.in/company/${event.value}/`)
    // },
  ];

  result = [];
  allData = []

  gridOptions: GridOptions;
  searchQuery: string = '';
  query: string = '';

  constructor(private http: HttpClient, private commonservice: CommonserviceService) {
    this.gridOptions = <GridOptions>{
      // serverSideFiltering: true
    };

    setTimeout(() => {
      this.fetchLiveData()
    }, 100)
  }


  fetchLiveData() {
    this.commonservice.getData.subscribe(data => {
      this.inputValue = data
      this.getStocks()
    });
  }


  // low,close,sma20,sma50,godFather,volume,RSI,MACD,HIGH52
  getStocks() {
    this.searchQuery = ''
    this.query = ''
    this.allData = []
    this.inputValue.forEach((res) => {
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
        LOW52: res['d'][35],
        "EMA5|5": res['d'][37],
        "EMA10|5": res['d'][38],
        "EMA14|1H": res['d'][39],
        "EMA21|1H": res['d'][40],
        "EMA50|1H": res['d'][41],
        "RSI|1H":res['d'][42],
        "exchange":res['d'][43]
      });
    });
    this.rowData = []
    setTimeout(() => {
      this.rowData = this.allData
    }, 100)

  }
  
  reset() {
    this.rowData = []
    
    setTimeout(() => {
      this.rowData = this.allData
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
    this.allData.forEach((res) => {
      if (res['low'] <= res['godFather'] && res['close'] >= res['godFather'] && res['volume'] >= 200000) {
        this.filterData.push(res);
      }
    });

    this.rowData = []
    setTimeout(() => {
      this.rowData = this.filterData
    }, 100)
  }

  near2050SMA() {
    this.filterData = []
    this.allData.forEach((res) => {
      if (res['close'] < 2500 && res['close'] >= 300 && res['sma2050Diff'] >= 0.4 && res['sma2050Diff'] <= 2 && res['volume'] >= 300000) {
        this.filterData.push(res);
      }
    });

    this.rowData = []
    setTimeout(() => {
      this.rowData = this.filterData
    }, 100)
  }


  onSearchInputChange() {
    if (this.gridOptions.api) {
      this.gridOptions.api.setQuickFilter(this.searchQuery);
    }
  }

  querySearch() {
    if (this.query) {
      this.filterData = []
      try {
        this.query ? this.query : "res['close'] > 1"
        this.allData.forEach((res) => {
          if (eval(`${this.query}`)) {
            this.filterData.push(res);
          }
        });

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

  onBtnExport() {
    var d = new Date();
    this.gridOptions.api.exportDataAsCsv({ "fileName": `SMA(${d.toLocaleDateString()}).csv` });
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