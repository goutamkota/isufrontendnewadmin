import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import {AuthConfig, NextConfig} from 'src/app/app-config';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
  public nextConfig: any;
  public menuClass: boolean;
  public collapseStyle: string;
  public windowWidth: number;
  userData: any;
  imageData = {url: 'assets/images/abstract-user-flat-4.svg', brand: ''};

  @Output() onNavCollapse = new EventEmitter();
  @Output() onNavHeaderMobCollapse = new EventEmitter();

  constructor(
    private fireStore: AngularFirestore,
    private adminService: AdminService
  ) {
    this.nextConfig = NextConfig.config;
    this.menuClass = false;
    this.collapseStyle = 'none';
    this.windowWidth = window.innerWidth;
  }

  ngOnInit() { 
    this.userData = JSON.parse(sessionStorage.getItem('dashboardData'));
    this.imageData.brand = JSON.parse(this.userData.userInfo.userBrand).brand;
    this.getMaster();
  }

  toggleMobOption() {
    this.menuClass = !this.menuClass;
    this.collapseStyle = (this.menuClass) ? 'block' : 'none';
  }

  navCollapse() {
    if (this.windowWidth >= 992) {
      // Making the table's header and body width to 100% when sidebar collapses
      if (document.querySelector('.datatable-header')) {
        document.querySelector('.datatable-header').classList.add('w-100-p');
      }
      if (document.querySelector('.datatable-body')) {
        document.querySelector('.datatable-body').classList.add('w-100-p');
      }

      this.onNavCollapse.emit();
    } else {
      this.onNavHeaderMobCollapse.emit();
    }
  }

  async getMaster() {
    let masterName = '';

    if (['ROLE_MASTER_DISTRIBUTOR', 'ROLE_ADMIN'].includes(this.userData.userInfo.userType)) {
      masterName = (this.userData.userType === 'ROLE_MASTER_DISTRIBUTOR') ? this.userData.userInfo.userName : '';
      this.getImage(masterName);
    } else {
      const encUrl = await AuthConfig.config.encodeUrl('https://itpl.iserveu.tech/findMasterDistributerName');
      this.adminService.getMasterName(encUrl, this.userData.userInfo.userName)
      .subscribe(
        (res: any) => { 
          // console.log('Get Master Name Res: ', res); 
          this.getImage(res.masterDistributor); 
        },
        (err: any) => { 
          console.log('Get Master Name Error: ', err); 
        }
      );
    }
  }

  getImage(masterName: string) {
    this.fireStore.collection('customMDBrands').ref.where('name', '==', masterName.toLowerCase()).onSnapshot(
      query => {
          const typeNEW = query.empty ? 'ADMIN_PROFILE' : 'MASTERDISTRIBUTOR_PROFILE';
          const BRANDNAMENOW = query.empty ? this.userData.userInfo.adminName : masterName;

          this.imageData.url = `https://firebasestorage.googleapis.com/v0/b/iserveu_storage/o/${typeNEW}%2F${BRANDNAMENOW}%2FprofileImg.png?alt=media&token=2bc9b5da-1985-4152-8cc3-45ebc1b72ab6`;
      }
  );
  }

}
