import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(
        private http: HttpClient
    ) {}

    signUser(loginurl: string, userData: any) {
        return this.http.post(loginurl, userData);
    }

    getReqs(url: string) {
        return this.http.get(url);
    }

}