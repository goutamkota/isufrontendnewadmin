import { DatePipe } from "@angular/common";
import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { MemberService } from "../member.service";
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthConfig } from "src/app/app-config";
import * as Notiflix from 'notiflix';

import { async } from "@angular/core/testing";



@Component({
  selector: 'app-adduser',
  templateUrl: './adduser.component.html',
  styleUrls: ['./adduser.component.scss']
})
export class AddUserComponent implements OnInit {
  usermodes = [];
  UserDetailForm: FormGroup;
  Otp_Form: FormGroup;
  UserDocumentForm: FormGroup;
  doc_user: boolean;
  opt_fld: boolean;
  detail_user: boolean;
  userdocinfo: any = [];
  pincodes = [];
  // memberService: any;
  userFlags = { pinDetails: null };
  userdetailinfo: any = [];
  unsub = new Subject();
  User_password: any;
  User_conpassword: any;
  prsnlconfirmpassWordToggle: boolean;
  prsnlUsernameToggle: boolean;
  imageSrc: string;
  requestbody = <any>[];
  filename: any;
  imgSrc: any;
  selectedImage: any;
  // storage: any;
  downloadURLaadhar: any;
  downloadURLpan: any;
  // db: any;
  userdataSelected: string;
  API: any = "https://itpl.iserveu.tech/";
  State_name: any;
  Dist_name: any;
  Email_user: any;
  router: any;



  constructor(
    private ngxSpinner: NgxSpinnerService,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private MemberService: MemberService,
    private storage: AngularFireStorage, private db: AngularFirestore


  ) { }
  @ViewChild('createUser', { static: false }) private getConfirm_user: any;
  @ViewChild('otpForm', { static: false }) private getOtp_user: any;



