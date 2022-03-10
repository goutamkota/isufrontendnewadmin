import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CountdownModule } from 'ngx-countdown';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { SharedModule } from "src/app/theme/shared/shared.module";
import { AepsTransComponent } from "./aeps-form-component/aeps.component";
import { BbpsTransComponent } from "./bbps-form-component/bbps.component";
import { CashoutTransComponent } from "./cashout-form-component/cashout.component";
import { CommissionTransComponent } from "./commission-form-component/commission.component";
import { DmtTransComponent } from "./dmt-form-component/dmt.component";
import { InsuranceTransComponent } from "./insurance-form-component/insurance.component";
import { MatmTransComponent } from "./matm-form-component/matm.component";
import { RechargeTransComponent } from "./recharge-form-component/recharge.component";
import { ReportsParamResolver } from "./reports-param.resolver";
import { ReportsComponent } from "./reports.component";
import { UpiTransComponent } from "./upi-form-component/upi.component";
import { WalletTransComponent } from "./wallet-form-component/wallet.component";
import { Dmt2FormComponent } from './dmt2-form-component/dmt2-form.component';
import { RechargeReportComponent } from './recharge-report/recharge-report.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'recharge',
    component: ReportsComponent
  },
  {
    path: ':service',
    component: ReportsComponent,
    resolve: { reportType: ReportsParamResolver }
  }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
    NgxDatatableModule,
    OwlDateTimeModule, OwlNativeDateTimeModule,
    AutocompleteLibModule,
    MatSelectModule,
    MatAutocompleteModule,
    CountdownModule,
    MatSliderModule,
    MatIconModule,
    MatInputModule,

    RouterModule.forChild(routes)
  ],
  declarations: [
    ReportsComponent,
    RechargeTransComponent,
    DmtTransComponent,
    AepsTransComponent,
    MatmTransComponent,
    BbpsTransComponent,
    InsuranceTransComponent,
    CashoutTransComponent,
    CommissionTransComponent,
    WalletTransComponent,
    UpiTransComponent,
    Dmt2FormComponent,
    RechargeReportComponent
  ],
  providers: [ReportsParamResolver]
})
export class ReportsModule { }
