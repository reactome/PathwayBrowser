import {AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild} from '@angular/core';
import {Event} from "../model/event.model";
import {EventService} from "../services/event.service";
import {SpeciesService} from "../services/species.service";
import {combineLatestWith, debounceTime, filter, fromEvent, map, of, switchMap, take, tap} from "rxjs";
import {MatTree, MatTreeNestedDataSource} from "@angular/material/tree";
import {DiagramStateService} from "../services/diagram-state.service";
import {SplitComponent} from "angular-split";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {NavigationEnd, Router} from "@angular/router";
import {EhldService} from "../services/ehld.service";


@Component({
  selector: 'cr-event-hierarchy',
  templateUrl: './event-hierarchy.component.html',
  styleUrls: ['./event-hierarchy.component.scss']
})
@UntilDestroy()
export class EventHierarchyComponent implements AfterViewInit, OnDestroy {

  @Input('id') diagramId: string = '';
  @Input('eventSplit') split!: SplitComponent;
  @ViewChild('treeControlButton', {read: ElementRef}) treeControlButton!: ElementRef;
  @ViewChild('eventIcon', {read: ElementRef}) eventIcon!: ElementRef;
  @ViewChild(MatTree) tree!: MatTree<Event, string>;


  private _SCROLL_SPEED = 50; // pixels per second
  private _ICON_PADDING = 16;
  private _GRADIENT_WIDTH = 10;
  private _ignore = false; // ignore the changes from the tree
  private _isInitialLoad = true; // skip the first load
  private _TOP = 'TopLevelPathway'

  childrenAccessor = (node: Event) => node.hasEvent ?? [];

  treeDataSource = new MatTreeNestedDataSource<Event>();

  breadcrumbs: Event[] = [];
  scrollTimeout: undefined | ReturnType<typeof setTimeout>;
  selectedIdFromUrl = '';
  selectedTreeEvent!: Event;
  selectedObj!: Event;
  subpathwayColors: Map<number, string> | undefined = undefined;
  ancestors: Event[] = [];


  constructor(protected eventService: EventService, private speciesService: SpeciesService, private state: DiagramStateService, private el: ElementRef, private router: Router, private ehldService: EhldService,) {
  }

  selecting = this.state.onChange.select$.pipe(
    tap(value => this.selectedIdFromUrl = value),
    //todo: revisit here to check the logic
    filter(value => !this._ignore && !this._isInitialLoad && !this.speciesService.getIgnore()),// Ignore the changes from Tree itself , first load and species changes
    debounceTime(200), // todo: needs improvement to avoid use debounceTime; Wait the new diagramId to arrive when double click pathway on EHLD.
    switchMap(id => {
      const idToUse = id ? id : this.diagramId;
      return this.eventService.fetchEnhancedEventData(idToUse)
    }),
    switchMap((enhancedEvent) => {
      return this.eventService.adjustTreeFromDiagramSelection(enhancedEvent, this.diagramId, this.subpathwayColors, this.tree, this.treeDataSource.data);
    }),
    untilDestroyed(this),
  ).subscribe((e) => {
    document.querySelector(`[st-id='${this.selectedIdFromUrl}']`)?.scrollIntoView({behavior: 'smooth'});
  });

  ngAfterViewInit(): void {

    setTimeout(() => {
      this._isInitialLoad = false; // Allow future changes to be processed after first load
    }, 100);

    this.speciesService.currentSpecies$.pipe(untilDestroyed(this)).subscribe(species => {
      const taxId = species ? species.taxId : '9606';
      this.buildInitialTreeWithTlps(taxId);
    });

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

    this.eventService.selectedObj$.pipe(untilDestroyed(this)).subscribe(event => {
      this.selectedObj = event;
    });

    this.eventService.breadcrumbs$.pipe(untilDestroyed(this)).subscribe(events => {
      this.breadcrumbs = events;
    });

    this.split.dragProgress$.pipe(untilDestroyed(this)).subscribe(data => {
      this.adjustWidths();
    });

    fromEvent(window, 'resize').pipe(untilDestroyed(this)).subscribe(() => {
      this.adjustWidths();
    });

    this.eventService.subpathwaysColors$.pipe(
      untilDestroyed(this),
      filter(colors => colors !== undefined)).subscribe(colors => {
        this.subpathwayColors = colors;
      })
  }

