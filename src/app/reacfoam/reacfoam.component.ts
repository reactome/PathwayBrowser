import {
  Component,
  computed,
  effect,
  ElementRef,
  linkedSignal,
  OnDestroy, output,
  signal,
  Signal,
  untracked,
  viewChild
} from '@angular/core';
import {FoamTree} from "@carrotsearch/foamtree";
import {PathwayGroup, ReacfoamService} from "./reacfoam.service";
import {Router} from "@angular/router";
import {DarkService} from "../services/dark.service";
import {UrlStateService} from "../services/url-state.service";
import {AnalysisService} from "../services/analysis.service";
import {AnalysisLegendComponent} from "../legend/analysis-legend/analysis-legend.component";
import {defaultDownloadOptions, DownloadFormat, DownloadService} from "../services/download.service";
import {DataStateService} from "../services/data-state.service";
import {isRLE} from "../services/utils";
import {SpeciesService} from "../services/species.service";
import {firstValueFrom} from "rxjs";
import {Context} from "svgcanvas";
import chroma from "chroma-js";
import {width} from "reactome-table";
import {MatDialog} from "@angular/material/dialog";
import {BlockingLoaderComponent} from "./blocking-loader/blocking-loader.component";


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
    groupMinDiameter: 0.5,
    // Set a simple fading animation. Animated rollouts are very expensive for large hierarchies
    rolloutDuration: 0,
    pullbackDuration: 0,
    // Lower the border radius a bit to fit more groups
    groupBorderWidth: 2,
    groupInsetWidth: 4,
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
    groupLabelColorThreshold: 0.8,
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
      this.foamTree().set("groupLabelMinFontSize", 20);
      if ((relaxationTimeout || relaxationComplete)) {
        this.relaxing.set(false)
        this.foamTree().set("groupLabelMinFontSize", 3);
        this.foamTree().redraw()
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
  select = linkedSignal(() => this.state.select());
  selectedId = computed(() => this.reacfoam.buildId(this.select(), this.state.path()));
  correctedSelectedId = computed(() => this.state.select() ?
    (
      this.foamTree().get('hierarchy', this.selectedId()) ?
        this.selectedId() :
        this.reacfoam.idToStId()?.get(this.select()!)
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

  cleanFlagIdentifiers = computed(() => new Set(this.data.flagIdentifiers().filter(id => id.startsWith('R-'))))
  flagging = computed(() => this.cleanFlagIdentifiers().size !== 0)

  setFlag(groups: PathwayGroup[]) {
    groups?.forEach((group: PathwayGroup) => {
      group.flag = this.flagging() ? this.cleanFlagIdentifiers().has(group.stId) : false
      group.groups && this.setFlag(group.groups)
    })
  }

  constructor(
    private reacfoam: ReacfoamService,
    private state: UrlStateService,
    private data: DataStateService,
    public analysis: AnalysisService,
    private species: SpeciesService,
    private dark: DarkService,
    private router: Router,
    private download: DownloadService,
    private dialog: MatDialog,) {
    effect(() => { // Initialise
      this.reacfoam.data(); // Set data whenever it is updated
      // if (!untracked(this.relaxing)) // Avoid errors happening when setting data while relaxing
      this.foamTree().set('dataObject', {groups: this.reacfoam.data()!})

      if (untracked(this.correctedSelectedId)) { // Initial select
        this.foamTree().select({groups: untracked(this.correctedSelectedId), keepPrevious: false}) // Preselect the group before relaxation happens to have the selection indicator during relaxation
      }
    });
    effect(() => {
      this.cleanFlagIdentifiers();
      if (this.reacfoam.data()) {
        this.setFlag(this.reacfoam.data()!)
        this.foamTree().redraw()
      }
    });
    // Select parent pathway of reaction if a reaction is selected
    effect(async () => {
      const selectedElement = this.data.selectedElement();
      if (selectedElement && isRLE(selectedElement)) {
        const flaggingResult = await firstValueFrom(this.data.getReacfoamFlagging(selectedElement.stId, this.species.currentSpecies().displayName));
        if (flaggingResult.matches && flaggingResult.matches.length === 1) {
          console.log('Selecting in reacfoam the parent pathway of a reaction as it is only contained in one pathway')
          this.select.set(flaggingResult.matches[0]);
        }
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
            const fdr = props.group.fdr;

            const notFoundColor = this.reacfoam.surfaceColor().hex();

            if (this.flagging() && props.group.flag) {
              values.groupColor = this.reacfoam.flagColor().hex()
              values.labelColor = this.reacfoam.surfaceColor().hex()
            } else if (
              !fdr || fdr > this.state.significance()
              // && this.analysis.type() !== 'GSA_REGULATION' // Skip FDR filtering for GSA as we want to display the non-significant up/down regulation too
            ) {
              values.groupColor = notFoundColor;
            } else {
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

            values.labelColor = chroma(values.groupColor).get('oklch.l') > 0.70 ? 'black' : 'white';

          } else { // No analysis
            if (this.dark.isDark()) {
              values.groupColor = props.group.familyColor().brighten(depth * 0.15).saturate(depth * 0.15).hex();
              values.labelColor = props.group.familyColor().brighten(3).saturate(2).hex();
            } else {
              values.groupColor = props.group.familyColor().darken(depth * 0.1).saturate(depth * 0.3).hex();
              values.labelColor = props.group.familyColor().darken(4).saturate(5).hex();
            }
            // values.groupColor =  props.group.depthColor.hex();
            // values.labelColor = 'auto'

            if (this.flagging()) {
              values.groupColor = props.group.flag ? this.reacfoam.flagColor().hex() : this.reacfoam.surfaceColor().hex();
              values.labelColor = props.group.flag ? this.reacfoam.surfaceColor().hex() : this.reacfoam.onSurfaceColor().hex();
            }
          }


        }
      })
      this.foamTree().redraw();
      this.currentSample = this.state.sample() || undefined;
    });

    effect(async () => {
      const request = this.download.downloadRequest();
      let options = request?.options || defaultDownloadOptions;
      options = {...defaultDownloadOptions, ...options};
      if (!request) return;
      const loader = this.dialog.open(BlockingLoaderComponent, {disableClose: true, width: '150px', height: '150px'});
      if (request && this.download.isFoamtreeFormat(request.format)) {
        const params: FoamTree.ImageFormat = {
          format: this.download.toFoamtreeType(request.format),
          ...(request.format === DownloadFormat.JPEG ? {quality: 0.9} : {})
        }
        this.exportRaster(request.format, params);
        this.download.resetDownload();
      } else if (request?.format === DownloadFormat.SVG) {
        // Get the bounding box of the top-level group. This will be the size of the exported SVG.
        const foamtree = this.foamTree()
        // @ts-ignore
        const geometry = foamtree.get("geometry", foamtree.get('dataObject'));

        let width = geometry.boxWidth;
        let height = geometry.boxHeight;

        const ctx = new Context(width, height);

        // Optional: for the duration of the export, set the groupMinDiameter and
        // groupLabelMinFontSize options to 0 to ensure that all labels and groups are visible.
        const groupLabelMinFontSize = foamtree.get("groupLabelMinFontSize");
        const groupMinDiameter = foamtree.get("groupMinDiameter");
        foamtree.set("groupLabelMinFontSize", 0);
        foamtree.set("groupMinDiameter", 0);

        let svg: SVGSVGElement | undefined;
        let css = ''
        const decorationSize = 25
        const style = {
          surface: this.reacfoam.surfaceColor().hex(),
          onSurface: this.reacfoam.onSurfaceColor().hex(),
          primary: this.reacfoam.primaryColor().hex(),
          onPrimary: this.reacfoam.onPrimaryColor().hex(),
          sw: decorationSize / 18,
          decorationSize
        };
        let [paddingLeft, paddingRight, paddingTop, paddingBottom] = [0, 0, 0, 0];

        const samples = untracked(this.analysis.samples);
        if (samples.length === 0 || !options.animate) {
          await this.waitForNotRelaxing(50);
          foamtree.drawTo(ctx);
          svg = ctx.getSvg();
        } else {

          const initSample = untracked(this.state.sample);
          const idToSampleStyle = new Map<string, { fill?: string, stroke?: string }[]>();

          for (const sample of samples) {
            this.state.sample.set(sample)
            await this.waitForSample(sample, 50);
            await this.waitForNotRelaxing(50);

            foamtree.drawTo(ctx);
            svg = ctx.getSvg();
            generateIdsAndApply(svg, '', (element, id) => {
              if (element.nodeName === 'path' || element.nodeName === 'text') {
                const samples = idToSampleStyle.get(id) || [];
                samples.push({
                  fill: element.getAttribute("fill") || undefined,
                  stroke: element.getAttribute("stroke") || undefined,
                })
                idToSampleStyle.set(id, samples);
              }
            })
          }

          // Restore the original options.
          this.state.sample.set(initSample);
          const compressedStyle = compressFrameStyles(idToSampleStyle);

          const frameDuration = 2;
          const transitionTime = 0.2;

          compressedStyle.forEach((diffs, id) => {
            css += generateSteppedKeyframes(id, diffs, samples.length, frameDuration, transitionTime);
          });

          const titleHeight = decorationSize * 3 / 2;
          const title = generateTitledKeyframes(
            samples, frameDuration, transitionTime,
            {x: 0, y: height, height: titleHeight, width: width},
            style
          );
          css += title.css;
          const titleGroup = addElementToSVG('title-group', title.elements, svg!);

          paddingBottom = titleHeight;
          // Add space for labels
          const bbox = measureGroup(titleGroup, width, height, css);
          console.log(bbox)
          paddingLeft = Math.max(-bbox.x + style.sw, 0);
          paddingRight = bbox.width - paddingLeft - width + style.sw;
        }


        foamtree.set("groupLabelMinFontSize", groupLabelMinFontSize);
        foamtree.set("groupMinDiameter", groupMinDiameter);

        if (this.analysis.result() && options.includeLegend) {
          const legend = generateAnalysisLegend(this.analysis, {
            x: width,
            y: 0,
            width: decorationSize,
            height: height
          }, style)
          css += legend.css;
          const legendElement = addElementToSVG('legend-group', legend.elements, svg!);
          paddingRight = Math.max(paddingRight, measureGroup(legendElement, width, height, css).width + 2 * style.sw);
        }


        const animStyle = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        animStyle.setAttribute('data-generated', 'true');
        animStyle.textContent = css; // your generated CSS
        svg!.prepend(animStyle);

        svg!.setAttribute('viewBox', `${-paddingLeft} ${-paddingTop} ${width + paddingLeft + paddingRight} ${height + paddingTop + paddingBottom}`);
        svg!.removeAttribute('width')
        svg!.removeAttribute('height')
        svg!.style.background = this.reacfoam.surfaceColor().hex();

        // // Get the serialized SVG representation of the visualization.
        await embedFontInSvg(svg!, 'https://fonts.gstatic.com/s/roboto/v49/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3yUBHMdazQ.woff2');
        const blob = new Blob([new XMLSerializer().serializeToString(svg!)], {type: "image/svg+xml;charset=utf-8"});
        const url = URL.createObjectURL(blob);
        this.export(url, DownloadFormat.SVG);
        this.download.resetDownload();
      }
      loader.close();
    });
  }

  currentSample?: string;

  ngOnDestroy(): void {
    this.sizeObserver.disconnect();
  }

  exportRaster(format: DownloadFormat, params: FoamTree.ImageFormat) {
    return this.export(this.foamTree().get('imageData', params), format, 'reacfoam');
  }

  export(data: string, format: DownloadFormat, name = 'reacfoam') {
    const a = document.createElement('a');
    a.href = data
    a.download = `${name}.${format}`;
    a.click();
    a.remove();
  }

  waitForSample(sample: string, interval = 10): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        if (this.currentSample === sample) {
          resolve();
        } else {
          setTimeout(check, interval); // check again in X ms
        }
      };
      check();
    });
  }

  waitForNotRelaxing(interval = 10): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        if (!this.relaxing()) {
          resolve();
        } else {
          setTimeout(check, interval); // check again in X ms
        }
      };
      check();
    });
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

