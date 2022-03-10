import { DatePipe } from "@angular/common";
import { Component, EventEmitter, Output, OnInit, OnDestroy } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import * as moment from 'moment';
@Component({
  selector: 'app-upi-trans-report',
  templateUrl: './upi.component.html',
  styleUrls: ['./upi.component.scss']
})
export class UpiTransComponent implements OnInit, OnDestroy {
  reportForm: FormGroup;
  today = new Date();
  minimumDate = new Date();
  minimumDate1 = new Date();
  somedate = new Date();
  somedate1 = new Date();
  newdate: any;
  todateformat = new Date();
  @Output() upiData = new EventEmitter();
  unsubscribeSubs = new Subject();

  constructor(
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    // Setting Minimum Date of the Calendar to be 2 months back from Today.
    this.minimumDate.setMonth(this.today.getMonth() - 2);

    this.reportForm = new FormGroup({
      subCat: new FormControl('upi', null),
      operationPerformed: new FormControl('all', Validators.required),
      status: new FormControl('All', Validators.required),
      dateRange: new FormControl(this.today, Validators.required),
      dateRange1: new FormControl(this.today, Validators.required),
    });

    this.subscribeDateRange();
    this.subscribeDateRange1();
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
    // UPI form submit function added by Akshaya
    let reportData = {};
    const { dateRange, operationPerformed, status, dateRange1 } = this.reportForm.value;
    const {userInfo: {userName}} = JSON.parse(sessionStorage.getItem('dashboardData'));
    var nextWeek1 = moment(new Date(dateRange1)).add(1, 'days');
    let addedDate1 = nextWeek1.format('YYYY-MM-DD')
      // this.todateformat.setDate(dateRange1.getDate() + 1);
      reportData = {
        start_date: this.datePipe.transform(dateRange, 'yyyy-MM-dd'),
        end_date: this.datePipe.transform(addedDate1, 'yyyy-MM-dd'),
        transaction_type: ['UPI'],
        operationPerformed: operationPerformed === 'all' ? ["QR_COLLECT", "UPI_COLLECT", "QR_STATIC"] : [operationPerformed],
        userName,
        status: status
      };
    this.upiData.emit({type: 'upi', data: reportData});
  }

  ngOnDestroy() {
    this.unsubscribeSubs.next(true);
    this.unsubscribeSubs.complete();
  }

}
