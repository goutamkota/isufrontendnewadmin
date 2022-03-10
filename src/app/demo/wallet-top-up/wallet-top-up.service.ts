import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { WalletTopUpAPI } from './wallet-top-up.api'

@Injectable({
    providedIn: 'root'
})
export class WalletTopUpService {
    constructor(
        private http: HttpClient
    ) {}

    getBanks(postData: any) {
        return this.http.post(WalletTopUpAPI.fetchBanks, postData);
    }

    addBank(postData: any) {
        return this.http.post(WalletTopUpAPI.addBank, postData);
    }

    searchBank(eData) {
        const elasticURL = 'https://b61295e3bdc84097ac04e0456792cac1.us-central1.gcp.cloud.es.io:9243/isu_bank/_search';
        return this.http.post(elasticURL, eData);
    }
}