async function embedFontInSvg(svgElement: SVGSVGElement, fontUrl: string) {
  const res = await fetch(fontUrl);
  const buffer = await res.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

  const style = `
    @font-face {
      font-family: 'Roboto';
      src: url(data:font/ttf;base64,${base64}) format('truetype');
    }
  `;

  const styleEl = document.createElementNS("http://www.w3.org/2000/svg", "style");
  styleEl.textContent = style;
  svgElement.insertBefore(styleEl, svgElement.firstChild);
  return svgElement;
}

function generateIdsAndApply(element: SVGElement, id: string, apply: (element: SVGElement, id: string) => void) {
  element.setAttribute('id', id);
  apply(element, id);
  const children = element.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i] as SVGElement;
    const path = id.length > 0 ? `${id}-` : '';
    const childId = `${child.nodeName.toLowerCase()}${i}`;
    generateIdsAndApply(child, path + childId, apply);
  }
}


type FrameDiff = {
  frame: number; // the frame at which the property changes
  style: Partial<Record<string, string>>;
}

function compressFrameStyles(idToSampleStyle: Map<string, Partial<Record<string, string>>[]>): Map<string, FrameDiff[]> {
  const compressed = new Map<string, FrameDiff[]>()
  idToSampleStyle.forEach((frameStyles, id) => {
    let currentStyle = frameStyles[0];
    const diffs = [{frame: 0, style: frameStyles[0]}] as FrameDiff[];

    for (let i = 1; i < frameStyles.length; i++) {
      const frameStyle = frameStyles[i];
      const diff = getStyleDiff(currentStyle, frameStyle);
      if (Object.keys(diff).length > 0) {
        diffs.push({frame: i, style: diff});

        currentStyle = frameStyle;
      }
    }
    // Don't animate never-changing properties
    if (diffs.length > 1) compressed.set(id, diffs);
  })
  return compressed;
}

