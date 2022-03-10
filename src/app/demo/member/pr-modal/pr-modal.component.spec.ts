import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrModalComponent } from './pr-modal.component';

describe('PrModalComponent', () => {
  let component: PrModalComponent;
  let fixture: ComponentFixture<PrModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
