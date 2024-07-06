import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class CommonserviceService {

  constructor(private http:HttpClient) {
    this.callTradingview();
   }
  private stockData = new BehaviorSubject<any>([]);
  private bankData = new BehaviorSubject<any>([]);
  private liveIndexsData = new BehaviorSubject<any>([]);
  
  getData = this.stockData.asObservable();
  getBankData = this.bankData.asObservable();
  getliveIndexsData = this.liveIndexsData.asObservable();
  importUrl = environment.baseUrl;
   
 
  fetchLiveData(index,sector?) { 
    this.stockData.next([]); 
    let url;
    if(sector) {
    url = sector ? `${this.importUrl}getData?sector=${sector}`: `${this.importUrl}getData`
    } else {
    url = index ? `${this.importUrl}getData?index=${index}`: `${this.importUrl}getData`
      
    }
    this.http.get(url).subscribe((res) => {
      this.stockData.next(res['data']); 
    });
  }
  
  
  fetchBankNiftyData() { 
    this.http.get(`${this.importUrl}getData?index=BANKNIFTY`).subscribe((res) => {
      this.bankData.next(res['data']); 
    });
  }

  fetchIndexsData() { 
    this.http.get(`${this.importUrl}getData?indexs=true`).subscribe((res) => {
      this.liveIndexsData.next(res['data']); 
    });
  }
  
  
  
  
  callTradingview() {
   let payload =  {
      'method': 'POST',
      'json': true,
      'url': 'https://scanner.tradingview.com/india/scan',
      'body': {
        "filter": [
          {
            "left": "exchange",
            "operation": "equal",
            "right": "NSE"
          },
          {
            "left": "is_primary",
            "operation": "equal",
            "right": true
          },
          {
            "left": "active_symbol",
            "operation": "equal",
            "right": true
          }
        ],
        "options": {
          "lang": "en"
        },
        "markets": [
          "india"
        ],
        "symbols": {
          "query": {
            "types": []
          },
          "tickers": [],
          "groups": []
        },
        "columns": [
          "name",
          "open",
          "high",
          "low",
          "close",
          "change",
          "change_abs",
          "volume",
          "Value.Traded",
          "change_from_open",
          "change_from_open_abs",
          "SMA20",
          "SMA20|5",
          "SMA50|5",
          "SMA200",
          "average_volume_10d_calc",
          "average_volume_30d_calc",
          "VWAP",
          "sector",
          "change_abs|5",
          "change|5",
          "BB.lower|1W",
          "open|1W",
          "high|1W",
          "low|1W",
          "close|1W",
          "SMA20|1W",
          "return_on_equity",
          "debt_to_equity",
          "price_earnings_ttm"
        ],
        "sort": {
          "sortBy": "close",
          "sortOrder": "desc"
        },
        "price_conversion": {
          "to_symbol": false
        },
        "range": [
          0, 6500
        ]
      }
    }
    
    this.http.post(payload.url,payload.body).subscribe((res) => {
      console.log('-dsadasdasdasdsadsadasda',res)
    });
  }
}
