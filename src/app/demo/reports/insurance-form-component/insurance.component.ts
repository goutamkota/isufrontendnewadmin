import { DatePipe } from "@angular/common";
import { Component, EventEmitter, Output, OnInit, OnDestroy } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: 'app-ins-trans-report',
  templateUrl: './insurance.component.html',
  styleUrls: ['./insurance.component.scss']
})
export class InsuranceTransComponent implements OnInit, OnDestroy {
  reportForm: FormGroup;
  today = new Date();
  minimumDate = new Date();
  @Output() insuranceData = new EventEmitter();
  unsubscribeSubs = new Subject();

  constructor(
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    // Setting Minimum Date of the Calendar to be 2 months back from Today.
    this.minimumDate.setMonth(this.today.getMonth() - 2);

    this.reportForm = new FormGroup({
      subCat: new FormControl('insurance', null),
      dateRange: new FormControl([this.today, this.today], Validators.required)
    });

    this.subscribeDateRange();
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
    // Insurance form submit function added by Akshaya

    // Formatting Data To Be Submitted
    let reportData = {};
    const { dateRange } = this.reportForm.value;
    const {userInfo: {userName}} = JSON.parse(sessionStorage.getItem('dashboardData'));
    reportData = {
      end_date: this.datePipe.transform(dateRange[1], 'yyyy-MM-dd'),
      start_date: this.datePipe.transform(dateRange[0], 'yyyy-MM-dd'),
      transactionType: 'INSURANCE',
      userName
    };
    this.insuranceData.emit({type: 'insurance', data: reportData});
  }

  ngOnDestroy() {
    this.unsubscribeSubs.next(true);
    this.unsubscribeSubs.complete();
  }
}
