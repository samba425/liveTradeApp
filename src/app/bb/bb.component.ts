import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ColDef, GridOptions } from 'ag-grid-community';
import { CommonserviceService } from '../commonservice.service';

@Component({
  selector: 'app-bb',
  templateUrl: './bb.component.html',
  styleUrls: ['./bb.component.css']
})
export class BBComponent implements OnInit {

  
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
  paginationPageSizeSelector = [200, 500, 1000];
  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [
    { field: "name", sortable: true },
    {
      field: "close", sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    { field: "high", sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() ,
    filter: "agNumberColumnFilter",
    filterParams: {
      numAlwaysVisibleConditions: 2,
      defaultJoinOperator: "OR"
    }},
    { field: "low", sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() ,
    filter: "agNumberColumnFilter",
    filterParams: {
      numAlwaysVisibleConditions: 2,
      defaultJoinOperator: "OR"
    }},
    {
      field: "change_from_open", sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%', cellStyle: function (params) {
        if (params.value > 0) {
          return { backgroundColor: 'green' };
        } else {
          return { backgroundColor: 'red' };
        }
      }
    },
    { field: "preChange", sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%' },
    { field: "change_from_open_abs", sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() },
    {
      field: "bb", sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      field: "volume", sortable: true,
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
  ];

  result = [];
  allData = []

  gridOptions: GridOptions;
  searchQuery: string = '';
  constructor(private http: HttpClient, private commonservice: CommonserviceService) {
    this.gridOptions = <GridOptions>{
      serverSideFiltering: true
    };

    setTimeout(() => {
      this.fetchLiveData()
    }, 100)
  }


  fetchLiveData() {
    this.commonservice.getData.subscribe(data => {
      // console.log('-fetchLiveData',data)
      this.inputValue = data
      this.getHighLow()
    });
  }

  getHighLow() {
    this.allData = []
    this.inputValue.forEach((res) => {
      // if (Number(res['d'][1]) > 10 && Number(res['d'][1]) < 5000) {
        if(res['d'][2] > res['d'][21]  && res['d'][1] <= res['d'][21]) {
          this.allData.push({
            change_from_open: res['d'][9],
            change_from_open_abs: res['d'][10],
            name: res['d'][0],
            close: res['d'][4],
            high: res['d'][2],
            low: res['d'][3],
            preChange: res['d'][5],
            volume: res['d'][7],
            bb: res['d'][21]
          });
        }

      // } 
    });
    this.rowData = []
    setTimeout(() => {
      this.rowData = this.allData
    }, 100)

  }

  onSearchInputChange() {
    if (this.gridOptions.api) {
      this.gridOptions.api.setQuickFilter(this.searchQuery);
    }
  }

  onBtnExport() {
    var d = new Date();
    this.gridOptions.api.exportDataAsCsv({"fileName": `SMA(${d.toLocaleDateString()}).csv`});
  }
} 