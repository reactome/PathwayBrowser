import { Pipe, PipeTransform } from '@angular/core';
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";

@Pipe({
  name: 'scientificNumber'
})
export class ScientificNumberPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(value?: number ): SafeHtml {
    if (!value) return "";
    return this.sanitizer.bypassSecurityTrustHtml(value.toExponential(2).replace(/e\+?/, "x10<sup>") + '</sup>');
  }

}
