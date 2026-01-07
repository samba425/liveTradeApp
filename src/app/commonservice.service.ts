import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class CommonserviceService {

  constructor(private http:HttpClient) { }
  private stockData = new BehaviorSubject<any>([]);
  private bankData = new BehaviorSubject<any>([]);
  private liveIndexsData = new BehaviorSubject<any>([]);
  private nseTopData = new BehaviorSubject<any>([]);
  
  getData = this.stockData.asObservable();
  getBankData = this.bankData.asObservable();
  getliveIndexsData = this.liveIndexsData.asObservable();
  getnseTopData = this.nseTopData.asObservable();
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
  
  fetchNiftyTopData() { 
    this.http.get(`${this.importUrl}getData?nseTop=true`).subscribe((res) => {
      this.nseTopData.next(res['data']); 
    });
  } 

  fetchIndexsData() { 
    this.http.get(`${this.importUrl}getData?indexs=true`).subscribe((res) => {
      this.liveIndexsData.next(res['data']); 
    });
  }
}
