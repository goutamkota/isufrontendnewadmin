import { DatePipe } from "@angular/common";
import { Component, EventEmitter, OnDestroy, OnInit, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: 'app-matm-trans-report',
  templateUrl: './matm.component.html',
  styleUrls: ['./matm.component.scss']
})
export class MatmTransComponent implements OnInit, OnDestroy {
  reportForm: FormGroup;
  today = new Date();
  minimumDate = new Date();
  @Output() matmData = new EventEmitter();
  unsubscribeSubs = new Subject();

  constructor(
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    // Setting Minimum Date of the Calendar to be 2 months back from Today.
    this.minimumDate.setMonth(this.today.getMonth() - 2);

    this.reportForm = new FormGroup({
      subCat: new FormControl('matm', null),
      operationPerformed: new FormControl('', null),
      status: new FormControl('', null),
      dateRange: new FormControl([this.today, this.today], Validators.required)
    });

    this.subscribeSubCat();
    this.subscribeDateRange();

  }

  subscribeSubCat() {
    this.reportForm.get('subCat').valueChanges
    .pipe(takeUntil(this.unsubscribeSubs))
    .subscribe(
      val => {
        if (val === 'matm') {
          this.reportForm.get('operationPerformed').setValidators(null);
          this.reportForm.get('status').setValidators(null);
          this.reportForm.get('operationPerformed').updateValueAndValidity();
          this.reportForm.get('status').updateValueAndValidity();
        } else {
          this.reportForm.get('operationPerformed').setValidators(Validators.required);
          this.reportForm.get('status').setValidators(Validators.required);
          this.reportForm.updateValueAndValidity();
        }
      }
    );
  }

  subscribeDateRange() {
    this.reportForm.get('dateRange').valueChanges
    .pipe(takeUntil(this.unsubscribeSubs))
    .subscribe(
      val => {
        const [start, end] = val;
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffDays = Math.ceil((<any>endDate - <any>startDate) / (1000 * 60 * 60 * 24));
        (diffDays >= 10) ? this.reportForm.get('dateRange').setErrors({ incorrect: true }) : this.reportForm.get('dateRange').setErrors(null);
      }
    );
  }

  submitReport() { 

    // Formatting Data To Be Submitted
    let reportData = {};
    if (this.reportForm.get('subCat').value === 'matm') {
        const { dateRange } = this.reportForm.value;
        reportData = {
            fromDate: this.datePipe.transform(dateRange[0], 'yyyy-MM-dd'),
            toDate: this.datePipe.transform(dateRange[1], 'yyyy-MM-dd'),
            transactionType: 'IATM_SETTLED'
        };
    } else {
        const { dateRange, operationPerformed, status } = this.reportForm.value;
        const {userInfo: {userName}} = JSON.parse(sessionStorage.getItem('dashboardData'));
        reportData = {
            endDate: this.datePipe.transform(dateRange[1], 'yyyy-MM-dd'),
            startDate: this.datePipe.transform(dateRange[0], 'yyyy-MM-dd'),
            operationPerformed: operationPerformed === 'ALL' ? ["MATM2_BALANCE_ENQUIRY", "MATM2_CASH_WITHDRAWAL"] : [operationPerformed],
            userName,
            status
        };
    }


    this.matmData.emit({type: 'matm', data: reportData});
  }

  ngOnDestroy() {
    this.unsubscribeSubs.next(true);
    this.unsubscribeSubs.complete();
  }
}
