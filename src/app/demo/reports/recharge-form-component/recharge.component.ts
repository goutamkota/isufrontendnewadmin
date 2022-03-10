import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-recharge-trans-report',
    templateUrl: './recharge.component.html',
    styleUrls: ['./recharge.component.scss']
})
export class RechargeTransComponent implements OnInit {

    reportForm: FormGroup;
    today = new Date();
    minimumDate = new Date();
    @Output() rechargeData = new EventEmitter();
    unsubscribeSubs = new Subject();

    constructor(
        private datePipe: DatePipe
    ) {}

    ngOnInit() {
        // Setting Minimum Date of the Calendar to be 2 months back from Today.
        this.minimumDate.setMonth(this.today.getMonth() - 2);

        this.reportForm = new FormGroup({
            subCat: new FormControl('recharge', null),
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
            if (val === 'recharge') {
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
            (diffDays >= 10) ? this.reportForm.get('dateRange').setErrors({incorrect: true}) :  this.reportForm.get('dateRange').setErrors(null);
          }
        );
      }

    submitReport() {

        // Formatting Data To Be Submitted
        let reportData = {};
        if (this.reportForm.get('subCat').value === 'recharge') {
            const { dateRange } = this.reportForm.value;
            reportData = {
                fromDate: this.datePipe.transform(dateRange[0], 'yyyy-MM-dd'),
                toDate: this.datePipe.transform(dateRange[1], 'yyyy-MM-dd'),
                transactionType: 'RECHARGE'
            };
        } else {
            const { dateRange, operationPerformed, status } = this.reportForm.value;
            const {userInfo: {userName}} = JSON.parse(sessionStorage.getItem('dashboardData'));
            reportData = {
                end_date: this.datePipe.transform(dateRange[1], 'yyyy-MM-dd'),
                start_date: this.datePipe.transform(dateRange[0], 'yyyy-MM-dd'),
                operationPerformed: [operationPerformed],
                transaction_type: ['Recharge'],
                userName,
                status
            };
        }


        this.rechargeData.emit({type: 'recharge', data: reportData});
    }
}