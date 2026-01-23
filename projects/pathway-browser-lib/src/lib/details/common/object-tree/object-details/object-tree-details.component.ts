import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {ReferenceEntity} from "../../../../model/graph/reference-entity/reference-entity.model";
import {SelectableObject} from "../../../../services/event.service";
import {DatabaseIdentifier} from "../../../../model/graph/database-identifier.model";
import {MatDivider} from "@angular/material/divider";
import {
  DescriptionOverviewComponent
} from "../../../tabs/description-tab/description-overview/description-overview.component";
import {ExternalReferenceComponent} from "../../external-reference/external-reference.component";
import {CrossReferencesComponent} from "../../cross-references/cross-references.component";
import {isMolecule, isRefEntity} from "../../../../services/utils";
import {MoleculeType} from "../../../tabs/molecule-tab/molecule-tab.component";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {NoticeInfoComponent} from "../../notice-info/notice-info.component";
import {EntityService} from "../../../../services/entity.service";
import {Labels} from "../../../../constants/constants";
import {StructureService} from "../../../../services/structure.service";

@Component({
  selector: 'cr-object-tree-details',
  imports: [
    MatDivider,
    DescriptionOverviewComponent,
    ExternalReferenceComponent,
    CrossReferencesComponent,
    MatProgressSpinner,
    NoticeInfoComponent
  ],
  templateUrl: './object-tree-details.component.html',
  styleUrl: './object-tree-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObjectTreeDetailsComponent {

  readonly obj = input.required<SelectableObject>();
  readonly className = input<string>();
  readonly refEntity = input.required<ReferenceEntity | null>();
  readonly xRefs = input.required<DatabaseIdentifier[]>();
  readonly isMoleculeView = input.required<boolean>();
  readonly isLoading = input<boolean>(false);

  moleculeType = computed(() => {
    const entity = this.refEntity() || this.obj();
    if (isRefEntity(entity)) {
      return entity.moleculeType;
    }
    return null;
  })

  hasStructure = computed(() => this.moleculeType() === MoleculeType.PROTEIN || this.moleculeType() === MoleculeType.CHEMICAL);

  hasStructureData  = computed(() => this.structure.hasAnyStructure());

  constructor(private entity: EntityService,
              private structure: StructureService) {
  }

  displayNotice = computed(() => {
    if (!isMolecule(this.obj())) return false;

    const referenceEntity = this.refEntity();
    if (!referenceEntity) return false;

    const displayedExternalRef = this.entity.getTransformedExternalRef(referenceEntity);
    const otherKeys = ['geneName', 'chain', 'referenceGene', 'referenceTranscript'];
    const onlyDisplayName = displayedExternalRef.length === 1 && displayedExternalRef[0].label === Labels.EXTERNAL_REFERENCE;
    const hasOtherFields = otherKeys.some(key => referenceEntity[key]);
    const emptyExternalRef = onlyDisplayName && !hasOtherFields;

    return this.isMoleculeView() && emptyExternalRef && this.xRefs().length === 0 && !this.hasStructureData();
  });


  protected readonly MoleculeType = MoleculeType;
}
