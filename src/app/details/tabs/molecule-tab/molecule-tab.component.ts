import {Component, computed, effect, Inject, input, WritableSignal} from '@angular/core';
import {Molecule, Participant, ParticipantService} from "../../../services/participant.service";
import {EntityService} from "../../../services/entity.service";
import {SelectableObject} from "../../../services/event.service";
import {rxResource} from "@angular/core/rxjs-interop";
import {ReferenceEntity} from "../../../model/graph/reference-entity/reference-entity.model";
import {SortByTextPipe} from "../../../pipes/sort-by-text.pipe";
import {MatDivider} from "@angular/material/divider";
import {ObjectTreeComponent} from "../../common/object-tree/object-tree.component";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {SortByDatePipe} from "../../../pipes/sort-by-date.pipe";
import {MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle} from "@angular/material/expansion";
import {MoleculeDownloadTableComponent} from "./molecule-download-table/molecule-download-table.component";
import {UrlStateService} from "../../../services/url-state.service";
import {isPathway} from "../../../services/utils";
import {CdkVirtualScrollViewport, ScrollingModule, VIRTUAL_SCROLL_STRATEGY} from "@angular/cdk/scrolling";
import {ScrollingModule as ExperimentalScrollingModule} from "@angular/cdk-experimental/scrolling";
import {
  ExpandableVirtualScrollStrategy
} from "../../../utils/expandable-virtual-scroll/expandable-virtual-scroll.strategy";
import {ItemResizeObserverDirective} from "../../../utils/expandable-virtual-scroll/item-resize-observer.directive";
import {GroupByPipe} from "../../../pipes/group-by.pipe";


// TODO: Find a way to not crash when too many data, e.g. selecting a top level pathway. (using virtual scrolls probably, but wit a way to expand rows)

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
// molecule type from backend when sending enhanced query
export enum MoleculeType {
  PROTEIN = "Protein", //Protein
  CHEMICAL_DRUG = "ChemicalDrug", // Drugs
  ENTITY = "Entity", // DRA/RNA
  CHEMICAL = "Chemical" //Chemical
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
    MoleculeDownloadTableComponent,
    GroupByPipe,
    SortByDatePipe,
    ScrollingModule,
    // ExperimentalScrollingModule,
    ItemResizeObserverDirective,
  ],
  styleUrl: './molecule-tab.component.scss',
  providers: [{
    provide: VIRTUAL_SCROLL_STRATEGY,
    useClass: ExpandableVirtualScrollStrategy
  }]
})
export class MoleculeTabComponent {


  readonly selectableObject = input.required<SelectableObject>();
  pathwayId = this.state.pathwayId as WritableSignal<string>;

  // Get selected pathway id on Reacfoam view
  objStId = computed(() => this.pathwayId() ? this.pathwayId() : this.selectableObject()?.stId);

  isReacfoamView = computed(() => !(this.state.select() || this.state.pathwayId()));


  constructor(private participant: ParticipantService,
              private entity: EntityService,
              private state: UrlStateService,
              @Inject(VIRTUAL_SCROLL_STRATEGY)
              public readonly strategy: ExpandableVirtualScrollStrategy,
              private groupByPipe: GroupByPipe) {
    effect(() => {
      const selectableObjStId = this.selectableObject()?.stId;
      const pathwayId = this.pathwayId();
      if (selectableObjStId && selectableObjStId !== pathwayId) {
        this.entity.loadRefEntities(selectableObjStId);
      }
    });
  }

  _pathwayParticipants = rxResource({
    request: () => this.objStId(),
    loader: () => this.participant.getParticipants(this.objStId())
  });


  pathwayParticipants = this._pathwayParticipants.value


  moleculeData = computed(() => {

    let moleculeData: MoleculeGroup[] = [];

    const pathwayParticipants = this.pathwayParticipants();
    if (!pathwayParticipants) return [];

    const pathwayResults = this.getPathwayParticipants(pathwayParticipants);

    if (!this.isReacfoamView()) {
      if (this.selectableObject()?.stId === this.pathwayId()) {
        moleculeData = pathwayResults;
      } else {
        const refEntities = this.entity.refEntities() || [];
        moleculeData = this.getReactionParticipants(pathwayResults, refEntities);
      }
    } else {
      if (isPathway(this.selectableObject())) {
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

  protected readonly isPathway = isPathway;
}
