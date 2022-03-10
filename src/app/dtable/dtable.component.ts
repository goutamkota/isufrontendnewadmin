import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import alasql from 'alasql';
import * as XLSX from 'xlsx';
// import { ReportsService } from "../reports.service";
import { DatatableService } from '../datatable.service';
import * as vex from 'vex-js';
import { NgxSpinnerService } from "ngx-spinner";
import { MemberService } from '../demo/member/member.service';
import { DatePipe, formatDate } from '@angular/common';

@Component({
  selector: 'dtable',
  templateUrl: './dtable.component.html',
  styleUrls: ['./dtable.component.scss']
})
export class DtableComponent implements OnInit {
  @Input() tdata: string;
  @Input() strMinify: any;
  @Input() tblOptions: any;
  @Input() columns: any;
  @Input() apiDataCount: any;
  @Input() actionButtons: any;
  @Input() priActiveTab: any;
  @Input() show_name: any;
  @Input() show_utype: any;
  @Input() show_status: any;
  @Input() show_name1: any;
  @Input() show_utype1: any;
  @Input() show_status1: any;
  @Input() show_unamesearch: any;
  @Input() searchreporttype: any;

  tcol: string[];
  titles = [];
  currentPageLimit: number;
  tbl: any;
  
  tdataStr:any;
  // show_name:any;
  filteredTbl: any = [];
  expand: number;
  // colorObj = JSON.parse(localStorage.getItem("theme"));
  colorObj: any;
  showExpanded = -1;
  pageLimitOptions = [10, 25, 50];
  paging = {
    limit: 10,
    active: 1,
    cnt: 1,
    data: []
  };
  fc = { "start": 1, "cnt": 3 };
  mc = { "cnt": 0, start: 1 };
  lc = { "cnt": 2, start: 1 };
  dots = "....";
  visibleCols: number = parseInt(localStorage.getItem('columnCount')) || 8;
  dateIndex = [];
  totalRecLen: number;
  totalAmount: any = 0.00;
  // searchInput = new FormControl('', null);
  // require: any;
  @Output() apiPaging = new EventEmitter();
  @Output() commonActions = new EventEmitter();
  @Output() dEBITModal = new EventEmitter();
  @Output() EditModal = new EventEmitter();
  @Output() userStatusChange = new EventEmitter();
  tableData: any;
  getUnderUser: any;
  searching: boolean;
  userDetails: any;
  logiName: any;
  show_un: any;
  show_ut: any;
  show_ua: any;
  fname: void;
  // datePipe: any;

 constructor(
    // private reportService: ReportsService
    private service: DatatableService,
    private ngxSpinner: NgxSpinnerService,
    private memberservice: MemberService,
    private datepipe: DatePipe
  ) { }

  ngOnInit() {
    // console.log("check",this.tdata);
    // this.priActiveTab =1;

    //  console.log(this.show_name,"it works...");



    this.colorObj = this.tblOptions.colors;
    if (!this.colorObj) {
      this.colorObj = { vibrant: '#4680ff', darkvibrant: '#4680ff' };
    }


    if (this.tblOptions.pageLimitOptions) { this.pageLimitOptions = this.tblOptions.pageLimitOptions }
    this.paging.limit = (this.tblOptions.defaultLimit) ? this.tblOptions.defaultLimit : this.pageLimitOptions[0];

    let obj = JSON.parse(this.tdata);
    if (obj.length > 0) {
      let minifyCols = this.strMinify.col;
      for (let m = 0; m < minifyCols.length; m++) {
        let sm = minifyCols[m];
        for (let o = 0; o < obj.length; o++) {
          if (obj[o][sm] && obj[o][sm].length > 20) {
            obj[o][sm] = `${obj[o][sm].substr(0, 18)}...`;
          }
        }
      }
      this.tbl = this.filteredTbl = obj;
      this.tblOptions.showText = (this.tblOptions.customText) ? this.tblOptions.customText : 'Total Records: ' + (this.apiDataCount > 0 ? this.apiDataCount : obj.length);
      this.calcAmount();
      this.tcol = (this.columns) ? this.columns : Object.keys(obj[0]);

      for (let i = 0; i < this.tcol.length; i++) {
        let text = this.tcol[i];
        let result = text.replace(/([A-Z])/g, " $1");
        let finalResult = result.charAt(0).toUpperCase() + result.slice(1);
        (this.titles).push(finalResult);

        let dateTitle = result.toLowerCase();
        if (dateTitle.endsWith('date')) {
          this.dateIndex.push(text);
        }

        if (window.innerWidth > 1279) {
          this.visibleCols = parseInt(localStorage.getItem('columnCount')) || 8;
        }
        // else if(window.innerWidth > 767){
        //   this.visibleCols = 4;
        // }else{
        //   this.visibleCols = 2;
        // }
      }
      let unique = this.titles.filter((v, i, a) => a.indexOf(v) === i);
      this.titles = unique;
      // console.log("titles", this.titles);


      // Pagination
      let start = (this.paging.active - 1) * this.paging.limit;
      if (this.apiDataCount > 0) {
        this.paging.cnt = Math.ceil(this.apiDataCount / this.paging.limit);
        this.paging.data = this.filteredTbl;
      } else {
        this.paging.cnt = Math.ceil(this.filteredTbl.length / this.paging.limit);
        this.paging.data = [];
        for (let k = 0; k < this.paging.limit; k++) {
          if (this.filteredTbl[start + k]) {
            this.paging.data.push(this.filteredTbl[start + k]);
          }
        }
      }
      // console.log("count",this.paging.cnt);


      if (this.paging.cnt > 8) {
        this.fc.cnt = 3;
        this.mc.cnt = 0;
        this.lc.cnt = 2;
        this.dots = "....";
        if (this.paging.active > 3) {
          this.mc.start = this.paging.active - 1;
        }
      } else {
        this.dots = "";
        this.fc.cnt = this.paging.cnt;
        this.mc.cnt = 0;
        this.lc.cnt = 0;
      }
      //this.changeLimit(this.paging.limit);
    } else {
      alert("No Data Found !!");
    }
    // this.commonActions.emit({start:start, limit:this.paging.limit});
  }

