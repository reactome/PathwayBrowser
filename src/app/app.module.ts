import {LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule, DatePipe} from "@angular/common";
import {provideHttpClient, withInterceptorsFromDi} from "@angular/common/http";
import {DiagramComponent} from './diagram/diagram.component';
import {RouterOutlet} from "@angular/router";
import {AppRoutingModule} from "./app-routing.module";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule} from "@angular/material/button";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {CdkDrag, CdkDragHandle} from "@angular/cdk/drag-drop";
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
import {MaterialFileInputModule} from "ngx-custom-material-file-input";
import {CdkNestedTreeNode} from "@angular/cdk/tree";
import {DetailsComponent} from "./details/details.component";
import {DescriptionTabComponent} from "./details/tabs/description-tab/description-tab.component";
import {RefsTreeComponent} from "./details/common/refs-tree/refs-tree.component";
import {PublicationComponent} from "./details/common/publication/publication.component";
import {DescriptionOverviewComponent} from "./details/tabs/description-tab/description-overview/description-overview.component";
import {IncludeRefPipe} from "./pipes/include-ref.pipe";
import {AuthorshipDateFormatPipe} from "./pipes/authorship-date-format.pipe";
import {SortByDatePipe} from "./pipes/sort-by-date.pipe";
import {SafePipe} from "./pipes/safe.pipe";
import {SortByTextPipe} from "./pipes/sort-by-text.pipe";
import {InteractorsTableComponent} from "./details/common/interactors-table/interactors-table.component";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from "@angular/material/table";
import {ExtractCompartmentPipe} from "./pipes/extract-compartment.pipe";
import {AnalysisLegendComponent} from "./legend/analysis-legend/analysis-legend.component";
import {ExternalReferenceComponent} from "./details/common/external-reference/external-reference.component";
import {CrossReferencesComponent} from "./details/common/cross-references/cross-references.component";
import {ControllerTreeComponent} from "./details/common/controller-tree/controller-tree.component";
import {ObjectTreeComponent} from "./details/common/object-tree/object-tree.component";
import {MolecularProcessComponent} from "./details/common/molecular-process/molecular-process.component";
import {FormatClassNamePipe} from "./pipes/format-class-name.pipe";
import {CastPipe} from "./pipes/cast.pipe";
import {MatSlider, MatSliderThumb} from "@angular/material/slider";
import {CellMarkerComponent} from "./details/common/cell-marker/cell-marker.component";
import {OntologyTermComponent} from "./details/common/ontology-term/ontology-term.component";
import {ExpressionTabComponent} from "./details/tabs/expression-tab/expression-tab.component";
import {ReacfoamComponent} from "./reacfoam/reacfoam.component";
import {InfoTabComponent} from "./details/tabs/info-tab/info-tab.component";
import {ResultTabComponent} from "./details/tabs/result-tab/result-tab.component";
import {MoleculeTabComponent} from "./details/tabs/molecule-tab/molecule-tab.component";
import {StructureViewerComponent} from "./details/tabs/molecule-tab/structure-viewer/structure-viewer.component";
import {MoleculeDetailsComponent} from "./details/tabs/molecule-tab/molecule-details/molecule-details.component";
import {AnalysisFormComponent} from "./viewport/analysis-form/analysis-form.component";
import {CompareFormComponent} from "./viewport/compare-form/compare-form.component";
import {GsaFormModule} from "reactome-gsa-form"
import {environment} from "../environments/environment";
import {StoreModule} from "@ngrx/store";
import {routerReducer, StoreRouterConnectingModule} from "@ngrx/router-store";
import {EffectsModule} from "@ngrx/effects";
import {DownloadTabComponent} from "./details/tabs/download-tab/download-tab.component";
import {SearchComponent} from "./viewport/search/search.component";

@NgModule({
  declarations: [
    AppComponent,
    DiagramComponent,
    CustomInteractorDialogComponent,
    InteractorsComponent,
    ViewportComponent,
    SpeciesComponent,
    EventHierarchyComponent,
    EhldComponent,
    DetailsComponent,
    DescriptionTabComponent,
    InteractorsTableComponent,
    ControllerTreeComponent,
    MolecularProcessComponent,
    CellMarkerComponent,
    ExpressionTabComponent

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
    MatMenuModule,
    MaterialFileInputModule,
    CdkNestedTreeNode,
    AuthorshipDateFormatPipe,
    SortByDatePipe,
    IncludeRefPipe,
    SafePipe,
    SortByTextPipe,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef,
    AnalysisLegendComponent,
    ExtractCompartmentPipe,
    FormatClassNamePipe,
    CastPipe,
    MatSlider,
    MatSliderThumb,
    OntologyTermComponent,
    ReacfoamComponent,
    InfoTabComponent,
    ResultTabComponent,
    MoleculeTabComponent,
    StructureViewerComponent,
    ObjectTreeComponent,
    DescriptionOverviewComponent,
    RefsTreeComponent,
    PublicationComponent,
    ExternalReferenceComponent,
    CrossReferencesComponent,
    MoleculeDetailsComponent,
    DownloadTabComponent,
    AnalysisFormComponent,
    CompareFormComponent,
    StoreModule.forRoot({
      router: routerReducer
    }, {}),
    GsaFormModule.forRoot({
      server: environment.gsaServer as 'production' | 'dev',
    }),
    EffectsModule.forRoot([]),
    StoreRouterConnectingModule.forRoot(),
    SearchComponent,
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: LOCALE_ID,
      useFactory: () => navigator.language || 'en-US'
    },
    DatePipe
  ]
})
export class AppModule {
}
