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
  iconData?: { [key: string]: { name: string; tooltip?: string; route: string } }

  @Input('tabWidth') tabWidth?: number;


  constructor(private iconService: IconService,
              private sanitizer: DomSanitizer,
              private cdr: ChangeDetectorRef) {

  }

  getIconData(obj: Event): { icon: string, tooltip: string } {
    const defaultIcon = { icon: 'pathway', tooltip: 'Unknown Event' };

    if(! this.iconData) return defaultIcon;

    if (obj.schemaClass === 'EntityWithAccessionedSequence') {
      if (obj.className !== 'EntityWithAccessionedSequence' && obj.referenceType) {
        const referenceTypeIcon = this.iconData[obj.referenceType];
        return referenceTypeIcon ? { icon: referenceTypeIcon.name, tooltip: referenceTypeIcon.tooltip! } : { icon: 'protein', tooltip: 'Protein' };
      } else {

        const entityIcon = this.iconData[obj.schemaClass];
        return entityIcon ? { icon: entityIcon.name, tooltip: entityIcon.tooltip! } : defaultIcon;
      }
    }


    const schemaIcon = this.iconData[obj.schemaClass];
    return schemaIcon ? { icon: schemaIcon.name, tooltip: schemaIcon.tooltip! } : defaultIcon;
  }




  OpenDetailsPage(stId: string) {
    const url = `${environment.host}/content/detail/${stId}`;
    window.open(url, '_blank');
  }

  ngAfterViewInit(): void {

    this.iconData = this.iconService.getObjectIcons();

    if (this.obj && this.obj.referenceEntity) {
      const identifier = this.obj.referenceEntity.identifier
      console.log("identifier", identifier)
      this.iconService.getIconDetails(identifier).subscribe(icon => {
        console.log(icon);
        const sanitizedSvg = this.sanitizer.bypassSecurityTrustHtml(icon);
        this.iconContent = sanitizedSvg as string;
        if (this.iconContent) {
          this.cdr.detectChanges();
        }
      });
    }
  }

}
