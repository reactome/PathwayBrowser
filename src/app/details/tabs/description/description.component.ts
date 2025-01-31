import {AfterViewInit, ChangeDetectorRef, Component, effect, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Analysis} from "../../../model/analysis.model";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {IconService} from "../../../services/icon.service";
import {getProperty} from "../../../services/utils";
import {InstanceEdit} from "../../../model/graph/instance-edit.model";
import {DatabaseObject} from "../../../model/graph/database-object.model";
import {LiteratureReference} from "../../../model/graph/publication/literature-reference.model";
import {ReferenceEntity} from "../../../model/graph/reference-entity.model";
import {ActivatedRoute} from "@angular/router";
import {toSignal} from "@angular/core/rxjs-interop";


@Component({
  selector: 'cr-description',
  templateUrl: './description.component.html',
  styleUrl: './description.component.scss'
})
export class DescriptionComponent implements AfterViewInit, OnChanges {

  @Input('obj') obj?: DatabaseObject;
  @Input('analysisResult') analysisResult?: Analysis.Result;


  iconContent?: SafeHtml;
  literatureRefs?: LiteratureReference[];
  authored?: InstanceEdit[];
  reviewed?: InstanceEdit[];

  authorship: { label: string, data: InstanceEdit[]}[] = []

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
      this.obj['overview'] = true;
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
          this.iconContent = this.sanitizer.bypassSecurityTrustHtml(icon);
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
      ...((this.authored || []).length > 0 ? [{label: 'Author', data: (this.authored || [])}] : []),
      ...((this.reviewed || []).length > 0 ? [{label: 'Reviewer', data: (this.reviewed || [])}] : []),
    ];

    obj['authorship'] = this.authorship.length > 0;
  }

  getLiteratureRefs(obj: DatabaseObject) {
    const refs = getProperty(obj, 'literatureReference');
    // Sort by year
    if (refs && refs.length > 0) {
      this.literatureRefs = refs
    }
  }

  getExternalRef(obj: DatabaseObject) {

    if (this.externalRef) {
      obj['referenceEntity'] = true;
    }

  }

  getIcon(obj: DatabaseObject) {
    return this.iconService.getIconDetails(obj);
  }

}
