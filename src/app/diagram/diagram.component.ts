import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  model,
  OnDestroy,
  Output,
  signal,
  viewChild,
  ViewChild
} from '@angular/core';
import {DiagramService} from "../services/diagram.service";
import {extract, ReactomeEvent, ReactomeEventTypes, Style} from "reactome-cytoscape-style";
import cytoscape, {BoundingBoxWH, ElementsDefinition} from "cytoscape";
import {InteractorService} from "../interactors/services/interactor.service";
import {
  catchError,
  delay,
  distinctUntilChanged,
  EMPTY,
  filter,
  forkJoin,
  map,
  Observable,
  of,
  share,
  Subject,
  switchMap,
  take,
  tap
} from "rxjs";
import {UrlStateService} from "../services/url-state.service";
import {UntilDestroy} from "@ngneat/until-destroy";
import {AnalysisService} from "../services/analysis.service";
import {Graph} from "../model/graph.model";
import {isDefined, isPathwayWithDiagram} from "../services/utils";
import {Analysis} from "../model/analysis.model";
import {ActivatedRoute, Router} from "@angular/router";
import {InteractorsComponent} from "../interactors/interactors.component";
import {EventService} from "../services/event.service";
import {Event as EventModel} from "../model/graph/event/event.model";


import {DarkService} from "../services/dark.service";
import {Pathway} from "../model/graph/event/pathway.model";
import {DataStateService} from "../services/data-state.service";


const INIT_RX = 2;

const END_RX = 0;

const FIT_PADDING = 100;

@UntilDestroy({checkProperties: true})
@Component({
  selector: 'cr-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.scss'],
  standalone: false
})
export class DiagramComponent implements AfterViewInit, OnDestroy {
  title = 'pathway-browser';
  @ViewChild('cytoscape') cytoscapeContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('cytoscapeCompare') compareContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('legend') legendContainer?: ElementRef<HTMLDivElement>;
  readonly thumbnailRef = viewChild.required<ElementRef<HTMLImageElement>>('thumbnail');

  readonly interactorsComponent = input<InteractorsComponent>(undefined, {alias: "interactor"});
  readonly pathwayId = model.required<string>();


  readonly controlZoom = signal<number>(0);
  readonly controlMinZoom = signal<number>(1);
  readonly controlMaxZoom = signal<number>(100);

  readonly controlRange = computed(() => this.controlMaxZoom() - this.controlMinZoom());

  comparing: boolean = false;
  isInitialLoad: boolean = true;

  constructor(private diagram: DiagramService,
              public dark: DarkService,
              private interactorsService: InteractorService,
              private state: UrlStateService,
              public analysis: AnalysisService,
              private event: EventService,
              private router: Router,
              private route: ActivatedRoute,
              private data: DataStateService
  ) {
    this.isInitialLoad = Boolean(!this.router.getCurrentNavigation()?.previousNavigation);
    effect(() => this.pathwayId() && this.loadDiagram());
    effect(() => {
      const flag = this.data.flagIdentifiers();
      if (flag.length > 0) this.avoidSideEffect(() => this.cys.forEach(cy => this.flag(this.data.flagIdentifiers(), cy)))
      // this.flagging = false;
    }, {debugName: 'diagram flagging'});
    effect(() => {
      if (this.state.select() && !this.selecting) this.avoidSideEffect(() => this.cys.forEach(cy => this.select(this.state.select()!, cy)))
      this.selecting = false;
    }, {debugName: 'diagram selecting'});
    effect(() => {
      const result = this.state.analysis(); // Not in one line to make sure to trigger the update
      this.avoidSideEffect(() => this.loadAnalysis(result))
    });
    effect(() => this.analysis.palette() && this.reactomeStyle?.loadAnalysis(this.cy, this.analysis.palette().scale));
    effect(() =>
      this.analysis.sampleIndex() !== undefined &&
      this._loadAnalysisFn &&
      this._loadAnalysisFn(this.analysis.sampleIndex())
    );
    effect(() => { // Update style upon dark change
      this.dark.isDark();
      this.updateStyle();
    })
  }

  zoomToCytoscapeTransform = (x: number) => this.minZoom() * Math.pow(this.maxZoom() / this.minZoom(), (x - this.controlMinZoom()) / this.controlRange());
  zoomToControlTransform = (zoomCy: number) => this.controlMinZoom() + this.controlRange() * (Math.log(zoomCy / this.minZoom()) / Math.log(this.maxZoom() / this.minZoom()));
  thumbnailImg = signal<string>('');
  sizeObserver!: ResizeObserver;
  containerSize = signal<{ width: number, height: number }>({width: 0, height: 0});
  thumbnailSize = signal<{ width: number, height: number }>({width: 0, height: 0});
  boundingBox = signal<BoundingBoxWH>({x1: 0, y1: 1, w: 1, h: 1});


