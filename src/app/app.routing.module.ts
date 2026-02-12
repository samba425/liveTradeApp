import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { OpenHighCloseComponent } from './open-high-close/open-high-close.component';
import { VolumeshockersComponent } from './volumeshockers/volumeshockers.component';
import { SimpleMovingComponent } from './simple-moving/simple-moving.component';
import { BankniftyComponent } from './banknifty/banknifty.component';
import { BBComponent } from './bb/bb.component';
import { LearnComponent } from './learn/learn.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { AlertsComponent } from './alerts/alerts.component';
import { StockDetailComponent } from './stock-detail/stock-detail.component';
import { NewsComponent } from './news/news.component';
import { SectorTrackerComponent } from './sector-tracker/sector-tracker.component';
import { PositionCalculatorComponent } from './position-calculator/position-calculator.component';
import { CamarillaComponent } from './camarilla/camarilla.component';
import { OptionsReadinessComponent } from './options-readiness/options-readiness.component';

@NgModule({
  declarations: [ 
    
  ],
  imports: [
    RouterModule.forRoot([
      { path: '',redirectTo: '/home', pathMatch: 'full'},
      { path: 'volume-shocker', component: VolumeshockersComponent},
      { path: 'openhighlow', component: OpenHighCloseComponent },
      { path: 'sma', component: SimpleMovingComponent },
      { path: 'home', component: BankniftyComponent },
      { path: 'bb', component: BBComponent },
      { path: 'learn', component: LearnComponent },
      { path: 'watchlist', component: WatchlistComponent },
      { path: 'alerts', component: AlertsComponent },
      { path: 'news', component: NewsComponent },
      { path: 'stock/:symbol', component: StockDetailComponent },
      { path: 'sectors', component: SectorTrackerComponent },
      { path: 'calculator', component: PositionCalculatorComponent },
      { path: 'cross', component: CamarillaComponent },
      { path: 'options-readiness', component: OptionsReadinessComponent },
      { path: '**', redirectTo: '/home', pathMatch: 'full' },
    ])
  ],
  exports: [
    RouterModule,
  ],
  providers: [],

})
export class AppRoutingModule {}


