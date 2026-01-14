import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { OpenHighCloseComponent } from './open-high-close/open-high-close.component';
import { AgGridModule } from 'ag-grid-angular';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { AppRoutingModule } from './app.routing.module';
import { VolumeshockersComponent } from './volumeshockers/volumeshockers.component';
import { BankniftyComponent } from './banknifty/banknifty.component';
import { SimpleMovingComponent } from './simple-moving/simple-moving.component';
import { FormsModule } from '@angular/forms';
import { BBComponent } from './bb/bb.component';
import { LearnComponent } from './learn/learn.component';
import { MarkdownModule } from 'ngx-markdown';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { AlertsComponent } from './alerts/alerts.component';
import { StockDetailComponent } from './stock-detail/stock-detail.component';
import { NewsComponent } from './news/news.component';
import { SectorTrackerComponent } from './sector-tracker/sector-tracker.component';
import { PositionCalculatorComponent } from './position-calculator/position-calculator.component';
import { CamarillaComponent } from './camarilla/camarilla.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

@NgModule({
  declarations: [
    AppComponent,
    OpenHighCloseComponent,
    VolumeshockersComponent,
    SimpleMovingComponent,
    BankniftyComponent,
    BBComponent,
    LearnComponent,
    WatchlistComponent,
    AlertsComponent,
    StockDetailComponent,
    NewsComponent,
    SectorTrackerComponent,
    PositionCalculatorComponent,
    CamarillaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, 
    FormsModule,
    AgGridModule,
    MarkdownModule.forRoot()
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
