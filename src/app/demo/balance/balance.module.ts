import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { OwlDateTimeModule, OwlNativeDateTimeModule } from "ng-pick-datetime";
import { SharedModule } from "src/app/theme/shared/shared.module";
import { BlanceRequestReportsComponent } from "./balance-request-reports/balance-request-reports.component";
import { BalanceRequestsComponent } from "./balance-requests/balance-requests.component";
import { BalanceComponent } from "./balance.component";
import { WalletTopUpReportComponent } from "./wallet-top-up-report/wallet-top-up-report.component";
import { NgxSpinnerModule } from "ngx-spinner";
import { NumberToWordsPipePipe } from "../../number-to-words-pipe.pipe";

const routes: Routes = [
    {
        path: '',
        redirectTo: 'add',
        pathMatch: 'full'
    },
    {
        path: 'add',
        component: BalanceComponent
    },
    {
        path: 'requests',
        component: BalanceRequestsComponent
    },
    {
        path: 'request-reports',
        component: BlanceRequestReportsComponent
    },
    {
        path: 'wallet-rop-up-report',
        component: WalletTopUpReportComponent
    }
];

@NgModule({
    declarations: [
        BalanceComponent,
        BalanceRequestsComponent,
        WalletTopUpReportComponent,
        BlanceRequestReportsComponent
    ],
    imports: [
        SharedModule,
        NgxDatatableModule,
        OwlDateTimeModule, 
        OwlNativeDateTimeModule,
        NgxSpinnerModule,
        RouterModule.forChild(routes)
    ],
    providers:    [ NumberToWordsPipePipe ]
})
export class BalanceModule {}