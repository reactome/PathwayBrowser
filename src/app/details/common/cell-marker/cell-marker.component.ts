import {Component, computed, effect, input} from '@angular/core';
import {
  EntityWithAccessionedSequence
} from "../../../model/graph/physical-entity/entity-with-accessioned-sequence.model";
import {DataKeys, SchemaClasses} from "../../../constants/constants";
import {MarkerReference} from "../../../model/graph/control-reference/marker-reference.model";

@Component({
  selector: 'cr-cell-marker',
  templateUrl: './cell-marker.component.html',
  styleUrl: './cell-marker.component.scss',
  standalone: false,
})
export class CellMarkerComponent {
  readonly markers = input.required<EntityWithAccessionedSequence[]>();
  readonly markerRefs = input.required<MarkerReference[]>();

   constructor() {
     effect(() => {
       console.log('marker ',this.markers())
       console.log('margerRefs',this.markerRefs())
       console.log('Refs',this.refs())
     });
   }


  refs = computed(() => {
    const map = new Map<number, MarkerReference>();
    for (const ref of this.markerRefs()) {
      const dbId = ref.marker?.dbId;
      if (dbId != null) {
        map.set(dbId, ref);
      }
    }
    return map;
  });

  protected readonly SchemaClasses = SchemaClasses;
  protected readonly DataKeys = DataKeys;

}
