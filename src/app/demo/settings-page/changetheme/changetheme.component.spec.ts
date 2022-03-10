import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangethemeComponent } from './changetheme.component';

describe('ChangethemeComponent', () => {
  let component: ChangethemeComponent;
  let fixture: ComponentFixture<ChangethemeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangethemeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangethemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
