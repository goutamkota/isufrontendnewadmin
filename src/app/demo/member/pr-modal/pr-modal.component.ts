import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthConfig } from 'src/app/app-config';
import { MemberService } from '../member.service';

import {AppService}  from 'src/app/app.service';

@Component({
  selector: 'app-pr-modal',
  templateUrl: './pr-modal.component.html',
  styleUrls: ['./pr-modal.component.scss']
})
export class PrModalComponent implements OnInit {
  @Input() modalData:any;
  @Output() showModal = new EventEmitter();
  @Output() updateDtable = new EventEmitter();
  @Output() updateWallet = new EventEmitter();
  addBalanceForm = new FormGroup({
    user: new FormControl(''),
    amount: new FormControl('',Validators.required),
    remarks: new FormControl(' ',Validators.required)
  });
  searching:boolean;
  searchFailed: boolean;
  confirmModal = {
    show: false,
    msg: '',
    data: {}
  };
  paymentSuccess:boolean = false;

  constructor(
    private MemberService: MemberService,
    private http: HttpClient,
    private appservice : AppService
  ) { }

  ngOnInit() {
    
  }

  hideModal(){
    this.showModal.emit(false);
  }
  payDebitForm(t){
      let str,amount,remarks, apiBody, apiUrl;
      amount = this.addBalanceForm.get('amount').value;
      remarks = this.addBalanceForm.get('remarks').value;
        //user = this.addBalanceForm.get('user').value;
        apiBody = {"userName":this.modalData.user,"amount":amount,"remarks":remarks,"transaction":t.toUpperCase(),"api_user":"WEBUSER"};
        
        apiUrl = 'https://wallet-topup-new-prod.iserveu.tech/admin/user_wallet_topup';
     
        if(t == 'pay'){
          str = ' to '+this.modalData.user;
        }else{
          str = ' from '+this.modalData.user;
        }
      // var r = confirm('Are you sure to '+ t + ' ₹' + amount + str);
      this.confirmModal = {
        show: true,
        msg:'Are you sure to '+ t + ' ₹' + amount + str,
        data: {apiUrl:apiUrl,apiBody: apiBody, t:t, amount:amount, str:str}
      };
      
  }

  async priConfirmBal(data){
    this.searching = true;
    // let data = this.confirmModal.data;
    var url = await AuthConfig.config.encodeUrl(data.apiUrl)
    this.MemberService.members(url, data.apiBody)
      .subscribe(
        (res: any) => {
          this.searching = false;
          // this.paging.data = res.data;
          this.confirmModal.show = false;
          // this.priAlert( data.t + ' ₹' + data.amount + ' Successful' + data.str);
          this.priAlert( res.message, 'text-success');
          this.updateTable({w1Balance:data.amount, update:data.t,userName: data.apiBody.userName});
        },
        (err: any) => {
          this.searching = false;
          this.confirmModal.show = false;
          console.log(err);
          if(err.error.status == 0){
            this.priAlert( err.error.message, 'text-danger');
          }
        }
      )
  }
  updateTable(arg) {
    this.updateDtable.emit(arg);
  }

  priAlert(data, type=''){
    this.confirmModal.show = true;
    this.confirmModal.msg = data;
    this.confirmModal.data = {alert:true, class:type};
    this.appservice.fetchWalletBalance();
  }

}
