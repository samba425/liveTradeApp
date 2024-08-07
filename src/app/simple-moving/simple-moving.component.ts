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
    { field: "name", sortable: true,resizable:true },
    {
      headerName: "C.Price",field: "close", sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter",resizable:true,
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      headerName: "open %",field: "change_from_open", resizable:true,sortable: true,filter: "agNumberColumnFilter",
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
      headerName: "SMA20Close%", field: "sma20closeDiff",resizable:true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%', filter: "agNumberColumnFilter",
      cellStyle: function (params) {
        if (params.value > 0) {
          return { backgroundColor: 'green' };
        } else {
          return { backgroundColor: 'red' };
        }
      },
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      headerName: "20 SMA",field: "sma20", resizable:true,sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      headerName: "50 SMA",field: "sma50",resizable:true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      headerName: "200 SMA",field: "godFather",resizable:true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      headerName: "200SMAClose%",field: "godFatherDiffPer",resizable:true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%', filter: "agNumberColumnFilter",
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
      field: "volume", resizable:true,sortable: true,
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      headerName: "RSI",field: "RSI",resizable:true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      headerName: "MACD",field: "MACD",resizable:true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      headerName: "52 High",field: "HIGH52",resizable:true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    { headerName: "scannerLink",resizable:true,field: 'name', sortable: true,
    cellRenderer: function(params) {
      let keyData = params.data.name;
      let newLink = 
      `<a style="color:white;" href= https://www.screener.in/company/${keyData}
      target="_blank">sceener</a>  |  <a style="color:white;" href= https://in.tradingview.com/chart/6QuU1TVy/?symbol=NSE%3A${keyData}
      target="_blank">chart</a>`;
      return newLink;
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
      this.getHighLow()
    });
  }

 
  // low,close,sma20,sma50,godFather,volume,RSI,MACD,HIGH52
  getHighLow() {
    this.allData = []
    this.inputValue.forEach((res) => {
      this.allData.push({
        change_from_open: res['d'][9],
        low: res['d'][3],
        name: res['d'][0],
        close: res['d'][4],
        sma20: res['d'][12],
        sma20closeDiff: (100 * (Number(res['d'][4]) - Number(res['d'][11]))) /
          ((Number(res['d'][11]) + Number(res['d'][4])) / 2),
        sma50: res['d'][13],
        godFatherDiffPer:
          (100 * (Number(res['d'][4]) - Number(res['d'][14]))) /
          ((Number(res['d'][14]) + Number(res['d'][4])) / 2),
        godFather: res['d'][14],
        volume: res['d'][7],
        RSI: res['d'][27],
        MACD: Math.abs(Math.abs(res['d'][29]) -  Math.abs(res['d'][30])),
        HIGH52: res['d'][28]
      });
    });
    this.rowData = []
    setTimeout(() => {
      this.rowData = this.allData
    }, 100)

  }
  // 0: "name",
// 1: "0pen",
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
// 22: "pen|1W",
// 23: "high|1W",
// 24: "low|1W",
// 25: "close|1W"
// 26: "SMA20|1W",
// 27: "RSI"
// 28: "price_52_week_high",
// 29: "MACD.macd",
// 30: "MACD.signal"
   
  nearSMA() {
    this.filterData = []
    // this.allData.forEach((res) => {
    //   if (res['godFatherDiffPer'] >= -0.5 && res['godFatherDiffPer'] <= 1 && res['volume'] >= 200000) {
    //   this.filterData.push(res);
    //   }
    // });
        this.allData.forEach((res) => {
      if (res['low'] < res['godFather'] && res['close'] >= res['godFather'] && res['volume'] >= 200000) {
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
    if(this.query) {
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
      } catch(err) {
        alert('invalid Query')
      }
    } else {
      alert('Empty Query')
    }
  }

  onBtnExport() {
    var d = new Date();
    this.gridOptions.api.exportDataAsCsv({"fileName": `SMA(${d.toLocaleDateString()}).csv`});
  }
}
