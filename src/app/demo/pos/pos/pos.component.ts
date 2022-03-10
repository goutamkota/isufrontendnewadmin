import { DatePipe } from "@angular/common";
import { Component, OnInit, Output, EventEmitter, OnDestroy, Input } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { StorageService } from "src/app/storage.service";
import * as moment from 'moment';
import { ChangeDetectorRef, AfterContentChecked } from '@angular/core';
import { posApi } from "../pos.api";
import { AuthConfig } from "src/app/app-config";

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.scss']
})
export class PosComponent implements OnInit {

  posForm: FormGroup;
  today = new Date();
  minimumDate = new Date();
  minimumDate1 = new Date();
  somedate = new Date();
  somedate1 = new Date();
  advancesearchdata: any;
  advancesearchflag: any;
  @Input() fetchingReport: boolean;
  @Output() posData = new EventEmitter();
  unsubscribeSubs = new Subject();
  newdate: any;
  adv_search: boolean = false;
  searchByMob: boolean = false;
  MOBILE: boolean = false;
  TXN: boolean = false;
  sval: string = "txnid";
  searchForm: any;
  ngxSpinner: any;
  checkTemplate: any;
  bankTemplate: any | any;
  report_amount: number;
  posService: any;
  search_bar: boolean;
  reportsSource: any;
  reports: any;
  posName: string;
  report_length: any;
  report_len: any;
  tableCols: ({ prop: "Id"; cellTemplate: any; name?: undefined; } | { prop: "param_a" | "param_b" | "param_c"; cellTemplate?: undefined; name?: undefined; } | { name: string; cellTemplate: any; prop?: undefined; } | { name: string; prop?: undefined; cellTemplate?: undefined; })[];
  idTemplate: any;
  dateTemplate: any | any;
  vex: any;
  // posData: any;
  constructor(private datePipe: DatePipe, private storageService: StorageService, private cdref: ChangeDetectorRef) { }

  ngOnInit() {
    this.posForm = new FormGroup({
      posReport: new FormControl('POS REPORT', null),
      subCat1: new FormControl('POS', null),
      dateRange: new FormControl(this.today, Validators.required),
      dateRange1: new FormControl(this.today, Validators.required),
    });
    this.minimumDate.setMonth(this.today.getMonth() - 2);

    this.subscribeDateRange();
    this.subscribeDateRange1();
  }


  subscribeDateRange() {
    this.posForm.get('dateRange').valueChanges
      .pipe(takeUntil(this.unsubscribeSubs))
      .subscribe(
        val => {
          const start = val;
          const startDate = new Date(start);
          this.newdate = val;
        }
      );
  }

  saverange(res) { // Double datepicker added by Akash
    this.minimumDate1 = res;
    var nextWeek = moment(new Date(this.minimumDate1)).add(9, 'days');
    let addedDate = nextWeek.format('YYYY-MM-DD')
    if ((moment().isAfter(nextWeek))) {
      this.somedate.setDate(new Date(addedDate).getDate());
      this.somedate1 = new Date(addedDate);
      this.posForm.get('dateRange1').setValue(this.somedate1);

    }
    else {
      this.somedate1 = this.today;
      this.posForm.get('dateRange1').setValue(this.today);
    }

  }
  subscribeDateRange1() {// Double datepicker added by Akash
    this.posForm.get('dateRange1').valueChanges
      .pipe(takeUntil(this.unsubscribeSubs))
      .subscribe(
        val => {
          const end = val;
          const endDate = new Date(end);
        }
      );
  }
  async submitPos() {

    this.ngxSpinner.show("refundSpinner", { bdColor: "rgba(0, 0, 0, 0.5)", type: "timer" });
    this.searchForm.reset();

    let reportData = {};

    const { dateRange, dateRange1 } = this.posForm.value;

    reportData = {
      "$1": "all_transaction_report",
      "$2": "demoisu",
      "$3": "All",
      "$4": this.datePipe.transform(dateRange, 'yyyy-MM-dd'),
      "$5": this.datePipe.transform(dateRange1, 'yyyy-MM-dd'),
      "$6": [
        "POS",
      ],
      "$7": [
        "Sale@POS"
      ]
    };
    const encurl = await AuthConfig.config.encodeUrl(posApi.url.posApiLink);

    this.report_amount = 0;


    // updateFilter(event: any) {
    //   const val = event.target.value;
    //   this.reports = this.reportsSource;
    //   var temp = this.reports.filter(d => {
    //     const vals = Object.values(d);
    //     return new RegExp(val, 'gi').test(vals.toString());
    //   });


    this.posService.posAPI(encurl, reportData)

      .pipe(finalize(() => { this.ngxSpinner.hide('refundSpinner'); }))

      .subscribe(
        (res: any) => {
          console.log(res);
          this.search_bar = true;
          // console.log(this.reports.length);
          this.reportsSource = res.results.BQReport;
          this.reports = res.results.BQReport;
          this.posName = 'POS';
          // this.aeps_name = 'aeps2';
          this.report_length = this.reports.length;
          this.report_len = this.reportsSource.length;
          // console.log(this.report_length);
          // console.log(this.report_len);
          if(this.reportsSource.length == 0){
            this.vex.dialog.alert("No Data Found!!");
        }
          for (let i = 0; i < this.reports.length; i++) {
            this.report_amount += this.reports[i].amountTransacted;
          }
          if (this.reports.length) {
            this.tableCols = Object.keys(this.reports[0]).map((col) => {
              switch (col) {
                case 'Id':
                  return { prop: col, cellTemplate: this.idTemplate };
                case 'param_a':
                case 'param_b':
                case 'param_c':
                  return { prop: col };
                case 'status':
                  return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.checkTemplate };
                case 'bankName':
                  return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.bankTemplate };
                case 'createdDate':
                case 'updatedDate':
                  return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.dateTemplate };
                default:
                  return { name: col.replace(/([A-Z])/g, ' $1') };
              }
            });
            // this.tableCols.push({ name: 'Actions', cellTemplate: this.actionTemplate });
          }
          else {
            // document.getElementById("myModal2").style.display = 'block';
            // this.no_data = true;
            // this.api_error = false;
          }
        },
        (err: any) => {
          console.log('Aeps API Error: ', err);
        }
      );
  }
  ngOnDestroy() {
    this.unsubscribeSubs.next(true);
    this.unsubscribeSubs.complete();
  }
}
  

