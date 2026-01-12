import {AfterViewInit, Component, effect, ElementRef, input, model, OnDestroy, ViewChild} from '@angular/core';
import {Event} from "../model/graph/event/event.model";
import {EventService, SelectableObject} from "../services/event.service";
import {SpeciesService} from "../services/species.service";
import {combineLatest, combineLatestWith, filter, fromEvent, map, Observable, of, switchMap, take, tap} from "rxjs";
import {MatTree, MatTreeNestedDataSource} from "@angular/material/tree";
import {UrlStateService} from "../services/url-state.service";
import {SplitComponent} from "angular-split";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {NavigationEnd, Router} from "@angular/router";
import {EhldService} from "../services/ehld.service";
import {AnalysisService} from "../services/analysis.service";
import {IconService} from "../services/icon.service";
import {DatabaseObject} from "../model/graph/database-object.model";
import {isPathway} from "../services/utils";
import {DatabaseObjectService} from "../services/database-object.service";
import {toObservable} from "@angular/core/rxjs-interop";


@Component({
  selector: 'cr-event-hierarchy',
  templateUrl: './event-hierarchy.component.html',
  styleUrls: ['./event-hierarchy.component.scss'],
  standalone: false
})
@UntilDestroy()
export class EventHierarchyComponent implements AfterViewInit, OnDestroy {

  readonly pathwayId = model<string>();
  readonly split = input.required<SplitComponent>({alias: "eventSplit"});
  @ViewChild('treeControlButton', {read: ElementRef}) treeControlButton?: ElementRef;
  @ViewChild('eventIcon', {read: ElementRef}) eventIcon?: ElementRef<HTMLElement>;
  @ViewChild(MatTree) tree!: MatTree<Event, string>;


  private _SCROLL_SPEED = 50; // pixels per second
  private _ICON_PADDING = 16;
  private _ICON_MARGIN = 8 - 4; // Right margin + Left margin
  private _GRADIENT_WIDTH = 10;
  private _EXPAND_ICON_MARGIN = 8;
  private _NAME_TAG_PADDING = 8;
  private _ignore = false; // ignore the changes from the tree
  private _isInitialLoad = true; // skip the first load
  private _TOP = 'TopLevelPathway'


  childrenAccessor = (node: Event): Event[] => {
    if (isPathway(node) && Array.isArray(node.events)) {
      return node.events.map(e => e.element);
    }
    return [];
  };


  treeDataSource = new MatTreeNestedDataSource<Event>();

  breadcrumbs: Event[] = [];
  scrollTimeout: undefined | ReturnType<typeof setTimeout>;
  selectedIdFromUrl?: string;
  selectedTreeEvent?: Event;
  selectedObj?: DatabaseObject;
  lastSpecieId?: string;


  constructor(protected eventService: EventService,
              private speciesService: SpeciesService,
              public state: UrlStateService,
              private el: ElementRef,
              private router: Router,
              private ehldService: EhldService,
              private analysis: AnalysisService,
              private iconService: IconService,
              private dboService: DatabaseObjectService) {
    effect(() => {

      const currentSpecieId = this.speciesService.currentSpecies().taxId;

      if (currentSpecieId === this.lastSpecieId) return;

      this.lastSpecieId = currentSpecieId;

      this.buildInitialTreeWithTlps(this.speciesService.currentSpecies().taxId);
    });
  }