function getStyleDiff(prev: Partial<Record<string, string>>, curr: Partial<Record<string, string>>) {
  const diff: Partial<Record<string, string>> = {};
  Object.keys(curr).forEach(key => {
    if (prev[key] !== curr[key]) diff[key] = curr[key];
  });
  return diff;
}

function sanitizeId(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]/g, '_'); // valid CSS name
}

function generateSteppedKeyframes(
  id: string,
  diffs: FrameDiff[],
  totalFrames: number,
  frameDuration = 2,
  transitionTime = 0.1     // seconds
): string {
  const keyframeName = `kf_${sanitizeId(id)}`;
  const totalDuration = totalFrames * frameDuration;
  let keyframes = `@keyframes ${keyframeName} {\n`;

  let lastValues: Partial<Record<string, string>> = {...diffs[diffs.length - 1].style}; // start with the last value as it loops
  const halfTrans = transitionTime / 2;

  diffs.forEach((diff, i) => {
    const {start, stop} = calcTransitionTime(diff.frame, frameDuration, halfTrans, totalDuration)
    // start of transition: previous value
    keyframes += `  ${start}% {\n`;
    Object.entries(diff.style).forEach(([prop, value]) => {
      if ((lastValues[prop] ?? value) === undefined) return;
      keyframes += `${prop}: ${lastValues[prop] ?? value};\n`;
    });
    keyframes += `}\n`;

    keyframes += `  ${stop}% {`;
    Object.entries(diff.style).forEach(([prop, value]) => {
      if (value === undefined) return;
      keyframes += `${prop}: ${value};\n`;
      lastValues[prop] = value;
    });
    keyframes += `}\n`;
  });

  keyframes += `}\n\n`;
  keyframes += `#${id} { animation: ${keyframeName} ${totalDuration}s linear infinite; }\n\n`;

  return keyframes;
}