  ngOnInit() {
    this.detail_user = false;
    this.opt_fld = false;

    this.usermodes = ['Retailer', 'Distributer', 'Master Distributer'];
    this.observeform();
    this.Otp_Form = this.formBuilder.group({
      // otp: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      otp1: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      otp2: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      otp3: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      otp4: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      otp5: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      otp6: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    }),
      this.UserDocumentForm = this.formBuilder.group({
        user_name: ['', [Validators.required, Validators.minLength(2), Validators.pattern('^[a-zA-Z ]*$')]],
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(10)]],
        con_password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(10)]],
        aadhar_no: ['', [Validators.required, Validators.pattern('^[2-9]{1}[0-9]{3}\\s[0-9]{4}\\s[0-9]{4}$')]],
        aadhar: ['', [Validators.required]],
        pan_no: ['', [Validators.required, Validators.pattern('[A-Z]{5}[0-9]{4}[A-Z]{1}')]],
        pan: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email, Validators.pattern("[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}")]],
        email_otp: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]]
      })

  }
  otpClick(e, prevBox, nextBox) {
    if (nextBox && e.data) { nextBox.focus(); }
    if (prevBox && !e.data) { prevBox.focus(); }
  }

  observeform() {
    this.UserDetailForm = this.formBuilder.group({
      userType: ['', [Validators.required]],
      f_name: ['', [Validators.required, Validators.minLength(2), Validators.pattern('^[a-zA-Z ]*$')]],
      l_name: ['', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-Z ]*$')]],
      email: ['', [Validators.required, Validators.email, Validators.pattern("[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}")]],
      ph_num: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(/^[0-9]+$/)]],
      shop_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), Validators.pattern('^[a-zA-Z ]*$')]],
      address: ['', [Validators.required]],
      pin_code: ['', [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.minLength(6), Validators.maxLength(6)]],
      city_name: ['', [Validators.required]],
      state: ['', Validators.required]
    }),

      this.searchPincode();


  }
  getOTP() {
    this.getConfirm_user.show();
    // this.doc_user = fals;
    // this.detail_user = true;
  }
  submit() {
    this.detail_user = true;
    this.Email_user = this.UserDetailForm.get('email').value;
    this.UserDocumentForm.patchValue({ email: this.Email_user });

  }
  async getemail_OTP() {
    let email_id = this.UserDetailForm.get('email').value;
    const featureData = {
      "email": email_id
    }
    console.log(email_id);

    const Emailotp_url = await AuthConfig.config.encodeUrl(`https://itpl.iserveu.tech/generateOtpEmailOfNewUser`);
    return this.http.post(Emailotp_url, featureData)
      .subscribe((Response: any) => {
        console.log(Response);
        // if (Response.status == 0) {
        //   this.getOtp_user.show();
        // }
      })
  }
  async Create_user() {
    this.getConfirm_user.hide();
    // let mobno = this.UserDetailForm.get('ph_num').value;
    const otp_url = await AuthConfig.config.encodeUrl(`https://itpl.iserveu.tech/generateOtpOfNewUser/${this.UserDetailForm.get('ph_num').value}`);
    return this.http.post(otp_url, {})
      .subscribe((Response: any) => {
        console.log(Response);
        if (Response.status == 0) {
          this.getOtp_user.show();
        }
        else {
          Notiflix.Report.failure('Mobile Number Already Exist', '', 'Close');
        }

      })
    // this.http.post(, {})
    // .subscribe((response: any) => {
    //   console.log(response);
    // })
  }

  async Otp_verify() {
    // debugger;
    const Otp = Object.values(this.Otp_Form.value).join('');
    console.log(Otp);
    const verify_url = await AuthConfig.config.encodeUrl(`https://itpl.iserveu.tech/generateOtpOfNewUser/${this.UserDetailForm.get('ph_num').value}/${Otp}`);
    return this.http.post(verify_url, {})
      .subscribe((Response: any) => {
        console.log(Response);
        if (Response.status == 0) {
          this.getOtp_user.hide();
          Notiflix.Notify.success('OTP Verified Sucessfull');
        }

      },
        (err: any) => {
          console.log(err);
          this.getOtp_user.hide();
          this.detail_user = false;
          Notiflix.Notify.failure('Error,Try Again.');

        })

  }
  async veri_creUser() {
    const featureData = {
      'userName': this.UserDocumentForm.get('user_name').value,
      'password': this.UserDocumentForm.get('password').value,
      'userType': this.UserDetailForm.get('userType').value,
      'firstName': this.UserDetailForm.get('f_name').value,
      'lastName': this.UserDetailForm.get('l_name').value,
      'mobileNumber': this.UserDetailForm.get('ph_num').value,
      'email': this.UserDetailForm.get('email').value,
      'city': this.UserDetailForm.get('city_name').value,
      'state': this.UserDetailForm.get('state').value,
      'address': this.UserDetailForm.get('address').value,
      'panCard': this.UserDocumentForm.get('pan').value,
      'adharCard': this.UserDocumentForm.get('aadhar').value,
      'shopName': this.UserDetailForm.get('shop_name').value,
      'otp': this.UserDocumentForm.get('email_otp').value,
      'pincode': this.UserDetailForm.get('pin_code').value
    }
    const vericreuser_url = await AuthConfig.config.encodeUrl(`https://itpl.iserveu.tech/usecrisunweser`);
    return this.http.post(vericreuser_url, featureData)
      .subscribe((Response: any) => {
        console.log(Response);
        if (Response.status == 0) {
          Notiflix.Notify.success('User Created Sucessfully');
          this.router.navigate('/v1/dashboard/analytics');
        }
      })
  }



  back_page() {
    // this.doc_user = false;
    this.detail_user = false;
  }

  searchPincode() {
    this.UserDetailForm.get('pin_code').valueChanges
      .subscribe(async (value: any) => {
        if (String(value).length === 6) {
          Notiflix.Loading.arrows('Loading...');
          const featureData = {
            "pin": parseInt(value)
          }
          const pincode_url = await AuthConfig.config.encodeUrl(`https://us-central1-creditapp-29bf2.cloudfunctions.net/pincodeFetch/api/v1/getCitystate`);
          this.http.post(pincode_url, featureData)
            .subscribe((succ: any) => {
              console.log(succ);
              console.log(succ.statusCode);

              // console.log(succ.data.data.state);

              if (succ.statusCode == 0) {
                const stateArray = [{ statecode: 'AN', statename: 'Andaman & Nicobar' }, { statecode: 'AP', statename: 'Andhra Pradesh' }, { statecode: 'AR', statename: 'Arunachal Pradesh' },
                { statecode: 'AS', statename: 'Assam' }, { statecode: 'BR', statename: 'Bihar' }, { statecode: 'CH', statename: 'Chandigarh' }, { statecode: 'CG', statename: 'Chhattisgarh' },
                { statecode: 'DN', statename: 'Dadra and Nagar Haveli' }, { statecode: 'DD', statename: 'Daman & Diu' }, { statecode: 'DL', statename: 'Delhi' },
                { statecode: 'GA', statename: 'Goa' }, { statecode: 'GJ', statename: 'Gujarat' }, { statecode: 'HR', statename: 'Haryana' }, { statecode: 'HP', statename: 'Himachal Pradesh' },
                { statecode: 'JK', statename: 'Jammu & Kashmir' }, { statecode: 'JH', statename: 'Jharkhand' }, { statecode: 'KA', statename: 'Karnataka' }, { statecode: 'KL', statename: 'Kerala' },
                { statecode: 'LD', statename: 'Lakshadweep' }, { statecode: 'MP', statename: 'Madhya Pradesh' }, { statecode: 'MH', statename: 'Maharashtra' }, { statecode: 'MN', statename: 'Manipur' },
                { statecode: 'ML', statename: 'Meghalaya' }, { statecode: 'MZ', statename: 'Mizoram' }, { statecode: 'NL', statename: 'Nagaland' }, { statecode: 'OR', statename: 'Odisha' },
                { statecode: 'PY', statename: 'Puducherry' }, { statecode: 'PB', statename: 'Punjab' }, { statecode: 'RJ', statename: 'Rajasthan' }, { statecode: 'SK', statename: 'Sikkim' },
                { statecode: 'TN', statename: 'Tamil Nadu' }, { statecode: 'TG', statename: 'Telangana' }, { statecode: 'TR', statename: 'Tripura' }, { statecode: 'UP', statename: 'Uttar Pradesh' },
                { statecode: 'UK', statename: 'Uttarakhand' }, { statecode: 'WB', statename: 'West Bengal' }];

                let matchValue = stateArray.find(el => el.statecode === succ.data.data.state);

                // this.State_name = succ.data.data.state;
                this.opt_fld = true;
                this.Dist_name = succ.data.data.city;
                this.UserDetailForm.patchValue({ state: matchValue ? matchValue.statename : succ.data.data.state });
                this.UserDetailForm.patchValue({ city_name: this.Dist_name });
                Notiflix.Loading.remove();


              }

            },
              (err: any) => {
                Notiflix.Loading.remove();
                // console.log(err.);

                if (err.status == 400) {
                  Notiflix.Loading.remove();
                  Notiflix.Report.failure('Invalid Pincode', '"Please Try Again"', 'Close');
                }
                console.log(err);
              })
        }
      });
  }
  validUserNames() {
    this.UserDocumentForm.get('user_name').valueChanges
      .subscribe(async (value: any) => {
        if (this.UserDocumentForm.get('user_name').valid) {
          const bodyData = {
            "userName": value
          }
          const uservalid_url = await AuthConfig.config.encodeUrl(`https://itpl.iserveu.tech/admin/doesusernameexist.json`);
          this.http.post(uservalid_url, bodyData)
            .subscribe((Response: any) => {
              // console.log(Response);
              if (Response.status === false) {
                this.prsnlUsernameToggle = true;
              }
              else {
                this.prsnlUsernameToggle = false;
                // console.log(false);
              }
            })
        }
      }

      )
  }
  onFileChangeaadhar(event) {
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
            console.log(this.userdataSelected);

          }

        });
      })
    )

      .subscribe()
  }
  onFileChangepan(event) {
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
          this.downloadURLpan = url;
          this.db.collection('adhaarfiles').add({ downloadURLpan: url, filepath });
          console.log(this.downloadURLpan)
          if (this.downloadURLpan !== 'undefined' || this.downloadURLpan !== null) {
            this.userdataSelected = "Pan selected Successfully";
            console.log(this.userdataSelected);

          }

        });
      })
    )

      .subscribe()
  }
  omit_char(event) {
    var charCode = (event.which) ? event.which : event.keyCode;
    // Only Numbers 0-9
    if ((charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }
  omit_special_char(event) {
    var k;
    k = event.charCode;  //         k = event.keyCode;  (Both can be used)
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57));
  }
  confirmPasswordUser() {
    if (this.UserDocumentForm.value.password !== null && this.UserDocumentForm.value.con_password !== null) {
      this.User_password = this.UserDocumentForm.value.password;
      this.User_conpassword = this.UserDocumentForm.value.con_password;
      if (this.User_password === this.User_conpassword) {
        this.prsnlconfirmpassWordToggle = true;
        console.log(true);
      }
      else {
        this.prsnlconfirmpassWordToggle = false;
        console.log(false);
      }
    }
  }


}


