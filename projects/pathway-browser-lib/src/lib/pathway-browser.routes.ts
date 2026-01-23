import {Routes} from "@angular/router";
import {ViewportComponent} from "./viewport/viewport.component";

export const PATHWAY_BROWSER_ROUTES: Routes = [
  {
    path: '',
    component: ViewportComponent,
    pathMatch: 'full'
  },
  {
    path: ':pathwayId',
    component: ViewportComponent
  }
];