  buildInitialTreeWithTlps(taxId: string): void {
    const idToUse = this.selectedIdFromUrl ? this.selectedIdFromUrl : this.diagramId;
    this.eventService.fetchTlpsBySpecies(taxId).pipe(
      tap(allTLPs => this.eventService.setTreeData(allTLPs)), // All TLPs as initial tree data
      switchMap((treeData) =>
        this.eventService.fetchEnhancedEventData(idToUse).pipe(
          combineLatestWith(
            // EHLD flag here is for expanding tree children when tree node is a pathway in EHLD viewer from the frist load, for instance: /R-HSA-9612973?select=R-HSA-1632852
            this.ehldService.hasEHLD$.pipe(
              take(1),
              switchMap(hasEHLD => !hasEHLD
                ? this.eventService.subpathwaysColors$.pipe(
                  take(1),
                  map(colors => ({hasEHLD, colors}))
                )
                : of({hasEHLD, colors: undefined})
              )
            )
          ),
          map(([enhancedEvent, {hasEHLD, colors}]) => {
            return {enhancedEvent, colors, hasEHLD, treeData};
          })
        )
      ),
      switchMap(({enhancedEvent, treeData, colors, hasEHLD}) => this.eventService.buildTree(enhancedEvent, this.diagramId, this.tree, this.subpathwayColors, hasEHLD))
    ).subscribe(() => {
      document.querySelector(`[st-id='${idToUse}']`)?.scrollIntoView({behavior: 'smooth'});
    });
  }

  // if a leaf node has sibling which is a root node
  hasRootSiblingForLeafNode(event: Event): boolean {
    if (!event.ancestors || event.ancestors.length === 0) {
      return false;
    }
    const parent = event.parent;
    return !!parent.hasEvent && parent.hasEvent.some(sibling => sibling !== event && this.eventService.eventHasChild(sibling));
  }


  ngOnDestroy(): void {
    clearTimeout(this.scrollTimeout);
  }

  onTreeEventSelect(treeEvent: Event) {
    const isTLP = treeEvent.schemaClass === this._TOP;
    const hasChild = this.eventService.eventHasChild(treeEvent);
    // Toggle isSelected property if it has children for pathway
    //event.isSelected = hasChild && !isTLP ? !event.isSelected : true;
    const isSelected = !treeEvent.isSelected;
    this.handleTreeEventSelection(treeEvent, isSelected);
  }

  private handleTreeEventSelection(event: Event, isSelected: boolean) {
    if (isSelected) {
      this.handleSelectionFromTree(event);
    } else {
      this.handleDeselectionFromTree(event);
    }
  }

  onBreadcrumbSelect(navEvent: Event) {
    this.clearAllSelectedEvents(this.treeDataSource.data);
    this.selectAllParents(navEvent, this.treeDataSource.data);
    navEvent.isSelected = true;
    // Collapse all descendant nodes except the selected path if it has child events
    this.tree.collapseDescendants(navEvent);
    // Expand the path to the selected event
    this.tree.expand(navEvent);
    this.updateBreadcrumbs(navEvent);

    this.setDiagramId(navEvent);
    const selectedEventId = this.eventService.eventHasChild(navEvent) && navEvent.hasDiagram ? '' : navEvent.stId;
    this._ignore = true;
    this.state.set('select', selectedEventId);
    this._ignore = false;

    const ancestors = navEvent.ancestors ? navEvent.ancestors : [];
    this.eventService.setPath(this.diagramId, ancestors);

    this.eventService.fetchEnhancedEventData(navEvent.stId).pipe(untilDestroyed(this)).subscribe(result => {
      this.eventService.setCurrentEventAndObj(navEvent, result);
    })

  }


  private handleSelectionFromTree(event: Event) {
    // First click
    this.clearAllSelectedEvents(this.treeDataSource.data);
    this.selectAllParents(event, this.treeDataSource.data);
    this.toggleEventExpansion(event, true);
    this.updateBreadcrumbs(event);
    this.setDiagramId(event);
    this.navigateToPathway(event);
  }


  private handleDeselectionFromTree(event: Event) {
    // Second click (deselect)

    // Disable unselected status for TLP for having a selected obj in details panel
    if (event.schemaClass === this._TOP) return;

    //Disable unselected status for reaction
    if (!event.hasEvent) return;

    this.selectAllParents(event, this.treeDataSource.data);
    this.toggleEventExpansion(event, false);
    this.updateBreadcrumbsForEventDeselection(event);
    this.handlePathwayNavigationOnDeselection(event);
  }

  private toggleEventExpansion(event: Event, isSelected: boolean) {
    // Collapse all events when selecting any tlps
    if (event.schemaClass === this._TOP) {
      this.tree.collapseAll();
    }

    if (isSelected) {
      event.isSelected = true;
      this.eventService.loadEventChildren(event);
      this.tree.toggle(event);
    } else {
      event.isSelected = false;
      this.tree.toggle(event);
      this.tree.collapseDescendants(event);
      this.eventService.fetchEnhancedEventData(event.parent.stId).pipe(untilDestroyed(this)).subscribe(result => {
        this.eventService.setCurrentObj(result);
      })
    }

    this.eventService.collapseSiblingEvent(event, this.tree);
  }


  private selectAllParents(selectedEvent: Event, events: Event[]) {
    events.forEach(event => {
      event.isSelected = selectedEvent.ancestors?.some(parent => parent.stId === event.stId) || false;
      if (event.hasEvent) {
        this.selectAllParents(selectedEvent, event.hasEvent);
      }
    });
  }

