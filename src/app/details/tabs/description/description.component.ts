import {AfterViewInit, ChangeDetectorRef, Component, effect, Input, computed, OnChanges, SimpleChanges} from '@angular/core';
import {Analysis} from "../../../model/analysis.model";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {IconService} from "../../../services/icon.service";
import {getProperty} from "../../../services/utils";
import {InstanceEdit} from "../../../model/graph/instance-edit.model";
import {DatabaseObject} from "../../../model/graph/database-object.model";
import {LiteratureReference} from "../../../model/graph/publication/literature-reference.model";
import {ReferenceEntity} from "../../../model/graph/reference-entity/reference-entity.model";
import {ActivatedRoute} from "@angular/router";
import {toSignal} from "@angular/core/rxjs-interop";
import {isArray, isString} from "lodash";
import {DatabaseIdentifier} from "../../../model/graph/database-identifier.model";


@Component({
    selector: 'cr-description',
    templateUrl: './description.component.html',
    styleUrl: './description.component.scss',
    standalone: false
})
export class DescriptionComponent implements AfterViewInit, OnChanges {

  readonly obj = input.required<DatabaseObject>();
  readonly analysisResult = input<Analysis.Result>();
  readonly tabWidth = input<number>();
  readonly icon = computed(() => this.getIcon(this.obj()))


  iconContent?: SafeHtml;
  literatureRefs?: LiteratureReference[];
  authored?: InstanceEdit[];
  reviewed?: InstanceEdit[];
  edited?: InstanceEdit[];
  revised?: InstanceEdit[];
  rawExternalRef?: ReferenceEntity;
  externalRef?: { key: string; value: any }[];
  authorship: { label: string, data: InstanceEdit[] }[] = [];

  elements: {key:string, label: string, manual?: boolean}[] = [
    {key: 'overview', label: 'Overview', manual: true},
    {key: 'literatureReference', label: 'References', manual: true},
    {key: 'referenceEntity', label: 'External Reference', manual: true},
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
    this.obj['overview'] = true;

    this.setIcon(this.obj);
    this.getLiteratureRefs(this.obj);
    this.getExternalRef(this.obj);
    this.getAuthorship(this.obj);

  }


  ngOnChanges(changes: SimpleChanges): void {
    if (!this.obj) return;
    if (changes['obj'] && !changes['obj'].firstChange && changes['obj'].previousValue !== this.obj) {
      this.obj['overview'] = true;
      this.setIcon(this.obj);
      this.getLiteratureRefs(this.obj);
      this.getExternalRef(this.obj);
      this.getAuthorship(this.obj);
    }
  }

  protected readonly isArray = isArray;
  protected readonly isString = isString;

  setIcon(obj: DatabaseObject) {

    this.rawExternalRef = getProperty(obj, 'referenceEntity');

    if (this.rawExternalRef) {
      const identifier = this.rawExternalRef.identifier;
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
    this.edited = getProperty(obj, 'edited');
    this.revised = getProperty(obj, 'revised');

    this.authorship = [
      ...((this.authored || []).length > 0 ? [{label: 'Author', data: (this.authored || [])}] : []),
      ...((this.reviewed || []).length > 0 ? [{label: 'Reviewer', data: (this.reviewed || [])}] : []),
      ...((this.edited || []).length > 0 ? [{label: 'Editor', data: (this.edited || [])}] : []),
      ...((this.revised || []).length > 0 ? [{label: 'Reviser', data: (this.revised || [])}] : []),
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
    if (this.rawExternalRef) {
      this.externalRef = this.getTransformedExternalRef(this.rawExternalRef);
      obj['referenceEntity'] = true;
    }
  }

  getIcon(obj: DatabaseObject) {
    return this.iconService.getIconDetails(obj);
  }

  getTransformedExternalRef(refEntity: ReferenceEntity) {
    if (!refEntity) return [];
    const externalRef = {...refEntity};
    const propertyToShowAndOrder = ['displayName', 'geneName', 'chain', 'referenceGene', 'crossReference'];
    const labels = new Map<string, string>([
      ['displayName', 'External Reference'],
      ['geneName', 'Gene Names'],
      ['referenceGene', 'Reference Genes'],
      ['crossReference', 'Reference Transcript'],
    ]);
    const results: { key: string, value: any }[] = [];

    for (const key of propertyToShowAndOrder) {
      let value = externalRef[key];
      if (key === 'crossReference') {
        value = value.filter((n: DatabaseIdentifier) => n.databaseName === 'RefSeq');
      }
      results.push({
        key: labels.get(key) || key,
        value: value
      });
    }
    return results;
  }


}
