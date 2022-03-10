import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthConfig } from 'src/app/app-config';
// import { Store } from '@ngrx/store';
@Injectable({
  providedIn: 'root'
})
export class MemberService {


  constructor(
    private http: HttpClient
  ) { }

  members(url,body:any){
    return this.http.post(url,body)
  }
  fetchuserfeature(url){
    return this.http.get(url)
  }
  sendotp(url,body:any){
    return this.http.post(url,body)
  }
  updatefeature(abc:any,body:any){
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Basic ZWxhc3RpYzpUQWhJamJ4U2RzRzRRRDY3WWVmZTZQdzg=`
    });

    let options = { headers: headers };
    return this.http.post(abc,body,options)
  }
  updatefeature1(abc:any,body:any){
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Basic ZWxhc3RpYzpUQWhJamJ4U2RzRzRRRDY3WWVmZTZQdzg=`
    });

    let options = { headers: headers };
    return this.http.post(abc,body,options)
  }
}
