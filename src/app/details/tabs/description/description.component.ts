import {AfterViewInit, ChangeDetectorRef, Component, computed, effect, input} from '@angular/core';
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

  readonly obj = input.required<Event>();
  readonly analysisResult = input<Analysis.Result>();
  readonly tabWidth = input<number>();
  readonly icon = computed(() => this.getIcon(this.obj()))

  iconContent: string = '';
  authorship: { label: string, data: InstanceEdit[] }[] = []

  elements: {key:string, label: string, manual?: boolean}[] = [
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

    const obj = this.obj();
    if (!obj) return;

    obj['overview'] = true;

    if (obj.referenceEntity) {
      const identifier = obj.referenceEntity.identifier;
      this.iconService.fetchIcon(identifier).subscribe(icon => {
        const objValue = this.obj();
        if (icon && objValue) {
          const sanitizedSvg = this.sanitizer.bypassSecurityTrustHtml(icon);
          this.iconContent = sanitizedSvg as string;
          objValue.hasIcon = true;
          this.cdr.detectChanges();
        }
      });
    }

    this.authorship = [
      ...(obj.authored?.length > 0 ? [{label: 'Author', data: obj.authored}] : []),
      ...(obj.reviewed?.length > 0 ? [{label: 'Reviewer', data: obj.reviewed}] : []),
    ];

    obj['authorship'] = this.authorship.length > 0;


    // Sort by year
    if (obj && obj.literatureReference) {
      obj.literatureReference = sortByYearDescending(obj.literatureReference);
    }

  }


  getIcon(obj: Event) {
    return this.iconService.getIconDetails(obj);
  }

}
