import {LOCALE_ID, NgModule} from '@angular/core';
import {CommonModule, DatePipe} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";

// Material imports
import {MatButtonModule} from "@angular/material/button";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {CdkDrag, CdkDragHandle} from "@angular/cdk/drag-drop";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatDialogModule} from "@angular/material/dialog";
import {MatTabsModule} from "@angular/material/tabs";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatRadioModule} from "@angular/material/radio";
import {MatIconModule} from "@angular/material/icon";
import {MatListModule} from "@angular/material/list";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatGridListModule} from "@angular/material/grid-list";
import {MatCardModule} from "@angular/material/card";
import {MatRippleModule} from "@angular/material/core";
import {MatTreeModule} from "@angular/material/tree";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatMenuModule} from "@angular/material/menu";
import {MatSlider, MatSliderThumb} from "@angular/material/slider";
import {MatPaginator} from "@angular/material/paginator";
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
import {CdkNestedTreeNode} from "@angular/cdk/tree";

// Third party
import {AngularSplitModule} from "angular-split";
import {MaterialFileInputModule} from "ngx-custom-material-file-input";
import {NgxGoogleAnalyticsModule} from "@hakimio/ngx-google-analytics";

// Components
import {DiagramComponent} from './diagram/diagram.component';
import {CustomInteractorDialogComponent} from './interactors/custom-interactor-dialog/custom-interactor-dialog.component';
import {InteractorsComponent} from './interactors/interactors.component';
import {ViewportComponent} from './viewport/viewport.component';
import {SpeciesComponent} from './species/species.component';
import {EventHierarchyComponent} from './event-hierarchy/event-hierarchy.component';
import {EhldComponent} from './ehld/ehld.component';
import {DetailsComponent} from "./details/details.component";
import {DescriptionTabComponent} from "./details/tabs/description-tab/description-tab.component";
import {InteractorsTableComponent} from "./details/common/interactors-table/interactors-table.component";
import {ControllerTreeComponent} from "./details/common/controller-tree/controller-tree.component";
import {MolecularProcessComponent} from "./details/common/molecular-process/molecular-process.component";
import {CellMarkerComponent} from "./details/common/cell-marker/cell-marker.component";
import {ExpressionTabComponent} from "./details/tabs/expression-tab/expression-tab.component";
import {AnalysisLegendComponent} from "./legend/analysis-legend/analysis-legend.component";
import {OntologyTermComponent} from "./details/common/ontology-term/ontology-term.component";
import {ReacfoamComponent} from "./reacfoam/reacfoam.component";
import {InfoTabComponent} from "./details/tabs/info-tab/info-tab.component";
import {ResultTabComponent} from "./details/tabs/result-tab/result-tab.component";
import {MoleculeTabComponent} from "./details/tabs/molecule-tab/molecule-tab.component";
import {StructureViewerComponent} from "./details/tabs/molecule-tab/structure-viewer/structure-viewer.component";
import {ObjectTreeComponent} from "./details/common/object-tree/object-tree.component";
import {DescriptionOverviewComponent} from "./details/tabs/description-tab/description-overview/description-overview.component";
import {RefsTreeComponent} from "./details/common/refs-tree/refs-tree.component";
import {PublicationComponent} from "./details/common/publication/publication.component";
import {ExternalReferenceComponent} from "./details/common/external-reference/external-reference.component";
import {CrossReferencesComponent} from "./details/common/cross-references/cross-references.component";
import {DownloadTabComponent} from "./details/tabs/download-tab/download-tab.component";
import {AnalysisFormComponent} from "./viewport/analysis-form/analysis-form.component";
import {CompareFormComponent} from "./viewport/compare-form/compare-form.component";
import {SearchComponent} from "./viewport/search/search.component";
import {RheaComponent} from "./details/common/rhea/rhea.component";
import {IconComponent} from "./details/tabs/description-tab/icon/icon.component";

// Pipes
import {IncludeRefPipe} from "./pipes/include-ref.pipe";
import {AuthorshipDateFormatPipe} from "./pipes/authorship-date-format.pipe";
import {SortByDatePipe} from "./pipes/sort-by-date.pipe";
import {SafePipe} from "./pipes/safe.pipe";
import {SortByTextPipe} from "./pipes/sort-by-text.pipe";
import {ExtractCompartmentPipe} from "./pipes/extract-compartment.pipe";
import {FormatClassNamePipe} from "./pipes/format-class-name.pipe";
import {CastPipe} from "./pipes/cast.pipe";

// Directives
import {PassiveDirective} from "./utils/passive.directive";

// Routes
import {PATHWAY_BROWSER_ROUTES} from './pathway-browser.routes';

@NgModule({
  declarations: [
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
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    // Material
    MatButtonModule,
    MatSlideToggleModule,
    CdkDragHandle,
    CdkDrag,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
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
    MatRippleModule,
    MatTreeModule,
    MatTooltipModule,
    MatMenuModule,
    MaterialFileInputModule,
    CdkNestedTreeNode,
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
    MatSlider,
    MatSliderThumb,
    MatPaginator,
    NgxGoogleAnalyticsModule,
    // Standalone components
    AnalysisLegendComponent,
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
    DownloadTabComponent,
    AnalysisFormComponent,
    CompareFormComponent,
    SearchComponent,
    RheaComponent,
    PassiveDirective,
    IconComponent,
    // Pipes
    AuthorshipDateFormatPipe,
    SortByDatePipe,
    IncludeRefPipe,
    SafePipe,
    SortByTextPipe,
    ExtractCompartmentPipe,
    FormatClassNamePipe,
    CastPipe,
  ],
  exports: [
    ViewportComponent
  ],
  providers: [
    {
      provide: LOCALE_ID,
      useFactory: () => typeof navigator !== 'undefined' ? navigator.language || 'en-US' : 'en-US'
    },
    DatePipe
  ]
})
export class PathwayBrowserModule {
}
