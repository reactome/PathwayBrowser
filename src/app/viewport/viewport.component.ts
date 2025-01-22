import {AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {DiagramComponent} from "../diagram/diagram.component";
import {ResourceAndType} from "../interactors/model/interactor.model";
import {InteractorsComponent} from "../interactors/interactors.component";
import {Species} from "../model/species.model";
import {SpeciesService} from "../services/species.service";
import {InteractorService} from "../interactors/services/interactor.service";
import {EhldService} from "../services/ehld.service";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {AnalysisService} from "../services/analysis.service";
import {DarkService} from "../services/dark.service";
import {EventService} from "../services/event.service";


@Component({
    selector: 'cr-viewport',
    templateUrl: './viewport.component.html',
    styleUrls: ['./viewport.component.scss'],
    standalone: false
})
@UntilDestroy()
export class ViewportComponent implements AfterViewInit, OnChanges {


  @ViewChild('diagram') diagram: DiagramComponent | undefined;
  @ViewChild('interactors') interactors!: InteractorsComponent;
  @Input('id') diagramId: string = '';
  hasEHLD? : boolean;

  currentInteractorResource: ResourceAndType | undefined = {name: null, type: null};
  currentSpecies: Species | undefined = undefined;

  visibility = {
    species: false,
    interactor: false
  }

  constructor(private speciesService: SpeciesService,
              private interactorService: InteractorService,
              private cdRef: ChangeDetectorRef,
              public analysis: AnalysisService,
              public dark: DarkService,
              private ehldService: EhldService,
              private eventService: EventService,
  ) {
  }

  ngAfterViewInit(): void {

    this.speciesService.currentSpecies$.pipe(untilDestroyed(this)).subscribe(species => {
      this.currentSpecies = species;
      // Updated the content after ngAfterContentChecked to avoid ExpressionChangedAfterItHasBeenCheckedError
      this.cdRef.detectChanges();
    });

    this.interactorService.currentInteractorResource$.pipe(untilDestroyed(this)).subscribe(resource => {
      this.currentInteractorResource = resource;
    });

    if (this.diagramId) {
      this.getEnhancedResult();
    }

    this.ehldService.hasEHLD$.pipe(untilDestroyed(this),).subscribe((hasEHLD) => {
      this.hasEHLD = hasEHLD;
    });

  }


  toggleVisibility(type: string) {
    if (type === 'species') {
      this.visibility.species = !this.visibility.species;
      this.visibility.interactor = false;
    } else if (type === 'interactor') {
      this.visibility.interactor = !this.visibility.interactor;
      this.visibility.species = false;
    }
  }

  private getEnhancedResult(): void {
    this.eventService.fetchEnhancedEventData(this.diagramId)
      .subscribe((enhancedResult) => {
        this.eventService.setDiagramEvent(enhancedResult);
        const hasEHLD = enhancedResult.hasEHLD ? enhancedResult.hasEHLD : false;
        this.hasEHLD = hasEHLD;
        this.ehldService.setHasEHLD(hasEHLD);
        this.cdRef.detectChanges();
      })
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['diagramId'] && !changes['diagramId'].isFirstChange()) this.getEnhancedResult();
  }
}

