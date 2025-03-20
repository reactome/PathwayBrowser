import {Component, computed, input} from '@angular/core';
import {CatalystActivity} from "../../../model/graph/catalyst-activity.model";
import {CatalystActivityReference} from "../../../model/graph/control-reference/catalyst-activity-reference.model";

@Component({
  selector: 'cr-catalyst-activity',
  standalone:false,
  templateUrl: './catalyst-activity.component.html',
  styleUrl: './catalyst-activity.component.scss'
})
export class CatalystActivityComponent {

  readonly catalystActivity = input.required<CatalystActivity[]>({ alias: "catalystActivity" });
  readonly catalystActivityReference = input.required<CatalystActivityReference>({ alias: "catalystActivityReference" });

}
