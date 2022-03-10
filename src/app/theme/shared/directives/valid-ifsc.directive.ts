import { Directive, ElementRef, HostListener } from "@angular/core";

@Directive({
    selector: '[validIfsc]'
})
export class ValidIfscDirective {
    constructor(
        private el: ElementRef
    ) { }

    @HostListener('keypress', ['$event']) validateIfsc (e: any) {
        if(this.el.nativeElement.value.length >= 11) { return false; }
        if (e.keyCode >=65 && e.keyCode<=90) { // A-Z
            if ((this.el.nativeElement.value.length < 4) || (this.el.nativeElement.value.length > 4)) { return true; }
        }
        if (e.keyCode >=48 && e.keyCode<=57) { // 0-9
            if (((this.el.nativeElement.value.length === 4) && (e.keyCode === 48)) || (this.el.nativeElement.value.length > 4)) { return true; }
        }
        return false;
    }

    @HostListener('paste', ['$event']) validateIfscPaste(e: any) {
        const totalLength = this.el.nativeElement.value.length + e.clipboardData.getData('Text').length;
        if (/[A-Z]{4}0[A-Z0-9]{6}/.test(e.clipboardData.getData('Text')) && (totalLength === 11)) { return true; }
        return false;
    }

}