  thumbnailViewBox = computed(() => `0 0 ${this.thumbnailSize().width} ${this.thumbnailSize().height}`)
  viewportPosition = signal<{ x: number, y: number }>({x: 0, y: 0});
  zoomLevel = signal<number>(0.1);
  minZoom = signal<number>(0.1);
  maxZoom = signal<number>(15);

  thumbnailRxA = computed(() => (END_RX - INIT_RX) / (this.maxZoom() - this.minZoom()));
  thumbnailRxB = computed(() => INIT_RX - this.thumbnailRxA() * this.minZoom());
  thumbnailRx = computed(() => this.zoomLevel() * this.thumbnailRxA() + this.thumbnailRxB());


  shrunkViewport = computed(() => {
// Get bounding box of the entire graph
    const bbox = this.boundingBox();

// Get current zoom and pan
    const zoom = this.zoomLevel();
    const pan = this.viewportPosition(); // {x, y}

// Get main container size (in pixels)
    const mainWidth = this.containerSize().width;
    const mainHeight = this.containerSize().height;

// Define your thumbnail size (in pixels)
    const thumbWidth = this.thumbnailSize().width;
    const thumbHeight = this.thumbnailSize().height;

// Compute scale factor between global graph and thumbnail
    const scaleX = thumbWidth / bbox.w;
    const scaleY = thumbHeight / bbox.h;
    const scale = Math.min(scaleX, scaleY); // uniform scaling

// Offset to center the graph in the thumbnail
    const offsetX = (thumbWidth - bbox.w * scale) / 2;
    const offsetY = (thumbHeight - bbox.h * scale) / 2;

// Viewport dimensions in graph coordinate space
    const viewW = mainWidth / zoom;
    const viewH = mainHeight / zoom;

// Viewport top-left in graph space
    const viewX = -pan.x / zoom;
    const viewY = -pan.y / zoom;

// Convert to thumbnail coordinates
    return {
      x: (viewX - bbox.x1) * scale + offsetX,
      y: (viewY - bbox.y1) * scale + offsetY,
      width: viewW * scale,
      height: viewH * scale
    }
  });

  cy!: cytoscape.Core;
  reactomeStyle!: Style;
  cyCompare!: cytoscape.Core;
  reactomeStyleCompare!: Style;
  legend!: cytoscape.Core;
  cys: cytoscape.Core[] = [];

  leafIdToParentIds = new Map<string, string[]>();

  selecting = false // Avoid zooming in diagram when selection came from in diagram
  flagging = false // Avoid flagging in diagram when flagging came from in diagram


