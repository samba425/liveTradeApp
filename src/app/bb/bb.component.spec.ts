import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BBComponent } from './bb.component';

describe('BBComponent', () => {
  let component: BBComponent;
  let fixture: ComponentFixture<BBComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BBComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
