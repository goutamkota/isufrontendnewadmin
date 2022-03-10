import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicemappingComponent } from './devicemapping.component';

describe('DevicemappingComponent', () => {
  let component: DevicemappingComponent;
  let fixture: ComponentFixture<DevicemappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevicemappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevicemappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
