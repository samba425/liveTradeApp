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
  filteredrowData = []
  filteredallData = []
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
    {
      field: "high", sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      field: "low", sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      field: "bb", sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter",
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
    {
      field: "sma200", sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(),
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
  gridOptionsfiltered: GridOptions;
  searchQuery: string = '';
  searchQuery1: string = '';
  constructor(private http: HttpClient, private commonservice: CommonserviceService) {
    this.gridOptions = <GridOptions>{
      serverSideFiltering: true
    };
    this.gridOptionsfiltered = <GridOptions>{
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
    this.filteredallData = []
    this.inputValue.forEach((res) => {
      // if (Number(res['d'][1]) > 10 && Number(res['d'][1]) < 5000) {
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
// 21 "BB(lower)|1W"
// 22: "open|1W",
// 23: "high|1W",
// 24: "low|1W",
// 25: "close|1W"
// && ( res['d'][22] / res['d'][25] >= 0.9995 && res['d'][22] / res['d'][25] <= 1.0005 ) 
// if((res['d'][2] > res['d'][21]  && res['d'][1] <= res['d'][21]) ) {

      // if (res['d'][2] > res['d'][21] && res['d'][1] <= res['d'][21]) {
      if (res['d'][24] <= res['d'][21] && res['d'][23] > res['d'][21]) {
        this.allData.push({ 
          name: res['d'][0],
          close: res['d'][25],
          high: res['d'][23],
          low: res['d'][24],
          bb: res['d'][21],
          sma200:res['d'][14],
          volume: res['d'][7]
        });
      }

      if ((res['d'][24] <= res['d'][21] && res['d'][23] > res['d'][21]) && ((res['d'][22] / res['d'][25] >= 0.9995 && res['d'][22] / res['d'][25] <= 1.0005) || (res['d'][25] - res['d'][22] <= res['d'][23] - res['d'][24] * 0.32 && res['d'][25] > res['d'][22] && res['d'][23] - res['d'][25] <= res['d'][23] - res['d'][24] * 0.1) || ((res['d'][22] - res['d'][24]) / (res['d'][23] - res['d'][22]) >= 2 && res['d'][22] < res['d'][25]))) {
        this.filteredallData.push({
          name: res['d'][0],
          close: res['d'][25],
          high: res['d'][23],
          low: res['d'][24],
          bb: res['d'][21],
          sma200:res['d'][14],
          volume: res['d'][7]
        });
      }

      // } 
    });
    this.rowData = []
    this.filteredrowData = []
    setTimeout(() => {
      this.rowData = this.allData
      this.filteredrowData = this.filteredallData
    }, 100)

  }

  onSearchInputChange() {
    if (this.gridOptions.api) {
      this.gridOptions.api.setQuickFilter(this.searchQuery);
    }
  }

  onBtnExport() {
    var d = new Date();
    this.gridOptions.api.exportDataAsCsv({ "fileName": `SMA(${d.toLocaleDateString()}).csv` });
  }

  onSearchInputChangeFiltered() {
    if (this.gridOptionsfiltered.api) {
      this.gridOptionsfiltered.api.setQuickFilter(this.searchQuery1);
    }
  }

  onBtnExportFiltered() {
    var d = new Date();
    this.gridOptionsfiltered.api.exportDataAsCsv({ "fileName": `SMA(${d.toLocaleDateString()}).csv` });
  }
}

// ( {cash} ( ( {cash} ( weekly open / weekly close >= 0.9995 and weekly open / weekly close <= 1.0005 ) ) 
// and ( {cash} ( ( {cash} ( weekly close - weekly open <= weekly high - weekly low * 0.32 and weekly close > weekly open and weekly high - weekly close <= weekly high - weekly low * 0.1 ) )
//  or ( {cash} ( weekly open < weekly close and ( weekly open - weekly low ) / ( weekly high - weekly open ) >= 2 ) ) ) )
//   and weekly low <= weekly lower bollinger band ( 20,2 ) and latest close > 500 ) ) 





// // Function to check for Hammer
// isHammer(open, high, low, close) =>
//     bodySize = math.abs(close - open)
//     upperShadow = high - math.max(open, close)
//     lowerShadow = math.min(open, close) - low
//     isBullishHammer = bodySize < lowerShadow and upperShadow < bodySize and (close > open)
//     isBearishHammer = bodySize < lowerShadow and upperShadow < bodySize and (close < open)
//     [isBullishHammer, isBearishHammer]

// showDoji = input.bool(false, title="Show Doji")
// showHammer = input.bool(false, title="show Hammer")

// // Function to check for Doji
// isDoji(open, high, low, close) =>
//     bodySize = math.abs(close - open)
//     upperShadow = high - math.max(open, close)
//     lowerShadow = math.min(open, close) - low
//     totalRange = high - low
//     isDoji = (bodySize / totalRange) < 0.1 and upperShadow > bodySize and lowerShadow > bodySize
//     isDoji

// // Function to check for Hammer
// isHammer(open, high, low, close) =>
//     bodySize = math.abs(close - open)
//     upperShadow = high - math.max(open, close)
//     lowerShadow = math.min(open, close) - low
//     totalRange = high - low
//     isBullishHammer = lowerShadow > 2 * bodySize and upperShadow < bodySize and (close > open) and (bodySize / totalRange < 0.3)
//     isBearishHammer = lowerShadow > 2 * bodySize and upperShadow < bodySize and (close < open) and (bodySize / totalRange < 0.3)
//     [isBullishHammer, isBearishHammer]


// // Identify Doji and Hammers
// doji = isDoji(open, high, low, close)
// [bullishHammer, bearishHammer] = isHammer(open, high, low, close)

// // Plot Doji
// plotshape(showDoji? doji: na, location=location.abovebar, color=color.gray, style=shape.labeldown, text="D")

// // Plot Bullish Hammer
// plotshape(showHammer?bullishHammer:na, location=location.belowbar, color=color.green, style=shape.labelup, text="H")

// // Plot Bearish Hammer
// plotshape(showHammer?bearishHammer:na, location=location.abovebar, color=color.red, style=shape.labeldown, text="H")

  