import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-changetheme',
  templateUrl: './changetheme.component.html',
  styleUrls: ['./changetheme.component.scss']
})
export class ChangethemeComponent implements OnInit {
  priActiveTab: any = 1;
  [x: string]: any;
  show: boolean = true;
  uploadbtn:boolean=false;
  cancelbtn:boolean=false;
  editbtn:boolean=true;
  savebtn:boolean=false;
  deletebtn:boolean=false;
  checkbtn:boolean=true;

  constructor() { }

  ngOnInit() {
  }

  minimize(){
    this.show = !this.show;
  }

  showbtn()
{
  this.uploadbtn=true;
  this.cancelbtn=true;
  this.editbtn=false;
}
  cancel()
  {
    this.editbtn=true;
    this.uploadbtn=false;
    this.cancelbtn=false;
  }

  enablebtn()
  {
   this.savebtn=true;
   this.deletebtn=true;
   this.checkbtn=false;
  }

  closebtn()
  {
    this.savebtn=false;
   this.deletebtn=false;
   this.checkbtn=true;
  }

}
