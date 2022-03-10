import { DatePipe } from "@angular/common";
import { Component, EventEmitter, Output, OnInit, OnDestroy } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import * as moment from 'moment';

@Component({
  selector: 'app-cashout-trans-report',
  templateUrl: './cashout.component.html',
  styleUrls: ['./cashout.component.scss']
})
export class CashoutTransComponent implements OnInit, OnDestroy {
  reportForm: FormGroup;
  today = new Date();
  minimumDate = new Date();
  minimumDate1 = new Date();
  somedate = new Date();
  somedate1 = new Date();
  newdate: any;
  @Output() cashoutData = new EventEmitter();
  unsubscribeSubs = new Subject();
 
  constructor(
    private datePipe: DatePipe
  ) { }

  ngOnInit() {

    // const username = localStorage.getItem(JSON.parse(userInfo.userName));
    // Setting Minimum Date of the Calendar to be 2 months back from Today.
    this.minimumDate.setMonth(this.today.getMonth() - 2);

    this.reportForm = new FormGroup({
      subCat: new FormControl('aeps', null),
      operationPerformed: new FormControl('WALLET2CASHOUT', null),
      dateRange: new FormControl(this.today, Validators.required),
      dateRange1: new FormControl(this.today, Validators.required),
    });

    this.subscribeSubCat();
    this.subscribeDateRange();
    this.subscribeDateRange1();
  }

  subscribeSubCat() {
    this.reportForm.get('subCat').valueChanges
      .pipe(takeUntil(this.unsubscribeSubs))
      .subscribe(
        val => {
          if (val === 'wallet2') {
            this.reportForm.get('operationPerformed').setValidators(Validators.required);
            this.reportForm.updateValueAndValidity();
          } else {
            this.reportForm.get('operationPerformed').setValidators(null);
            this.reportForm.get('operationPerformed').updateValueAndValidity();
          }
        }
      );
  }

  subscribeDateRange() { // Double datepicker added by Akash
    this.reportForm.get('dateRange').valueChanges
      .pipe(takeUntil(this.unsubscribeSubs))
      .subscribe(
        val => {
          const start = val;
          // this.minimumDate1.setMonth(val.getMonth()-1);
          const startDate = new Date(start);
          this.newdate = val;
          // const endDate = new Date(end);
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
  subscribeDateRange1() { // Double datepicker added by Akash
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

  submitReport() {
    // Cashout form submit function added by Akshaya
    let reportData = {};
    if (this.reportForm.get('subCat').value === 'aeps') {
      const { dateRange, dateRange1 } = this.reportForm.value;
      reportData = {
        fromDate: this.datePipe.transform(dateRange, 'yyyy-MM-dd'),
        toDate: this.datePipe.transform(dateRange1, 'yyyy-MM-dd'),
        transactionType: 'WALLETCASHOUT',
        subcatVal: this.reportForm.get('subCat').value
      };
    } else if (this.reportForm.get('subCat').value === 'matm') {
      const { dateRange, dateRange1, operationPerformed, status } = this.reportForm.value;
      reportData = {
        fromDate: this.datePipe.transform(dateRange, 'yyyy-MM-dd'),
        toDate: this.datePipe.transform(dateRange1, 'yyyy-MM-dd'),
        transactionType: 'MATM_CASHOUT',
        subcatVal: this.reportForm.get('subCat').value
      };
    } else {
      const { dateRange, dateRange1, operationPerformed, status } = this.reportForm.value;
      const { userInfo: { userName } } = JSON.parse(sessionStorage.getItem('dashboardData'));
      reportData = {
        end_date: this.datePipe.transform(dateRange1, 'yyyy-MM-dd'),
        start_date: this.datePipe.transform(dateRange, 'yyyy-MM-dd'),
        operationPerformed: [operationPerformed],
        isApi: true,
        userName,
        subcatVal: this.reportForm.get('subCat').value
      };
    }
    this.cashoutData.emit({ type: 'cashout', data: reportData });
  }

  ngOnDestroy() {
    this.unsubscribeSubs.next(true);
    this.unsubscribeSubs.complete();
  }
}
