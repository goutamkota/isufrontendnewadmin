import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthConfig } from 'src/app/app-config';
import { MemberService } from '../member.service';
import * as vex from 'vex-js';
import { formatDate } from '@angular/common';
import { analytics } from 'firebase';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableService } from 'src/app/datatable.service';
import { BehaviorSubject } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { finalize } from 'rxjs/operators';
import { invalid } from '@angular/compiler/src/render3/view/util';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
@Component({
  selector: 'app-show-user',
  templateUrl: './show-user.component.html',
  styleUrls: ['./show-user.component.scss']
})
export class ShowUserComponent implements OnInit {
  public dataList: any;
  [x: string]: any;
  priActiveTab: any = 1;
  showedit: any = 1;
  leftPos: any
  utleftPos: any; tdataStr: string = "{}";
  paging = {
    data: [],
    limit: 10,
    active: 1
  };
  mychAct: any;
  uid:any;
  mychUtype: any;
  show_status: any;
  show_utype: any;
  show_name: any;
  show_status1: any;
  show_utype1: any;
  show_name1: any;
  show_unamesearch: any;
  searchreporttype: any;
  wdth: any = 0;
  utwdth: string;
  searchComplete: boolean;
  savebtn: boolean = false;
  cancelbtn: boolean = false;
  editbtn: boolean = true;
  // beneficiary = {
  //   name: <any>{},
  // };
  beneficiary: any;
  body: {};
  body1: {};
  totalRecLen: number;
  totalAmount: any = 0;
  filteredTbl: any;
  firstdata: any = [];
  seconddata: any = [];
  firstdata2: any = [];
  seconddata2: any = [];
  searchInput = new FormControl('', null);
  getUnderUser = new FormGroup({
    username: new FormControl('', Validators.required),
    usertypestatus: new FormControl(),
    activestatus: new FormControl('', Validators.required)
  });
  getUnderMe = new FormGroup({
    usertypestatus: new FormControl('', Validators.required),
    activestatus: new FormControl('', Validators.required)
  });

  getUserDetail = new FormGroup({
    username: new FormControl('', Validators.required)
  });
  recentlyOnboarded = new FormGroup({
    reporttype: new FormControl('0', Validators.required)
  });

  get f() { return this.EditUserForm.controls; }

  EditUserForm = new FormGroup({
    fname: new FormControl('', [Validators.required, Validators.pattern('^[A-Za-z]+$')]),
    lname: new FormControl('',[ Validators.required,Validators.pattern('^[A-Za-z]+$')]),
    mail: new FormControl('', [Validators.required,Validators.email]),
    mobile: new FormControl('',[Validators.required,Validators.pattern('^[0-9]{10}$')]),
    address: new FormControl('', [Validators.required,Validators.pattern('^[A-Za-z]+$')]),
    city: new FormControl('', [Validators.required, Validators.pattern('^[A-Za-z]+$')]),
    state: new FormControl('', [Validators.required,Validators.pattern('^[A-Za-z]+$')]),
    shopname: new FormControl('', [Validators.required,Validators.pattern('^[A-Za-z]+$')]),
    aadhar: new FormControl('', Validators.required),
    panCard: new FormControl('', Validators.required),
  })

  searching: boolean = false;
  // tblColumns = ['userName','agentName','old_w1_balance', 'w2_balance','w1_balance', 'total_balance', 'mobileNumber','emailid','userType','parentUser','createdDate','adminName','planName'];
  strMinify = { 'len': 20, 'col': ['userName', 'agentName'] };
  tableOptions = {
    colors: { vibrant: '#4680ff', darkvibrant: '#4680ff' },
    excel: 'users',
    pageLimitOptions: [50],
    defaultLimit: 50,
    customText: ''
  };
  apiDataCount: number;
  apiBody = {};
  apiUrl: string;
  showModal: boolean;
  modalType: string;
  modalData: any;
  userDetails: any;
  edituserdetails = true;
  beneform: FormGroup;
  beneform1: FormGroup;
  feature: FormGroup;
  displayfeatureName:FormGroup;
  getfirestfeature: [];
  getadmin: any;
  getsecondfeature: [];
  getdisplayfeature: [];
  getflag = false;
  finalfeature: any;
  finalfeature1: any;
  finalfeature2: any;
  displayuserfeature2:any;
  userid: any;
  sendotpflag = true;
  approvalProperties: any;
  noData: boolean;
  username_admin: any
  adminflag = false;
  backflag = true;
  AllChildrenUnderMeBtn: any;

  constructor(
    private MemberService: MemberService,
    private http: HttpClient,
    private appservice: AppService,
    private router: Router,
    private ngxSpinner: NgxSpinnerService,
    private storage: AngularFireStorage,
    private db: AngularFirestore
  ) { }

  ngOnInit() {
    this.userDetails = JSON.parse(sessionStorage.getItem('dashboardData'));
    // this.getParentTotalCore();
    this.forminitialization();
   // this.displayfeature();
   
  }
  
