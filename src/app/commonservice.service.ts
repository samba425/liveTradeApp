import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
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
  private serverStatus = new BehaviorSubject<string>('idle'); // 'idle', 'warming', 'ready', 'error'
  
  getData = this.stockData.asObservable();
  getBankData = this.bankData.asObservable();
  getliveIndexsData = this.liveIndexsData.asObservable();
  getnseTopData = this.nseTopData.asObservable();
  getServerStatus = this.serverStatus.asObservable();
  importUrl = environment.baseUrl;
  
  // Wake up the server with a simple health check
  wakeUpServer() {
    this.serverStatus.next('warming');
    const wakeUpUrl = `${this.importUrl}health`;
    
    this.http.get(wakeUpUrl, { responseType: 'text' }).pipe(
      timeout(30000), // 30 second timeout for cold start
      retry(2), // Retry twice if it fails
      catchError(error => {
        console.log('Wake up call failed, trying getData endpoint...', error);
        // If health endpoint doesn't exist, try getData
        return this.http.get(`${this.importUrl}getData?index=NIFTY`).pipe(
          timeout(30000),
          catchError(err => {
            this.serverStatus.next('error');
            return of(null);
          })
        );
      })
    ).subscribe({
      next: (res) => {
        if (res !== null) {
          this.serverStatus.next('ready');
          console.log('Server is ready');
        }
      },
      error: (err) => {
        this.serverStatus.next('error');
        console.error('Server wake up failed:', err);
      }
    });
  }
   
 
  fetchLiveData(index,sector?) { 
    this.stockData.next([]); 
    let url;
    if(sector) {
    url = sector ? `${this.importUrl}getData?sector=${sector}`: `${this.importUrl}getData`
    } else {
    url = index ? `${this.importUrl}getData?index=${index}`: `${this.importUrl}getData`
      
    }
    this.http.get(url).pipe(
      timeout(45000), // 45 second timeout to handle cold starts
      retry(1), // Retry once if it fails
      catchError(error => {
        console.error('Error fetching live data:', error);
        this.stockData.next([]); 
        return of({ data: [] });
      })
    ).subscribe((res) => {
      this.stockData.next(res['data']); 
      if (this.serverStatus.value !== 'ready') {
        this.serverStatus.next('ready');
      }
    });
  }
  
  
  fetchBankNiftyData() { 
    this.http.get(`${this.importUrl}getData?index=BANKNIFTY`).pipe(
      timeout(45000),
      retry(1),
      catchError(error => {
        console.error('Error fetching BankNifty data:', error);
        this.bankData.next([]);
        return of({ data: [] });
      })
    ).subscribe((res) => {
      this.bankData.next(res['data']); 
    });
  }
  
  fetchNiftyTopData() { 
    this.http.get(`${this.importUrl}getData?nseTop=true`).pipe(
      timeout(45000),
      retry(1),
      catchError(error => {
        console.error('Error fetching NSE Top data:', error);
        this.nseTopData.next([]);
        return of({ data: [] });
      })
    ).subscribe((res) => {
      this.nseTopData.next(res['data']); 
    });
  } 

  fetchIndexsData() { 
    this.http.get(`${this.importUrl}getData?indexs=true`).pipe(
      timeout(45000),
      retry(1),
      catchError(error => {
        console.error('Error fetching index data:', error);
        this.liveIndexsData.next([]);
        return of({ data: [] });
      })
    ).subscribe((res) => {
      this.liveIndexsData.next(res['data']); 
    });
  }
}
