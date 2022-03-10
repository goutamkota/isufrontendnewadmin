import { DatePipe } from "@angular/common";
import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: 'app-bbps-trans-report',
  templateUrl: './bbps.component.html',
  styleUrls: ['./bbps.component.scss']
})
export class BbpsTransComponent implements OnInit, OnDestroy {
  reportForm: FormGroup;
  today = new Date();
  minimumDate = new Date();
  @Output() bbpsData = new EventEmitter();
  unsubscribeSubs = new Subject();

  constructor(
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    // Setting Minimum Date of the Calendar to be 2 months back from Today.
    this.minimumDate.setMonth(this.today.getMonth() - 2);

    this.reportForm = new FormGroup({
      subCat: new FormControl('bbps', null),
      operationPerformed: new FormControl('', Validators.required),
      status: new FormControl('', Validators.required),
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
    const allOptions = [];
    document.querySelector('.selectCol .form-control').querySelectorAll('option').forEach((element) => {
      allOptions.push(element.value);
    });

    // Formatting Data To Be Submitted
    let reportData = {};
    const { dateRange, operationPerformed, status } = this.reportForm.value;
    const {userInfo: {userName}} = JSON.parse(sessionStorage.getItem('dashboardData'));
    reportData = {
      end_date: this.datePipe.transform(dateRange[1], 'yyyy-MM-dd'),
      start_date: this.datePipe.transform(dateRange[0], 'yyyy-MM-dd'),
      operationPerformed: operationPerformed === 'all' ? allOptions.slice(2) : [operationPerformed],
      userName,
      status: status === 'All' ? status : [status],
      transaction_type: ["BBPS"]
    };

    this.bbpsData.emit({type: 'bbps', data: reportData});
  }

  ngOnDestroy() {
    this.unsubscribeSubs.next(true);
    this.unsubscribeSubs.complete();
  }
}