import { Directive, ElementRef, HostListener } from "@angular/core";

@Directive({
  selector: '[validAmount]'
})
// export class ValidAmountDirective implements OnInit {
export class ValidAmountDirective {

  constructor(
    private el: ElementRef
  ) {  }

  // ngOnInit() {
  //   console.log('Amount: ', this.amount);
  // }

  @HostListener('keypress', ['$event']) validatePin(e: any) {
    if (e.charCode < 48 || e.charCode > 57) { return false; }
    // console.log('Amount Value: ', e.target.value);
    // if (this.el.nativeElement.value.length >= 10) { return false; }
  }

  @HostListener('paste', ['$event']) validateCopied(e: any) {
    const totalLength = this.el.nativeElement.value.length + e.clipboardData.getData('Text').length;
    if (/^[0-9]+$/.test(e.clipboardData.getData('Text'))) { return true; }
    return false;
  }
}
