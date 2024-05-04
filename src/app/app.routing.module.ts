import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { OpenHighCloseComponent } from './open-high-close/open-high-close.component';
import { VolumeshockersComponent } from './volumeshockers/volumeshockers.component';
import { SimpleMovingComponent } from './simple-moving/simple-moving.component';
import { BankniftyComponent } from './banknifty/banknifty.component';
import { BBComponent } from './bb/bb.component';
@NgModule({
  declarations: [ 
    
  ],
  imports: [
    RouterModule.forRoot([
      { path: '',redirectTo: '/BankNifty', pathMatch: 'full'},
      { path: 'volume-shocker', component: VolumeshockersComponent},
      { path: 'openhighlow', component: OpenHighCloseComponent },
      { path: 'sma', component: SimpleMovingComponent },
      { path: 'BankNifty', component: BankniftyComponent },
      { path: 'bb', component: BBComponent },
      { path: '**', redirectTo: '/BankNifty', pathMatch: 'full' },
    ])
  ],
  exports: [
    RouterModule,
  ],
  providers: [],

})
export class AppRoutingModule {}


