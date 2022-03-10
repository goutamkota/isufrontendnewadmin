import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RechargeReportComponent } from './recharge-report.component';

describe('RechargeReportComponent', () => {
  let component: RechargeReportComponent;
  let fixture: ComponentFixture<RechargeReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RechargeReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RechargeReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
