import { Directive, ElementRef, HostListener } from "@angular/core";

@Directive({
    selector: '[validBeneName]'
})
export class ValidBeneNameDirective {

    constructor(private el: ElementRef) {}

    @HostListener('keypress', ['$event']) validatePin(e: any) {
        if (this.el.nativeElement.value.length >= 30) { return false; }
        if (e.keyCode >=65 && e.keyCode<=90) { return true; } // A-Z
        if (e.keyCode >= 97 && e.keyCode <= 122) { return true; } // a-z
        if (e.keyCode === 32) { return true; } // Space
        return false;
    }
    
    @HostListener('paste', ['$event']) validateCopied(e: any) {
        const totalLength = this.el.nativeElement.value.length + e.clipboardData.getData('Text').length;
        if (totalLength >= 3 && totalLength <= 30) { 
            return /^[a-zA-Z ]+$/.test(e.clipboardData.getData('Text'));
        }
        return false;
    }

}