function generateAnalysisLegend(analysis: AnalysisService, {x, y, width, height}: {
                                  x: number,
                                  y: number,
                                  width: number,
                                  height: number
                                },
                                {surface, onSurface, primary, onPrimary, sw, decorationSize}: {
                                  surface: string,
                                  onSurface: string,
                                  primary: string,
                                  onPrimary: string,
                                  sw: number,
                                  decorationSize: number
                                }) {
  const gWidth = decorationSize;
  const fontSize = 12;
  const output = {
    //language=css
    css: `.legend-label {
      font-size: ${fontSize}px;
      font-family: Roboto, sans-serif;
      fill: ${onSurface};
      dominant-baseline: middle;
      text-anchor: start;
    }
    `,
    elements: ''
  };


  output.elements += analysis.palette().getSvgGradient('analysis-grad', 'top')
  output.elements += `<rect x="${x + sw / 2}" y="${y + sw / 2}" width="${gWidth - sw}" height="${height - sw}" rx="${gWidth / 2}" fill="url(#analysis-grad)"/>`
  const labelX = x + gWidth + sw
  const labels = analysis.isGSARegulation() ? [`<tspan dy="${fontSize}" x="${labelX}">Sig. Up</tspan><tspan dy="${fontSize}" x="${labelX}">Regulated</tspan>`, `<tspan dy="${fontSize}" x="${labelX}">Up</tspan><tspan dy="${fontSize}" x="${labelX}">Regulated</tspan>`, `<tspan dy="${fontSize}" x="${labelX}">Not</tspan><tspan dy="${fontSize}" x="${labelX}">Regulated</tspan>`, `<tspan dy="${fontSize}" x="${labelX}">Down</tspan><tspan dy="${fontSize}" x="${labelX}">Regulated</tspan>`, `<tspan dy="${fontSize}" x="${labelX}">Sig. Down</tspan><tspan dy="${fontSize}" x="${labelX}">Regulated</tspan>`]
    : [analysis.palette().domainRange[1].toFixed(2), analysis.palette().domainRange[0].toFixed(2)]

  const labelSpace = height * (4 / 5) / (labels.length - 1);
  labels.forEach((label, i) => {
    const labelId = `label-${i}`;
    let pos: number;
    if (labels.length === 2) {
      pos = i === 0 ? gWidth / 2 : height - gWidth / 2
    } else {
      pos = y + labelSpace * (i + 0.5) - fontSize;
    }

    output.elements += `<text id="${labelId}" x="${x + gWidth + sw}" y="${pos}" class="legend-label">${label}</text>\n`;
  })

  return output;
}

