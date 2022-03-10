import { DatePipe } from "@angular/common";
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import * as vex from 'vex-js';
import * as moment from 'moment';
import { BalanceService } from "../balance.service";
import { animate, style, transition, trigger } from "@angular/animations";
import { DatatableComponent } from "@swimlane/ngx-datatable";
@Component({
  selector: 'app-wallet-top-up-report',
  templateUrl: './wallet-top-up-report.component.html',
  styleUrls: ['./wallet-top-up-report.component.scss'],
  animations: [
    trigger('fadeSlideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('500ms', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('500ms', style({ opacity: 0, transform: 'translateY(10px)' }))
      ])
    ]),
  ]
})
export class WalletTopUpReportComponent implements OnInit, OnDestroy {
  walletTopUpForm: FormGroup;
  unsub = new Subject();
  today = new Date();
  minimumDate = new Date();
  minimumDate1 = new Date();
  totalpagecount: any;
  totalamount = [];
  total: any = 0;
  transferTyped: any;
  operationPerformed: any;
  somedate = new Date();
  somedate1 = new Date();
  newdate: any;
  fetchingReport = false;
  unsubscribeSubs = new Subject();
  userName: string;
  searchInput = new FormControl('', null);
  walletReports = { records: <any>[], recordHeaders: <any>[], recordsSource: <any>[] };
  @ViewChild('dateTemplate', { static: false }) dateTemplate: TemplateRef<any>;
  @ViewChild('statusTemplate', { static: false }) statusTemplate: TemplateRef<any>;
  @ViewChild('actionTemplate', { static: false }) actionTemplate: TemplateRef<any>;
  @ViewChild('table', { static: false }) table: DatatableComponent;
  reports = [];
  tableCols = [];
  reportsSource = [];
  pageLimitOptions = [
    { value: 5 },
    { value: 10 },
    { value: 25 },
    { value: 50 },
    { value: 100 },
  ];
  currentPageLimit: number = 10;
  constructor(
    private datePipe: DatePipe,
    private ngxSpinner: NgxSpinnerService,
    private balanceService: BalanceService
  ) { }

  ngOnInit() {
    this.reportsSource = this.reports = [];
    const { userName } = JSON.parse(sessionStorage.getItem('dashboardData')).userInfo;
    this.userName = userName;

    this.minimumDate.setMonth(this.today.getMonth() - 9);

    this.walletTopUpForm = new FormGroup({
      dateRange: new FormControl(this.today, Validators.required),
      dateRange1: new FormControl(this.today, Validators.required),
      oprPerf: new FormControl('ALL', Validators.required),
      transferType: new FormControl('ALL', Validators.required),
    });

    this.subscribeDateRange();
    this.subscribeDateRange1();
  }