  ngAfterViewInit(): void {
    const container = this.cytoscapeContainer!.nativeElement;
    const compareContainer = this.compareContainer!.nativeElement;
    const legendContainer = this.legendContainer!.nativeElement;

    Object.values(ReactomeEventTypes).forEach((type) => {
      container.addEventListener(type, (e) => this._reactomeEvents$.next(e as ReactomeEvent))
      compareContainer.addEventListener(type, (e) => this._reactomeEvents$.next(e as ReactomeEvent))
      legendContainer.addEventListener(type, (e) => this._reactomeEvents$.next(e as ReactomeEvent))
    })

    this.reactomeStyle = new Style(container);

    this.underlayPadding = extract(this.reactomeStyle.properties.shadow.padding)

    this.diagram.getLegend()
      .subscribe(legend => {
        this.legend = cytoscape({
          container: legendContainer,
          elements: legend,
          style: this.reactomeStyle?.getStyleSheet(),
          layout: {name: "preset"},
          boxSelectionEnabled: false
        });
        this.reactomeStyle?.bindToCytoscape(this.legend);

        this.legend.zoomingEnabled(false);
        this.legend.panningEnabled(false);
        this.legend.minZoom(0)
      });

    this.sizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        if (entry.target === container) {
          this.containerSize.set(entry.contentRect);

          // Update min zoom to be able to fit the whole diagram in the resized viewport
          if (this.cy) {
            const bbox = this.boundingBox();
            const minZoom = Math.min(
              this.containerSize().width / (bbox.w + FIT_PADDING),
              this.containerSize().height / (bbox.h + FIT_PADDING),
            );

            this.minZoom.set(minZoom);
            this.cys.forEach(cy => {
              cy.minZoom(minZoom);
              if (cy.zoom() < minZoom) {
                this.zoomLevel.set(minZoom);
                cy.zoom(minZoom);
              }
            })
          }
        }

        if (entry.target === this.thumbnailRef().nativeElement) this.thumbnailSize.set(entry.contentRect)
      })
    })

    this.sizeObserver.observe(container);
    this.sizeObserver.observe(this.thumbnailRef().nativeElement);

    this.loadDiagram();
  }

  thumbnailLoaded() {
    this.thumbnailSize.set(this.thumbnailRef().nativeElement.getBoundingClientRect())
  }

  ngOnDestroy(): void {
    this.sizeObserver.disconnect();
  }

  // Needs Input event binding to react to mouse drag instead of mouse drop on slider
  zoom(inputEvent: Event) {
    this.cy.zoom({
      level: this.zoomToCytoscapeTransform((inputEvent.target as HTMLInputElement).valueAsNumber),
      renderedPosition: {x: this.cy.width() / 2, y: this.cy.height() / 2}
    })
  }

  zoomIn() {
    this.cy.zoom({
      level: this.cy.zoom() * 1.2,
      renderedPosition: {x: this.cy.width() / 2, y: this.cy.height() / 2}
    })
  }

  zoomOut() {
    this.cy.zoom({
      level: this.cy.zoom() / 1.2,
      renderedPosition: {x: this.cy.width() / 2, y: this.cy.height() / 2}
    })
  }

  move(direction: 'up' | 'right' | 'down' | 'left', distance = 50) {
    const x = direction === 'right' ? -distance : direction === 'left' ? distance : 0;
    const y = direction === 'up' ? distance : direction === 'down' ? -distance : 0;
    this.cy.panBy({x, y})
  }

  fitScreen() {
    this.cy.animate({
      fit: {
        eles: "*",
        padding: FIT_PADDING
      },
      duration: 1000,
      easing: "ease-in-out"
    })
  }

  private loadDiagram(): void {
    this.event.diagramPathway$.pipe(
      filter(isDefined),
      take(1),
      switchMap((event) => {
        // If the diagramId is a subpathway without diagram, and it is a first load then load parent diagram
        // For instance: ../PathwayBrowser/R-HSA-69541
        if (!isPathwayWithDiagram(event) && this.isInitialLoad) {
          return this.loadSubpathwayWithDiagram(event);
        }
        // Pathway with a diagram
        return this.loadElvDiagram();
      }),
      catchError(() => of(null))
    ).subscribe(() => {
      this.isInitialLoad = false;
    });
  }


  loadElvDiagram(): Observable<ElementsDefinition> {
    if (!this.cytoscapeContainer) return EMPTY; // Prevent execution if the container is not present

    const container = this.cytoscapeContainer.nativeElement;
    return this.diagram.getDiagram(this.pathwayId()!).pipe(
      tap(elements => {
        this.comparing = elements.nodes.some(node => node.data['isFadeOut']) ||
          elements.edges.some(edge => edge.data['isFadeOut']);

        this.cy = cytoscape({
          container: container,
          elements: elements,
          style: this.reactomeStyle?.getStyleSheet(),
          layout: {name: "preset"},
        });
        this.cys[0] = this.cy;
        this.reactomeStyle.bindToCytoscape(this.cy);

        this.leafIdToParentIds.clear();
        this.cy.nodes().forEach(node => {
          node.data('graph.leaves')?.forEach((leaf: Graph.Node) => {
            if (!this.leafIdToParentIds.has(leaf.stId)) this.leafIdToParentIds.set(leaf.stId, [])
            const parents = this.leafIdToParentIds.get(leaf.stId)!;
            parents.push(node.data('graph.stId'));
          })
        })

        console.log(this.leafIdToParentIds)

        this.cy.on('zoom', () => this.controlZoom.set(this.zoomToControlTransform(this.cy.zoom())));

        this.reactomeStyle.clearCache();
        this.cy.on('dblclick', '.SUB.Pathway', (e) => this.router.navigate([e.target.data('graph.stId')], {
          queryParamsHandling: "preserve",
          preserveFragment: true
        }))

        this.cy.on('dblclick', '.Interacting.Pathway', (e) => this.router.navigate([e.target.data('graph.stId')], {
          queryParams: {select: this.pathwayId()},
          queryParamsHandling: "merge",
          preserveFragment: true
        }))

        const shadowNodes = this.cy?.nodes('.Shadow');
        this.event.setSubpathwayColors(shadowNodes && shadowNodes.length > 0
          ? new Map(shadowNodes.map(node => [node.data('reactomeId'), node.data('color')]))
          : undefined);

        this.thumbnailImg.set(this.cy.png({full: true, maxHeight: 240}))
        this.cy.on('viewport', () => {
          this.zoomLevel.set(this.cy.zoom());
          this.viewportPosition.set({...this.cy.pan()});
        })

        this.zoomLevel.set(this.cy.zoom());
        this.minZoom.set(this.cy.minZoom());
        this.maxZoom.set(this.cy.maxZoom());
        this.viewportPosition.set({...this.cy.pan()});
        this.boundingBox.set(this.cy.elements().boundingBox({
          includeEdges: true,
          includeNodes: true,

          includeLabels: false,
          includeMainLabels: false,
          includeOverlays: false,
          includeUnderlays: false,
          includeSourceLabels: false,
          includeTargetLabels: false,
        }));

        this.loadCompare(elements, container);

        this.avoidSideEffect(() => this.stateToDiagram());
      })
    );
  }

  loadSubpathwayWithDiagram(event: EventModel) {
    return this.event.fetchEventAncestors(this.pathwayId()!).pipe(
      map(ancestors => this.event.getFinalAncestor(ancestors)),
      switchMap((ancestors) => {
        const pathwayWithDiagram = this.event.getPathwayWithDiagram(event);
        if (pathwayWithDiagram) {
          const newDiagramId = pathwayWithDiagram.stId;
          const diagramId = this.pathwayId();
          if (newDiagramId !== diagramId) {
            this.pathwayId.set(newDiagramId);
            // this.router.navigate([diagramId], {
            //   queryParamsHandling: "preserve"
            // }).then(() => {
              this.state.select.set(event.stId);
            // });

            return this.loadElvDiagram();
          }
        }
        return of(null)
      })
    );
  }

  public initialiseReplaceElements() {
    if (this.comparing)
      this.cy.batch(() => {
        this.cy.elements('[!isBackground]').style('visibility', 'hidden')
        this.cy.edges('.shadow').style('underlay-padding', 0)
        this.lastIndex = 0;
        this.updateReplacementVisibility();
        this.cy.elements('.Compartment').style('visibility', 'visible')
      })
  }

  private loadCompare(elements: cytoscape.ElementsDefinition, container: HTMLDivElement) {

    const getPosition = (e: cytoscape.SingularElementArgument) => e.is('.Shadow') ? e.data('triggerPosition') : e.boundingBox().x1;
    if (this.comparing) {
      this.cy.elements('[!isBackground]').style('visibility', 'hidden')
      this.replacedElements = this.cy!
        .elements('[?replacedBy]')
        .add('[?isCrossed]')
        .sort((a, b) => getPosition(a) - getPosition(b))
        .style('visibility', 'hidden')
        .toArray();

      this.replacedElementsPosition = this.replacedElements.map(getPosition);


      this.cy.on('add', e => {
        const addedElement = e.target;
        if (addedElement.data('replacedBy') || addedElement.data('isCrossed')) {
          const x = getPosition(addedElement);
          let index = this.replacedElementsPosition.findIndex(x1 => x1 >= x);
          if (index === -1) index = this.replacedElements.length;

          this.replacedElements.splice(index, 0, addedElement);
          this.replacedElementsPosition.splice(index, 0, x);
          addedElement.style('visibility', 'hidden');
        }
      })

      this.cy.on('remove', e => {
        const removedElement = e.target;
        const index = this.replacedElements.indexOf(removedElement);
        if (index > -1) {
          this.replacedElements.splice(index, 1);
          this.replacedElementsPosition.splice(index, 1);
        }
      })

      const compareContainer = this.compareContainer!.nativeElement;
      this.cyCompare = cytoscape({
        container: compareContainer,
        elements: elements,
        style: this.reactomeStyle?.getStyleSheet(),
        layout: {name: "preset"},
      });
      this.cys[1] = this.cyCompare;


      this.cyCompare.elements('[?isFadeOut]').remove();
      this.cyCompare.elements('.Compartment').remove();
      this.cy!.nodes('.crossed').removeClass('crossed');

      this.cyCompare!.on('viewport', () => this.syncViewports(this.cyCompare, compareContainer, this.cy, container))
      this.cy!.on('viewport', () => this.syncViewports(this.cy, container, this.cyCompare, compareContainer))

      this.reactomeStyleCompare = new Style(compareContainer);
      this.reactomeStyleCompare?.bindToCytoscape(this.cyCompare);
      this.cyCompare.minZoom(this.cy!.minZoom())
      this.cyCompare.maxZoom(this.cy!.maxZoom())

      setTimeout(() => {
        this.syncViewports(this.cy!, container, this.cyCompare, compareContainer)
        this.initialiseReplaceElements();
      })
    }
  }

  readonly classRegex = /class:(\w+)([!.]drug)?/

  getElements(tokens: (string | number)[], cy: cytoscape.Core, includeContainers = false): cytoscape.CollectionArgument {
    let elements: cytoscape.Collection;

    elements = cy.collection()
    tokens.forEach(token => {
      if (typeof token === 'string') {
        if (token.startsWith('R-')) {
          let tokenElements = cy.collection(`[graph.stId="${token}"]`);
          // Load children
          if ((includeContainers || tokenElements.length === 0) && this.leafIdToParentIds.has(token)) this.leafIdToParentIds.get(token)!.forEach(parent => tokenElements = tokenElements.or(`[graph.stId="${parent}"]`))
          elements = elements.or(tokenElements);

          // Consider it as a subpathway when there are no elements found and get all reactions
          if (elements.length === 0) {
            let allSubpathwaysElements = elements.or('[subpathways]');
            allSubpathwaysElements.forEach(ele => {
              let pathwayList = ele.data('subpathways');
              if (pathwayList.includes(token)) {
                elements.merge(ele);
              }
            });
          }
        } else {
          const matchArray = token.match(this.classRegex);
          if (matchArray) {
            const [_, clazz, drug] = matchArray;
            if (drug === '.drug') { // Drug physical entity
              elements = elements.or(`.${clazz}`).and('.drug');
            } else if (drug === '!drug') { // Non drug physical entity
              elements = elements.or(`.${clazz}`).not('.drug');
            } else { // Reactions
              elements = elements.or(`.${clazz}`);
              elements = elements.or(elements.nodes('.reaction').connectedEdges());
            }
          } else {
            elements = elements.or(`[acc="${token}"]`)
          }
        }
      } else {
        elements = elements.or(`[acc="${token}"]`).or(`[reactomeId="${token}"]`)
      }
    });
    return elements;
  }

  select(tokens: (string | number), cy: cytoscape.Core): cytoscape.CollectionArgument {
    cy.elements(':selected').unselect();
    let selected = this.getElements([tokens], cy);
    selected.select();
    if ("connectedNodes" in selected) {
      selected = selected.add(selected.connectedNodes());
    }

    if (this._ignore) {
      cy.animate({
        fit: {
          eles: selected,
          padding: 100
        },
        duration: 1000,
        easing: "ease-in-out"
      })
    }

    return selected;
  }

  flag(accs: (string | number)[], cy: cytoscape.Core): cytoscape.CollectionArgument {
    return this.flagElements(this.getElements(accs, cy, true), cy)
  }

  flagElements(toFlag: cytoscape.CollectionArgument, cy: cytoscape.Core): cytoscape.CollectionArgument {
    const shadowNodes = cy.nodes('.Shadow');
    const shadowEdges = cy.edges('[?color]');
    const trivials = cy.elements('.trivial');

    if (toFlag.nonempty()) {
      cy.batch(() => {
        this.setSubPathwayVisibility(false, cy);
        cy.elements().removeClass('flag')
        toFlag.addClass('flag')
          .edges().style({'underlay-opacity': 1})
      })

      return toFlag
    } else {
      cy.batch(() => {
        this.setSubPathwayVisibility(true, cy);
        cy.elements().removeClass('flag');
      })

      return cy.collection()
    }
  }

  setSubPathwayVisibility(visible: boolean, cy: cytoscape.Core) {
    const shadowNodes = cy.nodes('.Shadow');
    const shadowEdges = cy.edges('[?color]');
    const trivials = cy.elements('.trivial');

    if (visible) {
      shadowNodes.style({opacity: 1})
      trivials.style({opacity: 1})
      shadowEdges.addClass('shadow')
      cy.on('zoom', cy.data('reactome').interactivity.onZoom.shadow)
      cy.data('reactome').interactivity.onZoom.shadow()
    } else {
      shadowNodes.style({opacity: 0})
      shadowEdges.removeClass('shadow')
      cy.off('zoom', cy.data('reactome').interactivity.onZoom.shadow)
      trivials.style({opacity: 1})
      cy.edges().style({'underlay-opacity': 0})
    }
  }


  applyEvent(event: ReactomeEvent, affectedElements: cytoscape.NodeCollection | cytoscape.EdgeCollection) {
    switch (event.type) {
      case ReactomeEventTypes.hover:
        affectedElements.addClass('hover');
        break;
      case ReactomeEventTypes.leave:
        affectedElements.removeClass('hover');
        break;
      case ReactomeEventTypes.select:
        affectedElements.select();
        break;
      case ReactomeEventTypes.unselect:
        affectedElements.unselect();
        break;
    }
  }


  ratio = 0.384;

  replacedElements!: cytoscape.SingularElementArgument[];
  replacedElementsPosition: number[] = [];

  lastIndex = 0;
  underlayPadding = 0;

  private updateReplacementVisibility() {

    // // Calculate the position of the element that is to the right of the separation

    const extent = this.cyCompare!.extent();
    let limitIndex = this.replacedElementsPosition.findIndex(x1 => x1 >= extent.x1);
    if (limitIndex === -1) limitIndex = this.replacedElements.length;

    /// Alternative calculation. In theory more optimised, but seems worse when console is opened for some reason

    // const currentPos = this.cyCompare!.extent().x1;
    // let limitIndex = this.lastIndex;
    // let i = this.lastIndex;
    // if (currentPos > this.lastPosition) { // Dragging to the right
    //   while (i >= 0 && this.replacedElementsPosition[i] < currentPos) i++;
    //   limitIndex = i;
    // } else if (currentPos < this.lastPosition) { // Dragging to the left
    //   do i--;
    //   while (i < this.replacedElementsPosition.length  && this.replacedElementsPosition[i] >= currentPos)
    //   limitIndex = i+1;
    // }
    //
    // this.lastPosition = currentPos;
    // ---------

    if (this.lastIndex !== limitIndex) {
      // If at least one element is switched from left to right
      if (limitIndex < this.lastIndex) this.replacedElements.slice(limitIndex, this.lastIndex)
        .map(e => e.style('visibility', 'hidden')) // Hide the range of elements
        .filter(e => e.is('.Shadow')) // And if it is an shadow
        .forEach(shadow => shadow.data('edges').style('underlay-padding', 0)) // Hide as well the associated reaction underlay
      // If at least one element is switched from right to left
      if (limitIndex > this.lastIndex) this.replacedElements.slice(this.lastIndex, limitIndex)
        .map(e => e.style('visibility', 'visible')) // Show the range of elements
        .filter(e => e.is('.Shadow')) // And if it is an shadow
        .forEach(shadow => shadow.data('edges').style('underlay-padding', this.underlayPadding)) // Show as well the associated reaction underlay
    }
    this.lastIndex = limitIndex
  }

  syncing = false;
  syncViewports = (source: cytoscape.Core, sourceContainer: HTMLElement, target: cytoscape.Core, targetContainer: HTMLElement) => {
    if (this.syncing) return;
    this.syncing = true;
    this.updateReplacementVisibility();

    const position = {...source.pan()};
    const sourceX = sourceContainer.getBoundingClientRect().x;
    const targetX = targetContainer.getBoundingClientRect().x;
    position.x += sourceX - targetX;
    target.viewport({
      zoom: source.zoom(),
      pan: position,
    })
    this.syncing = false;
  };


  private loadAnalysis(token: string | null) {
    const diagramId = this.pathwayId();
    console.log(token, diagramId)
    if (!token || !diagramId) {
      this._loadAnalysisFn = undefined;

      this.cys.forEach(cy => {
        cy.batch(() => {
          cy.nodes().removeData('exp');
          cy.edges('[?color]').style({
            'underlay-padding': extract(this.reactomeStyle.properties.shadow.padding)
          });
          cy.nodes('.Shadow').style({
            'font-size': extract(this.reactomeStyle.properties.shadow.fontSize),
            'text-outline-width': extract(this.reactomeStyle.properties.shadow.fontPadding)
          })
        })
      });
      this.reactomeStyle?.loadAnalysis(this.cy, this.analysis.palette().scale);
      return
    }

    forkJoin({
      entities: this.analysis.foundEntities(diagramId, token),
      pathways: this.analysis.pathwaysResults(this.cy?.nodes('.Pathway').map(p => p.data('reactomeId')) || [], token),
    }).subscribe(({entities, pathways}) => {

      this._loadAnalysisFn = (analysisIndex) => {
        console.log('loading index', analysisIndex)
        let analysisEntityMap = new Map<string, number>(entities.entities.flatMap(entity =>
          entity.mapsTo
            .flatMap(diagramEntity => diagramEntity.ids)
            .map(id => [id, entity.exp[analysisIndex] || 0]))
        )

        let analysisPathwayMap = new Map<number, Analysis.Pathway['entities']>(pathways.map(p => [p.dbId, p.entities]));

        this.cys.forEach(cy => {
          cy.batch(() => {
            const style: Style = cy.data('reactome');

            cy.nodes('.PhysicalEntity').forEach(node => {
              const leaves: Graph.Node[] = node.data('graph.leaves') || [node.data('graph')];
              const exp = leaves
                ?.map(leaf => analysisEntityMap.get(leaf.identifier))
                ?.sort((a, b) => a !== undefined ? (b !== undefined ? a - b : -1) : 1);

              // if (hasExpression) exp = exp.map(e => e !== undefined ? 1 - e : undefined);
              node.data('exp', exp);
            })
            cy.nodes('.Pathway').forEach(node => {
              const dbId: number = node.data('reactomeId');
              const pathwayData = analysisPathwayMap.get(dbId);
              if (!pathwayData) {
                node.data('exp', [undefined]);
              } else {
                node.data('exp', [
                  [pathwayData.exp[analysisIndex] || pathwayData.fdr, pathwayData.found],
                  [undefined, pathwayData.total - pathwayData.found]
                ])
              }
            })

            cy.edges('[?color]').style({'underlay-padding': 8});
            cy.nodes('.Shadow').style({
              'font-size': extract(style.properties.shadow.fontSize) / 2,
              'text-outline-width': extract(style.properties.shadow.fontPadding) / 2
            })

            this.reactomeStyle.loadAnalysis(cy, this.analysis.palette().scale);
          })
        })
      }

      this._loadAnalysisFn(this.analysis.sampleIndex())
    })
  }

  private _loadAnalysisFn: ((analysisIndex: number) => void) | undefined

  updateStyle() {
    this.cy ? setTimeout(() => this.reactomeStyle?.update(this.cy), 5) : null;
    this.cyCompare ? setTimeout(() => this.reactomeStyle?.update(this.cyCompare), 5) : null;
    this.legend ? setTimeout(() => this.reactomeStyle?.update(this.legend), 5) : null;
  }

  compareDragging = false;

  dragStart() {
    this.compareDragging = true;
  }

  dragEnd() {
    this.compareDragging = false;
  }

  dragMove($event: MouseEvent, compareContainer: HTMLDivElement, container: HTMLDivElement) {
    if (!this.compareDragging) return;
    compareContainer.style['left'] = $event.x - container.getBoundingClientRect().x + 'px';
    this.cyCompare.resize()
    this.syncViewports(this.cy!, this.cytoscapeContainer!.nativeElement, this.cyCompare!, this.compareContainer!.nativeElement);
  }

  updateLegend() {
    this.legend.resize()
    this.legend.panningEnabled(true)
    this.legend.zoomingEnabled(true)
    this.legend.fit(this.legend.elements(), 2)
    this.legend.panningEnabled(false)
    this.legend.zoomingEnabled(false)
  }

  // ----- Event Syncing -----
  private _reactomeEvents$: Subject<ReactomeEvent> = new Subject<ReactomeEvent>();

  private _ignore = false;

  avoidSideEffect(m: () => any) {
    this._ignore = true;
    m();
    this._ignore = false;
  }

  @Output()
  public reactomeEvents$: Observable<ReactomeEvent> = this._reactomeEvents$.asObservable().pipe(
    distinctUntilChanged((prev, current) => prev.type === current.type && prev.detail.reactomeId === current.detail.reactomeId),
    // tap(e => console.log(e.type, e.detail, e.detail.element.data(), e.detail.cy.container()?.id)),
    filter(() => !this._ignore),
    share()
  );

  private stateToDiagram() {
    for (let cy of this.cys) {
      this.flag(this.data.flagIdentifiers(), cy);
      this.select(this.state.select()!, cy);
    }

    const resource = this.state.overlay();
    if (resource) {
      console.log('Resource not null', resource)
      this.interactorsComponent()?.getInteractors(resource)
    }

    this.loadAnalysis(this.state.analysis())
  }

  compareBackgroundSync = this.reactomeEvents$.pipe(
    filter(() => this.comparing),
    filter((e) => e.detail.cy !== this.legend)
  ).subscribe(event => {
    const src = event.detail.cy;
    const tgt = src === this.cy ? this.cyCompare : this.cy;

    let replacedBy = event.detail.element.data('replacedBy');
    replacedBy = replacedBy || event.detail.element.data('replacement');
    replacedBy = replacedBy || (event.detail.element.data('isBackground') && !event.detail.element.data('isFadeOut') && event.detail.element.data('id'));

    if (!replacedBy) return;

    let replacements = tgt.getElementById(replacedBy);
    if (event.detail.type === 'reaction') {
      replacements = replacements.add(tgt.elements(`[reactionId=${replacedBy}]`))
    }

    this.applyEvent(event, replacements)
  });


  interactorOpeningHandling = this.reactomeEvents$
    .pipe(
      filter((e) => e.detail.cy !== this.legend),
      filter(e => [ReactomeEventTypes.open, ReactomeEventTypes.close].includes(e.type as ReactomeEventTypes)),
      filter(e => e.detail.type === 'Interactor'),
    ).subscribe(e => {
        [this.reactomeStyle, this.reactomeStyleCompare]
          .filter(s => s !== undefined && e.detail.cy === s.cy)
          .forEach(style => {
              const occurrenceNode = e.detail.element.nodes()[0];

              if (e.type === ReactomeEventTypes.open)
                this.interactorsService.addInteractorNodes(occurrenceNode, style.cy!);
              else
                this.interactorsService.removeInteractorNodes(occurrenceNode);

              style.interactivity.updateProteins();
              style.interactivity.triggerZoom();
            }
          )

        if (this.comparing) {
          this.initialiseReplaceElements();
        }
      }
    );

  diagram2legend = this.reactomeEvents$.pipe(
    filter((e) => e.detail.cy !== this.legend),
  ).subscribe(event => {
    const classes = event.detail.element.classes();
    let matchingElement: cytoscape.NodeCollection | cytoscape.EdgeCollection = this.legend.elements(`.${classes[0]}`);

    if (event.detail.type === 'PhysicalEntity') {
      if (classes.includes('drug')) matchingElement = matchingElement.nodes('.drug')
      else matchingElement = matchingElement.not('.drug')
    } else if (event.detail.type === 'reaction') {
      const reaction = event.detail.element.nodes('.reaction');
      matchingElement = this.legend.nodes(`.${reaction.classes()[0]}`).first()
      matchingElement = matchingElement.add(matchingElement.connectedEdges())
    }

    this._ignore = true;
    this.applyEvent(event, matchingElement);
    this._ignore = false;
  });

  diagramSelect2state = this.reactomeEvents$.pipe(
    filter((e) => e.detail.cy !== this.legend && e.type === ReactomeEventTypes.select),
    delay(0), // Requirre for reaction to have time to select the reaction node
    distinctUntilChanged((previous, next) => next.detail.reactomeId === previous.detail.reactomeId),
  ).subscribe(e => {
      let elements: cytoscape.NodeSingular = e.detail.element;
      if (e.detail.type === 'reaction') {
        elements = e.detail.cy.elements('node.reaction:selected')
      }
      const reactomeIds = elements.map(el => el.data('graph.stId'));
      this.selecting = true
      this.state.select.set(reactomeIds[0]);
    }
  );

  legend2state = this.reactomeEvents$.pipe(
    filter((e) => e.detail.cy === this.legend),
    filter(() => !this._ignore),
    distinctUntilChanged((previous, next) => next.detail.element.id() === previous.detail.element.id()),
  ).subscribe((e) => {
    const event = e as ReactomeEvent;
    const classes = event.detail.element.classes();
    for (let cy of [this.cy, this.cyCompare].filter(isDefined)) {
      let matchingElement: cytoscape.NodeCollection | cytoscape.EdgeCollection = cy.elements(`.${classes[0]}`);

      // TODO move everything to use state

      if (event.detail.type === 'PhysicalEntity' || event.detail.type === 'Pathway') {
        if (classes.includes('drug')) matchingElement = matchingElement.nodes('.drug')
        else matchingElement = matchingElement.not('.drug')
      } else if (event.detail.type === 'reaction') {
        const reaction = event.detail.element.nodes('.reaction');
        matchingElement = this.cy.nodes(`.${reaction.classes()[0]}`)
        matchingElement = matchingElement.add(matchingElement.connectedEdges())
      }

      switch (event.type) {
        case ReactomeEventTypes.select:
          this.flagging = true
          this.state.flag.set(['class:' + classes[0] + (event.detail.type === 'reaction' ? '' : ((classes.includes('drug') ? '.' : '!') + 'drug'))]);
          break;
        case ReactomeEventTypes.unselect:
          this.flagging = true
          this.state.flag.set([]);
          break;
        case ReactomeEventTypes.hover:
          matchingElement.addClass('hover')
          break;
        case ReactomeEventTypes.leave:
          matchingElement.removeClass('hover')
          break;
      }
    }
  });

  logProteins() {
    console.debug(new Set(this.cy.nodes(".Protein").map(node => node.data("acc") || node.data("iAcc"))))
  }
}
