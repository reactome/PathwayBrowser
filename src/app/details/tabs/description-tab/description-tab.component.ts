import {Component, computed, effect, input, signal, Signal, TemplateRef, viewChild} from '@angular/core';
import {Analysis} from "../../../model/analysis.model";
import {IconService} from "../../../services/icon.service";
import {
  getProperty,
  groupAndSortBy, isDefinedAndNotEmpty,
  isPhysicalEntity,
  isReferenceSequence,
  isReferenceSummary
} from "../../../services/utils";
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
import {EntityService} from "../../../services/entity.service";
import {DataKeys, Labels} from "../../../constants/constants";
import {CatalystActivity} from "../../../model/graph/catalyst-activity.model";
import {CatalystActivityReference} from "../../../model/graph/control-reference/catalyst-activity-reference.model";
import {Regulation} from "../../../model/graph/Regulation/regulation.model";
import {RegulationReference} from "../../../model/graph/control-reference/regulation-reference.model";
import {Relationship} from "../../../model/graph/relationship.model";
import {DatabaseIdentifier} from "../../../model/graph/database-identifier.model";
import {
  EntityWithAccessionedSequence
} from "../../../model/graph/physical-entity/entity-with-accessioned-sequence.model";
import {MarkerReference} from "../../../model/graph/control-reference/marker-reference.model";
import {camelCase, isArray} from "lodash";
import HasModifiedResidue = Relationship.HasModifiedResidue;


@Component({
  selector: 'cr-description-tab',
  templateUrl: './description-tab.component.html',
  styleUrl: './description-tab.component.scss',
  standalone: false
})
export class DescriptionTabComponent {

  icon = rxResource({
    request: () => this.referenceEntity()?.identifier,
    loader: (param) => param.request ? this.iconService.fetchIcon(param.request) : of(null)
  })

  _otherForms = rxResource({
    request: () => isPhysicalEntity(this.obj()) && !isReferenceSummary(this.obj()) && this.referenceEntity() && this.obj().stId,
    loader: (param) => param.request ? this.entity.getOtherForms(param.request) : of(null)
  })

  _interactors = rxResource({
    request: () => isPhysicalEntity(this.obj()) && this.referenceEntity()?.identifier,
    loader: (param) => param.request ? this.interactorService.getCustomInteractorsByAcc(param.request) : of(null)
  })

  readonly obj = input.required<SelectableObject>();
  readonly analysisResult = input<Analysis.Result>();
  readonly section = toSignal(this.route.fragment);

  static referenceTypeToNameSuffix = new Map<string, string>([
      ["ReferenceMolecule", ""],
      ["ReferenceGeneProduct", ""],
      ["ReferenceDNASequence", " Gene"],
      ["ReferenceRNASequence", " mRNA"],
      ["ReferenceTherapeutic", " Drug"]
    ]
  );

  readonly name = computed(() => {
    const obj = this.obj();

    let name = obj.name
      ? isArray(obj.name)
        ? obj.name[0]
        : obj.name
      : obj.displayName;

    if (isReferenceSummary(obj)) {
      const suffix = DescriptionTabComponent.referenceTypeToNameSuffix.get(obj.referenceEntity.schemaClass)
      if (
        isReferenceSequence(obj.referenceEntity) &&
        isDefinedAndNotEmpty(obj.referenceEntity.geneName)
      ) name = obj.referenceEntity.geneName[0];
      return name + suffix;
    }

    return name
  })

  readonly symbol = computed(() => this.getSymbol(this.obj()));
  readonly literatureRefs: Signal<LiteratureReference[]> = computed(() => getProperty(this.obj(), DataKeys.LITERATURE_REFERENCE));
  readonly groupedReferences = computed(() => groupAndSortBy(this.literatureRefs(), ref => ref.year, (key1, key2) => key2 - key1));

  referenceEntity: Signal<ReferenceEntity> = computed(() => getProperty(this.obj(), DataKeys.REFERENCE_ENTITY));

