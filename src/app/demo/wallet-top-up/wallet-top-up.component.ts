import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { AngularFireStorage } from "@angular/fire/storage";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import * as vex from 'vex-js';
import { WalletTopUpService } from "./wallet-top-up.service";

@Component({
    selector: 'app-wallet-top-up',
    templateUrl: './wallet-top-up.component.html',
    styleUrls: ['./wallet-top-up.component.scss']
})
export class WalletTopUpComponent implements OnInit, OnDestroy {
    userName: string;
    bankListHeaders = <any>[];
    banks = <any>[];
    addBankForm: FormGroup;
    unsub = new Subject();
    filenames = {passbook: '', cheque: '', allowedExtensions: ['application/pdf', 'image/jpg', 'image/jpeg', 'image/bmp', 'image/png', 'image/gif']};
    apiBanks: any;
    currentImageData = { image: '', type: '' };
    showBanklist = false;
    bankDetails = <any>[];
    @ViewChild('actionTemplate', { static: false }) actionTemplate: TemplateRef<any>;
    @ViewChild('imageTemplate', { static: false }) imageTemplate: TemplateRef<any>;
    @ViewChild('addBankModal', { static: false }) private addBankPopup: any;
    @ViewChild('imageModal', { static: false }) private imagePopup: any;

    constructor(
        private walletTopUpService: WalletTopUpService,
        private ngxSpinner: NgxSpinnerService,
        private fireStorage: AngularFireStorage
    ) {}

