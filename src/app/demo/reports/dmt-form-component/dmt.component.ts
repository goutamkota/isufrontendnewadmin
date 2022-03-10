import { DatePipe } from "@angular/common";
import { Component, OnInit, Output, EventEmitter, OnDestroy } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: 'app-dmt-trans-report',
  templateUrl: './dmt.component.html',
  styleUrls: ['./dmt.component.scss']
})
export class DmtTransComponent implements OnInit, OnDestroy {
  reportForm: FormGroup;
  today = new Date();
  minimumDate = new Date();
  @Output() dmtData = new EventEmitter();
  unsubscribeSubs = new Subject();

  constructor(
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    // Setting Minimum Date of the Calendar to be 2 months back from Today.
    this.minimumDate.setMonth(this.today.getMonth() - 2);

    this.reportForm = new FormGroup({
      subCat: new FormControl('all', null),
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
        (diffDays >= 10) ? this.reportForm.get('dateRange').setErrors({incorrect: true}) :  this.reportForm.get('dateRange').setErrors(null);
      }
    );
  }

  submitReport() {
    let reportData = {};
    const { dateRange } = this.reportForm.value;
    switch(this.reportForm.get('subCat').value) {
      case 'all':
        reportData = {
          fromDate: this.datePipe.transform(dateRange[0], 'yyyy-MM-dd'),
          toDate: this.datePipe.transform(dateRange[1], 'yyyy-MM-dd'),
          transactionType: 'ISU_FT'
        };
        break;

      case 'success':
        reportData = {
          fromDate: this.datePipe.transform(dateRange[0], 'yyyy-MM-dd'),
          toDate: this.datePipe.transform(dateRange[1], 'yyyy-MM-dd'),
          transactionType: 'ISU_FT'
        };
        break;

      case 'refund':
        const {userInfo: {userName}} = JSON.parse(sessionStorage.getItem('dashboardData'));
        reportData = {
          start_date: this.datePipe.transform(dateRange[0], 'yyyy-MM-dd'),
          end_date: this.datePipe.transform(dateRange[1], 'yyyy-MM-dd'),
          userName
        };
        break;

      default:
        break;
    }

    this.dmtData.emit({type: 'dmt', data: reportData});
  }

  ngOnDestroy() {
    this.unsubscribeSubs.next(true);
    this.unsubscribeSubs.complete();
  }
}
