import {AfterViewInit, ChangeDetectorRef, Component, effect, Input} from '@angular/core';
import {Event, InstanceEdit} from "../../../model/event.model";
import {Analysis} from "../../../model/analysis.model";
import {DomSanitizer} from "@angular/platform-browser";
import {IconService} from "../../../services/icon.service";
import {sortByYearDescending} from "../../../services/utils";
import {ActivatedRoute} from "@angular/router";
import {toSignal} from "@angular/core/rxjs-interop";


@Component({
    selector: 'cr-description',
    templateUrl: './description.component.html',
    styleUrl: './description.component.scss',
    standalone: false
})
export class DescriptionComponent implements AfterViewInit {

  @Input('event') obj?: Event;
  @Input('analysisResult') analysisResult?: Analysis.Result;
  @Input('tabWidth') tabWidth?: number;

  iconContent: string = '';
  authorship: { label: string, data: InstanceEdit[] }[] = []

  elements = [
    {key: 'overview', label: 'Overview', manual: true},
    {key: 'literatureReference', label: 'References', manual: true},
    {key: 'authorship', label: 'Authorship', manual: true},
    {key: 'input', label: 'Inputs'},
    {key: 'output', label: 'Outputs'},
    {key: 'catalystActivity', label: 'Catalyst Activity'},
    {key: 'inferredFrom', label: 'Inferred From'}
  ]

  section = toSignal(this.route.fragment)

  constructor(private iconService: IconService,
              private sanitizer: DomSanitizer,
              private cdr: ChangeDetectorRef,
              private route: ActivatedRoute
  ) {
    effect(() => {
      !!this.section() && document.getElementById(this.section()!)?.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'start'});
    });
  }

  ngAfterViewInit(): void {

    if (!this.obj) return;

    this.obj['overview'] = true;

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

    this.obj['authorship'] = this.authorship.length > 0;


    // Sort by year
    if (this.obj && this.obj.literatureReference) {
      this.obj.literatureReference = sortByYearDescending(this.obj.literatureReference);
    }

  }


  getIcon(obj: Event) {
    return this.iconService.getIconDetails(obj);
  }

}
