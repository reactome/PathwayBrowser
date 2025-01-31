import {
  AfterViewInit,
  ChangeDetectorRef,
  Component, computed,
  effect,
  model,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';
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
import {DiagramStateService} from "../services/diagram-state.service";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {GeneralService} from "../services/general.service";
import {rxResource} from "@angular/core/rxjs-interop";
import {Event} from "../model/event.model";

@Component({
  selector: 'cr-viewport',
  templateUrl: './viewport.component.html',
  styleUrls: ['./viewport.component.scss'],
  standalone: false
})
@UntilDestroy()
export class ViewportComponent implements AfterViewInit, OnChanges {


  readonly pathwayId = model.required<string>();

  currentPathway = rxResource<Event, { id: string }>({
    request: () => ({id: this.pathwayId()}),
    loader: (params) => this.eventService.fetchEnhancedEventData(params.request.id)
  })

  hasEHLD = computed(() => {
    const hasEHLD = this.currentPathway.value()?.hasEHLD;
    return hasEHLD === undefined ? true : hasEHLD;
  })
  title = computed(() => this.currentPathway.value()?.displayName)


  @ViewChild('diagram') diagram: DiagramComponent | undefined;
  @ViewChild('interactors') interactors!: InteractorsComponent;
  @ViewChild('darkToggle') darkToggle: MatSlideToggle | undefined;

  // hasEHLD?: boolean;
  currentInteractorResource: ResourceAndType | undefined = {name: null, type: null};

  currentSpecies: Species | undefined = undefined;

  visibility = {
    species: false,
    interactor: false
  }


  sun = 'M8 12C8 10.8887 8.389 9.94434 9.167 9.167C9.94433 8.389 10.8887 8 12 8C13.1113 8 14.0557 8.389 14.833 9.167C15.611 9.94433 16 10.8887 16 12C16 13.1113 15.611 14.0557 14.833 14.833C14.0557 15.611 13.1113 16 12 16C10.8887 16 9.94434 15.611 9.167 14.833C8.389 14.0557 8 13.1113 8 12ZM11.25 3.75C11.25 3.542 11.323 3.365 11.469 3.219C11.615 3.073 11.792 3 12 3C12.208 3 12.385 3.073 12.531 3.219C12.677 3.365 12.75 3.542 12.75 3.75L12.75 5.75C12.75 5.958 12.677 6.135 12.531 6.281C12.385 6.427 12.208 6.5 12 6.5C11.792 6.5 11.615 6.427 11.469 6.281C11.323 6.135 11.25 5.958 11.25 5.75L11.25 3.75ZM11.25 18.25C11.25 18.042 11.323 17.865 11.469 17.719C11.615 17.573 11.792 17.5 12 17.5C12.208 17.5 12.385 17.573 12.531 17.719C12.677 17.865 12.75 18.042 12.75 18.25L12.75 20.25C12.75 20.458 12.677 20.635 12.531 20.781C12.385 20.927 12.208 21 12 21C11.792 21 11.615 20.927 11.469 20.781C11.323 20.635 11.25 20.458 11.25 20.25L11.25 18.25ZM17.5 12C17.5 11.792 17.573 11.615 17.719 11.469C17.865 11.323 18.042 11.25 18.25 11.25L20.25 11.25C20.458 11.25 20.635 11.323 20.781 11.469C20.927 11.615 21 11.792 21 12C21 12.208 20.927 12.385 20.781 12.531C20.635 12.677 20.458 12.75 20.25 12.75L18.25 12.75C18.042 12.75 17.865 12.677 17.719 12.531C17.573 12.385 17.5 12.208 17.5 12ZM3 12C3 11.792 3.073 11.615 3.219 11.469C3.365 11.323 3.542 11.25 3.75 11.25L5.75 11.25C5.958 11.25 6.135 11.323 6.281 11.469C6.427 11.615 6.5 11.792 6.5 12C6.5 12.208 6.427 12.385 6.281 12.531C6.135 12.677 5.958 12.75 5.75 12.75L3.75 12.75C3.542 12.75 3.365 12.677 3.219 12.531C3.073 12.385 3 12.208 3 12ZM15.896 7.042L16.958 6C17.0973 5.84733 17.2677 5.771 17.469 5.771C17.6703 5.771 17.8473 5.84733 18 6C18.1527 6.13867 18.229 6.31233 18.229 6.521C18.229 6.729 18.1527 6.90267 18 7.042L16.958 8.104C16.8053 8.25667 16.6283 8.333 16.427 8.333C16.2257 8.333 16.0487 8.25667 15.896 8.104C15.7433 7.96533 15.667 7.79167 15.667 7.583C15.667 7.375 15.7433 7.19467 15.896 7.042ZM6 16.958L7.042 15.896C7.19467 15.7433 7.37167 15.667 7.573 15.667C7.77434 15.667 7.95134 15.7433 8.104 15.896C8.25667 16.0347 8.333 16.2083 8.333 16.417C8.333 16.625 8.25667 16.8053 8.104 16.958L7.042 18C6.90267 18.1527 6.73234 18.229 6.531 18.229C6.32967 18.229 6.15267 18.1527 6 18C5.84734 17.8473 5.771 17.6737 5.771 17.479C5.771 17.285 5.84734 17.1113 6 16.958ZM15.896 15.896C16.0347 15.7433 16.2083 15.667 16.417 15.667C16.625 15.667 16.8053 15.7433 16.958 15.896L18 16.958C18.1527 17.1113 18.2257 17.285 18.219 17.479C18.2117 17.6737 18.1387 17.8473 18 18C17.8473 18.1527 17.6737 18.229 17.479 18.229C17.285 18.229 17.1113 18.1527 16.958 18L15.896 16.958C15.7433 16.8053 15.667 16.6283 15.667 16.427C15.667 16.2257 15.7433 16.0487 15.896 15.896ZM6 6C6.13867 5.84734 6.31233 5.771 6.521 5.771C6.729 5.771 6.90267 5.84734 7.042 6L8.104 7.042C8.24267 7.19467 8.312 7.37167 8.312 7.573C8.312 7.77434 8.24267 7.95134 8.104 8.104C7.95133 8.25667 7.77433 8.32967 7.573 8.323C7.37167 8.31567 7.19467 8.24267 7.042 8.104L6 7.042C5.84733 6.90267 5.771 6.73234 5.771 6.531C5.771 6.32967 5.84733 6.15267 6 6Z'
  moon = 'M12.5 19.5001C10.4167 19.5001 8.646 18.7708 7.188 17.3121C5.72933 15.8541 5 14.0834 5 12.0001C5 10.1254 5.57633 8.51775 6.729 7.17708C7.88167 5.83708 9.361 5.00042 11.167 4.66708C11.6943 4.56975 12.0797 4.66342 12.323 4.94808C12.5663 5.23275 12.549 5.63908 12.271 6.16708C12.1043 6.48642 11.9757 6.81975 11.885 7.16708C11.795 7.51442 11.75 7.87542 11.75 8.25008C11.75 9.50008 12.1873 10.5627 13.062 11.4381C13.9373 12.3127 15 12.7501 16.25 12.7501C16.6247 12.7501 16.9857 12.7051 17.333 12.6151C17.6803 12.5244 18.0137 12.3958 18.333 12.2291C18.875 11.9511 19.2883 11.9234 19.573 12.1461C19.8577 12.3681 19.9513 12.7431 19.854 13.2711C19.5487 15.0491 18.7327 16.5318 17.406 17.7191C16.08 18.9064 14.4447 19.5001 12.5 19.5001Z'

  constructor(private speciesService: SpeciesService,
              private interactorService: InteractorService,
              private cdRef: ChangeDetectorRef,
              public analysis: AnalysisService,
              public dark: DarkService,
              private ehldService: EhldService,
              public eventService: EventService,
              public state: DiagramStateService,
              public general: GeneralService,) {
    // effect(() => this.getEnhancedResult());
    // effect(() => this.ehldService.setHasEHLD(this.hasEHLD()));
    effect(() => console.log('hasEHLD', this.hasEHLD()));
    effect(() => this.currentPathway.value() && this.eventService.setDiagramEvent(this.currentPathway.value()!));
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

    // this.ehldService.hasEHLD$.pipe(untilDestroyed(this),).subscribe((hasEHLD) => {
    //   this.hasEHLD = hasEHLD;
    // });


    this.darkToggle?._switchElement.nativeElement?.querySelector('.mdc-switch__icon--on')?.querySelector('path')?.setAttribute('d', this.moon);
    this.darkToggle?._switchElement.nativeElement?.querySelector('.mdc-switch__icon--off')?.querySelector('path')?.setAttribute('d', this.sun);
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
    this.eventService.fetchEnhancedEventData(this.pathwayId())
      .subscribe((enhancedResult) => {
        this.eventService.setDiagramEvent(enhancedResult);
        // const hasEHLD = enhancedResult.hasEHLD ? enhancedResult.hasEHLD : false;
        // this.hasEHLD = hasEHLD;
        // this.ehldService.setHasEHLD(hasEHLD);
        // this.cdRef.detectChanges();
      })
  }


  ngOnChanges(changes: SimpleChanges): void {
    // if (changes['diagramId'] && !changes['diagramId'].isFirstChange()) this.getEnhancedResult();
  }
}

