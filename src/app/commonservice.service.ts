import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class CommonserviceService {

  constructor(private http:HttpClient) { }
  liveData;
  liveBankData;
  private stockData = new BehaviorSubject<any>([]);
  private bankData = new BehaviorSubject<any>([]);
  getData = this.stockData.asObservable();
  getBankData = this.bankData.asObservable();
  importUrl = environment.baseUrl;
   
 
  fetchLiveData(index) { 
    let url = index ? `${this.importUrl}getData?index=${index}`: `${this.importUrl}getData`
    this.http.get(url).subscribe((res) => {
      this.liveData  =  res['data']
      this.stockData.next(this.liveData); 
    });
  }
  
  
  fetchBankNiftyData() { 
    this.http.get(`${this.importUrl}getData?index=BANKNIFTY`).subscribe((res) => {
      this.liveBankData  =  res['data']
      this.bankData.next(this.liveBankData); 
    });
  }
}