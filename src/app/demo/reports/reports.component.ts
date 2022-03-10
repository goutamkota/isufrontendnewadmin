import { CurrencyPipe, DatePipe } from "@angular/common";
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { finalize, takeUntil } from "rxjs/operators";
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import jwt_decode from 'jwt-decode';

import { ReportsService } from "./reports.service";
import * as vex from 'vex-js';
import { AuthConfig } from 'src/app/app-config';
import { ReportsApi } from './reports.api';
import { NgxSpinnerService } from "ngx-spinner";
// import { Socket2Service } from "src/app/socket2.service";
import { Subject } from "rxjs";
import { CountdownComponent } from "ngx-countdown";
import { AppService } from "src/app/app.service";
import { StorageMap } from "@ngx-pwa/local-storage";
import { animate, style, transition, trigger } from "@angular/animations";
import { AngularFirestore } from '@angular/fire/firestore';
import { AdminService } from "src/app/theme/layout/admin/admin.service";
import { ThrowStmt } from "@angular/compiler";
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  providers: [DatePipe, CurrencyPipe],
  animations: [
    trigger('fadeSlideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('500ms', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('500ms', style({ opacity: 0, transform: 'translateY(10px)' }))
      ])
    ]),
  ]
})
export class ReportsComponent implements OnInit, OnDestroy {

  expndall: any;
  reports = [];
  tableCols = [];
  selCols = [];
  persistentData: any;
  reportsSource = [];
  reportType: string;
  fetchingReport = false;
  transferErr = false;
  unsub = new Subject();
  transRecord = <any>{};
  otpForm: FormGroup;
  txnDetailReport = { reports: [] };
  userData: any;
  imageData = { url: '', brand: '' };
  demo: any;
  demo2: any;
  adminname: any;
  totalpagecount: any;
  totalamount = [];
  total: any;
  total_CR: any;
  total_DR: any;
  dmtreporttype: any;
  gatewaystatusname = "NA";
  storetxn: any;
  shopres: any;

  pageLimitOptions = [
    { value: 5 },
    { value: 10 },
    { value: 25 },
    { value: 50 },
    { value: 100 },
  ];
  currentPageLimit: number = 50;

  retryDataDMT2 = {
    transData: undefined,
    reportData: undefined,
    retryTxnID: undefined,
    retrying: false
  };
  refundDataDMT2 = {
    transData: undefined,
    reportData: undefined,
    showTimer: false,
    refundTxnID: undefined,
    otpMessage: '',
    otpStatus: undefined
  };
  searchInput = new FormControl('', null);
  selectiveCols = new FormControl(this.tableCols, null);
  userName: string = '';
  refundData = { refunds: <any>[], allRefunds: <any>[], showTimer: false, refundTxnID: '', otpMessage: '', otpStatus: undefined };
  @ViewChild('checkTemplate', { static: false }) checkTemplate: TemplateRef<any>;
  @ViewChild('idTemplate', { static: false }) idTemplate: TemplateRef<any>;
  @ViewChild('gatewayTemplate', { static: false }) gatewayTemplate: TemplateRef<any>;
  @ViewChild('statusDescTemplate', { static: false }) statusDescTemplate: TemplateRef<any>;
  @ViewChild('actionTemplate', { static: false }) actionTemplate: TemplateRef<any>;
  @ViewChild('dateTemplate', { static: false }) dateTemplate: TemplateRef<any>;
  @ViewChild('table', { static: false }) table: DatatableComponent;
  @ViewChild('modalDefault', { static: false }) private txnDetailsModal: any;
  @ViewChild('modalRetry', { static: false }) public retryModal: any;
  @ViewChild('modalSuccess', { static: false }) public transModal: any;
  @ViewChild('modalGateway', { static: false }) public gatewayModal: any;
  @ViewChild('refundList', { static: false }) public refundModal: any;
  @ViewChild('refundList1', { static: false }) public refundModal1: any;
  @ViewChild('refundOTP', { static: false }) public otpModal: any;
  @ViewChild('otpCd', { static: false }) private otpCountdown: CountdownComponent;

  socketData = {
    socket_timeout: false,

    amount: 1,
    bene_acc: "",
    bene_bank: "",
    bene_ifsc: "",
    bene_name: "",
    created_date: "",
    customer_mobile: "",
    customer_name: "",
    id: 820611392503824,
    operation_performed: "",
    rrn: [],
    shop_name: "",
    status: "",
    status_desc: "",
    trans_mode: "",
    update_date: "",
  };
  trxId: any;
  trxSlice: number;

  constructor(
    private reportService: ReportsService,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
    private route: ActivatedRoute,
    private ngxSpinner: NgxSpinnerService,
    // private socketService2: Socket2Service,
    private appService: AppService,
    private fireStore: AngularFirestore,
    private storage: StorageMap,
    private adminService: AdminService
  ) { (<any>pdfMake).vfs = pdfFonts.pdfMake.vfs; }

  ngOnInit() {
    this.route.data.subscribe(
      resolvedData => {
        this.reportType = resolvedData.reportType;
        this.reportsSource = this.reports = [];
        this.searchInput.reset();
        this.total = 0;
        this.totalpagecount = 0;
        this.total_CR = 0;
        this.total_DR = 0;
      }
    );

    // this.observeSocketConn();

    this.otpForm = new FormGroup({
      // digit1: new FormControl('', Validators.required),
      // digit2: new FormControl('', Validators.required),
      // digit3: new FormControl('', Validators.required),
      // digit4: new FormControl('', Validators.required),
      // digit5: new FormControl('', Validators.required),
      // digit6: new FormControl('', Validators.required),
      otpfield: new FormControl('', [Validators.required, , Validators.minLength(6), Validators.maxLength(6)])
    });

    const user: { sub: string } = jwt_decode(sessionStorage.getItem('CORE_SESSION'));
    this.userName = user.sub;
    this.userData = JSON.parse(sessionStorage.getItem('dashboardData'));
    this.imageData.brand = JSON.parse(this.userData.userInfo.userBrand).brand;
    this.getMaster();
    // console.log(this.userData);
    // console.log((["ROLE_RETAILER"].includes(this.userData.userInfo.userType)));


    // this.getWalletInterchange();
    // var aks=["akash", "smru", "kwaja" ,"soumya"]
    // const iterator1 = aks.entries()
    // for(let i =0 ; i<aks.length;i++){
    //   console.log(iterator1.next().value);
    // }


  }
  async getMaster() {
    let masterName = '';

    if (['ROLE_MASTER_DISTRIBUTOR', 'ROLE_ADMIN'].includes(this.userData.userInfo.userType)) {
      masterName = (this.userData.userType === 'ROLE_MASTER_DISTRIBUTOR') ? this.userData.userInfo.userName : '';
      this.getImage(masterName);
    } else {
      const encUrl = await AuthConfig.config.encodeUrl('https://itpl.iserveu.tech/findMasterDistributerName');
      this.adminService.getMasterName(encUrl, this.userData.userInfo.userName)
        .subscribe(
          (res: any) => {
            // console.log('Get Master Name Res: ', res); 
            this.getImage(res.masterDistributor);
            //   console.log(res.masterDistributor);

          },
          (err: any) => {
            // console.log('Get Master Name Error: ', err);
          }
        );
    }
  }

  // observeSocketConn() {
  //   // this.socketService2.socketConnected
  //     .pipe(takeUntil(this.unsub))
  //     .subscribe((socket: any) => {

  //       if ((socket.type !== 'INIT')) { // Don't listen to initial socket data.
  //         if (socket.status) {
  //           // console.log('Socket Connected Listened');

  //           // Make the retry, only when the socket gets connected.
  //           this.retryTrans(this.retryDataDMT2.retryTxnID);

  //           // if (this.transferErr) { // If transError, disconnect the socket.
  //           //   this.socketService2.disconnectSocket();
  //           // }

  //         } else {

  //           // console.log('Socket Disconnected Listened');

  //           // this.loader.general = false;
  //           this.transferErr = false; // Reset transError to allow socket connection again.

  //         }
  //       }

  //     });
  // }

  // connectSocket() {

  //   this.socketService2.setupSocket();

  //   const socketSub = this.socketService2.socketData
  //     .pipe(takeUntil(this.unsub))
  //     .subscribe((data: any) => {
  //       // console.log('Socket Data In DMT2 Report: ', data);
  //       if (data) {
  //         this.socketData = data;
  //         this.retryDataDMT2.retrying = false;

  //         // Fetch RRN Details
  //         this.getRRN(this.retryDataDMT2.transData.Id);
  //         // Fetch Shop Name
  //         this.getShopName();

  //         this.appService.fetchWalletBalance();

  //         this.fetchNotifications();

  //         this.reloadRetryTable();

  //         this.showTransModal(this.socketData.status); // Show the Socket Data in the Modal.
  //         this.socketService2.socketData.next(null); // Clear the socketData once received.

  //         socketSub.unsubscribe(); // Unsubscribe socketData to prevent multiple emissions.
  //         this.socketService2.disconnectSocket(); // Disconnect Socket

  //       }
  //     });
  // }

