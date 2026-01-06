import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { Stock } from './shared/models/stock.model';
import { CommonserviceService } from './commonservice.service';

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private watchlistKey = 'trading_app_watchlist';
  private watchlistSubject = new BehaviorSubject<string[]>([]);
  private watchlistStocksSubject = new BehaviorSubject<Stock[]>([]);
  
  public watchlist$ = this.watchlistSubject.asObservable();
  public watchlistStocks$ = this.watchlistStocksSubject.asObservable();

  constructor(private commonService: CommonserviceService) {
    this.loadWatchlist();
    // Update watchlist stock data every 30 seconds
    interval(30000).subscribe(() => {
      this.refreshWatchlistData();
    });
  }

  private loadWatchlist(): void {
    try {
      const savedWatchlist = localStorage.getItem(this.watchlistKey);
      if (savedWatchlist) {
        const symbols = JSON.parse(savedWatchlist);
        this.watchlistSubject.next(symbols);
        this.refreshWatchlistData();
      }
    } catch (error) {
      console.error('Error loading watchlist:', error);
      this.watchlistSubject.next([]);
    }
  }

  private saveWatchlist(): void {
    try {
      const symbols = this.watchlistSubject.value;
      localStorage.setItem(this.watchlistKey, JSON.stringify(symbols));
    } catch (error) {
      console.error('Error saving watchlist:', error);
    }
  }

  addToWatchlist(symbol: string): boolean {
    const currentList = this.watchlistSubject.value;
    const normalizedSymbol = symbol.trim().toUpperCase();
    
    if (!normalizedSymbol) {
      return false;
    }
    
    if (currentList.includes(normalizedSymbol)) {
      console.log('Symbol already in watchlist');
      return false;
    }
    
    const updatedList = [...currentList, normalizedSymbol];
    this.watchlistSubject.next(updatedList);
    this.saveWatchlist();
    this.refreshWatchlistData();
    return true;
  }

  removeFromWatchlist(symbol: string): boolean {
    const currentList = this.watchlistSubject.value;
    const normalizedSymbol = symbol.trim().toUpperCase();
    
    if (!currentList.includes(normalizedSymbol)) {
      return false;
    }
    
    const updatedList = currentList.filter(s => s !== normalizedSymbol);
    this.watchlistSubject.next(updatedList);
    this.saveWatchlist();
    this.refreshWatchlistData();
    return true;
  }

  isInWatchlist(symbol: string): boolean {
    const normalizedSymbol = symbol.trim().toUpperCase();
    return this.watchlistSubject.value.includes(normalizedSymbol);
  }

  clearWatchlist(): void {
    this.watchlistSubject.next([]);
    this.watchlistStocksSubject.next([]);
    this.saveWatchlist();
  }

  getWatchlistSymbols(): string[] {
    return this.watchlistSubject.value;
  }

  private async refreshWatchlistData(): Promise<void> {
    const symbols = this.watchlistSubject.value;
    
    if (symbols.length === 0) {
      this.watchlistStocksSubject.next([]);
      return;
    }

    try {
      // Get current stock data from the common service
      this.commonService.getData.subscribe((allStocks: Stock[]) => {
        if (allStocks && allStocks.length > 0) {
          const watchlistStocks = allStocks.filter(stock => 
            symbols.some(symbol => 
              stock.name && stock.name.toUpperCase().includes(symbol)
            )
          );
          this.watchlistStocksSubject.next(watchlistStocks);
        }
      });
    } catch (error) {
      console.error('Error refreshing watchlist data:', error);
    }
  }

  exportWatchlist(): string {
    return JSON.stringify(this.watchlistSubject.value, null, 2);
  }

  importWatchlist(jsonData: string): boolean {
    try {
      const symbols = JSON.parse(jsonData);
      if (Array.isArray(symbols)) {
        this.watchlistSubject.next(symbols);
        this.saveWatchlist();
        this.refreshWatchlistData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing watchlist:', error);
      return false;
    }
  }
}
