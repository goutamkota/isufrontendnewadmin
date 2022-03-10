import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";

import { AuthService } from "../auth.service";
import { AuthConfig } from 'src/app/app-config';
import { AuthApi } from '../auth.api';
import { ActivatedRoute, Router } from "@angular/router";
import { AppService } from "src/app/app.service";
import { StorageMap } from '@ngx-pwa/local-storage';

import Toastify from 'toastify-js'
import { finalize } from "rxjs/operators";

import { handleAuthenticationUser } from 'src/auth-script/auth'

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {

  userImg = 'https://firebasestorage.googleapis.com/v0/b/iserveu_storage/o/AdminFolder%2FinHouse%2Fphoto.png?alt=media&token=b0198a05-5988-4469-bdce-d52afb30ff19';
  signInForm: FormGroup;
  signing = false;
  siteData = {};

  constructor(
    private authService: AuthService,
    // private store: Store<any>,
    private router: Router,
    private appService: AppService,
    private storage: StorageMap,
    private query: ActivatedRoute
  ) { }

  ngOnInit() {
    this.signInForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });

    this.authenticateToken();
  }

  notify(options: { message: string, status: string }) {
    Toastify({
      text: options.message,
      duration: 5000,
      className: (options.status === 'success') ? 'toastr-base toastr-success' : 'toastr-base toastr-error',
      close: true
    }).showToast();
  }

  authenticateToken() {

    this.query.queryParams.subscribe(
      (res: any) => {

          if (res.token) {
              sessionStorage.setItem('CORE_SESSION', res.token);

              const isValid = handleAuthenticationUser(res.token);
              console.log('Is Token Valid: ', isValid);

              if (isValid) {
                this.fetchDashboardData();
                this.fetchWallet1();
                this.fetchWallet2();
                this.storeNotifications();
    
                this.appService.observeInternetConn(); // Observe Internet Connection
                this.appService.autoLogOut();
              }

          } else {
              console.log('Token Not Passed.')
          }

      },
      (err: any) => {
        console.log('Error in Token Fetching.')
      }
    );

  }

  loginUser() {
    this.signing = true;
    AuthConfig.config.encodeUrl(AuthApi.url.login, this.signInForm.value.username).then((encurl: string) => {
      this.authService.signUser(encurl, this.signInForm.value)
        .subscribe(
          (res: any) => {

            sessionStorage.setItem('CORE_SESSION', res.token);

            // this.store.dispatch(new Dashboard.SetUserData({ loggedInUser: this.signInForm.value.username }));

            this.fetchDashboardData();
            this.fetchWallet1();
            this.fetchWallet2();
            this.storeNotifications();

            this.appService.observeInternetConn(); // Observe Internet Connection
            this.appService.autoLogOut();

            // this.router.navigate(['/v1']);

          },
          (err: any) => {
            const errMsg = (err.error.message) ? err.error.message : 'Server Error, Please, try again.';
            const notify = {
              message: `Login Failed: ${errMsg}`,
              status: 'error'
            };
            this.notify(notify);
          }
        );
    });
  }

  storeNotifications() {
    const notiApiFeed = {
      "product_name":"Global",
      "user_name": this.signInForm.value.username,
      type: '',
      page: 1,
      "limit":"10"    
    };
    this.appService.fetchNotifications(notiApiFeed)
    .pipe(finalize(() => { 
      // this.fetchingNotifs = false;
    }))
    .subscribe(
      (res: any) => {
        console.log('Notifications API Res: ', res);
        this.storage.set('notifications', res.data).subscribe(() => { });
        // this.notiResponse = res;
      },
      (err: any) => {
        console.log('Notifications API Error: ', err);
        this.storage.set('notifications', []).subscribe(() => { });
        // console.log('Notifications API Error Status: ', err.status);
        // this.showNotifs = false; // Reset Notification Flag
        // vex.dialog.alert({
        //     unsafeMessage: `
        //         <div class="d-flex flex-column">
        //             <b>Notification Fetching Failed.</b>
        //             <small>${err.message}</<small>
        //         </div>
        //     `
        // });
      }
    );
  }

  fetchDashboardData() {
    AuthConfig.config.encodeUrl(AuthApi.url.dashboard, this.signInForm.value.username).then((encDashurl: string) => {
      this.authService.getReqs(encDashurl)
      .pipe(finalize(() => this.signing = false))
      .subscribe(
        (res: any) => {

          const { userInfo: { userType } } = res;

          if (userType !== 'ROLE_ADMIN') {

            const notify = {
              message: `Login Failed: Please, provide only ADMIN CREDENTIALS.`,
              status: 'error'
            };
            this.notify(notify);

            this.appService.logOut();
            
            return;
          }

          const notify = {
            message: 'Login Successfull',
            status: 'success'
          };
          this.notify(notify);


          // this.store.dispatch(new Dashboard.SetDashboardData(res));
          sessionStorage.setItem('dashboardData', JSON.stringify(res));
          this.storage.set('dashboardData', res).subscribe(() => { });

          this.router.navigate(['/v1']);
        },
        (err: any) => {
          console.log('Dashboard Error: ', err);
        }
      );
    });


    // this.store.select('dashboard').subscribe(
    //     (storeData: any) => {

    //         AuthConfig.config.encodeUrl(AuthApi.url.dashboard, storeData.userData.loggedInUser).then((encDashurl: string) => {
    //             this.authService.getReqs(encDashurl).subscribe(
    //                 (res: any) => {
    //                     console.log('Dashboard Response: ', res);
    //                     this.store.dispatch(new Dashboard.SetDashboardData(res));
    //                 },
    //                 (err: any) => {
    //                     console.log('Dashboard Error: ', err);
    //                 }
    //             );
    //         });

    //     }
    // );
  }

  fetchWallet1() {
    AuthConfig.config.encodeUrl(AuthApi.url.wallet1, this.signInForm.value.username).then((encDashurl: string) => {
      this.authService.getReqs(encDashurl).subscribe(
        (res: any) => {
          // this.store.dispatch(new Dashboard.SetW1Data({amount: res}));
          sessionStorage.setItem('w1Data', res);
          this.storage.set('wallet1', res).subscribe(() => { });
        },
        (err: any) => {
          console.log('Wallet1 Error: ', err);
        }
      );
    });
  }

  fetchWallet2() {
    AuthConfig.config.encodeUrl(AuthApi.url.wallet2, this.signInForm.value.username).then((encDashurl: string) => {
      this.authService.getReqs(encDashurl).subscribe(
        (res: any) => {
          // this.store.dispatch(new Dashboard.SetW2Data({amount: res}));
          sessionStorage.setItem('w2Data', res);
          this.storage.set('wallet2', res).subscribe(() => { });
          // this.storage.set('wallet2', res).subscribe(() => { });

        },
        (err: any) => {
          console.log('Wallet2 Error: ', err);
        }
      );
    });
  }
}
