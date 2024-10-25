import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ColDef, GridApi } from 'ag-grid-community'; // Column Definition Type Interface
import { CommonserviceService } from '../commonservice.service';

@Component({
  selector: 'app-open-high-close',

  templateUrl: './open-high-close.component.html',
  styleUrls: ['./open-high-close.component.css']
})
export class OpenHighCloseComponent implements OnInit {

  ngOnInit() {
  }
  public rowSelection: 'single' | 'multiple' = 'multiple';
  public defaultColDef: ColDef = {
    editable: true,
    filter: true,
    flex: 1,
    minWidth: 100,
  };
  inputValue: any = []
  rowData = [];
  rowDataHigh = [];
  rowDataLow = [];
  pagination = true;
  paginationPageSize = 2500;
  paginationPageSizeSelector = [200, 500, 1000];
 
  
  colDefsOpenHigh: ColDef[] = [
    { field: "name", sortable: true, resizable: true },
    {
      headerName: "C.Price", field: "close", sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter", resizable: true,
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    { field: "open", resizable:true ,sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    { field: "high", resizable:true ,sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    { field: "low", resizable:true ,sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      headerName: "change_from_open", field: "change_from_open", resizable: true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%', filter: "agNumberColumnFilter",
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
      field: "volume", resizable: true, sortable: true,
      filter: "agNumberColumnFilter",
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
    }
    
    // onCellClicked: (event: CellClickedEvent) =>
    //   window.open( `https://www.screener.in/company/${event.value}/`)
    // },
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
      this.fetchLiveData()
    }, 100)
  }


  fetchLiveData() {
  this.commonservice.getData.subscribe(data => {
    this.inputValue = data
      this.getHighLow()
  } );
   
  }

  getHighLow() {
    this.openHigh = [];
    this.openLow = [];
    this.allData = []
    this.inputValue.forEach((res) => { 
      if (
        !(Number(res['d'][1]) - Number(res['d'][2])) &&
        Number(res['d'][1]) < 3000 && Number(res['d'][7]) > 300000
      ) {
        this.openHigh.push({
          change_from_open: Math.abs(res['d'][9]),
          change_from_open_abs: res['d'][10],
          name: res['d'][0],
          close: res['d'][4],
          open: res['d'][1],
          high: res['d'][2],
          low: res['d'][3],
          change: res['d'][5],
          daychange: Math.abs(
            (100 * (Number(res['d'][2]) - Number(res['d'][3]))) /
            ((Number(res['d'][2]) + Number(res['d'][3])) / 2)
          ),
          sma2050Diff: ((Math.abs(Number(res['d'][12]) - Number(res['d'][13]))) /
            ((Number(res['d'][12]) + Number(res['d'][13])) / 2) * 100),
          volume: res['d'][7],
          RSI: res['d'][27],
          MACD: Math.abs(Math.abs(res['d'][29]) - Math.abs(res['d'][30])),
          MACDMacd: res['d'][29],
          MACDSignal: res['d'][30],
          HIGH52: res['d'][28],
          industry:res['d'][31]
          
        });
      } else if (!(Number(res['d'][1]) - Number(res['d'][3])) &&
      Number(res['d'][1]) > 30 && Number(res['d'][1]) < 3000 && Number(res['d'][7]) > 300000) {
        this.openLow.push({
          change_from_open: res['d'][9],
          change_from_open_abs: res['d'][10],
          name: res['d'][0],
          close: res['d'][4],
          open: res['d'][1],
          high: res['d'][2],
          low: res['d'][3],
          change: res['d'][5],
          daychange: Math.abs(
            (100 * (Number(res['d'][2]) - Number(res['d'][3]))) /
            ((Number(res['d'][2]) + Number(res['d'][3])) / 2)
          ),
          sma2050Diff: ((Math.abs(Number(res['d'][12]) - Number(res['d'][13]))) /
          ((Number(res['d'][12]) + Number(res['d'][13])) / 2) * 100),
        volume: res['d'][7],
        RSI: res['d'][27],
        MACD: Math.abs(Math.abs(res['d'][29]) - Math.abs(res['d'][30])),
        MACDMacd: res['d'][29],
        MACDSignal: res['d'][30],
        HIGH52: res['d'][28],
        industry:res['d'][31]
        });
      }
    });
    setTimeout(() => {
    this.rowDataHigh = this.openHigh
    this.rowDataLow = this.openLow
    },100)
    
  }

}
