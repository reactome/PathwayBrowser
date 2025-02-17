import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, input, OnDestroy, Output} from '@angular/core';
import {InteractorToken, PsicquicResource, ResourceAndType, ResourceType} from "./model/interactor.model";
import cytoscape from "cytoscape";
import {DiagramService} from "../services/diagram.service";
import {DarkService} from "../services/dark.service";
import {InteractorService} from "./services/interactor.service";
import {UrlStateService} from "../services/url-state.service";
import {MatDialog} from "@angular/material/dialog";
import {CustomInteractorDialogComponent} from "./custom-interactor-dialog/custom-interactor-dialog.component";
import {Subscription} from "rxjs";


@Component({
    selector: 'cr-interactors',
    templateUrl: './interactors.component.html',
    styleUrls: ['./interactors.component.scss'],
    standalone: false
})
export class InteractorsComponent implements AfterViewInit, OnDestroy {

  isDataFromPsicquicLoading: boolean = false;
  resourceTokens: InteractorToken[] = [];
  clear = false;
  psicquicResources: PsicquicResource[] = [];
  currentResource: ResourceAndType | undefined = {name: null, type: null};
  currentResourceSubscription!: Subscription;

  DISEASE_RESOURCE = 'DisGeNet';
  INTACT_RESOURCE = 'IntAct';
  protected readonly ResourceType = ResourceType;

  readonly hasEHLD = input<boolean>();
  readonly cy = input<cytoscape.Core>();
  readonly cys = input<cytoscape.Core[] | undefined>([]);
  @Output('initialiseReplaceElements') initialiseReplaceElements: EventEmitter<any> = new EventEmitter();

  constructor(private diagram: DiagramService, public dark: DarkService, private interactorsService: InteractorService, private state: UrlStateService, public dialog: MatDialog, private cdr: ChangeDetectorRef) {

  }

  ngAfterViewInit(): void {
    this.getPsicquicResources();
    this.currentResourceSubscription = this.interactorsService.currentInteractorResource$.subscribe(resource => {
      this.currentResource = resource;
    });
  }

  ngOnDestroy(): void {
    this.currentResourceSubscription.unsubscribe()
  }

  getInteractors(resource: string | null | InteractorToken) {
    if (!resource) return;

    this.interactorsService.getResourceType(resource as string).subscribe({
      next: (resourceType) => {
        switch (resourceType) {
          case ResourceType.STATIC:
          case ResourceType.DISGENET:
            this.getStaticInteractors(resource as string);
            break;
          case ResourceType.PSICQUIC:
            this.getPsicquicResourceInteractors(resource as string);
            break;
          case ResourceType.CUSTOM:
            this.getCustomResourceInteractors(resource as InteractorToken);
            break;
          default:
            throw new Error("Unknown resource type encountered: " + resourceType);
        }
      },

      error: (error) => {
        console.error("Error determining resource type:", error);
        throw new Error("Error determining resource type: " + error);
      },
    })
  }

  getStaticInteractors(resource: string | null) {
    if (resource) {
      this.clear = false
      let type = resource === ResourceType.STATIC ? ResourceType.STATIC : ResourceType.DISGENET;
      this.updateCurrentResource(resource, type);
    } else {
      return;
    }
    this.cys()?.forEach(cy => {
      this.interactorsService.fetchInteractorData(cy, resource).subscribe(interactors => {
        this.interactorsService.addInteractorOccurrenceNode(interactors, cy, resource);
        this.initialiseReplaceElements.emit();
      });
        this.state.overlay.set(resource);
    })
  }

  getPsicquicResourceInteractors(selectedResource: string) {
    this.isDataFromPsicquicLoading = true;
    this.clear = false;
    this.updateCurrentResource(selectedResource, ResourceType.PSICQUIC);
    this.cys()?.forEach(cy => {
      this.interactorsService.fetchInteractorData(cy, selectedResource).subscribe(interactors => {
        this.interactorsService.addInteractorOccurrenceNode(interactors, cy, selectedResource);
        this.isDataFromPsicquicLoading = false;
          this.state.overlay.set(selectedResource);
      });
    });
  }

  openCustomInteractorDialog() {
    this.cys()?.forEach(cy => {
      // Avoid multiple opening dialogs
      if (this.dialog.openDialogs.length === 1) {
        return
      }
      const dialogRef = this.dialog.open(CustomInteractorDialogComponent, {
        data: {cy: cy},
        restoreFocus: false // Deselect button when closing
      });

      dialogRef.afterClosed().subscribe(result => {
        const resource = dialogRef.componentInstance.token;
        if (resource) {
          this.resourceTokens!.push(resource);
          this.clear = false;
          this.updateCurrentResource(resource.summary.name, ResourceType.CUSTOM);
            this.state.overlay.set(resource.summary.token);
        }
        this.cdr.detectChanges();
      })
    })
  }

  isSelected(resource: InteractorToken): boolean {
    return this.resourceTokens!.includes(resource);
  }

  getCustomResourceInteractors(resource: InteractorToken) {

    if (!resource.summary) return

    this.cys()?.forEach(cy => {
      this.interactorsService.fetchCustomInteractors(resource, cy).subscribe((result) => {
        this.interactorsService.addInteractorOccurrenceNode(result.interactors, cy, result.interactors.resource);
        this.clear = false;
        this.updateCurrentResource(resource!.summary.name, ResourceType.CUSTOM);
          this.state.overlay.set(resource.summary.token);
      })
    })
  }

  deleteCustomResource(resource: InteractorToken) {
    const index = this.resourceTokens!.indexOf(resource);
    if (index !== -1) {
      this.resourceTokens!.splice(index, 1);
      this.cys()?.forEach(cy => {
        cy.elements(`[resource = '${resource}']`).remove();
          this.state.overlay.set(null);
      })
    }
  }

  clearInteractors() {
    this.cys()?.forEach(cy => {
      this.interactorsService.clearAllInteractorNodes(cy);
      this.clear = true;
      this.updateCurrentResource(null, null);
        this.state.overlay.set(null);
    })
  }

  updateCurrentResource(name: string | null, type: ResourceType | null) {
    if (name && type) {
      const resource: ResourceAndType = {name, type};
      this.interactorsService.setCurrentResource(resource);
    } else {
      this.interactorsService.setCurrentResource({name: null, type: null});
    }
  }

  getPsicquicResources() {
    this.interactorsService.getPsicquicResources().subscribe(resources => {
      this.psicquicResources = resources;
    })
  }
}
