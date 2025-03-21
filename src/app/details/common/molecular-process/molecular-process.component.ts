import {Component, computed, effect, input} from '@angular/core';
import {CatalystActivityReference} from "../../../model/graph/control-reference/catalyst-activity-reference.model";
import {CatalystActivity} from "../../../model/graph/catalyst-activity.model";
import {Relationship} from "../../../model/graph/relationship.model";
import {Regulation} from "../../../model/graph/Regulation/regulation.model";
import {IconService} from "../../../services/icon.service";
import {RegulationReference} from "../../../model/graph/control-reference/regulation-reference.model";
import {DatabaseObject} from "../../../model/graph/database-object.model";
import {
  hasModification,
  isCatalystActivity,
  isEntity,
  isHasModifiedResidue,
  isReferenceGroup,
  isRegulation
} from "../../../services/utils";

import HasModifiedResidue = Relationship.HasModifiedResidue;
import {MolecularProcess} from "../../../model/graph/molecular-process.model";


@Component({
  selector: 'cr-molecular-process',
  standalone: false,
  templateUrl: './molecular-process.component.html',
  styleUrl: './molecular-process.component.scss'
})
/**
 * This is a shared component for regulation, catalystActivity and modifiedResidue(modifications)
 */
export class MolecularProcessComponent {

  readonly objects = input.required<(Regulation | CatalystActivity | HasModifiedResidue)[]>({alias: 'entries'});
  readonly catalystActivityReference = input.required<CatalystActivityReference>({alias: "catalystActivityReference"});
  readonly regulationRefs = input.required<RegulationReference[]>({alias: 'regulationRefs'});

  constructor(private iconService: IconService) {
    effect(() => {
      console.log("data is ", this.data())
    });
  }

  getSymbol(obj: DatabaseObject) {
    return this.iconService.getIconDetails(obj);
  }

  data = computed(() => this.getData());


  getData(): MolecularProcess[] {
    return this.objects().map(entry => {
      if (isRegulation(entry)) {
        return this.getRegulation(entry);
      } else if (isCatalystActivity(entry)) {
        return this.getCatalystActivity(entry);
      } else if (isHasModifiedResidue(entry)) {
        return this.getModifiedResidue(entry);
      } else {
        return {} as MolecularProcess;
      }
    });
  }


  private getRegulation(entry: Regulation) {
    return {
      dbId: entry.dbId,
      schemaClass: entry.schemaClass,
      type: entry.schemaClass.includes('Negative') ? 'Negative Regulation' : 'Positive Regulation',
      go_BiologicalProcess: entry.activity,
      activeUnit: entry.activeUnit,
      regulator: entry.regulator,
      regulationReference: this.regulationRefs(),
    } as unknown as MolecularProcess;
  }

  private getCatalystActivity(entry: CatalystActivity) {
    return {
      dbId: entry.dbId,
      schemaClass: entry.schemaClass,
      type: 'Catalysis',
      activity: entry.activity,
      ecNumber: entry.activity && entry.activity.ecNumber,
      activeUnit: entry.activeUnit,
      catalyst: entry.physicalEntity,
      catalystActivityReference: this.catalystActivityReference(),
    } as unknown as MolecularProcess;
  }

  private getModifiedResidue(entry: HasModifiedResidue) {
    return {
      type: "Modification",
      schemaClass: entry.element.schemaClass,
      psiMod: entry.element.psiMod,
      coordinate: entry.element.coordinate,
      modification: hasModification(entry.element) && entry.element.modification,
      literatureReference: [],
    } as unknown as MolecularProcess;
  }

  protected readonly isReferenceGroup = isReferenceGroup;
  protected readonly isEntity = isEntity;
}
