import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VolumeshockersComponent } from './volumeshockers.component';

describe('VolumeshockersComponent', () => {
  let component: VolumeshockersComponent;
  let fixture: ComponentFixture<VolumeshockersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VolumeshockersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VolumeshockersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
