import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { AngularFireStorageModule } from "@angular/fire/storage";
import { SharedModule } from "src/app/theme/shared/shared.module";
import { WalletTopUpComponent } from "./wallet-top-up.component";

const routes: Routes = [
    {
        path: '',
        component: WalletTopUpComponent
    }
];

@NgModule({
    declarations: [WalletTopUpComponent],
    imports: [
        SharedModule,
        NgxDatatableModule,
        AngularFireStorageModule,
        RouterModule.forChild(routes)
    ]
})
export class WalletTopUpModule {}