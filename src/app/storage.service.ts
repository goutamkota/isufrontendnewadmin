import { Injectable } from "@angular/core";
import { AppService } from "./app.service";

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    constructor(private appService: AppService) { }

    storeData() {

    }

    getData(key: string) {
        if (!sessionStorage.getItem(key)) {
            return this.appService.logOut();
        }
        return sessionStorage.getItem(key);
    }
}