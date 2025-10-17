import {ChangeDetectionStrategy, Component, computed, effect, input, signal} from '@angular/core';
import {ReferenceEntity} from "../../../../model/graph/reference-entity/reference-entity.model";
import {SelectableObject} from "../../../../services/event.service";
import {DatabaseIdentifier} from "../../../../model/graph/database-identifier.model";
import {MatDivider} from "@angular/material/divider";
import {
  DescriptionOverviewComponent
} from "../../../tabs/description-tab/description-overview/description-overview.component";
import {ExternalReferenceComponent} from "../../external-reference/external-reference.component";
import {CrossReferencesComponent} from "../../cross-references/cross-references.component";
import {isRefEntity} from "../../../../services/utils";
import {MoleculeType} from "../../../tabs/molecule-tab/molecule-tab.component";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {NoticeInfoComponent} from "../../notice-info/notice-info.component";
import {EntityService} from "../../../../services/entity.service";
import {Labels} from "../../../../constants/constants";

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

  displayNotice = signal<boolean>(false);

  moleculeType = computed(() => {
    const entity = this.refEntity() || this.obj();
    if (isRefEntity(entity)) {
      return entity.moleculeType;
    }
    return null;
  })

  hasStructure = computed(() => this.moleculeType() === MoleculeType.PROTEIN || this.moleculeType() === MoleculeType.CHEMICAL);

  constructor(private entity: EntityService) {
    effect(() => {
      if (this.moleculeType() === MoleculeType.ENTITY || this.moleculeType() === MoleculeType.CHEMICAL_DRUG) {
        let emptyExternalRef;
        const referenceEntity = this.refEntity();
        if (referenceEntity) {
          // target only external Ref exists and no gene name, chain,referenceGene,referenceTranscript
          const displayedExternalRef = this.entity.getTransformedExternalRef(referenceEntity);
          emptyExternalRef = displayedExternalRef.length === 1 && displayedExternalRef[0].label === Labels.EXTERNAL_REFERENCE;
        } else {
          emptyExternalRef = false;
        }
        const isShow = this.isMoleculeView() && emptyExternalRef && this.xRefs().length === 0;
        this.displayNotice.set(isShow);
      } else {
        this.displayNotice.set(false);
      }
    });

  }

  protected readonly MoleculeType = MoleculeType;
}
