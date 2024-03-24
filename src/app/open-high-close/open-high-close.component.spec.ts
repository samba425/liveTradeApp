import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenHighCloseComponent } from './open-high-close.component';

describe('OpenHighCloseComponent', () => {
  let component: OpenHighCloseComponent;
  let fixture: ComponentFixture<OpenHighCloseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenHighCloseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenHighCloseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
