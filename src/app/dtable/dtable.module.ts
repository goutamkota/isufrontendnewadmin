import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DtableComponent } from './dtable.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AnimationService, AnimatorModule } from 'css-animator';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    NgbDropdownModule,
    AnimatorModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [DtableComponent],
  exports: [DtableComponent],
  providers: [AnimationService, DatePipe]
})
export class DtableModule { }
