import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs/operators';
import { AuthConfig } from 'src/app/app-config';
import { SettingsPageService } from '../settings-page.service';
import { SettingApi } from '../settings_page.api';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ReadVarExpr } from '@angular/compiler';
import * as vex from 'vex-js';

@Component({
  selector: 'app-devicemapping',
  templateUrl: './devicemapping.component.html',
  styleUrls: ['./devicemapping.component.scss']
})
export class DevicemappingComponent implements OnInit {

  devicemapping_res: any;
  devicemapping_response: any;
  devicemapping_response2: any;
  cancel: boolean = false;
  save: boolean = true;
  save_input: boolean = false;
  show: boolean = true;
  DeviceMappingForm: FormGroup;
  MappingModalForm: FormGroup;
  UpdateDeviceForm: FormGroup;
  status: any;
  isModal1: string;
  result: any;
  // searchValue:string;
  public searchkey: string = "";
  id1: any;
  name: any;
  id2: any;
  id3: any;
  name2: any;
  retailer_name = <any>[];
  r_name = <any>[];
  showAutcompleteList: boolean;
  username1: any;
  eResults: any;
  showAutcompleteList1: boolean;
  elasticRes1Div: any;
  objectData: any;
  userrole: any;
  elasticResDiv: any;
  showUser: boolean;
  userDetails: any;
  username: any;
  usertype: any;
  mappedUser: any;
  mappedUserName: void;
  userdata: any;
  logiName: any;
  loginRole: any;


  constructor(private settingService: SettingsPageService,
    private http: HttpClient,
    private ngxSpinner: NgxSpinnerService) { }

  ngOnInit() {

    
      this.ngxSpinner.show('devicemappingSpinner');
      this.settingService.devicemapping_api(SettingApi.url.devicemapping).subscribe(res_data => {
        this.ngxSpinner.hide('devicemappingSpinner');
        this.devicemapping_res = res_data;
        this.devicemapping_response = this.devicemapping_res.data;
        this.devicemapping_response2 = this.devicemapping_res.data;
        console.log(this.devicemapping_res);
        // for (let i = 0; i < this.devicemapping_res.length; i++) {
        //   this.status = this.devicemapping_res.data[i].is_mapped;

        // }
        let j = 0;

        for (let i = 0; i < this.devicemapping_response.length; i++) {
          if (this.devicemapping_response[i].mapped_retailer != null) {
            if (!this.retailer_name.includes(this.devicemapping_response[i].mapped_retailer)) {
              this.retailer_name[j] = this.devicemapping_response[i].mapped_retailer;
              j++;

            }
          }
        }

      });
    

    this.userdata = JSON.parse(sessionStorage.getItem('dashboardData'));
    console.log(this.userdata, "++++");
    this.logiName = this.userdata.userInfo.userName;
    console.log(this.logiName, "USERNAME");
    this.loginRole = this.userdata.userInfo.userType;
    console.log(this.loginRole, "USERTYPE");


    this.retailer_name.forEach(val => this.r_name.push(val));
    this.DeviceMappingForm = new FormGroup({

      search: new FormControl(''),
      status: new FormControl('All'),
    });

    this.MappingModalForm = new FormGroup({

      userName: new FormControl('')

    });

    this.UpdateDeviceForm = new FormGroup({

      updateDevice: new FormControl('')

    });

  }

  minimize() {
    this.show = !this.show;
  }

  async save_all() {

    const Data = {


    };
  }

  searchname(evt) {

    var resultArray = this.retailer_name.filter((name) => {
      if (name.toLowerCase().includes(evt.toLowerCase())) {
        return true;
      }

    });

    console.log(resultArray);
    this.r_name.splice(0, this.r_name.length);
    resultArray.forEach(val => this.r_name.push(val));
  }

