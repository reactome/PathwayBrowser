import {Pipe, PipeTransform, SecurityContext} from '@angular/core';
import {DomSanitizer, SafeHtml, SafeResourceUrl, SafeScript, SafeStyle, SafeUrl} from "@angular/platform-browser";
import {by} from "ng-packagr/lib/graph/select";

@Pipe({
  name: 'safe'
})
export class SafePipe implements PipeTransform {


  constructor(protected sanitizer: DomSanitizer) {
  }

  transform(value: string, type: 'html' | 'style' | 'script' | 'url' | 'resource' = "html", bypass: boolean = false): string | SafeHtml | SafeUrl | SafeStyle | SafeScript | SafeResourceUrl {
    let val: string | SafeHtml | SafeUrl | SafeStyle | SafeScript | SafeResourceUrl = value;
    if (bypass) {
      switch (type) {
        case "html":
          return this.sanitizer.bypassSecurityTrustHtml(value);
        case "style":
          return this.sanitizer.bypassSecurityTrustStyle(value);
        case "script":
          return this.sanitizer.bypassSecurityTrustScript(value);
        case "url":
          return this.sanitizer.bypassSecurityTrustUrl(value);
        case "resource":
          return this.sanitizer.bypassSecurityTrustResourceUrl(value);
      }
    } else {
      switch (type) {
        case 'html':
          return this.sanitizer.sanitize(SecurityContext.HTML, val) || '';
        case 'style':
          return this.sanitizer.sanitize(SecurityContext.STYLE, val) || '';
        case 'script':
          return this.sanitizer.sanitize(SecurityContext.SCRIPT, val) || '';
        case 'url':
          return this.sanitizer.sanitize(SecurityContext.URL, val) || '';
        case 'resource':
          return this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, val) || '';
      }
    }
  }
}
