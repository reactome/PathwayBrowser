import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {legacyGuard} from "./guard/legacy.guard";
import {ViewportComponent} from "./viewport/viewport.component";

export const routes: Routes = [
  {path: ':pathwayId', component: ViewportComponent},
  {path: '', component: ViewportComponent},
  {path: '**', component: ViewportComponent, canActivate: [legacyGuard], runGuardsAndResolvers: 'always'}
]


@NgModule({
  imports: [RouterModule.forRoot(routes, {bindToComponentInputs: false})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
