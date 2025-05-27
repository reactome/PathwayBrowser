import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {DiagramIteratorComponent} from "./diagram-iterator/diagram-iterator.component";
import {legacyGuard} from "./guard/legacy.guard";
import {ViewportComponent} from "./viewport/viewport.component";
import {DiagramHomeComponent} from "./diagram-home/diagram-home.component";

export const routes: Routes = [
  {path: 'iterate', component: DiagramIteratorComponent},
  {path: 'iterate/:pathwayId', component: DiagramIteratorComponent},
  {path: 'diagram/:pathwayId', component: DiagramHomeComponent},
  {path: ':pathwayId', component: ViewportComponent},
  {path: '', component: ViewportComponent},
  {path: '**', component: ViewportComponent, canActivate: [legacyGuard], runGuardsAndResolvers: 'always'}
]


@NgModule({
  imports: [RouterModule.forRoot(routes, {bindToComponentInputs: false})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
