import {Component, computed, input} from '@angular/core';
import {DatabaseIdentifier} from "../../../../model/graph/database-identifier.model";
import {StructureViewerComponent} from "../structure-viewer/structure-viewer.component";
import {MatDivider} from "@angular/material/divider";
import {CrossReferencesComponent} from "../../../common/cross-references/cross-references.component";
import {ReferenceEntity} from "../../../../model/graph/reference-entity/reference-entity.model";
import {isRefEntity} from "../../../../services/utils";

export enum MoleculeType {

  PROTEIN = "Protein",
  CHEMICAL_DRUG = "ChemicalDrug",
  ENTITY = "Entity",
  CHEMICAL = "Chemical"
}

@Component({
  selector: 'cr-molecule-details',
  templateUrl: './molecule-details.component.html',
  imports: [
    StructureViewerComponent,
    MatDivider,
    CrossReferencesComponent
  ],
  styleUrl: './molecule-details.component.scss'
})
export class MoleculeDetailsComponent {
  readonly obj = input.required<ReferenceEntity>();
  readonly xRefs = input.required<DatabaseIdentifier[]>();


  moleculeType = computed(() => {
    const entity = this.obj();
    if (isRefEntity(entity)) {
      return entity.moleculeType;
    }
    return null;
  })

  protected readonly MoleculeType = MoleculeType;
}
