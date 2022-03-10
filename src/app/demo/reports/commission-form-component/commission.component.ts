import { DatePipe } from "@angular/common";
import { Component, EventEmitter, Output, OnInit, OnDestroy, Input } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import * as moment from 'moment';
@Component({
  selector: 'app-comm-trans-report',
  templateUrl: './commission.component.html',
  styleUrls: ['./commission.component.scss']
})
export class CommissionTransComponent implements OnInit, OnDestroy {
  reportForm: FormGroup;
  today = new Date();
  minimumDate = new Date();
  minimumDate1 = new Date();
  somedate = new Date();
  somedate1 = new Date();
  @Input() fetchingReport: boolean;
  @Output() commissionData = new EventEmitter();
  unsubscribeSubs = new Subject();
  userName = '';
  newdate: any;
  constructor(private datePipe: DatePipe) { }

  ngOnInit() {
    const { userInfo: { userName } } = JSON.parse(sessionStorage.getItem('dashboardData'));
    this.userName = userName;
    // Setting Minimum Date of the Calendar to be 2 months back from Today.
    this.minimumDate.setMonth(this.today.getMonth() - 2);

    this.reportForm = new FormGroup({
      subCat: new FormControl('new_comm', null),
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
    // Cashout form submit function added by Akshaya
    let reportData = {};
    const { dateRange, dateRange1 } = this.reportForm.value;
    switch (this.reportForm.get('subCat').value) {
      case 'comm1':
        reportData = {
          fromDate: this.datePipe.transform(dateRange, 'yyyy-MM-dd'),
          toDate: this.datePipe.transform(dateRange1, 'yyyy-MM-dd'),
          transactionType: 'COMMISSION'
        };
        break;

      case 'comm2':
        reportData = {
          endDate: this.datePipe.transform(dateRange, 'yyyy-MM-dd'),
          startDate: this.datePipe.transform(dateRange1, 'yyyy-MM-dd'),
          userName: this.userName
        };
        break;

      case 'new_comm':
        reportData = {
          "$1": "new_commission",
          "$2": this.userName,
          "$4": this.datePipe.transform(dateRange, 'yyyy-MM-dd'),
          "$5": this.datePipe.transform(dateRange1, 'yyyy-MM-dd'),
          "$7": [
            "commission"
          ]
        }
        break;

      default:
        break;
    }



    // if(this.reportForm.get('subCat').value === 'comm1') {
    //   const { dateRange } = this.reportForm.value;
    //   reportData = {
    //     fromDate: this.datePipe.transform(dateRange[0], 'yyyy-MM-dd'),
    //     toDate: this.datePipe.transform(dateRange[1], 'yyyy-MM-dd'),
    //     transactionType: 'COMMISSION'
    //   };
    // } else {
    //   const { dateRange } = this.reportForm.value;
    //   const {userInfo: {userName}} = JSON.parse(sessionStorage.getItem('dashboardData'));
    //   reportData = {
    //     endDate: this.datePipe.transform(dateRange[1], 'yyyy-MM-dd'),
    //     startDate: this.datePipe.transform(dateRange[0], 'yyyy-MM-dd'),
    //     userName
    //   };
    // }
    this.commissionData.emit({ type: 'commission', data: reportData, comType: this.reportForm.get('subCat').value });
  }

  ngOnDestroy() {
    this.unsubscribeSubs.next(true);
    this.unsubscribeSubs.complete();
  }

}
