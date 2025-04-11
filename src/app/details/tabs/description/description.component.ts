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
import {CatalystActivity} from "../../../model/graph/catalyst-activity.model";
import {CatalystActivityReference} from "../../../model/graph/control-reference/catalyst-activity-reference.model";
import {Regulation} from "../../../model/graph/Regulation/regulation.model";
import {RegulationReference} from "../../../model/graph/control-reference/regulation-reference.model";
import {Relationship} from "../../../model/graph/relationship.model";
import {DatabaseIdentifier} from "../../../model/graph/database-identifier.model";
import HasModifiedResidue = Relationship.HasModifiedResidue;


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
  referenceEntity: Signal<ReferenceEntity> = computed(() => getProperty(this.obj(), DataKeys.REFERENCE_ENTITY));
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

  inferences = computed(() => {
    const inferences: PhysicalEntity[] = getProperty(this.obj(), DataKeys.INFERRED_TO);
    if (!inferences) return new Map<string, PhysicalEntity[]>();
    return this.getGroupedInferences(inferences);
  });


  otherForms = computed(() => {
    const value = this._otherForms.value();
    if (!value) return new Map<string, PhysicalEntity[]>();
    return this.getGroupedOtherForms(value);
  })


  interactors = computed(() => this._interactors.value() || []);
  interactorsLength = computed(() => this._interactors.value()?.length || 0);

  catalystActivity: Signal<CatalystActivity[]> = computed(() => getProperty(this.obj(), DataKeys.CATALYST_ACTIVITY));
  catalystRef: Signal<CatalystActivityReference> = computed(() => getProperty(this.obj(), DataKeys.CATALYST_ACTIVITY_REFERENCE));

  regulations: Signal<Regulation[]> = computed(() => getProperty(this.obj(), DataKeys.REGULATED_BY));
  regulationRefs: Signal<RegulationReference[]> = computed(() => getProperty(this.obj(), DataKeys.REGULATION_REFERENCE));

  modifications: Signal<HasModifiedResidue[]> = computed(() => getProperty(this.obj(), DataKeys.MODIFIED_RESIDUES));

  crossReference = computed(() => {
    if (this.referenceEntity() && this.referenceEntity().crossReference) {
      return this.referenceEntity().crossReference;
    }

    const crossReference: DatabaseIdentifier[] = getProperty(this.obj(), DataKeys.CROSS_REFERENCE);
    return crossReference ? [...crossReference] : [];
  });

  overview$ = viewChild<HTMLDivElement>('#overview');


  protected readonly Labels = Labels;
  protected readonly DataKeys = DataKeys;


  //todo get divider label from here
  elements: { key: string, label: string, manual?: boolean, hasDepthControl?: boolean }[] = [
    {key: DataKeys.OVERVIEW, label: Labels.OVERVIEW, manual: true},
    {key: DataKeys.REFERENCE_ENTITY, label: Labels.EXTERNAL_REFERENCE, manual: true},
    {key: DataKeys.CROSS_REFERENCE, label: Labels.CROSS_REFERENCES, manual: true},
    {key: DataKeys.MODIFIED_RESIDUES, label: Labels.MODIFIED_RESIDUES, manual: true},
    {key: DataKeys.INPUT, label: Labels.INPUTS, hasDepthControl: true},
    {key: DataKeys.OUTPUT, label: Labels.OUTPUTS, hasDepthControl: true},
    {key: DataKeys.OTHER_FORMS, label: Labels.OTHER_FORMS, manual: true},
    {key: DataKeys.INFERRED_TO, label: Labels.INFERENCES, manual: true},
    {key: DataKeys.MEMBERS, label: Labels.MEMBERS, hasDepthControl:true},
    {key: DataKeys.INFERRED_FROM, label: Labels.INFERRED_FROM},
    {key: DataKeys.PRECEDING_EVENT, label: Labels.PRECEDING_EVENT},
    {key: DataKeys.FOLLOWING_EVENT, label: Labels.FOLLOWING_EVENT},
    {key: DataKeys.COMPONENTS, label: Labels.COMPONENTS, hasDepthControl: true},
    {key: DataKeys.INPUT_FOR, label: Labels.INPUT_FOR},
    {key: DataKeys.OUTPUT_FOR, label: Labels.OUTPUT_FOR},
    {key: DataKeys.CATALYST_ACTIVITY, label: Labels.CATALYST_ACTIVITY, manual: true},
    {key: DataKeys.REGULATED_BY, label: Labels.REGULATED_BY, manual: true},
    {key: DataKeys.LITERATURE_REFERENCE, label: Labels.REFERENCE, manual: true},
    {key: Labels.AUTHORSHIP, label: Labels.AUTHORSHIP, manual: true},
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

  // Group by species name
  getGroupedInferences(inferences: PhysicalEntity[]) {
    return this.entitiesService.getGroupedData(inferences, pe => pe.speciesName);
  }

  // Group by compartment
  getGroupedOtherForms(otherForms: PhysicalEntity[]) {
    return this.entitiesService.getGroupedData(otherForms, pe => {
      // Extract compartment (group name) from displayName => HSPA8 [plasma membrane] => plasma membrane
      return pe.displayName.match(/\[(.*?)\]/)?.[1] || pe.displayName;
    });
  }

  isTOCIncluded(key: string) {
    const obj = this.obj();
    switch (key) {
      case DataKeys.OVERVIEW:
        return obj;
      case DataKeys.CATALYST_ACTIVITY:
        return this.catalystActivity() && this.catalystActivity().length > 0;
      case DataKeys.CROSS_REFERENCE:
        return this.crossReference().length > 0;
      case DataKeys.OTHER_FORMS:
        return this.otherForms() && this.otherForms().size > 0;
      case Labels.AUTHORSHIP:
        return this.authorship() && this.authorship().length > 0;
      case DataKeys.INTERACTORS:
        return this.interactors() && this.interactors().length > 0;
      default:
        return obj[key] !== undefined && obj[key];
    }
  }


}