  //TODO check how species ignore is important
  selecting = combineLatest({
    select: toObservable(this.state.select),
    pathwayId: toObservable(this.pathwayId),
  }).pipe(
    tap(({select, pathwayId}) => this.selectedIdFromUrl = select!),
    //todo: revisit here to check the logic
    filter(() => !this._ignore
        && !this._isInitialLoad
      // && !this.speciesService.getIgnore()
    ),// Ignore the changes from Tree itself , first load and species changes
    // debounceTime(200), // todo: needs improvement to avoid use debounceTime; Wait the new diagramId to arrive when double click pathway on EHLD.
    switchMap(({select, pathwayId}) => {
      const idToUse = select ? select : pathwayId;
      return idToUse
        ? this.dboService.fetchEnhancedEntry<SelectableObject>(idToUse).pipe(map(enhancedEvent => ({
          idToUse,
          enhancedEvent
        })))
        : of({idToUse, enhancedEvent: undefined});
    }),
    switchMap(({idToUse, enhancedEvent}) => {
      const token = this.analysis.result()?.summary.token;
      if (!token) {
        return of({idToUse, enhancedEvent, hitReactions: []}); // Return empty hitReactions if there is no token
      }
      // Fetch hit reactions using token and pathway ID
      return this.analysis.getHitReactions(this.pathwayId()!, token).pipe(
        map(hitReactions => ({idToUse, enhancedEvent, hitReactions}))
      );
    }),
    switchMap(({idToUse, enhancedEvent, hitReactions}) => {
      return this.eventService.adjustTreeFromUrlSelectUpdate(enhancedEvent, this.pathwayId(), this.tree, hitReactions);
    }),
    untilDestroyed(this),
  ).subscribe(() => {
    if (this.selectedIdFromUrl) this.scrollToSelection(this.selectedIdFromUrl);
  });


  analysing = toObservable(this.state.analysis).pipe(
    combineLatestWith(toObservable(this.pathwayId)),
    switchMap(([token, pathwayId]) => {
      if (!pathwayId || !token) return of({hitReactions: []});
      return this.analysis.getHitReactions(pathwayId, token).pipe(
        map(hitReactions => ({hitReactions}))
      );
    })
  ).subscribe(({hitReactions}) => {
    this.eventService.addAnalysisTag(this.treeDataSource.data, this.analysis.result());

    // TODO add hit reactions on all opened pathways, not just current one + Make sure it gets updated upon selection / opening of a new pathway
    if (this.selectedTreeEvent && isPathway(this.selectedTreeEvent)) {
      this.eventService.addHitReactions(this.selectedTreeEvent.events?.map(e => e.element), hitReactions);
    }

  });

  ngAfterViewInit(): void {

    setTimeout(() => {
      this._isInitialLoad = false; // Allow future changes to be processed after first load
    }, 100);

    this.eventService.treeData$.pipe(untilDestroyed(this)).subscribe(events => {
      // @ts-ignore
      // Mat tree has a bug causing children to not be rendered in the UI without first setting the data to null
      // This is a workaround to add child data to tree and update the view. see details: https://github.com/angular/components/issues/11381
      this.treeDataSource.data = []; //todo: check performance issue
      this.treeDataSource.data = events;
      this.adjustWidths();
    });

    this.eventService.selectedTreeEvent$.pipe(untilDestroyed(this)).subscribe(event => {
      this.selectedTreeEvent = event;
    });

    this.dboService.selectedObj$.pipe(untilDestroyed(this)).subscribe(event => {
      this.selectedObj = event;
    });

    this.eventService.breadcrumbs$.pipe(untilDestroyed(this)).subscribe(events => {
      this.breadcrumbs = events;
    });

    this.split().dragProgress$.pipe(untilDestroyed(this)).subscribe(data => {
      this.adjustWidths();
    });

    fromEvent(window, 'resize').pipe(untilDestroyed(this)).subscribe(() => {
      this.adjustWidths();
    });

  }

