import {Injectable} from '@angular/core';
import {CONTENT_SERVICE, environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {
  BehaviorSubject,
  concatMap,
  EMPTY,
  filter,
  from,
  last,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  take,
  tap
} from "rxjs";
import {UrlStateService} from "./url-state.service";
import {Event} from "../model/graph/event/event.model";
import {MatTree} from "@angular/material/tree";
import {Analysis} from "../model/analysis.model";
import {AnalysisService} from "./analysis.service";
import {EhldService} from "./ehld.service";
import {TopLevelPathway} from "../model/graph/event/top-level-pathway.model";
import {DatabaseObject} from "../model/graph/database-object.model";
import {isDefined, isPathway, isPhysicalEntity, isRLE} from "./utils";
import {DatabaseObjectService} from "./database-object.service";
import {PhysicalEntity} from "../model/graph/physical-entity/physical-entity.model";
import {Relationship} from "../model/graph/relationship.model";
import {toObservable} from "@angular/core/rxjs-interop";
import {Pathway} from "../model/graph/event/pathway.model";
import HasEvent = Relationship.HasEvent;
import {SummaryEntity} from "../model/graph/physical-entity/summary-entity.model";


export type SelectableObject = Event | PhysicalEntity | SummaryEntity;

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private readonly _TOP_LEVEL_PATHWAYS = `${CONTENT_SERVICE}/data/pathways/top/`;
  private readonly _ANCESTORS = `${CONTENT_SERVICE}/data/event/`;

  treeData$: BehaviorSubject<Event[]> = new BehaviorSubject<Event[]>([]);

  private _selectedTreeEvent: Subject<Event> = new Subject<Event>();
  public selectedTreeEvent$ = this._selectedTreeEvent.asObservable();


  private _breadcrumbsSubject = new Subject<Event[]>();
  breadcrumbs$ = this._breadcrumbsSubject.asObservable();

  private _subpathwayColors = new BehaviorSubject<Map<number, string> | undefined>(undefined);
  subpathwayColors$ = this._subpathwayColors.asObservable();
  subpathwayColors?: Map<number, string>;

  // Todo replace with dataState.currentPathway()
  private _diagramPathway = new BehaviorSubject<Pathway | undefined>(undefined);
  diagramPathway$ = this._diagramPathway.asObservable();
  diagramPathway?: Pathway;

  constructor(private http: HttpClient,
              private state: UrlStateService,
              private analysisService: AnalysisService,
              private ehldService: EhldService,
              private dboService: DatabaseObjectService,) {
  }

  setTreeData(events: Event[]) {
    this.treeData$.next(events);
  }

  setCurrentTreeEvent(event: Event) {
    this._selectedTreeEvent.next(event);
  }


  setCurrentEventAndObj(event: Event, obj: SelectableObject) {
    this.setCurrentTreeEvent(event);
    this.dboService.setCurrentObj(obj);
  }

  setBreadcrumbs(events: Event[]) {
    this._breadcrumbsSubject.next(events);
  }

  setSubpathwayColors(colorMap: Map<number, string> | undefined) {
    this.subpathwayColors = colorMap;
    this._subpathwayColors.next(colorMap);
  }

  setDiagramPathway(pathway: Pathway) {
    this.diagramPathway = pathway;
    this._diagramPathway.next(pathway);
  }

  fetchTlpsBySpecies(taxId: string): Observable<TopLevelPathway[]> {
    let url = `${this._TOP_LEVEL_PATHWAYS}${taxId}`;
    return this.http.get<TopLevelPathway[]>(url);
  }


  fetchEventAncestors(stId: string): Observable<Pathway[][]> {
    let url = `${this._ANCESTORS}${stId}/ancestors`;
    return this.http.get<Pathway[][]>(url).pipe(map(ancestorsOptions => ancestorsOptions.map(ancestorsOption => ancestorsOption.reverse())))
  }

  loadEventData(event: Event) {
    this.fetchEventChildren(event).pipe(
      switchMap(dbo => {
        // If hasDiagram is true, wait for the latest color map from subpathwaysColors$
        if (isPathway(dbo) && dbo.hasDiagram && !dbo.hasEHLD) {
          return this.subpathwayColors$.pipe(
            map(colors => ({dbo: dbo, treeEvent: event, colors})),
          );
        } else {
          // If hasDiagram is false, color is undefined. for instance: /R-HSA-9612973/R-HSA-1632852
          return of({dbo: dbo, treeEvent: event, colors: undefined});
        }
      }),
      switchMap(({dbo, treeEvent, colors}) => {
        const token = this.analysisService.result()?.summary.token;
        if (!token) {
          return of({dbo, treeEvent, colors, hitReactions: []}); // Return empty hitReactions if token is missing
        }
        // Fetch hit reactions using token and pathway ID
        return this.analysisService.getHitReactions(dbo.stId, token).pipe(
          map(hitReactions => ({dbo, treeEvent, colors, hitReactions}))
        );
      }),
    ).subscribe(({dbo: dbo, treeEvent, colors, hitReactions}) => {
      if (colors && colors.size > 0) {
        this.setSubtreeColors(treeEvent, colors);
      }
      this.setCurrentEventAndObj(treeEvent, dbo);
      if (isPathway(dbo)) {
        this.addAnalysisTag(dbo.events?.map(e => e.element), this.analysisService.result());
        this.addHitReactions(dbo.events?.map(e => e.element), hitReactions);
      }
      this.setTreeData(this.treeData$.value);
    });
  }


  fetchEventChildren(tree: Event): Observable<Event> {
    return this.dboService.fetchEnhancedEntry<Event>(tree.stId).pipe(
      switchMap(result => {

        if (isPathway(result) && result.events && isPathway(tree)) {

          const treeAncestors = this.getAncestors(this.treeData$.value, tree.stId) || [];

          // Update the event structure with child relationships
          tree.events = result.events
            .map(child => {
              child.element.ancestors = [...treeAncestors, child.element];
              child.element.parent = tree;
              return child;
            });
          return of(result);
        } else {
          // If there are no events, return the original event
          return of(result);
        }
      })
    );
  }


  getAncestors(array: Event[] | null, stId: string): Event[] | null {
    if (!Array.isArray(array)) return null;
    for (let i = 0; i < array.length; i++) {
      const node = array[i];

      if (node.stId === stId) {
        return [node]; // Node itself is part of the path
      }

      const children = isPathway(node) && Array.isArray(node.events) ? node.events.map(e => e.element) : [];
      const childPath: Event[] | null = this.getAncestors(children, stId);
      if (childPath !== null) {
        childPath.unshift(node); // Prepend current node to path, adds the specified elements to the beginning of an array
        return childPath;
      }
    }
    return null; // Not found in this branch
  }


  /** Adjust tree structure based on selection from diagram
   *
   *  Entity
   *  - No need to rebuild the tree, but requires to update the currentTreeEvent(diagram tree event) and currentObj (entity), selection and expandedTree status
   *
   *  Reaction
   *  - No need to rebuild the tree it is viable, if not we have to rebuild the tree to include it, update currentTreeEvent(Reaction) and currentObj (Reaction). selection and expandedTree status
   *
   *  Pathway
   *  - Subpathway, no need to build the tree, update currentTreeEvent(subpathway) and currentObj(subpathway)
   *  - Interacting pathway, rebuild the tree, clear previous selection, update currentTreeEvent(interacting pathway) and currentObj(interacting pathway), selection and expandedTree status
   *
   */
  adjustTreeFromUrlSelectUpdate(object: SelectableObject | undefined, diagramId: string | undefined, tree: MatTree<Event, string>, hitReactions: number[]): Observable<Event[]> {
    // All visible tree nodes
    const allVisibleTreeNodes = this.getAllVisibleTreeEvents(tree);

    if (!object) return this.handleNoSelectionFromUrlUpdate(allVisibleTreeNodes, tree);

    if (isPhysicalEntity(object)) {
      return this.handleEntitySelectionFromUrlUpdate(object, diagramId, allVisibleTreeNodes, tree);
    } else if (isRLE(object)) {
      return this.handleReactionSelectionFromUrlUpdate(object, diagramId, allVisibleTreeNodes, tree, hitReactions);
    } else if (isPathway(object)) {
      // tree.collapseAll(); //todo: should we collapse all?
      return this.handlePathwaySelectionFromUrlUpdate(object, diagramId, allVisibleTreeNodes, tree, allVisibleTreeNodes, hitReactions);
    } else {
      return from([this.treeData$.value])
    }
  }

  /**
   * Happens only on reacfoam as diagramId is considered as selection if it exists
   * @private
   */
  private handleNoSelectionFromUrlUpdate(visibleTreeNode: Event[], tree: MatTree<Event, string>): Observable<Event[]> {
    tree.collapseAll();
    this.clearAllSelectedEvents(visibleTreeNode);
    this.setBreadcrumbs([])
    return from([this.treeData$.value]);
  }

  private handleEntitySelectionFromUrlUpdate(event: PhysicalEntity, diagramId: string | undefined, allVisibleTreeNodes: Event[], tree: MatTree<Event, string>): Observable<Event[]> {
    const diagramTreeEvent = allVisibleTreeNodes.find(node => node.stId === diagramId);
    if (diagramTreeEvent) {
      return this.handleExistingEventSelection(diagramTreeEvent, diagramId, tree, allVisibleTreeNodes).pipe(
        map(([treeData, treeEvent]) => {
          this.setCurrentEventAndObj(diagramTreeEvent, event);
          return treeData;
        })
      );
    } else {
      return from([this.treeData$.value]);
    }
  }

  private handleReactionSelectionFromUrlUpdate(event: Event, diagramId: string | undefined, allVisibleTreeNodes: Event[], tree: MatTree<Event, string>, hitReactions: number[]): Observable<Event[]> {
    const treeNode = allVisibleTreeNodes.find(node => node.stId === event.stId);
    if (treeNode !== undefined) {
      return this.handleExistingEventSelection(treeNode, diagramId, tree, allVisibleTreeNodes).pipe(
        map(([treeData, treeNode]) => {
          this.updatePathwayIdIfSelectedReactionAbsentInCurrent(treeNode, diagramId, allVisibleTreeNodes, tree, hitReactions);
          this.setCurrentEventAndObj(treeNode, event);
          return treeData;
        })
      );
    } else {
      return this.buildTreeWithSelectedEvent(event, diagramId, false, tree, hitReactions).pipe(
        tap(() => this.updatePathwayIdIfSelectedReactionAbsentInCurrent(event, diagramId, allVisibleTreeNodes, tree, hitReactions)),
        tap(() => this.setCurrentEventAndObj(event, event)),
      );
    }
  }

  private updatePathwayIdIfSelectedReactionAbsentInCurrent(selectedReaction: Event, diagramId: string | undefined, allVisibleTreeNodes: Event[], tree: MatTree<Event, string>, hitReactions: number[]): void {
    const reactionDiagramStId = [...selectedReaction.ancestors].reverse().find(ancestor => isPathway(ancestor) && ancestor.hasDiagram)?.stId;
    const isReactionInCurrentDiagram =  diagramId === reactionDiagramStId || this.diagramPathway?.normalPathway?.stId === reactionDiagramStId;
    if (!isReactionInCurrentDiagram) {
      diagramId = this.getPathwayWithDiagram(selectedReaction)?.stId;
      if (diagramId) {
        this.state.pathwayId.set(diagramId);
        const ancestorIds = new Set(selectedReaction.ancestors.map(a => a.stId));
        allVisibleTreeNodes
          .filter(node => !ancestorIds.has(node.stId))
          .forEach(node => {
              node.isSelected = false
              tree.collapse(node);
            }
          )
        this.setBreadcrumbs(selectedReaction.ancestors);
      }
    }
  }

// Subpathway and interacting pathway
  private handlePathwaySelectionFromUrlUpdate(event: Event, diagramId: string | undefined, allVisibleTreeNodes: Event[], tree: MatTree<Event, string>, treeNodes: Event[], hitReactions: number[]): Observable<Event[]> {
    const treeNode = allVisibleTreeNodes.find(node => node.stId === event.stId);
    if (treeNode !== undefined) {
      // Subpathway, already in the tree view
      return this.handleExistingEventSelection(treeNode, diagramId, tree, allVisibleTreeNodes).pipe(
        map(([treeData, event]) => {
          this.setCurrentEventAndObj(event, event);
          this.loadEventData(treeNode)//todo: this.setCurrentEventAndObj(treeEvent, event)?
          return treeData;
        })
      );
    } else {
      // Interacting pathway, not visible in the tree view
      this.clearAllSelectedEvents(treeNodes);
      return this.buildTreeWithSelectedEvent(event, diagramId, false, tree, hitReactions);
    }
  }

  clearAllSelectedEvents(events: Event[]) {
    events?.forEach(event => {
      event.isSelected = false;
      if (isPathway(event)) {
        this.clearAllSelectedEvents(event.events?.map(e => e.element));
      }
    });
  }

  clearAllHitEvents(events: Event[]) {
    events?.forEach(event => {
      event.hit = false;
      if (isPathway(event)) {
        this.clearAllHitEvents(event.events?.map(e => e.element));
      }
    });
  }

  buildTree(obj: SelectableObject | undefined, diagramId: string | undefined, tree: MatTree<Event, string>, hitReactions: number[]): Observable<Event[]> {
    if (!obj) {
      return this.buildNestedTree(undefined, this.treeData$.value, [], diagramId, undefined, tree, hitReactions);
    } else if (isPhysicalEntity(obj)) {
      return this.buildTreeWithSelectedEntity(obj, diagramId, tree, hitReactions);
    } else {
      const isFromDiagram = isDefined(diagramId) && !this.ehldService.hasEHLD();
      return this.buildTreeWithSelectedEvent(obj, diagramId, isFromDiagram, tree, hitReactions)
    }
  }


  // Build tree with diagram event ancestors
  private buildTreeWithSelectedEntity(object: PhysicalEntity, diagramId: string | undefined, tree: MatTree<Event, string>, hitReactions: number[]): Observable<Event[]> {
    this.dboService.setCurrentObj(object);

    const ancestors = diagramId ? this.fetchEventAncestors(diagramId).pipe(
      map(ancestors => this.getFinalAncestor(ancestors)),
    ) : from([[] as Event[]]);

    return ancestors.pipe(
      switchMap(ancestors => this.buildNestedTree(object, this.treeData$.value, ancestors, diagramId, object.stId, tree, hitReactions)),
      tap((tree) => this.setTreeData(tree))
    )
  }


  /**?
   * Build tree with event ancestors
   * @param object
   * @param diagramId
   * @param isFromDiagram  Behaves differently based on the calling method, avoid the check for isPathwayWithDiagram(event) when calling it from handlePathwaySelectionFromDiagram,
   *                       we want to open the ancestors in the tree view when select an interacting pathway in diagram, but not when first load for an interacting pathway from URL.
   */
  private buildTreeWithSelectedEvent(object: Event, diagramId: string | undefined, isFromDiagram: boolean, tree: MatTree<Event, string>, hitReactions: number[]): Observable<Event[]> {
    // When selected event is a subpathway or interacting pathway
    const idToBuild = isFromDiagram
      ? (isPathway(object) && object.stId != diagramId ? object.stId : diagramId)
      : object.stId;
    this.dboService.setCurrentObj(object);

    console.log('Build tree with selected event', idToBuild);
    const ancestors = idToBuild
      ? this.fetchEventAncestors(idToBuild).pipe(map(ancestors => this.getFinalAncestor(ancestors, diagramId ? [diagramId] : undefined)))
      : from([[] as Event[]]);

    return ancestors.pipe(
      tap(a => object.ancestors = a),
      switchMap(ancestors => this.buildNestedTree(object, this.treeData$.value, ancestors, diagramId, object.stId, tree, hitReactions)),
      tap((tree) => this.setTreeData(tree))
    );
  }

  /**
   * Select any reaction, subpathway and interacting pathway from diagram
   *
   * if DiagramId is set, will use it to find the correct ancestor
   */

  private handleExistingEventSelection(treeEvent: Event, diagramId: string | undefined, tree: MatTree<Event, string>, flatTreeNodes: Event[]): Observable<[Event[], Event]> {
    return this.fetchEventAncestors(treeEvent.stId).pipe(
      map(ancestors => {
        const finalAncestor = this.getFinalAncestor(ancestors, diagramId ? [diagramId] : undefined);
        // Create a Set to store the stIds from ancestors for quick lookup
        const ancestorStIds = new Set(finalAncestor.map(ancestor => ancestor.stId));
        // Loop through the treeNodes and check if the stId exists in the Set
        flatTreeNodes.forEach(treeNode => treeNode.isSelected = ancestorStIds.has(treeNode.stId));
        treeEvent.ancestors = finalAncestor;
        treeEvent.parent = finalAncestor[finalAncestor.length - 2];
        this.setTreeData(this.treeData$.value);
        this.setBreadcrumbs(finalAncestor);
        this.expandAllAncestors(finalAncestor, tree)

        return [this.treeData$.value, treeEvent];
      })
    )
  }


  private lastMatchedEvent: Event | null = null;

  /**
   * Build a nested tree structure dynamically based on the provided root tree events and corresponding ancestor events.
   * This method takes the initial set of root events and a list of ancestor events (ordered from child to parent)
   * to build a hierarchical structure, enriching each event with additional data fetched from an API.
   * It handles the display properties such as selection state and coloring based on the given parameters.
   *
   * @param roots Initial root events (level 1).
   * @param ancestors A list of Events ordered from child to parent.
   * @param diagramId Used for adding subpathway colors.
   * @param selectedIdFromUrl The selected event id.
   * @param subpathwayColors Maps of color keyed by dbId.
   * @param matTree An instance of the Material Tree component.
   */
  buildNestedTree(object: SelectableObject | undefined, roots: Event[], ancestors: Event[], diagramId: string | undefined, selectedIdFromUrl: string | undefined, matTree: MatTree<Event, string>, hitReactions: number[]): Observable<Event[]> {
    const tree = [...roots];
    // Add tlp itself as ancestor to tlp
    // tree.map(tlp => tlp.ancestors = [tlp])
    // Set ancestor as itself for root node

    // tree.forEach(tlp => {
    //   // Only assign an empty array; self will be added when children are built
    //   tlp.ancestors = []; // ✅ no self-reference here
    // });


    //this.lastMatchedEvent = null; // Reset at start

    return from(ancestors).pipe(
      concatMap((ancestor, index) => {
        // Search in last matched event's children or full tree
        const treeEventResources = this.lastMatchedEvent && isPathway(this.lastMatchedEvent) ? this.lastMatchedEvent.events?.map(e => e.element) : tree;
        let targetTreeEvent = this.findTreeEvent(treeEventResources, ancestor.stId);
        if (!targetTreeEvent) targetTreeEvent = this.findTreeEvent(tree, ancestor.stId); // Not found in previous pathway, search in the global tree
        if (!targetTreeEvent) return EMPTY;

        // Use existing diagramEvent data if stId matches
        if (this.diagramPathway?.stId === ancestor.stId) {
          this.processHasEventData(this.diagramPathway, targetTreeEvent, selectedIdFromUrl, diagramId, this.subpathwayColors, matTree, index, ancestors.length);
          return of(null); // Skip the API call and continue to the next ancestor
        }

        // Use existing selectedEvent data if stId matches
        if (object && object.stId === ancestor.stId) {
          this.processHasEventData(object, targetTreeEvent, selectedIdFromUrl, diagramId, this.subpathwayColors, matTree, index, ancestors.length);
          return of(null); // Skip the API call and continue to the next ancestor
        }

        return this.dboService.fetchEnhancedEntry(ancestor.stId).pipe(
          tap(data => {
            this.processHasEventData(data, targetTreeEvent, selectedIdFromUrl, diagramId, this.subpathwayColors, matTree, index, ancestors.length);
          })
        );
      }),
      last(undefined, 'fallback'), // Wait until all ancestors are processed, then update display names
      switchMap(() => {
        // Convert the isLoading signal to an observable
        return this.analysisLoadingResults$.pipe(
          filter(isLoading => !isLoading), // wait for isLoading === false
          take(1), // complete after first false
          map(() => {
            this.addAnalysisTag(tree, this.analysisService.result());
            this.addHitReactions(tree, hitReactions);
            return tree;
          })
        );
      })
    );
  }

  analysisLoadingResults$ = toObservable(this.analysisService.resultResource.isLoading)

  private _breadcrumbPath: Event[] = [];

  /**
   * Processes the API response data for an event and updates its properties.
   *
   * This method enriches the event with child events (`hasEvent`), establishes
   * hierarchical relationships, and updates UI properties such as selection state
   * and colors.
   *
   * @param object - The API response containing full data includes hasEvent.
   * @param treeEvent - The parent Event being updated.
   * @param selectedIdFromUrl - The ID of the selected event for highlighting.
   * @param diagramId - ID used for applying specific color schemes.
   * @param subpathwayColors - A map of colors keyed by database IDs.
   * @param matTree - The Material Tree component for UI interactions.
   * @param index - The index of the current ancestor being processed.
   * @param totalAncestors - Total number of ancestors in the list.
   */
  private processHasEventData(object: DatabaseObject, treeEvent: Event, selectedIdFromUrl: string | undefined, diagramId: string | undefined, subpathwayColors: Map<number, string> | undefined, matTree: MatTree<Event, string>, index: number, totalAncestors: number) {
    if (isPathway(object) && isPathway(treeEvent)) {
      treeEvent.events = object.events?.map((child: HasEvent) => {
        const ancestors = treeEvent.ancestors || [];

        // Append parent (treeEvent) if not already included
        const alreadyIncluded = ancestors.some(ancestor => ancestor.stId === treeEvent.stId);
        const baseAncestors = alreadyIncluded ? ancestors : [...ancestors, treeEvent];

        // Include the child itself in its own ancestor list
        const fullAncestors = [...baseAncestors, child.element];

        return {
          ...child,
          element: {
            ...child.element,
            ancestors: fullAncestors,
            parent: treeEvent,
            isSelected: child.element.stId === selectedIdFromUrl
          }
        }
      })
      matTree.expand(treeEvent);
      treeEvent.isSelected = true;

      this.lastMatchedEvent = treeEvent;
    }

    if (treeEvent.stId === diagramId && subpathwayColors) {
      this.setSubtreeColors(treeEvent, subpathwayColors);
    }

    this._breadcrumbPath.push(treeEvent);

    // Entity - false, Event - true
    // const isEvent = selectedIdFromUrl === treeEvent.stId;
    // const breadcrumbs = isEvent && treeEvent.schemaClass === "TopLevelPathway"
    //   ? [treeEvent]
    //   : [...treeEvent.ancestors];
    // this.setBreadcrumbs(breadcrumbs);


    if (index === totalAncestors - 1) {
      const isEvent = selectedIdFromUrl === treeEvent.stId;
      const breadcrumbs = isEvent && treeEvent.schemaClass === "TopLevelPathway" ? [treeEvent] : this._breadcrumbPath;
      this.setCurrentTreeEvent(treeEvent);
      this.setBreadcrumbs(breadcrumbs)
    }
  }

  addAnalysisTag(tree: Event[] | undefined, analysisResult: Analysis.Result | undefined): void {
    if (!tree) return;
    tree.forEach(event => {
      // If there's no analysis result, clear previous analysis info
      if (!analysisResult) {
        if (isPathway(event)) {
          event.hitReactionsCount = undefined;
        }
      } else {
        const pathwaysData = analysisResult.pathways;
        const pathwayData = pathwaysData.find(a => a.stId === event.stId);
        if (!pathwayData || !isPathway(event)) return;

        event.hitReactionsCount = `${pathwayData.reactions.found} / ${pathwayData.reactions.total}`;
      }
      // Recursively handle children
      if (isPathway(event) && event.events && event.events.length > 0) {
        this.addAnalysisTag(event.events.map(e => e.element), analysisResult);
      }
    });
  }

  addHitReactions(tree: Event[] | undefined, hitReactions: number[]) {
    if (!tree) return;
    //todo: temporary fix for clearing hit events when there is no analysis token

    // Clear analysis results
    if (hitReactions.length === 0) {
      this.clearAllHitEvents(this.treeData$.value);
    }

    tree.forEach(event => {
      event.hit = hitReactions.includes(event.dbId);
      if (!isPathway(event)) return;
      if (event.events && event.events.length > 0) {
        this.addHitReactions(event.events?.map(e => e.element), hitReactions);
      }
    });
  }


  findTreeEvent(events: Event[], targetId: string): Event | null {
    for (const event of events) {
      if (event.stId === targetId) {
        return event;
      }
      if (isPathway(event) && event.events) {
        const found = this.findTreeEvent(event.events?.map(e => e.element), targetId);
        if (found) return found;
      }
    }
    return null;
  }


  setSubtreeColors(event: Event, colors: Map<number, string> | undefined) {
    if (colors && isPathway(event) && event.events) {
      event.events?.map(e => e.element).forEach(e => {
        if (isPathway(e) && !e.hasDiagram) {
          e.subpathwayColor = colors.get(e.dbId);
        }
      });
    }
  }

  getFinalAncestor(ancestors: Pathway[][], pathIds?: string[]): Event[] {
    pathIds = pathIds || this.state.path();
    let finalAncestor: Event[];
    // When path is given through URL, this link is from Location in PWB on detail page
    if (pathIds && ancestors.length > 1) {
      finalAncestor = this.findBestAncestors(ancestors, pathIds);
    } else {
      // Take the first ancestor if no path is given
      finalAncestor = ancestors[0];
    }
    return finalAncestor;
  }
    private findBestAncestors(lineages: Pathway[][], path: string[]): Pathway[] {
    if (!lineages) return [];
    if (lineages.length === 1) return lineages[0];

    const idealIds = new Set(path);
    let bestAncestors: Pathway[] = lineages[0];
    let bestAncestorsScore = this.getAncestorsMatchingScore(lineages[0], idealIds);
    for (const ancestors of lineages.slice(1)) {
      const score = this.getAncestorsMatchingScore(ancestors, idealIds);
      if (score > bestAncestorsScore) {
        bestAncestors = ancestors;
        bestAncestorsScore = score;
      }
    }
    return bestAncestors;
  }

  private getAncestorsMatchingScore(ancestors: Pathway[], path: Set<string>) {
    return ancestors.reduce((score, ancestor) => path.has(ancestor.stId) ? score + 1 : score,0)
  }


  expandAllAncestors(ancestors: Event[], tree: MatTree<Event, string>) {
    ancestors.forEach(a => {
      tree.expand(a);
    })
  }


  getPathIds(diagramId: string | undefined, ancestors: Event[]) {
    const stIds: string[] = [];
    for (const a of ancestors) {
      if (a.stId === diagramId) {
        break; // Stop before adding the target event to the result
      }
      stIds.push(a.stId);
    }
    return stIds;
  }

  setPath(diagramId: string | undefined, ancestors: Event[]) {
    const ids = this.getPathIds(diagramId, ancestors);
    this.state.path.set(ids);
  }


  // Flatten tree and return all visible tree nodes
  getAllVisibleTreeEvents(tree: MatTree<Event, string>): Event[] {
    const visibleTreeNodes: Event[] = [];
    const addVisibleNodes = (node: Event) => {
      // Add the current node to the visible nodes
      visibleTreeNodes.push(node);
      // If the node is expanded, recursively check its children
      if (isPathway(node) && tree.isExpanded(node)) {
        node.events?.forEach(child => addVisibleNodes(child.element));
      }
    };
    // Start from the root nodes
    const treeNodes = [...this.treeData$.value];
    treeNodes.forEach(rootNode => addVisibleNodes(rootNode));

    return visibleTreeNodes;
  }

  // A collection of all expanded tree node and its children
  getExpandedTreeWithChildrenNodes(tree: MatTree<Event, string>, treeNodes: Event[]) {
    const expandedTreeNodes: Event[] = [];
    const tlpStId = tree._getExpansionModel().selected[0];
    const addVisibleNodes = (node: Event) => {
      expandedTreeNodes.push(node);
      if (isPathway(node) && tree.isExpanded(node)) {
        node.events?.forEach(child => addVisibleNodes(child.element));
      }
    };
    const rootTree = treeNodes.find(node => node.stId === tlpStId);
    if (rootTree) {
      addVisibleNodes(rootTree);
    }
    return expandedTreeNodes;
  }

  private flattenTree(data: Event[]): Event[] {
    const flatTreeData: Event[] = [];
    const flatten = (nodes: Event[]) => {
      nodes.forEach(node => {
        flatTreeData.push(node);
        if (isPathway(node)) {
          flatten(node.events?.map(e => e.element));
        }
      });
    };
    flatten(data);
    return flatTreeData;
  }

  findEvent(stId: string, events: Event[]): Event | undefined {
    const flatData = this.flattenTree(events);
    return flatData.find(node => node.stId === stId);
  }

  hasChild = (_: number, event: Event) => {
    return isPathway(event);
  }

  eventHasChild(event: Event): boolean {
    return this.hasChild(0, event);
  }


  getPathwayWithDiagram(event: Event): Event | undefined {
    const parents = [...event.ancestors].reverse();
    return parents.find(p => isPathway(p) && p.stId !== event.stId && p.hasDiagram);
  }

  collapseSiblingEvents(event: Event, matTree: MatTree<Event, string>) {
    if (!event.ancestors) return;
    // Get 1st parent
    const parentTree = event.parent;
    if (!parentTree) return;
    if (!isPathway(parentTree)) return;
    // Loop through the parent's children to collapse any expanded siblings
    parentTree.events.forEach(childEvent => {
      if (childEvent.element !== event && matTree.isExpanded(childEvent.element)) {
        matTree.collapse(childEvent.element);
        childEvent.element.isSelected = false;
      }
    })
  }

}
