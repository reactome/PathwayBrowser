import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Event} from "../model/graph/event.model";
import {
  BehaviorSubject,
  concatMap,
  EMPTY,
  from,
  last,
  map,
  Observable,
  of,
  skip,
  Subject,
  switchMap,
  take,
  tap
} from "rxjs";
import {DiagramStateService} from "./diagram-state.service";
import {MatTree} from "@angular/material/tree";
import {Analysis} from "../model/analysis.model";
import {AnalysisService} from "./analysis.service";
import {EhldService} from "./ehld.service";
import {TopLevelPathway} from "../model/graph/top-level-pathway.model";
import {DatabaseObject} from "../model/graph/database-object.model";
import {isEntity, isEvent, isPathwayOrTLP, isPathwayWithDiagram, isRLE} from "./utils";
import {DatabaseObjectService} from "./database-object.service";


@Injectable({
  providedIn: 'root'
})
export class EventService {

  private readonly _TOP_LEVEL_PATHWAYS = `${environment.host}/ContentService/data/pathways/top/`;
  private readonly _ANCESTORS = `${environment.host}/ContentService/data/event/`;

  treeData$: BehaviorSubject<Event[]> = new BehaviorSubject<Event[]>([]);

  private _selectedTreeEvent: Subject<Event> = new Subject<Event>();
  public selectedTreeEvent$ = this._selectedTreeEvent.asObservable();


  private _breadcrumbsSubject = new Subject<Event[]>();
  breadcrumbs$ = this._breadcrumbsSubject.asObservable();

  private _subpathwayColors = new BehaviorSubject<Map<number, string> | undefined>(undefined);
  subpathwayColors$ = this._subpathwayColors.asObservable();
  subpathwayColors?: Map<number, string>;

  private _diagramEvent = new BehaviorSubject<Event | undefined>(undefined);
  diagramEvent$ = this._diagramEvent.asObservable();
  diagramEvent?: Event;

