import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';

import { AlertModule, BreadcrumbModule, CardModule, ModalModule } from './components';
import { DataFilterPipe } from './components/data-table/data-filter.pipe';
import { PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface, PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ClickOutsideModule } from 'ng-click-outside';

import { SpinnerComponent } from './components/spinner/spinner.component';
import { ApexChartComponent } from './components/chart/apex-chart/apex-chart.component';
import {ApexChartService} from './components/chart/apex-chart/apex-chart.service';
import { ValidMobileDirective } from './directives/valid-mobile-number.directive';
import { ValidAmountDirective } from './directives/valid-amount.directive';
import { NgbPopoverModule, NgbTooltipModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { ValidBeneNameDirective } from './directives/valid-bene-name.directive';
import { ValidAccountNumberDirective } from './directives/valid-acc-number.directive';
import { ValidIfscDirective } from './directives/valid-ifsc.directive';
import { ValidOTPFieldDirective } from './directives/valid-otp-field.directive';
import { CamelToCapitalPipe } from './pipes/camelToCapitalize.pipe';
import { ImageErrorDirective } from './directives/image-error.directive';
import { ValidAmountWithDecimalDirective } from './directives/valid-amount-with-decimal.directive';
import { ValidpasswordDirective } from './directives/validpassword.directive';
import { ValidotpDirective } from './directives/validotp.directive';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  imports: [
    CommonModule,
    PerfectScrollbarModule,
    FormsModule,
    ReactiveFormsModule,
    AlertModule,
    CardModule,
    BreadcrumbModule,
    ModalModule,
    ClickOutsideModule,
    NgxSpinnerModule,
    NgbTooltipModule,
    NgbPopoverModule,
    NgbTypeaheadModule
  ],
  exports: [
    CommonModule,
    PerfectScrollbarModule,
    FormsModule,
    ReactiveFormsModule,
    AlertModule,
    CardModule,
    BreadcrumbModule,
    ModalModule,
    DataFilterPipe,
    ClickOutsideModule,
    SpinnerComponent,
    ApexChartComponent,
    NgxSpinnerModule,
    ValidMobileDirective,
    ValidAmountDirective,
    NgbTooltipModule,
    ValidBeneNameDirective,
    NgbPopoverModule,
    ValidAccountNumberDirective,
    ValidIfscDirective,
    ValidOTPFieldDirective,
    CamelToCapitalPipe,
    ImageErrorDirective,
    NgbTypeaheadModule,
    ValidAmountWithDecimalDirective
  ],
  declarations: [
    DataFilterPipe,
    SpinnerComponent,
    ApexChartComponent,
    ValidIfscDirective,
    ValidMobileDirective,
    ValidAmountDirective,
    ValidBeneNameDirective,
    ValidOTPFieldDirective,
    ValidAccountNumberDirective,
    CamelToCapitalPipe,
    ImageErrorDirective,
    ValidAmountWithDecimalDirective,
    ValidpasswordDirective,
    ValidotpDirective
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
    ApexChartService
  ]
})
export class SharedModule { }