 forminitialization() {
    this.beneform = new FormGroup({
      password: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(10), Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/)])
    });
    this.beneform1 = new FormGroup({
      password1: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern(/^[0-9]*$/)])
    });
    this.feature = new FormGroup({});
    this.displayfeatureName = new FormGroup({});
  }
  activeStatus(v: string) {
    this.leftPos = parseInt(v);
  }
  usertypestatus(v: string) {
    this.utleftPos = v;
  }
  async getParentTotalCore() {
    //  let api = 'https://us-central1-iserveustaging.cloudfunctions.net/showUser5Api/api/v1/parenttotalCore';
    let api = 'https://us-central1-iserveustaging.cloudfunctions.net/showUser3Api/api/v1/parenttotalCore';
    let un, ut, ua, body;
    un = this.getUnderUser.get('username').value;
    ut = (this.getUnderUser.get('usertypestatus').value) ? [this.getUnderUser.get('usertypestatus').value] : false;
    ua = (this.getUnderUser.get('activestatus').value == 0) ? 'true' : 'false';

    body = { "userName": this.userDetails.userInfo.userName, "active": ua, "parentUsername": un, "type": "production" };
    (ut) ? body['userType'] = ut : '';
    var url = await AuthConfig.config.encodeUrl(api)
    this.MemberService.members(url, body)
      .subscribe(
        (res: any) => {
          this.dataList = res;
          this.noData = false;
          this.apiDataCount = res.data[0].count;
          this.totalAmount = res.Total_balance;
          this.tableOptions.customText = '<strong>Total Amount ₹' + this.totalAmount.toFixed(2) + '</strong>   |   Total Records ' + this.apiDataCount;
          this.searching = false;
          this.searchComplete = true;
        },
        (err: any) => {
          this.searching = false;
        }
      )
  }
  async pay_req() {
    this.searching = true;
    var user_Name = JSON.parse(sessionStorage.getItem('dashboardData')).userInfo.userName;

    // var admin_Name = JSON.parse(sessionStorage.getItem('dashboardData'));
    // console.log(admin_Name, "admin name is");

    let api = 'https://wallet-topup-new-prod-vn3k2k7q7q-uc.a.run.app/users/assign_payment_request';
    // let un,ut,ua, userD;
    var body;
    if (this.approvalProperties == "parent") {
      body = { "userName": this.username_admin, "paymentReqType": "case1", "loginUser": user_Name, "userRole": "ROLE_ADMIN" };
    }
    else if (this.approvalProperties == "admin") {
      body = { "userName": this.username_admin, "paymentReqType": "case2", "loginUser": user_Name, "userRole": "ROLE_ADMIN" };
    }
    else if (this.approvalProperties == "adminIser") {
      body = { "userName": this.username_admin, "paymentReqType": "case3", "loginUser": user_Name, "userRole": "ROLE_ADMIN" };
    }
    else if (this.approvalProperties == "iserveu") {
      body = { "userName": this.username_admin, "paymentReqType": "case4", "loginUser": user_Name, "userRole": "ROLE_ADMIN" };
    }
    var url = await AuthConfig.config.encodeUrl(api)
    this.MemberService.members(url, body)
      .subscribe(
        (res: any) => {
          //  console.log(res, "response is:");
         vex.dialog.alert(res.message);
          this.searching = false;

          // this.apiDataCount = res.data[0].count;
          // this.totalAmount = res.Total_balance;
          // this.tableOptions.customText = '<strong>Total Amount ₹'+ this.totalAmount.toFixed(2) + '</strong>   |   Total Records '+ this.apiDataCount;
          // console.log("apiDataCount",this.apiDataCount);
          // this.searching = false;
          // this.searchComplete = true;
        },
        (err: any) => {
          this.searching = false;
          // console.log(err,"error is:");
        }
      )
  }
  async getShowTotalCore() {
    //  let api = 'https://us-central1-iserveustaging.cloudfunctions.net/showUser5Api/api/v1/showusertotalCore';
    let api = 'https://us-central1-iserveustaging.cloudfunctions.net/showUser3Api/api/v1/showusertotalCore';
    let un, ut, ua, userD, body;
    userD = JSON.parse(sessionStorage.getItem('dashboardData'));
    un = userD.userInfo.userName;
    // ut = this.getUnderMe.get('usertypestatus').value;
    ua = (this.getUnderMe.get('activestatus').value === '0') ? 'true' : 'false';
    ut = (this.getUnderMe.get('usertypestatus').value) ? [this.getUnderMe.get('usertypestatus').value] : false;
    body = { "userName": un, "userType": ut, "active": ua, "type": "production" };
    var url = await AuthConfig.config.encodeUrl(api)
    this.MemberService.members(url, body)
      .subscribe(
        (res: any) => {
          this.noData = false;
          this.apiDataCount = res.data[0].count;
          this.totalAmount = res.Total_balance;
          this.tableOptions.customText = '<strong>Total Amount ₹' + this.totalAmount.toFixed(2) + '</strong>   |   Total Records ' + this.apiDataCount;
          console.log("apiDataCount", this.apiDataCount);
          this.searching = false;
          this.searchComplete = true;
        },
        (err: any) => {
          this.searching = false;
          //  console.log(err);
        }
      )
  }

  async getChildUsers(t) {
    this.show_name = this.getUnderUser.get('username').value;
    this.show_utype = this.getUnderUser.get('usertypestatus').value;
    this.show_status = this.getUnderUser.get('activestatus').value;
    this.show_utype1 = this.getUnderMe.get('usertypestatus').value;
    this.show_status1 = this.getUnderMe.get('activestatus').value;

    if (t == 'getUnderUser') {
      this.apiBody = {
        "userName": this.userDetails.userInfo.userName,
        "userType": [this.show_utype] ? [this.show_utype] : false,
        "active": (this.show_status === '0') ? 'true' : 'false',
        "parentUsername": this.show_name,
        "noRow": "50",
        "fromRow": "0",
        "type": "production"
      };
      // (this.show_utype)?this.apiBody['userType'] = this.show_utype:'';
      // this.apiUrl = 'https://us-central1-iserveustaging.cloudfunctions.net/showUser5Api/api/v1/showuserparentCore';
      this.apiUrl = 'https://us-central1-iserveustaging.cloudfunctions.net/showUser3Api/api/v1/showuserparentCore';
    } else if (t == 'getUnderMe') {

      let user = JSON.parse(sessionStorage.getItem('dashboardData'));

      this.apiBody = {
        "userName": user.userInfo.userName,
        "userType": (this.show_utype1) ? this.show_utype1 : 'false',
        "active": (this.show_status1 === '0') ? 'true' : 'false',
        "noRow": "50",
        "fromRow": "0",
        "type": "production"
      };
      //  this.apiUrl = 'https://us-central1-iserveustaging.cloudfunctions.net/showUser5Api/api/v1/showuserCore';
      this.apiUrl = 'https://us-central1-iserveustaging.cloudfunctions.net/showUser3Api/api/v1/showuserCore';
    }
    this.searching = true;
    this.searchComplete = false;
    var url = await AuthConfig.config.encodeUrl(this.apiUrl)
    this.MemberService.members(url, this.apiBody)
      .subscribe(
        (res: any) => {
          this.noData = false;
          // console.log(res);
          this.tdataStr = JSON.stringify(res.data);
          // this.paging.data = res.data;
          if (t == 'getUnderUser') {
            this.getParentTotalCore();
          } else if (t == 'getUnderMe') {
            this.getShowTotalCore();
          }
        },
        (err: any) => {
          this.searching = false;
          if (err.error.statusCode == 5) {
            this.noData = true;
            vex.dialog.alert(err.error.data.statusDesc);
          }
        }
      )
  }

  async userStatus(event) {
    // let user = JSON.parse(sessionStorage.getItem('CORE_SESSION'));
    let dv = event.ev, tr = event.tr;
    // console.log(dv.checked);
    if (!dv.checked) {
      var r = confirm("Are you sure to disable " + tr.userName);
      if (r) {
        var token = sessionStorage.getItem('CORE_SESSION')

        this.apiBody = { "user_name": tr.userName, "loginToken": token, "type": "production" }
        this.apiUrl = 'https://us-central1-iserveustaging.cloudfunctions.net/disable_user/user_statusCore';

        this.searching = true;
        this.searchComplete = false;
        var url = await AuthConfig.config.encodeUrl(this.apiUrl)
        this.MemberService.members(url, this.apiBody)
          .subscribe(
            (res: any) => {
              this.noData = false;
              //  console.log(res);
              this.searching = false;
              alert(res.message);
            },
            (err: any) => {
              this.searching = false;
              //  console.log(err);
            }
          )
      } else {
        dv.checked = true;
      }
    } else {
      dv.checked = false;
      alert("You are not allowed to activate");
    }
  }

  async getUserDetails() {
    this.show_unamesearch = this.getUserDetail.get('username').value;
    var body;
    this.searching = true;
    this.searchComplete = false;
    let user = JSON.parse(sessionStorage.getItem('dashboardData'));
    body = { "userName": this.show_unamesearch, "loginName": user.userInfo.userName, "loginRole": user.userInfo.userType, "type": "production" }

    // var url = await AuthConfig.config.encodeUrl('https://us-central1-iserveustaging.cloudfunctions.net/showUser5Api/api/v1/userdetail')
    var url = await AuthConfig.config.encodeUrl('https://us-central1-iserveustaging.cloudfunctions.net/showUser3Api/api/v1/userdetail')
    this.MemberService.members(url, body)
      .subscribe(
        (res: any) => {
          this.noData = false;
          this.tdataStr = JSON.stringify(res.data);
          // this.paging.data = res.data;
          this.apiDataCount = res.data.length;
          this.searching = false;
          this.searchComplete = true;
        },
        (err: any) => {
          this.searching = false;
          if (err.error.statusCode == 5) {
            this.noData = true;
            vex.dialog.alert(err.error.data.statusDesc);
          }

        }
      )
  }

  async getRecentOnboarded() {
    this.searchreporttype = this.recentlyOnboarded.get('reporttype').value;

    this.searching = true;
    this.searchComplete = false;
    let user = JSON.parse(sessionStorage.getItem('dashboardData'));
    let today = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    let endToday: any = new Date(new Date().getTime() + (24 * 60 * 60 * 1000));
    endToday = formatDate(endToday, 'yyyy-MM-dd', 'en');
    let weektime = new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000));
    let weekday = formatDate(weektime, 'yyyy-MM-dd', 'en');
    let cm = (new Date().getMonth()) + 1;
    let cy = new Date().getFullYear();
    let mtime = new Date(cm + '/01/' + cy);
    let mday = formatDate(mtime, 'yyyy-MM-dd', 'en');

    var body;
    if (this.searchreporttype == 'today') {
      body = { "startDate": today, "endDate": endToday, "userName": user.userInfo.userName, "type": "production" }
    } else if (this.searchreporttype == 'weekly') {
      body = { "startDate": weekday, "endDate": today, "userName": user.userInfo.userName, "type": "production" }
    } else if (this.searchreporttype == 'monthly') {
      body = { "startDate": mday, "endDate": today, "userName": user.userInfo.userName, "type": "production" }
    }
    // var url = await AuthConfig.config.encodeUrl('https://us-central1-iserveustaging.cloudfunctions.net/showUser5Api/api/v1/resentonborduser')
    var url = await AuthConfig.config.encodeUrl('https://us-central1-iserveustaging.cloudfunctions.net/showUser3Api/api/v1/resentonborduser')
    this.MemberService.members(url, body)
      .subscribe(
        (res: any) => {
          this.noData = false;
          //  console.log(res);
          this.tdataStr = JSON.stringify(res.data);
          this.paging.data = res.data;
          this.searching = false;
          this.searchComplete = true;
        },
        (err: any) => {
          this.searching = false;
          if (err.error.statusCode == 5) {
            this.noData = true;
            vex.dialog.alert(err.error.data.statusDesc);
          }
        }
      )
  }

  // updateFilter(event) {
  //   //console.log(event.target.value);

  // }
  // counter(i: number) {
  //   return new Array(i);
  // }

  getUsersList(e) {
    //  console.log(e);
    const queryParam = {
      "size": 10000,
      "from": 0,
      "query": {
        "bool": {
          "filter": {
            "multi_match": {
              "query": e.target.value,
              "type": "phrase_prefix",
              "fields": [
                "user_name",
                "mobile_no",
                "name"
              ],
              "lenient": true
            }
          }
        }
      }

    };

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Basic ZWxhc3RpYzpUQWhJamJ4U2RzRzRRRDY3WWVmZTZQdzg=`
    });

    let options = { headers: headers };

    this.http.post('https://b61295e3bdc84097ac04e0456792cac1.us-central1.gcp.cloud.es.io:9243/isu_elastic_user/_search', queryParam, options).subscribe(
      async (res1: any) => {
        // console.log("response is: ", res1);
        this.beneficiary = res1.hits.hits.map(hit => {
          return {
            name: hit._source.name,
            username: hit._source.user_name,
            mobile: hit._source.mobile_no,
            role: hit._source.user_role,
            email: hit._source.email,
            parent: hit._source.parent_a,
            // dmt_neft_enable: hit._source.dmt_neft_enable,
            // dmt_imps_enable: hit._source.dmt_imps_enable 
          }
        });
      },
      (err1: any) => {
        // console.log(err1);
      }
    );

  }


  async getTableData(obj: any) {
    obj = {
      api: '',
      body: {}
    };
    this.searching = true;
    this.searchComplete = false;
    var url = await AuthConfig.config.encodeUrl(obj.api)
    this.MemberService.members(url, obj.body)
      .subscribe(
        (res: any) => {
          this.noData = false;
          // console.log(res);
          this.tdataStr = JSON.stringify(res.data);
          // this.paging.data = res.data;
          this.searching = false;
          this.searchComplete = true;
        },
        (err: any) => {
          this.searching = false;
          if (err.error.statusCode == 5) {
            this.noData = true;
          }
          //  console.log(err);
        }
      )
  }

  async dataByPage(eve) {
    // console.log(eve);
    if (eve.start == 0) {
      eve.start = "0";
    }
    // else if(eve.limit == 50){
    //     eve.limit = "50";
    // }
    this.apiBody['fromRow'] = `${eve.start}`;
    this.apiBody['noRow'] = `${eve.limit}`;
    //  console.log(this.apiBody);
    //  console.log(this.apiUrl);

    this.searching = true;
    // this.searchComplete = false;
    var url = await AuthConfig.config.encodeUrl(this.apiUrl)
    this.MemberService.members(url, this.apiBody)
      .subscribe(
        (res: any) => {
          this.noData = false;
          // console.log(res);
          this.tdataStr = JSON.stringify(res.data);
          // this.paging.data = res.data;
          this.searching = false;
          this.searchComplete = true;
        },
        (err: any) => {
          this.searching = false;
          if (err.error.statusCode == 5) {
            this.noData = true;
          }
          // console.log(err);
        }
      )
  }

  payModal(uname) {
    //  console.log(uname);
    let today = formatDate(new Date(), 'MMMM d, y', 'en');
    this.showModal = true;
    this.modalData = { modalHeading: 'Pay to ' + uname.userName, modalType: "pay", user: uname.userName, userData: uname, date: today };
  }

  debitModal(uname) {
    console.log(uname);
    let today = formatDate(new Date(), 'MMMM d, y', 'en');
    this.showModal = true;
    this.modalData = { modalHeading: 'Debit from ' + uname.userName, modalType: "debit", user: uname.userName, userData: uname, date: today };
  }
  // editModal(uname) {debugger
  //   this.backflag = false
  //   //console.log(uname);
  //   this.edituserdetails = false
  //   this.fetchuser(uname.userId);
  //   this.getfeature();
  //   this.userid = uname.userId;
  //   this.username_admin = uname.userName;
  //   this.agentName=uname.agentName;
  

  // }
  async editModal(uname) {
    this.backflag = false
    console.log(uname);
    this.edituserdetails = false;
    this.fetchuser(uname.userId);
    this.displayfeature(uname.userName);
    this.getfeature();
    this.userid = uname.userId;
    this.username_admin = uname.userName;
    console.log(this.username_admin);
    
    this.agentName=uname.agentName;
    var queryParam = { "userName": uname.userName }
    this.http.post('https://wallet-topup-new-prod-vn3k2k7q7q-uc.a.run.app/users/fetch_payment_request', queryParam).subscribe(
      async (res1: any) => {
        //  console.log("response is: ", res1);
        if (res1.data.payment_req_type == "case1") {
          this.approvalProperties = "parent"
        }
        else if (res1.data.payment_req_type == "case2") {
          this.approvalProperties = "admin"
        }
        else if (res1.data.payment_req_type == "case3") {
          this.approvalProperties = "adminIser"
        }
        else if (res1.data.payment_req_type == "case4") {
          this.approvalProperties = "iserveu"
        }
      },
      (err1: any) => {
        // console.log(err1);
        this.approvalProperties = ""
      }
    );
    console.log(uname, "uuuuuuu");
    const encURL = await AuthConfig.config.encodeUrl(`https://itpl.iserveu.tech/user/getuserprofile.json?id=${uname.userId}`)
    this.http.get(encURL).subscribe(
      (res1: any) => {
        console.log("response is: ", res1);
        this.uid=uname.userId;
        this.firstName = res1.firstName;
        this.lastName = res1.lastName;
        this.email = res1.email;
        this.mobileNumber = res1.mobileNumber;
        this.address = res1.address;
        this.city = res1.city;
        this.state = res1.state;
        this.shopName = res1.shopName;
        this.adharCard = res1.adharCard;
        this.panCard = res1.panCard;
      });
  }
  function1() {
    this.showedit = 1;
    this.searchComplete = true;
    this.backflag = true
    this.edituserdetails = true
    this.sendotpflag = true;
    this.beneform.reset();
    this.beneform1.reset();
    this.feature.reset();
    this.beneform.invalid;
    this.beneform1.invalid;
    this.getfeature();
    // window.location.reload()
    // this.router.navigate(['/v1/member/showuser']);
  }
  async fetchuser(id) {
    
    var url1 = `https://itpl.iserveu.tech/getAvailableFeatures.json?userId=`;
    
    var test = url1.concat(id);
    var url = await AuthConfig.config.encodeUrl(test.concat('&'))
    this.MemberService.fetchuserfeature(url)
      .subscribe(
        async (res: any) => {
          // console.log("features",res);
          // this.getfirestfeature=res;
          this.finalfeature = res;
          var url2 = `https://itpl.iserveu.tech/getActiveFeatures.json?userId=`;
          
          var test1 = url2.concat(id);
          var url1 = await AuthConfig.config.encodeUrl(test1.concat('&'))
          this.MemberService.fetchuserfeature(url1)
            .subscribe(
              (res1: any) => {
                console.log("features",res1);
                // this.getfirestfeature=res;
                this.finalfeature1 = res1;
                var a = this.finalfeature1;
                var b = this.finalfeature;
                // A comparer used to determine if two entries are equal.
                const isSameUser = (a, b) => a.featureId == b.featureId && a.featureName == b.featureName;

                // Get items that only occur in the left array,
                // using the compareFunction to determine equality.
                const onlyInLeft = (left, right, compareFunction) =>
                  left.filter(leftValue =>
                    !right.some(rightValue =>
                      compareFunction(leftValue, rightValue)));

                var onlyInA = onlyInLeft(a, b, isSameUser);
                var onlyInB = onlyInLeft(b, a, isSameUser);

                var result = [...onlyInA, ...onlyInB];

                // console.log(result);
                //  console.log(this.finalfeature);

                for (let i = 0; i < this.finalfeature.length; i++) {
                  for (let j = 0; j < result.length; j++) {
                    if (parseInt(result[j].featureId) == parseInt(this.finalfeature[i].featureId)) {
                      
                      this.finalfeature[i].active = false;
                    }
                  }
                }
                this.finalfeature2 = this.finalfeature;
                  console.log(this.finalfeature2);

                // for(let i=0;i<this.finalfeature.length;i++){
                //   if(this.finalfeature[i].featureId==this.finalfeature1[i].featureId){
                //     if(this.finalfeature[i].active==true && this.finalfeature1[i].active==true){
                //       this.finalfeature2.push(this.finalfeature[i])
                //     }
                //     else{
                //       if(this.finalfeature1[i]){

                //       }
                //     }

                //   }
                // }
              },
              (err: any) => {
                // console.log(err);
              }
            )
        },
        (err: any) => {
          // console.log(err);
        }
      )
//this.updatefeature();
  }
  
  async displayfeature(uname) {
    console.log(uname);
    
    const encURL = await AuthConfig.config.encodeUrl(`https://dynamicfeatureprod.iserveu.online/display_feature?`)
     this.http.get(encURL).subscribe(
      async (res: any) => {
        console.log("new feature1",res);
          this.displayuserfeature = res.userFeature;
          console.log(this.displayuserfeature,"displayyyyyyyyyy");
          
          const featureName = {
                 user_name: this.username_admin 
              }
               const encURL = await AuthConfig.config.encodeUrl(`https://dynamicfeatureprod.iserveu.online/fetch_user_feature?`)
              this.http.post(encURL,featureName).subscribe(
                (res: any) => {
                  this.displayuserfeature1 = res.userFeature;
                  console.log("new feature2",this.displayuserfeature1 );

                var a = this.displayuserfeature1;
                var b = this.displayuserfeature;
                // A comparer used to determine if two entries are equal.
                const isSameUser1 = (a, b) => a.id == b.id && a.featureName == b.feature_name;

                // Get items that only occur in the left array,
                // using the compareFunction to determine equality.
                const onlyInLeft1 = (left, right, compareFunction1) =>
                  left.filter(leftValue1 =>
                    !right.some(rightValue1 =>
                      compareFunction1(leftValue1, rightValue1)));

                var onlyInA1 = onlyInLeft1(a, b, isSameUser1);
                var onlyInB1 = onlyInLeft1(b, a, isSameUser1);

                var result = [...onlyInA1, ...onlyInB1];

                // console.log(result);
                //  console.log(this.finalfeature);

                for (let i = 0; i < this.displayuserfeature.length; i++) {
                  for (let j = 0; j < result.length; j++) {
                    if (parseInt(result[j].id) == parseInt(this.displayuserfeature[i].id)) {
                      
                      this.displayuserfeature[i].active = false;
                    }
                  }
                }
                this.displayuserfeature2 = this.displayuserfeature;
                   console.log(this.finalfeature2);

                // for(let i=0;i<this.finalfeature.length;i++){
                //   if(this.finalfeature[i].featureId==this.finalfeature1[i].featureId){
                //     if(this.finalfeature[i].active==true && this.finalfeature1[i].active==true){
                //       this.finalfeature2.push(this.finalfeature[i])
                //     }
                //     else{
                //       if(this.finalfeature1[i]){

                //       }
                //     }

                //   }
                // }
              },
              (err: any) => {
                // console.log(err);
              }
            )
        },
        (err: any) => {
          // console.log(err);
        }
      )

  }

  async getfeature() {
    // console.log(get);    
    var url3 = await AuthConfig.config.encodeUrl('https://apps.iserveu.online/featureCheck/retdemo')
    this.MemberService.fetchuserfeature(url3)
      .subscribe(
        (res: any) => {
          //  console.log("old features",res);
          this.getsecondfeature = res.response;
         // this.getdisplayfeature= res.response;
          // for(var i=0;i<=res.response.length;i++){
          //   // get.push(res.response[i])
          // }
          // get.pop();
          // console.log(get);
          // this.finalfeature=get;
          this.getflag = true;

        },
        (err: any) => {
          //  console.log(err);
        }
      )

  }
  async submitReport() {
    this.searching = true;
    this.body = {

      "password": this.beneform.get('password').value,
      "userId": this.userid

    }
    // console.log( this.body);
    const encURL = await AuthConfig.config.encodeUrl('https://itpl.iserveu.tech/admin/passadmisuchaisunge');
    // https://itpl.iserveu.tech/admin/passadmisuchaisunge
    this.MemberService.sendotp(encURL, this.body)
      .pipe()
      .subscribe((res: any) => {
        this.searching = false;
        // console.log(res);
        this.sendotpflag = false;
        vex.dialog.alert("otp send successfully");
      });

    (err: any) => {
      //  console.log(err);
      this.searching = false;

    }

  }
  async submitReport1() {
    this.searching = true;
    this.body1 = {

      "password": this.beneform.get('password').value,
      "userId": this.userid,
      "otp": this.beneform1.get('password1').value

    }
    //console.log( this.body);
    const encURL = await AuthConfig.config.encodeUrl('https://itpl.iserveu.tech/admin/passvaisulidotisupchange');
    // https://itpl.iserveu.tech/admin/passadmisuchaisunge
    this.MemberService.sendotp(encURL, this.body1)
      .pipe()
      .subscribe((res: any) => {
        this.searching = false;
        // console.log(res);
        if (res.statusDesc != "Invalid OTP. Please try again.") {
          this.router.navigate(['/v1']);
        }
        else {
          vex.dialog.alert(res.statusDesc);
        }
      });

    (err: any) => {
      // console.log(err);
      this.searching = false;

    }

  }
  toggle(a) {
    this.adminflag = true;
    // a.active = !a.active;
    // console.log(this.finalfeature2);    
    let arr: any = this.finalfeature2;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].featureId == a.featureId) {
        arr[i].active = !arr[i].active;
        arr[i].featureId = arr[i].featureId;
      }
    }
     console.log(arr);
    this.firstdata = arr;
  }
  toggle1(b) {
    this.adminflag = true;
    let secarr: any = this.getsecondfeature;
    
    
    for (let i = 0; i < secarr.length; i++) {
      if (secarr[i].id == b.id) {
        secarr[i].active = !secarr[i].active;
      }
    }
    // console.log(secarr);
    this.seconddata = secarr

  }
   priTabChange() {
    this.searchComplete = false;
    this.tableOptions.customText = '';
    this.apiDataCount = -1;
    this.noData = false;
    this.getUnderUser.reset();
    this.getUnderMe.reset();
    this.getUserDetail.reset();
    this.recentlyOnboarded = new FormGroup({
      reporttype: new FormControl('0')
    });
    this.utleftPos = -1;
    this.mychAct = -1;
    this.leftPos = -1;
  }

  updateTdata(arg) {
    let tdata = JSON.parse(this.tdataStr);
    for (let i = 0; i < tdata.length; i++) {
      if (tdata[i].userName == arg.userName) {
        if ((arg.update).toLowerCase() == 'pay') {
          tdata[i].w1Balance = parseFloat(tdata[i].w1Balance) + parseFloat(arg.w1Balance);
          tdata[i].totalBalance = parseFloat(tdata[i].totalBalance) + parseFloat(arg.w1Balance);
        } else {
          tdata[i].w1Balance = parseFloat(tdata[i].w1Balance) - parseFloat(arg.w1Balance);
          tdata[i].totalBalance = parseFloat(tdata[i].totalBalance) - parseFloat(arg.w1Balance);
        }
      }
    }
    this.tdataStr = JSON.stringify(tdata);
    // console.log("arg",arg);
  }
  async updatefeature() {
    
    this.searching = true;
    if (this.firstdata.length > 0) {
      var url1 = 'https://itpl.iserveu.tech/updateUserFeatures.json?userId=';
      var test = url1.concat(this.userid);
      var url = await AuthConfig.config.encodeUrl(test.concat('&'))
      this.firstdata = this.firstdata.map(({ featureDescription, ...rest }) => ({ ...rest }))
      this.firstdata = JSON.stringify(this.firstdata)
      // console.log(this.firstdata);
      // console.log(console.log(typeof this.firstdata));

      this.MemberService.updatefeature(url, this.firstdata)
        .subscribe(
          (res: any) => {
            // console.log("update features",res);
            // this.searching = false;
            vex.dialog.alert(res.statusDesc);
            this.searching = false;
            this.getfeature();
           
          },
          (err: any) => {
            //  console.log(err);
            this.searching = false;
          }
        )
    }
    if (this.seconddata.length > 0) {
      var body1 = [];
      for (let i = 0; i < this.seconddata.length; i++) {
        if (!this.seconddata[i].active) {
          body1.push(this.seconddata[i].id)
        }
      }
      // console.log(body1);

      var url4 = await AuthConfig.config.encodeUrl("https://apps.iserveu.online/updateAllFeature")
      let body = { "userName": this.username_admin, "featureIds": body1, "activeDeactive": false };
      this.MemberService.updatefeature1(url4, body)
        .subscribe(
          (res: any) => {
            //  console.log("update features",res);
           
            vex.dialog.alert(res.statusDesc);
            this.searching = false;
           
          },
          (err: any) => {
            this.searching = false;
          }
        )
    }
     }

  async NewFeature() {
  
    this.searching = true;
    
    let CHECKId = []
    let CHECKId12 = []
    this.displayuserfeature1.forEach((value, index) => {
      if (value.active) {
        CHECKId.push(value.id);
      } else {
        CHECKId12.push(value.id);
      }

    })

    if (CHECKId12.length !== 0) {
      let body2 = {
        "userName": this.username_admin,
        "featureIds": CHECKId12,
        "activeDeactive": false
      }
      let encURL = await AuthConfig.config.encodeUrl('https://dynamicfeatureprod.iserveu.online/update_features')
      this.http.post(encURL, body2).subscribe(
        (res: any) => {
          vex.dialog.alert(res.statusDesc);
          this.searching = false;

        },
      )
      }
       else if (CHECKId.length !== 0) {
        let body = {
          "userName": this.username_admin,
          "featureIds": CHECKId,
          "activeDeactive": true
        }

        let encURL = await AuthConfig.config.encodeUrl('https://dynamicfeatureprod.iserveu.online/update_features')
        this.http.post(encURL, body).subscribe(
          (res: any) => {
            console.log(res, "updateupdate");
            vex.dialog.alert(res.statusDesc);
            this.searching = false;

          },
        )

      }
    

  }

  updateWalletBal() {
    this.appservice.fetchWalletBalance();
  }

  async updateProfile() {
    this.savebtn=false;
    this.cancelbtn=false;
    document.getElementById("myAnchor1").style.cursor = "not-allowed";
    document.getElementById("myAnchor1").setAttribute("disabled", "true");
    document.getElementById("myAnchor2").style.cursor = "not-allowed";
    document.getElementById("myAnchor2").setAttribute("disabled", "true");
    document.getElementById("myAnchor5").style.cursor = "not-allowed";
    document.getElementById("myAnchor5").setAttribute("disabled", "true");
    document.getElementById("myAnchor6").style.cursor = "not-allowed";
    document.getElementById("myAnchor6").setAttribute("disabled", "true");
    document.getElementById("myAnchor7").style.cursor = "not-allowed";
    document.getElementById("myAnchor7").setAttribute("disabled", "true");
    document.getElementById("myAnchor8").style.cursor = "not-allowed";
    document.getElementById("myAnchor8").setAttribute("disabled", "true");

   this.first_name = this.EditUserForm.get('fname').value;
    this.last_name = this.EditUserForm.get('lname').value;
    this.user_mail = this.EditUserForm.get('mail').value;
    this.user_mobile = this.EditUserForm.get('mobile').value;
    this.user_address = this.EditUserForm.get('address').value;
    this.user_city = this.EditUserForm.get('city').value;
    this.user_state = this.EditUserForm.get('state').value;
    this.user_shopname = this.EditUserForm.get('shopname').value;
    this.user_aadhar = this.EditUserForm.get('aadhar').value;
    this.user_pan = this.EditUserForm.get('panCard').value;

    let body = {

      address:  this.user_address ,
      adharCard: this.user_aadhar,
      city: this.user_city,
      email:  this.user_mail,
      firstName: this.first_name,
      id: this.uid,
      lastName: this.last_name,
      mobileNumber: this.user_mobile,
      panCard: this.user_pan,
      shopName:   this.user_shopname,
      state:  this.user_state
    }
    const encURL = await AuthConfig.config.encodeUrl('https://itpl.iserveu.tech/user/updateprofile.json?');
    this.http.post(encURL,body).subscribe(
      (res1: any) => {
        console.log("response is: ", res1);
      //  this.searching = false;
       vex.dialog.alert(res1.statusDesc)
      });
  }

  showbtn() {
    this.savebtn = true;
    this.cancelbtn = true;
    document.getElementById("myAnchor1").style.cursor = "pointer";
  document.getElementById("myAnchor1").removeAttribute("disabled");
  document.getElementById("myAnchor2").style.cursor = "pointer";
  document.getElementById("myAnchor2").removeAttribute("disabled");
  document.getElementById("myAnchor5").style.cursor = "pointer";
  document.getElementById("myAnchor5").removeAttribute("disabled");
  document.getElementById("myAnchor6").style.cursor = "pointer";
  document.getElementById("myAnchor6").removeAttribute("disabled");
  document.getElementById("myAnchor7").style.cursor = "pointer";
  document.getElementById("myAnchor7").removeAttribute("disabled");
  document.getElementById("myAnchor8").style.cursor = "pointer";
  document.getElementById("myAnchor8").removeAttribute("disabled");
  }

  closebtn() {
    this.savebtn = false;
    this.cancelbtn = false;
    this.editbtn = true;
    document.getElementById("myAnchor1").style.cursor = "not-allowed";
    document.getElementById("myAnchor1").setAttribute("disabled", "true");
   // document.getElementById("myAnchor1").disabled = true;
    document.getElementById("myAnchor2").style.cursor = "not-allowed";
    document.getElementById("myAnchor2").setAttribute("disabled", "true");
    document.getElementById("myAnchor5").style.cursor = "not-allowed";
    document.getElementById("myAnchor5").setAttribute("disabled", "true");
    document.getElementById("myAnchor6").style.cursor = "not-allowed";
    document.getElementById("myAnchor6").setAttribute("disabled", "true");
    document.getElementById("myAnchor7").style.cursor = "not-allowed";
    document.getElementById("myAnchor7").setAttribute("disabled", "true");
    document.getElementById("myAnchor8").style.cursor = "not-allowed";
    document.getElementById("myAnchor8").setAttribute("disabled", "true");
    
  }

  onFileChangepan(event) {
    this.searching=true;
    console.log(event.target.files[0].size);
    const filetype = event.target.files[0];
    this.filename = filetype;
    console.log(this.filename);
    /* this.cashoutService.adhaarNumberVerify(filetype).subscribe(res=>{
       console.log(res);
     })*/
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.imgSrc = event.target.result;
      reader.readAsDataURL(event.target.files[0]);

      if (event.target.files[0].size > 2097152) {

      }

      else {
        const filetype = event.target.files[0]['name'];
        const filetype1 = filetype.lastIndexOf(".") + 1;
        const filetype2 = filetype.substr(filetype1, filetype.length).toLowerCase();
        if (filetype2 == "png" || filetype2 == "jpg" || filetype2 == "jpeg") {
          this.selectedImage = event.target.files[0];
        }
        else {
        }
      }
    }

    else {
      this.imgSrc = '/assets/DriverActivity.java';
      this.selectedImage = null;
    }

    var filepath = `${this.selectedImage.name}`;
    console.log(filepath);

    const fileRef = this.storage.ref(filepath);
    const task = this.storage.upload(filepath, this.selectedImage);
    task.snapshotChanges().pipe(
      finalize(() => {

        fileRef.getDownloadURL().subscribe((url) => {
          this.ngxSpinner.show('balanceSpinner')
          console.log(url);
          this.downloadURLpan = url;
          this.db.collection('adhaarfiles').add({ downloadURLpan: url, filepath });
          console.log(this.downloadURLpan)
          if (this.downloadURLpan !== 'undefined' || this.downloadURLpan !== null) {
            this.userdataSelected = "Pan selected Successfully";
            console.log(this.userdataSelected);
            this.searching=false;
            vex.dialog.alert("PAN Uploaded successfully")

          }

        });
      })
    )

      .subscribe()
  }
  onFileChangeaadhar(event) {
    this.searching=true;
    console.log(event.target.files[0].size);
    const filetype = event.target.files[0];
    this.filename = filetype;
    console.log(this.filename);
    /* this.cashoutService.adhaarNumberVerify(filetype).subscribe(res=>{
       console.log(res);
     })*/
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.imgSrc = event.target.result;
      reader.readAsDataURL(event.target.files[0]);

      if (event.target.files[0].size > 2097152) {



      }

      else {
        const filetype = event.target.files[0]['name'];
        const filetype1 = filetype.lastIndexOf(".") + 1;
        const filetype2 = filetype.substr(filetype1, filetype.length).toLowerCase();
        if (filetype2 == "png" || filetype2 == "jpg" || filetype2 == "jpeg") {
          this.selectedImage = event.target.files[0];
        }
        else {
        }
      }
    }

    else {
      this.imgSrc = '/assets/DriverActivity.java';
      this.selectedImage = null;
    }

    var filepath = `${this.selectedImage.name}`;
    console.log(filepath);

    const fileRef = this.storage.ref(filepath);
    const task = this.storage.upload(filepath, this.selectedImage);
    task.snapshotChanges().pipe(
      finalize(() => {

        fileRef.getDownloadURL().subscribe((url) => {
          console.log(url);
          this.downloadURLaadhar = url;
          this.db.collection('adhaarfiles').add({ downloadURLaadhar: url, filepath });
          console.log(this.downloadURLaadhar)
          if (this.downloadURLaadhar !== 'undefined' || this.downloadURLaadhar !== null) {
            this.userdataSelected = "AAdhar selected Successfully";
            this.searching=false;
            vex.dialog.alert("Adhar Uploaded successfully")
            console.log(this.userdataSelected);

          }

        });
      })
    )

      .subscribe()
  }
  
}


