import {Component, computed, effect, ElementRef, OnDestroy, Signal, viewChild} from '@angular/core';
import {FoamTree, InitialOptions} from "@carrotsearch/foamtree";
import {PathwayGroup, ReacfoamService} from "./reacfoam.service";
import {Router} from "@angular/router";


@Component({
  selector: 'cr-reacfoam',
  imports: [],
  templateUrl: './reacfoam.component.html',
  styleUrl: './reacfoam.component.scss'
})
export class ReacfoamComponent implements OnDestroy {

  container = viewChild.required<ElementRef<HTMLDivElement>>('container');

  options: Signal<InitialOptions<PathwayGroup>> = computed(() => ({
    element: this.container().nativeElement,
    layout: "relaxed",
    stacking: "flattened",
    relaxationInitializer: "fisheye", // Impactful on the sub-groups of TLPs
    relaxationVisible: true, // TODO evaluate if we wanna keep this
    pixelRatio: window.devicePixelRatio || 1,
    wireframePixelRatio: window.devicePixelRatio || 1,
    exposeDuration: 500,
    // Lower groupMinDiameter to fit as many groups as possible
    groupMinDiameter: 0,
    // Set a simple fading animation. Animated rollouts are very expensive for large hierarchies
    rolloutDuration: 0,
    pullbackDuration: 0,
    // Lower the border radius a bit to fit more groups
    groupBorderWidth: 0,
    groupInsetWidth: 10,
    groupBorderRadius: 0.4,
    groupBorderWidthScaling: 0.5,
    groupStrokeWidth: 1.5,
    groupBorderRadiusCorrection: 0.5,
    groupStrokePlainLightnessShift: -50,
    parentFillOpacity: 1,
    parentStrokeOpacity: 1,
    parentLabelOpacity: 1,
    // Don't use gradients and rounded corners for faster rendering
    groupFillType: "plain",
    // Lower the minimum label font size a bit to show more labels
    groupLabelMinFontSize: 3,
    // Attach and draw a maximum of 8 levels of groups
    maxGroupLevelsAttached: 12,
    maxGroupLevelsDrawn: 12,
    maxGroupLabelLevelsDrawn: 12,
    // Width of the selection outline to draw around selected groups
    groupSelectionOutlineWidth: 3,
    // Show labels during relaxation
    wireframeLabelDrawing: "always",
    // Make the description group (in flattened view) smaller to make more space for child groups
    descriptionGroupMaxHeight: 0.25,
    // Maximum duration of a complete high-quality redraw of the visualization
    finalCompleteDrawMaxDuration: 40000,
    finalIncrementalDrawMaxDuration: 40000,
    wireframeDrawMaxDuration: 4000,

    finalToWireframeFadeDuration: 0,
    fadeDuration: 0,
    wireframeToFinalFadeDuration: 0,

    onGroupHold: (event) => {
      event.preventDefault();
      this.router.navigate([event.group.stId], {queryParamsHandling: 'preserve', preserveFragment: true})
    },

    groupColorDecorator: (options, props, values) => {
      values.groupColor = props.group.color;
      values.labelColor = 'auto';
    }
  } as InitialOptions<PathwayGroup>));

  foamTree = computed(() => new FoamTree<PathwayGroup>(this.options()));

  sizeObserver = new ResizeObserver(() => {
    console.log('resize')
    setTimeout(() => {
      this.foamTree().resize()
    })
  });

  constructor(
    private reacfoam: ReacfoamService,
    private router: Router) {
    effect(() => this.container()?.nativeElement && this.sizeObserver.observe(this.container().nativeElement));
    effect(() => {
      this.reacfoam.data() && this.foamTree().set('dataObject', {groups: this.reacfoam.data()!})
    });

  }

  ngOnDestroy(): void {
    this.sizeObserver.disconnect();
  }

}
