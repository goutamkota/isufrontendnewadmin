import { DatePipe } from "@angular/common";
import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { AppService } from "src/app/app.service";
import * as vex from 'vex-js';
import { BalanceService } from "../balance.service";
import * as moment from 'moment';
import { animate, style, transition, trigger } from "@angular/animations";
import * as Notiflix from "notiflix"
import { DatatableComponent } from "@swimlane/ngx-datatable";

@Component({
    selector: 'app-balance-request',
    templateUrl: './balance-requests.component.html',
    styleUrls: ['./balance-requests.component.scss'],
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
export class BalanceRequestsComponent implements OnInit, OnDestroy,AfterViewInit {
    userName: string;
    unsub = new Subject();
    today = new Date();
    today1 = new Date();
    todaydt
    minimumDate = new Date();
    minimumDate1 = new Date();
    somedate = new Date();
    somedate1 = new Date();
    newdate: any;
    fetchingReport = false;
    unsubscribeSubs = new Subject();
    balanceRequestForm: FormGroup;
    requests = { records: <any>[], recordHeaders: <any>[], recordsSource: <any>[] };
    searchInput = new FormControl('', null);
    commentControl = { comment: new FormControl('', [Validators.required]), otherComment: new FormControl('', [Validators.required]), comments: <any>[], statusData: undefined };
    @ViewChild('dateTemplate', { static: false }) dateTemplate: TemplateRef<any>;
    @ViewChild('statusTemplate', { static: false }) statusTemplate: TemplateRef<any>;
    @ViewChild('actionTemplate', { static: false }) actionTemplate: TemplateRef<any>;
    @ViewChild('commentModal', { static: false }) private commentPopup: any;
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
        private ngxSpinner: NgxSpinnerService,
        private appService: AppService
    ) { }

    ngOnInit() {
        const { userName } = JSON.parse(sessionStorage.getItem('dashboardData')).userInfo;
        this.userName = userName;

        this.minimumDate.setMonth(this.today.getMonth() - 9);
        this.todaydt = this.datePipe.transform(this.today, 'yyyy-MM-dd');
        // console.log(this.todaydt)

        this.today1.setDate(this.today.getDate()-7)

        this.balanceRequestForm = new FormGroup({
            dateRange: new FormControl(this.today1, Validators.required),
            dateRange1: new FormControl(this.today, Validators.required), 
        });

        this.subscribeDateRange();
        this.subscribeDateRange1();
        // this.dash()
    }
    ngAfterViewInit(){
        this.fetchBalanceRequests()
        // throw new Error("Method not implemented.");
    }
    // dash() {
    //     const balanceRequestData = {
    //         "$1": "balance_request",
    //         "$2": this.userName,
    //         "$4": this.datePipe.transform(this.today1, 'yyyy-MM-dd'),
    //         "$5": this.todaydt,
    //         "$6": [
    //             "Cash Deposit",
    //             "IMPS",
    //             "NEFT",
    //             "RTGS",
    //             "IFT"
    //         ]
    //     };
    //     this.ngxSpinner.show('fetchRequestsSpinner', { bdColor: "rgba(0, 0, 0, 0.5)", type: "timer" });
    //     this.balanceService.fetchBalanceRequests(balanceRequestData)
    //         .pipe(finalize(() => {
    //             this.ngxSpinner.hide('fetchRequestsSpinner');
    //         }))
    //         .subscribe(
    //             (res: any) => {
    //                 console.log('Balance Requests Response: ', res);

    //                 if (res.Report.length) {
    //                     this.requests.recordsSource = this.requests.records = res.Report;
    //                     this.requests.recordHeaders = Object.keys(res.Report[0])
    //                         .filter(col => !['remarks', 'receiptLink'].includes(col))
    //                         .map((col) => {
    //                             switch (col) {
    //                                 case 'Id':
    //                                     return { prop: col };

    //                                 case 'approvalTime':
    //                                 case 'depositDateTime':
    //                                 case 'requestDateTime':
    //                                     return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.dateTemplate, minWidth: 170 };

    //                                 case 'status':
    //                                     return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.statusTemplate };

    //                                 default:
    //                                     return { name: col.replace(/([A-Z])/g, ' $1') };
    //                             }
    //                         });
    //                     this.requests.recordHeaders.push({ name: 'Actions', cellTemplate: this.actionTemplate, minWidth: 200 });
    //                 } else {
    //                     vex.dialog.alert('No Records Found.')
    //                 }
    //             },
    //             (err: any) => {
    //                 console.log('Balance Requests Error: ', err);
    //             }
    //         );



    // }

    subscribeDateRange() {
        this.balanceRequestForm.get('dateRange').valueChanges
            .pipe(takeUntil(this.unsub))
            .subscribe(
                val => {
                    // const [start, end] = val;
                    // const startDate = new Date(start);
                    // const endDate = new Date(end);
                    // const diffDays = Math.ceil((<any>endDate - <any>startDate) / (1000 * 60 * 60 * 24));
                    // (diffDays > 10) ? this.balanceRequestForm.get('dateRange').setErrors({ incorrect: true }) : this.balanceRequestForm.get('dateRange').setErrors(null);
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
          this.balanceRequestForm.get('dateRange1').setValue(this.somedate1);
          // console.log(this.somedate1);
    
        }
        else {
          this.somedate1 = this.today;
          this.balanceRequestForm.get('dateRange1').setValue(this.today);
        }
    
      }
      subscribeDateRange1() {// Double datepicker added by Akash
        this.balanceRequestForm.get('dateRange1').valueChanges
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
    fetchBalanceRequests() {

        if (this.balanceRequestForm.valid) {

            const { dateRange, dateRange1 } = this.balanceRequestForm.value;
            const balanceRequestData = {
                "$1": "balance_request",
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
            this.ngxSpinner.show('fetchRequestsSpinner', { bdColor: "rgba(0, 0, 0, 0.5)", type: "timer" });
            this.balanceService.fetchBalanceRequests(balanceRequestData)
                .pipe(finalize(() => {
                    this.ngxSpinner.hide('fetchRequestsSpinner');
                }))
                .subscribe(
                    (res: any) => {
                        console.log('Balance Requests Response: ', res);

                        if (res.Report.length) {
                            this.requests.recordsSource = this.requests.records = res.Report;
                            if(res.Report.length==0){
                                vex.dialog.alert('No Records Found.')
                            }
                            this.requests.recordHeaders = Object.keys(res.Report[0])
                                .filter(col => !['remarks', 'receiptLink'].includes(col))
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
                            this.requests.recordHeaders.push({ name: 'Actions', cellTemplate: this.actionTemplate, minWidth: 200 });
                        } else {
                            vex.dialog.alert('No Records Found.')
                        }
                    },
                    (err: any) => {
                        vex.dialog.alert('Balance Requests Error: ', err);
                    }
                );

        } else {
            vex.dialog.alert('Please, provide valid details.')
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
        const rmrkData = `[${remarks}]`;
        const remarkdata = JSON.parse(rmrkData);
        console.log(remarkdata);
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

    formatUpdateBalanceStatus(balanceData: { request: any, status: string }) {

        console.log('Balance Data for Status: ', balanceData);

        const statusData = {
            "loginUser": this.userName,
            "transaction_id": balanceData.request.Id,
            "action": balanceData.status
        };

        console.log('Status Data: ', statusData);

        if (balanceData.status == 'REJECTED') {
            this.commentControl.comments = [
                'DUPLICATE  REQUEST / AMOUNT ALREADY APPROVED',
                'AMOUNT NOT RECEIVED / TIME LIMIT EXCEED',
                'WRONG TID / DEPOSIT PLACE GIVEN',
                'WRONG DATE GIVEN',
                'WRONG AMOUNT GIVEN',
                'WRONG BANK NAME  GIVEN',
                'WRONG TRANSFER TYPE',
                'INVALID  REQUEST',
                'ANY OTHER'
            ];
        }

        if (balanceData.status == 'ONHOLD') {
            this.commentControl.comments = [
                'DUPLICATE  REQUEST / AMOUNT ALREADY APPROVED',
                'AMOUNT NOT RECEIVED / TIME LIMIT EXCEED',
                'WRONG TID / DEPOSIT PLACE GIVEN',
                'WRONG DATE GIVEN',
                'WRONG AMOUNT GIVEN',
                'WRONG BANK NAME  GIVEN',
                'WRONG TRANSFER TYPE',
                'INVALID  REQUEST',
                'ANY OTHER'
            ];
        }

        if (balanceData.status !== 'APPROVED') {
            this.commentControl.comment.setValue(''); // Reset Control before opening.
            this.commentPopup.show();

            this.commentControl.statusData = statusData;
        } else {
            this.updateBalanceRequestStatus(statusData);
        }
    }

    handleUnapprovedStatus() {
        const isCommentValid = (this.commentControl.comment.value === 'ANY OTHER') ? this.commentControl.comment.valid && this.commentControl.otherComment.valid : this.commentControl.comment.valid;

        if (isCommentValid) {

            this.commentControl.statusData['remarks'] = this.commentControl.comment.value === 'ANY OTHER' ? this.commentControl.otherComment.value : this.commentControl.comment.value;
            this.updateBalanceRequestStatus(this.commentControl.statusData);

        } else {
            vex.dialog.alert('Please provide a comment.')
        }
    }

    updateBalanceRequestStatus(statusData: any) {

        this.ngxSpinner.show('updateRequestSpinner', { bdColor: "rgba(0, 0, 0, 0.5)", type: "timer" });
        this.balanceService.updateRequestStatus(statusData)
            .pipe(finalize(() => {
                this.ngxSpinner.hide('updateRequestSpinner');
                this.commentPopup.hide();
            }))
            .subscribe(
                (res: any) => {
                    console.log('Request Status Updation Response: ', res);
                    vex.dialog.alert(res.message);

                    this.fetchBalanceRequests();
                    if (statusData.action === 'APPROVED') this.appService.fetchWalletBalance();
                },
                (err: any) => {
                    console.log('Request Status Updation Error: ', err);

                    if (err.status == 400) {
                        vex.dialog.alert(err.error.message);
                    } else {
                        vex.dialog.alert('Server Error.')
                    }
                }
            );

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
        if (this.requests.recordsSource.length) {
            // filter our data
            if (val && this.requests.recordsSource.length) {

                const temp = this.requests.recordsSource.filter(d => {

                    const vals = Object.values(d);
                    return new RegExp(val, 'gi').test(vals.toString());
                    // return vals.includes(val);

                });
                // update the rows
                this.requests.records = temp;
            } else {
                this.requests.records = this.requests.recordsSource;
            }
        } else {
            vex.dialog.alert('No data to perform search.');
            this.searchInput.reset();
        }

    }

    downloadExcel() {
        this.balanceService.generateExcel([...this.requests.records]);
    }

    ngOnDestroy() {
        this.unsub.next(true);
        this.unsub.complete();
    }
}