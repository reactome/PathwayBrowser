import {AfterViewInit, ChangeDetectorRef, Component, effect, ElementRef, model, ViewChild} from '@angular/core';
import {filter, forkJoin, Observable, take, tap} from "rxjs";
import {EhldService, LegendGroup} from "../services/ehld.service";
import {DomSanitizer} from "@angular/platform-browser";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {DiagramStateService} from "../services/diagram-state.service";
import SvgPanZoom from 'svg-pan-zoom';
import {Graph} from "../model/graph.model";
import {AnalysisService} from "../services/analysis.service";
import {isDefined} from "../services/utils";
import {Analysis} from "../model/analysis.model";
import {Style} from "reactome-cytoscape-style";
import {SpeciesService} from "../services/species.service";


@Component({
    selector: 'cr-ehld',
    templateUrl: './ehld.component.html',
    styleUrls: ['./ehld.component.scss'],
    standalone: false
})

@UntilDestroy()
export class EhldComponent implements AfterViewInit {

  @ViewChild('ehld') ehldContainer?: ElementRef<HTMLDivElement>;
  readonly stId = model.required<string>();


  style!: Style;
  ratio = 0.384;

  svgContent: string = '';
  selectedElement?: SVGGElement;
  selectedIdFromUrl?: string;
  flaggedIdFromUrl?: string[];
  flaggedElements: (SVGGElement | undefined)[] = [];
  stIdToSVGGElement: Map<string, SVGGElement> = new Map<string, SVGGElement>();
  //dbIdToSVGGElement: Map<number, SVGGElement> = new Map<number, SVGGElement>();
  panZoom?: SvgPanZoom.Instance;
  legendItems: LegendGroup[] = [];

  constructor(private ehldService: EhldService,
              private sanitizer: DomSanitizer,
              private cdr: ChangeDetectorRef,
              private analysisService: AnalysisService,
              private speciesService: SpeciesService,
              public state: DiagramStateService,) {
    effect(() => this.selectedIdFromUrl = this.state.select());
    effect(() => this.flaggedIdFromUrl = this.state.flag());
    effect(() => this.loadAnalysis(this.state.analysis()));
  }

  ngAfterViewInit(): void {
    this.style = new Style(this.ehldContainer!.nativeElement);

    this.legendItems = this.ehldService.legendItems;

    this.ehldService.hasEHLD$.pipe(untilDestroyed(this)).subscribe((hasEHLD) => {
      if (this.stId() && hasEHLD) {
        this.loadEhldSvg().subscribe({
          next: () => {
            this.initializePanAndZoom();
            this.loadAnalysis(this.state.analysis())
          },
          error: () => {
            console.error('Error loading EHLD SVG');
          }
        })
      }
    });

  }

  // Example of zooming: https://stackblitz.com/edit/svg-pan-zoom?file=src%2Fapp%2Fapp.component.html,src%2Fapp%2Fapp.component.ts,src%2Fapp%2Fapp.module.ts
  // SVG pan zoom documentation: https://github.com/bumbu/svg-pan-zoom?tab=readme-ov-file
  initializePanAndZoom() {
    const svgElement = this.ehldContainer!.nativeElement.querySelector('svg');
    if (svgElement) {
      // Disable default tooltips to be shown when hovering on svg element
      svgElement.querySelectorAll('title').forEach(item => {
        item.innerHTML = '';
      });
      svgElement.setAttribute('width', '100%');
      svgElement.setAttribute('height', '100%');
      this.panZoom = SvgPanZoom(svgElement, {
        zoomEnabled: true,
        controlIconsEnabled: false,
        maxZoom: 1000,
        dblClickZoomEnabled: false
      });
    }
  }


  private loadEhldSvg(): Observable<{ svg: string; graphData: Graph.Data }> {
    return this.ehldService.getSVGData(this.stId()!).pipe(
      tap(result => {
        if (result.svg) {
          const sanitizedSvg = this.sanitizer.bypassSecurityTrustHtml(result.svg);
          this.svgContent = sanitizedSvg as string;
          if (this.svgContent) {
            this.cdr.detectChanges();
            this.stIdToSVGGElement = this.ehldService.setStIdToSVGGElementMap(this.ehldContainer);
            //this.dbIdToSVGGElement = this.ehldService.setDbIdToSVGGElementMap(this.ehldContainer);
            this.setInitialSelection();
            this.setInitialFlag();
            this.addEventListenerToSvg();
          }
        } else {
          throw new Error('Error loading EHLD SVG');
        }
      })
    )
  }

