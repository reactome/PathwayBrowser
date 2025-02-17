import {Component, computed, effect, input, Signal} from '@angular/core';
import {Analysis} from "../../../model/analysis.model";
import {IconService} from "../../../services/icon.service";
import {getProperty, isEntity} from "../../../services/utils";
import {DatabaseObject} from "../../../model/graph/database-object.model";
import {ReferenceEntity} from "../../../model/graph/reference-entity/reference-entity.model";
import {ActivatedRoute} from "@angular/router";
import {rxResource, toSignal} from "@angular/core/rxjs-interop";
import {isArray, isString} from "lodash";
import {InstanceEdit} from "../../../model/graph/instance-edit.model";
import {LiteratureReference} from "../../../model/graph/publication/literature-reference.model";
import {SelectableObject} from "../../../services/event.service";
import {of} from "rxjs";
import {PhysicalEntity} from "../../../model/graph/physical-entity/physical-entity.model";
import {InteractorService} from "../../../interactors/services/interactor.service";
import {EntitiesService} from "../../../services/entities.service";
import {DataKeys, Labels} from "../../../constants/constants";


@Component({
  selector: 'cr-description',
  templateUrl: './description.component.html',
  styleUrl: './description.component.scss',
  standalone: false
})
export class DescriptionComponent {

  icon = rxResource({
    request: () => this.referenceEntity()?.identifier,
    loader: (param) => param.request ? this.iconService.fetchIcon(param.request) : of(null)
  })

  _otherForms = rxResource({
    request: () => isEntity(this.obj()) && this.obj().stId,
    loader: (param) => param.request ? this.entitiesService.getOtherForms(param.request) : of(null)
  })

  _interactors = rxResource({
    request: () => isEntity(this.obj()) && this.referenceEntity()?.identifier,
    loader: (param) => param.request ? this.interactorService.getCustomInteractorsByAcc(param.request) : of(null)
  })

  readonly obj = input.required<SelectableObject>();
  readonly analysisResult = input<Analysis.Result>();
  readonly symbol = computed(() => this.getSymbol(this.obj()));
  readonly literatureRefs: Signal<LiteratureReference[]> = computed(() => getProperty(this.obj(), DataKeys.LITERATURE_REFERENCE));
  referenceEntity: Signal<ReferenceEntity | undefined> = computed(() => getProperty(this.obj(), DataKeys.REFERENCE_ENTITY));
  readonly externalRef = computed(() => this.getTransformedExternalRef(this.referenceEntity()));
  readonly crossReferences = computed(() => this.getGroupedCrossReferences(this.referenceEntity()));
  readonly inferences: Signal<PhysicalEntity[] | undefined> = computed(() => getProperty(this.obj(), DataKeys.INFERRED_TO));
  section = toSignal(this.route.fragment)
  readonly authorship: Signal<{ label: string, data: InstanceEdit[] }[]> = computed(() => {

    const obj = this.obj();
    const authored = getProperty(obj, DataKeys.AUTHORED) || [];
    // Ensure it's an array, either returning the existing array or wrapping it in one, it complains without this line.
    const finalAuthored = Array.isArray(authored) ? authored : authored ? [authored] : [];
    const reviewed = getProperty(obj, DataKeys.REVIEWED) || [];
    const edited = getProperty(obj, DataKeys.EDITED) || [];
    const revised = getProperty(obj, DataKeys.REVISED) || [];

    return [
      ...(authored.length > 0 ? [{label: Labels.AUTHOR, data: finalAuthored}] : []),
      ...(reviewed.length > 0 ? [{label: Labels.REVIEWER, data: reviewed}] : []),
      ...(edited.length > 0 ? [{label: Labels.EDITOR, data: edited}] : []),
      ...(revised.length > 0 ? [{label: Labels.REVISER, data: revised}] : []),
    ];

  });


  otherForms = computed(() => {
    const value = this._otherForms.value();
    if (!value) return [];
    return value.map(entity => ({
      ...entity,
      label: entity.displayName.match(/\[(.*?)\]/)?.[1] || '' // HSPA8 [plasma membrane] => plasma membrane
    }))
  })


  interactors = computed(() => {
    const interactorsData = this._interactors.value();
    return interactorsData || [];
  });

  interactorsLength = computed(() => {
    const interactors = this._interactors.value();
    return interactors ? interactors.length : 0;
  });


  protected readonly isArray = isArray;
  protected readonly isString = isString;
  protected readonly Labels = Labels;
  protected readonly DataKeys = DataKeys;


  //todo get divider label from here
  elements: { key: string, label: string, manual?: boolean }[] = [
    {key: DataKeys.OVERVIEW, label: Labels.OVERVIEW, manual: true},
    {key: DataKeys.LITERATURE_REFERENCE, label: Labels.REFERENCE, manual: true},
    {key: DataKeys.REFERENCE_ENTITY, label: Labels.EXTERNAL_REFERENCE, manual: true},
    {key: DataKeys.CROSS_REFERENCES, label: Labels.CROSS_REFERENCES, manual: true},
    {key: Labels.AUTHORSHIP, label: Labels.AUTHORSHIP, manual: true},
    {key: DataKeys.INPUT, label: Labels.INPUTS},
    {key: DataKeys.OUTPUT, label: Labels.OUTPUTS},
    {key: DataKeys.CATALYST_ACTIVITY, label: Labels.CATALYST_ACTIVITY},
    {key: DataKeys.OTHER_FORMS, label: Labels.OTHER_FORMS, manual: true},
    {key: DataKeys.INFERRED_TO, label: Labels.INFERENCES, manual: true},
    {key: DataKeys.INTERACTORS, label: Labels.INTERACTORS, manual: true},
  ]


  constructor(private iconService: IconService,
              private route: ActivatedRoute,
              private entitiesService: EntitiesService,
              private interactorService: InteractorService,
  ) {
    effect(() => {
      !!this.section() && document.getElementById(this.section()!)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'start'
      });
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
      {key: 'chain', label: 'Chain'},
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
    if (!refEntity || !refEntity.crossReference) return [];

    const crossRefs = [...refEntity.crossReference];
    const dbNames = [...new Set(crossRefs.map(ref => ref.databaseName))];

    return dbNames.map(dbName => ({
      databaseName: dbName,
      data: crossRefs.filter(ref => ref.databaseName === dbName)
    }));

  }

  isTOCIncluded(key: string) {
    const obj = this.obj();

    switch (key) {
      case DataKeys.OVERVIEW:
        return obj;
      case DataKeys.CROSS_REFERENCES:
        return this.crossReferences() && this.crossReferences().length > 0;
      case DataKeys.OTHER_FORMS:
        return this.otherForms() && this.otherForms().length > 0;
      case Labels.AUTHORSHIP:
        return this.authorship() && this.authorship().length > 0;
      case DataKeys.INTERACTORS:
        return this.interactors()
      default:
        return obj[key] !== undefined && obj[key];
    }
  }


}
