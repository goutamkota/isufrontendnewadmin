import { DatePipe } from "@angular/common";
import { Component, OnInit, Output, EventEmitter, OnDestroy, Input } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { StorageService } from "src/app/storage.service";
import * as moment from 'moment';
import { ChangeDetectorRef, AfterContentChecked } from '@angular/core';

@Component({
  selector: 'app-dmt2-form',
  templateUrl: './dmt2-form.component.html',
  styleUrls: ['./dmt2-form.component.scss']
})
export class Dmt2FormComponent implements OnInit, OnDestroy {
  reportForm: FormGroup;
  today = new Date();
  minimumDate = new Date();
  minimumDate1 = new Date();
  somedate = new Date();
  somedate1 = new Date();
  advancesearchdata: any;
  advancesearchflag: any;
  // maximumdate= new Date();
  // newdate1: any;
  @Input() fetchingReport: boolean;
  @Output() dmt2Data = new EventEmitter();
  unsubscribeSubs = new Subject();
  newdate: any;
  adv_search: boolean = false;
  searchByMob: boolean = false;
  MOBILE: boolean = false;
  TXN: boolean = false;
  sval: string = "txnid";
  constructor(private datePipe: DatePipe, private storageService: StorageService, private cdref: ChangeDetectorRef) { }

  ngOnInit() {
    this.reportForm = new FormGroup({
      dmtReport: new FormControl('DMT REPORT', null),
      subCat: new FormControl('ALL', null),
      subCat1: new FormControl('DMTG', null),
      dateRange: new FormControl(this.today, Validators.required),
      dateRange1: new FormControl(this.today, Validators.required),
      searchBy: new FormControl('', null),
      txnID: new FormControl('', null),
      mobile: new FormControl('', null),
      RRN:  new FormControl('', null),
      accno: new FormControl('', [Validators.minLength(9), Validators.maxLength(18), Validators.pattern(/^[0-9]+$/)])
    });
    this.minimumDate.setMonth(this.today.getMonth() - 2);

    this.subscribeDateRange();
    this.subscribeDateRange1();
  }


  // advancesearch() {
  //   this.adv_search = !this.adv_search;
  //   this.somedate1 = this.today;
  //   this.timingfunction();
  // }
  // timingfunction(){
  //   if(this.adv_search){
  //     this.timeflag=false;
  //     this.nextWeek = moment(new Date(this.minimumDate1)).add(29, 'days')
  //     console.log("hello");
      
  //  }
  //  else{
  //    this.timeflag=true;
  //     this.nextWeek = moment(new Date(this.minimumDate1)).add(9, 'days');
  //     console.log(this.nextWeek);
  //     console.log("hiii fail");
      
  //  }
  // }
  // limitDate = () => {
  //   this.dt = new Date();
  //   this.maxYr = (this.dt.getFullYear());
  //   this.mnth = this.dt.getMonth()+1;
  //   if (this.mnth < 10) {
  //     this.mnth = "0" + this.mnth;
  //   }
  //   this.currDt = this.dt.getDate();
  //   if (this.currDt < 10) {
  //     this.currDt = "0" + this.currDt;
  //   }
  //   this.maxDt = this.maxYr + '-' + this.mnth + '-' + this.currDt;
  //   // document.getElementById("date-picker").setAttribute("max", this.maxDt);
  // }
  // limitDate1 = () => {
  //   this.dt = new Date();
  //   this.maxYr = (this.dt.getFullYear());
  //   this.mnth = this.dt.getMonth()+1;
  //   if (this.mnth < 10) {
  //     this.mnth = "0" + this.mnth;
  //   }
  //   this.currDt = this.dt.getDate();
  //   if (this.currDt < 10) {
  //     this.currDt = "0" + this.currDt;
  //   }
  //   this.maxDt = this.maxYr + '-' + this.mnth + '-' + this.currDt;
  //   // document.getElementById("date-picker").setAttribute("min", this.maxDt);
  // }

