import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ErrorComponent } from './demo/error/error.component';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { AuthGuard } from './guards/auth.guard'

const routes: Routes = [
  {
    path: 'v1',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard/analytics',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        canActivate: [AuthGuard],
        loadChildren: () => import('./demo/dashboard/dashboard.module').then(module => module.DashboardModule)
      },
      // {
      //   path: 'devicemapping',
      //   canActivate: [AuthGuard],
      //   loadChildren: () => import('./demo/settings-page/devicemapping/devicemapping.module').then(module => module.DevicemappingModule)
      // },
      {
        path: 'balance',
        canActivate: [AuthGuard],
        loadChildren: () => import('./demo/balance/balance.module').then(module => module.BalanceModule)
      },
      {
        path: 'settings',
        canActivate: [AuthGuard],
        loadChildren: () => import('./demo/settings-page/settings-page.module').then(module => module.SettingsModule)
      },
      {
        path: 'wallet-top-up',
        canActivate: [AuthGuard],
        loadChildren: () => import('./demo/wallet-top-up/wallet-top-up.module').then(module => module.WalletTopUpModule)
      },
      {
        path: 'reports',
        canActivate: [AuthGuard],
        loadChildren: () => import('./demo/reports/reports.module').then(module => module.ReportsModule)
      },
      {
        path: 'member',
        canActivate: [AuthGuard],
        loadChildren: () => import('./demo/member/member.module').then(module => module.MemberModule)
      },
      {
        path: 'pos',
        loadChildren: () => import('./demo/pos/pos.module').then(module => module.PosModule)
      }
    ]
  },
  {
    path: '',
    loadChildren: () => import('./auth/auth.module').then(module => module.AuthModule)
  },
  {
    path: '**',
    pathMatch: 'full',
    component: ErrorComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{ useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
