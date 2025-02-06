import {AfterViewInit, Component, input, model} from '@angular/core';
import {Species} from "../model/graph/species.model";
import {SpeciesService} from "../services/species.service";
import {UntilDestroy} from "@ngneat/until-destroy";
import {DataStateService} from "../services/data-state.service";
import {isDefined} from "../services/utils";
import {UrlStateService} from "../services/url-state.service";


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

  constructor(public speciesService: SpeciesService, private dataState: DataStateService, private state: UrlStateService) {

  }

  ngAfterViewInit(): void {
  }

  onSpeciesChange(newSpecies: Species) {
    this.speciesService.currentSpecies.set(newSpecies);

    this.speciesService.getClosestOrthologPathwayWithSelect(
      this.state.select(),
      [...(this.dataState.currentPathway()?.ancestors || []),
        this.dataState.currentPathway()
      ].filter(isDefined),
      newSpecies
    ).subscribe(({pathway, map}) => {
      this.speciesService.updateQueryParams(map, pathway);
      this.visibility().species = false;
    })

  }
}