function generateTitledKeyframes(
  titles: string[],
  frameDuration = 2,
  transitionTime = 0.1,
  {x, y, width, height}: { x: number, y: number, width: number, height: number },
  {surface, onSurface, primary, onPrimary, sw, decorationSize}: {
    surface: string,
    onSurface: string,
    primary: string,
    onPrimary: string,
    sw: number,
    decorationSize: number
  },
): { css: string, elements: string } {
  const tlHeight = decorationSize;

  const fontSize = 12;
  const output = {
    //language=css
    css: `.title {
      font-size: ${fontSize}px;
      font-family: Roboto, sans-serif;
      fill: ${onSurface};
      dominant-baseline: middle;
      opacity: 0;
      text-anchor: middle;
    }

    .ignore-event {
      pointer-events: none;
    }  `,
    elements: ''
  };


  const totalFrames = titles.length;
  const totalDuration = totalFrames * frameDuration;
  const halfTrans = transitionTime / 2;

  const dotSize = height / 6 + sw / 2;
  const tlStart = x + tlHeight;
  const tlWidth = width - tlStart - 0.5 * tlHeight;
  const dotSpace = tlWidth / titles.length;

  output.elements += `<rect x="${x + sw / 2}" y="${y + sw / 2}" width="${width - sw}" height="${tlHeight - sw}" fill="${primary}" fill-opacity="0.5" rx="${tlHeight / 2}"/>`
  output.elements += `<line id="timeline-bg" x1="${tlStart}" y1="${y + tlHeight / 2}" x2="${width - tlHeight / 2}" y2="${y + tlHeight / 2}" stroke="${onPrimary}" stroke-width="${3 * sw}" stroke-linecap="round"/>`

  titles.forEach((title, i) => {
    const appear = calcTransitionTime(i, frameDuration, halfTrans, totalDuration)
    const disappear = calcTransitionTime(i + 1, frameDuration, halfTrans, totalDuration)

    const titleId = `title-${i}`;
    output.elements += `<text id="${titleId}" x="${tlStart + dotSpace * (i + 0.5) - dotSize / 2}" y="${y + tlHeight + sw + fontSize / 2}" class="title center">${title}</text>\n`;

    const titleKFName = `kf_title_${i}`;
    let keyframes = `@keyframes ${titleKFName} {\n`;
    keyframes += `  ${appear.mid}% {opacity:0;}\n`;
    keyframes += `  ${appear.stop}% {opacity:1;}\n`;
    keyframes += `  ${disappear.start}% {opacity:1;}\n`;
    keyframes += `  ${disappear.mid}% {opacity:0;}\n`;
    keyframes += `}\n`;
    keyframes += `#${titleId} { animation: ${titleKFName} ${totalDuration}s linear infinite; }\n\n`;

    const dotId = `dot-${i}`;
    output.elements += `<rect id="${dotId}" x="${tlStart + dotSpace * (i + 1) - dotSize * 3 / 4}" y="${(y + tlHeight / 2 - dotSize / 2).toFixed(3)}" width="${dotSize.toFixed(3)}" height="${dotSize.toFixed(3)}" rx="${dotSize.toFixed(3)}" fill="${primary}" stroke="${onPrimary}" stroke-width="${sw}"/>`;

    const dotFKName = `kf_dot_${i}`;
    keyframes += `@keyframes ${dotFKName} {\n`;
    keyframes += `  0% {fill:${onPrimary};}\n`;
    keyframes += `  ${disappear.start}% {fill:${onPrimary};}\n`;
    keyframes += `  ${disappear.mid}% {fill:${primary};}\n`;
    keyframes += `  100% {fill:${primary};}\n`;
    keyframes += `}\n`;
    keyframes += `#${dotId} { animation: ${dotFKName} ${totalDuration}s linear infinite; }\n\n`;

    output.css += keyframes;
  });

  output.elements += `<rect id="pause-button" x="${x + sw / 2}" y="${y + sw / 2}" width="${tlHeight - sw}" height="${tlHeight - sw}" fill="${primary}" stroke="${onPrimary}" stroke-width="${sw}" rx="${tlHeight / 2}"/>`
  output.elements += `<line x1="${x + tlHeight / 2 - 1 / 10 * tlHeight}" x2="${x + tlHeight / 2 - 1 / 10 * tlHeight}" y1="${y + 1 / 3 * tlHeight}" y2="${y + 2 / 3 * tlHeight}" stroke="${onPrimary}" stroke-width="${sw}" class="ignore-event"/>`
  output.elements += `<line x1="${x + tlHeight / 2 + 1 / 10 * tlHeight}" x2="${x + tlHeight / 2 + 1 / 10 * tlHeight}" y1="${y + 1 / 3 * tlHeight}" y2="${y + 2 / 3 * tlHeight}" stroke="${onPrimary}" stroke-width="${sw}" class="ignore-event"/>`

  output.elements += `<line id="timeline" x1="${tlStart}" y1="${y + tlHeight / 2}" x2="${width - tlHeight / 2}" y2="${y + tlHeight / 2}" stroke="${primary}" stroke-width="${sw}" stroke-linecap="round"/>`
  output.css += `@keyframes drawLine { to { stroke-dashoffset: 0; } }\n`;
  output.css += `#timeline { animation: drawLine ${totalDuration}s linear infinite; stroke-dasharray: ${tlWidth}; stroke-dashoffset: ${tlWidth};}\n`;

  //language=css
  output.css += `svg:has(#pause-button:hover) * {
    animation-play-state: paused !important;
  }    `
  return output;
}

