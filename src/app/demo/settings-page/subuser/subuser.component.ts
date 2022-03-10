import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-subuser',
  templateUrl: './subuser.component.html',
  styleUrls: ['./subuser.component.scss']
})
export class SubuserComponent implements OnInit {
  show: boolean = true;
  subuserForm:FormGroup;

  constructor() { }

  ngOnInit() {
    this.subuserForm = new FormGroup({

      subCat: new FormControl('selectuser'),
    
    });
  }

  minimize(){
    this.show = !this.show;
  }

}