  constructor(private http: HttpClient,
              private state: DiagramStateService,
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


  setCurrentEventAndObj(event: Event, obj: DatabaseObject) {
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

  setDiagramEvent(event: Event) {
    this.diagramEvent = event;
    this._diagramEvent.next(event);
  }

  fetchTlpsBySpecies(taxId: string): Observable<TopLevelPathway[]> {
    let url = `${this._TOP_LEVEL_PATHWAYS}${taxId}`;
    return this.http.get<TopLevelPathway[]>(url);
  }


  fetchEventAncestors(stId: string): Observable<Event[][]> {
    let url = `${this._ANCESTORS}${stId}/ancestors`;
    return this.http.get<Event[][]>(url).pipe(map(ancestorsOptions => ancestorsOptions.map(ancestorsOption => ancestorsOption.reverse())))
  }

  loadEventData(event: Event) {
    this.fetchEventChildren(event).pipe(
      switchMap(dbo => {
        // If hasDiagram is true, wait for the latest color map from subpathwaysColors$
        if (isPathwayOrTLP(dbo) && dbo.hasDiagram && !dbo.hasEHLD) {
          return this.subpathwayColors$.pipe(
            skip(1), // Skip initial undefined
            take(1),
            map(colors => ({dbo: dbo, treeEvent: event, colors})),
            tap((colors) => (console.log("colors ", colors))),
          );
        } else {
          // If hasDiagram is false, color is undefined. for instance: /R-HSA-9612973/R-HSA-1632852
          return of({dbo: dbo, treeEvent: event, colors: undefined});
        }
      }),
      switchMap(({dbo, treeEvent, colors}) => {
        const token = this.analysisService.result?.summary.token;
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
      this.setTreeData(this.treeData$.value);
      this.addAnalysisTag(dbo.hasEvent, this.analysisService.result);
      this.addHitReactions(dbo.hasEvent, hitReactions)
    });
  }


  fetchEventChildren(tree: Event): Observable<DatabaseObject> {
    return this.dboService.fetchEnhancedEntry(tree.stId).pipe(
      switchMap(result => {

        if (isPathwayOrTLP(result) && result.hasEvent && isPathwayOrTLP(tree)) {
          // Update the event structure with child relationships
          tree.hasEvent = result.hasEvent.map(child => {
            child.ancestors = [...tree.ancestors, child];
            child.parent = tree;
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
  adjustTreeFromDiagramSelection(object: DatabaseObject, diagramId: string, tree: MatTree<Event, string>, hitReactions: number[]): Observable<Event[]> {
    // All visible tree nodes
    const allVisibleTreeNodes = this.getAllVisibleTreeEvents(tree);
    if (isEntity(object)) {
      return this.handleEntitySelectionFromDiagram(object, diagramId, allVisibleTreeNodes, tree);
    } else if (isRLE(object)) {
      return this.handleReactionSelectionFromDiagram(object, diagramId, allVisibleTreeNodes, tree, hitReactions);
    } else if (isPathwayWithDiagram(object)) {
      // tree.collapseAll(); //todo: should we collapse all?
      return this.handlePathwaySelectionFromDiagram(object, diagramId, allVisibleTreeNodes, tree, allVisibleTreeNodes, hitReactions);
    } else {
      return of(this.treeData$.value)
    }
  }


  private handleEntitySelectionFromDiagram(event: DatabaseObject, diagramId: string, allVisibleTreeNodes: Event[], tree: MatTree<Event, string>): Observable<Event[]> {
    const diagramTreeEvent = allVisibleTreeNodes.find(node => node.stId === diagramId);
    if (diagramTreeEvent) {
      return this.handleExistingEventSelection(diagramTreeEvent, tree, allVisibleTreeNodes).pipe(
        map(([treeData, treeEvent]) => {
          this.setCurrentEventAndObj(diagramTreeEvent, event);
          return treeData;
        })
      );
    } else {
      return of(this.treeData$.value);
    }
  }

  private handleReactionSelectionFromDiagram(event: DatabaseObject, diagramId: string, allVisibleTreeNodes: Event[], tree: MatTree<Event, string>, hitReactions: number[]): Observable<Event[]> {
    const treeNode = allVisibleTreeNodes.find(node => node.stId === event.stId);
    if (treeNode !== undefined) {
      return this.handleExistingEventSelection(treeNode, tree, allVisibleTreeNodes).pipe(
        map(([treeData, treeNode]) => {
          this.setCurrentEventAndObj(treeNode, event);
          return treeData;
        })
      );
    } else {
      return this.buildTreeWithSelectedEvent(event, diagramId, true, tree, hitReactions).pipe(
        map((treeData) => {
          if (isEvent(event)) {
            this.setCurrentEventAndObj(event, event);
          }
          return treeData;
        })
      );
    }
  }

  // Subpathway and interacting pathway
  private handlePathwaySelectionFromDiagram(event: DatabaseObject, diagramId: string, allVisibleTreeNodes: Event[], tree: MatTree<Event, string>, treeNodes: Event[], hitReactions: number[]): Observable<Event[]> {
    const treeNode = allVisibleTreeNodes.find(node => node.stId === event.stId);
    if (treeNode !== undefined) {
      // Subpathway, already in the tree view
      return this.handleExistingEventSelection(treeNode, tree, allVisibleTreeNodes).pipe(
        map(([treeData, event]) => {
          this.setCurrentEventAndObj(event, event);
          this.loadEventData(treeNode)//todo: this.setCurrentEventAndObj(treeEvent, event)?
          return treeData;
        })
      );
    } else {
      // Interacting pathway, not visible in the tree view
      this.clearAllSelectedEvents(treeNodes);
      return this.buildTreeWithSelectedEvent(event, diagramId, true, tree, hitReactions).pipe(
        map(treeData => {
          return treeData;
        })
      );
    }
  }

  clearAllSelectedEvents(events: Event[]) {
    events.forEach(event => {
      event.isSelected = false;
      if (isPathwayOrTLP(event)) {
        this.clearAllSelectedEvents(event.hasEvent);
      }
    });
  }

  buildTree(obj: DatabaseObject, diagramId: string, tree: MatTree<Event, string>, hitReactions: number[]): Observable<Event[]> {
    if (isEntity(obj)) {
      return this.buildTreeWithSelectedEntity(obj, diagramId, tree, hitReactions);
    } else {
      if (this.ehldService.hasEHLD) {
        return this.buildTreeWithSelectedEvent(obj, diagramId, true, tree, hitReactions);
      } else {
        return this.buildTreeWithSelectedEvent(obj, diagramId, false, tree, hitReactions);
      }
    }
  }

  // Build tree with diagram event ancestors
  private buildTreeWithSelectedEntity(object: DatabaseObject, diagramId: string, tree: MatTree<Event, string>, hitReactions: number[]): Observable<Event[]> {
    this.dboService.setCurrentObj(object);

    return this.dboService.fetchEnhancedEntry(diagramId).pipe(
      switchMap(() => this.fetchEventAncestors(diagramId)),
      map(ancestors => this.getFinalAncestor(ancestors)),
      switchMap(ancestors => this.buildNestedTree(object, this.treeData$.value, ancestors, diagramId, object.stId, tree, hitReactions)),
      map((tree) => {
        this.setTreeData(tree);
        return tree
      })
    )
  }


  /**?
   * Build tree with event ancestors
   * @param object
   * @param diagramId
   * @param isFromDiagram  Behaves differently based on the calling method, avoid the check for isPathwayWithDiagram(event) when calling it from handlePathwaySelectionFromDiagram,
   *                       we want to open the ancestors in the tree view when select an interacting pathway in diagram, but not when first load for an interacting pathway from URL.
   */
  private buildTreeWithSelectedEvent(object: DatabaseObject, diagramId: string, isFromDiagram: boolean, tree: MatTree<Event, string>, hitReactions: number[]): Observable<Event[]> {
    // When selected event is a subpathway or interacting pathway
    const idToBuild = isFromDiagram ? object.stId : (isPathwayWithDiagram(object) && object.stId != diagramId ? diagramId : object.stId);
    this.dboService.setCurrentObj(object);
    return this.fetchEventAncestors(idToBuild).pipe(
      map(ancestors => this.getFinalAncestor(ancestors)),
      switchMap(ancestors => this.buildNestedTree(object, this.treeData$.value, ancestors, diagramId, object.stId, tree, hitReactions)),
      map((tree) => {
        this.setTreeData(tree);
        return tree;
      })
    );
  }

  // Select any reaction, subpathway and interacting pathway from diagram
  private handleExistingEventSelection(treeEvent: Event, tree: MatTree<Event, string>, flatTreeNodes: Event[]): Observable<[Event[], Event]> {
    return this.fetchEventAncestors(treeEvent.stId).pipe(
      map(ancestors => {
        const finalAncestor = this.getFinalAncestor(ancestors);
        // Create a Set to store the stIds from ancestors for quick lookup
        const ancestorStIds = new Set(finalAncestor.map(ancestor => ancestor.stId));
        // Loop through the treeNodes and check if the stId exists in the Set
        flatTreeNodes.forEach(treeNode => {
          treeNode.isSelected = ancestorStIds.has(treeNode.stId);
        });
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
  buildNestedTree(object: DatabaseObject, roots: Event[], ancestors: Event[], diagramId: string, selectedIdFromUrl: string, matTree: MatTree<Event, string>, hitReactions: number[]): Observable<Event[]> {
    const tree = [...roots];
    // Add tlp itself as ancestor to tlp
    tree.map(tlp => tlp.ancestors = [tlp])

    //this.lastMatchedEvent = null; // Reset at start

    return from(ancestors).pipe(
      concatMap((ancestor, index) => {

        // Search in last matched event's children or full tree
        const treeEventResources = this.lastMatchedEvent && isPathwayOrTLP(this.lastMatchedEvent) ? this.lastMatchedEvent.hasEvent : tree;
        const targetTreeEvent = this.findTreeEvent(treeEventResources, ancestor.stId);

        if (!targetTreeEvent) return EMPTY;

        // Use existing diagramEvent data if stId matches
        if (this.diagramEvent?.stId === ancestor.stId) {
          this.processHasEventData(this.diagramEvent, targetTreeEvent, selectedIdFromUrl, diagramId, this.subpathwayColors, matTree, index, ancestors.length);
          return of(null); // Skip the API call and continue to the next ancestor
        }

        // Use existing selectedEvent data if stId matches
        if (object.stId === ancestor.stId) {
          this.processHasEventData(object, targetTreeEvent, selectedIdFromUrl, diagramId, this.subpathwayColors, matTree, index, ancestors.length);
          return of(null); // Skip the API call and continue to the next ancestor
        }

        return this.dboService.fetchEnhancedEntry(ancestor.stId).pipe(
          tap(data => {
            this.processHasEventData(data, targetTreeEvent, selectedIdFromUrl, diagramId, this.subpathwayColors, matTree, index, ancestors.length);
          })
        );
      }),
      last(), // Wait until all ancestors are processed, then update display names
      map(() => {
        this.addAnalysisTag(tree, this.analysisService.result); // Add analysis result
        this.addHitReactions(tree, hitReactions);
        return tree;
      }),
    );
  }

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
  private processHasEventData(object: DatabaseObject, treeEvent: Event, selectedIdFromUrl: string, diagramId: string, subpathwayColors: Map<number, string> | undefined, matTree: MatTree<Event, string>, index: number, totalAncestors: number) {
    if (isPathwayOrTLP(object) && isPathwayOrTLP(treeEvent)) {
      treeEvent.hasEvent = object.hasEvent.map((child: Event) => {
        const ancestors = treeEvent.ancestors || [];
        // Remove duplicate ancestors
        if (!ancestors.some((ancestor) => ancestor.stId === treeEvent.stId)) {
          ancestors.push(treeEvent);
        }
        return {
          ...child,
          ancestors: [...ancestors, child],
          parent: treeEvent,
          isSelected: child.stId === selectedIdFromUrl
        }
      })
      matTree.expand(treeEvent);
      treeEvent.isSelected = true;

      this.lastMatchedEvent = treeEvent;
    }

    if (treeEvent.stId === diagramId && subpathwayColors) {
      this.setSubtreeColors(treeEvent, subpathwayColors);
    }

    // Entity - false, Event - true
    const isEvent = selectedIdFromUrl === treeEvent.stId;
    const breadcrumbs = isEvent && treeEvent.schemaClass === "TopLevelPathway"
      ? [treeEvent]
      : [...treeEvent.ancestors];
    this.setBreadcrumbs(breadcrumbs);


    if (index === totalAncestors - 1) {
      this.setCurrentTreeEvent(treeEvent);
    }
  }

  addAnalysisTag(tree: Event[] | undefined, analysisResult: Analysis.Result | undefined): void {
    if (!analysisResult || !tree) return;

    const pathwaysData = analysisResult.pathways;
    tree.forEach(event => {
      const pathwayData = pathwaysData.find(a => a.stId === event.stId);
      if (!pathwayData || !isPathwayOrTLP(event)) return;
      // const analysisContent = "Hit Reactions / Total Reactions";
      // node.analysisContent = analysisContent;
      event.hitReactionsCount = `${pathwayData.reactions.found} / ${pathwayData.reactions.total}`;

      if (isPathwayOrTLP(event) && event.hasEvent && event.hasEvent.length > 0) {
        this.addAnalysisTag(event.hasEvent, analysisResult);
      }
    });
  }

  addHitReactions(tree: Event[] | undefined, hitReactions: number[]) {
    if (hitReactions.length === 0 || !tree) return;
    tree.forEach(event => {
      if (!isPathwayOrTLP(event)) return;
      event.hit = hitReactions.includes(event.dbId);
      if (event.hasEvent && event.hasEvent.length > 0) {
        this.addHitReactions(event.hasEvent, hitReactions);
      }
    });
  }


  findTreeEvent(events: Event[], targetId: string): Event | null {
    for (const event of events) {
      if (event.stId === targetId) {
        return event;
      }
      if (isPathwayOrTLP(event) && event.hasEvent) {
        const found = this.findTreeEvent(event.hasEvent, targetId);
        if (found) return found;
      }
    }
    return null;
  }


  setSubtreeColors(event: Event, colors: Map<number, string> | undefined) {
    if (colors && isPathwayOrTLP(event) && event.hasEvent) {
      event.hasEvent.forEach(e => {
        if (isPathwayOrTLP(e) && !e.hasDiagram) {
          e.subpathwayColor = colors.get(e.dbId);
        }
      });
    }
  }

  getFinalAncestor(ancestors: Event[][]): Event[] {
    const pathIds = this.state.get('path');
    let finalAncestor: Event[];
    // When path is given through URL, this link is from Location in PWB on detail page
    if (pathIds && ancestors.length > 1) {
      finalAncestor = this.findMatchingAncestor(ancestors, pathIds);
    } else {
      // Take the first ancestor if no path is given
      finalAncestor = ancestors[0];
    }
    return finalAncestor;
  }

  findMatchingAncestor(ancestors: Event[][], pathIds: string[]): Event[] {
    for (const ancestorArray of ancestors) {
      const allIdsFromAncestor = ancestorArray.map(event => event.stId);
      // Check if pathIds are in the current ancestor array
      const containsAll = pathIds.every(id => allIdsFromAncestor.includes(id));
      if (containsAll) {
        return ancestorArray;
      }
    }
    // Use first ancestor if returns null
    return ancestors[0];
  }


  expandAllAncestors(ancestors: Event[], tree: MatTree<Event, string>) {
    ancestors.forEach(a => {
      tree.expand(a);
    })
  }


  getPathIds(diagramId: string, ancestors: Event[]) {
    const stIds: string[] = [];
    for (const a of ancestors) {
      if (a.stId === diagramId) {
        break; // Stop before adding the target event to the result
      }
      stIds.push(a.stId);
    }
    return stIds;
  }

  setPath(diagramId: string, ancestors: Event[]) {
    const ids = this.getPathIds(diagramId, ancestors);
    this.state.set('path', ids);
  }


  // Flatten tree and return all visible tree nodes
  getAllVisibleTreeEvents(tree: MatTree<Event, string>): Event[] {
    const visibleTreeNodes: Event[] = [];
    const addVisibleNodes = (node: Event) => {
      // Add the current node to the visible nodes
      visibleTreeNodes.push(node);
      // If the node is expanded, recursively check its children
      if (isPathwayOrTLP(node) && tree.isExpanded(node)) {
        node.hasEvent.forEach(child => addVisibleNodes(child));
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
      if (isPathwayOrTLP(node) && tree.isExpanded(node)) {
        node.hasEvent.forEach(child => addVisibleNodes(child));
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
        if (isPathwayOrTLP(node)) {
          flatten(node.hasEvent);
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
    return !!isPathwayOrTLP(event);
  }

  eventHasChild(event: Event): boolean {
    return this.hasChild(0, event);
  }


  getPathwayWithDiagram(event: Event): Event | undefined {
    const parents = [...event.ancestors].reverse();
    return parents.find(p => isPathwayOrTLP(p) && p.stId !== event.stId && p.hasDiagram);
  }

  collapseSiblingEvents(event: Event, matTree: MatTree<Event, string>) {
    if (!event.ancestors) return;
    // Get 1st parent
    const parentTree = event.parent;
    if (!parentTree) return;
    if (!isPathwayOrTLP(parentTree)) return;
    // Loop through the parent's children to collapse any expanded siblings
    parentTree.hasEvent.forEach(childEvent => {
      if (childEvent !== event && matTree.isExpanded(childEvent)) {
        matTree.collapse(childEvent);
        childEvent.isSelected = false;
      }
    })
  }

}