  subscribeDateRange() { // Double datepicker added by Akash
    this.reportForm.get('dateRange').valueChanges
      .pipe(takeUntil(this.unsubscribeSubs))
      .subscribe(
        val => {
          const start = val;
          const startDate = new Date(start);
          this.newdate = val;
          // const endDate = new Date(end);
          // const diffDays = Math.ceil((<any>startDate) / (1000 * 60 * 60 * 24)); 
          // (diffDays >= 10) ? this.reportForm.get('dateRange').setErrors({incorrect: true}) :  this.reportForm.get('dateRange').setErrors(null);
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
      this.reportForm.get('dateRange1').setValue(this.somedate1);

    }
    else {
      this.somedate1 = this.today;
      this.reportForm.get('dateRange1').setValue(this.today);
    }

  }
  subscribeDateRange1() {// Double datepicker added by Akash
    this.reportForm.get('dateRange1').valueChanges
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
  submitReport() {
    var advsearch = false;
    // console.log(this.reportForm.value);
    if (this.reportForm.value.txnID !== "") {
      this.advancesearchdata = this.reportForm.value.txnID;
      advsearch = true;
      this.advancesearchflag = 'txnID';
    }
    else if (this.reportForm.value.accno !== "") {
      this.advancesearchdata = this.reportForm.value.accno;
      advsearch = true;
      this.advancesearchflag = 'accno';
    }
    else if (this.reportForm.value.mobile !== "") {
      this.advancesearchdata = this.reportForm.value.mobile;
      advsearch = true;
      this.advancesearchflag = 'mobile';
    }
    else if (this.reportForm.value.RRN !== "") {
      this.advancesearchdata = this.reportForm.value.RRN;
      advsearch = true;
      this.advancesearchflag = 'RRN';
    }
    // console.log(this.advancesearchdata);
    this.reportForm.value.mobile = "";
    this.reportForm.value.accno = "";
    this.reportForm.value.txnID = "";
    this.reportForm.value.RRN = "";
    // console.log(this.reportForm.value);
    let reporttype = this.reportForm.get('subCat1').value;
    let reportData = {};
    let reportDataG = {};
    let reportDataGA = {};
    let reportDataGtxn = {};
    const { dateRange, dateRange1, subCat } = this.reportForm.value;
    const { userInfo: { userName } } = JSON.parse(sessionStorage.getItem('dashboardData'));
    const selCats = ["INITIATED", "RETRY", "INPROGRESS", "SUCCESS", "FAILED", "REFUNDED", "REFUNDPENDING"].filter(cat => {
      if (subCat === 'ALL') { return true; }
      return cat === subCat;
    });
    // const selCats1 = ["SUCCESS", "FAILED", "INITIATED"].filter(cat => {
    //   if (subCat === 'ALL') { return true; }
    //   return cat === subCat;
    // });
    reportData = {
      "$1": "new_dmt_report",
      "$2": userName,
      "$3": selCats,
      "$4": this.datePipe.transform(dateRange, 'yyyy-MM-dd'),
      "$5": this.datePipe.transform(dateRange1, 'yyyy-MM-dd'),
      "$6": ["DMT"],
      "$7": ["IMPS_FUND_TRANSFER", "NEFT_FUND_TRANSFER", "BENE_VERIFICATION"]
    };

    reportDataG = {
      "$1": "New_Dmt_v2_web",
      "$2": userName,
      "$3": selCats,
      "$4": this.datePipe.transform(dateRange, 'yyyy-MM-dd'),
      "$5": this.datePipe.transform(dateRange1, 'yyyy-MM-dd'),
      "$6": ["DMT"],
      "$7": ["IMPS_FUND_TRANSFER", "NEFT_FUND_TRANSFER", "BENE_VERIFICATION"]
    }
    if (this.advancesearchflag == "mobile") {
      reportDataGA = {
        "$10": [
          this.advancesearchdata
        ],

        "$1": "New_Dmt_v3",
        "$2": userName,
        "$3": selCats,
        "$4": this.datePipe.transform(dateRange, 'yyyy-MM-dd'),
        "$5": this.datePipe.transform(dateRange1, 'yyyy-MM-dd'),
        "$6": ["DMT"],
        "$7": ["IMPS_FUND_TRANSFER", "NEFT_FUND_TRANSFER", "BENE_VERIFICATION"]
      }

    }
    else if (this.advancesearchflag == "txnID") {
      var accnobody = parseInt(this.advancesearchdata.replace("#", ""))
      reportDataGA = {
        "$11": [
          accnobody
        ],

        "$1": "New_Dmt_v3",
        "$2": userName,
        "$3": selCats,
        "$4": this.datePipe.transform(dateRange, 'yyyy-MM-dd'),
        "$5": this.datePipe.transform(dateRange1, 'yyyy-MM-dd'),
        "$6": ["DMT"],
        "$7": ["IMPS_FUND_TRANSFER", "NEFT_FUND_TRANSFER", "BENE_VERIFICATION"]
      }

    }
    else if (this.advancesearchflag == "accno") {
      reportDataGA = {
        "$12": [
          this.advancesearchdata
        ],

        "$1": "New_Dmt_v3",
        "$2": userName,
        "$3": selCats,
        "$4": this.datePipe.transform(dateRange, 'yyyy-MM-dd'),
        "$5": this.datePipe.transform(dateRange1, 'yyyy-MM-dd'),
        "$6": ["DMT"],
        "$7": ["IMPS_FUND_TRANSFER", "NEFT_FUND_TRANSFER", "BENE_VERIFICATION"]
      }

    }
    else if (this.advancesearchflag == "RRN") {
      reportDataGA = {
        "$13": [
          this.advancesearchdata
        ],

        "$1": "New_Dmt_v3",
        "$2": userName,
        "$3": selCats,
        "$4": this.datePipe.transform(dateRange, 'yyyy-MM-dd'),
        "$5": this.datePipe.transform(dateRange1, 'yyyy-MM-dd'),
        "$6": ["DMT"],
        "$7": ["IMPS_FUND_TRANSFER", "NEFT_FUND_TRANSFER", "BENE_VERIFICATION"]
      }

    }
    let type = '';
    switch (subCat) {
      case 'RETRY':
        type = 'retry';
        break;

      case 'REFUNDPENDING':
        type = 'refund';
        break;

    }

    this.dmt2Data.emit({ type: 'dmt2', data: { reportData, type, reporttype, reportDataG, reportDataGA, advsearch } });
    this.advancesearchdata = "";

    this.reportForm.patchValue({
      searchBy: '',
      txnID: '',
      mobile: '',
      accno: '',
      RRN:''


    });
    // this.dmt2Data.emit({type: 'dmt2', data: {reportData, retry: subCat === "RETRY" ? true : false, refund: subCat === "REFUNDPENDING" ? true : false }});
  }

  ngOnDestroy() {
    this.unsubscribeSubs.next(true);
    this.unsubscribeSubs.complete();
  }
  searchByVal(v) {
    this.sval = v;
  }

}
