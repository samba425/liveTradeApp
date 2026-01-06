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
    editable: false,
    filter: true,
    resizable: true,
    sortable: true
  };
  inputValue: any = []
  rowData = [];
  filteredrowData = []
  dojjiHammer = []
  filteredallData = []
  rowDataHigh = [];
  rowDataLow = [];
  pagination = true;
  paginationPageSize = 20;
  isLoading = false;
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
      headerName: "📈 High",
      field: "high", 
      sortable: true, 
      width: 110,
      valueFormatter: p => '₹' + (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter", 
      resizable: true,
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      },
      cellStyle: { color: '#10b981', fontWeight: '600' }
    },
    {
      headerName: "📉 Low",
      field: "low", 
      sortable: true, 
      width: 110,
      valueFormatter: p => '₹' + (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter", 
      resizable: true,
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      },
      cellStyle: { color: '#ef4444', fontWeight: '600' }
    },
    {
      headerName: "📊 BB Signal",
      field: "bb", 
      sortable: true, 
      width: 120,
      valueFormatter: p => '₹' + (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter", 
      resizable: true,
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    },
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
      headerName: "industry", field: "industry", resizable: true, sortable: true, filter: "agNumberColumnFilter", minWidth: 150,
      filterParams: {
        numAlwaysVisibleConditions: 2,
        defaultJoinOperator: "OR"
      }
    }
  ];

  result = [];
  allData = []

  gridOptions: GridOptions;
  gridOptionsfiltered: GridOptions;
  searchQuery: string = '';
  searchQuery1: string = '';
  constructor(private http: HttpClient, private commonservice: CommonserviceService) {
    this.gridOptions = <GridOptions>{
      // serverSideFiltering: true
    };
    this.gridOptionsfiltered = <GridOptions>{
      // serverSideFiltering: true
    };

    setTimeout(() => {
      this.fetchLiveData()
    }, 100)
  }


  fetchLiveData() {
    this.isLoading = true;
    this.commonservice.getData.subscribe(data => {
      this.inputValue = data
      this.getHighLow()
      this.isLoading = false;
    }, error => {
      console.error('Error fetching data:', error);
      this.isLoading = false;
    });
  }

  refreshData() {
    this.fetchLiveData();
  }

  getHighLow() {
    this.allData = []
    this.filteredallData = []
    this.dojjiHammer = []
    this.inputValue.forEach((res) => {
      // if (Number(res['d'][1]) > 10 && Number(res['d'][1]) < 5000) {
        // if (res['d'][24] <= res['d'][21] && res['d'][23] > res['d'][21]) {
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
      // 26: "SMA20|1w",
      // 27: "RSI"

      // && ( res['d'][22] / res['d'][25] >= 0.9995 && res['d'][22] / res['d'][25] <= 1.0005 ) 
      // if((res['d'][2] > res['d'][21]  && res['d'][1] <= res['d'][21]) ) {

      // isHammer(open, high, low, close) =>
      //     bodySize = math.abs(close - open)
      //     upperShadow = high - math.max(open, close)
      //     lowerShadow = math.min(open, close) - low
      //     isBullishHammer = bodySize < lowerShadow and upperShadow < bodySize and (close > open)
      //     isBearishHammer = bodySize < lowerShadow and upperShadow < bodySize and (close < open)
      //     [isBullishHammer, isBearishHammer]

      //     isBullishHammer = lowerShadow > 2 * bodySize and upperShadow < bodySize and (close > open) and (bodySize / totalRange < 0.3)
      //     isBearishHammer = lowerShadow > 2 * bodySize and upperShadow < bodySize and (close < open) and (bodySize / totalRange < 0.3)

      let bodySize = Math.abs(res['d'][25] - res['d'][22])
      let upperShadow = res['d'][23] - Math.max(res['d'][22], res['d'][25])
      let lowerShadow = Math.min(res['d'][22], res['d'][25]) - res['d'][24]
      let totalRange = res['d'][23] - res['d'][24]


      // if (res['d'][2] > res['d'][21] && res['d'][1] <= res['d'][21]) {
      if (res['d'][24] <= res['d'][21] && res['d'][23] > res['d'][21]) {
        this.allData.push({
          name: res['d'][0],
          close: res['d'][25],
          high: res['d'][23],
          low: res['d'][24],
          bb: res['d'][21],
          volume: res['d'][7],
          HIGH52: res['d'][28],
          VWAP: res['d'][17],
          sector: res['d'][18],
          industry: res['d'][31]
        });
      }

      // ( {cash} ( weekly open / weekly close >= 0.9995 and weekly open / weekly close <= 1.0005 ) ) 
      
// 18: "sector",
// 19: "change_abs|5",
// 20: "change|5"
// 21 "BB(lower)|1W"
// 22: "open|1W",
// 23: "high|1W",
// 24: "low|1W",
// 25: "close|1W"
// 26: "SMA20|1w",
// 27: "RSI"
// console.log('-checlk thsi...',typeof (res['d'][22] / res['d'][25]),res['d'][22] / res['d'][25])
// (low <= bb low && hign  > bb low && high <= sma20 ) && (open / close)

      if ((res['d'][24] <= res['d'][21] && res['d'][23] > res['d'][21] && res['d'][23] <= res['d'][26]) && ((res['d'][22] / res['d'][25] >= 0.9995 && res['d'][22] / res['d'][25] <= 1.0005) ||
        (res['d'][25] - res['d'][22] <= res['d'][23] - res['d'][24] * 0.32 && res['d'][25] > res['d'][22] && res['d'][23] - res['d'][25] <= res['d'][23] - res['d'][24] * 0.1) ||
        ((res['d'][22] - res['d'][24]) / (res['d'][23] - res['d'][22]) >= 2 && res['d'][22] < res['d'][25]) ||
        (bodySize < lowerShadow && upperShadow < bodySize && (close > open)) || (bodySize < lowerShadow && upperShadow < bodySize && (close < open)) ||
        (lowerShadow > 2 * bodySize && upperShadow < bodySize && (close > open) && (bodySize / totalRange < 0.3)) ||
        (lowerShadow > 2 * bodySize && upperShadow < bodySize && (close < open) && (bodySize / totalRange < 0.3)) ||
        ((bodySize / totalRange) < 0.1 && upperShadow > bodySize && lowerShadow > bodySize) || (Math.abs(res['d'][22] - res['d'][25]) <= Math.abs(res['d'][23] - res['d'][24]) * 0.3 && Math.abs(res['d'][23] - res['d'][24]) > 0 &&
          ((Math.abs(res['d'][23] - res['d'][22]) <= Math.abs(res['d'][23] - res['d'][24]) * 0.2 || Math.abs(res['d'][23] - res['d'][25]) <= Math.abs(res['d'][23] - res['d'][24]) * 0.2))))) {
            // if((res['d'][22] / res['d'][25] >= 0.9995 && res['d'][22] / res['d'][25] <= 1.0005) && res['d'][24] <= res['d'][21] && res['d'][23] > res['d'][21] && res['d'][23] <= res['d'][26]) {
            //   console.log('-checlk thsi..111.',res['d'][0], (res['d'][22] / res['d'][25]),res['d'][7])
                
            //   }
          this.filteredallData.push({
          name: res['d'][0],
          close: res['d'][25],
          high: res['d'][23],
          low: res['d'][24],
          bb: res['d'][21],
          volume: res['d'][7],
          HIGH52: res['d'][28],
          sector: res['d'][18],
          industry: res['d'][31]
          });
            
            // best dojji,hammer logic
            if(this.isDoji(res['d'][22],res['d'][23],res['d'][24],res['d'][25]) || this.isHammer(res['d'][22],res['d'][23],res['d'][24],res['d'][25])) {
        this.dojjiHammer.push({
          name: res['d'][0],
          close: res['d'][25],
          high: res['d'][23],
          low: res['d'][24],
          bb: res['d'][21],
          volume: res['d'][7],
          HIGH52: res['d'][28],
          sector: res['d'][18],
          industry: res['d'][31]
        });
      }
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
  
   isDoji(open, high, low, close) {
    const bodySize = Math.abs(open - close);
    const range = high - low;
    return bodySize <= range * 0.1;
  }
  
   isHammer(open, high, low, close) {
    const realBody = Math.abs(open - close);
    const lowerShadow = Math.min(open, close) - low;
    const upperShadow = high - Math.max(open, close);
    const totalRange = high - low;
  
    return (
      lowerShadow >= 2 * realBody &&
      upperShadow <= realBody * 0.3 &&
      realBody <= totalRange * 0.4
    );
  }
  
  onlyDojiHammer() {
    this.filteredrowData = []
    setTimeout(() => {
      this.filteredrowData = this.dojjiHammer
    }, 100)

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
