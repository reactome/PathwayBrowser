import {AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {AfterViewInit, ChangeDetectorRef, Component, effect, Input} from '@angular/core';
import {Event, InstanceEdit} from "../../../model/event.model";
import {Analysis} from "../../../model/analysis.model";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {DomSanitizer} from "@angular/platform-browser";
import {IconService} from "../../../services/icon.service";
import {getProperty, sortByYearDescending} from "../../../services/utils";
import {InstanceEdit} from "../../../model/graph/instance-edit.model";
import {sortByYearDescending} from "../../../services/utils";



@Component({
  selector: 'cr-description',
  templateUrl: './description.component.html',
  styleUrl: './description.component.scss'
})
export class DescriptionComponent implements AfterViewInit, OnChanges {

  @Input('obj') obj?: DatabaseObject;
  @Input('analysisResult') analysisResult?: Analysis.Result;


  iconContent?: SafeHtml;
  refs?: LiteratureReference[];
  referenceEntity?: ReferenceEntity;

  authored?: InstanceEdit[];
  reviewed?: InstanceEdit[];

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

    this.setIcon(this.obj);
    this.getRefs(this.obj);
    this.getAuthorship(this.obj)

  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['obj'] && changes['obj'].currentValue && this.obj) {
      this.setIcon(this.obj);
      this.getRefs(this.obj)
      this.getAuthorship(this.obj);
    }
  }

  setIcon(obj: DatabaseObject) {

    this.referenceEntity = getProperty(obj, 'referenceEntity');

    if (this.referenceEntity) {
      const identifier = this.referenceEntity.identifier;
      this.iconService.fetchIcon(identifier).subscribe(icon => {
        if (icon && this.obj) {
          this.iconContent = this.sanitizer.bypassSecurityTrustHtml(icon) ;
          this.obj.hasIcon = true;
          this.cdr.detectChanges();
        }
      });
    }
  }

  getAuthorship(obj: DatabaseObject) {
    this.authored = getProperty(obj, 'authored');
    this.reviewed = getProperty(obj, 'reviewed');

    this.authorship = [
      ...((this.authored || []).length > 0 ? [{label: 'Author', data: this.authored}] : []),
      ...((this.reviewed || []).length > 0 ? [{label: 'Reviewer', data: this.reviewed}] : []),
    ];
    this.obj['authorship'] = this.authorship.length > 0;
  }

  getRefs(obj: DatabaseObject) {
    const refs = getProperty(obj, 'literatureReference');
    // Sort by year
    if (refs) {
      this.refs = sortByYearDescending(refs);
    }
  }

  getIcon(obj: DatabaseObject) {
    return this.iconService.getIconDetails(obj);
  }

}