  private clearAllSelectedEvents(events: Event[]) {
    events.forEach(event => {
      event.isSelected = false;
      if (event.hasEvent) {
        this.clearAllSelectedEvents(event.hasEvent);
      }
    });
  }

  private updateBreadcrumbs(event: Event) {
    if (event.schemaClass === this._TOP) {
      // If the event is a 'TopLevelPathway', set breadcrumbs to an empty array
      this.eventService.setBreadcrumbs([event]);
    } else if (event.ancestors) {
      // Set breadcrumbs including the event and its parents
      this.eventService.setBreadcrumbs([...(event.ancestors), event]);
    }
  }

  private updateBreadcrumbsForEventDeselection(event: Event) {
    if (event.schemaClass === this._TOP) {
      this.eventService.setBreadcrumbs([]);
    } else if (event.ancestors?.length) {
      // Update breadcrumb based on the last parent in the parents
      this.updateBreadcrumbs(event.ancestors[event.ancestors.length - 1]);
    }
  }

  private handlePathwayNavigationOnDeselection(event: Event) {
    // pathway and subpathway
    if (this.eventService.eventHasChild(event)) {
      if (event.schemaClass !== this._TOP) {
        const eventParent = event.parent;
        const parentWithDiagram = this.eventService.getPathwayWithDiagram(event);
        this.diagramId = parentWithDiagram!.stId;
        this.navigateToPathway(eventParent);
      } else {
        this.diagramId = event.stId;
        this.navigateToPathway(event);
      }
    }
  }

  private setDiagramId(event: Event): void {
    // Pathway
    if (this.eventService.eventHasChild(event) && event.hasDiagram) {
      this.diagramId = event.stId;
    } else {
      // Subpathway and reaction
      const parentWithDiagram = this.eventService.getPathwayWithDiagram(event);
      this.diagramId = parentWithDiagram!.stId;
    }
  }


  private navigateToPathway(treeEvent: Event): void {

    const ancestors = treeEvent.ancestors ? treeEvent.ancestors : [];
    this.eventService.setPath(this.diagramId, ancestors);
    // Determine if we should include the selectedEventId in the URL
    const selectedEventId = this.eventService.eventHasChild(treeEvent) && treeEvent.hasDiagram ? '' : treeEvent.stId;
    this._ignore = true;
    this.speciesService.setIgnore(true);
    this.router.navigate(['PathwayBrowser', this.diagramId], {
      queryParamsHandling: "preserve" // Keep existing query params
    }).then(() => {
      this.state.set('select', selectedEventId);
      this.eventService.setCurrentTreeEvent(treeEvent);
      // Listen for NavigationEnd event to reset _ignore
      this.router.events.pipe(
        filter(routerEvent => routerEvent instanceof NavigationEnd),
        take(1) // Take the first NavigationEnd event and unsubscribe automatically
      ).subscribe(() => {
        this._ignore = false;
        this.speciesService.setIgnore(false);
      });

    }).catch(err => {
      throw new Error('Navigation error:', err);
    });
  }

  trackById(index: number, event: Event): string {
    return event.stId;
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
    const left = node.querySelector('.left') as HTMLElement;
    const hasEvents = left.children.length > 1;
    this.calculateAndSetWidth(node, hasEvents)

  }

  getLeftDivElWidth(node: HTMLElement, event: Event) {
    const hasEvents = this.eventService.eventHasChild(event);
    return this.calculateAndSetWidth(node, hasEvents);
  }


  private calculateAndSetWidth(node: HTMLElement, hasEvents: boolean): number {
    const right = node.querySelector('.right') as HTMLElement;
    const parentWidth = node.clientWidth; // inner width of mat tree node in pixels
    const rightWidth = hasEvents ? right.offsetWidth : right.offsetWidth + this._GRADIENT_WIDTH; // 10 is the width of the gradient
    return parentWidth - rightWidth;
    // return 0;
  }


  onTagHover(event: Event) {
    if (event.isSelected || (this.tree.isExpanded(event) && event.hasEvent)) return;
    event.isHovered = true
  }

  onTagHoverLeave(event: Event) {
    event.isHovered = false;
  }


  onNameHover($event: MouseEvent, event: Event) {
    const targetParentNode = ($event.target as HTMLElement).closest('.tree-node') as HTMLElement;
    const leftDivWidth = this.getLeftDivElWidth(targetParentNode, event);
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
    const iconWidth = this.eventIcon.nativeElement.getBoundingClientRect().width + this._ICON_PADDING; // width and padding
    const treeControlButtonWidth = this.treeControlButton.nativeElement.getBoundingClientRect().width;
    const baseWidth = targetElement.offsetWidth + iconWidth;
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


  onScroll($event: WheelEvent, node: Event) {
    const nameElement = $event.target as HTMLElement;
    this.onScrollStart(nameElement);

    clearTimeout(this.scrollTimeout);

    this.scrollTimeout = setTimeout(() => {
      this.onScrollStop(nameElement);
    }, 500); // Debounce time
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
