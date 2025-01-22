import {Pipe, PipeTransform} from '@angular/core';
import {LiteratureReference} from "../../model/event.model";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";

@Pipe({
  name: 'includeRef'
})
export class IncludeRefPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {
  }

  transform(text: string, refs: LiteratureReference[]): SafeHtml {
    refs?.forEach(ref => {
      text = text.replaceAll(new RegExp(`${ref.author[0].surname}( ${ref.author[0].initial})? ?( et al\\.)?,? ${ref.year}`, 'g'), (match) => `<a href="${ref.url}">${match}</a>`);
      if (ref.author.length === 2) {
        let regExp = new RegExp(`${ref.author[0].surname}( ${ref.author[0].initial})? ?(and|\&) ${ref.author[1].surname}( ${ref.author[0].initial})? ?,? ${ref.year}`, 'g');
        console.log(regExp)
        text = text.replaceAll(regExp, (match) => `<a href="${ref.url}">${match}</a>`);
      }
    });
    return this.sanitizer.bypassSecurityTrustHtml(text)
  }

}
