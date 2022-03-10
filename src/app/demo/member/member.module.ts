import { NgModule } from "@angular/core";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AngularFireStorageModule } from "@angular/fire/storage";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule, MatIconModule } from "@angular/material";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { RouterModule, Routes } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { OwlDateTimeModule, OwlNativeDateTimeModule } from "ng-pick-datetime";
import { SharedModule } from "src/app/theme/shared/shared.module";
import { AddUserComponent } from "./adduser/adduser.component";
// import { ShowuserComponent } from './showuser/showuser.component';
//import { AddUserComponent } from "./dmt2/adduser.component";
import { ShowUserComponent } from './show-user/show-user.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { CardModule } from 'src/app/theme/shared/components';
import { DtableModule } from "../../../app/dtable/dtable.module";
import { CommonModule } from "@angular/common";
import { PrModalComponent } from './pr-modal/pr-modal.component';
import {MatCheckboxModule} from '@angular/material/checkbox';

const routes: Routes = [

    {
        path: 'showuser',
        component: ShowUserComponent
    },
    {
      path: 'createuser',
      component: AddUserComponent
    }

];

@NgModule({
    declarations: [

        AddUserComponent,
        ShowUserComponent,
        CreateUserComponent,
        PrModalComponent

    ],
    imports: [
        SharedModule,
        NgxDatatableModule,
        OwlDateTimeModule,
        OwlNativeDateTimeModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        MatInputModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatCardModule,
        MatAutocompleteModule,
        MatIconModule,
        AngularFirestoreModule,
        AngularFireStorageModule,
        CommonModule,
        CardModule,
        DtableModule,
    ]
})
export class MemberModule { }