  subscribeDateRange() {
    this.walletTopUpForm.get('dateRange').valueChanges
      .pipe(takeUntil(this.unsub))
      .subscribe(
        val => {
          // const [start, end] = val;
          // const startDate = new Date(start);
          // const endDate = new Date(end);
          // const diffDays = Math.ceil((<any>endDate - <any>startDate) / (1000 * 60 * 60 * 24)); 
          // (diffDays > 10) ? this.walletTopUpForm.get('dateRange').setErrors({incorrect: true}) :  this.walletTopUpForm.get('dateRange').setErrors(null);
          const start = val;
          const startDate = new Date(start);
          this.newdate = val;
        }
      );
  }
  saverange(res) { // Double datepicker added by Akash
    this.minimumDate1 = res;
    // this.timingfunction();
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
      this.walletTopUpForm.get('dateRange1').setValue(this.somedate1);
      // console.log(this.somedate1);

    }
    else {
      this.somedate1 = this.today;
      this.walletTopUpForm.get('dateRange1').setValue(this.today);
    }

  }
  subscribeDateRange1() {// Double datepicker added by Akash
    this.walletTopUpForm.get('dateRange1').valueChanges
      .pipe(takeUntil(this.unsubscribeSubs))
      .subscribe(
        val => {
          const end = val;
          const endDate = new Date(end);
          // const diffDays = Math.ceil((<any>endDate - <any>this.newdate) / (1000 * 60 * 60 * 24)); 
          // console.log(diffDays);
          // if(diffDays>10 && this.timeflag== false){
          //   this.reportForm.setErrors({invalid:true})
          // }
          // (diffDays > 10 || diffDays < 0) ? this.reportForm.get('dateRange1').setErrors({incorrect: true}) :  this.reportForm.get('dateRange1').setErrors(null);
          // (diffDays > 10 || diffDays < 0 ) ? this.reportForm.get('dateRange').setErrors({incorrect: true}) :  this.reportForm.get('dateRange1').setErrors(null);
        }
      );
  }

  fetchWalletTopUpRequests() {
    this.fetchingReport = true;
    this.totalamount = [];
    this.total = 0;
    if (this.walletTopUpForm.valid) {

      const { dateRange, dateRange1 } = this.walletTopUpForm.value;
      let transferTyped = this.walletTopUpForm.value.transferType;
      let operationPerformed = this.walletTopUpForm.value.oprPerf;
      const walletTopUpReportData = {
        "$1": "wallet_report_web",
        "$2": this.userName,
        "$4": this.datePipe.transform(dateRange, 'yyyy-MM-dd'),
        "$5": this.datePipe.transform(dateRange1, 'yyyy-MM-dd'),
        "$6": [
          "Wallet Topup",

          "wallet_topup",

          "PG",

          "wallet2 topup",

          "NETBANKING",

          "interwallet"


        ],
        "$7": [
          "cash_deposite",

          "QR_COLLECT",

          "UPI_COLLECT",

          "wallet_topup",

          "virtual_balance",

          "Inter_Wallet",

          "Virtual_Balance_Transfer",

          "Inter_Wallet_Transfer",

          "Inter_Wallet_Transfer",

          "PG_Internet Banking",

          "VA",

          "topup",

          "CDM Card",

          "Inter_Wallet_Transfer"
        ],
        "$13": [operationPerformed],

        "$14": [
          "All"
        ],

        "$15": [transferTyped]

      };
      this.ngxSpinner.show('walletTopUpReportSpinner', { bdColor: "rgba(0, 0, 0, 0.5)", type: "timer" });
      this.balanceService.fetchWalletTopUpReports(walletTopUpReportData)
        .pipe(finalize(() => {
          this.ngxSpinner.hide('walletTopUpReportSpinner');
          this.fetchingReport = false;
        }))
        .subscribe(
          (res: any) => {
            console.log('Wallet Top Up Reports Response: ', res);
            this.reportsSource = this.reports = res.Report.map(el => {
              if (el.balanceAmount) { delete el.balanceAmount; }
              if (el.previousAmount) { delete el.previousAmount; }
              if (el.transactionType) { delete el.transactionType; }
              return el;
            });;
            this.totalamount = [];
            this.totalpagecount = this.reportsSource.length;
            for (let i = 0; i < this.reportsSource.length; i++) {
              var amnt = parseFloat(this.reportsSource[i].amount)
              this.totalamount.push(amnt);
            }
            if (this.reportsSource.length > 0) {
              const reducer = (accumulator, currentValue) => accumulator + currentValue;
              this.total = this.totalamount.reduce(reducer).toFixed(2);
            }
            if (res.Report.length) {

              this.walletReports.recordsSource = this.walletReports.records = res.Report;
              this.walletReports.recordHeaders = Object.keys(res.Report[0]).filter(col => col !== 'remarks')
                .map((col) => {
                  switch (col) {
                    case 'Id':
                      return { prop: col };

                    case 'approvalTime':
                    case 'depositDateTime':
                    case 'requestDateTime':
                      return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.dateTemplate, minWidth: 170 };

                    case 'status':
                      return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.statusTemplate };

                    default:
                      return { name: col.replace(/([A-Z])/g, ' $1') };
                  }
                });
              this.walletReports.recordHeaders.push({ name: 'Actions', cellTemplate: this.actionTemplate });

            } else {
              vex.dialog.alert('No Records Forund.');
            }
          },
          (err: any) => {
            vex.dialog.alert('Wallet Top Up Reports: ', err);
          }
        );

    } else {
      vex.dialog.alert('Please, provide valid details.')
    }
  }

  public onLimitChange(limit: any): void {
    this.changePageLimit(limit);
    this.table.limit = this.currentPageLimit
    // this.table.limit=this.currentPageLimit;
    this.table.recalculate();
    setTimeout(() => {
      if (this.table.bodyComponent.temp.length <= 0) {
        this.table.offset = Math.floor((this.table.rowCount - 1) / this.table.limit);
        // console.log(this.table.offset);
      }
    });
  }
  private changePageLimit(limit: any): void {
    this.currentPageLimit = parseInt(limit, 10);
  }
  updateFilter(event) {

    const val = event.target.value;
    if (this.walletReports.recordsSource.length) {
      // filter our data
      if (!val) {
        this.totalamount = [];
        this.totalpagecount = this.reportsSource.length;
        for (let i = 0; i < this.reportsSource.length; i++) {
          var amnt = (parseFloat(this.reportsSource[i].amount));
          this.totalamount.push(amnt);
        }
      }
      if (val && this.walletReports.recordsSource.length) {

        const temp = this.walletReports.recordsSource.filter(d => {

          const vals = Object.values(d);
          return new RegExp(val, 'gi').test(vals.toString());

        });
        // update the rows
        this.walletReports.records = temp;
        this.totalpagecount = temp.length;
        if (temp.length != 0) {
          this.totalamount = [];
          for (let i = 0; i < temp.length; i++) {
            var amnt = parseFloat(temp[i].amount)
            this.totalamount.push(amnt);
          }
          const reducer = (accumulator, currentValue) => accumulator + currentValue;
          this.total = this.totalamount.reduce(reducer).toFixed(2);
        }
      } else {
        this.walletReports.records = this.walletReports.recordsSource;
      }
    } else {
      vex.dialog.alert('No data to perform search.');
      this.searchInput.reset();
    }

  }

  downloadExcel() {
    this.balanceService.generateExcel([...this.walletReports.records]);
  }

  showRemarks(remarks: string) {
    console.log('Remarks: ', remarks);
    const rmrkData = `[${remarks}]`;
    const remarkdata = JSON.parse(rmrkData);
    console.log(remarkdata);
    let remarkparsedata = remarkdata.reverse().map(rmk =>
      // <strong>${rmk.type}:</strong> ${rmk.remarks}<br>
      `
            <div><b>Status:</b> ${rmk.type}</div>
            <div><b>Remark:</b> ${rmk.remarks}</div>
            <br>
        `).join('');
    vex.dialog.alert({
      unsafeMessage:
        `<div class="remark-status-container">
                <h5>Remark Status</h5>
                ${remarkparsedata}
            </div>`
      //  `
      //     <div class="remark-status-container">
      //         <h5>Remark Status</h5>
      //         <div><b>Status:</b> ${remarkdata.type}</div>
      //         <div><b>Remark:</b> ${remarkdata.remarks}</div>
      //     </div>
      // `
    });

  }

  ngOnDestroy() {
    this.unsub.next(true);
    this.unsub.complete();
  }
}