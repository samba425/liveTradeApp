import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Stock, CandleData } from '../shared/models/stock.model';
import { CommonserviceService } from '../commonservice.service';
import { WatchlistService } from '../watchlist.service';
import { Subscription } from 'rxjs';

declare const LightweightCharts: any;

@Component({
  selector: 'app-stock-detail',
  templateUrl: './stock-detail.component.html',
  styleUrls: ['./stock-detail.component.css']
})
export class StockDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chartContainer') chartContainer: ElementRef;
  
  symbol: string;
  stock: Stock;
  isLoading: boolean = true;
  isInWatchlist: boolean = false;
  
  private chart: any;
  private candlestickSeries: any;
  private volumeSeries: any;
  private subscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private commonService: CommonserviceService,
    private watchlistService: WatchlistService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.symbol = params['symbol'];
      if (this.symbol) {
        this.loadStockData();
        this.isInWatchlist = this.watchlistService.isInWatchlist(this.symbol);
      }
    });
  }

  ngAfterViewInit() {
    if (this.stock) {
      this.initializeChart();
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.chart) {
      this.chart.remove();
    }
  }

  loadStockData() {
    this.isLoading = true;
    
    this.subscription = this.commonService.getData.subscribe((stocks: Stock[]) => {
      if (stocks && stocks.length > 0) {
        const foundStock = stocks.find(s => 
          s.name && s.name.toUpperCase().includes(this.symbol.toUpperCase())
        );
        
        if (foundStock) {
          this.stock = {
            ...foundStock,
            change: foundStock.close - (foundStock.prevClose || foundStock.open),
            changePercent: foundStock.prevClose 
              ? ((foundStock.close - foundStock.prevClose) / foundStock.prevClose) * 100
              : ((foundStock.close - foundStock.open) / foundStock.open) * 100
          };
          this.isLoading = false;
          
          // Initialize chart after data is loaded
          if (this.chartContainer && !this.chart) {
            setTimeout(() => this.initializeChart(), 100);
          }
        }
      }
    });
    
    // Trigger data fetch
    this.commonService.fetchLiveData('NIFTY');
  }

  initializeChart() {
    if (!this.chartContainer || !this.stock) {
      return;
    }

    const container = this.chartContainer.nativeElement;
    const width = container.clientWidth;
    
    // Chart feature temporarily disabled - will be enabled after Angular upgrade
    // Due to TypeScript version compatibility issues with lightweight-charts
    container.innerHTML = '<div class="alert alert-info text-center p-5"><h5>📈 Chart Feature Coming Soon</h5><p>Charts will be enabled after Angular framework upgrade</p><p class="mb-0"><small>Stock data and indicators are displayed below</small></p></div>';
  }

  generateSampleCandleData(): CandleData[] {
    // Generate sample intraday data based on current stock price
    const data: CandleData[] = [];
    const now = new Date();
    now.setHours(9, 15, 0, 0); // Market open time
    
    let price = this.stock.open;
    const volatility = price * 0.002; // 0.2% volatility
    
    for (let i = 0; i < 75; i++) { // 5-minute candles for 6.25 hours
      const timestamp = new Date(now.getTime() + i * 5 * 60 * 1000);
      const timeStr = timestamp.getTime() / 1000;
      
      const open = price;
      const change = (Math.random() - 0.5) * volatility * 2;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * volatility;
      const low = Math.min(open, close) - Math.random() * volatility;
      
      data.push({
        time: timeStr as any,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: this.stock.volume * (0.8 + Math.random() * 0.4)
      });
      
      price = close;
    }
    
    // Ensure last candle matches current price
    if (data.length > 0) {
      data[data.length - 1].close = this.stock.close;
    }
    
    return data;
  }

  handleResize() {
    if (this.chart && this.chartContainer) {
      const width = this.chartContainer.nativeElement.clientWidth;
      this.chart.applyOptions({ width });
    }
  }

  toggleWatchlist() {
    if (this.isInWatchlist) {
      this.watchlistService.removeFromWatchlist(this.symbol);
      this.isInWatchlist = false;
    } else {
      this.watchlistService.addToWatchlist(this.symbol);
      this.isInWatchlist = true;
    }
  }

  formatVolume(volume: number): string {
    if (volume >= 10000000) {
      return (volume / 10000000).toFixed(2) + ' Cr';
    } else if (volume >= 100000) {
      return (volume / 100000).toFixed(2) + ' L';
    } else if (volume >= 1000) {
      return (volume / 1000).toFixed(2) + ' K';
    }
    return volume.toString();
  }

  formatMarketCap(marketCap: number): string {
    if (!marketCap) return '-';
    if (marketCap >= 10000000) {
      return '₹' + (marketCap / 10000000).toFixed(2) + ' Cr';
    }
    return '₹' + marketCap.toFixed(2);
  }
}
