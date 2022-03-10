import { Directive, ElementRef, Renderer2 } from "@angular/core";
import { NgxSpinnerService } from "ngx-spinner";

@Directive({
    selector: '[imageError]',
    host: {
        '(error)': 'updateUrl()',
        '(load)': 'loadingUrl()',
    }
})
export class ImageErrorDirective {
    constructor(private el: ElementRef, private renderer: Renderer2, private ngxSpinner: NgxSpinnerService) {}

    updateUrl() {
        this.renderer.setAttribute(this.el.nativeElement, 'src', this.el.nativeElement.getAttribute('errsrc'))
    }

    loadingUrl() {
        // this.ngxSpinner
    }
}