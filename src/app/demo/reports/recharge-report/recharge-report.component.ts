import { Component, OnInit, Output, EventEmitter, OnDestroy, Input } from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { StorageService } from "src/app/storage.service";
import * as moment from 'moment';
@Component({
  selector: 'app-recharge-report',
  templateUrl: './recharge-report.component.html',
  styleUrls: ['./recharge-report.component.scss']
})
export class RechargeReportComponent implements OnInit, OnDestroy  {
  reportForm: FormGroup;
  today = new Date();
  somedate1 = new Date();
  somedate= new Date();
    minimumDate1= new Date();
    newdate: any;
  minimumDate = new Date();
  @Input() fetchingReport: boolean;
  @Output() recharge2Data = new EventEmitter();
  unsubscribeSubs = new Subject();

  constructor(private datePipe: DatePipe, private storageService: StorageService) { }

  ngOnInit() {
    this.minimumDate.setMonth(this.today.getMonth() - 2);

    this.reportForm = new FormGroup({
      subCat: new FormControl('ALL', null),
      dateRange: new FormControl(this.today, Validators.required),
      dateRange1: new FormControl(this.today, Validators.required)
    });

    this.subscribeDateRange();
    this.subscribeDateRange1();
  }

  subscribeDateRange() {
    this.reportForm.get('dateRange').valueChanges
    .pipe(takeUntil(this.unsubscribeSubs))
    .subscribe(
      val => {
        const start = val;
          
        const startDate = new Date(start);
        this.newdate = val;
 }
    );
  }
  subscribeDateRange1() {
    this.reportForm.get('dateRange1').valueChanges
    .pipe(takeUntil(this.unsubscribeSubs))
    .subscribe(
      val => {
        const end = val;
        const endDate = new Date(end);
       }
    );
}
  saverange(res){ // Double datepicker added by Akash
    this.minimumDate1= res;    
    // this.somedate.setDate(this.minimumDate1.getDate()+10);
    // var date1 = new Date (this.somedate);
    // console.log(date1);
    var nextWeek = moment(new Date(this.minimumDate1)).add(9, 'days');
    let addedDate = nextWeek.format('YYYY-MM-DD')
    // var now = moment();
    // const  modifiedDate = now.format('YYYY-MM-DD')
    if((moment().isAfter(nextWeek))){
      // console.log('modifiedDate' ,addedDate);
      // Inject it into the initial moment object
      this.somedate.setDate( new Date(addedDate).getDate());
      this.somedate1 = new Date(addedDate)
      // console.log(this.somedate1);
      
    }
    else{
      this.somedate1=this.today;
    }
    
  }
  submitReport() {
    console.log(this.reportForm.value)
    let reportData = {};
    const { dateRange,dateRange1, subCat } = this.reportForm.value;
    const {userInfo: {userName}} = JSON.parse(sessionStorage.getItem('dashboardData'));
    const categories = {
      Recharge_Prepaid: [
        "Prepaid_Airtel","Prepaid_Bsnl","Prepaid_Idea","Prepaid_Vodafone","Prepaid_VodafoneIdea",
    "Prepaid_RelianceJio","Prepaid_TataIndicom","Prepaid_TataDocomo","Prepaid_Aircel","Prepaid_Telenor",
    "Prepaid_VirginGsm","Prepaid_Virgincdma","Prepaid_Mts","Prepaid_Mtnl"
      ],
      Recharge_Postpaid: [
        "Postpaid_Airtel","Postpaid_Bsnl",
    "Postpaid_Idea","Postpaid_Vodafone","Postpaid_VodafoneIdea","Postpaid_RelianceJio","Postpaid_TataIndicom",
    "Postpaid_TataDocomo","Postpaid_Aircel","Postpaid_Telenor","Postpaid_VirginGsm","Postpaid_Virgincdma",
    "Postpaid_Mts","Postpaid_Mtnl"
      ],
      Recharge_DTH: [
        "DTH_AirtelDth","DTH_BigTvDth","DTH_DishTvDth","DTH_TataSkyDth",
    "DTH_VideoconDth","DTH_SunTvDth","DTH_JioDth"
      ]
    }
    




    const selCats = ["Prepaid_Airtel","Prepaid_Bsnl","Prepaid_Idea","Prepaid_Vodafone","Prepaid_VodafoneIdea",
    "Prepaid_RelianceJio","Prepaid_TataIndicom","Prepaid_TataDocomo","Prepaid_Aircel","Prepaid_Telenor",
    "Prepaid_VirginGsm","Prepaid_Virgincdma","Prepaid_Mts","Prepaid_Mtnl","Postpaid_Airtel","Postpaid_Bsnl",
    "Postpaid_Idea","Postpaid_Vodafone","Postpaid_VodafoneIdea","Postpaid_RelianceJio","Postpaid_TataIndicom",
    "Postpaid_TataDocomo","Postpaid_Aircel","Postpaid_Telenor","Postpaid_VirginGsm","Postpaid_Virgincdma",
    "Postpaid_Mts","Postpaid_Mtnl","DTH_AirtelDth","DTH_BigTvDth","DTH_DishTvDth","DTH_TataSkyDth",
    "DTH_VideoconDth","DTH_SunTvDth","DTH_JioDth"].filter(cat => {
      // if (subCat === 'ALL') { return true; }
      return cat === subCat;
    });
 
 





    reportData = {
      // "$1": "new_dmt_report",
      // "$2": userName,
      // "$3": selCats,
      // "$4": this.datePipe.transform(dateRange[0], 'yyyy-MM-dd'),
      // "$5": this.datePipe.transform(dateRange[1], 'yyyy-MM-dd'),
      // "$6": ["DMT"],
      // "$7": ["IMPS_FUND_TRANSFER", "NEFT_FUND_TRANSFER", "BENE_VERIFICATION"]

        "$1": "all_transaction_report",
        "$2": userName,
        "$3": "All",
        "$4": this.datePipe.transform(dateRange, 'yyyy-MM-dd'),
        "$5": this.datePipe.transform(dateRange1, 'yyyy-MM-dd'),
        "$6": [
            "Recharge"
        ],
        "$7": categories[subCat] ? categories[subCat] : Object.values(categories).reduce((prev, curr) => [...prev, ...curr])
    //  "$7": ["Recharge_Prepaid","Recharge_Postpaid","Recharge_DTH" ]
    };
    console.log(reportData)
    this.recharge2Data.emit({type: 'recharge2', data: reportData});
    // this.dmt2Data.emit({type: 'dmt2', data: {reportData, retry: subCat === "RETRY" ? true : false, refund: subCat === "REFUNDPENDING" ? true : false }});
  }

  ngOnDestroy() {
    this.unsubscribeSubs.next(true);
    this.unsubscribeSubs.complete();
  }
}