import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthConfig } from 'src/app/app-config';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    authConfig: any;
    constructor(
        private http: HttpClient
    ) {
        this.authConfig = AuthConfig.config;
    }

    getLoginToken() {
        return this.http.post('https://itpl.iserveu.tech/getlogintoken.json', {username: this.authConfig.userName, password: this.authConfig.userPass});
    }

    getMasterName(encUrl: string, username: string) {
        return this.http.post(encUrl, {username});
    }

}