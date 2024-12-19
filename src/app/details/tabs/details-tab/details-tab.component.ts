import {AfterViewInit, ChangeDetectorRef, Component, Input} from '@angular/core';
import {Event} from "../../../model/event.model";
import {Analysis} from "../../../model/analysis.model";
import {environment} from "../../../../environments/environment";
import {DomSanitizer} from "@angular/platform-browser";
import {IconService} from "../../../services/icon.service";


@Component({
  selector: 'cr-details-tab',
  templateUrl: './details-tab.component.html',
  styleUrl: './details-tab.component.scss'
})
export class DetailsTabComponent implements AfterViewInit {

  @Input('event') obj?: Event;
  @Input('analysisResult') analysisResult?: Analysis.Result;
  iconContent: string = '';


  @Input('tabWidth') tabWidth?: number;


  constructor(private iconService: IconService,
              private sanitizer: DomSanitizer,
              private cdr: ChangeDetectorRef,
              ) {
  }



  OpenDetailsPage(stId: string) {
    const url = `${environment.host}/content/detail/${stId}`;
    window.open(url, '_blank');
  }

  ngAfterViewInit(): void {

    if (this.obj && this.obj.referenceEntity) {
      const identifier = this.obj.referenceEntity.identifier;
      this.iconService.fetchIcon(identifier).subscribe(icon => {
        if (icon && this.obj) {
          const sanitizedSvg = this.sanitizer.bypassSecurityTrustHtml(icon);
          this.iconContent = sanitizedSvg as string;
          this.obj.hasIcon = true;
          this.cdr.detectChanges();
        }
      });
    }
  }


  getIcon(obj: Event) {
    return this.iconService.getIconDetails(obj);
  }

}
