import {AfterViewInit, Component, input, model} from '@angular/core';
import {Species} from "../model/species.model";
import {SpeciesService} from "../services/species.service";
import {UntilDestroy} from "@ngneat/until-destroy";
import {DataStateService} from "../services/data-state.service";
import {isDefined} from "../services/utils";
import {ActivatedRoute, Router} from "@angular/router";
import {DiagramStateService} from "../services/diagram-state.service";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {EventService} from "../services/event.service";
import {Event} from "../model/graph/event.model";
import {DatabaseObject} from "../model/graph/database-object.model";
import {isEvent} from "../services/utils";
import {DatabaseObjectService} from "../services/database-object.service";


@Component({
  selector: 'cr-species',
  templateUrl: './species.component.html',
  styleUrls: ['./species.component.scss'],
  standalone: false
})
@UntilDestroy()
export class SpeciesComponent implements AfterViewInit {

  readonly pathwayId = model.required<string>();
  readonly visibility = input({
    species: false,
    interactor: false
  });

  constructor(public speciesService: SpeciesService, private dataState: DataStateService, private eventService: EventService,private dboService: DatabaseObjectService) {

  }

  ngAfterViewInit(): void {
  }

  onSpeciesChange(newSpecies: Species) {
    const formerSpecies = this.speciesService.currentSpecies();
    this.speciesService.currentSpecies.set(newSpecies);

    this.speciesService.getClosestOrthologPathway(
      [...(this.dataState.currentPathway()?.ancestors || []),
        this.dataState.currentPathway()
      ].filter(isDefined),
      newSpecies
    ).subscribe(({pathway}) => {
      this.speciesService.updateQueryParams(pathway?.stId, formerSpecies, newSpecies);
      this.visibility().species = false;
    })

  }
}
