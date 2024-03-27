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
  private gridApi!: GridApi;
  public rowSelection: 'single' | 'multiple' = 'multiple';
  public defaultColDef: ColDef = {
    editable: true,
    enableRowGroup: true,
    enablePivot: true,
    enableValue: true,
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
  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [
    { field: "name", sortable: true },
    { field: "close", sortable: true, valueFormatter: p => Math.floor(p.value).toLocaleString()  ,
    filter: "agNumberColumnFilter",
    filterParams: {
      numAlwaysVisibleConditions: 2,
      defaultJoinOperator: "OR"
    }},
    { field: "open", sortable: true, valueFormatter: p => Math.floor(p.value).toLocaleString() },
    { field: "SMADiff", sortable: true, valueFormatter: p => Math.floor(p.value).toLocaleString()  ,
    filter: "agNumberColumnFilter",
    filterParams: {
      numAlwaysVisibleConditions: 2,
      defaultJoinOperator: "OR"
    }},
    { field: "SMADiffChang", sortable: true, valueFormatter: p => Math.floor(p.value).toLocaleString() + '%' },
    { field: "godFatherDiff", sortable: true, valueFormatter: p => Math.floor(p.value).toLocaleString()  ,
    filter: "agNumberColumnFilter",
    filterParams: {
      numAlwaysVisibleConditions: 2,
      defaultJoinOperator: "OR"
    }},
    { field: "godFatherDiffPer", filter: true, sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%' },
    { field: "godFather", filter: true, sortable: true, valueFormatter: p => Math.floor(p.value).toLocaleString() },
    { field: "volume", filter: true, sortable: true }
  ];
  colDefsOpenHigh: ColDef[] = [
    { field: "name", sortable: true },
    { field: "close", sortable: true, valueFormatter: p => Math.floor(p.value).toLocaleString() },
    { field: "open", sortable: true, valueFormatter: p => Math.floor(p.value).toLocaleString() },
    { field: "high", sortable: true, valueFormatter: p => Math.floor(p.value).toLocaleString() },
    { headerName: 'prev-present %', field: "change", sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%' },
    { headerName: 'High-low %',field: "daychange", sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%' }
  ];
  colDefsOpenLow: ColDef[] = [
    { field: "name", sortable: true },
    { field: "close", sortable: true, valueFormatter: p => Math.floor(p.value).toLocaleString() },
    { field: "open", sortable: true, valueFormatter: p => Math.floor(p.value).toLocaleString() },
    { field: "low", sortable: true, valueFormatter: p => Math.floor(p.value).toLocaleString() },
    { headerName: 'prev-present %', field: "change", sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%' },
    { headerName: 'High-low %',field: "daychange", sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%' },
  ];
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
    console.log('-fetchLiveData openhigh',data)
    this.inputValue = data
      this.getHighLow()
  } );
   
  }

  // "name", 0
  // "open", 1
  // "high", 2
  // "low",  3
  // "close",4
  // "change",5
  // "change_abs",6
  // "volume",7
  // "Value.Traded",8
  // "change_from_open", 9
  // "change_from_open_abs",10
  // "EMA20",11
  // "SMA20",12
  // "SMA50",13
  // "SMA200",14

  //  "average_volume_10d_calc", 15
  //  "average_volume_30d_calc"  16
  getHighLow() {
    this.openHigh = [];
    this.openLow = [];
    this.allData = []
    this.inputValue.forEach((res) => { 
      if (
        !(Number(res['d'][1]) - Number(res['d'][2])) &&
        Number(res['d'][1]) < 3000 && /^\d+$/.test((res['d'][1]).toString())
      ) {
        this.openHigh.push({
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
          )
        });
      } else if (!(Number(res['d'][1]) - Number(res['d'][3])) &&
        Number(res['d'][1]) < 3000 && /^\d+$/.test((res['d'][1]).toString())) {
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
          )
        });
      }
    });
    setTimeout(() => {
    this.rowDataHigh = this.openHigh
    this.rowDataLow = this.openLow
    },100)
    
  }

}
