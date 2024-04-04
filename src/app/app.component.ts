import { Component } from '@angular/core';
import { CommonserviceService } from './commonservice.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'tradeApp';
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
  constructor(private commonService: CommonserviceService) {
    this.refreshdata('NIFTY')
  }
  sectorSelect(sector) {
    this.commonService.fetchLiveData(undefined,sector);
  }
  refreshdata(index) {
    this.commonService.fetchLiveData(index);
  }
}
