import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SharedModule } from "../theme/shared/shared.module";

import { SignInComponent } from "./sign-in/sign-in.component";

const routes: Routes = [
    {
        path: '',
        redirectTo: 'sign-in',
        component: SignInComponent
    },
    {
        path: 'sign-in',
        component: SignInComponent
    }
];

@NgModule({
    declarations: [
        SignInComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        SharedModule
    ]
})
export class AuthModule {}