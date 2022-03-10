import { Directive, ElementRef, HostListener } from "@angular/core";

@Directive({
  selector: '[validAmountWithDecimal]'
})
// export class ValidAmountDirective implements OnInit {
export class ValidAmountWithDecimalDirective {

  constructor(
    private el: ElementRef
  ) {  }

  @HostListener('keypress', ['$event']) validatePin(e: any) {
    if (e.charCode === 46) { return true; }
    if (e.charCode < 48 || e.charCode > 57) { return false; }
  }

  @HostListener('paste', ['$event']) validateCopied(e: any) {
    const totalLength = this.el.nativeElement.value.length + e.clipboardData.getData('Text').length;
    if (/^[0-9]+$/.test(e.clipboardData.getData('Text'))) { return true; }
    return false;
  }
}
