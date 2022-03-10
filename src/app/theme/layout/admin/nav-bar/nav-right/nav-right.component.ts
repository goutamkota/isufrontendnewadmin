import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgbDropdownConfig} from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';

import jwt_decode from 'jwt-decode';
import * as vex from 'vex-js';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-nav-right',
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig]
})
export class NavRightComponent implements OnInit, OnDestroy {

  walletBalance = 0;
  wallet2Balance = 0;
  apibalance =0;
  notifications = <any>[];
  allNotifications = <any>[];
  // notiResponse: any;
  fetchingNotifs = false;
  showNotifs = false;
  userName = '';
  notiStorage: any;
  // notiApiFeed = {
  //   "product_name":"Global",
  //   "user_name":'',
  //   type: '',
  //   page: 1,
  //   "limit":"10"    
  // };
  unsub = new Subject();

  constructor(
    private appService: AppService,
    private ngxSpinner: NgxSpinnerService,
    private storage: StorageMap
  ) { }

  ngOnInit() { 
  //   this.notifications.push({
  //     "message":{
  //        "amount":"",
  //        "product_name":"DMT",
  //        "transactionId":"4540649427574784",
  //        "status":"FAILED",
  //        "status_desc":"NA",
  //        "created_date":"2021-03-25 12:40:10",
  //        "updated_date":"2021-03-25 12:40:14",
  //        "last_notify_time":"2021-03-25 12:40:14",
  //        "transaction_type":"DMT",
  //        "Operation_Performed":"FN_FUND_TRANSFER"
  //     },
  //     "_id":"605c3758074bf7000e64994d",
  //     "CreatedDate":"2021-03-25T07:10:16.183Z",
  //     "User_id":"488",
  //     "User_name":"itpl",
  //     "product_name":"DMT",
  //     "__v":0
  //  });

    const tokenData: {sub: string} = jwt_decode(sessionStorage.getItem('CORE_SESSION'));
    this.userName = tokenData.sub;

    this.appService.walletBalance
    .pipe(takeUntil(this.unsub))
    .subscribe(
      val => {
        console.log('Wallet Balance in Navbar: ', val);
        this.walletBalance = val;
      }
    );
    this.appService.apibalance
    .pipe(takeUntil(this.unsub))
    .subscribe(
      val => {
        console.log('Wallet Balance in Navbar: ', val);
        this.apibalance = val;
      }
    );

    this.appService.wallet2Balance
    .pipe(takeUntil(this.unsub))
    .subscribe(
      val => {
        console.log('Wallet 2 Balance in Navbar: ', val);
        this.wallet2Balance = val;
      }
    );

    this.loadingNotifications();


  }

  getNotifications() {

    // Call Api, only when notification pop up is opened.
    if (this.showNotifs) {
      this.fetchingNotifs = true;
      this.storage.get('notifications')
      .pipe(finalize(() => { this.fetchingNotifs = false; }))
      .subscribe((notifs: any) => {
        this.notiStorage = notifs;
        this.allNotifications = this.notifications = notifs.result;
      });
    }

  }

  filterNotifications(type: string) {
    this.notifications = this.allNotifications.filter(notif => notif.Type === type);
  }

  fetchWallet() {
    this.ngxSpinner.show('walletSpinner', { bdColor: "rgba(0, 0, 0, 0.5)", type: "timer" });
    this.appService.fetchWalletBalance();
  }

  fetchWallet2() {
    this.ngxSpinner.show('wallet2Spinner', { bdColor: "rgba(0, 0, 0, 0.5)", type: "timer" });
    this.appService.fetchWallet2Blanace();
  }

  fetchWallet3() {
    this.ngxSpinner.show('wallet2Spinner', { bdColor: "rgba(0, 0, 0, 0.5)", type: "timer" });
    this.appService.fetchapibalance();
  }

  logOutApp() {
    this.appService.logOut();
  }

  loadingNotifications() {
    const notiContainer = document.querySelector('.noti-body');
    // console.log('Noti Container: ', notiContainer);

    notiContainer.addEventListener('scroll', this.scrollEvent);
  }

  scrollEvent = () => {
    const notiContainer = document.querySelector('.noti-body');
    const { scrollTop, scrollHeight, clientHeight } = notiContainer;


      if ((Math.floor(scrollTop) + clientHeight) > (scrollHeight - 5)) {
        // console.log('API Called.');
        // console.log('Notifications: ', this.notiStorage);

        // Maximum 60 Notifications will be kept in the Storage. 
        if (('next' in this.notiStorage) && this.notiStorage.result.length <= 50 ) {

          notiContainer.removeEventListener('scroll', this.scrollEvent);

          const notiApiFeed = {
            "product_name":"Global",
            "user_name": this.userName,
            type: '',
            page: this.notiStorage.next.page,
            "limit":"10"    
          };
          this.fetchingNotifs = true;
          this.appService.fetchNotifications(notiApiFeed)
          .pipe(finalize(() => { this.fetchingNotifs = false; }))
          .subscribe(
            (res: any) => { 
              console.log('Scroll Notifications Res: ', res);

              const notiData = {
                ...this.notiStorage,
                ...res.data,
                result: [...this.notiStorage.result, ...res.data.result]
              }

              // console.log('Update Notification Data: ', notiData);

              this.storage.set('notifications', notiData).subscribe(() => { 
                this.notiStorage = notiData;
                this.allNotifications = this.notifications = notiData.result;
                // this.valve = true;
                notiContainer.addEventListener('scroll', this.scrollEvent);
              }); 
            },
            (err: any) => {
              console.log('Scroll Notifications Error: ', err);
            }
          );

        }

      }
  }

  ngOnDestroy() {
    this.unsub.next(true);
    this.unsub.complete();
  }
}
