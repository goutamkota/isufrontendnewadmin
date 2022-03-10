import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";



@Injectable({
  providedIn: 'root'
})
export class DatatableService {


  constructor(private http:HttpClient) { }

  

  public showUserData1(data) {
    return this.http.post('https://showuseremailsendstaging-zwqcqy3qmq-uc.a.run.app/showuserParentmail',data);
  }

  public showUserData2(data) {
   
    return this.http.post('https://showuseremailsendstaging-zwqcqy3qmq-uc.a.run.app/showusermail', data);
  }

  public showUserData3(data) {

    return this.http.post('https://showuseremailsendstaging-zwqcqy3qmq-uc.a.run.app/userdetailsmail', data);
  }

  public showUserData4(data) {
    return this.http.post('https://showuseremailsendstaging-zwqcqy3qmq-uc.a.run.app/resentOnBoardUsermail', data);
  }
}