  buildInitialTreeWithTlps(taxId: string): void {
    const idToUse = this.selectedIdFromUrl ? this.selectedIdFromUrl : this.pathwayId();
    // Fetch and prepare initial data
    const initialData$ = this.eventService.fetchTlpsBySpecies(taxId).pipe(
      tap(allTLPs => this.eventService.setTreeData(allTLPs)), // Set initial tree data
      map(initialTreeData => ({initialTreeData})) // Wrap in an object for accumulation
    );

    // Conditionally fetch or reuse enhanced event data
    const enhancedEventData$: Observable<{
      enhancedEvent: SelectableObject | undefined
    }> = this.eventService.diagramPathway$.pipe(
      take(1),
      switchMap(diagramPathway => {
        if (!idToUse) return of({enhancedEvent: undefined});
        if (diagramPathway && diagramPathway.stId === idToUse) {
          return of({enhancedEvent: diagramPathway});
        } else {
          return this.dboService.fetchEnhancedEntry<SelectableObject>(idToUse).pipe(
            map(enhancedEvent => ({enhancedEvent}))
          )
        }
      })
    )

    // Fetch EHLD and color data
    const ehldAndSubpathwayColors$ =
      this.ehldService.hasEHLD()
        ? of({hasEHLD: true, colors: undefined}) // If EHLD exists, no colors needed
        : this.eventService.subpathwayColors$.pipe(
          take(1),
          map(colors => ({hasEHLD: false, colors}))
        );

    // Fetch analysis result

    // Fetch reactions based on token and pathway ID
    const hitReactions$ =
      !this.state.analysis() || !this.pathwayId() ?
        of({hitReactions: []}) : // Return empty if no token
        this.analysis.getHitReactions(this.pathwayId()!, this.state.analysis()!).pipe(
          map(hitReactions => ({hitReactions}))
        );

    // Combine all data and merged into one object
    initialData$.pipe(
      tap(d => console.log('Initial data', d)),
      switchMap(initialData =>
        enhancedEventData$.pipe(
          combineLatestWith(
            ehldAndSubpathwayColors$,
            hitReactions$
          ),
          map(([enhancedEvent, ehldAndColors, hitReactions]) => ({
            ...initialData,
            ...enhancedEvent,
            ...ehldAndColors,
            ...hitReactions
          }))
        )
      ),
      tap(d => console.log('Combined data', d)),

      // Build the tree with all data
      switchMap(({
                   enhancedEvent,
                   hitReactions
                 }) => this.eventService.buildTree(enhancedEvent, this.pathwayId(), this.tree, hitReactions)),
      tap(d => console.log('Final data', d)),
    ).subscribe({
      next: () => {
        // Give pathway id when idToUse is PEs
        const targetId = idToUse || this.pathwayId();
        if (targetId) {
          this.scrollToSelection(targetId);
        }
      },
      error: (err: Error) => {
        console.error(err, err.stack)
        throw err;
      }
    });
  }

  // if a leaf node has sibling which is a root node
  hasRootSiblingForLeafNode(event: Event): boolean {
    if (!event.ancestors || event.ancestors.length === 0 || !event.parent) {
      return false;
    }
    const parent = event.parent;
    if (isPathway(parent) && parent.events) {
      return parent.events.some(sibling => sibling.element !== event && this.eventService.eventHasChild(sibling.element));
    }
    return false;
  }


  ngOnDestroy(): void {
    clearTimeout(this.scrollTimeout);
  }


  onTreeEventSelect(treeEvent: Event) {
    this.handleSelectionFromTree(treeEvent);
  }


  onBreadcrumbSelect(navEvent: Event) {
    this.handleSelectionFromTree(navEvent);
  }


  private handleSelectionFromTree(event: Event) {
    this.clearAllSelectedEvents(this.treeDataSource.data);
    this.selectAllParents(event, this.treeDataSource.data);
    this.loadEvents(event);
    this.updateBreadcrumbs(event);
    this.setDiagramId(event);
    this.navigateToPathway(event);
  }


  private loadEvents(treeEvent: Event) {
    // Collapse all events when selecting any tlps
    // if (treeEvent.schemaClass === this._TOP) {
    //   this.tree.collapseAll();
    // }

    treeEvent.isSelected = true;

    if (isPathway(treeEvent)) {
      this.eventService.loadEventData(treeEvent);
    } else {
      this.dboService.fetchEnhancedEntry<Event>(treeEvent.parent.stId).pipe(untilDestroyed(this)).subscribe(result => {
        this.dboService.setCurrentObj(result);
      })
    }
  }


  private selectAllParents(selectedEvent: Event, events: Event[]) {
    events.forEach(event => {
      event.isSelected = selectedEvent.ancestors?.some((parent: Event) => parent.stId === event.stId) || false;
      if (isPathway(event) && event.events) {
        this.selectAllParents(selectedEvent, event.events?.map(e => e.element));
      }
    });
  }

  // todo: only clear selected tree event for better performance
  private clearAllSelectedEvents(events: Event[]) {
    events.forEach(event => {
      event.isSelected = false;
      if (isPathway(event) && event.events) {
        this.clearAllSelectedEvents(event.events?.map(e => e.element));
      }
    });
  }

