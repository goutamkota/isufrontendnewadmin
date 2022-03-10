import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Dmt2FormComponent } from './dmt2-form.component';

describe('Dmt2FormComponent', () => {
  let component: Dmt2FormComponent;
  let fixture: ComponentFixture<Dmt2FormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Dmt2FormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Dmt2FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
