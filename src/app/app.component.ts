import { Component } from '@angular/core';
import { CommonserviceService } from './commonservice.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'tradeApp';
  constructor(private commonService: CommonserviceService) {
    this.refreshdata('CNX500')
  }

  refreshdata(index) {
    this.commonService.fetchLiveData(index);
  }
}
