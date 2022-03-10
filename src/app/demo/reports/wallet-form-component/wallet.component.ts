import { DatePipe } from "@angular/common";
import { Component, EventEmitter, Output, OnInit, OnDestroy, Input } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ReportsService } from "../reports.service";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import * as vex from 'vex-js';
import jwt_decode from 'jwt-decode';
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from 'moment';

@Component({
  selector: 'app-wallet-trans-report',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletTransComponent implements OnInit, OnDestroy {
  reportForm: FormGroup;
  today = new Date();
  minimumDate = new Date();
  minimumDate1 = new Date();
  somedate = new Date();
  somedate1 = new Date();
  usernameList = <any>[];
  userRole: string;
  matchData: any;
  @Input() fetchingReport: boolean;
  @Output() walletData = new EventEmitter();
  unsubscribeSubs = new Subject();
  newdate: any;
  storedata=<any>{};

  constructor(
    private reportService: ReportsService,
    private SpinnerService: NgxSpinnerService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    // Setting Minimum Date of the Calendar to be 2 months back from Today.
    this.minimumDate.setMonth(this.today.getMonth() - 2);
    const { userInfo: { userType } } = JSON.parse(sessionStorage.getItem('dashboardData'));
    this.userRole = userType;

    const tokenData: { sub: string } = jwt_decode(sessionStorage.getItem('CORE_SESSION'));
    switch (this.userRole) {
      case 'ROLE_ADMIN':
        this.matchData = { "parent_a": { "query": tokenData.sub } };
        break;

      default:
        this.matchData = {};
        break;
    }

    if (this.userRole === 'ROLE_ADMIN') {
      this.reportForm = new FormGroup({
        subCat: new FormControl('my_wallet1', null),
        userName: new FormControl('', null),
        dateRange: new FormControl(this.today, Validators.required),
        dateRange1: new FormControl(this.today, Validators.required),
      });

      this.observeUserName();
    } else {
      this.reportForm = new FormGroup({
        subCat: new FormControl('my_wallet1', null),
        dateRange: new FormControl(this.today, Validators.required),
        dateRange1: new FormControl(this.today, Validators.required),
      });
    }

    this.subscribeDateRange();
    this.subscribeDateRange1();
  }

  observeUserName() {
    this.reportForm.get('userName').valueChanges
      .pipe(takeUntil(this.unsubscribeSubs))
      .subscribe(
        val => {
          if (val) {
            this.searchUsers(val)
          } else {
            this.usernameList = [];
          }

        }
      );
  }

  searchUsers(e: any) {
    const data = {
      "size": 10000,
      "from": 0,
      "query": {
        "bool": {
          "must": [
            {
              "match": this.matchData
            }
          ],
          "filter": {
            "multi_match": {
              "query": e,
              "type": "phrase_prefix",
              "fields": [
                "user_name",
                "mobile_no",
                "name"
              ],
              "lenient": true
            }
          }
        }
      }
    };

    this.reportService.eUsersAPI(data).subscribe(
      (res: any) => {
        // console.log('Elastic Users List Response: ', res);
        // console.log('Elastic Users List: ', res.hits.hits.map((hit: any) => { return { userName: hit._source.user_name, userId: hit._source.user_id, name: hit._source.name, mobile: hit._source.mobile_no }; }));
        this.usernameList = res.hits.hits.map((hit: any) => { return { userName: hit._source.user_name, userId: hit._source.user_id, name: hit._source.name, mobile: hit._source.mobile_no }; });
      },
      (err: any) => {
        // console.log('Elastic Users List Error: ', err);
      }
    );

  }

  subscribeDateRange() {
    this.reportForm.get('dateRange').valueChanges
      .pipe(takeUntil(this.unsubscribeSubs))
      .subscribe(
        val => {
          const start = val;
          // this.minimumDate1.setMonth(val.getMonth()-1);
          const startDate = new Date(start);
          this.newdate = val;
          // const diffDays = Math.ceil((<any>endDate - <any>startDate) / (1000 * 60 * 60 * 24));
          // (diffDays >= 10) ? this.reportForm.get('dateRange').setErrors({ incorrect: true }) : this.reportForm.get('dateRange').setErrors(null);
        }
      );
  }
  saverange(res) { // Double datepicker added by Akash
    this.minimumDate1 = res;
    // this.somedate.setDate(this.minimumDate1.getDate()+10);
    // var date1 = new Date (this.somedate);
    // console.log(date1);
    var nextWeek = moment(new Date(this.minimumDate1)).add(9, 'days');
    let addedDate = nextWeek.format('YYYY-MM-DD')
    // var now = moment();
    // const  modifiedDate = now.format('YYYY-MM-DD')
    if ((moment().isAfter(nextWeek))) {
      // console.log('modifiedDate' ,addedDate);
      // Inject it into the initial moment object
      this.somedate.setDate(new Date(addedDate).getDate());
      this.somedate1 = new Date(addedDate);
      this.reportForm.get('dateRange1').setValue(this.somedate1);
      // console.log(this.somedate1);

    }
    else {
      this.somedate1 = this.today;
      this.reportForm.get('dateRange1').setValue(this.today);
    }

  }
  subscribeDateRange1() {
    this.reportForm.get('dateRange1').valueChanges
      .pipe(takeUntil(this.unsubscribeSubs))
      .subscribe(
        val => {
          // console.log(val);
          // console.log(this.newdate);

          const end = val;
          const endDate = new Date(end);
          // const diffDays = Math.ceil((<any>endDate - <any>this.newdate) / (1000 * 60 * 60 * 24)); 
          // console.log(diffDays);

          // (diffDays >= 10 || diffDays < 0) ? this.reportForm.get('dateRange1').setErrors({incorrect: true}) :  this.reportForm.get('dateRange1').setErrors(null);
          // (diffDays >= 10 || diffDays < 0 ) ? this.reportForm.get('dateRange').setErrors({incorrect: true}) :  this.reportForm.get('dateRange1').setErrors(null);
        }
      );
  }

  autoDisplay(user: any) {
    // console.log('User: ', user);
    return user ? user.userName : undefined;
  }

  submitReport() {
    // Cashout form submit function added by Akshaya
    let reportData = <any>{};
    const { userInfo: { userName } } = JSON.parse(sessionStorage.getItem('dashboardData'));
    const { dateRange, dateRange1 } = this.reportForm.value;
    let time =moment(new Date(dateRange1)).add(1, 'days');
    // console.log(dateRange);
    switch (this.reportForm.get('subCat').value) {
      case 'my_wallet1':
        reportData = {
          "$1": "wallet1_new_web",
          "$4": this.datePipe.transform(dateRange, 'yyyy-MM-dd'),
          "$5": this.datePipe.transform(dateRange1, 'yyyy-MM-dd'),
          "$2": userName,
          "$7": [
            //  "IMPS_FUND_TRANSFER",
            //  "BENE_VERIFICATION",
            //  "COMMISSION",
            //  "NEFT_FUND_TRANSFER"
            "virtual_balance",
            "Inter_Wallet",
            "Virtual_Balance_Transfer",
            "IMPS_FUND_TRANSFER",
            "BENE_VERIFICATION",
            "COMMISSION",
            "NEFT_FUND_TRANSFER",
            "WALLET_INTERCHANGE",
            "Recharge_Prepaid",
            "Recharge_Postpaid",
            "Recharge_DTH",
            "QR_COLLECT",
            "UPI_COLLECT",
            "PG_Internet Banking",
            "Inter_Wallet_Transfer",
            "Recharge_Prepaid",
            "Recharge_Postpaid",
            "Recharge_DTH",
            "Prepaid_Airtel", "Prepaid_Bsnl", "Prepaid_Idea", "Prepaid_Vodafone", "Prepaid_VodafoneIdea",
            "Prepaid_RelianceJio", "Prepaid_TataIndicom", "Prepaid_TataDocomo", "Prepaid_Aircel", "Prepaid_Telenor",
            "Prepaid_VirginGsm", "Prepaid_Virgincdma", "Prepaid_Mts", "Prepaid_Mtnl", "Postpaid_Airtel", "Postpaid_Bsnl",
            "Postpaid_Idea", "Postpaid_Vodafone", "Postpaid_VodafoneIdea", "Postpaid_RelianceJio", "Postpaid_TataIndicom",
            "Postpaid_TataDocomo", "Postpaid_Aircel", "Postpaid_Telenor", "Postpaid_VirginGsm", "Postpaid_Virgincdma",
            "Postpaid_Mts", "Postpaid_Mtnl", "DTH_AirtelDth", "DTH_BigTvDth", "DTH_DishTvDth", "DTH_TataSkyDth",
            "DTH_VideoconDth", "DTH_SunTvDth", "DTH_JioDth"

          ]
        };
        break;

      case 'user_wallet1':
        let user = this.reportForm.get('userName').value;
        reportData = {
          "$1": "new_user_wallet",
          "$4": this.datePipe.transform(dateRange, 'yyyy-MM-dd'),
          "$5": this.datePipe.transform(dateRange1, 'yyyy-MM-dd'),
          "$2": user.userName,
          "$7": [
            "virtual_balance",
            "Inter_Wallet",
            "Virtual_Balance_Transfer",
            "IMPS_FUND_TRANSFER",
            "BENE_VERIFICATION",
            "COMMISSION",
            "NEFT_FUND_TRANSFER",
            "WALLET_INTERCHANGE",
            "Recharge_Prepaid",
            "Recharge_Postpaid",
            "Recharge_DTH",
            "QR_COLLECT",
            "UPI_COLLECT",
            "PG_Internet Banking",
            "Inter_Wallet_Transfer",
            "Recharge_Prepaid",
            "Recharge_Postpaid",
            "Recharge_DTH",
            "Prepaid_Airtel", "Prepaid_Bsnl", "Prepaid_Idea", "Prepaid_Vodafone", "Prepaid_VodafoneIdea",
            "Prepaid_RelianceJio", "Prepaid_TataIndicom", "Prepaid_TataDocomo", "Prepaid_Aircel", "Prepaid_Telenor",
            "Prepaid_VirginGsm", "Prepaid_Virgincdma", "Prepaid_Mts", "Prepaid_Mtnl", "Postpaid_Airtel", "Postpaid_Bsnl",
            "Postpaid_Idea", "Postpaid_Vodafone", "Postpaid_VodafoneIdea", "Postpaid_RelianceJio", "Postpaid_TataIndicom",
            "Postpaid_TataDocomo", "Postpaid_Aircel", "Postpaid_Telenor", "Postpaid_VirginGsm", "Postpaid_Virgincdma",
            "Postpaid_Mts", "Postpaid_Mtnl", "DTH_AirtelDth", "DTH_BigTvDth", "DTH_DishTvDth", "DTH_TataSkyDth",
            "DTH_VideoconDth", "DTH_SunTvDth", "DTH_JioDth"

          ]
        };
        break;
      case 'user_wallet2':
        if(this.storedata.userId==undefined){
          vex.dialog.alert('Please, choose an user from the user list.')
          return;
        }
        else{
          let user1 = (this.storedata.userId).toString();
          reportData = {
            "adminUserId": user1,
            "fromDate": this.datePipe.transform(dateRange, 'yyyy-MM-dd'),
            "toDate": this.datePipe.transform(time, 'yyyy-MM-dd'),
            "transactionType": "USER_WALLET2"
          };
        }
        break;

      case 'my_wallet2':
        //let user = this.reportForm.get('userName').value;
        reportData = {

          "$1": "wallet2_new_web",
          "$2": userName,
          "$4": this.datePipe.transform(dateRange, 'yyyy-MM-dd'),
          "$5": this.datePipe.transform(dateRange1, 'yyyy-MM-dd'),
          "$7": [
            "COMMISION",
            "COMMISSION",
            "MATM1_CASH_WITHDRAWAL",
            "MATM2_CASH_WITHDRAWAL",
            "Prepaid Recharge",
            "SMS",
            "WALLET2CASHOUT",
            "virtual_balance",
            "Inter_Wallet",
            "WALLET2CASHOUT_IMPS",
            "WALLET2CASHOUT_NEFT",
            "Virtual_Balance_Transfer",
            "IMPS_FUND_TRANSFER",
            "BENE_VERIFICATION",
            "COMMISSION",
            "AEPS_CASH_WITHDRAWAL",
            "AADHAAR_PAY",
            "NEFT_FUND_TRANSFER",
            "WALLET_INTERCHANGE",
            "QR_COLLECT",
            "UPI_COLLECT",
            "PG_Internet Banking"]
        };
        break;
      case 'wallet_interchange':
        //  console.log(this.reportForm.value);
        //  console.log(userName);
        //  console.log(dateRange);
        // let user1 = this.reportForm.get('userName').value;
        reportData = {
          "$1": "wallet_interchange_new",
          "$2": userName,
          "$4": this.datePipe.transform(dateRange, 'yyyy-MM-dd'),
          "$5": this.datePipe.transform(dateRange1, 'yyyy-MM-dd'),
          "$7": [
            "WALLET_INTERCHANGE"
          ]
        };
        // console.log(reportData);
        break;

      default:
        reportData = {
          startDate: this.datePipe.transform(dateRange, 'yyyy-MM-dd'),
          endDate: this.datePipe.transform(dateRange1, 'yyyy-MM-dd'),
          userName
        };
        break;
    }
    if(this.reportForm.get('subCat').value === 'user_wallet2'){
      if(reportData["adminUserId"]==undefined || reportData["adminUserId"]==null){
        vex.dialog.alert('Please, choose an user from the user list.')
        return;
      }
    }
    // if ((this.userRole === 'ROLE_ADMIN') && (this.reportForm.get('subCat').value === 'user_wallet2')) {      
    //   if (!reportData["adminUserId"]) {
    //     vex.dialog.alert('Please, choose an user from the user list.wwwww')
    //     return;
    //   }
    // }
    if ((this.userRole === 'ROLE_ADMIN') && (this.reportForm.get('subCat').value === 'user_wallet1')) {      
      if (!reportData["$2"]) {
        vex.dialog.alert('Please, choose an user from the user list.')
        return;
      }
    }
    this.walletData.emit({ type: 'wallet', data: reportData, wType: this.reportForm.get('subCat').value });
  }
  populateBene(bene) {
    this.storedata=bene;
  }

  ngOnDestroy() {
    this.unsubscribeSubs.next(true);
    this.unsubscribeSubs.complete();
  }
}
