import { Directive, ElementRef, HostListener } from "@angular/core";

@Directive({
    selector: '[validAccNum]'
})
export class ValidAccountNumberDirective {
    constructor(
        private ele: ElementRef
    ) {}

    @HostListener('keypress', ['$event']) validateAccNum(e: any) {
        if (e.charCode < 48 || e.charCode > 57) { return false; }
        if (this.ele.nativeElement.value.length >= 18) { return false; }
    }

    @HostListener('paste', ['$event']) validateCopied(e: any) {
        const totalLength = this.ele.nativeElement.value.length + e.clipboardData.getData('Text').length;
        if (/^[0-9]{9,18}$/.test(e.clipboardData.getData('Text')) && (totalLength <= 18)) { return true; }
        return false;
    }
}