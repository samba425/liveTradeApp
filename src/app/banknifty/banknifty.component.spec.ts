import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankniftyComponent } from './banknifty.component';

describe('BankniftyComponent', () => {
  let component: BankniftyComponent;
  let fixture: ComponentFixture<BankniftyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankniftyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankniftyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