  readonly authorship: Signal<{ label: string, data: InstanceEdit[] }[]> = computed(() => {
    const arrayWrap = <E>(a: E[] | E) => Array.isArray(a) ? a : [a];

    const obj = this.obj();
    // Ensure it's an array, either returning the existing array or wrapping it in one, it complains without this line.
    const finalAuthored = arrayWrap(getProperty(obj, DataKeys.AUTHORED) || getProperty(obj, DataKeys.CREATED) || []);
    const reviewed = getProperty(obj, DataKeys.REVIEWED) || [];
    const edited = getProperty(obj, DataKeys.EDITED) || [];
    const revised = getProperty(obj, DataKeys.REVISED) || [];

    return [
      ...(finalAuthored.length > 0 ? [{label: Labels.AUTHOR, data: finalAuthored}] : []),
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
  catalystActivities: Signal<CatalystActivity[]> = computed(() => getProperty(this.obj(), DataKeys.CATALYST_ACTIVITIES));
  catalystRef: Signal<CatalystActivityReference> = computed(() => getProperty(this.obj(), DataKeys.CATALYST_ACTIVITY_REFERENCE));

  regulations: Signal<Regulation[]> = computed(() => getProperty(this.obj(), DataKeys.REGULATED_BY));
  regulationRefs: Signal<RegulationReference[]> = computed(() => getProperty(this.obj(), DataKeys.REGULATION_REFERENCE));

  regulates: Signal<Regulation[]> = computed(() => [
    ...(getProperty(this.obj(), DataKeys.POSITIVELY_REGULATES) || []),
    ...(getProperty(this.obj(), DataKeys.NEGATIVELY_REGULATES) || []),
  ]);

  modifications: Signal<HasModifiedResidue[]> = computed(() => getProperty(this.obj(), DataKeys.MODIFIED_RESIDUES));

  crossReference = computed(() => {
    if (this.referenceEntity() && this.referenceEntity().crossReference) {
      return this.referenceEntity().crossReference;
    }

    const crossReference: DatabaseIdentifier[] = getProperty(this.obj(), DataKeys.CROSS_REFERENCE);
    return crossReference ? [...crossReference] : [];
  });

  proteinMarkers: Signal<EntityWithAccessionedSequence[]> = computed(() => getProperty(this.obj(), DataKeys.PROTEIN_MARKER) || [])
  rnaMarkers: Signal<EntityWithAccessionedSequence[]> = computed(() => getProperty(this.obj(), DataKeys.RNA_MARKERS) || [])
  markerReference: Signal<MarkerReference[]> = computed(() => getProperty(this.obj(), DataKeys.MARKER_REFERENCE))

  repeatedUnits: Signal<PhysicalEntity[]> = computed(() => getProperty(this.obj(), DataKeys.REPEATED_UNIT))

  hasRhea = computed(() => ["RHEA", "Rhea"].includes(this.crossReference()[0]?.databaseName));

  overview$ = viewChild<HTMLDivElement>('overview');
  overviewTemplate$ = viewChild.required<TemplateRef<any>>('overviewTemplate');
  referenceTemplate$ = viewChild.required<TemplateRef<any>>('referenceTemplate');
  modificationsTemplate$ = viewChild.required<TemplateRef<any>>('modificationsTemplate');
  crossReferencesTemplate$ = viewChild.required<TemplateRef<any>>('crossReferencesTemplate');
  markerTemplate$ = viewChild.required<TemplateRef<any>>('markerTemplate');
  regulationTemplate$ = viewChild.required<TemplateRef<any>>('regulationTemplate');
  regulatesTemplate$ = viewChild.required<TemplateRef<any>>('regulatesTemplate');
  catalystActivityTemplate$ = viewChild.required<TemplateRef<any>>('catalystActivityTemplate');
  catalystActivitiesTemplate$ = viewChild.required<TemplateRef<any>>('catalystActivitiesTemplate');
  inferencesTemplate$ = viewChild.required<TemplateRef<any>>('inferencesTemplate');
  otherFormsTemplate$ = viewChild.required<TemplateRef<any>>('otherFormsTemplate');
  literatureRefsTemplate$ = viewChild.required<TemplateRef<any>>('literatureRefsTemplate');
  authorsTemplate$ = viewChild.required<TemplateRef<any>>('authorsTemplate');
  interactorsTemplate$ = viewChild.required<TemplateRef<any>>('interactorsTemplate');
  rheaTemplate$ = viewChild.required<TemplateRef<any>>('rheaTemplate');

  protected readonly Labels = Labels;
  protected readonly DataKeys = DataKeys;


  //todo get divider label from here
  elements: {
    key: string,
    label: string,
    hasDepthControl?: boolean,
    manual?: boolean,
    scope?: 'entity' | 'event',
    template?: Signal<TemplateRef<any>>,
    isPresent?: Signal<boolean>,
  }[] = [
    {
      key: DataKeys.OVERVIEW,
      label: Labels.OVERVIEW,
      manual: true,
      template: this.overviewTemplate$,
      isPresent: signal(true)
    },
    {key: DataKeys.REFERENCE_ENTITY, label: Labels.EXTERNAL_REFERENCE, manual: true, template: this.referenceTemplate$},
    {key: DataKeys.SUMMARISED_ENTITIES, label: Labels.SUMMARISED_ENTITIES},
    {
      key: DataKeys.MODIFIED_RESIDUES,
      label: Labels.MODIFIED_RESIDUES,
      manual: true,
      template: this.modificationsTemplate$
    },

    {key: DataKeys.MEMBERS, label: Labels.MEMBERS, hasDepthControl: true},
    {key: DataKeys.CANDIDATES, label: Labels.CANDIDATES, hasDepthControl: true},
    {key: DataKeys.COMPONENTS, label: Labels.COMPONENTS, hasDepthControl: true},
    {key: DataKeys.REPEATED_UNIT, label: Labels.REPEATED_UNIT, hasDepthControl: true},
    {
      key: DataKeys.PROTEIN_MARKER,
      label: Labels.MARKERS,
      manual: true,
      template: this.markerTemplate$,
      isPresent: computed(() => this.proteinMarkers().length + this.rnaMarkers().length > 0)
    },

    {key: DataKeys.EVENTS, label: Labels.EVENTS, hasDepthControl: true, scope: 'event'},
    {key: DataKeys.INPUT, label: Labels.INPUTS, hasDepthControl: true},
    {key: DataKeys.OUTPUT, label: Labels.OUTPUTS, hasDepthControl: true},
    {key: DataKeys.REGULATED_BY, label: Labels.REGULATED_BY, manual: true, template: this.regulationTemplate$},
    {
      key: DataKeys.CATALYST_ACTIVITIES,
      label: Labels.CATALYST_ACTIVITIES,
      manual: true,
      template: this.catalystActivitiesTemplate$,
      isPresent: computed(() => this.catalystActivities()?.length > 0)
    },

    {
      key: DataKeys.CATALYST_ACTIVITY,
      label: Labels.CATALYST_ACTIVITY,
      manual: true,
      template: this.catalystActivityTemplate$,
      isPresent: computed(() => this.catalystActivity()?.length > 0)
    },

    {
      key: DataKeys.CROSS_REFERENCE,
      label: Labels.CROSS_REFERENCES,
      manual: true,
      template: this.crossReferencesTemplate$,
      isPresent: computed(() => this.crossReference()?.length > 0 && !this.hasRhea())
    },
    // Rhea structure
    {
      key: camelCase(Labels.BIOCHEMICAL_REACTION),
      label: Labels.BIOCHEMICAL_REACTION,
      manual: true,
      template: this.rheaTemplate$,
      isPresent: computed(() => this.hasRhea())
    },

    {key: DataKeys.PRECEDING_EVENT, label: Labels.PRECEDING_EVENT, scope: 'event'},
    {key: DataKeys.FOLLOWING_EVENT, label: Labels.FOLLOWING_EVENT, scope: 'event'},
    {key: DataKeys.INPUT_FOR, label: Labels.INPUT_FOR},
    {key: DataKeys.OUTPUT_FOR, label: Labels.OUTPUT_FOR},
    {
      key: DataKeys.REGULATES,
      label: Labels.REGULATES,
      manual: true,
      template: this.regulatesTemplate$,
      isPresent: computed(() => this.regulates().length > 0)
    },
    {key: DataKeys.COMPONENT_OF, label: Labels.COMPONENT_OF, hasDepthControl: true},
    {key: DataKeys.MEMBER_OF, label: Labels.MEMBER_OF, hasDepthControl: true},
    {key: DataKeys.CANDIDATE_OF, label: Labels.CANDIDATE_OF, hasDepthControl: true},
    {key: DataKeys.EVENT_OF, label: Labels.EVENT_OF, hasDepthControl: true, scope: 'event'},


    {key: DataKeys.INFERRED_TO, label: Labels.INFERENCES, manual: true, template: this.inferencesTemplate$},
    {key: DataKeys.INFERRED_FROM, label: Labels.INFERRED_FROM},
    {
      key: DataKeys.OTHER_FORMS,
      label: Labels.OTHER_FORMS,
      manual: true,
      template: this.otherFormsTemplate$,
      isPresent: computed(() => this.otherForms()?.size > 0)
    },

    {key: DataKeys.LITERATURE_REFERENCE, label: Labels.REFERENCE, manual: true, template: this.literatureRefsTemplate$},
    {
      key: camelCase(Labels.AUTHORSHIP),
      label: Labels.AUTHORSHIP,
      manual: true,
      template: this.authorsTemplate$,
      isPresent: computed(() => this.authorship()?.length > 0)
    },
    {
      key: DataKeys.INTERACTORS,
      label: Labels.INTERACTORS,
      manual: true,
      template: this.interactorsTemplate$,
      isPresent: computed(() => this.interactorsLength() > 0)
    },
  ]


  constructor(private iconService: IconService,
              private route: ActivatedRoute,
              private entity: EntityService,
              private interactorService: InteractorService,
  ) {
    effect(() => {
      !!this.section() && document.getElementById(this.section()!)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'start'
      });
    });
    effect(() => console.log("selected object", this.obj()))
  }


  getSymbol(obj: DatabaseObject) {
    return this.iconService.getIconDetails(obj);
  }

  // Group by species name
  getGroupedInferences(inferences: PhysicalEntity[]) {
    return this.entity.getGroupedData(inferences, pe => pe.speciesName);
  }

  // Group by compartment
  getGroupedOtherForms(otherForms: PhysicalEntity[]) {
    return this.entity.getGroupedData(otherForms, pe => {
      // Extract compartment (group name) from displayName => HSPA8 [plasma membrane] => plasma membrane
      return pe.displayName.match(/\[(.*?)\]/)?.[1] || pe.displayName;
    });
  }

  isTOCIncluded(key: string) {
    const obj = this.obj();
    switch (key) {
      case DataKeys.OVERVIEW:
        return obj;
      case DataKeys.PROTEIN_MARKER:
        return this.proteinMarkers().length + this.rnaMarkers().length > 0;
      case DataKeys.CATALYST_ACTIVITY:
        return this.catalystActivity() && this.catalystActivity().length > 0;
      case DataKeys.CROSS_REFERENCE:
        return this.crossReference().length > 0 && !this.hasRhea();
      case camelCase(Labels.BIOCHEMICAL_REACTION):
        return this.hasRhea();
      case DataKeys.OTHER_FORMS:
        return this.otherForms() && this.otherForms().size > 0;
      case camelCase(Labels.AUTHORSHIP):
        return this.authorship() && this.authorship().length > 0;
      case DataKeys.INTERACTORS:
        return this.interactors() && this.interactors().length > 0;
      default:
        return obj[key] !== undefined && obj[key];
    }
  }


}
