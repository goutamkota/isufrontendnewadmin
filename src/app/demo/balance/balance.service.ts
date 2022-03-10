import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { BalanceAPI } from './balance.api';
import * as XLSX from 'xlsx';
import { DatePipe } from "@angular/common";

@Injectable({
    providedIn: 'root'
})
export class BalanceService {
    constructor(
        private http: HttpClient,
        private datePipe: DatePipe
    ) {}

    addBalance(balanceData: any) {
        return this.http.post(BalanceAPI.addBalance, balanceData);
    }
    trans(balanceData: any) {
        return this.http.post(BalanceAPI.trans, balanceData);
    }

    transferBalance(transferData: any) {
        return this.http.post(BalanceAPI.transferBalance, transferData);
    }

    fetchBalanceRequests(balanceRequestData: any) {
        return this.http.post(BalanceAPI.balanceRequest, balanceRequestData);
    }
    
    updateRequestStatus(statusData: any) {
        return this.http.post(BalanceAPI.updateStatus, statusData);
    }
    
    fetchWalletTopUpReports(reportData: any) {
        return this.http.post(BalanceAPI.balanceRequest, reportData)
    }

    eUsersAPI(e: any, userName) {
        const data = {
            "size":10000,
            "from":0,
            "query":{
               "bool":{
                  "must":[
                     {
                        "match": { "parent_a":{ "query": userName } }
                     }
                  ],
                  "filter":{
                     "multi_match":{
                        "query": e,
                        "type":"phrase_prefix",
                        "fields":[
                           "user_name",
                           "mobile_no",
                           "name"
                        ],
                        "lenient":true
                     }
                  }
               }
            }
        };
        const elasticURL = 'https://b61295e3bdc84097ac04e0456792cac1.us-central1.gcp.cloud.es.io:9243/isu_elastic_user/_search';
        return this.http.post(elasticURL, data)
        .pipe(
            map((res: any) => res.hits.hits.map((hit: any) => { return { userName: hit._source.user_name, userId: hit._source.user_id, name: hit._source.name, mobile: hit._source.mobile_no }; }))
        );
    }

    generateExcel(data: Array<any>, selCols = []) {
        const formattedData = data.map(record => { 
            const frecord = {...record};
            frecord.Id = `#${frecord.Id}`;
            frecord.depositDateTime = `${this.datePipe.transform(frecord.depositDateTime, 'M/d/y H:mm')}`;
            frecord.requestDateTime = `${this.datePipe.transform(frecord.requestDateTime, 'M/d/y H:mm')}`;
            frecord.approvalTime = `${this.datePipe.transform(frecord.approvalTime, 'M/d/y H:mm')}`;
            return frecord; 
        });


        // const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData);
        const wb: XLSX.WorkBook = {Sheets: {Sheet1: ws}, SheetNames: ['Sheet1']};
        XLSX.writeFile(wb, 'report.xlsx');
    }
}