  private setInitialSelection() {
    if (!this.selectedIdFromUrl) return;
    this.selectedElement = this.stIdToSVGGElement.get(this.selectedIdFromUrl)
    if (this.selectedElement) {
      this.ehldService.applyOutline(this.selectedElement, this.flaggedElements);
    }
  }

  private setInitialFlag() {
    if (!this.flaggedIdFromUrl) return;
    this.flaggedElements = this.flaggedIdFromUrl
      .map(e => this.stIdToSVGGElement.get(e))
      .filter(e => e !== undefined);

    this.flaggedElements?.forEach(element => {
      if (element) {
        this.ehldService.applyFlagOutline(element)
      }
    });
  }

  private addEventListenerToSvg(): void {
    const svgElement = this.ehldContainer!.nativeElement.querySelectorAll('g[id^="REGION"]') as NodeListOf<SVGGElement>;

    svgElement.forEach((element: SVGGElement) => {
      element.addEventListener('mouseover', () => {
        if (element !== this.selectedElement) {
          this.ehldService.applyShadow(element, this.flaggedElements);
        }
      })

      element.addEventListener('mouseout', () => {
        if (element !== this.selectedElement) {
          this.ehldService.removeShadow(element, this.flaggedElements);
        }
      })

      element.addEventListener('click', () => {
        if (this.selectedElement) {
          this.ehldService.removeOutline(this.selectedElement, this.flaggedElements);
        }
        this.selectedElement = element;

        const idAttr = this.selectedElement?.getAttribute('id');
        if (idAttr) {
          const stId = this.ehldService.getStableId(idAttr);
          if (stId) this.state.select.set(stId);
        }

        this.ehldService.applyOutline(element, this.flaggedElements);
      });

      element.addEventListener('dblclick', () => {
        const idAttr = this.selectedElement?.getAttribute('id');
        if (idAttr) {
          const stId = this.ehldService.getStableId(idAttr);
          if (stId) {
            this.speciesService.setIgnore(false);
            this.stId.set(stId);
          }
        }
      })
    })
  }


  private loadAnalysis(token: string | null) {
    const diagramId = this.stId();
    if (!token || !diagramId) {
      return;
    }
    forkJoin({
      entities: this.analysisService.foundEntities(diagramId, token),
      pathways: this.analysisService.pathwaysResults([...this.stIdToSVGGElement.keys()], token),
      result: this.analysisService.result$.pipe(filter(isDefined), take(1))
    }).subscribe(({entities, result, pathways}) => {

      console.log("result", entities, result, pathways);

      this.ehldService.clearExistingPatterns(this.stIdToSVGGElement, this.ehldContainer!.nativeElement.querySelector('svg'))
      this.ehldService.clearAllOverlay(this.stIdToSVGGElement);
      this.ehldService.clearAnalysisInfo(this.stIdToSVGGElement);

      const analysisProfile = this.state.analysisProfile();
      let analysisIndex = analysisProfile ? entities.expNames.indexOf(analysisProfile) : 0;
      if (analysisIndex === -1) analysisIndex = 0;

      // let analysisEntityMap = new Map<string, number>(entities.entities.flatMap(entity =>
      //   entity.mapsTo
      //     .flatMap(diagramEntity => diagramEntity.ids)
      //     .map(id => [id, entity.exp[analysisIndex] || 1]))
      // )
      // console.log("analysisEntityMap ", analysisEntityMap);

      // let analysisPathwayMap = new Map<number, Analysis.Pathway['entities']>(pathways.map(p => [p.dbId, p.entities]));
      let analysisPathwayMap = new Map<string, Analysis.Pathway['entities']>(pathways.map(p => [p.stId, p.entities]));

      const allPathwayStIds = [...this.stIdToSVGGElement.keys()];
      allPathwayStIds.forEach((stId) => {
        const regionElement = this.stIdToSVGGElement.get(stId);
        const pathwayData = analysisPathwayMap.get(stId);

        if (!regionElement) return;

        const exps: [number | undefined, number][] = pathwayData
          ? [
            [pathwayData.exp[analysisIndex] || 1 - pathwayData.pValue, pathwayData.found],
            [undefined, pathwayData.total - pathwayData.found],
          ]
          : [[undefined, 1]];

        this.ehldService.createOverlay(stId, exps, regionElement);

        // If pathway data exists, show additional analysis info box
        if (pathwayData) {
          this.ehldService.showAnalysisInfo(regionElement, pathwayData);
        }
      });
    })
  }

}
