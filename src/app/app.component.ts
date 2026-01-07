import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonserviceService } from './commonservice.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'tradeApp';
  isbankNifty;
  currentValue = "NIFTY"
  private marketStatusSubscription: Subscription;
  
  sectorList = [
    "Energy Minerals",
    "Non-Energy Minerals",
    "Commercial Services",
    "Communications",
    "Consumer Durables",
    "Consumer Non-Durables",
    "Consumer Services",
    "Distribution Services",
    "Electronic Technology",
    "Finance",
    "Government",
    "Health Services",
    "Health Technology",
    "Industrial Services",
    "Miscellaneous",
    "Process Industries",
    "Producer Manufacturing",
    "Retail Trade",
    "Technology Services",
    "Transportation",
    "Utilities"]
    
  constructor(private commonService: CommonserviceService,private router: Router,private activatedRoute:ActivatedRoute) {
    this.refreshdata()
    
    
    router.events.subscribe((event) => {
      if(event instanceof NavigationEnd) {
        this.isbankNifty = router.routerState.snapshot.url;
      }
    });
  }
  
  ngOnInit() {
    this.updateMarketStatus();
    // Update market status every minute
    this.marketStatusSubscription = interval(60000).subscribe(() => {
      this.updateMarketStatus();
    });
  }
  
  ngOnDestroy() {
    if (this.marketStatusSubscription) {
      this.marketStatusSubscription.unsubscribe();
    }
  }
  
  updateMarketStatus() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;
    
    // Market hours: Monday-Friday, 9:15 AM - 3:30 PM IST
    const marketOpen = 9 * 60 + 15; // 9:15 AM
    const marketClose = 15 * 60 + 30; // 3:30 PM
    
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    if (statusDot && statusText) {
      if (day >= 1 && day <= 5 && currentTime >= marketOpen && currentTime <= marketClose) {
        statusDot.style.backgroundColor = '#10b981';
        statusDot.classList.add('market-open');
        statusText.textContent = 'Market Open';
      } else {
        statusDot.style.backgroundColor = '#ef4444';
        statusDot.classList.remove('market-open');
        statusText.textContent = 'Market Closed';
      }
    }
  }
  
  sectorSelect(sector) {
    this.currentValue = sector;
    this.commonService.fetchLiveData(undefined,sector);
  }
  
  refreshdata(index?) {
    this.currentValue = index ? index : "ALL";
    this.commonService.fetchLiveData(index);
  }
}


// 0: "name",
// 1: "0pen",
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
// 21 "BB|1W"
// 22: "pen|1W",
// 23: "high|1W",
// 24: "low|1W",
// 25: "close|1W"
// 26: "SMA20|1W",
// 27: "RSI"
// 28: "price_52_week_high",
// 29: "MACD.macd",
// 30: "MACD.signal"



// // Calculate Pivot Points
// pivot = (highPrev + lowPrev + closePrev) / 3
// pivotBC = (highPrev + lowPrev) / 2
// pivotTC = pivot + (pivot - pivotBC)
// r1 = 2 * pivot - lowPrev
// s1 = 2 * pivot - highPrev
// r2 = pivot + (highPrev - lowPrev)
// s2 = pivot - (highPrev - lowPrev)
// r3 = highPrev + 2 * (pivot - lowPrev)
// s3 = lowPrev -2 * (highPrev - pivot)
// // Calculate Pivot Point (P)
// // Calculate Bottom Central Pivot (BC)
// bc = (highPrev + lowPrev) / 2
// // Calculate Top Central Pivot (TC)
// tc = pivot + (pivot - bc)