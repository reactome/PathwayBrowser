import {Component, computed, input, Signal} from '@angular/core';
import {DatabaseObject} from "../../../../model/graph/database-object.model";
import {getProperty, isDefined} from "../../../../services/utils";
import {Anatomy} from "../../../../model/graph/external-ontology/anatomy.model";
import {ReviewStatus} from "../../../../model/graph/review-status.model";
import {Summation} from '../../../../model/graph/summation.model';
import {DataKeys} from "../../../../constants/constants";
import {Relationship} from "../../../../model/graph/relationship.model";
import {Disease} from "../../../../model/graph/external-ontology/disease.model";
import {CellType} from "../../../../model/graph/external-ontology/cell-type.model";
import HasCompartment = Relationship.HasCompartment;
import {NgIf, TitleCasePipe} from "@angular/common";
import {OntologyTermComponent} from "../../../common/ontology-term/ontology-term.component";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {IncludeRefPipe} from "../../../../pipes/include-ref.pipe";
import {RefsTreeComponent} from "../../../common/refs-tree/refs-tree.component";


@Component({
  selector: 'cr-description-overview',
  templateUrl: './description-overview.component.html',
  imports: [
    TitleCasePipe,
    OntologyTermComponent,
    MatProgressSpinner,
    IncludeRefPipe,
    RefsTreeComponent,
    NgIf
  ],
  styleUrl: './description-overview.component.scss'
})
export class DescriptionOverviewComponent {

  readonly obj = input.required<DatabaseObject>();
  readonly showSpecies = input<boolean>(true);

  readonly allRefs = computed(() => {
    const literatureRefs = getProperty(this.obj(), DataKeys.LITERATURE_REFERENCE);
    const summation = getProperty(this.obj(), DataKeys.SUMMATION);
    return [...literatureRefs || [], ...summation.flatMap((s: Summation) => s.literatureReference).filter(isDefined) || []]
  });

  readonly category: Signal<string> = computed(() => getProperty(this.obj(), DataKeys.CATEGORY));
  readonly className: Signal<string> = computed(() => getProperty(this.obj(), DataKeys.CLASS_NAME));
  readonly speciesName: Signal<string> = computed(() => getProperty(this.obj(), DataKeys.SPECIES_NAME));
  readonly compartment: Signal<HasCompartment[]> = computed(() => getProperty(this.obj(), DataKeys.COMPARTMENT));
  readonly name: Signal<string> = computed(() => getProperty(this.obj(), DataKeys.NAME));
  readonly tissue: Signal<Anatomy> = computed(() => getProperty(this.obj(), DataKeys.TISSUE));
  readonly reviewStatus: Signal<ReviewStatus> = computed(() => getProperty(this.obj(), DataKeys.REVIEW_STATUS));
  readonly summations: Signal<Summation[]> = computed(() => getProperty(this.obj(), DataKeys.SUMMATION));
  readonly disease: Signal<Disease[]> = computed(() => getProperty(this.obj(), DataKeys.DISEASE));
  readonly cellType: Signal<CellType[]> = computed(() => getProperty(this.obj(), DataKeys.CELL_TYPE));
  readonly organ: Signal<Anatomy> = computed(()=>getProperty(this.obj(), DataKeys.ORGAN));
  readonly tissueLayer: Signal<Anatomy> = computed(()=>getProperty(this.obj(), DataKeys.TISSUE_LAYER));

  reviewStar: { [key: string]: { percentage: number, score: number } } = {
    "five stars": {percentage: 100, score: 5},
    "four stars": {percentage: 80, score: 4},
    "three stars": {percentage: 60, score: 3},
    "two stars": {percentage: 40, score: 2},
    "one stars": {percentage: 20, score: 1}
  };


}
