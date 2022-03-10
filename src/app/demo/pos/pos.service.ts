import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PosService {

  constructor(private http: HttpClient) { }

  posAPI(dapi, dData: any) {
    return this.http.post(dapi, dData);
  }
}








// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';



// @Injectable({

//   providedIn: 'root'

// })

// export class PosService {



//   constructor(private http: HttpClient) { }



//   posAPI(dapi, dData: any) {

//     return this.http.post(dapi, dData);

//   }