  search(evt) {
    // console.log(evt);

    //   var resultArray = this.devicemapping_res.data.filter((name) => {

    //     if(name.device_sl_no.toLowerCase().includes(evt.toLowerCase())){  
    //       return true;  
    //     }    

    // });


    // console.log(resultArray);

    if ('Mapped'.toLowerCase().includes(evt.toLowerCase())) {

      this.devicemapping_response = this.devicemapping_response2;

      var temp = this.devicemapping_response.filter(d => {

        if (d.is_mapped == true) {
          return true;
        }

      });

      console.log(temp);
      this.devicemapping_response = temp;
    }
    else if ('Available'.toLowerCase().includes(evt.toLowerCase())) {

      this.devicemapping_response = this.devicemapping_response2;

      var temp = this.devicemapping_response.filter(d => {

        if (d.is_mapped == false) {
          return true;
        }

      });

      console.log(temp);
      this.devicemapping_response = temp;
    }
    else {


      this.devicemapping_response = this.devicemapping_response2;

      var temp = this.devicemapping_response.filter(d => {

        const vals = Object.values(d);

        return new RegExp(evt, 'gi').test(vals.toString());

      });

      console.log(temp);
      this.devicemapping_response = temp;

    }

  }

  close_css_modal() {
    document.getElementById("myModal2").style.display = 'none';
  }

  close_css_modal3() {
    document.getElementById("myModal3").style.display = 'none';
  }
  close_css_modal4() {
    document.getElementById("myModal4").style.display = 'none';
  }

  show_mapping(ev) {
    console.log(ev);
    if (ev == 'All') {

      this.devicemapping_response = this.devicemapping_response2;

      var temp = this.devicemapping_response.filter(d => {

        if (d.is_mapped == true || d.is_mapped == false) {
          return true;
        }

      });

      console.log(temp);
      this.devicemapping_response = temp;
    }
    else if (ev == 'Mapped') {

      this.devicemapping_response = this.devicemapping_response2;

      var temp = this.devicemapping_response.filter(d => {

        if (d.is_mapped == true) {
          return true;
        }

      });

      console.log(temp);
      this.devicemapping_response = temp;
    }
    else if (ev == 'Available') {

      this.devicemapping_response = this.devicemapping_response2;

      var temp = this.devicemapping_response.filter(d => {

        if (d.is_mapped == false) {
          return true;
        }

      });

      console.log(temp);
      this.devicemapping_response = temp;
    }

  }

  showModal(id) {
    document.getElementById('myModal2').style.display = 'block';
    this.id1 = id;
  }
  showModal3(id, name) {
    document.getElementById('myModal3').style.display = 'block';
    this.id2 = id;
    this.name = name;
  }
  showModal4(id, name) {
    document.getElementById('myModal4').style.display = 'block';
    this.id3 = id;
    this.name2 = name;
  }




  getuser(event) {

    const data = {
      loginRole: this.loginRole,
      loginUser: this.logiName,
      searchkey: event.target.value

    };
    console.log(data);

    this.settingService.searchUser(data)
      .pipe(finalize(() => {
        this.showAutcompleteList = true;
      }))
      .subscribe(
        (res: any) => {
          console.log(res);
          if (res.status == 1) {
            const Username = res.data.map((user) => {
              return {
                username: user.user_name
              }

            })
            this.mappedUser = Username;
            this.mappedUser = Username.filter(res => res.username);
            console.log(this.mappedUser, "uname++");
          }

          // ;



        });

  }


  eSelectUser(obj) {
    console.log(obj);

    this.objectData = obj;
    this.showAutcompleteList = false;
    this.elasticResDiv = obj;

    this.MappingModalForm.controls.userName.setValue(obj.username);
    this.userrole = obj.username;
    console.log("userrole is: ", obj.username);
  }

  mappedUserDevice()
  {
    console.log(this.MappingModalForm.value);
    var uname=this.MappingModalForm.get('userName').value;
    var slno=this.id1;
    
    let body=
    {
      deviceId: slno,
      retailerName: uname,
    }
    
    this.settingService.mappedDevice(body).subscribe((res:any)=>{
        console.log(res);
        if (res['status'] == 0)
        {
          vex.dialog.alert(res);
        }
        
    })
    
  }

  

}