  private updateBreadcrumbs(event: Event) {
    if (event.schemaClass === this._TOP) {
      // If the event is a 'TopLevelPathway', set breadcrumbs to an empty array
      return this.eventService.setBreadcrumbs([event]);
    }

    //todo: temporary fix for getting correct ancestors,
    // the ideal way to get ancestors is by assigning the ancestors to the object

    const ancestors = this.eventService.getAncestors(this.treeDataSource.data, event.stId)
    if (ancestors) {
      return this.eventService.setBreadcrumbs(ancestors);
    }

  }


  private setDiagramId(event: Event): void {
    // Pathway
    if (isPathway(event) && event.hasDiagram) {
      this.pathwayId.set(event.stId);
    } else {
      // Subpathway and reaction
      const parentWithDiagram = this.eventService.getPathwayWithDiagram(event);
      this.pathwayId.set(parentWithDiagram!.stId);
    }
  }


  private navigateToPathway(treeEvent: Event): void {

    const ancestors = treeEvent.ancestors ? treeEvent.ancestors : [];
    const diagramId = this.pathwayId();
    this.eventService.setPath(diagramId, ancestors);
    // Determine if we should include the selectedEventId in the URL
    const selectedEventId = isPathway(treeEvent) && treeEvent.hasDiagram ? null : treeEvent.stId;
    this._ignore = true;
    // this.speciesService.setIgnore(true);
    this.router.navigate([diagramId], {
      queryParamsHandling: "preserve" // Keep existing query params
    }).then(() => {
      this.state.select.set(selectedEventId);
      this.eventService.setCurrentTreeEvent(treeEvent);
      // Listen for NavigationEnd event to reset _ignore
      this.router.events.pipe(
        filter(routerEvent => routerEvent instanceof NavigationEnd),
        take(1) // Take the first NavigationEnd event and unsubscribe automatically
      ).subscribe(() => {
        this._ignore = false;
        // this.speciesService.setIgnore(false);
      });

    }).catch(err => {
      throw new Error('Navigation error:', err);
    });
  }

  trackById(index: number, event: Event): string {
    return event.stId;
  }

  getIcon(obj: Event) {
    return this.iconService.getIconDetails(obj);
  }

  /**
   * Adjust widths when loading mat tree data at the initialization.
   */
  adjustWidths() {
    const treeNodes = this.el.nativeElement.querySelectorAll('.tree-node');
    treeNodes.forEach((node: HTMLElement) => {
      this.adjustWidth(node);
    });
  }

  adjustWidth(node: HTMLElement) {
    this.calculateAndSetWidth(node)
  }

  getLeftDivElWidth(node: HTMLElement) {
    return this.calculateAndSetWidth(node);
  }


  private calculateAndSetWidth(node: HTMLElement): number {
    const right = node.querySelector('.right') as HTMLElement;
    const parentWidth = node.clientWidth; // inner width of mat tree node in pixels
    const rightWidth = right.offsetWidth;
    return parentWidth - rightWidth;
    // return 0;
  }


  onTagHover(event: Event) {
    if (event.isSelected || (this.tree.isExpanded(event) && isPathway(event))) return;
    event.isHovered = true
  }

  onTagHoverLeave(event: Event) {
    event.isHovered = false;
  }


  onNameHover($event: MouseEvent, event: Event) {
    const targetParentNode = ($event.target as HTMLElement).closest('.tree-node') as HTMLElement;
    const leftDivWidth = this.getLeftDivElWidth(targetParentNode);
    const nameElement = $event.target as HTMLElement;
    const contentWidth = this.calculateContentWidth(nameElement, event);
    // Allow animation if this element has been scrolling before
    nameElement.classList.remove('no-transition');
    // Check if there is space between the left and content span
    if (contentWidth > leftDivWidth) {
      let distanceToScroll = contentWidth - leftDivWidth;
      this.setScrollStyles(nameElement, distanceToScroll);
    }
  }


  private calculateContentWidth(targetElement: HTMLElement, event: Event): number {
    const iconWidth = this.eventIcon?.nativeElement.getBoundingClientRect().width || 18 + this._ICON_PADDING + this._ICON_MARGIN; // width and padding
    const treeControlButtonWidth = this.treeControlButton?.nativeElement.getBoundingClientRect().width || 20 + this._EXPAND_ICON_MARGIN;
    const baseWidth = targetElement.offsetWidth + iconWidth + this._GRADIENT_WIDTH + 2 * this._NAME_TAG_PADDING;
    return this.eventService.eventHasChild(event) ? baseWidth + treeControlButtonWidth : baseWidth;
  }

