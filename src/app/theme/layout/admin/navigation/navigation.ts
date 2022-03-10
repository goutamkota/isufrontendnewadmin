import { Injectable, OnInit } from '@angular/core';

export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  function?: any;
  badge?: {
    title?: string;
    type?: string;
  };
  children?: Navigation[];
  tokenAuth?: boolean;
}

export interface Navigation extends NavigationItem {
  children?: NavigationItem[];
}

// const NavigationItems = [

//   {
//     id: 'ui-element',
//     title: 'UI ELEMENT & FORMS',
//     type: 'group',
//     icon: 'feather icon-layers',
//     children: [
//       {
//         id: 'dashboard',
//         title: 'Dashboard',
//         type: 'item',
//         url: '/v1/dashboard/analytics',
//         icon: 'feather icon-home'
//       }
//     ]
//   },
//   {
//     id: 'services',
//     title: 'SERVICES',
//     type: 'group',
//     icon: 'feather icon-layers',
//     children: []
//   },
//   {
//     id: 'commission',
//     title: 'Commission',
//     type: 'item',
//     icon: 'feather icon-layers',
//     url: 'https://partner-iserveu.web.app/authentication/auth-token/',
//     target: true,
//     external: true,
//     tokenAuth: true
//   }
// ];

@Injectable()
export class NavigationItem {

  navItems = [

    {
      id: 'ui-element',
      title: 'Dashboard',
      type: 'group',
      icon: 'feather icon-layers',
      children: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          type: 'item',
          url: '/v1/dashboard/analytics',
          icon: 'feather icon-home'
        }
      ]
    },
    {
      id: 'services',
      title: 'SERVICES',
      type: 'group',
      icon: 'feather icon-layers',
      children: [
        {
          id: 'transReport',
          title: 'Transaction Reports',
          type: 'collapse',
          icon: 'feather icon-home',
          children: [
            {
              id: 'dmt2',
              title: 'DMT',
              type: 'item',
              url: '/v1/reports/dmt2'
            },
            {
              id: 'recharge2',
              title: 'Recharge',
              type: 'item',
              url: '/v1/reports/recharge2'
            },
            {
              id: 'upi',
              title: 'UPI',
              type: 'item',
              url: '/v1/reports/upi'
            },
            {
              id: 'commission',
              title: 'Commission',
              type: 'item',
              url: '/v1/reports/commission'
            },
            {
              id: 'wallet',
              title: 'Wallet',
              type: 'item',
              url: '/v1/reports/wallet'
            },
            {
              id: 'cashout',
              title: 'Cashout',
              type: 'item',
              url: '/v1/reports/cashout'
            },
            {
              id: 'pos',
              title: 'POS',
              type: 'item',
              url: '/v1/pos'
            },
          ]
        },
        {
          id: 'member',
          title: 'Members',
          type: 'collapse',
          icon: 'feather icon-user',
          children: [
            // {
            //   id: 'createuser',
            //   title: 'Create User',
            //   type: 'item',
            //   url: '/v1/member/createuser'
            // },
            {
              id: 'showuser',
              title: 'Show User',
              type: 'item',
              url: '/v1/member/showuser'
            }
          ]
        },
        {
          id: 'balanceModule',
          title: 'Wallet Top Up',
          type: 'collapse',
          icon: 'feather icon-home',
          children: [
            {
              id: 'addBalance',
              title: 'Add Balance',
              type: 'item',
              url: '/v1/balance/add'
            },
            {
              id: 'balanceRequests',
              title: 'Balance Requests',
              type: 'item',
              url: '/v1/balance/requests'
            },
            {
              id: 'balanceRequestReports',
              title: 'Balance Request Reports',
              type: 'item',
              url: '/v1/balance/request-reports'
            },
            {
              id: 'walletTopUpReport',
              title: 'Wallet Top Up Report',
              type: 'item',
              url: '/v1/balance/wallet-rop-up-report'
            }
          ]
        },
        // {
        //   id: 'balanceModule',
        //   title: 'Member',
        //   type: 'collapse',
        //   icon: 'feather icon-home',
        //   children: [
        //     {
        //       id: 'createuser',
        //       title: 'Create User',
        //       type: 'item',
        //       url: '/v1/member/adduser'
        //     },
        //     {
        //       id: 'showuser',
        //       title: 'Show User',
        //       type: 'item',
        //       url: '/v1/member/showuser'
        //     }

        //   ]
        // }
      ]
    }
  ];

  public get() {
    // return NavigationItems;
    return this.navItems;
  }
}
