
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ColDef, GridOptions } from 'ag-grid-community';
import { CommonserviceService } from '../commonservice.service';

@Component({
  selector: 'app-volumeshockers',
  templateUrl: './volumeshockers.component.html',
  styleUrls: ['./volumeshockers.component.css']
})
export class VolumeshockersComponent implements OnInit {
  
  ngOnInit() {
  }
  
  public rowSelection: 'single' | 'multiple' = 'multiple';
  public defaultColDef: ColDef = {
    editable: true,
    enableRowGroup: true,
    enablePivot: true,
    enableValue: true,
    filter: true,
    flex: 5,
    minWidth: 150,
  };
  inputValue: any = []
  rowData = [];
  pagination = true;
  paginationPageSize = 2500;
  paginationPageSizeSelector = [200, 500, 1000];
  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [
    { field: "name", sortable: true },
    {
      field: "close", sortable: true, valueFormatter: p => Math.floor(p.value).toLocaleString(),
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    { field: "open", sortable: true, valueFormatter: p => Math.floor(p.value).toLocaleString() },
    { field: "high", sortable: true, valueFormatter: p => Math.floor(p.value).toLocaleString() },
    { field: "low", sortable: true, valueFormatter: p => Math.floor(p.value).toLocaleString() },
    {
      field: "change_from_open", sortable: true, filter: "agNumberColumnFilter",
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
      field: "preChange", sortable: true, filter: "agNumberColumnFilter",
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
    { field: "change_from_open_abs", sortable: true, valueFormatter: p => Math.floor(p.value).toLocaleString() },
    {
      field: "volume", sortable: true,
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    }
  ];
  openHigh = [];
  openLow = [];
  result = [];
  allData = []
  gridOptions: GridOptions;
  searchQuery: string = '';
  constructor(private http: HttpClient, private commonservice: CommonserviceService) {
    this.gridOptions = <GridOptions>{
      serverSideFilteringAlwaysResets: false,
      serverSideFiltering: true
    };
    this.fetchLiveData()
  }


  volumeShockers = []

  // latest Volume > latest Sma ( volume,20 ) * 5 
  volume() {
    this.volumeShockers = []

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
    this.rowData = this.volumeShockers
  }

  fetchLiveData() {
    //  console.log('-dadasdas',this.commonservice.liveData)
    this.commonservice.getData.subscribe(data => {
      console.log('-data', data)
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
  // "SMA20",11
  // "SMA20|5",12
  // "SMA50| 5",13
  // "SMA200",14

  //  "average_volume_10d_calc", 15
  //  "average_volume_30d_calc"  16


  onBtnExport() {
    var d = new Date();
    this.gridOptions.api.exportDataAsCsv({"fileName": `volumeShockers(${d.toLocaleDateString()}).csv`});
  }

}
