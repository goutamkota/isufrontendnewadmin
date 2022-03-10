import { Component, OnDestroy, OnInit , ViewChild} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { Observable, of, OperatorFunction, Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, finalize, tap, switchMap, catchError, takeUntil } from "rxjs/operators";
import { AppService } from "src/app/app.service";
import * as vex from 'vex-js';
import { BalanceService } from "./balance.service";
import * as converter from 'number-to-words';
import { NumberToWordsPipePipe } from "../../number-to-words-pipe.pipe";

@Component({
    selector: 'app-balance',
    templateUrl: './balance.component.html',
    styleUrls: ['./balance.component.scss']
})
export class BalanceComponent implements OnInit, OnDestroy {
    @ViewChild('confirmmodalpay', { static: false }) public transModal1: any;
    @ViewChild('confirmmodalpay1', { static: false }) public transModal2: any;
    @ViewChild('confirmmodalpay2', { static: false }) public transModal3: any;
    addBalanceForm: FormGroup;
    selectBalanceForm: FormControl;
    userName: string;
    selectedUser: any;
    istrans:any;
    searching = false;
    searchFailed = false;
    unsub = new Subject();
    unsubUserControl = new Subject();
    transferData = {
        customerData: { name: '', mobileNumber: '', id: null },
        beneData: { name: '', bankName: '', accountNumber: '', ifscCode: '', id: null },
        date: new Date(),
        amount: 0,
        mode: ''
    };
    outputWords: any;
    toupper: any;

    constructor(
        private balanceService: BalanceService,
        private ngxSpinner: NgxSpinnerService,
        private appService: AppService,
        private indianpipe: NumberToWordsPipePipe
    ) {}

    ngOnInit() {
        this.selectBalanceForm = new FormControl('addVirtBal', null);

        this.addBalanceForm = new FormGroup({
            amount: new FormControl('', [Validators.required]),
            remarks: new FormControl('', [Validators.required])
        });

        const {userName} = JSON.parse(sessionStorage.getItem('dashboardData')).userInfo;
        this.userName = userName;

        this.observeBalanceType();

        this.observeAmount();
    }

    observeAmount() {
        this.addBalanceForm.get('amount').valueChanges
        .pipe(takeUntil(this.unsub))
        .subscribe(
            val => {
                // console.log('Amount Value: ', val);

                if (val) {

                    // console.log('# Of Dots: ', val.match(/[.]/g));
    
                    const matches = val.match(/[.]/g);
                    const dotsInvalid = matches ? (matches.length > 1 ? true : false) : false;
    
                    // console.log('Dots: ', dotsInvalid)

                    // if (!dotsInvalid) { console.log('Amount: ', val.split('.')) }

                    const decimals = val.split('.');
                    const decimalInvalid = !dotsInvalid ?(decimals[1] ? (decimals[1].length > 2 ? true : false) : false) : false;
    
                    if ((val === '.') || dotsInvalid || decimalInvalid) {
                        this.addBalanceForm.patchValue({
                            amount: (val.slice(0, -1))
                        });
                    }

                }

            }
        )
    }

    observeBalanceType() {
        this.selectBalanceForm.valueChanges
        .pipe(takeUntil(this.unsub))
        .subscribe(val => {
            if (val === 'transVirtBal') {debugger
                this.addBalanceForm.addControl('user', new FormControl('', [Validators.required])); 
                this.observeUserControl();
            } else {
                this.addBalanceForm.removeControl('user');
                this.unsubUserControl.next(true);
                this.unsubUserControl.complete();
                this.selectedUser = undefined;
            }

            this.addBalanceForm.reset();
        });
    }

    observeUserControl() {
        this.addBalanceForm.get('user').valueChanges
        .pipe(takeUntil(this.unsubUserControl))
        .subscribe(val => {
            if (val && (typeof val !== 'string')) {
                this.selectedUser = val;
                console.log(this.selectedUser);
                
            }
        })
    }

