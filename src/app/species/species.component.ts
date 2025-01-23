import {AfterViewInit, Component, Input} from '@angular/core';
import {Species} from "../model/species.model";
import {SpeciesService} from "../services/species.service";
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
  styleUrls: ['./species.component.scss']
})
@UntilDestroy()
export class SpeciesComponent implements AfterViewInit {
  allSpecies: Species[] = [];
  currentSpecies!: Species;

  @Input('id') diagramId: string = '';
  @Input('visibility') visibility = {
    species: false,
    interactor: false
  }

  selectedTreeEvent?: Event;
  selectedObj?: DatabaseObject;

  constructor(private speciesService: SpeciesService,
              private router: Router,
              private route: ActivatedRoute,
              private state: DiagramStateService,
              private eventService: EventService,
              private dboService: DatabaseObjectService) {

  }

  ngAfterViewInit(): void {
    this.getSpecies();

    if (this.diagramId) {
      this.speciesService.setSpeciesFromDiagramId(this.diagramId);
    }

    this.speciesService.currentSpecies$.pipe(untilDestroyed(this)).subscribe(species => {
      this.currentSpecies = species;
    });

    this.eventService.selectedTreeEvent$.pipe(untilDestroyed(this)).subscribe(event => {
      this.selectedTreeEvent = event;
    });

    this.dboService.selectedObj$.pipe(untilDestroyed(this)).subscribe(event => {
      this.selectedObj = event;
    });

  }


  getSpecies() {
    this.speciesService.getSpecies().subscribe(species => {
      // Alphabetical order
      const sortedSpecies = [...species].sort((a, b) => a.displayName.localeCompare(b.displayName))
      sortedSpecies.forEach(s => this.speciesService.setShortName(s))
      this.allSpecies = sortedSpecies;
    })
  }

  onSpeciesChange(species: Species) {
    const ids = this.speciesService.getIdsFromURL(this.diagramId);

    this.currentSpecies = species;
    this.speciesService.setCurrentSpecies(species);

    const abbreviation = species.abbreviation;
    this.diagramId = this.diagramId.replace(/-(.*?)-/, `-${abbreviation}-`);

    // Include entity to ancestors list when selecting entity in the URL
    const ancestors = this.selectedTreeEvent?.ancestors || [];
    const stIdSet = new Set(ancestors.map(obj => obj.stId));
    if (this.selectedObj?.stId && !stIdSet.has(this.selectedObj.stId) && isEvent(this.selectedObj)) {
      ancestors.push(this.selectedObj);
    }

    this.speciesService.getOrthologyEventStId(species, this.selectedObj?.dbId, ancestors, ids)
      .subscribe((newSelectedStId) => {

        const updatedParams = this.speciesService.updateQueryParams(['select', 'flag', 'path'], newSelectedStId, abbreviation!, this.route);
        this.router.navigate(['PathwayBrowser', this.diagramId], {
          queryParamsHandling: "preserve"
        }).then(() => {
          if (updatedParams['select']) {
            this.state.set('select', updatedParams['select']);
          } else {
            this.state.set('select', '');
          }
          this.speciesService.setIgnore(true);
          if (updatedParams['flag']) this.state.set('flag', updatedParams['flag']);
          if (updatedParams['path']) this.state.set('path', updatedParams['path'].split(','));
          // Close the species panel after navigating
          setTimeout(() => this.visibility.species = false, 600);
        });
      });
  }
}
