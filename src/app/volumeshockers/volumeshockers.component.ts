
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ColDef, GridOptions } from 'ag-grid-community';
import { CommonserviceService } from '../commonservice.service';
import { options } from './optionsStocks';
@Component({
  selector: 'app-volumeshockers',
  templateUrl: './volumeshockers.component.html',
  styleUrls: ['./volumeshockers.component.css']
})
export class VolumeshockersComponent implements OnInit {

  ngOnInit() {
  }
  query;
  public rowSelection: 'single' | 'multiple' = 'multiple';
  public defaultColDef: ColDef = {
    editable: true,
    filter: true,
    flex: 5,
    minWidth: 100,
  };
  inputValue: any = []
  rowData = [];
  rowStockData = [];
  pagination = true;
  paginationPageSize = 2500;
  paginationPageSizeSelector = [200, 500, 1000];
  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [
    { field: "name", resizable: true, sortable: true },
    {
      field: "close", resizable: true, sortable: true, valueFormatter: p => Math.floor(p.value).toLocaleString(),
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    { field: "open", resizable: true, sortable: true, valueFormatter: p => Math.floor(p.value).toLocaleString() },
    { field: "high", resizable: true, sortable: true, valueFormatter: p => Math.floor(p.value).toLocaleString() },
    { field: "low", resizable: true, sortable: true, valueFormatter: p => Math.floor(p.value).toLocaleString() },
    {
      field: "change_from_open", resizable: true, sortable: true, filter: "agNumberColumnFilter",
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
    {
      field: "preChange", resizable: true, sortable: true, filter: "agNumberColumnFilter",
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
    { field: "change_from_open_abs", resizable: true, sortable: true, valueFormatter: p => Math.floor(p.value).toLocaleString() },
    {
      field: "volume", resizable: true, sortable: true,
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    }
  ];
  colStocksDefs: ColDef[] = [
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
      headerName: "20-50%", field: "sma2050Diff", resizable: true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%', filter: "agNumberColumnFilter",
      filterParams: {
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
      headerName: "52 High", field: "HIGH52", resizable: true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      headerName: "avgVol(90DD)", field: "avgVol_90", sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      field: "relVol", resizable: true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      field: "float", resizable: true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      field: "markVal", resizable: true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      field: "EMA5|5", resizable: true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      field: "EMA10|5", resizable: true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      field: "EMA14|1H", resizable: true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      field: "EMA21|1H", resizable: true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      field: "EMA50|1H", resizable: true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      field: "RSI|1H", resizable: true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
  ];
  openHigh = [];
  openLow = [];
  result = [];
  allData = []
  gridOptions: GridOptions;
  gridStockOptions: GridOptions;
  searchQuery: string = '';
  searchStockQuery: string = '';
  filteredData = []
  optionsSTock = []
  constructor(private http: HttpClient, private commonservice: CommonserviceService) {
    this.gridOptions = <GridOptions>{
    };
    this.gridStockOptions = <GridOptions>{
    };
    this.fetchLiveData()
  }


  volumeShockers = []

  // latest Volume > latest Sma ( volume,20 ) * 5 
  volume() {
    this.volumeShockers = []
    this.filteredData = []
    this.optionsSTock = []
    this.allData = []
    //  let result =  this.inputValue.filter(element => element['d'][7] > element['d'][16]*5);
    let result = this.inputValue.filter(element => element['d'][7] > element['d'][15] * 2 && (element['d'][5] > 5 || element['d'][5] < -5));

    result.forEach(res => {
      this.volumeShockers.push({
        name: res['d'][0],
        close: res['d'][4],
        preChange: res['d'][5],
        open: res['d'][1],
        high: res['d'][2],
        low: res['d'][3],
        volume: res['d'][7],
        change_from_open: res['d'][9],
        change_from_open_abs: res['d'][10],
      });
    });
    this.inputValue.forEach((res) => {
      let record = {
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
        industry: res['d'][31],
        avgVol_90: res['d'][32],
        relVol: res['d'][33],
        float: res['d'][35],
        markVal: res['d'][34],
       	"EMA5|5": res['d'][37],
       	"EMA10|5": res['d'][38],
       	"EMA14|1H": res['d'][39],
       	"EMA21|1H": res['d'][40],
       	"EMA50|1H": res['d'][41],
				"RSI|1H":res['d'][42]
      }
      if (record['close'] > 50 && res['d'][32] > 30000 && res['d'][33] >= 1.5 && res['d'][34] > 2000000000 && res['d'][34] < 2000000000000) {
        this.filteredData.push(record)
      }
      this.allData.push(record);
      let findSTock = options.data.UnderlyingList.find((idex) => idex['symbol'] == record['name']);
      if (findSTock) this.optionsSTock.push(record);

    });
    this.rowData = this.volumeShockers;
    this.rowStockData = this.allData;
  }
  // 1bilon = 100cr
  // 32 "average_volume_90d_calc", // > 500k if less stocks there means > 300k
  // 33 "relative_volume_10d_calc", // > 1.2 or 1.5
  // "34 market_cap_basic" // > 2B to 2000B

  fetchLiveData() {
    this.commonservice.getData.subscribe(data => {
      this.inputValue = data
      setTimeout(() => {
        this.volume()
      }, 1000)

    });
  }

  onSearchInputChange() {
    if (this.gridOptions.api) {
      this.gridOptions.api.setQuickFilter(this.searchQuery);
    }
  }

  onSearchStockInputChange() {
    if (this.gridStockOptions.api) {
      this.gridStockOptions.api.setQuickFilter(this.searchStockQuery);
    }
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
  // 32 "average_volume_90d_calc", // > 500k if less stocks there means > 300k
  // 33 "relative_volume_10d_calc", // > 1.2 or 1.5
  // 34 market_cap_basic" // > 500B to 2000B
	// 35 "float_shares_outstanding",
	// 36	"price_52_week_low"
	// 37		"EMA5|5",
	// 38		"EMA10|5",
	// 39		"EMA14|60",
	// 40		"EMA21|60",
	// 41		"EMA50|60",
  searchQuerys() {
    this.rowStockData = this.filteredData;

  }
  
  
  querySearch() {
      if (this.query) {
        let filterData = []
        try {
          this.query ? this.query : "res['close'] > 1"
          this.allData.forEach((res) => {
            if (eval(`${this.query}`)) {
              console.log('-eval(`${this.query}`)',eval(`${this.query}`))
              filterData.push(res);
            }
          });
  
          this.rowStockData = []
          setTimeout(() => {
            this.rowStockData = filterData
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
    this.gridOptions.api.exportDataAsCsv({ "fileName": `volumeShockers(${d.toLocaleDateString()}).csv` });
  }
  Options() {
    this.rowStockData = this.optionsSTock;
  }
  queryOptions() {
   let filteredData = []
    this.optionsSTock.forEach((res => {
      if (res['avgVol_90'] > 100000 && res['relVol'] >= 1.5 && res['float'] < 2000000000) {
        filteredData.push(res)
      }
    }))

    this.rowStockData = filteredData;
  }


}
