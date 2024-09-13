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

  ngOnInit() {
  }

  public rowSelection: 'single' | 'multiple' = 'multiple';
  topBanks = ['ICICIBANK', 'KOTAKBANK', 'SBIN', 'AXISBANK']
  nifty50Top = ["HDFCBANK","RELIANCE","ICICIBANK","INFY","ITC","TCS","LT","BHARTIARTL","AXISBANK","SBIN"]
  public defaultColDef: ColDef = {
    editable: true,
    filter: true,
    flex: 5,
    minWidth: 150,
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
  paginationPageSize = 2500;
  paginationPageSizeSelector = [200, 500, 1000];
  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [
    { field: "name", resizable:true ,sortable: true },
    { field: "close", resizable:true ,sortable: true, valueFormatter: p => Math.floor(p.value).toLocaleString() },
    { field: "vwap", resizable:true ,sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() },
    {
      field: "vwapDiff", resizable:true ,sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString(), cellStyle: function (params) {
        if (params.value > 0) {
          return { backgroundColor: 'green' };
        } else {
          return { backgroundColor: 'red' };
        }
      }
    },
    {
      field: "change_from_open", resizable:true ,sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%', cellStyle: function (params) {
        if (params.value > 0) {
          return { backgroundColor: 'green' };
        } else {
          return { backgroundColor: 'red' };
        }
      }
    },
    { field: "preChange", resizable:true ,sortable: true, valueFormatter: p => (Math.round(p.value * 100) / 100).toLocaleString() + '%' },
    { field: "change_from_open_abs", resizable:true ,sortable: true, valueFormatter: p => Math.floor(p.value).toLocaleString() },
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
    this.commonservice.fetchIndexsData();
    this.commonservice.fetchBankNiftyData();
    this.commonservice.fetchNiftyTopData()
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