  getFormData(e: { type: string, data: any, wType?: any, comType?: any }) {
    this.fetchingReport = true;
    switch (e.type) {
      case 'recharge':
        this.fetchRechargeReport(e.data);
        break;

      case 'dmt':
        this.fetchDmtReport(e.data);
        break;

      case 'dmt2':
        this.fetchDmt2Report(e.data);
        break;

      case 'recharge2':
        this.fetchRechargeReport(e.data);
        break;

      case 'aeps':
        this.fetchAepsReport(e.data);
        break;

      case 'bbps':
        this.fetchBbpsReport(e.data);
        break;

      case 'matm':
        this.fetchMatmReport(e.data);
        break;

      case 'insurance':
        this.fetchInsuranceReport(e.data);
        break;

      case 'cashout':
        this.fetchCashoutReport(e.data);
        break;

      case 'commission':
        this.fetchCommissionReport(e.data, e.comType);
        break;

      case 'wallet':
        this.fetchWalletReport(e.data, e.wType);
        break;

      case 'upi':
        this.fetchUpiReport(e.data);
        break;

      case 'pos':
        this.fetchPosReport(e.data);
        break;

      default:
        break;
    }
  }
  async fetchPosReport(reportData: any) {
    const encURL = reportData.hasOwnProperty('fromDate') ? await AuthConfig.config.encodeUrl(ReportsApi.url.pos.txn_report) : await AuthConfig.config.encodeUrl(ReportsApi.url.pos.txn_report);
      this.reportService.transactionAPI(encURL, reportData)
      .pipe(finalize(() => { this.fetchingReport = false; }))
      .subscribe(
        (res: any) => {
          this.reportsSource = this.reports = reportData.hasOwnProperty('transactionType') ? res.BQReport : res.results.BQReport;
          if (this.reports.length) {
            this.tableCols = Object.keys(this.reports[0]).map((col) => {
              switch (col) {
                case 'Id':
                  return { prop: col };

                case 'status':
                  return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.checkTemplate };

                case 'createdDate':
                case 'updatedDate':
                  return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.dateTemplate };

                default:
                  return { name: col.replace(/([A-Z])/g, ' $1') };
              }

            });
            // this.tableCols.push({ name: 'Actions', cellTemplate: this.actionTemplate });
          } else {
            vex.dialog.alert('No Data Found!!');
          }
        },
        (err: any) => {
          // console.log('Error: ', err);
          this.reportsSource = this.reports = [];
        }
      );

  }

  async fetchRechargeReport(reportData: any) {

    const encURL = reportData.hasOwnProperty('fromDate') ? await AuthConfig.config.encodeUrl(ReportsApi.url.recharge2.all_trans) : await AuthConfig.config.encodeUrl(ReportsApi.url.recharge2.all_trans);

    this.reportService.transactionAPI(encURL, reportData)
      .pipe(finalize(() => { this.fetchingReport = false; }))
      .subscribe(
        (res: any) => {
          this.reportsSource = this.reports = reportData.hasOwnProperty('transactionType') ? res.BQReport : res.results.BQReport;
          if (this.reports.length) {
            this.tableCols = Object.keys(this.reports[0]).map((col) => {
              switch (col) {
                case 'Id':
                  return { prop: col };

                case 'status':
                  return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.checkTemplate };

                case 'createdDate':
                case 'updatedDate':
                  return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.dateTemplate };

                default:
                  return { name: col.replace(/([A-Z])/g, ' $1') };
              }

            });
            this.tableCols.push({ name: 'Actions', cellTemplate: this.actionTemplate });
          } else {
            vex.dialog.alert('No Data Found!!');
          }
        },
        (err: any) => {
          // console.log('Error: ', err);
          this.reportsSource = this.reports = [];
        }
      );

  }



  async fetchDmtReport(reportData: any) {

    const encURL = reportData.hasOwnProperty('fromDate') ? await AuthConfig.config.encodeUrl(ReportsApi.url.dmt.all_succ_trans) : await AuthConfig.config.encodeUrl(ReportsApi.url.dmt.refund_trans);

    this.reportService.transactionAPI(encURL, reportData)
      .pipe(finalize(() => { this.fetchingReport = false; }))
      .subscribe(
        (res: any) => {
          this.reportsSource = this.reports = res.BQReport;
          if (this.reports.length) {
            this.tableCols = Object.keys(this.reports[0]).map((col) => {
              switch (col) {
                case 'Id':
                  return { prop: col };

                case 'status':
                  return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.checkTemplate };

                case 'createdDate':
                case 'updatedDate':
                  return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.dateTemplate, minWidth: 170 };

                default:
                  return { name: col.replace(/([A-Z])/g, ' $1') };
              }

            });
            this.tableCols.push({ name: 'Actions', cellTemplate: this.actionTemplate });
          } else {
            vex.dialog.alert('No Data Found!!');
          }
        },
        (err: any) => {
          // console.log('Error: ', err);
          this.reportsSource = this.reports = [];
        }
      );

  }

  async fetchDmt2Report(dmt2Data: { reportData: any, type: string, reporttype: any, reportDataG: any, reportDataGA: any, advsearch: any }) {
    this.searchInput.reset();
    this.totalamount = [];
    // console.log(dmt2Data);
    this.dmtreporttype = dmt2Data.reporttype;
    this.refundDataDMT2.reportData = dmt2Data;
    if (dmt2Data.type === 'retry') { this.retryDataDMT2.reportData = dmt2Data; }
    if (dmt2Data.type === 'refund') { this.refundDataDMT2.reportData = dmt2Data; }
    // var akas = await AdmiNameComponent.adminname();
    // this.adminname = Object.keys(akas);
    // var reporthide = Object.values(akas);
    if (dmt2Data.reporttype == "DMT" && !dmt2Data.advsearch) {
      const encURL = ReportsApi.url.dmt2.all_trans;
      this.reportService.transactionAPI(encURL, dmt2Data.reportData)
        .pipe(finalize(() => { this.fetchingReport = false; }))
        .subscribe(
          (res: any) => {// restrict some data for demoisu retailer by Akash
            // for (let i = 0; i < this.adminname.length; i++) {
            // if ((["ROLE_RETAILER"].includes(this.userData.userInfo.userType)) && ([this.adminname[i]].includes(this.userData.userInfo.adminName))) {
            //   // console.log(reporthide[i]);
            //   // console.log(Object.keys(reporthide[i]))
            //   var key = Object.keys(reporthide[i]);
            //   var value = Object.values(reporthide[i]);
            //   for (let j = 0; j < key.length; j++) {
            //     if (["dmt"].includes(key[j])) {
            //       // console.log(value[j]);

            //       for (let k = 0; k < value[j].length; k++) {
            //         //  console.log(value[j][k]);
            //         this.reportsSource = this.reports = res.Report.map(el => {
            //           if (el.previousAmount && ["previousAmount"].includes(value[j][k])) { delete el.previousAmount; }
            //           if (el.balanceAmount && ["balanceAmount"].includes(value[j][k])) { delete el.balanceAmount; }
            //           if (el.transactionType && ["transactionType"].includes(value[j][k])) { delete el.transactionType; }
            //           if (el.userName && ["userName"].includes(value[j][k])) { delete el.userName; }
            //           if (el.masterName && ["masterName"].includes(value[j][k])) { delete el.masterName; }
            //           return el;
            //         });

            //         }
            //       }
            //     }


            //   // this.reportsSource = this.reports = res.Report;
            //   // console.log(reporthide[i]);
            //   // for(let j=0; j<reporthide[i].length;j++){
            //   //   // console.log(reporthide[i][j]);
            //   //   this.reportsSource = this.reports = res.Report.map(el => {
            //   //     if(el.previousAmount && ["previousAmount"].includes(reporthide[i][j])){delete el.previousAmount;}
            //   //     if(el.balanceAmount && ["balanceAmount"].includes(reporthide[i][j])){delete el.balanceAmount;}
            //   //     if(el.transactionType && ["transactionType"].includes(reporthide[i][j])){delete el.transactionType;}
            //   //     if(el.userName && ["userName"].includes(reporthide[i][j])){delete el.userName;}
            //   //     if(el.masterName && ["masterName"].includes(reporthide[i][j])){delete el.masterName;}
            //   //     return el;
            //   //   });

            //   // }             

            // }
            // else {
            this.reportsSource = this.reports = res.Report;
            // }

            // }

            // this.reportsSource = this.reports = res.Report;

            // this.reportsSource = this.reports = res.Report.map(el => {
            //   if(el.apiComment){delete el.apiComment;}
            //   return el;
            // });
            this.totalamount = [];
            this.totalpagecount = this.reportsSource.length;
            for (let i = 0; i < this.reportsSource.length; i++) {
              var amnt = parseFloat(this.reportsSource[i].amount)
              this.totalamount.push(amnt);
            }
            if (this.reportsSource.length > 0) {
              const reducer = (accumulator, currentValue) => accumulator + currentValue;
              this.total = this.totalamount.reduce(reducer).toFixed(2);
            }
            if (this.reports.length) {
              this.tableCols = Object.keys(this.reports[0]).map((col) => {
                switch (col) {
                  case 'Id':
                    return { prop: col, cellTemplate: this.idTemplate };

                  case 'status':
                    return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.checkTemplate };

                  case 'createdDate':
                  case 'updatedDate':
                    return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.dateTemplate, minWidth: 170 };

                  case 'param_a':
                  case 'param_b':
                  case 'param_c':
                    return { name: col.replace(/([A-Z])/g, ' $1'), prop: col };

                  case 'gateWayData':
                    return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.gatewayTemplate };

                  default:
                    return { name: col.replace(/([A-Z])/g, ' $1') };
                }
              });
              // this.tableCols.push({ name: 'Actions', cellTemplate: this.actionTemplate, cellClass: 'action-cell-class', prop: {retry: dmt2Data.retry, refund: dmt2Data.refund}});
              this.tableCols.push({ name: 'Actions', cellTemplate: this.actionTemplate, cellClass: 'action-cell-class', prop: `${dmt2Data.type}` });
              this.selCols = this.tableCols;

              this.persistentData = { formData: dmt2Data.reportData, type: 'dmt2' }; // Set report type for setting persistent data
              this.setUserColData(); // Automatically set selective data in the records as per persistent data.

            } else {
              vex.dialog.alert('No Records Found!!');
            }
          },
          (err: any) => {
            // console.log('Error: ', err);
            this.reportsSource = this.reports = [];
            vex.dialog.alert('Some error occured, while fetching records. Please, try again.');
          });

    }
    else if (dmt2Data.reporttype == "DMTG" && !dmt2Data.advsearch) {
      const encURL1 = ReportsApi.url.dmt2.gateway_trans;
      this.reportService.transactionAPI(encURL1, dmt2Data.reportDataG)
        .pipe(finalize(() => { this.fetchingReport = false; }))
        .subscribe(
          (res: any) => {// restrict some data for demoisu  by Akash
            // for (let i = 0; i < this.adminname.length; i++) {
            // if ((["ROLE_RETAILER"].includes(this.userData.userInfo.userType)) && ([this.adminname[i]].includes(this.userData.userInfo.adminName))) {
            //   var key = Object.keys(reporthide[i]);
            //   var value = Object.values(reporthide[i]);
            //   for (let j = 0; j < key.length; j++) {
            //     if (["dmt"].includes(key[j])) {
            //       //  console.log(value[j]);

            //       for (let k = 0; k < value[j].length; k++) {
            //         //  console.log(value[j][k]);
            //         this.reportsSource = this.reports = res.results.map(el => {
            //           if (el.previousAmount && ["previousAmount"].includes(value[j][k])) { delete el.previousAmount; }
            //           if (el.balanceAmount && ["balanceAmount"].includes(value[j][k])) { delete el.balanceAmount; }
            //           if (el.transactionType && ["transactionType"].includes(value[j][k])) { delete el.transactionType; }
            //           if (el.userName && ["userName"].includes(value[j][k])) { delete el.userName; }
            //           if (el.masterName && ["masterName"].includes(value[j][k])) { delete el.masterName; }
            //           if (el.transacted_bank_name) { delete el.transacted_bank_name; }
            //           if (el.transaction_status_code) { delete el.transaction_status_code; }
            //           // if(el.customerMobileNumber){delete el.customerMobileNumber;}
            //           if (el.transactionMode) { delete el.transactionMode; }
            //           return el;
            //         });
            //         // console.log(this.reportsSource);


            //         }
            //       }
            //     }


            //   // this.reportsSource = this.reports = res.Report;
            //   // console.log(reporthide[i]);
            //   // for(let j=0; j<reporthide[i].length;j++){
            //   //   // console.log(reporthide[i][j]);
            //   //   this.reportsSource = this.reports = res.Report.map(el => {
            //   //     if(el.previousAmount && ["previousAmount"].includes(reporthide[i][j])){delete el.previousAmount;}
            //   //     if(el.balanceAmount && ["balanceAmount"].includes(reporthide[i][j])){delete el.balanceAmount;}
            //   //     if(el.transactionType && ["transactionType"].includes(reporthide[i][j])){delete el.transactionType;}
            //   //     if(el.userName && ["userName"].includes(reporthide[i][j])){delete el.userName;}
            //   //     if(el.masterName && ["masterName"].includes(reporthide[i][j])){delete el.masterName;}
            //   //     return el;
            //   //   });

            //   // }             

            // }
            // else {
            this.reportsSource = this.reports = res.results;
            // }

            // }

            // this.reportsSource = this.reports = res.Report;

            // this.reportsSource = this.reports = res.Report.map(el => {
            //   if(el.apiComment){delete el.apiComment;}
            //   return el;
            // });
            this.totalamount = [];
            this.totalpagecount = this.reportsSource.length;
            for (let i = 0; i < this.reportsSource.length; i++) {
              var amnt = parseFloat(this.reportsSource[i].gatewayAmount)
              this.totalamount.push(amnt);
            }
            if (this.reportsSource.length > 0) {
              const reducer = (accumulator, currentValue) => accumulator + currentValue;
              this.total = this.totalamount.reduce(reducer).toFixed(2);
            }
            if (this.reports.length) {
              this.tableCols = Object.keys(this.reports[0]).map((col) => {
                switch (col) {
                  case 'Id':
                    return { prop: col, cellTemplate: this.idTemplate };

                  case 'status':
                    return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.checkTemplate };
                  case 'gatewayStatus':
                    return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.checkTemplate };
                  case 'createdDate':
                  case 'updatedDate':
                    return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.dateTemplate, minWidth: 170 };

                  case 'param_a':
                  case 'param_b':
                  case 'param_c':
                    return { name: col.replace(/([A-Z])/g, ' $1'), prop: col };

                  case 'gateWayData':
                    return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.gatewayTemplate };

                  default:
                    return { name: col.replace(/([A-Z])/g, ' $1') };
                }
              });
              // this.tableCols.push({ name: 'Actions', cellTemplate: this.actionTemplate, cellClass: 'action-cell-class', prop: {retry: dmt2Data.retry, refund: dmt2Data.refund}});
              this.tableCols.push({ name: 'Actions', cellTemplate: this.actionTemplate, cellClass: 'action-cell-class', prop: `${dmt2Data.type}` });
              this.selCols = this.tableCols;

              this.persistentData = { formData: dmt2Data.reportData, type: 'dmt2' }; // Set report type for setting persistent data
              this.setUserColData(); // Automatically set selective data in the records as per persistent data.

            } else {
              vex.dialog.alert('No Records Found!!');
            }
          },
          (err: any) => {
            // console.log('Error: ', err);
            this.reportsSource = this.reports = [];
            vex.dialog.alert('Some error occured, while fetching records. Please, try again.');
          });

    }
    else if (dmt2Data.reporttype == "DMTG" && dmt2Data.advsearch) {
      const encURL1 = ReportsApi.url.dmt2.gateway_trans1;
      this.reportService.transactionAPI(encURL1, dmt2Data.reportDataGA)
        .pipe(finalize(() => { this.fetchingReport = false; }))
        .subscribe(
          (res: any) => {// restrict some data for demoisu  by Akash
            // for (let i = 0; i < this.adminname.length; i++) {
            // if ((["ROLE_RETAILER"].includes(this.userData.userInfo.userType)) && ([this.adminname[i]].includes(this.userData.userInfo.adminName))) {
            //   var key = Object.keys(reporthide[i]);
            //   var value = Object.values(reporthide[i]);
            //   for (let j = 0; j < key.length; j++) {
            //     if (["dmt"].includes(key[j])) {
            //       //  console.log(value[j]);

            //       for (let k = 0; k < value[j].length; k++) {
            //         //  console.log(value[j][k]);
            //         this.reportsSource = this.reports = res.results.map(el => {
            //           if (el.previousAmount && ["previousAmount"].includes(value[j][k])) { delete el.previousAmount; }
            //           if (el.balanceAmount && ["balanceAmount"].includes(value[j][k])) { delete el.balanceAmount; }
            //           if (el.transactionType && ["transactionType"].includes(value[j][k])) { delete el.transactionType; }
            //           if (el.userName && ["userName"].includes(value[j][k])) { delete el.userName; }
            //           if (el.masterName && ["masterName"].includes(value[j][k])) { delete el.masterName; }
            //           if (el.transacted_bank_name) { delete el.transacted_bank_name; }
            //           if (el.transaction_status_code) { delete el.transaction_status_code; }
            //           // if(el.customerMobileNumber){delete el.customerMobileNumber;}
            //           if (el.transactionMode) { delete el.transactionMode; }
            //           return el;
            //         });
            //         // console.log(this.reportsSource);


            //         }
            //       }
            //     }


            //   // this.reportsSource = this.reports = res.Report;
            //   // console.log(reporthide[i]);
            //   // for(let j=0; j<reporthide[i].length;j++){
            //   //   // console.log(reporthide[i][j]);
            //   //   this.reportsSource = this.reports = res.Report.map(el => {
            //   //     if(el.previousAmount && ["previousAmount"].includes(reporthide[i][j])){delete el.previousAmount;}
            //   //     if(el.balanceAmount && ["balanceAmount"].includes(reporthide[i][j])){delete el.balanceAmount;}
            //   //     if(el.transactionType && ["transactionType"].includes(reporthide[i][j])){delete el.transactionType;}
            //   //     if(el.userName && ["userName"].includes(reporthide[i][j])){delete el.userName;}
            //   //     if(el.masterName && ["masterName"].includes(reporthide[i][j])){delete el.masterName;}
            //   //     return el;
            //   //   });

            //   // }             

            // }
            // else {
            this.reportsSource = this.reports = res.results;
            // }

            // }

            // this.reportsSource = this.reports = res.Report;

            // this.reportsSource = this.reports = res.Report.map(el => {
            //   if(el.apiComment){delete el.apiComment;}
            //   return el;
            // });
            this.totalamount = [];
            this.totalpagecount = this.reportsSource.length;
            for (let i = 0; i < this.reportsSource.length; i++) {
              var amnt = parseFloat(this.reportsSource[i].gatewayAmount)
              this.totalamount.push(amnt);
            }
            if (this.reportsSource.length > 0) {
              const reducer = (accumulator, currentValue) => accumulator + currentValue;
              this.total = this.totalamount.reduce(reducer).toFixed(2);
            }
            if (this.reports.length) {
              this.tableCols = Object.keys(this.reports[0]).map((col) => {
                switch (col) {
                  case 'Id':
                    return { prop: col, cellTemplate: this.idTemplate };

                  case 'status':
                    return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.checkTemplate };
                  case 'gatewayStatus':
                    return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.checkTemplate };
                  case 'createdDate':
                  case 'updatedDate':
                    return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.dateTemplate, minWidth: 170 };

                  case 'param_a':
                  case 'param_b':
                  case 'param_c':
                    return { name: col.replace(/([A-Z])/g, ' $1'), prop: col };

                  case 'gateWayData':
                    return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.gatewayTemplate };

                  default:
                    return { name: col.replace(/([A-Z])/g, ' $1') };
                }
              });
              // this.tableCols.push({ name: 'Actions', cellTemplate: this.actionTemplate, cellClass: 'action-cell-class', prop: {retry: dmt2Data.retry, refund: dmt2Data.refund}});
              this.tableCols.push({ name: 'Actions', cellTemplate: this.actionTemplate, cellClass: 'action-cell-class', prop: `${dmt2Data.type}` });
              this.selCols = this.tableCols;

              this.persistentData = { formData: dmt2Data.reportData, type: 'dmt2' }; // Set report type for setting persistent data
              this.setUserColData(); // Automatically set selective data in the records as per persistent data.

            } else {
              vex.dialog.alert('No Records Found!!');
            }
          },
          (err: any) => {
            // console.log('Error: ', err);
            this.reportsSource = this.reports = [];
            vex.dialog.alert('Some error occured, while fetching records. Please, try again.');
          });

    }
    else if (dmt2Data.reporttype == "DMT" && dmt2Data.advsearch) {
      const encURL1 = ReportsApi.url.dmt2.gateway_trans;
      this.reportService.transactionAPI(encURL1, dmt2Data.reportDataG)
        .pipe(finalize(() => { this.fetchingReport = false; }))
        .subscribe(
          (res: any) => {// restrict some data for demoisu  by Akash
            // for (let i = 0; i < this.adminname.length; i++) {
            // if ((["ROLE_RETAILER"].includes(this.userData.userInfo.userType)) && ([this.adminname[i]].includes(this.userData.userInfo.adminName))) {
            //   var key = Object.keys(reporthide[i]);
            //   var value = Object.values(reporthide[i]);
            //   for (let j = 0; j < key.length; j++) {
            //     if (["dmt"].includes(key[j])) {
            //       //  console.log(value[j]);

            //       for (let k = 0; k < value[j].length; k++) {
            //         //  console.log(value[j][k]);
            //         this.reportsSource = this.reports = res.BQReport.map(el => {
            //           if (el.previousAmount && ["previousAmount"].includes(value[j][k])) { delete el.previousAmount; }
            //           if (el.balanceAmount && ["balanceAmount"].includes(value[j][k])) { delete el.balanceAmount; }
            //           if (el.transactionType && ["transactionType"].includes(value[j][k])) { delete el.transactionType; }
            //           if (el.userName && ["userName"].includes(value[j][k])) { delete el.userName; }
            //           if (el.masterName && ["masterName"].includes(value[j][k])) { delete el.masterName; }
            //           if (el.transacted_bank_name) { delete el.transacted_bank_name; }
            //           if (el.transaction_status_code) { delete el.transaction_status_code; }
            //           // if(el.customerMobileNumber){delete el.customerMobileNumber;}
            //           if (el.transactionMode) { delete el.transactionMode; }
            //           return el;
            //         });
            //         // console.log(this.reportsSource);


            //         }
            //       }
            //     }


            //   // this.reportsSource = this.reports = res.Report;
            //   // console.log(reporthide[i]);
            //   // for(let j=0; j<reporthide[i].length;j++){
            //   //   // console.log(reporthide[i][j]);
            //   //   this.reportsSource = this.reports = res.Report.map(el => {
            //   //     if(el.previousAmount && ["previousAmount"].includes(reporthide[i][j])){delete el.previousAmount;}
            //   //     if(el.balanceAmount && ["balanceAmount"].includes(reporthide[i][j])){delete el.balanceAmount;}
            //   //     if(el.transactionType && ["transactionType"].includes(reporthide[i][j])){delete el.transactionType;}
            //   //     if(el.userName && ["userName"].includes(reporthide[i][j])){delete el.userName;}
            //   //     if(el.masterName && ["masterName"].includes(reporthide[i][j])){delete el.masterName;}
            //   //     return el;
            //   //   });

            //   // }             

            // }
            // else {
            this.reportsSource = this.reports = res.results;
            // }

            // }

            // this.reportsSource = this.reports = res.Report;

            // this.reportsSource = this.reports = res.Report.map(el => {
            //   if(el.apiComment){delete el.apiComment;}
            //   return el;
            // });
            this.totalamount = [];
            this.totalpagecount = this.reportsSource.length;
            for (let i = 0; i < this.reportsSource.length; i++) {
              var amnt = parseFloat(this.reportsSource[i].gatewayAmount)
              this.totalamount.push(amnt);
            }
            if (this.reportsSource.length > 0) {
              const reducer = (accumulator, currentValue) => accumulator + currentValue;
              this.total = this.totalamount.reduce(reducer).toFixed(2);
            }
            if (this.reports.length) {
              this.tableCols = Object.keys(this.reports[0]).map((col) => {
                switch (col) {
                  case 'Id':
                    return { prop: col, cellTemplate: this.idTemplate };

                  case 'status':
                    return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.checkTemplate };
                  case 'gatewayStatus':
                    return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.checkTemplate };
                  case 'createdDate':
                  case 'updatedDate':
                    return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.dateTemplate, minWidth: 170 };

                  case 'param_a':
                  case 'param_b':
                  case 'param_c':
                    return { name: col.replace(/([A-Z])/g, ' $1'), prop: col };

                  case 'gateWayData':
                    return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.gatewayTemplate };

                  default:
                    return { name: col.replace(/([A-Z])/g, ' $1') };
                }
              });
              // this.tableCols.push({ name: 'Actions', cellTemplate: this.actionTemplate, cellClass: 'action-cell-class', prop: {retry: dmt2Data.retry, refund: dmt2Data.refund}});
              this.tableCols.push({ name: 'Actions', cellTemplate: this.actionTemplate, cellClass: 'action-cell-class', prop: `${dmt2Data.type}` });
              this.selCols = this.tableCols;

              this.persistentData = { formData: dmt2Data.reportData, type: 'dmt2' }; // Set report type for setting persistent data
              this.setUserColData(); // Automatically set selective data in the records as per persistent data.

            } else {
              vex.dialog.alert('No Records Found!!');
            }
          },
          (err: any) => {
            // console.log('Error: ', err);
            this.reportsSource = this.reports = [];
            vex.dialog.alert('Some error occured, while fetching records. Please, try again.');
          });

    }
  }
  async fetchrecharge2Report(recharge2Data: any) {
    this.searchInput.reset();
    this.totalamount = [];
    const encURL = await AuthConfig.config.encodeUrl(ReportsApi.url.recharge2.all_trans);
    this.reportService.rechargereportAPI(encURL, recharge2Data)
      .pipe(finalize(() => { this.fetchingReport = false; }))
      .subscribe(
        (res: any) => {
          this.reportsSource = this.reports = res.results.BQReport;
          if (this.reports.length) {
            this.tableCols = Object.keys(this.reports[0]).map((col) => {
              switch (col) {
                case 'Id':
                  return { prop: col };

                case 'status':
                  return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.checkTemplate };

                case 'createdDate':
                case 'updatedDate':
                  return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.dateTemplate };

                case 'param_a':
                case 'param_b':
                case 'param_c':
                  return { name: col.replace(/([A-Z])/g, ' $1'), prop: col };

                default:
                  return { name: col.replace(/([A-Z])/g, ' $1') };
              }
            });
            // this.tableCols.push({ name: 'Actions', cellTemplate: this.actionTemplate, cellClass: 'action-cell-class', prop: {retry: dmt2Data.retry, refund: dmt2Data.refund}});
            this.tableCols.push({ name: 'Actions', cellTemplate: this.actionTemplate, cellClass: 'action-cell-class', prop: `${recharge2Data.type}` });
            // this.selCols = this.tableCols;

            // this.persistentData = {formData: recharge2Data.reportData, type: 'recharge2'}; // Set report type for setting persistent data
            // this.setUserColData(); // Automatically set selective data in the records as per persistent data.

          } else {
            vex.dialog.alert('No Records Found!!');
          }
        },
        (err: any) => {
          console.log('Error: ', err);
          this.reportsSource = this.reports = [];
          vex.dialog.alert('Some error occured, while fetching records. Please, try again.');
        });
  }


  async fetchAepsReport(reportData: any) {

    const encURL = reportData.subcatVal == 'aeps1' ? await AuthConfig.config.encodeUrl(ReportsApi.url.aeps.aeps1) : await AuthConfig.config.encodeUrl(ReportsApi.url.aeps.aeps2);

    this.reportService.transactionAPI(encURL, reportData)
      .pipe(finalize(() => { this.fetchingReport = false; }))
      .subscribe(
        (res: any) => {
          this.reportsSource = this.reports = res.hasOwnProperty('results') ? res.results.BQReport : res.BQReport;
          this.totalpagecount = this.reportsSource.length;
          if (this.reports.length) {
            this.tableCols = Object.keys(this.reports[0]).map((col) => {
              switch (col) {
                case 'Id':
                  return { prop: col };

                case 'status':
                  return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.checkTemplate };

                case 'createdDate':
                case 'updatedDate':
                  return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.dateTemplate };

                default:
                  return { name: col.replace(/([A-Z])/g, ' $1') };
              }

            });
            this.tableCols.push({ name: 'Actions', cellTemplate: this.actionTemplate });
          } else {
            vex.dialog.alert('No Data Found!!');
          }
        },
        (err: any) => {
          // console.log('Error: ', err);
          this.reportsSource = this.reports = [];
        }
      );

  }


  async fetchMatmReport(reportData: any) {

    const encURL = reportData.hasOwnProperty('fromDate') ? await AuthConfig.config.encodeUrl(ReportsApi.url.matm.matm1) : await AuthConfig.config.encodeUrl(ReportsApi.url.matm.matm2);

    this.reportService.transactionAPI(encURL, reportData)
      .pipe(finalize(() => { this.fetchingReport = false; }))
      .subscribe(
        (res: any) => {
          this.totalamount = [];
          this.reportsSource = this.reports = res.hasOwnProperty('results') ? res.results.BQReport : res.BQReport;
          this.totalpagecount = this.reportsSource.length;
          for (let i = 0; i < this.reportsSource.length; i++) {
            var amnt = parseFloat(this.reportsSource[i].amount)
            this.totalamount.push(amnt);
          }
          const reducer = (accumulator, currentValue) => accumulator + currentValue;
          this.total = this.totalamount.reduce(reducer).toFixed(2);
          if (this.reports.length) {
            this.tableCols = Object.keys(this.reports[0]).map((col) => {
              switch (col) {
                case 'Id':
                  return { prop: col };

                case 'status':
                  return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.checkTemplate };

                case 'createdDate':
                case 'updatedDate':
                  return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.dateTemplate };

                default:
                  return { name: col.replace(/([A-Z])/g, ' $1') };
              }

            });
            this.tableCols.push({ name: 'Actions', cellTemplate: this.actionTemplate });
          } else {
            vex.dialog.alert('No Data Found!!');
          }
        },
        (err: any) => {
          // console.log('Error: ', err);
          this.reportsSource = this.reports = [];
        }
      );

  }


  async fetchBbpsReport(reportData: any) {

    const encURL = await AuthConfig.config.encodeUrl(ReportsApi.url.bbps);

    this.reportService.transactionAPI(encURL, reportData)
      .pipe(finalize(() => { this.fetchingReport = false; }))
      .subscribe(
        (res: any) => {
          this.totalamount = [];
          this.reportsSource = this.reports = res.results.BQReport;
          this.totalpagecount = this.reportsSource.length;
          for (let i = 0; i < this.reportsSource.length; i++) {
            var amnt = parseFloat(this.reportsSource[i].amount)
            this.totalamount.push(amnt);
          }
          const reducer = (accumulator, currentValue) => accumulator + currentValue;
          this.total = this.totalamount.reduce(reducer).toFixed(2);
          if (this.reports.length) {
            this.tableCols = Object.keys(this.reports[0]).map((col) => {
              switch (col) {
                case 'Id':
                  return { prop: col };

                case 'status':
                  return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.checkTemplate };

                case 'createdDate':
                case 'updatedDate':
                  return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.dateTemplate };

                default:
                  return { name: col.replace(/([A-Z])/g, ' $1') };
              }

            });
            this.tableCols.push({ name: 'Actions', cellTemplate: this.actionTemplate });
          } else {
            vex.dialog.alert('No Data Found!!');
          }
        },
        (err: any) => {
          // console.log('Error: ', err);
          this.reportsSource = this.reports = [];
        }
      );

  }

  async fetchInsuranceReport(reportData: any) {

    const encURL = await AuthConfig.config.encodeUrl(ReportsApi.url.insurance);

    this.reportService.transactionAPI(encURL, reportData)
      .pipe(finalize(() => { this.fetchingReport = false; }))
      .subscribe((res: any) => {
        this.totalamount = [];
        this.reportsSource = this.reports = res.results.BQReport;
        this.totalpagecount = this.reportsSource.length;
        for (let i = 0; i < this.reportsSource.length; i++) {
          var amnt = parseFloat(this.reportsSource[i].amount)
          this.totalamount.push(amnt);
        }
        const reducer = (accumulator, currentValue) => accumulator + currentValue;
        this.total = this.totalamount.reduce(reducer).toFixed(2);
        if (this.reports.length) {
          this.tableCols = Object.keys(this.reports[0]).map((col) => {
            switch (col) {
              case 'Id':
                return { prop: col };

              case 'status':
                return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.checkTemplate };

              case 'createdDate':
              case 'updatedDate':
                return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.dateTemplate };

              default:
                return { name: col.replace(/([A-Z])/g, ' $1') };
            }
          });
          this.tableCols.push({ name: 'Actions', cellTemplate: this.actionTemplate });
        }
      },
        (err: any) => {
          // console.log('Error: ', err);
          this.reportsSource = this.reports = [];
        })
  };

  async fetchCashoutReport(reportData: any) {
    let encURL = '';
    (reportData.subcatVal == 'aeps' || reportData.subcatVal == 'matm') ? encURL = await AuthConfig.config.encodeUrl(ReportsApi.url.cashout.aeps_matm) : encURL = await AuthConfig.config.encodeUrl(ReportsApi.url.cashout.wallet);

    this.reportService.transactionAPI(encURL, reportData)
      .pipe(finalize(() => { this.fetchingReport = false; }))
      .subscribe((res: any) => {
        this.totalamount = [];
        (reportData.subcatVal == 'aeps' || reportData.subcatVal == 'matm') ? this.reportsSource = this.reports = res.BQReport : this.reportsSource = this.reports = res.results.BQReport;
        this.totalpagecount = this.reportsSource.length;
        if (this.reportsSource.length == 0) {
          vex.dialog.alert('No Data Found!!');
        }
        for (let i = 0; i < this.reportsSource.length; i++) {
          var amnt = parseFloat(this.reportsSource[i].amount)
          this.totalamount.push(amnt);
        }
        const reducer = (accumulator, currentValue) => accumulator + currentValue;
        this.total = this.totalamount.reduce(reducer).toFixed(2);
        if (this.reports.length) {
          this.tableCols = Object.keys(this.reports[0]).map((col) => {
            switch (col) {
              case 'Id':
                return { prop: col };

              case 'status':
                return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.checkTemplate };

              case 'createdDate':
              case 'updatedDate':
                return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.dateTemplate };

              default:
                return { name: col.replace(/([A-Z])/g, ' $1') };
            }
          });
          this.tableCols.push({ name: 'Actions', cellTemplate: this.actionTemplate });
        }
      },
        (err: any) => {
          // console.log('Error: ', err);
          this.reportsSource = this.reports = [];
        })
  };

  async fetchCommissionReport(reportData: any, comType: string) {
    this.totalamount = [];
    let encURL = '';

    switch (comType) {
      case 'comm1':
        encURL = await AuthConfig.config.encodeUrl(ReportsApi.url.commission.comm1);
        break;

      case 'comm2':
        encURL = await AuthConfig.config.encodeUrl(ReportsApi.url.commission.comm2);
        break;

      case 'new_comm':
        encURL = await AuthConfig.config.encodeUrl(ReportsApi.url.commission.new_comm);
        break;

      default:
        break;
    }

    this.reportService.transactionAPI(encURL, reportData)
      .pipe(finalize(() => { this.fetchingReport = false; }))
      .subscribe((res: any) => {
        this.totalamount = [];
        this.reportsSource = this.reports = ['comm1', 'comm2'].includes(comType) ? res.BQReport : res.Report;
        this.totalpagecount = this.reportsSource.length;
        for (let i = 0; i < this.reportsSource.length; i++) {
          var amnt = + this.reportsSource[i].amountTransacted
          this.totalamount.push(amnt);
        }

        if (this.reportsSource.length == 0) {
          vex.dialog.alert('No Data Found!!');
        }
        const reducer = (accumulator, currentValue) => accumulator + currentValue;
        this.total = this.totalamount.reduce(reducer).toFixed(2);
        if (this.reports.length) {
          this.tableCols = Object.keys(this.reports[0]).map((col) => {
            switch (col) {
              case 'Id':
              case 'Type':
              case 'Tds':
                return { prop: col };

              case 'status':
                return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.checkTemplate };

              case 'createdDate':
              case 'updatedDate':
                return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.dateTemplate, minWidth: 170 };

              default:
                return { name: col.replace(/([A-Z])/g, ' $1') };
            }
          });
          this.tableCols.push({ name: 'Actions', cellTemplate: this.actionTemplate });
          this.selCols = this.tableCols;

          this.persistentData = { formData: reportData, type: comType };
          this.setUserColData();
        } else {
          vex.dialog.alert('No Records Found!!');
        }
      },
        (err: any) => {
          // console.log('Error: ', err);
          this.reportsSource = this.reports = [];
          vex.dialog.alert('Some error occured, while fetching records. Please, try again.');
        })
  };

  async fetchWalletReport(reportData: any, wType: string = undefined) {
    this.totalamount = [];

    // console.log(reportData);
    let encURL = '';
    if ((wType == 'my_wallet1') || (wType == 'user_wallet1')) {
      encURL = await AuthConfig.config.encodeUrl(ReportsApi.url.wallet.my_wallet1);
    } else if (wType == 'my_wallet2') {
      encURL = await AuthConfig.config.encodeUrl(ReportsApi.url.wallet.my_wallet2);
      // } else if (wType == 'user_wallet1') {
      //   encURL = await AuthConfig.config.encodeUrl(ReportsApi.url.wallet.my_wallet1);
    }
    else if (wType == 'user_wallet2') {
      encURL = await AuthConfig.config.encodeUrl(ReportsApi.url.wallet.userwallet);
    } else {
      // encURL = await AuthConfig.config.encodeUrl(ReportsApi.url.wallet.wallet_intrchng);
      encURL = ReportsApi.url.wallet.wallet_intrchng;
    }

    this.reportService.transactionAPI(encURL, reportData)
      .pipe(finalize(() => { this.fetchingReport = false; }))
      .subscribe((res: any) => {
        this.totalamount = [];
        // console.log(res)
        // this.reportsSource = this.reports = ((wType == 'my_wallet1') || (wType == 'user_wallet1')) ? res.Report : res.Report;
        this.reportsSource = this.reports = (['my_wallet1', 'user_wallet1', 'wallet_interchange', 'my_wallet2'].includes(wType)) ? res.Report : res.BQReport;
        this.totalpagecount = this.reportsSource.length;
        if (this.reportsSource.length == 0) {
          vex.dialog.alert('No Data Found!!');
        }
        for (let i = 0; i < this.reportsSource.length; i++) {
          var amnt = parseFloat(this.reportsSource[i].CrAmount)
          this.totalamount.push(amnt);
        }
        const reducer = (accumulator, currentValue) => accumulator + currentValue;
        this.total_CR = this.totalamount.reduce(reducer).toFixed(2);
        for (let i = 0; i < this.reportsSource.length; i++) {
          var amnt1 = parseFloat(this.reportsSource[i].DrAmount)
          this.totalamount.push(amnt1);
        }
        const reducer1 = (accumulator, currentValue) => accumulator + currentValue;
        this.total_DR = this.totalamount.reduce(reducer1).toFixed(2);
        // this.reportsSource = this.reports = (wType == 'my_wallet1') ? res.Report : res.BQReport;
        if (this.reports.length) {
          this.tableCols = Object.keys(this.reports[0]).map((col) => {
            switch (col) {
              case 'Id':
              case 'Type':
                return { prop: col };

              case 'CrAmount':
                return { prop: col };
              case 'DrAmount':
                return { prop: col };

              case 'status':
                return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.checkTemplate };

              case 'createdDate':
              case 'updatedDate':
              case 'w1CreatedDate':
              case 'w1UpdatedDate':
              case 'w2CreatedDate':
              case 'w2UpdatedDate':
              case 'w3CreatedDate':
              case 'w3UpdatedDate':
                return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.dateTemplate, minWidth: 170 };

              default:
                return { name: col.replace(/([A-Z])/g, ' $1') };
            }
          });
          this.tableCols.push({ name: 'Actions', cellTemplate: this.actionTemplate });
          this.selCols = this.tableCols;

          this.persistentData = { formData: reportData, type: wType };
          this.setUserColData();
        } else {
          vex.dialog.alert('No Records Found!!');
        }
      },
        (err: any) => {
          // console.log('Error: ', err);
          this.reportsSource = this.reports = [];
          vex.dialog.alert('Some error occured, while fetching records. Please, try again.');
        })
  };

  async fetchUpiReport(reportData: any) {
    this.searchInput.reset();
    this.totalamount = [];
    const encURL = await AuthConfig.config.encodeUrl(ReportsApi.url.upi);
    this.reportService.transactionAPI(encURL, reportData)
      .pipe(finalize(() => { this.fetchingReport = false; }))
      .subscribe((res: any) => {
        this.totalamount = [];
        this.reportsSource = this.reports = res.results.BQReport;
        this.totalpagecount = this.reportsSource.length;
        for (let i = 0; i < this.reportsSource.length; i++) {
          var amnt = parseFloat(this.reportsSource[i].amountTransacted)
          this.totalamount.push(amnt);
        }
        const reducer = (accumulator, currentValue) => accumulator + currentValue;
        this.total = this.totalamount.reduce(reducer).toFixed(2);
        if (this.reports.length) {
          this.tableCols = Object.keys(this.reports[0]).map((col) => {
            switch (col) {
              case 'Id':
                return { prop: col };

              case 'status':
                return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.checkTemplate };

              case 'createdDate':
              case 'updatedDate':
                return { name: col.replace(/([A-Z])/g, ' $1'), cellTemplate: this.dateTemplate };

              default:
                return { name: col.replace(/([A-Z])/g, ' $1') };
            }
          });
          this.tableCols.push({ name: 'Actions', cellTemplate: this.actionTemplate });
        }
      },
        (err: any) => {
          // console.log('Error: ', err);
          this.reportsSource = this.reports = [];
        })
  };

  updateFilter(event) {
    // console.log(this.reportsSource);
    // console.log(event.target.value);
    // console.log(this.reportsSource.length);
    this.total_CR = 0;
    this.total_DR = 0;


    const val = event.target.value;
    if (this.reportsSource.length) {
      this.totalamount = [];
      // filter our data
      if (!val) {
        this.totalamount = [];
        this.totalpagecount = this.reportsSource.length;
        for (let i = 0; i < this.reportsSource.length; i++) {
          if (this.dmtreporttype == "DMTG") {
            var amnt = (parseFloat(this.reportsSource[i].gatewayAmount))
            this.totalamount.push(amnt);
          }
          else {
            var amnt = (parseFloat(this.reportsSource[i].amount) || parseFloat(this.reportsSource[i].amountTransacted));
            this.totalamount.push(amnt);
          }
        }
        const reducer = (accumulator, currentValue) => accumulator + currentValue;
        this.total = this.totalamount.reduce(reducer).toFixed(2);
        if (this.reportType == "wallet") {
          this.totalamount = [];
          for (let i = 0; i < this.reportsSource.length; i++) {
            var amnt = parseFloat(this.reportsSource[i].CrAmount)
            this.totalamount.push(amnt);
          }
          const reducer = (accumulator, currentValue) => accumulator + currentValue;
          this.total_CR = this.totalamount.reduce(reducer).toFixed(2);
        }
        if (this.reportType == "wallet") {
          this.totalamount = [];
          for (let i = 0; i < this.reportsSource.length; i++) {
            var amnt1 = parseFloat(this.reportsSource[i].DrAmount)
            this.totalamount.push(amnt1);
          }
          const reducer1 = (accumulator, currentValue) => accumulator + currentValue;
          this.total_DR = this.totalamount.reduce(reducer1).toFixed(2);
        }
      }
      if (val && this.reportsSource.length) {
        this.totalamount = [];

        const temp = this.reportsSource.filter(d => {
          const vals = Object.values(d);
          // console.log(val);

          // console.log(Object.values(d));
          // console.log(Object.values(d)[4]);          
          //  vals.push([Object.values(d)[2],' ',Object.values(d)[7]].join(''))
          //  console.log(vals);           
          return new RegExp(val, 'gi').test(vals.toString());
          // return vals.includes(val);

        });
        this.totalpagecount = temp.length;
        if (temp.length != 0 && this.reportType == "wallet") {
          this.totalamount = [];
          for (let i = 0; i < temp.length; i++) {
            var amnt = parseFloat(temp[i].CrAmount)
            this.totalamount.push(amnt);
          }
          const reducer = (accumulator, currentValue) => accumulator + currentValue;
          this.total_CR = this.totalamount.reduce(reducer).toFixed(2);
        }
        if (temp.length != 0 && this.reportType == "wallet") {
          this.totalamount = [];
          for (let i = 0; i < temp.length; i++) {
            var amnt1 = parseFloat(temp[i].DrAmount)
            this.totalamount.push(amnt1);
          }
          const reducer1 = (accumulator, currentValue) => accumulator + currentValue;
          this.total_DR = this.totalamount.reduce(reducer1).toFixed(2);
        }
        if (temp.length != 0) {
          for (let i = 0; i < temp.length; i++) {
            // console.log(this.reportsSource[i]);
            // console.log(temp);
            if (this.dmtreporttype == "DMTG") {
              var amnt = (parseFloat(temp[i].gatewayAmount))
              this.totalamount.push(amnt);
            }
            else {
              var amnt = (parseFloat(temp[i].amount) || parseFloat(temp[i].amountTransacted))
              this.totalamount.push(amnt);

            }
          }
          const reducer = (accumulator, currentValue) => accumulator + currentValue;
          if (temp.length == 1) {
            this.total = this.totalamount.reduce(reducer)
            // console.log(amnt);

          }
          else {
            this.total = this.totalamount.reduce(reducer).toFixed(2);
          }

        }
        if (temp.length == 0 && this.reportType == "wallet") {
          this.totalamount = [];
          for (let i = 0; i < this.reportsSource.length; i++) {
            var amnt = parseFloat(this.reportsSource[i].CrAmount)
            this.totalamount.push(amnt);
          }
          const reducer = (accumulator, currentValue) => accumulator + currentValue;
          this.total_CR = this.totalamount.reduce(reducer).toFixed(2);
        }
        if (temp.length == 0 && this.reportType == "wallet") {
          this.totalamount = [];
          for (let i = 0; i < this.reportsSource.length; i++) {
            var amnt1 = parseFloat(this.reportsSource[i].DrAmount)
            this.totalamount.push(amnt1);
          }
          const reducer1 = (accumulator, currentValue) => accumulator + currentValue;
          this.total_DR = this.totalamount.reduce(reducer1).toFixed(2);
        }
        if (temp.length == 0) {
          this.totalpagecount = this.reportsSource.length;
          for (let i = 0; i < this.reportsSource.length; i++) {
            if (this.dmtreporttype == "DMTG") {
              var amnt = (parseFloat(this.reportsSource[i].gatewayAmount))
              this.totalamount.push(amnt);
            }
            else {
              var amnt = (parseFloat(this.reportsSource[i].amount) || parseFloat(this.reportsSource[i].amountTransacted))
              this.totalamount.push(amnt);
            }
          }
          const reducer = (accumulator, currentValue) => accumulator + currentValue;
          this.total = this.totalamount.reduce(reducer).toFixed(2);
        }

        // console.log(temp);
        // update the rows
        this.reports = temp;
      } else {
        this.reports = this.reportsSource;
      }
    } else {
      vex.dialog.alert('No data to perform search.');
      this.searchInput.reset();
    }

  }

  // Report Pagination Code Starts
  public onLimitChange(limit: any): void {
    this.changePageLimit(limit);
    this.table.limit = this.currentPageLimit
    // this.table.limit=this.currentPageLimit;
    this.table.recalculate();
    setTimeout(() => {
      if (this.table.bodyComponent.temp.length <= 0) {
        this.table.offset = Math.floor((this.table.rowCount - 1) / this.table.limit);
        // console.log(this.table.offset);
      }
    });
  }
  private changePageLimit(limit: any): void {
    this.currentPageLimit = parseInt(limit, 10);
  }
  // Report Pagination Code Ends

  downloadExcel() {
    if (this.reports.length) {
      // console.log('Table Cols: ', this.tableCols);
      // console.log('Table selCols: ', this.selCols);
      this.reportService.generateExcel([...this.reports], [...this.tableCols]);
    } else {
      vex.dialog.alert('Failed to generate excel sheet.');
    }
  }
  searchRefundID(event) {

    const val = event.target.value;
    // // console.log('ID to be searched: ', val);

    if (this.refundData.allRefunds.length) {

      if (val) {
        this.refundData.refunds = this.refundData.allRefunds.filter(refund => {
          const vals = Object.values(refund);
          return new RegExp(val, 'gi').test(vals.toString());
        });
      } else {
        this.refundData.refunds = this.refundData.allRefunds;
      }


    }
  }
  getRefunds(mobileno) {
    // console.log(mobileno);
    // console.log(mobileno.customerMobileNumber);




    const thisDay = new Date();
    thisDay.setDate(thisDay.getDate() - 60); // Making the date to 30 days backward.
    // const { mobileNumber } = mobileno.customerMobileNumber;

    const refundData = {
      "$1": "refundidbymobv2", // In case of production, 'p' will be added at the end.
      "$2": this.userName,
      "$4": this.datePipe.transform(thisDay, 'yyyy-MM-dd'),
      "$5": this.datePipe.transform((new Date()), 'yyyy-MM-dd'),
      // "$10": "7008695850"
      "$10": mobileno.customerMobileNumber
    };


    this.ngxSpinner.show("refundSpinner", { bdColor: "rgba(0, 0, 0, 0.5)", type: "timer" });
    this.reportService.fetchRefunds(refundData)
      .pipe(finalize(() => { this.ngxSpinner.hide('refundSpinner'); }))
      .subscribe(
        (res: any) => {
          // console.log('Refunds Res: ', res);

          this.refundData.allRefunds = this.refundData.refunds = res.BQReport;

          this.refundModal1.show();


        },
        (err: any) => {
          // console.log('Refunds Error: ', err);
        }
      );
  }

  async actionData(txn: any) {
    this.ngxSpinner.show('reportSpinner', { bdColor: "rgba(0, 0, 0, 0.5)", type: "timer" });
    let reportdata = {
      "$1": "Email_report",
      "$2": this.userName,
      "$3": [
        "INITIATED",
        "RETRY",
        "INPROGRESS",
        "SUCCESS",
        "FAILED",
        "REFUNDED",
        "REFUNDPENDING"
      ],
      "$4": this.datePipe.transform(txn.createdDate, 'yyyy-MM-dd'),
      "$5": this.datePipe.transform(txn.updatedDate, 'yyyy-MM-dd'),
      "$6": [
        "DMT"
      ],
      "$7": [
        "IMPS_FUND_TRANSFER",
        "NEFT_FUND_TRANSFER",
        "BENE_VERIFICATION"
      ],
      "$10": [
        parseInt(txn.Id.replace("#", ""))
      ]
    }
    this.reportService.fetchpdfdata(ReportsApi.url.pdfurl, reportdata)
      .pipe(finalize(() => {
      }))
      .subscribe(
        (res: any) => {
          console.log('pdf URL Response: ', res);
          txn.gateWayData = res.results[0].gateWayData;
          txn.amountTransacted = res.results[0].amountTransacted
          console.log(txn);
          this.getPDF(txn);

        },
        (err: any) => {
          this.ngxSpinner.hide('reportSpinner');
          console.log('pdf URL Error: ', err);
        }
      );
  }
  async getPDF(txn) {
    var RRN = (typeof txn.gateWayData === 'object') ? txn.gateWayData.map(data => { return { rrn: data.rrn, amount: data.amount, status: data.status }; }) : 'N/A';
    if (txn.gateWayData) {
      if (txn.gateWayData == "NA" || txn.gateWayData.length == 0) {
        RRN = [{
          rrn: 'N/A',
          amount: txn.amountTransacted,
          status: 'N/A'
        }]
      }

    }
    else {
      RRN = [{
        rrn: txn.rrn,
        amount: txn.amountTransacted,
        status: txn.gatewayStatus
      }];
      txn.gateWayData = RRN;
    }
    if (this.dmtreporttype == "DMT") {
      const encUrl = await AuthConfig.config.encodeUrl(ReportsApi.url.shopName2);
      this.reportService.fetchuserAPI(encUrl)
        .pipe(finalize(async () => {
          let docDefinition = {
            pageSize: 'A6',
            pageMargins: [0, 0, 0, 0],
            content: [
              {
                style: 'tableExample',
                fillColor: '#f5f9f9',
                table: {
                  widths: [140],
                  body: [
                    [
                      [
                        {
                          style: 'tableExample',
                          margin: [30, 0, 0, 0],
                          table: {
                            widths: [140, 140],
                            body: [
                              [
                                {
                                  image: await this.demo3(this.demo2),
                                  //   style: 'tableHeader',
                                  alignment: 'left',
                                  margin: [0, 0, 0, 3],
                                  fit: [25, 25]
                                },
                                {
                                  text: this.datePipe.transform(txn.createdDate, 'medium'),
                                  alignment: 'right',
                                  margin: [0, 0, 30, 5],
                                  fontSize: 5
                                }
                              ],
                              [
                                {
                                  table: {
                                    widths: [100],
                                    body: [
                                      [
                                        {
                                          text: 'Customer Details',
                                          color: '#000000',
                                          bold: true,
                                          margin: [0, 0, 0, 0],
                                          border: [false, false, false, true],
                                          fontSize: 5
                                        }
                                      ]
                                    ]
                                  },
                                  margin: [0, 0, 0, 10],
                                  layout: {
                                    hLineWidth: function (i, node) {
                                      return (i === 0 || i === node.table.body.length) ? 1 : '';
                                    },
                                    hLineColor: function (i, node) {
                                      return '#000000';
                                    },
                                    hLineStyle: function (i, node) {
                                      return { dash: { length: 3, space: 3 } };
                                    },
                                    paddingLeft: function (i, node) { return 0; }
                                  }
                                },
                                {
                                  table: {
                                    widths: [100],
                                    body: [
                                      [
                                        {
                                          text: 'Benificiary Details',
                                          color: '#000000',
                                          margin: [2, 0, 0, 0],
                                          border: [false, false, false, true],
                                          fontSize: 5
                                        }
                                      ]
                                    ]
                                  },
                                  margin: [0, 0, 0, 10],
                                  layout: {
                                    hLineWidth: function (i, node) {
                                      return (i === 0 || i === node.table.body.length) ? 1 : '';
                                    },
                                    hLineColor: function (i, node) {
                                      return '#000000';
                                    },
                                    hLineStyle: function (i, node) {
                                      return { dash: { length: 3, space: 3 } };
                                    },
                                    paddingLeft: function (i, node) { return 0; }
                                  }
                                }
                              ],
                              [
                                {
                                  text: txn.customerName,
                                  bold: true,
                                  margin: [0, 0, 0, 0],
                                  fontSize: 0
                                },
                                {
                                  text: txn.beneName,
                                  bold: true,
                                  margin: [0, 0, 0, 2],
                                  fontSize: 5
                                }
                              ],
                              [
                                {
                                  text: 'Mob No.: ' + txn.customerMobNo,
                                  color: '#000000',
                                  fontSize: 5,
                                  bold: true,
                                },
                                {
                                  text: 'A/C No.: ' + txn.beneAcNo,
                                  color: '#000000',
                                  fontSize: 5,
                                  bold: true,
                                }
                              ],
                              [
                                {
                                  text: ''
                                },
                                {
                                  text: 'Bank Name: ' + txn.beneBankName,
                                  color: '#000000',
                                  bold: true,
                                  fontSize: 5
                                }
                              ],
                              [
                                {
                                  text: ''
                                },
                                {
                                  text: 'IFSC: ' + txn.bene_ifsc ? txn.bene_ifsc : '',
                                  color: '#000000',
                                  bold: true,
                                  fontSize: 3
                                }
                              ],
                            ],
                          },
                          layout: 'noBorders'
                        }
                      ]

                    ]
                  ],
                },
                layout: 'noBorders'
              },
              {
                style: 'tableExample',
                margin: [5, 0, 5, 0],
                fontSize: 6,
                table: {
                  widths: [265],

                  body: [
                    [
                      {
                        table: {
                          widths: [135, 135],
                          body: [
                            ['Date', this.datePipe.transform(txn.createdDate, 'medium')]
                          ]
                        },
                        layout: 'noBorders'
                      }
                    ],
                    [
                      {
                        table: {
                          widths: [135, 135],
                          body: [
                            ['Transaction ID', txn.Id],
                          ]
                        },
                        layout: 'noBorders',

                      }
                    ],
                    [
                      {
                        table: {
                          widths: [135, 135],
                          body: [
                            ['Transaction Mode', txn.operationPerformed]
                          ]
                        },
                        layout: 'noBorders'
                      }
                    ],
                    [
                      {
                        table: {
                          widths: [135, 135],
                          body: [
                            ['Amount', this.currencyPipe.transform(txn.amount, 'INR')]
                          ]
                        },
                        layout: 'noBorders'
                      }
                    ],
                    [
                      {
                        table: {
                          widths: [65, 65],
                          body: [
                            ['Details',
                              (RRN === 'N/A') ? 'N/A' :
                                {
                                  table: {
                                    widths: [45, 55, 62],
                                    body: [
                                      ['RRN', 'Amount', 'Status'],
                                      ...RRN.map(data => { const values = Object.values(data); return [(values[0] ? values[0] : 'N/A'), this.currencyPipe.transform(values[1], 'INR'), values[2]]; })
                                    ]
                                  },
                                }
                            ]
                          ]
                        },
                        layout: 'noBorders'
                      }
                    ],
                    [
                      {
                        table: {
                          widths: [135, 135],
                          body: [
                            ['Status', txn.status]
                          ]
                        },
                        layout: 'noBorders'
                      }
                    ],
                    [
                      {
                        table: {
                          widths: [135, 135],
                          body: [
                            ['Shop Name', txn.shop_name]
                          ]
                        },
                        layout: 'noBorders'
                      }
                    ],
                    [
                      {
                        table: {
                          widths: [135, 135],
                          body: [
                            ['Shop Mobile No', txn.shop_mobile]
                          ]
                        },
                        layout: 'noBorders'
                      }
                    ]
                  ]
                },
                layout: {
                  paddingLeft: function (i, node) { return 15; }
                }
              }
            ],
            styles: {
              tableHeader: {
                bold: true,
                fontSize: 1,
                color: '#0e989a'
              }
            }
          }

          pdfMake.createPdf(docDefinition).download('Receipt');

          this.ngxSpinner.hide('reportSpinner');
        }))
        .subscribe(
          (res: any) => {
            // console.log('Shop Name URL Response: ', res);
            txn.shop_name = res.shopName;
            txn.shop_mobile = res.mobileNumber;
          },
          (err: any) => {
            // console.log('Shop Name URL Error: ', err);
          }
        );

    }
    else if (this.dmtreporttype == "DMTG") {
      const encUrl = await AuthConfig.config.encodeUrl(ReportsApi.url.shopName2);
      this.reportService.fetchuserAPI(encUrl)
        .pipe(finalize(async () => {
          let docDefinition = {
            pageSize: 'A6',
            pageMargins: [0, 0, 0, 0],
            content: [
              {
                style: 'tableExample',
                fillColor: '#f5f9f9',
                table: {
                  widths: [140],
                  body: [
                    [
                      [
                        {
                          style: 'tableExample',
                          margin: [30, 0, 0, 0],
                          table: {
                            widths: [140, 140],
                            body: [
                              [
                                {
                                  image: await this.demo3(this.demo2),
                                  //   style: 'tableHeader',
                                  alignment: 'left',
                                  margin: [0, 0, 0, 3],
                                  fit: [25, 25]
                                },
                                {
                                  text: this.datePipe.transform(txn.createdDate, 'medium'),
                                  alignment: 'right',
                                  margin: [0, 0, 30, 5],
                                  fontSize: 5
                                }
                              ],
                              [
                                {
                                  table: {
                                    widths: [100],
                                    body: [
                                      [
                                        {
                                          text: 'Customer Details',
                                          color: '#000000',
                                          bold: true,
                                          margin: [0, 0, 0, 0],
                                          border: [false, false, false, true],
                                          fontSize: 5
                                        }
                                      ]
                                    ]
                                  },
                                  margin: [0, 0, 0, 10],
                                  layout: {
                                    hLineWidth: function (i, node) {
                                      return (i === 0 || i === node.table.body.length) ? 1 : '';
                                    },
                                    hLineColor: function (i, node) {
                                      return '#000000';
                                    },
                                    hLineStyle: function (i, node) {
                                      return { dash: { length: 3, space: 3 } };
                                    },
                                    paddingLeft: function (i, node) { return 0; }
                                  }
                                },
                                {
                                  table: {
                                    widths: [100],
                                    body: [
                                      [
                                        {
                                          text: 'Benificiary Details',
                                          color: '#000000',
                                          margin: [2, 0, 0, 0],
                                          border: [false, false, false, true],
                                          fontSize: 5
                                        }
                                      ]
                                    ]
                                  },
                                  margin: [0, 0, 0, 10],
                                  layout: {
                                    hLineWidth: function (i, node) {
                                      return (i === 0 || i === node.table.body.length) ? 1 : '';
                                    },
                                    hLineColor: function (i, node) {
                                      return '#000000';
                                    },
                                    hLineStyle: function (i, node) {
                                      return { dash: { length: 3, space: 3 } };
                                    },
                                    paddingLeft: function (i, node) { return 0; }
                                  }
                                }
                              ],
                              [
                                {
                                  text: txn.customerName,
                                  bold: true,
                                  margin: [0, 0, 0, 0],
                                  fontSize: 0
                                },
                                {
                                  text: txn.beneName,
                                  bold: true,
                                  margin: [0, 0, 0, 2],
                                  fontSize: 5
                                }
                              ],
                              [
                                {
                                  text: 'Mob No.: ' + txn.customerMobileNumber,
                                  color: '#000000',
                                  fontSize: 5,
                                  bold: true,
                                },
                                {
                                  text: 'A/C No.: ' + txn.beneAccountNumber,
                                  color: '#000000',
                                  fontSize: 5,
                                  bold: true,
                                }
                              ],
                              [
                                {
                                  text: ''
                                },
                                {
                                  text: 'Bank Name: ' + txn.beneBankName,
                                  color: '#000000',
                                  bold: true,
                                  fontSize: 5
                                }
                              ],
                              [
                                {
                                  text: ''
                                },
                                {
                                  text: 'IFSC: ' + txn.bene_ifsc ? txn.bene_ifsc : '',
                                  color: '#000000',
                                  bold: true,
                                  fontSize: 3
                                }
                              ],
                            ],
                          },
                          layout: 'noBorders'
                        }
                      ]

                    ]
                  ],
                },
                layout: 'noBorders'
              },
              {
                style: 'tableExample',
                margin: [5, 0, 5, 0],
                fontSize: 6,
                table: {
                  widths: [265],

                  body: [
                    [
                      {
                        table: {
                          widths: [135, 135],
                          body: [
                            ['Date', this.datePipe.transform(txn.createdDate, 'medium')]
                          ]
                        },
                        layout: 'noBorders'
                      }
                    ],
                    [
                      {
                        table: {
                          widths: [135, 135],
                          body: [
                            ['Transaction ID', txn.Id],
                          ]
                        },
                        layout: 'noBorders',

                      }
                    ],
                    [
                      {
                        table: {
                          widths: [135, 135],
                          body: [
                            ['Transaction Mode', txn.operationPerformed]
                          ]
                        },
                        layout: 'noBorders'
                      }
                    ],
                    [
                      {
                        table: {
                          widths: [135, 135],
                          body: [
                            ['Amount', this.currencyPipe.transform(txn.amountTransacted, 'INR')]
                          ]
                        },
                        layout: 'noBorders'
                      }
                    ],
                    [
                      {
                        table: {
                          widths: [65, 65],
                          body: [
                            ['Details',
                              (RRN === 'N/A') ? 'N/A' :
                                {
                                  table: {
                                    widths: [45, 55, 62],
                                    body: [
                                      ['RRN', 'Amount', 'Status'],
                                      ...RRN.map(data => { const values = Object.values(data); return [(values[0] ? values[0] : 'N/A'), this.currencyPipe.transform(values[1], 'INR'), values[2]]; })
                                    ]
                                  },
                                }
                            ]
                          ]
                        },
                        layout: 'noBorders'
                      }
                    ],
                    [
                      {
                        table: {
                          widths: [135, 135],
                          body: [
                            ['Shop Name', txn.shop_name]
                          ]
                        },
                        layout: 'noBorders'
                      }
                    ],
                    [
                      {
                        table: {
                          widths: [135, 135],
                          body: [
                            ['Shop Mobile No', txn.shop_mobile]
                          ]
                        },
                        layout: 'noBorders'
                      }
                    ]
                  ]
                },
                layout: {
                  paddingLeft: function (i, node) { return 15; }
                }
              }
            ],
            styles: {
              tableHeader: {
                bold: true,
                fontSize: 1,
                color: '#0e989a'
              }
            }
          }

          pdfMake.createPdf(docDefinition).download('Receipt');

          this.ngxSpinner.hide('reportSpinner');
        }))
        .subscribe(
          (res: any) => {
            // console.log('Shop Name URL Response: ', res);
            txn.shop_name = res.shopName;
            txn.shop_mobile = res.mobileNumber;
          },
          (err: any) => {
            // console.log('Shop Name URL Error: ', err);
          }
        );
    }
  }
  getImage(masterName: string) {
    this.fireStore.collection('customMDBrands').ref.where('name', '==', masterName.toLowerCase()).onSnapshot(
      query => {
        const typeNEW = query.empty ? 'ADMIN_PROFILE' : 'MASTERDISTRIBUTOR_PROFILE';
        const BRANDNAMENOW = query.empty ? this.userData.userInfo.adminName : masterName;

        const aks1 = this.imageData.url = `https://firebasestorage.googleapis.com/v0/b/iserveu_storage/o/${typeNEW}%2F${BRANDNAMENOW}%2FprofileImg.png?alt=media&token=2bc9b5da-1985-4152-8cc3-45ebc1b72ab6`;
        this.demo = this.imageData.url;
        // console.log(typeNEW);
        // console.log(BRANDNAMENOW);
        // console.log(this.demo);
        // console.log(aks1);
        toDataURL(aks1)
          .then(dataUrl => {
            // console.log('RESULT:', dataUrl);
            // this.demo2 = dataUrl;
            if (
              dataUrl != "data:application/json;base64,ewogICJlcnJvciI6IHsKICAgICJjb2RlIjogNDA0LAogICAgIm1lc3NhZ2UiOiAiTm90IEZvdW5kLiIKICB9Cn0="
            ) {
              this.demo2 = dataUrl;
            } else {
              this.demo2 = "https://firebasestorage.googleapis.com/v0/b/iserveu_storage/o/AdminFolder%2FinHouse%2Fphoto.png?alt=media&token=b0198a05-5988-4469-bdce-d52afb30ff19";
            }
          })

      }
    );
    const toDataURL = url => fetch(url)
      .then(response => response.blob())
      .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      }))

  }
  demo3(url) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute("crossOrigin", "anonymous");
      img.onload = () => {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      };
      img.onerror = error => {
        reject(error);
      };
      img.src = url;
      // console.log(img.src);

    });

  }

  // For Updating the records table according to selection in the selective dropdown columns as per user interaction.
  showCols(option: any) {
    // console.log('Option Selected: ', option);
    if (option.includes('all') || (option.length === 0)) {
      this.tableCols = this.selCols;
    } else {
      this.tableCols = this.selCols.filter(col => option.includes(col.prop));
    }
    // IF user has already set any selective cols, then update the cols data else set a new one.
    const selectiveCols = localStorage.getItem(`selectiveColumns_${this.userName}`) ? { ...JSON.parse(localStorage.getItem(`selectiveColumns_${this.userName}`)), [this.persistentData.type]: option } : { [this.persistentData.type]: option };
    localStorage.setItem(`selectiveColumns_${this.userName}`, JSON.stringify(selectiveCols));
  }

  // Update the records automatically when the new records are fetched, if user has already set columns data.
  setUserColData() {

    if (localStorage.getItem(`selectiveColumns_${this.userName}`)) {
      setTimeout(() => {
        const cols = JSON.parse(localStorage.getItem(`selectiveColumns_${this.userName}`));
        // Check if the user has set any cols for this report type
        if (cols[this.persistentData.type]) {
          this.showCols(cols[this.persistentData.type]);
          this.selectiveCols.setValue(cols[this.persistentData.type]);
        }
      }, 500);
    }

  }

  transDetail(txnDetail: any) {
    // console.log('Trans Detail: ', txnDetail);
    this.trxId = txnDetail.gatewayId
    this.trxSlice = parseInt(this.trxId.slice(1))
    const { Id, createdDate } = txnDetail;
    let data = Id.replace("#", "")
    // console.log('Txn ID: ', data);
    // console.log('Txn Date: ', createdDate);
    // console.log('Txn Date Piped: ', this.datePipe.transform(createdDate, 'yyyy-MM-dd'));
    // const user: {sub: string} = jwt_decode(sessionStorage.getItem('CORE_SESSION'));

    const created_date = this.datePipe.transform(createdDate, 'yyyy-MM-dd');

    const reportData = {
      "$1": "dmt_gateway_details_report",

      "$4": created_date,

      "$5": created_date,

      "$15": [

        this.trxSlice

      ]
    };

    this.ngxSpinner.show("reportSpinner", { bdColor: "rgba(0, 0, 0, 0.5)", type: "timer" });
    this.reportService.transactionAPI(ReportsApi.url.dmt2.all_trans, reportData)
      .pipe(finalize(() => { this.ngxSpinner.hide("reportSpinner"); }))
      .subscribe(
        (res: any) => {
          // console.log('Txn Report Response: ', res);
          // console.log('Txn Reports: ', res.Report);
          if (res.Report.length) {
            this.txnDetailReport.reports = res.Report;
          }
          this.txnDetailsModal.show();
        },
        (err: any) => {
          // console.log('Txn Report Error: ', err);
        }
      );


  }

  showRetries(transDetail: any) {
    // console.log('Transaction Details: ', transDetail);
    this.retryDataDMT2.transData = transDetail;

    this.retryModal.show();

  }

  showRefunds(transDetail: any) {
    // console.log('Transaction Details: ', transDetail);
    this.refundDataDMT2.transData = transDetail;

    this.refundModal.show();

  }

  getRefundTxn(txnID: any) {
    // console.log('Refund ID: ', txnID);
    this.refundDataDMT2.refundTxnID = txnID;
    this.storetxn = txnID;
    this.otpForm.reset();
    this.otpModal.show();
    this.getShopName();
  }

  // Autofocus next valid OTP Input
  otpClick(e, prevBox, nextBox) {
    if (nextBox && e.data) { nextBox.focus(); }
    if (prevBox && !e.data) { prevBox.focus(); }
  }

  handleEvent(cdEvent: any) {
    if (cdEvent.action === 'done') {
      this.refundDataDMT2.showTimer = false;
    }
  }


  verifyRefundOTP() {

    // const otp = Object.values(this.otpForm.value).join('');
    const otp = this.otpForm.value.otpfield;
    const transactionId = this.refundDataDMT2.refundTxnID;

    if (this.otpForm.valid) {

      this.ngxSpinner.show("verifyRefundOTPSpinner", { bdColor: "rgba(0, 0, 0, 0.5)", type: "timer" });
      this.reportService.verifyRefundOTP({ transactionId, otp })
        .pipe(finalize(() => {
          setTimeout(() => {
            this.refundDataDMT2.otpMessage = '';
            this.refundDataDMT2.otpStatus = undefined;
          }, 5000);
          this.ngxSpinner.hide('verifyRefundOTPSpinner');
        }))
        .subscribe(
          (res: any) => {
            // console.log('Refund Verify OTP Res: ', res);

            this.fetchNotifications();
            this.otpModal.hide();
            this.refundModal.hide();
            this.refundModal1.hide();
            // Re-fetch DMT2 Report
            this.fetchingReport = true;
            this.fetchDmt2Report(this.refundDataDMT2.reportData);

            vex.dialog.alert(res.statusDesc);
          },
          (err: any) => {
            // console.log('Refund Verify OTP Error: ', err);
            this.refundDataDMT2.otpStatus = err.error.status;
            this.refundDataDMT2.otpMessage = err.error.statusDesc;
            // vex.dialog.alert(err.error.statusDesc);
          }
        );

    } else {
      vex.dialog.alert('Please, Enter OTP.');
    }


  }

  resendRefundOTP() {
    this.ngxSpinner.show("refundResendSpinner", { bdColor: "rgba(0, 0, 0, 0.5)", type: "timer" });
    this.reportService.resendRefundOTP(this.refundDataDMT2.refundTxnID.id)
      .pipe(finalize(() => {
        setTimeout(() => {
          this.refundDataDMT2.otpMessage = '';
          this.refundDataDMT2.otpStatus = undefined;
        }, 5000);
        this.otpForm.reset();
        this.ngxSpinner.hide('refundResendSpinner');
      }))
      .subscribe(
        (res: any) => {
          // console.log('Refund Resend Res: ', res);
          this.refundDataDMT2.otpStatus = res.status;
          this.refundDataDMT2.otpMessage = res.statusDesc;
          this.refundDataDMT2.showTimer = true;

          setTimeout(() => {
            this.otpCountdown.restart();
            this.otpCountdown.begin();
          }, 100);
        },
        (err: any) => {
          // console.log('Refund Resend Error: ', err);
          this.refundDataDMT2.otpStatus = err.error.status;
          this.refundDataDMT2.otpMessage = err.error.statusDesc;
          // vex.dialog.alert(err.error.statusDesc);
        }
      );
  }

  // MODAL SHOW CODE
  showTransModal(status = 'SUCCESS') {
    // console.log('Trans Status: ', this.socketData.status);
    this.socketData.status = status;
    this.transModal.show();
  }

  connectThenRetry(txnID: number) {

    if (txnID) {
      this.retryDataDMT2.retrying = true;
      // Assign the retry trans ID, so that it can be accessible to retryTrans()
      this.retryDataDMT2.retryTxnID = txnID;
      // this.retryDataDMT2.retryTxnID = 828028636028944;

      // this.connectSocket();
    }

  }

  retryTrans(txnID: number) {
    // console.log('Retry ID: ', txnID);

    // this.connectSocket();

    this.reportService.transRetryAPI(txnID)
      .subscribe(
        (res: any) => {
          // console.log('Manual Retry Response: ', res);

        },
        (err: any) => {
          // console.log('Manual Retry Error: ', err);
          this.transferErr = true;
          this.retryDataDMT2.retrying = false;
          // if (this.socketService2.isConnected) { this.socketService2.disconnectSocket(); }
          // vex.dialog.alert(err.error.statusDesc);
        }
      );
  }

  reloadRetryTable() {
    this.fetchingReport = true;
    this.retryModal.hide();
    this.fetchDmt2Report(this.retryDataDMT2.reportData);
  }

  // Check Type in case of Gateway Data changes in report
  // As the data will be in String or Array
  checkType(val: any) {
    return typeof val;
  }

  showGatewayData(txnData: any) {
    // console.log('Txn Data for Gateway: ', txnData);
    this.transRecord = txnData;
    this.gatewayModal.show();
  }

  // Get RRN of a Transaction
  getRRN(txnID: string) {
    // console.log('RRN Data Fetched: ', new Date());
    this.reportService.fetchRRN(txnID)
      // this.fundTransferService.fetchRRN("823438505072926720")
      .subscribe(
        (res: any) => {
          // console.log('Fetch RRN Response: ', res);

          // this.socketData.rrn = res.map(data => { return { rrn: (data.rrn ? data.rrn : 'N/A'), amount: data.amount, status: data.status } });
          this.socketData.rrn = res
            .filter(data => data.id == this.retryDataDMT2.retryTxnID)
            .map(data => {
              return { rrn: (data.rrn ? data.rrn : 'N/A'), amount: data.amount, status: data.status }
            });
          // console.log('RRN Data: ', [['RRN', 'Amount', 'Status'], ...this.socketData.rrn.map(data => { const values = Object.values(data); return [values[0], this.currencyPipe.transform(values[1], 'INR'), values[2]]; })]);
        },
        (err: any) => {
          // console.log('Fetch RRN Error: ', err);
          if (err.status === 400) {
            vex.dialog.alert(err.error.statusDesc);
          } else {
            vex.dialog.alert('Server Error.');
          }
        }
      );
  }

  async lostmob() {
    this.ngxSpinner.show("senderSpinner1", { bdColor: "rgba(0, 0, 0, 0.5)", type: "timer" });
    this.ngxSpinner.show("senderSpinner1");
    this.ngxSpinner.show("senderSpinner1", { bdColor: "rgba(0, 0, 0, 0.5)", type: "timer" });
    // console.log(this.storetxn);
    // console.log(this.shopres);
    // console.log(this.customerform.value.mobileNumber);
    var lostmobreq = {
      "file": {
        "name": "DMT",
        "templateId": "KSBU9I3",
        "fields": [
          {
            "id": "1631677665518",
            "name": "Admin Name",
            "type": "text",
            "value": `${this.userData.userInfo.adminName}`,
            "required": false
          },
          {
            "id": "1631678373555",
            "name": "Admin Name",
            "type": "text",
            "value": `${this.userData.userInfo.adminName}`,
            "required": false
          },
          {
            "id": "1631678373556",
            "name": "Admin Name",
            "type": "text",
            "value": `${this.userData.userInfo.adminName}`,
            "required": false
          },
          {
            "id": "1631678373557",
            "name": "Admin Name",
            "type": "text",
            "value": `${this.userData.userInfo.adminName}`,
            "required": false
          },
          {
            "id": "1631678373558",
            "name": "Admin Name",
            "type": "text",
            "value": `${this.userData.userInfo.adminName}`,
            "required": false
          },
          {
            "id": "1631677760801",
            "name": "Admin City",
            "type": "text",
            "value": `${this.shopres.address}`,
            "required": false
          },
          {
            "id": "1631677946097",
            "name": "Name",
            "type": "text",
            "value": "N/A",
            "required": false
          },
          {
            "id": "1631677970747",
            "name": "Enrolled Mobile Number",
            "type": "text",
            "value": "N/A",
            "required": false
          },
          {
            "id": "1631677996637",
            "name": "Amount",
            "type": "text",
            "value": this.storetxn.amount,
            "required": false
          },
          {
            "id": "1631678013556",
            "name": "Date",
            "type": "text",
            "value": this.datePipe.transform(this.storetxn.createdDate, 'medium'),
            "required": false
          },
          {
            "id": "1631678035805",
            "name": "Transaction ID",
            "type": "text",
            "value": this.storetxn.id,
            "required": false
          },
          {
            "id": "1631678069187",
            "name": "Receipent Name",
            "type": "text",
            "value": "N/A",
            "required": false
          },
          {
            "id": "1631678109988",
            "name": "Receipent Bank Name",
            "type": "text",
            "value": this.storetxn.beneBankName,
            "required": false
          },
          {
            "id": "1631678154511",
            "name": "Account No",
            "type": "text",
            "value": this.storetxn.beneAccountNumber,
            "required": false
          },
          {
            "id": "1631678189305",
            "name": "Merchant Name",
            "type": "text",
            "value": this.shopres.username,
            "required": false
          },
          {
            "id": "1631678214695",
            "name": "Registered Mobile No.",
            "type": "text",
            "value": this.shopres.mobileNumber,
            "required": false
          },
          {
            "id": "1631678246915",
            "name": "New OTP Mobile",
            "type": "text",
            "value": this.shopres.mobileNumber,
            "required": false
          },
          {
            "id": "1631678230263",
            "name": "CSP Code",
            "type": "text",
            "value": this.shopres.firstName,
            "required": false
          },
          {
            "id": "1631678347888",
            "name": "CSP Signature",
            "type": "text",
            "value": "N/A",
            "required": false
          },
          {
            "id": "1631678373534",
            "name": "Date of Esign",
            "type": "text",
            "value": this.datePipe.transform(this.storetxn.createdDate, 'medium'),
            "required": false
          }
        ]
      },
      "irn": "256257456242443",
      "invitees": [
        {
          "name": "N/A",
          "email": this.shopres.email,
          "phone": this.shopres.mobileNumber,
          "webhook": {
            "success": "https://dmttest.iserveu.online/GATEWAY-v2/legality",
            "version": 2.1
          },
          "redirectUrl": "https://newcoreretailerprod.web.app/#/v1/fundtransfer?tid=" + this.storetxn.id,
          "signatures": [{
            "type": "VIRTUAL_SIGN"
          }]
        }
      ]
    }
    this.reportService.verifylostmob(lostmobreq)
      .pipe(finalize(() => {
      }))
      .subscribe(
        (res: any) => {
          this.ngxSpinner.hide("senderSpinner1");
          window.location.href = res.message.invitations[0].signUrl;
        },
        (err: any) => {// Customer not registered
          if (err.status === 400) {
            vex.dialog.alert(err.error.statusDesc);
          } else {
            vex.dialog.alert('Server Error');
          }
        }
      );

  }

  //   async lostmob(){
  //     // console.log(this.storetxn);
  //     // console.log(this.shopres);
  //     // console.log(this.customerform.value.mobileNumber);
  //     var lostmobreq ={
  //         "file": {
  //             "name": "DMT",
  //             "templateId": "s54CsqI",
  //             "fields": [
  //                 {
  //                     "id": "1630401839919",
  //                     "name": "Admin Name",
  //                     "type": "text",
  //                     "value": `${this.userData.userInfo.adminName}`,
  //                     "required": false
  //                 },
  //                 {
  //                     "id": "1630402985884",
  //                     "name": "Admin Name",
  //                     "type": "text",
  //                     "value": `${this.userData.userInfo.adminName}`,
  //                     "required": false
  //                 },
  //                 {
  //                     "id": "1630402985885",
  //                     "name": "Admin Name",
  //                     "type": "text",
  //                     "value": `${this.userData.userInfo.adminName}`,
  //                     "required": false
  //                 },
  //                 {
  //                     "id": "1630402985886",
  //                     "name": "Admin Name",
  //                     "type": "text",
  //                     "value": `${this.userData.userInfo.adminName}`,
  //                     "required": false
  //                 },
  //                 {
  //                     "id": "1630401949590",
  //                     "name": "Admin City",
  //                     "type": "text",
  //                     "value": `${this.shopres.address}`,
  //                     "required": false
  //                 },
  //                 {
  //                     "id": "1630401975975",
  //                     "name": "Customer Firstname",
  //                     "type": "text",
  //                     "value": "customeformvalue",
  //                     "required": false
  //                 },
  //                 {
  //                     "id": "1630401994836",
  //                     "name": "Customer Lastname",
  //                     "type": "text",
  //                     "value": "customeformvalue",
  //                     "required": false
  //                 },
  //                 {
  //                     "id": "1630402023017",
  //                     "name": "Enrolled Mobile Number",
  //                     "type": "text",
  //                     "value": "customeformvalue",
  //                     "required": false
  //                 },
  //                 {
  //                     "id": "1630402043499",
  //                     "name": "Otp Mobile",
  //                     "type": "text",
  //                     "value": this.shopres.mobileNumber,
  //                     "required": false
  //                 },
  //                 {
  //                     "id": "1630402083568",
  //                     "name": "Amount",
  //                     "type": "text",
  //                     "value": this.storetxn.amount,
  //                     "required": false
  //                 },
  //                 {
  //                     "id": "1630402152372",
  //                     "name": "Transaction Date",
  //                     "type": "text",
  //                     "value": this.datePipe.transform(this.storetxn.createdDate, 'medium'),
  //                     "required": false
  //                 },
  //                 {
  //                     "id": "1630402112700",
  //                     "name": "Transaction ID",
  //                     "type": "text",
  //                     "value": this.storetxn.id,
  //                     "required": false
  //                 },
  //                 {
  //                     "id": "1630402130776",
  //                     "name": "Receipent Name",
  //                     "type": "text",
  //                     "value": "Xyz",
  //                     "required": false
  //                 },
  //                 {
  //                     "id": "1630402178148",
  //                     "name": "Receipent Bank Name",
  //                     "type": "text",
  //                     "value": this.storetxn.transactedBankName,
  //                     "required": false
  //                 },
  //                 {
  //                     "id": "1630402203332",
  //                     "name": "Receipent Account No",
  //                     "type": "text",
  //                     "value": this.storetxn.beneAccountNumber,
  //                     "required": false
  //                 },
  //                 {
  //                     "id": "1630402221310",
  //                     "name": "Customer ID Proof No",
  //                     "type": "text",
  //                     "value": "41241254141",
  //                     "required": false
  //                 },
  //                 {
  //                     "id": "1630402275655",
  //                     "name": "Merchant First Name",
  //                     "type": "text",
  //                     "value": this.shopres.username,
  //                     "required": false
  //                 },
  //                 {
  //                     "id": "1630402294875",
  //                     "name": "Merchant Lastname",
  //                     "type": "text",
  //                     "value": this.shopres.username,
  //                     "required": false
  //                 },
  //                 {
  //                     "id": "1630402307992",
  //                     "name": "Merchant Mobile No",
  //                     "type": "text",
  //                     "value": this.shopres.mobileNumber,
  //                     "required": false
  //                 },
  //                 {
  //                     "id": "1630402321187",
  //                     "name": "CSP Code",
  //                     "type": "text",
  //                     "value": "1231312",
  //                     "required": false
  //                 },
  //                 {
  //                     "id": "1630402340641",
  //                     "name": "Customer Name",
  //                     "type": "text",
  //                     "value":"customeformvalue",
  //                     "required": false
  //                 },
  //                 {
  //                     "id": "1630402358895",
  //                     "name": "Date",
  //                     "type": "text",
  //                     "value": this.datePipe.transform(this.storetxn.createdDate, 'medium'),
  //                     "required": false
  //                 }
  //             ]
  //         },
  //                 "irn": "256257456242443",
  //         "invitees": [
  //             {
  //                 "name": "customeformvalue",
  //                 "email": this.shopres.email,
  //                 "phone": this.shopres.mobileNumber,
  //                 "webhook": {
  //                     "success": "https://33eb-182-78-141-50.ngrok.io/callbackForLeegality/sucWebhook",
  //                     "version": 2.1
  //                 },
  //                 "redirectUrl": "https://newcoreretailerprod.web.app/v1/fundtransfer"
  //             }
  //         ]
  //     }
  //     // console.log(lostmobreq);

  //     // this.reportService.verifylostmob(lostmobreq)
  //     // .pipe(finalize(() => { 
  //     // }))
  //     // .subscribe(
  //     //     (res: any) => {                     
  //     //          window.location.href = res.message.data.invitations[0].signUrl;
  //     //     },
  //     //     (err: any) => {// Customer not registered
  //     //         if (err.status === 400) {
  //     //             vex.dialog.alert(err.error.statusDesc);
  //     //         } else {
  //     //             vex.dialog.alert('Server Error');
  //     //         }
  //     //     }
  //     // );

  // }


  // Get Shop Name of an User
  async getShopName() {

    const encUrl = await AuthConfig.config.encodeUrl(this.reportService.SHOP_URL);
    this.reportService.fetchShopName2(encUrl)
      .subscribe(
        (res: any) => {
          return this.shopres = res;
          // console.log('Shop Name in FT2 Res: ', res);

          this.socketData.shop_name = res.shopName;
        },
        (err: any) => {
          // console.log('Shop Name in FT2 Error: ', err);
          if (err.status === 400) {
            // this.socketData.shop_name = err.error.shopName;
            // vex.dialog.alert(err.error.statusDesc);
          } else {
            vex.dialog.alert('Server Error.');
          }
        }
      );
  }

  fetchNotifications() {
    // const user: {sub: string} = jwt_decode(sessionStorage.getItem('CORE_SESSION'));
    const notiApiFeed = {
      "product_name": "Global",
      "user_name": this.userName,
      // "user_name": user.sub,
      type: '',
      page: 1,
      "limit": "10"
    };
    this.appService.fetchNotifications(notiApiFeed)
      .pipe(finalize(() => {
        // this.fetchingNotifs = false;
      }))
      .subscribe(
        (res: any) => {
          // console.log('Notifications API Res: ', res);
          this.storage.set('notifications', res.data).subscribe(() => { });
          // this.notiResponse = res;
        },
        (err: any) => {
          // console.log('Notifications API Error: ', err);
          this.storage.set('notifications', []).subscribe(() => { });
          // console.log('Notifications API Error Status: ', err.status);
          // this.showNotifs = false; // Reset Notification Flag
          // vex.dialog.alert({
          //     unsafeMessage: `
          //         <div class="d-flex flex-column">
          //             <b>Notification Fetching Failed.</b>
          //             <small>${err.message}</<small>
          //         </div>
          //     `
          // });
        }
      );
  }

  generatePDF(action = 'open') {

    let docDefinition = {
      pageSize: 'A4',
      pageMargins: [0, 0, 0, 0],
      content: [
        {
          style: 'tableExample',
          fillColor: '#f5f9f9',
          table: {
            widths: [595],
            body: [
              [
                [
                  {
                    style: 'tableExample',
                    margin: [40, 50, 50, 20],
                    table: {
                      widths: [250, 250],
                      body: [
                        [
                          {
                            text: 'iServeU',
                            style: 'tableHeader',
                            margin: [0, 0, 0, 25]
                          },
                          {
                            text: this.datePipe.transform(this.socketData.created_date, 'medium'),
                            alignment: 'right',
                            margin: [0, 0, 0, 25]
                          }
                        ],
                        [
                          {
                            table: {
                              widths: [200],
                              body: [
                                [
                                  {
                                    text: 'From',
                                    color: '#888888',
                                    margin: [0, 0, 0, 5],
                                    border: [false, false, false, true]
                                  }
                                ]
                              ]
                            },
                            margin: [0, 0, 0, 10],
                            layout: {
                              hLineWidth: function (i, node) {
                                return (i === 0 || i === node.table.body.length) ? 1 : '';
                              },
                              hLineColor: function (i, node) {
                                return '#888888';
                              },
                              hLineStyle: function (i, node) {
                                return { dash: { length: 3, space: 3 } };
                              },
                              paddingLeft: function (i, node) { return 0; }
                            }
                          },
                          {
                            table: {
                              widths: [200],
                              body: [
                                [
                                  {
                                    text: 'To',
                                    color: '#888888',
                                    margin: [0, 0, 0, 5],
                                    border: [false, false, false, true]
                                  }
                                ]
                              ]
                            },
                            margin: [0, 0, 0, 10],
                            layout: {
                              hLineWidth: function (i, node) {
                                return (i === 0 || i === node.table.body.length) ? 1 : '';
                              },
                              hLineColor: function (i, node) {
                                return '#888888';
                              },
                              hLineStyle: function (i, node) {
                                return { dash: { length: 3, space: 3 } };
                              },
                              paddingLeft: function (i, node) { return 0; }
                            }
                          }
                        ],
                        [
                          {
                            text: this.socketData.customer_name,
                            bold: true,
                            margin: [0, 0, 0, 4]
                          },
                          {
                            text: this.socketData.bene_name,
                            bold: true,
                            margin: [0, 0, 0, 4]
                          }
                        ],
                        [
                          {
                            text: 'Mob No.: ' + this.socketData.customer_mobile,
                            color: '#555555'
                          },
                          {
                            text: 'A/C No.: ' + this.socketData.bene_acc,
                            color: '#555555'
                          }
                        ],
                        [
                          {
                            text: ''
                          },
                          {
                            text: `Bank Name: ${this.socketData.bene_bank}`,
                            color: '#555555'
                          }
                        ],
                        [
                          {
                            text: ''
                          },
                          {
                            text: 'IFSC: ' + this.socketData.bene_ifsc,
                            color: '#555555'
                          }
                        ],
                      ],
                    },
                    layout: 'noBorders'
                  }
                ]

              ]
            ],
          },
          layout: 'noBorders'
        },
        {
          style: 'tableExample',
          margin: [40, 40, 0, 0],
          table: {
            widths: [510],
            body: [
              [
                {
                  table: {
                    widths: [150, 350],
                    body: [
                      ['Transaction ID', this.socketData.id]
                    ]
                  },
                  layout: 'noBorders'
                }
              ],
              [
                {
                  table: {
                    widths: [150, 350],
                    body: [
                      ['Transaction Mode', this.socketData.operation_performed]
                    ]
                  },
                  layout: 'noBorders'
                }
              ],
              [
                {
                  table: {
                    widths: [150, 350],
                    body: [
                      ['Amount', this.currencyPipe.transform(this.socketData.amount, 'INR')]
                    ]
                  },
                  layout: 'noBorders'
                }
              ],
              [
                {
                  table: {
                    widths: [150, 350],
                    body: [
                      ['RRN',
                        (this.socketData.status !== 'SUCCESS') ? 'N/A' :
                          {
                            table: {
                              widths: ['*', '*', '*'],
                              body: [
                                ['RRN', 'Amount', 'Status'],
                                ...this.socketData.rrn.map(data => { const values = Object.values(data); return [(values[0] ? values[0] : 'N/A'), this.currencyPipe.transform(values[1], 'INR'), values[2]]; })
                              ]
                            },
                          }
                      ]
                    ]
                  },
                  layout: 'noBorders'
                }
              ],
              [
                {
                  table: {
                    widths: [150, 350],
                    body: [
                      ['Shop Name', this.socketData.shop_name]
                    ]
                  },
                  layout: 'noBorders'
                }
              ]
            ]
          },
          layout: {
            paddingLeft: function (i, node) { return 15; }
          }
        }
      ],
      styles: {
        tableHeader: {
          bold: true,
          fontSize: 16,
          color: '#0e989a'
        }
      }
    }

    pdfMake.createPdf(docDefinition).open();
  }


  // getWalletInterchange(){
  //   this.reportService.walletInterchange().subscribe(res=>{
  //     console.log(res);
  //   })
  // }

  ngOnDestroy() {
    this.unsub.next(true);
    this.unsub.complete();

    // this.socketService2.disconnectSocket();
  }

}
