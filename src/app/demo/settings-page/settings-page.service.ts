import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsPageService {

  smsUrl = new Subject<any>();
  switching_res = new Subject<any>();
  public search = new BehaviorSubject<string>("");

  constructor(private http: HttpClient) { }

  sms_api(api: any) {
    return this.http.get(api);
  }
  devicemapping_api(api: any) {
    return this.http.get(api);
  }
  switching_api_save(api, Data: any) {
    return this.http.post(api, Data);
  }
  sms_api_save(api, Data: any) {
    return this.http.post(api, Data);
  }
  searchUser(eData) {

    let headers = new HttpHeaders({

      'Content-Type': 'application/json',
    });


    const elasticURL = 'https://elasticuserprod-vn3k2k7q7q-uc.a.run.app/search/?';
    return this.http.post(elasticURL, eData);
  }

 mappedDevice(data)
 {
   const apiurl = 'https://matm-admin-maping-vn3k2k7q7q-uc.a.run.app/create?';
   return this.http.post(apiurl,data);
 }
    

  

}

