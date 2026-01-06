import { Component, OnDestroy, OnInit } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { CommonserviceService } from '../commonservice.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-banknifty',
  templateUrl: './banknifty.component.html',
  styleUrls: ['./banknifty.component.css']
})
export class BankniftyComponent implements OnInit, OnDestroy {

  // View toggle for different indexes
  currentView: 'banknifty' | 'sectors' = 'banknifty';

  ngOnInit() {
  }

  public rowSelection: 'single' | 'multiple' = 'multiple';
  topBanks = ['ICICIBANK', 'KOTAKBANK', 'SBIN', 'AXISBANK']
  nifty50Top = ["HDFCBANK","RELIANCE","ICICIBANK","INFY","ITC","TCS","LT","BHARTIARTL","AXISBANK","SBIN"]
  public defaultColDef: ColDef = {
    editable: false,
    filter: true,
    resizable: true,
    sortable: true
  };
  mySubscription: Subscription;
  bankSubscription: Subscription;
  nifySubscription: Subscription;
  indexSubscription: Subscription;
  inputValue: any = []
  nseTopCompaines: any = []
  indexValues: any = []
  rowData = [];
  rowTopData = [];
  pagination = true;
  paginationPageSize = 20;
  isLoading = false;
  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [
    { 
      headerName: "📊 Stock",
      field: "name", 
      resizable:true ,
      sortable: true,
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
      resizable:true ,
      sortable: true, 
      width: 110,
      valueFormatter: p => '₹' + Math.floor(p.value).toLocaleString(),
      cellStyle: { fontWeight: '600' }
    },
    { 
      headerName: "📊 VWAP",
      field: "vwap", 
      resizable:true ,
      sortable: true, 
      width: 110,
      valueFormatter: p => '₹' + (Math.round(p.value * 100) / 100).toLocaleString()
    },
    {
      headerName: "📊 VWAP Diff",
      field: "vwapDiff", 
      resizable:true ,
      sortable: true, 
      width: 120,
      valueFormatter: p => '₹' + (Math.round(p.value * 100) / 100).toLocaleString(), 
      cellStyle: function (params) {
        if (params.value > 0) {
          return { backgroundColor: '#d1fae5', color: '#065f46', fontWeight: 'bold' };
        } else {
          return { backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 'bold' };
        }
      }
    },
    {
      headerName: "📊 Change %",
      field: "change_from_open", 
      resizable:true ,
      sortable: true, 
      width: 120,
      valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%', 
      cellStyle: function (params) {
        if (params.value > 0) {
          return { backgroundColor: '#d1fae5', color: '#065f46', fontWeight: 'bold' };
        } else {
          return { backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 'bold' };
        }
      }
    },
    { 
      headerName: "📈 Pre Change %",
      field: "preChange", 
      resizable:true ,
      sortable: true, 
      width: 130,
      valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%'
    },
    { 
      headerName: "💹 Change Abs",
      field: "change_from_open_abs", 
      resizable:true ,
      sortable: true, 
      width: 120,
      valueFormatter: p => '₹' + Math.floor(p.value).toLocaleString()
    },
  ];
  openHigh = [];
  openLow = [];
  result = [];
  allData = []
  constructor(private commonservice: CommonserviceService) {
    this.fetchIndex();
    this.fetchBankData();
    this.fetchnseTopData();
    this.fetchIndexData();

    this.fetchBanks()
  }
  fetchBanks() {
    this.mySubscription = interval(10000).subscribe(x => {
      this.fetchIndex();
    });
  }


  fetchIndex() {
    this.isLoading = true;
    this.commonservice.fetchIndexsData();
    this.commonservice.fetchBankNiftyData();
    this.commonservice.fetchNiftyTopData()
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  refreshData() {
    this.fetchIndex();
    this.fetchBankData();
    this.fetchnseTopData();
    this.fetchIndexData();
  }

  banks = []
  topCompanies = [];
  hdfcTrend = 0;
  banksTrend = 0;
  allbankTrands = 0
  niftyaboveVwap = 0
  // latest Volume > latest Sma ( volume,20 ) * 5 
  fetchBank() {
    this.hdfcTrend = 0;
    this.banksTrend = 0;
    this.allbankTrands = 0
    this.banks = []
    //  let result =  this.inputValue.filter(element => element['d'][7] > element['d'][16]*5);
    this.inputValue.forEach(res => {
      if (res['d'][0] == 'HDFCBANK' && (res['d'][4] - res['d'][17]) > 0) {
        this.hdfcTrend++
      } else {
        if (this.topBanks.includes(res['d'][0]) && (res['d'][4] - res['d'][17]) > 0) {
          this.banksTrend++;
        }
      }

      if ((res['d'][4] - res['d'][17]) > 0) {
        this.allbankTrands++
      }
      this.banks.push({
        name: res['d'][0],
        close: res['d'][4],
        preChange: res['d'][5],
        vwapDiff: res['d'][4] - res['d'][17],
        vwap: res['d'][17],
        change_from_open: res['d'][9],
        change_from_open_abs: res['d'][10],
      });
    });
    this.rowData = this.banks
  }
  
  fetchTopCompanies() { 
    this.topCompanies = []
    this.niftyaboveVwap = 0
    this.nifty50Top.forEach(res => {
      let getCompany = this.nseTopCompaines.find(i => i['d'][0] == res);
      if(getCompany) {
        if ((getCompany['d'][4] - getCompany['d'][17]) > 0) {
          this.niftyaboveVwap++
        }
        this.topCompanies.push({
          name: getCompany['d'][0],
          close: getCompany['d'][4],
          preChange: getCompany['d'][5],
          vwapDiff: getCompany['d'][4] - getCompany['d'][17],
          vwap: getCompany['d'][17],
          change_from_open: getCompany['d'][9],
          change_from_open_abs: getCompany['d'][10],
        }); 
      }else {
        console.log('-not found',res)
      }

    });
    this.rowTopData = this.topCompanies
  }
  

  fetchBankData() {
    this.bankSubscription = this.commonservice.getBankData.subscribe(data => {
      this.inputValue = data
      this.fetchBank()
    });
  }
  fetchnseTopData() {
    this.nifySubscription = this.commonservice.getnseTopData.subscribe(data => {
      this.nseTopCompaines = data
      this.fetchTopCompanies()
    });
  }

  fetchIndexData() {
    this.indexSubscription = this.commonservice.getliveIndexsData.subscribe(data => {
      this.indexValues = []
      data.forEach(res => {
        this.indexValues.push({
          name: res['d'][0],
          close: res['d'][4],
          preChange: res['d'][5],
          vwapDiff: res['d'][4] - res['d'][17],
          vwap: res['d'][17],
          change_from_open: res['d'][9],
          change_from_open_abs: res['d'][10],
        });
      });
    });
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
  //  "VWAP" 17
  ngOnDestroy() {
    this.mySubscription.unsubscribe();
    this.bankSubscription.unsubscribe();
    this.nifySubscription.unsubscribe();
    this.indexSubscription.unsubscribe();
  }
}
