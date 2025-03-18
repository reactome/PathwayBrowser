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


  // catalystRef= computed(() => {
  //   const ref = this.catalystActivityReference();
  //   if(!ref) return null;
  //
  //   if(ref.catalystActivity.dbId ===)
  //
  // })


  catalystActivityDetails = computed(() => {
    const catalystActivity = this.catalystActivity();
    if (!catalystActivity) return [];

    const properties = [
      { key: 'displayName', label: 'Activity' },
      { key: 'geneName', label: 'EC number' },
      { key: 'chain', label: 'References' },
      { key: 'referenceGene', label: 'Active Unit' },
      { key: 'referenceTranscript', label: 'Catalyst' }
    ];

    return catalystActivity.map((item) => {
      const ca = { ...item };

      const results = [];
      for (const property of properties) {
        let value = ca[property.key];
        if (!value) continue;
        results.push({
          label: property.label || property.key,
          value: value
        });
      }

      return results;
    });
  });




}
