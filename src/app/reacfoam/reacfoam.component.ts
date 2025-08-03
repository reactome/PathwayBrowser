import {Component, computed, effect, ElementRef, OnDestroy, signal, Signal, untracked, viewChild} from '@angular/core';
import {FoamTree} from "@carrotsearch/foamtree";
import {PathwayGroup, ReacfoamService} from "./reacfoam.service";
import {Router} from "@angular/router";
import {DarkService} from "../services/dark.service";
import {UrlStateService} from "../services/url-state.service";
import {AnalysisService} from "../services/analysis.service";
import {AnalysisLegendComponent} from "../legend/analysis-legend/analysis-legend.component";


@Component({
  selector: 'cr-reacfoam',
  imports: [
    AnalysisLegendComponent
  ],
  templateUrl: './reacfoam.component.html',
  styleUrl: './reacfoam.component.scss'
})
export class ReacfoamComponent implements OnDestroy {

  container = viewChild.required<ElementRef<HTMLDivElement>>('container');

  options: Signal<FoamTree.InitialOptions<PathwayGroup>> = computed(() => ({
    element: this.container().nativeElement,
    layout: "relaxed",
    stacking: "flattened",
    relaxationInitializer: "ordered", // Impactful on the sub-groups of TLPs
    layoutByWeightOrder: false,
    relaxationVisible: true, // TODO evaluate if we wanna keep this
    pixelRatio: window.devicePixelRatio || 1,
    wireframePixelRatio: window.devicePixelRatio || 1,
    exposeDuration: 500,
    // Lower groupMinDiameter to fit as many groups as possible
    groupMinDiameter: 1,
    // Set a simple fading animation. Animated rollouts are very expensive for large hierarchies
    rolloutDuration: 0,
    pullbackDuration: 0,
    // Lower the border radius a bit to fit more groups
    groupBorderWidth: 2,
    groupInsetWidth: 8,
    groupBorderRadius: 0.4,
    groupBorderWidthScaling: 0.5,
    groupStrokeWidth: 1.5,
    groupBorderRadiusCorrection: 0.5,
    groupStrokePlainLightnessShift: -50,
    // Parents
    parentFillOpacity: 1,
    parentLabelOpacity: 1,
    parentStrokeOpacity: 1,
    // Don't use gradients and rounded corners for faster rendering
    groupFillType: "plain",
    // Attach and draw a maximum of 8 levels of groups
    maxGroupLevelsAttached: 12,
    maxGroupLevelsDrawn: 12,
    maxGroupLabelLevelsDrawn: 12,

    // Width of the selection outline to draw around selected groups
    groupSelectionOutlineWidth: 5,

    // Show labels during relaxation
    wireframeLabelDrawing: "always",
    // Make the description group (in flattened view) smaller to make more space for child groups
    descriptionGroupMaxHeight: 0.25,
    // Maximum duration of a complete high-quality redraw of the visualization
    finalCompleteDrawMaxDuration: 4_000,
    finalIncrementalDrawMaxDuration: 4_000,
    wireframeDrawMaxDuration: 4_000, // Controls whether edges are rendered during wireframe

    resizeTransform: 'initialize',

    finalToWireframeFadeDuration: 0,
    fadeDuration: 0,
    wireframeToFinalFadeDuration: 0,
    groupLabelColorThreshold: 1 - 0.179,
    relaxationMaxDuration: 4000,
    relaxationQualityThreshold: 0.5,

    // Labels
    groupLabelFontFamily: 'Roboto',
    groupLabelHorizontalPadding: 0.8,
    groupLabelVerticalPadding: 0.8,
    groupLabelMaxFontSize: 20,
    // Lower the minimum label font size a bit to show more labels
    groupLabelMinFontSize: 3,

    // Roll out in groups
    rolloutMethod: "groups",

    onGroupDoubleClick: (event) => {
      event.preventDefault();
      this.router.navigate([event.group.stId], {queryParamsHandling: 'preserve', preserveFragment: true})
    },

    onGroupClick: (event) => {
      event.preventDefault();
      if (!event.secondary) {
        this.state.select.set(event.group.stId)
        this.state.path.set(event.group.path)
      } else {
        const exposed = this.foamTree().get('exposure').groups.at(0);
        const parent = this.foamTree().get('hierarchy', exposed)?.parent;
        this.state.select.set(parent?.stId || null)
        this.state.path.set(parent?.path || [])
      }
    },

    // For now, add exposure at end of relaxation, useful upon resizing reset. to be removed when alternative solution found for stable layout
    onRelaxationStep: (relaxationProgress, relaxationComplete, relaxationTimeout) => {
      this.relaxing.set(true)
      if ((relaxationTimeout || relaxationComplete)) {
        this.relaxing.set(false)
        if (this.correctedSelectedId()) {
          setTimeout(() => {
            this.foamTree().expose({groups: this.correctedSelectedId(), keepPrevious: false})
          })
        }
      }
    },

    onViewReset: () => { // Reset selection on esc pressed
      this.state.select.set(null)
      this.state.path.set([])
    }
  } as FoamTree.InitialOptions<PathwayGroup>));