    ngOnInit() {
        const {userName} = JSON.parse(sessionStorage.getItem('dashboardData')).userInfo;
        this.userName = userName;

        this.fetchBanks();

        this.addBankForm = new FormGroup({
            bankName: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]),
            branchName: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z\s(,.)]*$/)]),
            ifscCode: new FormControl('', [Validators.required, Validators.minLength(11), Validators.minLength(11), Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]),
            accountNo: new FormControl('', [Validators.required, Validators.minLength(9), Validators.maxLength(18), Validators.pattern(/^[0-9]+$/)]),
            accountHolderName: new FormControl('', [ Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/), Validators.minLength(3), Validators.maxLength(50)]),
            accountType: new FormControl('', Validators.required),
            passbookUrl: new FormControl('', Validators.required),
            chequeUrl: new FormControl('', Validators.required)
        });

    }

    fetchBanks() {
        
        this.ngxSpinner.show('fetchBanksSpinner', { bdColor: "rgba(0, 0, 0, 0.5)", type: "timer" });
        this.walletTopUpService.getBanks({userName: this.userName})
        .pipe(finalize(() => {
            this.ngxSpinner.hide('fetchBanksSpinner');
        }))
        .subscribe(
            (res: any) => {
                // console.log('Fetch Banks Response: ', res);

                if (res.data.parant_user_bank) {
                    this.apiBanks = res.data.parant_user_bank;
                    this.banks = Object.values(res.data.parant_user_bank);
                    
                    this.bankListHeaders = Object.keys(this.banks[0]).filter(col => !['chequeUrl', 'passbookUrl'].includes(col)).map((col) => {
                        return { name: col.replace(/([A-Z])/g, ' $1') };
                    });
    
                    this.bankListHeaders.push({ name: 'Actions', cellTemplate: this.actionTemplate});
                }
            },
            (err: any) => {
                console.log('Fetch Banks Error: ', err);
                if (err.status >= 400 && err.status < 500) {
                    vex.dialog.alert(err.error.message);
                } else {
                    vex.dialog.alert('Server Error');
                }
            }
        )
    }

    observePassbook(e: any) {

        // console.log('Passbook Change Event: ', e);
        // console.log('Passbook Change Event Target Value: ', e.target.value);
        console.log('Passbook Change Event Target Value File: ', e.target.files);

        let passbookValue = '';
        if (e.target.value) {
            passbookValue = e.target.value.split('\\').pop();
            this.uploadFile({file: e.target.files[0], type: 'passbook'});
        } 
        this.filenames.passbook = passbookValue;

    }

    observeCheque(e: any) {

        let chequeValue = '';
        if (e.target.value) {
            chequeValue = e.target.value.split('\\').pop();
            this.uploadFile({file: e.target.files[0], type: 'cheque'});
        } 
        this.filenames.cheque = chequeValue;


    }

    uploadFile(uploadData: {file: any, type: string}) {
        console.log('File: ', uploadData.file);

        if (this.filenames.allowedExtensions.includes(uploadData.file.type)) {
            console.log('File Allowed.');

            const {userInfo: {adminName}} = JSON.parse(sessionStorage.getItem('dashboardData'));
            const {userInfo: {userName}} = JSON.parse(sessionStorage.getItem('dashboardData'));
            const filePath = `CSP Onboarding Data/${adminName}/Sneharoy@1/${userName}/${uploadData.type}${new Date()}.png`;

            if (uploadData.file.size > 1024000) {
                console.log('Maximum File Size.');
            } else {

                const fileRef = this.fireStorage.ref(filePath);

                this.ngxSpinner.show('fileUploadSpinner', { bdColor: "rgba(0, 0, 0, 0.5)", type: "timer" });
                this.fireStorage.upload(filePath , uploadData.file)
                .snapshotChanges()
                .pipe(finalize(() => {

                    fileRef.getDownloadURL().subscribe(url => {
                        console.log('File URL: ', url)

                        const fileControl = uploadData.type == 'passbook' ? { passbookUrl: url } : { chequeUrl: url };
                        this.addBankForm.patchValue(fileControl);

                        this.ngxSpinner.hide('fileUploadSpinner');

                    });

                }))
                .subscribe(url => {
                    console.log('Upload URL: ', url);
                });

            }

        } else {
            console.log('File Not Allowed.');
        }
    }

    addBank() {
        console.log('Add Bank Form Value: ', this.addBankForm.value);

        const addBankData = {
            userName: this.userName,
            parant_user_bank: {
                ...this.apiBanks,
                [`Bank${this.banks.length + 1}`]: this.addBankForm.value
            }
        }

        console.log('Add Bank Submitted Data: ', addBankData);

        this.ngxSpinner.show('addBankSpinner', { bdColor: "rgba(0, 0, 0, 0.5)", type: "timer" });
        this.walletTopUpService.addBank(addBankData)
        .pipe(finalize(() => {
            this.ngxSpinner.hide('addBankSpinner');
        }))
        .subscribe(
            (res: any) => {
                console.log('Add Bank Response: ', res);

                this.addBankPopup.hide();
                this.addBankForm.reset();
                this.filenames.passbook = this.filenames.cheque = (<HTMLInputElement>document.getElementById('validatedCustomFilePassbook')).value = (<HTMLInputElement>document.getElementById('validatedCustomFileCheque')).value = '';
                this.fetchBanks();
            },
            (err: any) => {
                console.log('Add Bank Error: ', err);
            }
        );
    }

    showImage(imageData: {image: string, type: string}) {
        console.log('Selected Bank Image Data: ', imageData);

        window.open(imageData.image, '_blank')
        // this.currentImageData.image = imageData.image;
        // this.currentImageData.type = imageData.type;
        // this.imagePopup.show();
    }

    searchBank(e) {

        const query = {
            "size": 1000,
            "query": {
                "bool": {
                    "filter": {
                        "multi_match": {
                            "query": e.target.value,
                            "type": "phrase_prefix",
                            "fields": [
                                "bank_code",
                                "bank_name"
                            ],
                            "lenient": true
                        }
                    }
                }
            }
        };
        
        this.walletTopUpService.searchBank(query)
        .pipe(finalize(() => {
            this.showBanklist = true;
        }))
        .subscribe(
            (res: any) => {
                this.bankDetails = res.hits.hits.map(hit => { 
                    return { 
                        bankName: hit._source.bank_name, 
                        ifsc: hit._source.ifsc_code
                    }
                });
            },
            (err: any) => {
                console.log('Bank Error: ', err);
            }
        );
    }

    populatebank(bank: any) {
        this.showBanklist = false;
        console.log('Selected Bank: ', bank);
        this.addBankForm.patchValue({
            ifscCode: bank.ifsc,
            bankName: bank.bankName
        });
    }

    ngOnDestroy() {
        this.unsub.next(true);
        this.unsub.complete();
    }
}