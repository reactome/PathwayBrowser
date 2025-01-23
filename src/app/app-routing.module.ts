import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {DiagramComponent} from "./diagram/diagram.component";
import {DiagramIteratorComponent} from "./diagram-iterator/diagram-iterator.component";
import {legacyGuard} from "./guard/legacy.guard";
import {ViewportComponent} from "./viewport/viewport.component";
import {DiagramHomeComponent} from "./diagram-home/diagram-home.component";

export const routes: Routes = [
  {path: 'iterate', component: DiagramIteratorComponent},
  {path: 'iterate/:stId', component: DiagramIteratorComponent},
  {path: 'diagram/:stId', component: DiagramHomeComponent},
  {path: 'PathwayBrowser/:stId', component: ViewportComponent},
  {path: ':stId', component: ViewportComponent},
  {path: '**', component: ViewportComponent, canActivate: [legacyGuard], runGuardsAndResolvers: 'always'}
]


@NgModule({
  imports: [RouterModule.forRoot(routes, {bindToComponentInputs: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
