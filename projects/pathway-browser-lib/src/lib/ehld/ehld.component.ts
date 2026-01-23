import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  linkedSignal,
  model,
  OnDestroy,
  signal,
  viewChild
} from '@angular/core';
import {EhldService, LegendGroup} from "../services/ehld.service";
import {UntilDestroy} from "@ngneat/until-destroy";
import {UrlStateService} from "../services/url-state.service";
import SvgPanZoom from 'svg-pan-zoom';
import {AnalysisService} from "../services/analysis.service";
import {isDefined} from "../services/utils";
import {Style} from "reactome-cytoscape-style";
import {rxResource} from "@angular/core/rxjs-interop";
import {DataStateService} from "../services/data-state.service";
import {Point} from "@angular/cdk/drag-drop";
import {defaultDownloadOptions, DownloadFormat, DownloadService} from "../services/download.service";
import {SvgExporterService} from "../reacfoam/svg-exporter.service";
import {map} from "rxjs";


@Component({
  selector: 'cr-ehld',
  templateUrl: './ehld.component.html',
  styleUrls: ['./ehld.component.scss'],
  standalone: false
})

@UntilDestroy()
export class EhldComponent implements AfterViewInit, OnDestroy {

  ehldContainer = viewChild.required<ElementRef<HTMLDivElement>>('ehld');
  readonly pathwayId = model.required<string>();
  hovering = signal(false)

  readonly svgData = rxResource({
    request: () => ({id: this.pathwayId()}),
    loader: params => this.ehldService.getSVGData(params.request.id).pipe(
      map(data => data
        .replaceAll('opacity="0.01"', 'opacity="0"')
        .replaceAll('opacity: 0.01', 'opacity: 0')
      )
    )
  })

  style!: Style;
  ratio = 0.384;

  stIdToSVGGElement = signal(new Map<string, SVGGElement>());
  subpathwayStIds = computed(() => [...this.stIdToSVGGElement().keys()])
  selectedElement = linkedSignal(() => this.state.select() ? this.stIdToSVGGElement().get(this.state.select()!) : undefined);
  flaggedElements = computed(() => this.data.flagIdentifiers().map(stId => this.stIdToSVGGElement().get(stId)).filter(isDefined));
  panZoomInstance?: SvgPanZoom.Instance;
  legendItems: LegendGroup[] = [...this.ehldService.legendItems];
  resizeObserver!: ResizeObserver;
  readonly controlZoom = signal<number>(0);
  readonly controlMinZoom = signal<number>(1);
  readonly controlMaxZoom = signal<number>(15);

  private initialZoom = 1;
  private initialPan = {x: 0, y: 0};
  currentSample?: string;

  constructor(private ehldService: EhldService,
              public analysis: AnalysisService,
              public state: UrlStateService,
              private data: DataStateService,
              private download: DownloadService,
              private svgExporter: SvgExporterService) {
    effect(() => this.selectedElement() && this.ehldService.applyOutline(this.selectedElement()!, this.flaggedElements()));
    effect(() => this.flaggedElements().forEach(g => this.ehldService.applyFlagOutline(g)));
    effect(() => {
      if (this.svgData.value() && this.ehldContainer()) {
        this.ehldContainer().nativeElement.innerHTML = this.svgData.value()!
        this.stIdToSVGGElement.set(this.ehldService.setStIdToSVGGElementMap(this.ehldContainer()));
        this.addEventListenerToSvg();
        this.initializePanAndZoom();
      }
    });
    effect(() => {
      this.loadAnalysis();
      this.currentSample = this.state.sample() || undefined;
    });

    effect(async () => {
      const request = this.download.downloadRequest();
      let options = request?.options || defaultDownloadOptions;
      if (request && this.download.isRasterFormat(request.format)) {
        this.ehldService.downloadImage(request.format);
        this.download.resetDownload();
      } else if (request?.format === DownloadFormat.SVG) {
        this.download.export(await this.svgExporter.exportEHLD(this, options), request.format, this.pathwayId());
        this.download.resetDownload();
      }
    })
  }

  ngAfterViewInit(): void {
    this.style = new Style(this.ehldContainer().nativeElement);

    this.resizeObserver = new ResizeObserver(() => {
      if (!this.panZoomInstance) return;
      this.handleResize();
    })

    this.resizeObserver.observe(this.ehldContainer().nativeElement)
  }

  legendPosition = signal<Point>({x: 0, y: 0});
  animateLegend = signal(false);

  toggleLegend(legendWidth: number) {
    this.animateLegend.set(true);
    this.legendPosition().x <= -legendWidth + 5 ? this.legendPosition.set({
      x: 0,
      y: 0
    }) : this.legendPosition.set({x: -legendWidth, y: 0})
    setTimeout(() => this.animateLegend.set(false), 500)
  }