  ngOnChanges() {
    this.ngOnInit();
    //this.changeLimit(this.paging.limit);
    this.showExpanded = -1;
  }

  onResize(event) {
    let iw = event.target.innerWidth;
    if (iw > 1000) {
      this.visibleCols = parseInt(localStorage.getItem('columnCount')) || 8;
    }
    // else if(iw > 767){
    //   this.visibleCols = 4;
    // }else{
    //   this.visibleCols = 2;
    // }
  }

  calcAmount() {
    this.totalRecLen = this.filteredTbl.length;
    this.totalAmount = 0;
    for (let l = 0; l < this.totalRecLen; l++) {
      if (this.filteredTbl[l].amount) {
        this.totalAmount += parseFloat(this.filteredTbl[l].amount);
      }
    }
  }

  changeLimit(n: number) {
    this.paging.limit = n;
    this.paging.active = 1;
    let start = 0;
    if (this.apiDataCount > 0) {
      this.apiPaging.emit({ start: start, limit: this.paging.limit });
      this.paging.cnt = Math.ceil(this.apiDataCount / this.paging.limit);
      this.paging.data = this.filteredTbl;
    } else {
      this.paging.cnt = Math.ceil(this.filteredTbl.length / this.paging.limit);
      this.paging.data = [];
      for (let k = 0; k < this.paging.limit; k++) {
        if (this.filteredTbl[start + k]) {
          this.paging.data.push(this.filteredTbl[start + k]);
        }
      }
    }
  }

  changeColLimit(n: any) {
    // console.log("ttl cnt",this.titles.length);

    if (n > 0 && n <= this.titles.length) {
      this.visibleCols = n;
      localStorage.setItem('columnCount', n);
      // console.log(localStorage.getItem('columnCount'));
    }
  }

  counter(i: number) {
    return new Array(i);
  }

  pageActive(n: number) {
    // console.log(n, "number");

    if (this.apiDataCount > 0) {
      this.paging.cnt = Math.ceil(this.apiDataCount / this.paging.limit);
      this.paging.active = n;
      let start = (this.paging.active - 1) * this.paging.limit;
      this.apiPaging.emit({ start: start, limit: this.paging.limit });
    }
    else
      if (this.paging.cnt > n) {
        this.paging.active = n;
        let start = (this.paging.active - 1) * this.paging.limit;
        this.paging.data = [];
        for (let k = 1; k < this.paging.limit; k++) {
          if (this.filteredTbl[start + k]) {
            this.paging.data.push(this.filteredTbl[start + k]);
          }
        }
      }


    // else{
    //   this.paging.active = 1;
    //   this.paging.data=this.filteredTbl;

    // }

  }

  updateFilter(event: any) {
    const val = event.target.value;
    if (this.tbl.length) {
      const temp = this.tbl.filter(d => {
        const vals = Object.values(d);
        return new RegExp(val, 'gi').test(vals.toString());
      });
      console.log(temp);
      this.filteredTbl = temp;
      this.paging.data = this.filteredTbl;
    }
    console.log(this.paging.limit);
    // this.changeLimit(this.paging.limit);
    // this.calcAmount();
  }

