import { DatePipe } from "@angular/common";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  RRN_URL = 'https://dmttest.iserveu.online/GATEWAY-v2/';
  public SHOP_URL = 'https://itpl.iserveu.tech/user/user_details';
  verifymob_url = 'https://legality.iserveu.online/document/createDoc';

  constructor(
    private http: HttpClient,
    private datePipe: DatePipe
  ) { }

  transactionAPI(encURL, reportData: any) {
    return this.http.post(encURL, reportData);
  }
  rechargereportAPI(encURL, reportData: any) {
    return this.http.post(encURL, reportData);
  }

  
  fetchuserAPI(encURL) {
    return this.http.get(encURL);
  }

  fetchpdfdata(url,txnid){
    return this.http.post(url,txnid)
  }

  eUsersAPI(eData: any) {
    const elasticURL = 'https://elasticsearch.iserveu.tech/isu_elastic_user/_search';
    return this.http.post(elasticURL, eData);
  }

  transRetryAPI(txnID: number) {
    return this.http.get(`${this.RRN_URL}manual-retry/${txnID}`);
  }

  verifyRefundOTP(otpData: { transactionId: any, otp: any }) {
    return this.http.post(`${this.RRN_URL}verify-otp/`, otpData)
  }

  resendRefundOTP(txnID: any) {
    return this.http.get(`${this.RRN_URL}resend-otp/${txnID}`);
  }

  fetchRRN(txnID: string) {
    return this.http.get(`${this.RRN_URL}gateway-txns/${txnID}`);
  }

  fetchShopName2(encUrl: string) {
    return this.http.get(encUrl);
  }
  fetchRefunds(refundData: any) {
    // return this.http.post('https://refundidbymob-vn3k2k7q7q-uc.a.run.app/refundidbymob', refundData);
    return this.http.post('https://refundidbymob.iserveu.tech/refundidbymob', refundData);
  }

  generateExcel(data: Array<any>, selCols = []) {
    const selectedCols = selCols.map(col => col.prop);
    const keys = Object.keys(data[0]);
    const selectedRecords = keys.filter(col => selectedCols.includes(col));

    const formattedData = data.map(record => {
      const frecord = { ...record };
      frecord.Id = `#${frecord.Id}`;
      frecord.createdDate = `${this.datePipe.transform(frecord.createdDate, 'M/d/y H:mm')}`;
      frecord.updatedDate = `${this.datePipe.transform(frecord.updatedDate, 'M/d/y H:mm')}`;
      frecord.gateWayData = (typeof frecord.gateWayData === 'object') ? frecord.gateWayData.map(data => JSON.stringify(data)).join(', ') : frecord.gateWayData;
      if ('relationalId' in frecord) {
        frecord.relationalId = frecord.relationalId ? `#${frecord.relationalId}` : frecord.relationalId;
      }
      return frecord;
    });


    // const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData, { header: [...selectedRecords] });
    const range = XLSX.utils.decode_range(ws['!ref']);
    range.e['c'] = selectedRecords.length - 1;
    ws['!ref'] = XLSX.utils.encode_range(range);
    const wb: XLSX.WorkBook = { Sheets: { Sheet1: ws }, SheetNames: ['Sheet1'] };
    XLSX.writeFile(wb, 'report.csv');
  }
  verifylostmob(ygytg) {
    return this.http.post(`${this.verifymob_url}`, ygytg)
  }
}