  // Example of zooming: https://stackblitz.com/edit/svg-pan-zoom?file=src%2Fapp%2Fapp.component.html,src%2Fapp%2Fapp.component.ts,src%2Fapp%2Fapp.module.ts
  // SVG pan zoom documentation: https://github.com/bumbu/svg-pan-zoom?tab=readme-ov-file
  initializePanAndZoom() {
    const svgElement = this.ehldContainer().nativeElement.querySelector('svg');
    if (svgElement) {
      // Disable default tooltips to be shown when hovering on svg element
      svgElement.querySelectorAll('title').forEach(item => {
        item.innerHTML = '';
      });
      svgElement.setAttribute('width', '100%');
      svgElement.setAttribute('height', '100%');
      this.panZoomInstance = SvgPanZoom(svgElement, {
        zoomEnabled: true,
        controlIconsEnabled: false,
        dblClickZoomEnabled: false,
        panEnabled: true,
        fit: true,
        center: true,
        minZoom: this.controlMinZoom(),
        maxZoom: this.controlMaxZoom(),
        onZoom: newScale => {
          this.controlZoom.set(newScale)
        },
      });
      // initial default state
      this.initialZoom = this.panZoomInstance.getZoom();
      this.initialPan = this.panZoomInstance.getPan();
    }
  }

  private addEventListenerToSvg(): void {
    const svgElement = this.ehldContainer().nativeElement.querySelectorAll('g[id^="REGION"]') as NodeListOf<SVGGElement>;

    svgElement.forEach((element: SVGGElement) => {
      element.addEventListener('mouseover', () => {
        if (element !== this.selectedElement()) {
          this.ehldService.applyShadow(element, this.flaggedElements());
          this.hovering.set(true);
        }
      })

      element.addEventListener('mouseout', () => {
        if (element !== this.selectedElement()) {
          this.ehldService.removeShadow(element, this.flaggedElements());
          this.hovering.set(false);
        }
      })

      element.addEventListener('click', () => {
        if (this.selectedElement()) {
          this.ehldService.removeOutline(this.selectedElement()!, this.flaggedElements());
        }
        this.selectedElement.set(element);

        const idAttr = this.selectedElement()?.getAttribute('id');
        if (idAttr) {
          const stId = this.ehldService.getStableId(idAttr);
          if (stId) this.state.select.set(stId);
        }

        this.ehldService.applyOutline(element, this.flaggedElements());
      });

      element.addEventListener('dblclick', () => {
        const idAttr = this.selectedElement()?.getAttribute('id');
        if (idAttr) {
          const stId = this.ehldService.getStableId(idAttr);
          if (stId) {
            // this.speciesService.setIgnore(false);
            this.pathwayId.set(stId);
          }
        }
      })
    })
  }


  private loadAnalysis() {
    const elementsMap = this.stIdToSVGGElement();
    const svg = this.ehldContainer().nativeElement.querySelector('svg')!;
    if (!svg) return;
    this.ehldService.clearExistingPatterns(svg)
    this.ehldService.clearAllOverlay(elementsMap);
    this.ehldService.clearAnalysisInfo(elementsMap);

    const bg = svg.querySelector('#BG') as SVGGElement;
    const fg = svg.querySelector('#FG') as SVGGElement;

    const allPathwayStIds = this.subpathwayStIds();
    if (!this.analysis.result()) {
      bg?.removeAttribute('style');
      fg?.removeAttribute('style');
    } else {
      if (bg) bg.style.filter = 'saturate(0)';
      if (fg) fg.style.filter = 'saturate(0)';

      allPathwayStIds.forEach((stId) => {
        const regionElement = elementsMap.get(stId);
        const pathwayData = this.analysis.pathwayStIdToData().get(stId);

        if (!regionElement) return;

        this.ehldService.createOverlay(stId, pathwayData, regionElement);
        this.ehldService.showAnalysisInfo(regionElement, pathwayData);
      });
    }
  }

  private handleResize() {
    if (!this.panZoomInstance) return;

    const rect = this.ehldContainer().nativeElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return; // skip updates if container width or height is 0.

    const zoom = this.panZoomInstance.getZoom();
    const pan = this.panZoomInstance.getPan();
    // detect if user has zoomed or panned
    const isDefaultView =
      Math.abs(zoom - this.initialZoom) < 0.01 &&
      Math.abs(pan.x - this.initialPan.x) < 1 &&
      Math.abs(pan.y - this.initialPan.y) < 1;
    // detect if user is zoomed all the way in
    const isZoomOut = Math.abs(zoom - 1) < 0.01;

    // only fit & center if user hasn’t interacted or zoom all the way in
    if (isDefaultView || isZoomOut) {
      this.panZoomInstance.resize();
      this.panZoomInstance.fit();
      this.panZoomInstance.center();

      this.initialZoom = this.panZoomInstance.getZoom();
      this.initialPan = this.panZoomInstance.getPan();
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.panZoomInstance) {
      this.panZoomInstance.destroy();
    }
  }

  // needs Input event binding to react to mouse drag instead of mouse drop on slider
  zoom(inputEvent: Event) {
    const level = (inputEvent.target as HTMLInputElement).valueAsNumber
    this.panZoomInstance?.zoom(level);
  }

  fitScreen() {
    this.panZoomInstance?.resize();
    this.panZoomInstance?.fit();
    this.panZoomInstance?.center();
  }

  move(direction: 'up' | 'right' | 'down' | 'left', distance = 50) {
    const x = direction === 'right' ? -distance : direction === 'left' ? distance : 0;
    const y = direction === 'up' ? distance : direction === 'down' ? -distance : 0;
    this.panZoomInstance?.panBy({x, y})
  }
}
