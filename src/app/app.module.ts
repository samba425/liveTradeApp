import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { OpenHighCloseComponent } from './open-high-close/open-high-close.component';
import { AgGridModule } from 'ag-grid-angular';
import { AppRoutingModule } from './app.routing.module';
import { VolumeshockersComponent } from './volumeshockers/volumeshockers.component';
import { BankniftyComponent } from './banknifty/banknifty.component';
import { SimpleMovingComponent } from './simple-moving/simple-moving.component';
@NgModule({
  declarations: [
    AppComponent,
    OpenHighCloseComponent,
    VolumeshockersComponent,
    SimpleMovingComponent,
    BankniftyComponent
  ],
  imports: [AppRoutingModule,
  AgGridModule.withComponents([]),BrowserModule,HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
