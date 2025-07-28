import {Component, computed, effect, input, WritableSignal} from '@angular/core';
import {Molecule, Participant, ParticipantService} from "../../../services/participant.service";
import {EntityService} from "../../../services/entity.service";
import {SelectableObject} from "../../../services/event.service";
import {rxResource} from "@angular/core/rxjs-interop";
import {DataStateService} from "../../../services/data-state.service";
import {ReferenceEntity} from "../../../model/graph/reference-entity/reference-entity.model";
import {of} from "rxjs";
import {SortByTextPipe} from "../../../pipes/sort-by-text.pipe";
import {MatDivider} from "@angular/material/divider";
import {ObjectTreeComponent} from "../../common/object-tree/object-tree.component";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {SortByDatePipe} from "../../../pipes/sort-by-date.pipe";
import {MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle} from "@angular/material/expansion";
import {MoleculeDownloadTableComponent} from "./molecule-download-table/molecule-download-table.component";
import {UrlStateService} from "../../../services/url-state.service";
import {isPathway} from "../../../services/utils";


export type MoleculeGroup = {
  category: string;
  data: MoleculeData[];
  found?: number;
}

export type MoleculeData = {
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
    MatProgressSpinner,
    SortByDatePipe,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MoleculeDownloadTableComponent
  ],
  styleUrl: './molecule-tab.component.scss'
})
export class MoleculeTabComponent {

  readonly obj = input.required<SelectableObject>();
  pathwayId = this.state.pathwayId as WritableSignal<string>;


  constructor(private participant: ParticipantService,
              private entity: EntityService,
              private dataState: DataStateService,
              public state: UrlStateService) {
    effect(() => {
      const stId = this.obj()?.stId;
      const pathwayId = this.pathwayId();
      if (stId && stId !== pathwayId) {
        this.entity.loadRefEntities(stId);
      }
    });
  }

  _pathwayParticipants = rxResource({
    request: () => this.dataState.currentPathway() || this.obj(),
    loader: () => {
      const id = this.dataState.currentPathway() ? this.dataState.currentPathway()!.stId : this.obj()?.stId;
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

    if (this.pathwayId()) {
      if (this.obj().stId === this.pathwayId()) {
        moleculeData = pathwayResults;
      } else {
        const refEntities = this.entity.refEntities() || [];
        moleculeData = this.getReactionParticipants(pathwayResults, refEntities);
      }
    } else {
      if (isPathway(this.obj())) {
        moleculeData = pathwayResults;
      }
    }

    return moleculeData
  })


  getPathwayParticipants(pathwayParticipants: Participant[]) {

    const groupedMap = new Map<string, Map<number, MoleculeData>>();
    const allRefEntities = pathwayParticipants?.flatMap(participant => participant.refEntities) || [];

    for (const entity of allRefEntities) {
      const type = entity.type;

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
    const finalResults: MoleculeGroup[] = Array.from(groupedMap, ([category, dataMap]) => ({
      category,
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
