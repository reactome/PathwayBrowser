import {Component, computed, effect, ElementRef, Signal, viewChild} from '@angular/core';
import {FoamTree, InitialOptions} from "@carrotsearch/foamtree";


@Component({
  selector: 'cr-reacfoam',
  imports: [],
  templateUrl: './reacfoam.component.html',
  styleUrl: './reacfoam.component.scss'
})
export class ReacfoamComponent {

  container = viewChild.required<ElementRef<HTMLDivElement>>('container');

  options: Signal<InitialOptions> = computed(() => ({
    element: this.container().nativeElement,
    layout: "relaxed",
    stacking: "flattened",

    onModelChanging(data) {
      console.log(data)
    },
  }))

  foamTree = computed(() => new FoamTree(this.options()));

  constructor() {
    effect(() => {
      this.foamTree().redraw(true, {all: true})
      this.foamTree().expose({all: true, exposed: true})
      this.foamTree().get('imageData', {format: 'image/png'})
      this.foamTree().get('geometry', "1", true)
      this.foamTree().on('click', value => console.log(value))
      this.foamTree().on('onRedraw', incremental => console.log(incremental))
      this.foamTree().set({
        selection: ['1'],
        relaxationVisible: true,
        relaxationMaxDuration: Number.MAX_VALUE,
        onModelChanging(data) {
          console.log(data)
        },
        onGroupOpenOrCloseChanged: [
          ({groups, indirect}) => console.log(1, groups, indirect),
          ({groups, indirect}) => console.log(2, groups, indirect),
        ],
        groupLabelLayoutDecorator: (options1, properties, variables) => {
          variables.fontFamily = "sans-serif";
          properties.parent
        }
      })

    });

  }



}
