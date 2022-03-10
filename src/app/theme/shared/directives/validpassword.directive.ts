import { Directive, ElementRef , HostListener} from '@angular/core';

@Directive({
  selector: '[appValidpassword]'
})
export class ValidpasswordDirective {

  constructor(   private el: ElementRef) { }


  @HostListener('paste', ['$event']) validateCopied(e: any) {
    const totalLength = this.el.nativeElement.value.length + e.clipboardData.getData('Text').length;
    if (/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/.test(e.clipboardData.getData('Text')) && (totalLength === 10)) { return true; }
    return false;
}

}
