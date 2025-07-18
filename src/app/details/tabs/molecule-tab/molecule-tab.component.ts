import {Component, computed, effect, input} from '@angular/core';
import {Molecule, Participant, ParticipantService} from "../../../services/participant.service";
import {EntityService} from "../../../services/entity.service";
import {SelectableObject} from "../../../services/event.service";
import {SchemaClasses} from "../../../constants/constants";
import {rxResource} from "@angular/core/rxjs-interop";
import {DataStateService} from "../../../services/data-state.service";
import {ReferenceEntity} from "../../../model/graph/reference-entity/reference-entity.model";
import {of} from "rxjs";
import {SortByTextPipe} from "../../../pipes/sort-by-text.pipe";
import {MatDivider} from "@angular/material/divider";
import {ObjectTreeComponent} from "../../common/entity-tree/object-tree.component";
import {MatProgressSpinner} from "@angular/material/progress-spinner";


interface MoleculeGroup {
  type: string;
  data: MoleculeData[];
  found?: number;
}

export interface MoleculeData {
  entity: Molecule;
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
    ObjectTreeComponent,
    MatProgressSpinner
  ],
  styleUrl: './molecule-tab.component.scss'
})
export class MoleculeTabComponent {

  readonly obj = input.required<SelectableObject>();
  pathway = computed(() => this.dataState.currentPathway());


  constructor(private participant: ParticipantService,
              private entity: EntityService,
              private dataState: DataStateService) {
    effect(() => {
      const stId = this.obj()?.stId;
      const pathwayId = this.pathway()?.stId;

      if (stId && stId !== pathwayId) {
        this.entity.loadRefEntities(stId);
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

    let moleculeData: MoleculeGroup[] = [];

    const pathwayParticipants = this.pathwayParticipants();
    if (!pathwayParticipants) return [];

    const pathwayResults = this.getPathwayParticipants(pathwayParticipants);
    if (this.obj()?.stId === this.pathway()?.stId) {
      moleculeData = pathwayResults;
    } else {
      const refEntities = this.entity.refEntities() || [];
      moleculeData = this.getReactionParticipants(pathwayResults, refEntities);
    }

    return moleculeData

  })

  getType(molecule: Molecule) {
    let type = '';
    const schemaClass = molecule.schemaClass;
    switch (schemaClass) {
      case SchemaClasses.EWAS:
      case SchemaClasses.REFERENCE_GENE_PRODUCT:
      case SchemaClasses.REFERENCE_ISOFORM:
        type = PropertyType.PROTEINS;
        break;
      case SchemaClasses.REFERENCE_RNA_SEQUENCE:
      case SchemaClasses.REFERENCE_DNA_SEQUENCE:
        type = PropertyType.SEQUENCES;
        break;
      case SchemaClasses.SIMPLE_ENTITY:
      case SchemaClasses.REFERENCE_MOLECULE:
        type = PropertyType.CHEMICAL_COMPOUNDS;
        break;
      case SchemaClasses.REFERENCE_THERAPEUTIC:
        type = PropertyType.DRUG
        break;
      default:
        type = PropertyType.OTHERS;
    }

    return type;
  }


  getPathwayParticipants(pathwayParticipants: Participant[]) {

    const groupedMap = new Map<string, Map<number, MoleculeData>>();
    const allRefEntities = pathwayParticipants?.flatMap(participant => participant.refEntities) || [];

    for (const entity of allRefEntities) {
      const type = this.getType(entity);

      if (!groupedMap.has(type)) {
        groupedMap.set(type, new Map());
      }

      const dataMap = groupedMap.get(type)!;
      const existingEntity = dataMap.get(entity.dbId);

      if (existingEntity) {
        existingEntity.stoichiometry++;
        // existingEntity.stoichiometry = (existingEntity.stoichiometry ?? 0) + 1;
      } else {
        dataMap.set(entity.dbId, {entity, stoichiometry: 1, highlight: true})
      }
    }


    // todo remove finalResults
    const finalResults: MoleculeGroup[] = Array.from(groupedMap, ([type, dataMap]) => ({
      type,
      data: Array.from(dataMap.values())
    }));
    return finalResults;
  }

  getReactionParticipants(pathwayResults: MoleculeGroup[], refEntities: ReferenceEntity[]) {

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


  getStatistics(graph: MoleculeGroup) {
    const found = graph.found;
    const total = graph.data.length;
    return found ? `${found}/${total}` : `${total}`

  }
}
