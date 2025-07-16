import {Component, computed, input} from '@angular/core';
import {CatalystActivityReference} from "../../../model/graph/control-reference/catalyst-activity-reference.model";
import {CatalystActivity} from "../../../model/graph/catalyst-activity.model";
import {Relationship} from "../../../model/graph/relationship.model";
import {Regulation} from "../../../model/graph/Regulation/regulation.model";
import {IconService} from "../../../services/icon.service";
import {RegulationReference} from "../../../model/graph/control-reference/regulation-reference.model";
import {DatabaseObject} from "../../../model/graph/database-object.model";
import {
  hasProperty,
  isCatalystActivity,
  isFragmentModification,
  isHasModifiedResidue,
  isPhysicalEntity,
  isReferenceGroup,
  isReferenceMolecule,
  isRegulation,
  isReplacedResidue
} from "../../../services/utils";
import {MolecularProcess} from "../../../model/graph/molecular-process.model";
import HasModifiedResidue = Relationship.HasModifiedResidue;


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
      isRegulation: true
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
      isCatalystActivity: true
    } as unknown as MolecularProcess;
  }

  private getModifiedResidue(entry: HasModifiedResidue) {
    let psiMods = hasProperty(entry.element, "psiMod") ? entry.element.psiMod : undefined;

    if (psiMods) {
      psiMods = Array.isArray(psiMods) ? psiMods : [psiMods]; // Ensure it's always an array
    } else {
      psiMods = undefined;
    }

    return {
      displayName: entry.element.displayName,
      schemaClass: entry.element.schemaClass,
      name: entry.element.displayName,
      psiMod: psiMods,
      coordinate: hasProperty(entry.element, "coordinate") ? entry.element.coordinate : undefined,
      modification: hasProperty(entry.element, "modification") ? entry.element.modification : undefined,
      literatureReference: [],
      isModification: true
    } as unknown as MolecularProcess;
  }

  protected readonly isReferenceGroup = isReferenceGroup;
  protected readonly isEntity = isEntity;
  protected readonly isReplacedResidue = isReplacedResidue;
  protected readonly isFragmentModification = isFragmentModification;
  protected readonly isReferenceMolecule = isReferenceMolecule;
}