  private setScrollStyles(targetElement: HTMLElement, distanceToScroll: number): void {
    // Calculate the transition duration based on the distance and the constant speed
    const duration = distanceToScroll / this._SCROLL_SPEED;
    targetElement.style.transition = `left ${duration}s linear`;
    // Set the distance to scroll
    targetElement.style.left = `-${distanceToScroll}px`;
  }

  onNameHoverLeave($event: MouseEvent, event: Event) {
    const nameElement = $event.target as HTMLElement;
    nameElement.style.left = '0'; // Reset position
  }


  onScroll($event: WheelEvent) {
    const nameElement = $event.target as HTMLElement;
    this.onScrollStart(nameElement);

    clearTimeout(this.scrollTimeout);

    this.scrollTimeout = setTimeout(() => {
      this.onScrollStop(nameElement);
    }, 500); // Debounce time
  }

  /**
   * Intelligently scrolls to show the selected element(s) in the tree.
   * Attempts to show the full selection context (all breadcrumbs) if it fits in viewport,
   * otherwise prioritizes showing the target element.
   */
  private scrollToSelection(targetId: string): void {
    const targetElement = document.querySelector(`[st-id='${targetId}']`);
    if (!targetElement) return;

    const fallbackScroll = () => targetElement.scrollIntoView({behavior: 'smooth', block: 'nearest'});

    // If no breadcrumbs or only one item, use simple scroll
    if (!this.breadcrumbs || this.breadcrumbs.length <= 1) {
      fallbackScroll();
      return;
    }

    // Get breadcrumb elements
    const firstBreadcrumb = document.querySelector(`[st-id='${this.breadcrumbs[0].stId}'] > .tree-node`);
    const lastBreadcrumb = document.querySelector(`[st-id='${this.breadcrumbs[this.breadcrumbs.length - 1].stId}'] > .tree-node`);
    const treeContainer = document.getElementById('events-container');

    if (!firstBreadcrumb || !lastBreadcrumb || !treeContainer) {
      fallbackScroll();
      return;
    }

    // Calculate positions and visibility
    const firstRect = firstBreadcrumb.getBoundingClientRect();
    const lastRect = lastBreadcrumb.getBoundingClientRect();
    const containerRect = treeContainer.getBoundingClientRect();

    const isElementVisible = (rect: DOMRect) =>
      rect.top >= containerRect.top && rect.bottom <= containerRect.bottom;

    const firstIsVisible = isElementVisible(firstRect);
    const lastIsVisible = isElementVisible(lastRect);
    const selectionHeight = lastRect.bottom - firstRect.top;
    const selectionFitsInViewport = selectionHeight <= containerRect.height;

    // Decision logic
    if (selectionFitsInViewport) {
      // Full selection can fit - show it all if not already visible
      if (!firstIsVisible || !lastIsVisible) {
        firstBreadcrumb.scrollIntoView({behavior: 'smooth', block: 'start'});
      }
    } else {
      // Selection too large - just ensure target is visible
      targetElement.scrollIntoView({behavior: 'smooth', block: 'end'});
    }
  }


  /**
   * Not working with mat tree node
   */
  // private initializeScrollEvent(): void {
  //   this.scrollSubscription = fromEvent(this.displayNameDiv.nativeElement, 'scroll').pipe(
  //     tap(() => this.onScrollStart(this.displayNameDiv.nativeElement)),
  //     debounceTime(200)
  //   ).subscribe(() => {
  //     this.onScrollStop(this.displayNameDiv.nativeElement)
  //   });
  // }

  private onScrollStart(el: HTMLElement): void {
    // Need to make it scrollable to enable the scrolling
    const labelSpan = el.closest('.mdc-button__label') as HTMLElement;
    labelSpan.classList.add('add-overflowX');
    el.classList.add('no-transition');
  }

  private onScrollStop(el: HTMLElement): void {
    const labelSpan = el.closest('.mdc-button__label') as HTMLElement;
    labelSpan.classList.remove('add-overflowX');
    el.classList.remove('no-transition');
  }
}
