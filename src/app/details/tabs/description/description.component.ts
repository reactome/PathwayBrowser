import {Component, computed, effect, input, Signal} from '@angular/core';
import {Analysis} from "../../../model/analysis.model";
import {IconService} from "../../../services/icon.service";
import {getProperty} from "../../../services/utils";
import {DatabaseObject} from "../../../model/graph/database-object.model";
import {ReferenceEntity} from "../../../model/graph/reference-entity/reference-entity.model";
import {ActivatedRoute} from "@angular/router";
import {rxResource, toSignal} from "@angular/core/rxjs-interop";
import {isArray, isString} from "lodash";
import {InstanceEdit} from "../../../model/graph/instance-edit.model";
import {LiteratureReference} from "../../../model/graph/publication/literature-reference.model";
import {SelectableObject} from "../../../services/event.service";
import {of} from "rxjs";


@Component({
  selector: 'cr-description',
  templateUrl: './description.component.html',
  styleUrl: './description.component.scss',
  standalone: false
})
export class DescriptionComponent {

  readonly obj = input.required<SelectableObject>();
  readonly analysisResult = input<Analysis.Result>();
  readonly symbol = computed(() => this.getSymbol(this.obj()));
  readonly literatureRefs: Signal<LiteratureReference[]> = computed(() => getProperty(this.obj(), 'literatureReference'));
  referenceEntity: Signal<ReferenceEntity | undefined> = computed(() => getProperty(this.obj(), 'referenceEntity'));
  readonly externalRef = computed(() => this.getTransformedExternalRef(this.referenceEntity()));
  readonly crossReferences = computed(() => this.getGroupedCrossReferences(this.referenceEntity()));

  readonly authorship: Signal<{ label: string, data: InstanceEdit[] }[]> = computed(() => {

    const obj = this.obj();
    const authored = getProperty(obj, 'authored') || [];
    const reviewed = getProperty(obj, 'reviewed') || [];
    const edited = getProperty(obj, 'edited') || [];
    const revised = getProperty(obj, 'revised') || [];

    return [
      ...(authored.length > 0 ? [{label: 'Author', data: authored}] : []),
      ...(reviewed.length > 0 ? [{label: 'Reviewer', data: reviewed}] : []),
      ...(edited.length > 0 ? [{label: 'Editor', data: edited}] : []),
      ...(revised.length > 0 ? [{label: 'Reviser', data: revised}] : []),
    ];

  });


  section = toSignal(this.route.fragment)

  protected readonly isArray = isArray;
  protected readonly isString = isString;

  icon = rxResource({
    request: () => this.referenceEntity()?.identifier,
    loader: (param) => param.request ? this.iconService.fetchIcon(param.request) : of(null)
  })

  elements: { key: string, label: string, manual?: boolean }[] = [
    {key: 'overview', label: 'Overview', manual: true},
    {key: 'literatureReference', label: 'References', manual: true},
    {key: 'referenceEntity', label: 'External Reference', manual: true},
    {key: 'crossReferences', label: 'Cross References', manual: true},
    {key: 'authorship', label: 'Authorship', manual: true},
    {key: 'input', label: 'Inputs'},
    {key: 'output', label: 'Outputs'},
    {key: 'catalystActivity', label: 'Catalyst Activity'},
    {key: 'inferredFrom', label: 'Inferred From'}
  ]


  constructor(private iconService: IconService,
              private route: ActivatedRoute
  ) {
    effect(() => {
      !!this.section() && document.getElementById(this.section()!)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'start'
      });

      const obj = this.obj();
      if (obj) {
        obj['overview'] = true;
        obj['authorship'] = this.authorship().length > 0;
      }

    });
  }


  getSymbol(obj: DatabaseObject) {
    return this.iconService.getIconDetails(obj);
  }

  getTransformedExternalRef(refEntity: ReferenceEntity | undefined) {
    if (!refEntity) return [];
    const externalRef = {...refEntity};
    const properties = [
      {key: 'displayName', label: 'External Reference'},
      {key: 'geneName', label: 'Gene Names'},
      {key: 'referenceGene', label: 'Reference Genes'},
      {key: 'referenceTranscript', label: 'Reference Transcript'}
    ];
    const results: { label: string, value: any }[] = [];
    for (const property of properties) {
      let value = externalRef[property.key];
      if (!value) continue;
      results.push({
        label: property.label || property.key,
        value: value
      });
    }
    return results;
  }


  getGroupedCrossReferences(refEntity: ReferenceEntity | undefined) {
    if (!refEntity) return [];

    const crossRefs = [...refEntity.crossReference];
    const dbNames = [...new Set(crossRefs.map(ref => ref.databaseName))];

    return dbNames.map(dbName => ({
      databaseName: dbName,
      data: crossRefs.filter(ref => ref.databaseName === dbName)
    }));

  }


}
