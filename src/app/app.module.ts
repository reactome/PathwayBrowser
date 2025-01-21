import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {provideHttpClient, withInterceptorsFromDi} from "@angular/common/http";
import {DiagramComponent} from './diagram/diagram.component';
import {RouterOutlet} from "@angular/router";
import {AppRoutingModule} from "./app-routing.module";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule} from "@angular/material/button";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {CdkDrag, CdkDragHandle} from "@angular/cdk/drag-drop";
import {DiagramIteratorComponent} from './diagram-iterator/diagram-iterator.component';
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {
  CustomInteractorDialogComponent
} from './interactors/custom-interactor-dialog/custom-interactor-dialog.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatTabsModule} from "@angular/material/tabs";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatRadioModule} from "@angular/material/radio";
import {MatIconModule} from "@angular/material/icon";
import {MatListModule} from "@angular/material/list";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatGridListModule} from "@angular/material/grid-list";
import {InteractorsComponent} from './interactors/interactors.component';
import {ViewportComponent} from './viewport/viewport.component';
import {AngularSplitModule} from "angular-split";
import {MatCardModule} from "@angular/material/card";
import {SpeciesComponent} from './species/species.component';
import {MatRippleModule} from "@angular/material/core";
import {EventHierarchyComponent} from './event-hierarchy/event-hierarchy.component';
import {MatTreeModule} from "@angular/material/tree";
import {MatTooltipModule} from "@angular/material/tooltip";
import {EhldComponent} from './ehld/ehld.component';
import {MatMenuModule} from "@angular/material/menu";
import {DiagramHomeComponent} from './diagram-home/diagram-home.component';
import {MaterialFileInputModule} from "ngx-custom-material-file-input";
import {CdkNestedTreeNode} from "@angular/cdk/tree";
import {DetailsComponent} from "./details/details.component";
import {DetailsTabOverviewComponent} from "./details/common/details-tab-overview/details-tab-overview.component";
import {DetailsTabComponent} from "./details/tabs/details-tab/details-tab.component";
import {SummationRefsTreeComponent} from "./details/common/summation-refs-tree/summation-refs-tree.component";
import {PublicationComponent} from "./details/common/publication/publication.component";

@NgModule({
  declarations: [
    AppComponent,
    DiagramComponent,
    DiagramIteratorComponent,
    CustomInteractorDialogComponent,
    InteractorsComponent,
    ViewportComponent,
    SpeciesComponent,
    EventHierarchyComponent,
    EhldComponent,
    DiagramHomeComponent,
    DetailsComponent,
    DetailsTabComponent,
    DetailsTabOverviewComponent,
    SummationRefsTreeComponent,
    PublicationComponent,

  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    RouterOutlet,
    AppRoutingModule,
    // NoopAnimationsModule,
    MatButtonModule,
    MatSlideToggleModule,
    CdkDragHandle,
    CdkDrag,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatTabsModule,
    MatCheckboxModule,
    MatRadioModule,
    MatIconModule,
    MatListModule,
    MatExpansionModule,
    MatGridListModule,
    AngularSplitModule,
    MatCardModule,
    MatIconModule,
    MatRippleModule,
    MatTreeModule,
    MatTooltipModule,
    MatMenuModule, MaterialFileInputModule, CdkNestedTreeNode], providers: [provideHttpClient(withInterceptorsFromDi())]
})
export class AppModule {
}
