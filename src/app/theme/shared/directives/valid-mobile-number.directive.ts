import { Directive, ElementRef, HostListener } from "@angular/core";

@Directive({
  selector: '[validMobile]'
})
export class ValidMobileDirective {
  constructor(
    private el: ElementRef
  ) { }

  @HostListener('keypress', ['$event']) validatePin(e: any) {
    if (e.charCode < 48 || e.charCode > 57) { return false; }
    if (this.el.nativeElement.value.length >= 10) { return false; }
  }

  @HostListener('paste', ['$event']) validateCopied(e: any) {
    const totalLength = this.el.nativeElement.value.length + e.clipboardData.getData('Text').length;
    if (/^[0-9]{10}$/.test(e.clipboardData.getData('Text')) && (totalLength === 10)) { return true; }
    return false;
  }
}
