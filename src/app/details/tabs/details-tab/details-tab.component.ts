import {AfterViewInit, ChangeDetectorRef, Component, Input} from '@angular/core';
import {Event, InstanceEdit} from "../../../model/event.model";
import {Analysis} from "../../../model/analysis.model";
import {environment} from "../../../../environments/environment";
import {DomSanitizer} from "@angular/platform-browser";
import {IconService} from "../../../services/icon.service";
import {Router} from "@angular/router";
import {sortByYearDescending} from "../../../services/utils";


@Component({
  selector: 'cr-details-tab',
  templateUrl: './details-tab.component.html',
  styleUrl: './details-tab.component.scss'
})
export class DetailsTabComponent implements AfterViewInit {

  @Input('event') obj?: Event;
  @Input('analysisResult') analysisResult?: Analysis.Result;
  @Input('tabWidth') tabWidth?: number;

  iconContent: string = '';
  currentUrl!: string;
  authorship: { label: string, data: InstanceEdit[] }[] = []

  elements = [
    {key: 'input', label: 'Inputs'},
    {key: 'output', label: 'Outputs'},
    {key: 'catalystActivity', label: 'Catalyst Activity'},
    {key: 'inferredFrom', label: 'Inferred From'}
  ]

  constructor(private iconService: IconService,
              private sanitizer: DomSanitizer,
              private cdr: ChangeDetectorRef,
              private router: Router
  ) {
  }


  openDetailsPage(stId: string) {
    const url = `${environment.host}/content/detail/${stId}`;
    window.open(url, '_blank');
  }

  ngAfterViewInit(): void {

    if (!this.obj) return;

    this.currentUrl = this.router.url

    if (this.obj.referenceEntity) {
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

    this.authorship = [
      ...(this.obj.authored?.length > 0 ? [{label: 'Author', data: this.obj.authored}] : []),
      ...(this.obj.reviewed?.length > 0 ? [{label: 'Reviewer', data: this.obj.reviewed}] : []),
    ];


    // Sort by year
    if (this.obj && this.obj.literatureReference) {
      this.obj.literatureReference = sortByYearDescending(this.obj.literatureReference);
    }

  }


  getIcon(obj: Event) {
    return this.iconService.getIconDetails(obj);
  }

  scrollToSection(sectionId: string) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({behavior: 'smooth'});
    }
  }

}
