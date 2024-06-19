import { Component } from '@angular/core';
import { CommonserviceService } from './commonservice.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'tradeApp';
  isbankNifty;
  currentValue = "NIFTY"
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
    this.refreshdata('NIFTY')
    
    
    router.events.subscribe((event) => {
      if(event instanceof NavigationEnd) {
        this.isbankNifty = router.routerState.snapshot.url;
      }
    });
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
// 27: "return_on_equity",
// 28: "debt_to_equity",
// 27: "price_earnings_ttm"