function calcTransitionTime(frame: number, frameDuration: number, halfTransition: number, totalDuration: number) {
  const frameTime = frame * frameDuration;
  const changePercent = (frameTime / totalDuration) * 100;
  const start = (changePercent - (halfTransition / totalDuration) * 100 + 100) % 100;
  const stop = (changePercent + (halfTransition / totalDuration) * 100) % 100;
  return {start: start.toFixed(2), stop: stop.toFixed(2), mid: changePercent.toFixed(2)};
}

function addElementToSVG(id: string, elements: string, svg: SVGSVGElement) {
  const titleG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  titleG.setAttribute('data-generated', 'true');
  titleG.setAttribute('id', id);
  titleG.innerHTML = elements
  svg!.append(titleG)
  return titleG;
}

function measureGroup(g: SVGGElement, svgWidth: number, svgHeight: number, css: string) {
  g = g.cloneNode(true) as SVGGElement
  // create a hidden svg container
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
  svg.setAttribute("width", svgWidth + 'px');
  svg.setAttribute("height", svgHeight + 'px');
  svg.style.position = "absolute";
  svg.style.left = "-9999px"; // offscreen
  svg.style.top = "-9999px";

  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.setAttribute('data-generated', 'true');
  style.textContent = css; // your generated CSS
  svg!.prepend(style);

  document.body.appendChild(svg);
  svg.appendChild(g);

  const bbox = g.getBBox({stroke: true, clipped: false, fill: true, markers: true});

  // cleanup
  svg.remove();

  return bbox;
}