  downloadExcel() {

    let excelName = this.tblOptions.excel ? this.tblOptions.excel : 'report';
    for (let i = 0; i < this.filteredTbl.length; i++) {
      this.filteredTbl[i].createdDate = this.datepipe.transform(this.filteredTbl[i].createdDate, 'yyyy-MM-dd');
    }
    // console.log(this.filteredTbl);



    // var XLSX = require('xlsx');
    // alasql.setXLSX(XLSX);
    alasql['utils'].isBrowserify = false;
    alasql['utils'].global.XLSX = XLSX;

    var opts = [{ sheeitd: "Sheet 1", header: true }]


    alasql("SELECT INTO XLSX ('" + excelName + ".xlsx',?) FROM ?", [opts, [this.filteredTbl]]);


    //This piece of code will download excel sheet with two sheets  

    // alasql("SELECT TOP 2 Name as [Student Name], Mark as [Subject Marks] INTO XLSX ('Marks.xlsx',{headers:true}) FROM ?", [DataForSheet2]);  
    //This piece of code will download excel sheet with one sheet, and if you notice here we could change the column name also.


  }

  sendAllData(val) {
    //console.log(val);
    if (val == 1) {
      this.searching = true;
      let user = JSON.parse(sessionStorage.getItem('dashboardData'));
      let loginName = user.userInfo.userName;
      this.show_status = (this.show_status === '0') ? 'true' : 'false';

      let body = {

        "userName": user.userInfo.userName,
        "userType": [this.show_utype],
        "active": this.show_status,
        "parentUsername": this.show_name,
        "operation": "showuserParent",
        "loginName": loginName

      }
      //  console.log(body);


      this.service.showUserData1(body).subscribe(res => {
        this.searching = false;
        //  console.log(res)
        this.tableData = res['message'];
        vex.dialog.alert(res['message']);
      })

    }

    else
      if (val == 2) {
        this.searching = true;
        let user = JSON.parse(sessionStorage.getItem('dashboardData'));
        let loginName = user.userInfo.userName;
        this.show_status1 = (this.show_status1 === '0') ? 'true' : 'false';

        let body = {

          "userName": user.userInfo.userName,
          "userType": this.show_utype1,
          "active": this.show_status1,
          "operation": "showuser",
          "loginName": loginName

        }
        this.service.showUserData2(body).subscribe(res => {
          this.searching = false;
          // console.log(res)
          this.tableData = res['message'];
          vex.dialog.alert(res['message']);
        })

      }
      else
        if (val == 3) {
          this.searching = true;
          let user = JSON.parse(sessionStorage.getItem('dashboardData'));
          let loginName = user.userInfo.userName;
          let body = {

            "userName": this.show_unamesearch,
            "loginName": loginName,
            "operation": "userdetails"

          }
          this.service.showUserData3(body).subscribe(res => {
          this.searching = false;

            //  console.log(res)
            this.tableData = res['message'];
            vex.dialog.alert(res['message']);
          })
        }
        else
          if (val == 4) {
            this.searching = true;
            let user = JSON.parse(sessionStorage.getItem('dashboardData'));
            let loginName = user.userInfo.userName;
            let today = formatDate(new Date(), 'yyyy-MM-dd', 'en');
            let endToday: any = new Date(new Date().getTime() + (24 * 60 * 60 * 1000));
            endToday = formatDate(endToday, 'yyyy-MM-dd', 'en');
            let weektime = new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000));
            let weekday = formatDate(weektime, 'yyyy-MM-dd', 'en');
            let cm = (new Date().getMonth()) + 1;
            let cy = new Date().getFullYear();
            let mtime = new Date(cm + '/01/' + cy);
            let mday = formatDate(mtime, 'yyyy-MM-dd', 'en');

            let body;
            if (this.searchreporttype == 'today') {
              body = { "startDate": today, "endDate": endToday, "userName": user.userInfo.userName, "loginName": loginName, "operation": "resentOnBoardUser" }
            } else if (this.searchreporttype == 'weekly') {
              body = { "startDate": weekday, "endDate": today, "userName": user.userInfo.userName, "loginName": loginName, "operation": "resentOnBoardUser" }
            } else if (this.searchreporttype == 'monthly') {
              body = { "startDate": mday, "endDate": today, "userName": user.userInfo.userName, "loginName": loginName, "operation": "resentOnBoardUser" }
            }

            this.service.showUserData4(body).subscribe(res => {
              this.searching = false;
              // console.log(res)
              this.tableData = res['message'];
              vex.dialog.alert(res['message']);
            })
          }

  }

  payModal(row: any) {
    this.commonActions.emit(row);
  }
  debitModal(row: any) {
    this.dEBITModal.emit(row);
  }
  editModal(row: any) {
    this.EditModal.emit(row);
  }

  userActive(ev, tr) {
    this.userStatusChange.emit({ ev: ev, tr: tr });
  }

}
