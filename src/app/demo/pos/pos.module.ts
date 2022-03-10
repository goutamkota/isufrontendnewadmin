import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PosComponent } from './pos/pos.component';
import { RouterModule, Routes } from '@angular/router';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CountdownModule } from 'ngx-countdown';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { SharedModule } from "../../theme/shared/shared.module";

const routes: Routes = [
  {
    path: '',
    component: PosComponent
  }
];

@NgModule({
  declarations: [PosComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatAutocompleteModule,
    CountdownModule,
    MatSliderModule,
    MatIconModule,
    MatInputModule,
    NgxDatatableModule,
    SharedModule,
  ]
})
export class PosModule {
  constructor(){}
 }
