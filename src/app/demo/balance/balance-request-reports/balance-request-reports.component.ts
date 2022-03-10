import { DatePipe } from "@angular/common";
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import * as vex from 'vex-js';
import { BalanceService } from "../balance.service";
import * as moment from 'moment';
import { animate, style, transition, trigger } from "@angular/animations";
import { DatatableComponent } from "@swimlane/ngx-datatable";

@Component({
    selector: 'app-balance-request-reports',
    templateUrl: './balance-request-reports.component.html',
    styleUrls: ['./balance-request-reports.component.scss'],
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
export class BlanceRequestReportsComponent implements OnInit, OnDestroy {
    userName: string;
    unsub = new Subject();
    today = new Date();
    minimumDate = new Date();
    minimumDate1 = new Date();
    somedate = new Date();
    somedate1 = new Date();
    newdate: any;
    fetchingReport = false;
    unsubscribeSubs = new Subject();
    balanceRequestReportForm: FormGroup;
    searchInput = new FormControl('', null);
    requestReports = { records: <any>[], recordHeaders: <any>[], recordsSource: <any>[] };
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
        private balanceService: BalanceService,
        private datePipe: DatePipe,
        private ngxSpinner: NgxSpinnerService
    ) {}

    ngOnInit() {
        this.reportsSource = this.reports = [];
        const {userName} = JSON.parse(sessionStorage.getItem('dashboardData')).userInfo;
        this.userName = userName;

        this.minimumDate.setMonth(this.today.getMonth() - 9);
        
        this.balanceRequestReportForm = new FormGroup({
            dateRange: new FormControl(this.today, Validators.required),
            dateRange1: new FormControl(this.today, Validators.required),  
        });

        this.subscribeDateRange();
        this.subscribeDateRange1();
    }

    subscribeDateRange() {
        this.balanceRequestReportForm.get('dateRange').valueChanges
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
          this.balanceRequestReportForm.get('dateRange1').setValue(this.somedate1);
          // console.log(this.somedate1);
    
        }
        else {
          this.somedate1 = this.today;
          this.balanceRequestReportForm.get('dateRange1').setValue(this.today);
        }
    
      }
      subscribeDateRange1() {// Double datepicker added by Akash
        this.balanceRequestReportForm.get('dateRange1').valueChanges
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

    fetchBalanceRequestReports() {
      this.ngxSpinner.show('fetchRequestReportsSpinner', { bdColor: "rgba(0, 0, 0, 0.5)", type: "timer" });
        if (this.balanceRequestReportForm.valid) {

            const { dateRange, dateRange1 } = this.balanceRequestReportForm.value;
            const balanceRequestData = {
                "$1": "balance_request_report",
                "$2": this.userName,
                "$4": this.datePipe.transform(dateRange, 'yyyy-MM-dd'),
                "$5": this.datePipe.transform(dateRange1, 'yyyy-MM-dd'),
                "$6": [
                    "Cash Deposit",
                    "IMPS",
                    "NEFT",
                    "RTGS",
                    "IFT"
                ]
            };
            this.balanceService.fetchBalanceRequests(balanceRequestData)
            .pipe(finalize(() => {
                this.ngxSpinner.hide('fetchRequestReportsSpinner');
                this.fetchingReport = false;
            }))
            .subscribe(
                (res: any) => {
                    console.log('Balance Request Reports Response: ', res);

                    this.requestReports.recordsSource = this.requestReports.records = res.Report;
                    if (res.Report) {
                        this.reportsSource = this.reports = res.Report;
                        if(res.Report.length==0){
                            vex.dialog.alert('No Records Found.')
                        }
                        this.requestReports.recordHeaders = Object.keys(res.Report[0])
                        .filter(col => !['remarks', 'receiptLink'].includes(col))
                        .map((col) => {
                            switch(col) {
                                case 'Id':
                                    return { prop: col };
    
                                case 'approvalTime':
                                case 'depositDateTime':
                                case 'requestDateTime':
                                    return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.dateTemplate, minWidth: 170 };
    
                                case 'status':
                                    return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.statusTemplate };
    
                                default:
                                    return { name: col.replace(/([A-Z])/g, ' $1') };
                            }
                        });
                        this.requestReports.recordHeaders.push({ name: 'Actions', cellTemplate: this.actionTemplate});
                    } else {
                        vex.dialog.alert('No Records Found.')
                    }
                },
                (err: any) => {
                    vex.dialog.alert('Balance Request Reports Error: ', err);
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
        if (this.requestReports.recordsSource.length) {
          // filter our data
          if (val && this.requestReports.recordsSource.length) {
    
            const temp = this.requestReports.recordsSource.filter(d => {
    
              const vals = Object.values(d);
              return new RegExp(val, 'gi').test(vals.toString());
              // return vals.includes(val);
    
            });
            // update the rows
            this.requestReports.records = temp;
          } else {
            this.requestReports.records = this.requestReports.recordsSource;
          }  
        } else {
          vex.dialog.alert('No data to perform search.');
          this.searchInput.reset();
        }
        
    }

    downloadReceipt(receiptLink: string) {
        if (receiptLink) {
            window.open(receiptLink, '_blank');
        } else {
            vex.dialog.alert('Receipt has not been uploaded.')
        }
    }

    showRemarks(remarks: string) {
        console.log('Remarks: ', remarks);
        // console.log('Remarks: ', remarks.split('},'));

        const remarkdata = JSON.parse(`[${remarks}]`);
        console.log('Remarks: ', remarkdata);
        let remarkparsedata = remarkdata.reverse().map(rmk => 
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
            });

    }

    downloadExcel() {
        this.balanceService.generateExcel([...this.requestReports.records]);
    }

    ngOnDestroy() {
        this.unsub.next(true);
        this.unsub.complete();
    }
}