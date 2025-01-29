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
    refs
      .filter(ref => ref && ref.url)
      .forEach(ref => {
        let replacer = (match: string) => `<a href="${ref.url}">${match}</a>`
        text = text.replaceAll(new RegExp(`${ref.author[0].surname}( ${ref.author[0].initial})? ?( et al[., ])? ?${ref.year}`, 'g'), replacer);
        if (ref.author.length === 2) {
          let regExp = new RegExp(`${ref.author[0].surname}( ${ref.author[0].initial})? ?(and|\&) ${ref.author[1].surname}( ${ref.author[0].initial})? ?,? ${ref.year}`, 'g');
          text = text.replaceAll(regExp, replacer);
        }
      });
    return this.sanitizer.bypassSecurityTrustHtml(text)
  }

}
