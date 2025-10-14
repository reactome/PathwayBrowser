import {Component, input, ViewEncapsulation} from '@angular/core';
import {SafePipe} from "../../../../pipes/safe.pipe";
import {CONTENT_DETAIL} from "../../../../../environments/environment";
import {MatTooltip} from "@angular/material/tooltip";
import {Search} from "../../../../viewport/search/search.component";


@Component({
  selector: 'cr-icon',
  imports: [
    SafePipe,
    MatTooltip
  ],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
  encapsulation: ViewEncapsulation.ShadowDom // <- isolates styles for not effecting EHLD
})
export class IconComponent {
  readonly iconSVG = input.required<string>();
  readonly icon = input.required<Search.Icon.Entry>();
  protected readonly CONTENT_DETAIL = CONTENT_DETAIL;
}