  foamTree = computed(() => new FoamTree<PathwayGroup>(this.options()));
  selectedId = computed(() => this.reacfoam.buildId(this.state.select(), this.state.path()));
  correctedSelectedId = computed(() => this.state.select() ?
    (
      this.foamTree().get('hierarchy', this.selectedId()) ?
        this.selectedId() :
        this.reacfoam.idToStId()?.get(this.state.select()!)
    ) :
    null
  );

  relaxing = signal(false)

  sizeObserver = new ResizeObserver(() => {
    setTimeout(() => { // Avoid white flickering
      this.foamTree().set('exposeDuration', 0) // Make removal of exposure instant
      this.foamTree().expose({
        groups: undefined,
        keepPrevious: false
      }).then(() => {
        this.foamTree().set('exposeDuration', this.options().exposeDuration!) // Put back initial exposure time
        this.foamTree().resize()
      })
    })
  });

  constructor(
    private reacfoam: ReacfoamService,
    private state: UrlStateService,
    public analysis: AnalysisService,
    private dark: DarkService,
    private router: Router) {
    effect(() => { // Initialise
      this.reacfoam.data(); // Set data whenever it is updated
      // if (!untracked(this.relaxing)) // Avoid errors happening when setting data while relaxing
      this.foamTree().set('dataObject', {groups: this.reacfoam.data()!})

      if (untracked(this.correctedSelectedId)) { // Initial select
        this.foamTree().select({groups: untracked(this.correctedSelectedId), keepPrevious: false}) // Preselect the group before relaxation happens to have the selection indicator during relaxation
      }
    });
    effect(() => this.container()?.nativeElement && this.sizeObserver.observe(this.container().nativeElement));
    effect(() => { // Update colors upon analysis column switching
      this.analysis.sampleIndex(); // Update colors on expression column shifting
      this.analysis.palette(); // Update colors on palette shifting
      this.foamTree().redraw();
    });
    effect(() => { // Upon selection (UI or URL), expos & select group
      this.foamTree().select({groups: this.correctedSelectedId(), keepPrevious: false})
      this.foamTree().expose({groups: this.correctedSelectedId(), keepPrevious: false}) // Trigger on select update
    });

    effect(() => {
      this.foamTree().set({
        groupStrokePlainLightnessShift: this.dark.isDark() ? 70 : -70,
        groupStrokePlainSaturationShift: 0,
        groupColorDecorator: (options, props, values) => {
          const depth = props.group.depth;
          // If child groups of some group doesn't have enough space to
          // render, draw the parent group in red.
          // if (props.hasChildren && props.browseable !== true) {
          //   values.groupColor = "#E86365";
          //   values.labelColor = "#000";
          //   return
          // }

          if (this.analysis.result()) { // Analysis
            values.labelColor = 'auto'
            const fdr = props.group.fdr;

            const notFoundColor = this.reacfoam.surfaceColor().hex();

            if (!fdr || fdr > this.state.significance()) values.groupColor = notFoundColor;
            else {
              if (this.analysis.type() === 'OVERREPRESENTATION' || this.analysis.type() === 'SPECIES_COMPARISON') { // FDR ~ color
                values.groupColor = this.analysis.palette().scale(props.group.fdr).hex()
              } else { // expression ~ color
                if (props.group.expressions) {
                  values.groupColor = this.analysis.palette().scale(props.group.expressions[this.analysis.sampleIndex()]).hex()
                } else {
                  values.groupColor = notFoundColor;
                }
              }
            }

          } else { // No analysis
            if (this.dark.isDark()) {
              values.groupColor = props.group.familyColor.brighten(depth * 0.2).saturate(depth * 0.2).hex();
              values.labelColor = props.group.familyColor.brighten(3.5).saturate(3).hex();
            } else {
              values.groupColor = props.group.familyColor.darken(depth * 0.15).saturate(depth * 0.3).hex();
              values.labelColor = props.group.familyColor.darken(4).saturate(5).hex();
            }

            // values.groupColor =  props.group.depthColor.hex();
            // values.labelColor = 'auto'
          }


        }
      })
      this.foamTree().redraw()
    });

  }

  ngOnDestroy(): void {
    this.sizeObserver.disconnect();
  }

  export(params : FoamTree.ImageFormat) {
    const a = document.createElement('a');
    a.href = this.foamTree().get('imageData', params)
    a.download = `reacfoam.${params.format.split('/')[1]}`;
    a.click();
    a.remove();
  }

}

function throttle<Args extends any[]>(func: (...args: Args) => void, delay: number): (...args: Args) => void {
  let lastCall = 0;
  return (...args: Args) => {
    const now = new Date().getTime();
    if (now - lastCall >= delay) {
      func(...args);
      lastCall = now;
    }
  };
}
