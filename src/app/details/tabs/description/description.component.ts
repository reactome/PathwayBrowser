import {ChangeDetectorRef, Component, computed, effect, input, Signal} from '@angular/core';
import {Analysis} from "../../../model/analysis.model";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {IconService} from "../../../services/icon.service";
import {getProperty} from "../../../services/utils";
import {DatabaseObject} from "../../../model/graph/database-object.model";
import {ReferenceEntity} from "../../../model/graph/reference-entity/reference-entity.model";
import {ActivatedRoute} from "@angular/router";
import {toSignal} from "@angular/core/rxjs-interop";
import {isArray, isString} from "lodash";
import {DatabaseIdentifier} from "../../../model/graph/database-identifier.model";
import {InstanceEdit} from "../../../model/graph/instance-edit.model";
import {LiteratureReference} from "../../../model/graph/publication/literature-reference.model";


@Component({
    selector: 'cr-description',
    templateUrl: './description.component.html',
    styleUrl: './description.component.scss',
    standalone: false
})
export class DescriptionComponent   {

  readonly obj = input.required<DatabaseObject>();
  readonly analysisResult = input<Analysis.Result>();
  readonly icon = computed(() => this.getIcon(this.obj()))

  protected readonly isArray = isArray;
  protected readonly isString = isString;


  iconContent?: SafeHtml;
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

  readonly literatureRefs:Signal<LiteratureReference[]> = computed(()=> getProperty(this.obj(), 'literatureReference'));

  readonly authorship: Signal<{ label: string, data: InstanceEdit[] }[]> = computed(() => {

    const obj = this.obj();
    const authored = getProperty(obj, 'authored') || [];
    const reviewed = getProperty(obj, 'reviewed') || [];
    const edited = getProperty(obj, 'edited') || [];
    const revised = getProperty(obj, 'revised') || [];

    return [
      ...(authored.length > 0 ? [{ label: 'Author', data: authored }] : []),
      ...(reviewed.length > 0 ? [{ label: 'Reviewer', data: reviewed }] : []),
      ...(edited.length > 0 ? [{ label: 'Editor', data: edited }] : []),
      ...(revised.length > 0 ? [{ label: 'Reviser', data: revised }] : []),
    ];

  })

 readonly externalRef = computed(() => {
    const obj = this.obj();
    const rawExternalRef = getProperty(obj,'referenceEntity');
    return this.getTransformedExternalRef(rawExternalRef);

  })


  constructor(private iconService: IconService,
              private sanitizer: DomSanitizer,
              private cdr: ChangeDetectorRef,
              private route: ActivatedRoute
  ) {
    effect(() => {
      !!this.section() && document.getElementById(this.section()!)?.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'start'});

      this.setIcon();

      const obj = this.obj();
      if (obj) {
        obj['overview'] = true;
        obj['authorship'] = this.authorship().length > 0;
      }

    });
  }

  // Icon from Reactome Icon library, for instance R-ICO-013990
  setIcon() {
    const obj = this.obj();
    const rawExternalRef = getProperty(obj, 'referenceEntity');

    if (rawExternalRef) {
      const identifier = rawExternalRef.identifier;
      this.iconService.fetchIcon(identifier).subscribe(icon => {
        if (icon && obj) {
          this.iconContent = this.sanitizer.bypassSecurityTrustHtml(icon);
          obj.hasIcon = true;
          this.cdr.detectChanges();
        }
      });
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
