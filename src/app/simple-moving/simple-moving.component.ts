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
    // { field: "open", sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() ,
    // filter: "agNumberColumnFilter",
    // filterParams: {
    //   numAlwaysVisibleConditions: 2,
    //   defaultJoinOperator: "OR"
    // }},
    {
      headerName: "open %",field: "change_from_open", resizable:true,sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%', cellStyle: function (params) {
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
    // { field: "SMADiff", sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(),
    // filter: "agNumberColumnFilter",
    // filterParams: {
    //   numAlwaysVisibleConditions: 2,
    //   defaultJoinOperator: "OR"
    // }},
    // {
    //   field: "SMADiffChang", sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%',
    //   filter: "agNumberColumnFilter",
    //   filterParams: {
    //     numAlwaysVisibleConditions: 2,
    //     defaultJoinOperator: "OR"
    //   }
    // },
    // { field: "godFatherDiff", sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() ,filter: "agNumberColumnFilter",
    // filterParams: {
    //   numAlwaysVisibleConditions: 2,
    //   defaultJoinOperator: "OR"
    // }},
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
      field: "stockPts",resizable:true, sortable: true,
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    { headerName: "scannerLink",resizable:true,field: 'name', sortable: true,
    cellRenderer: function(params) {
      let keyData = params.data.name;
      let newLink = 
      `<a href= https://www.screener.in/company/${keyData}
      target="_blank">${keyData}</a>`;
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
// 27: "return_on_equity",
// 28: "debt_to_equity",
// 27: "price_earnings_ttm"
// 1) return_on_equity >= 15
// 2) debt_to_equity < 0.2
      // if (Number(res['d'][1]) > 10 && Number(res['d'][1]) < 5000) {
       let stockpts = 0;
       if(res['d'][27] >= 15) {
           stockpts++
       }
       if(res['d'][28] < 0.2) {
        stockpts++
        }
    
      this.allData.push({
        change_from_open: res['d'][9],
        // change_from_open_abs: res['d'][10],
        name: res['d'][0],
        close: res['d'][4],
        // preChange: res['d'][5],
        sma20: res['d'][12],
        sma20closeDiff: (100 * (Number(res['d'][4]) - Number(res['d'][11]))) /
          ((Number(res['d'][11]) + Number(res['d'][4])) / 2),
        sma50: res['d'][13],
        godFatherDiffPer:
          (100 * (Number(res['d'][4]) - Number(res['d'][14]))) /
          ((Number(res['d'][14]) + Number(res['d'][4])) / 2),
        godFather: res['d'][14],
        // SMADiffChang: Math.abs(
        //   (100 * (Number(res['d'][13]) - Number(res['d'][12]))) /
        //   ((Number(res['d'][13]) + Number(res['d'][12])) / 2)
        // ),
        volume: res['d'][7],
        stockPts: stockpts
      });
      // } 
    });
    this.rowData = []
    setTimeout(() => {
      this.rowData = this.allData
    }, 100)

  }
   
  nearSMA() {
    this.filterData = []
    this.allData.forEach((res) => {
      if (res['godFatherDiffPer'] >= -1 && res['godFatherDiffPer'] <= 1 && res['volume'] >= 100000) {
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

  onBtnExport() {
    var d = new Date();
    this.gridOptions.api.exportDataAsCsv({"fileName": `SMA(${d.toLocaleDateString()}).csv`});
  }
}
