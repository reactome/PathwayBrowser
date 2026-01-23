import {Component, input, ViewEncapsulation} from '@angular/core';
import {SafePipe} from "../../../../pipes/safe.pipe";
import {PathwayBrowserConfigService} from "../../../../services/pathway-browser-config.service";
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
  constructor(public config: PathwayBrowserConfigService) {}

  readonly iconSVG = input.required<string>();
  readonly icon = input.required<Search.Icon.Entry>();
}
