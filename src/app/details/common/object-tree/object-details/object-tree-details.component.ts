import {Component, computed, effect, input} from '@angular/core';
import {ReferenceEntity} from "../../../../model/graph/reference-entity/reference-entity.model";
import {SelectableObject} from "../../../../services/event.service";
import {DatabaseIdentifier} from "../../../../model/graph/database-identifier.model";
import {StructureViewerComponent} from "../../../tabs/molecule-tab/structure-viewer/structure-viewer.component";
import {MatDivider} from "@angular/material/divider";
import {
  DescriptionOverviewComponent
} from "../../../tabs/description-tab/description-overview/description-overview.component";
import {ExternalReferenceComponent} from "../../external-reference/external-reference.component";
import {CrossReferencesComponent} from "../../cross-references/cross-references.component";
import {isRefEntity} from "../../../../services/utils";
import {MoleculeType} from "../../../tabs/molecule-tab/molecule-tab.component";

@Component({
  selector: 'cr-object-tree-details',
  imports: [
    StructureViewerComponent,
    MatDivider,
    DescriptionOverviewComponent,
    ExternalReferenceComponent,
    CrossReferencesComponent
  ],
  templateUrl: './object-tree-details.component.html',
  styleUrl: './object-tree-details.component.scss'
})
export class ObjectTreeDetailsComponent {

  readonly obj = input.required<SelectableObject>();
  readonly className = input<string>();
  readonly refEntity = input.required<ReferenceEntity | null>();
  readonly xRefs = input.required<DatabaseIdentifier[]>();
  readonly isMoleculeView = input.required<boolean>();

  hasProteinStructureOnDetail = computed(() => this.className() === MoleculeType.PROTEIN && this.refEntity() && this.xRefs());
  hasStructureOnMolecule = computed(() => this.moleculeType() === MoleculeType.PROTEIN || this.moleculeType() === MoleculeType.CHEMICAL)

  moleculeType = computed(() => {
    const entity = this.obj();
    if (isRefEntity(entity)) {
      return entity.moleculeType;
    }
    return null;
  })

  protected readonly MoleculeType = MoleculeType;
}
