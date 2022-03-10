import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SharedModule } from "src/app/theme/shared/shared.module";
import { SettingsPageComponent } from "./settings-page.component";
import { DevicemappingComponent } from './devicemapping/devicemapping.component';
import { ChangethemeComponent } from './changetheme/changetheme.component';
import { SubuserComponent } from './subuser/subuser.component';
import { MatAutocompleteModule } from "@angular/material";

const routes: Routes = [
    {
        path: '',
        component: SettingsPageComponent
    },
    {
        path: 'devicemapping',
        component: DevicemappingComponent
    },
    {
        path: 'changetheme',
        component:ChangethemeComponent
    },
    {
        path: 'subuser',
        component:SubuserComponent
    },

];

@NgModule({
    declarations: [
        SettingsPageComponent,
        DevicemappingComponent,
        ChangethemeComponent,
        SubuserComponent
    ],
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
        MatAutocompleteModule
    ]
})
export class SettingsModule {}