    search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term =>
        this.balanceService.eUsersAPI(term, this.userName).pipe(
          tap(() => this.searchFailed = false),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          }))
      ),
      tap(() => this.searching = false)
    );

    formatter = (x: {userName: string, userId: string, name: string, mobile: string}) => x.userName;
    transdebit(){
        this.transferData.customerData.name=this.selectedUser.userName;
        this.transferData.beneData.name= this.selectedUser.name;
        this.transferData.customerData.mobileNumber=this.selectedUser.mobile;
        this.transferData.amount=this.addBalanceForm.get('amount').value;
        this.outputWords = this.indianpipe.transform(this.transferData.amount);
        this.toupper=this.outputWords.toUpperCase()
        this.transModal1.show();
       
        // this.ngxSpinner.show('balanceSpinner', { bdColor: "rgba(0, 0, 0, 0.5)", type: "timer" });
        // const {user, amount, remarks} = this.addBalanceForm.value;
        // const balanceData = {
        //     userName: user ? user.userName : this.userName,
        //     amount: +amount,
        //     remarks,
        //     transaction: "DEBIT",
        //     api_user: 'WEBUSER'
        // };
        // this.balanceService.trans(balanceData)
        // .pipe(finalize(() => {
        //     this.ngxSpinner.hide('balanceSpinner');
        // }))
        // .subscribe(
        //     (res: any) => {
        //         // console.log('Add Balance Res: ', res);
        //         vex.dialog.alert(res.message);
        //         this.addBalanceForm.reset();

        //         this.appService.fetchWalletBalance();
        //     },
        //     (err: any) => {
        //         console.log('Add Balance Error: ', err);
        //         if (err.status >= 400 && err.status < 500) {
        //             vex.dialog.alert(err.error.message);
        //         } else {
        //             vex.dialog.alert('Server Error');
        //         }
        //     },
        // );

        
    }
    connectThenTransfer(){
        this.hideconfirmmodal();
        this.ngxSpinner.show('balanceSpinner', { bdColor: "rgba(0, 0, 0, 0.5)", type: "timer" });
        const {user, amount, remarks} = this.addBalanceForm.value;
        const balanceData = {
            userName: user ? user.userName : this.userName,
            amount: +amount,
            remarks,
            transaction: "DEBIT",
            api_user: 'WEBUSER'
        };
        this.balanceService.trans(balanceData)
        .pipe(finalize(() => {
            this.ngxSpinner.hide('balanceSpinner');
        }))
        .subscribe(
            (res: any) => {
                // console.log('Add Balance Res: ', res);
                vex.dialog.alert(res.message);
                this.addBalanceForm.reset();

                this.appService.fetchWalletBalance();
            },
            (err: any) => {
                console.log('Add Balance Error: ', err);
                if (err.status >= 400 && err.status < 500) {
                    vex.dialog.alert(err.error.message);
                } else {
                    vex.dialog.alert('Server Error');
                }
            },
        );

    }
    connectThenTransfer1(){
        this.hideconfirmmodal();
                this.ngxSpinner.show('balanceSpinner', { bdColor: "rgba(0, 0, 0, 0.5)", type: "timer" });
        const {user, amount, remarks} = this.addBalanceForm.value;
        const balanceData = {
            userName: user ? user.userName : this.userName,
            amount: +amount,
            remarks,
            transaction: "PAY",
            api_user: 'WEBUSER'
        };
        this.balanceService.trans(balanceData)
        .pipe(finalize(() => {
            this.ngxSpinner.hide('balanceSpinner');
        }))
        .subscribe(
            (res: any) => {
                // console.log('Add Balance Res: ', res);
                vex.dialog.alert(res.message);
                this.addBalanceForm.reset();

                this.appService.fetchWalletBalance();
            },
            (err: any) => {
                console.log('Add Balance Error: ', err);
                if (err.status >= 400 && err.status < 500) {
                    vex.dialog.alert(err.error.message);
                } else {
                    vex.dialog.alert('Server Error');
                }
            },
        );

    }
    transcredit(){
        this.transferData.customerData.name=this.selectedUser.userName;
        this.transferData.beneData.name= this.selectedUser.name;
        this.transferData.customerData.mobileNumber=this.selectedUser.mobile;
        this.transferData.amount=this.addBalanceForm.get('amount').value;
        this.outputWords = this.indianpipe.transform(this.transferData.amount);
        this.toupper=this.outputWords.toUpperCase()
        this.transModal2.show();
       
        // this.ngxSpinner.show('balanceSpinner', { bdColor: "rgba(0, 0, 0, 0.5)", type: "timer" });
        // const {user, amount, remarks} = this.addBalanceForm.value;
        // const balanceData = {
        //     userName: user ? user.userName : this.userName,
        //     amount: +amount,
        //     remarks,
        //     transaction: "PAY",
        //     api_user: 'WEBUSER'
        // };
        // this.balanceService.trans(balanceData)
        // .pipe(finalize(() => {
        //     this.ngxSpinner.hide('balanceSpinner');
        // }))
        // .subscribe(
        //     (res: any) => {
        //         // console.log('Add Balance Res: ', res);
        //         vex.dialog.alert(res.message);
        //         this.addBalanceForm.reset();

        //         this.appService.fetchWalletBalance();
        //     },
        //     (err: any) => {
        //         console.log('Add Balance Error: ', err);
        //         if (err.status >= 400 && err.status < 500) {
        //             vex.dialog.alert(err.error.message);
        //         } else {
        //             vex.dialog.alert('Server Error');
        //         }
        //     },
        // );

        
    }
    transpay(){
        this.transferData.amount=this.addBalanceForm.get('amount').value;
        this.outputWords = this.indianpipe.transform(this.transferData.amount);
        this.toupper=this.outputWords.toUpperCase()
        // this.addBalance()
        this.transModal3.show();
    
    }
    connectThenTransfer2(){
        this.hideconfirmmodal()
        this.addBalance()
    }
    hideconfirmmodal() {
        this.transModal1.hide();
        this.transModal2.hide();
        this.transModal3.hide();
    }
    addBalance() {
        console.log('Form Value: ', this.addBalanceForm.value);
        if (this.addBalanceForm.valid) {
            
            const {user, amount, remarks} = this.addBalanceForm.value;
            const balanceData = {
                amount: +amount,
                remarks,
                userName: user ? user.userName : this.userName,
                api_user: 'WEBUSER'
            };
            
            console.log('Balance Data: ', balanceData);

            if (!balanceData.userName) {
                vex.dialog.alert('Please, select a user from the list.');
                return;
            }

            if (this.selectBalanceForm.value === 'addVirtBal') {

                this.ngxSpinner.show('balanceSpinner', { bdColor: "rgba(0, 0, 0, 0.5)", type: "timer" });
                this.balanceService.addBalance(balanceData)
                .pipe(finalize(() => {
                    this.ngxSpinner.hide('balanceSpinner');
                }))
                .subscribe(
                    (res: any) => {
                        // console.log('Add Balance Res: ', res);
                        vex.dialog.alert(res.message);
                        this.addBalanceForm.reset();
    
                        this.appService.fetchWalletBalance();
                    },
                    (err: any) => {
                        console.log('Add Balance Error: ', err);
                        if (err.status >= 400 && err.status < 500) {
                            vex.dialog.alert(err.error.message);
                        } else {
                            vex.dialog.alert('Server Error');
                        }
                    },
                );

            } else {

               
                this.ngxSpinner.show('balanceTransferSpinner', { bdColor: "rgba(0, 0, 0, 0.5)", type: "timer" });
                this.balanceService.transferBalance(balanceData)
                .pipe(finalize(() => {
                    this.ngxSpinner.hide('balanceTransferSpinner');
                }))
                .subscribe(
                    (res: any) => {
                        console.log('Transfer Balance Response: ', res);

                        vex.dialog.alert(res.message);
                        this.addBalanceForm.reset();
                        this.selectedUser = undefined;
    
                        this.appService.fetchWalletBalance();
                    },
                    (err: any) => {
                        console.log('Transfer Balance Error: ', err);

                        if (err.status >= 400 && err.status < 500) {
                            vex.dialog.alert(err.error.message);
                        } else {
                            vex.dialog.alert('Server Error');
                        }
                    }
                );

            }

        } else {
            vex.dialog.alert('Please, fill up valid details.');
        }
    }

    ngOnDestroy() {
        this.unsub.next(true);
        this.unsub.complete();
        this.unsubUserControl.next(true);
        this.unsubUserControl.complete();
    }
}