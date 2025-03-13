import {Component, computed, effect, input, Signal, viewChild} from '@angular/core';
import {Analysis} from "../../../model/analysis.model";
import {IconService} from "../../../services/icon.service";
import {getProperty, isEntity} from "../../../services/utils";
import {DatabaseObject} from "../../../model/graph/database-object.model";
import {ReferenceEntity} from "../../../model/graph/reference-entity/reference-entity.model";
import {ActivatedRoute} from "@angular/router";
import {rxResource, toSignal} from "@angular/core/rxjs-interop";
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


  interactors = computed(() => this._interactors.value() || []);

  interactorsLength = computed(() => this._interactors.value()?.length || 0);

  overview$ = viewChild<HTMLDivElement>('#overview');


  protected readonly Labels = Labels;
  protected readonly DataKeys = DataKeys;


  //todo get divider label from here
  elements: { key: string, label: string, manual?: boolean }[] = [
    {key: DataKeys.OVERVIEW, label: Labels.OVERVIEW, manual: true},
    {key: DataKeys.REFERENCE_ENTITY, label: Labels.EXTERNAL_REFERENCE, manual: true},
    {key: DataKeys.CROSS_REFERENCES, label: Labels.CROSS_REFERENCES, manual: true},
    {key: DataKeys.INPUT, label: Labels.INPUTS},
    {key: DataKeys.OUTPUT, label: Labels.OUTPUTS},
    {key: DataKeys.CATALYST_ACTIVITY, label: Labels.CATALYST_ACTIVITY},
    {key: DataKeys.OTHER_FORMS, label: Labels.OTHER_FORMS, manual: true},
    {key: DataKeys.INFERRED_TO, label: Labels.INFERENCES, manual: true},
    {key: DataKeys.INTERACTORS, label: Labels.INTERACTORS, manual: true},
    {key: DataKeys.INFERRED_FROM, label: Labels.INFERRED_FROM},
    {key: DataKeys.PRECEDING_EVENT, label: Labels.PRECEDING_EVENT},
    {key: DataKeys.FOLLOWING_EVENT, label: Labels.FOLLOWING_EVENT},
    {key: DataKeys.LITERATURE_REFERENCE, label: Labels.REFERENCE, manual: true},
    {key: Labels.AUTHORSHIP, label: Labels.AUTHORSHIP, manual: true},
  ]


  constructor(private iconService: IconService,
              private route: ActivatedRoute,
              private entitiesService: EntitiesService,
              private interactorService: InteractorService,
  ) {
    effect(() => {console.log(this.obj())
    });
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

  isTOCIncluded(key: string) {
    const obj = this.obj();

    switch (key) {
      case DataKeys.OVERVIEW:
        return obj;
      case DataKeys.CROSS_REFERENCES:
        return this.referenceEntity()?.crossReference;
      case DataKeys.OTHER_FORMS:
        return this.otherForms() && this.otherForms().length > 0;
      case Labels.AUTHORSHIP:
        return this.authorship() && this.authorship().length > 0;
      case DataKeys.INTERACTORS:
        return !this._interactors.isLoading() && this._interactors.value();
      default:
        return obj[key] !== undefined && obj[key];
    }
  }


}
