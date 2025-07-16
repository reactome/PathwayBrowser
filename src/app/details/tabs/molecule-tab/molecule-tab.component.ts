import {Component, computed, effect, input} from '@angular/core';
import {Participant, ParticipantRefEntity, ParticipantService} from "../../../services/participant.service";
import {EntityService} from "../../../services/entity.service";
import {SelectableObject} from "../../../services/event.service";
import {SchemaClasses} from "../../../constants/constants";
import {rxResource} from "@angular/core/rxjs-interop";
import {DataStateService} from "../../../services/data-state.service";
import {ReferenceEntity} from "../../../model/graph/reference-entity/reference-entity.model";
import {of} from "rxjs";
import {IconService} from "../../../services/icon.service";
import {SortByTextPipe} from "../../../pipes/sort-by-text.pipe";
import {MatDivider} from "@angular/material/divider";
import {EntityTreeComponent} from "../../common/entity-tree/entity-tree.component";


interface MoleculeData {
  type: string;
  data: Molecule[];
  found?: number;
}

export interface Molecule {
  entity: ParticipantRefEntity;
  stoichiometry: number;
  highlight: boolean;
}

export enum PropertyType {

  PROTEINS = "Proteins",
  CHEMICAL_COMPOUNDS = "Chemical Compounds",
  SEQUENCES = "DNA/RNA",
  DRUG = "Drugs",
  OTHERS = "Others"
}

@Component({
  selector: 'cr-molecule-tab',
  templateUrl: './molecule-tab.component.html',
  imports: [
    SortByTextPipe,
    MatDivider,
    EntityTreeComponent
  ],
  styleUrl: './molecule-tab.component.scss'
})
export class MoleculeTabComponent {

  readonly obj = input.required<SelectableObject>();
  pathway = computed(() => this.dataState.currentPathway());

  selectedSection = signal<string | null>(null);

  constructor(private participant: ParticipantService,
              private entity: EntityService,
              private dataState: DataStateService,
              private iconService: IconService) {
    effect(() => {
      const stId = this.obj().stId;
      const pathwayId = this.pathway()?.stId;

      if (stId && stId !== pathwayId) {
        this.entity.loadRefEntities(stId);
        console.log("ji")
      }

    });

  }


  _pathwayParticipants = rxResource({
    request: () => this.dataState.currentPathway(),
    loader: () => {
      const id = this.dataState.currentPathway()?.stId;
      return id ? this.participant.getParticipants(id) : of(null);
    }
  });


  pathwayParticipants = computed(() => {
    return this._pathwayParticipants.value();
  });


  moleculeData = computed(() => {

    let moleculeData: MoleculeData[] = [];

    const pathwayParticipants = this.pathwayParticipants();

    if (!pathwayParticipants) return [];
    const pathwayResults = this.getPathwayParticipants(pathwayParticipants);

    if (this.obj().stId === this.pathway()?.stId) {
      moleculeData = pathwayResults;
    } else {
      const refEntities = this.entity.refEntities() || [];
      moleculeData = this.getReactionParticipants(pathwayResults, refEntities);
    }

    return moleculeData

  })

  getLabel(entity: ParticipantRefEntity) {
    let label = '';
    const schemaClass = entity.schemaClass;
    switch (schemaClass) {
      case SchemaClasses.EWAS:
      case SchemaClasses.REFERENCE_GENE_PRODUCT:
      case SchemaClasses.REFERENCE_ISOFORM:
        label = PropertyType.PROTEINS;
        break;
      case SchemaClasses.REFERENCE_RNA_SEQUENCE:
      case SchemaClasses.REFERENCE_DNA_SEQUENCE:
        label = PropertyType.SEQUENCES;
        break;
      case SchemaClasses.SIMPLE_ENTITY:
      case SchemaClasses.REFERENCE_MOLECULE:
        label = PropertyType.CHEMICAL_COMPOUNDS;
        break;
      case SchemaClasses.REFERENCE_THERAPEUTIC:
        label = PropertyType.DRUG
        break;
      default:
        label = PropertyType.OTHERS;
    }

    return label;
  }


  getPathwayParticipants(pathwayParticipants: Participant[]) {

    const groupedMap = new Map<string, Map<number, Molecule>>();
    const allRefEntities = pathwayParticipants?.flatMap(participant => participant.refEntities) || [];

    for (const entity of allRefEntities) {
      const label = this.getLabel(entity);

      if (!groupedMap.has(label)) {
        groupedMap.set(label, new Map());
      }

      const dataMap = groupedMap.get(label)!;
      const existingEntity = dataMap.get(entity.dbId);

      if (existingEntity) {
        existingEntity.stoichiometry++;
      //  existingEntity.stoichiometry = (existingEntity.stoichiometry ?? 0) + 1;
      } else {
        dataMap.set(entity.dbId, {entity, stoichiometry: 1, highlight: true})
      }
    }


    // todo remove finalResults
    const finalResults: MoleculeData[] = Array.from(groupedMap, ([type, dataMap]) => ({
      type,
      //found: undefined,
      data: Array.from(dataMap.values())
    }));
 console.log('finalResults', finalResults);
    return finalResults;
  }

  getReactionParticipants(pathwayResults: MoleculeData[], refEntities: ReferenceEntity[]) {

    const dbIds = new Set(refEntities?.map(e => e.dbId));

    return pathwayResults.map(group => {
      let found = 0;

      const updatedData = group.data.map(molecule => {
        const isFound = dbIds.has(molecule.entity.dbId);
        if (isFound) found++;
        return {
          ...molecule,
          highlight: isFound,
        };
      });

      return {
        ...group,
        data: updatedData,
        found,
      }
    })
  }

  scrollTo(type: string) {
    const id = this.sanitizeId(type);
    const element = document.getElementById(`${id}`);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'start'
      })
    }
  }

  sanitizeId(label: string): string {
    return label
      .toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with dashes
      .replace(/[^a-z0-9-_]/g, '');   // Remove special characters
  }


  getSymbol(obj: string) {
    return this.iconService.getIconDetails(obj);
  }

}
