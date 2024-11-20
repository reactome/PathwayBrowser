import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Event} from "../model/event.model";
import {BehaviorSubject, concatMap, EMPTY, from, map, Observable, of, Subject, switchMap, take, tap} from "rxjs";
import {JSOGDeserializer} from "../utils/JSOGDeserializer";
import {DiagramStateService} from "./diagram-state.service";
import {MatTree} from "@angular/material/tree";


@Injectable({
  providedIn: 'root'
})
export class EventService {

  private readonly _TOP_LEVEL_PATHWAYS = `${environment.host}/ContentService/data/pathways/top/`;
  private readonly _ENHANCED_QUERY = `${environment.host}/ContentService/data/query/enhanced/`;
  private readonly _DATA_QUERY = `${environment.host}/ContentService/data/query/`;
  private readonly _ANCESTORS = `${environment.host}/ContentService/data/event/`;

  treeData$: BehaviorSubject<Event[]> = new BehaviorSubject<Event[]>([]);

  private _selectedTreeEvent: Subject<Event> = new Subject<Event>();
  public selectedTreeEvent$ = this._selectedTreeEvent.asObservable();

  private _selectedObj: Subject<Event> = new Subject<Event>();
  public selectedObj$ = this._selectedObj.asObservable();

  private _breadcrumbsSubject = new Subject<Event[]>();
  breadcrumbs$ = this._breadcrumbsSubject.asObservable();

  private _subpathwaysColors = new Subject<Map<number, string> | undefined>();
  subpathwaysColors$ = this._subpathwaysColors.asObservable();

  constructor(private http: HttpClient, private state: DiagramStateService) {
  }

  setTreeData(events: Event[]) {
    this.treeData$.next(events);
  }

  setCurrentTreeEvent(event: Event) {
    this._selectedTreeEvent.next(event);
  }

  setCurrentObj(event: Event) {
    this._selectedObj.next(event);
  }

  setCurrentEventAndObj(event: Event, obj: Event) {
    this.setCurrentTreeEvent(event);
    this.setCurrentObj(obj);
  }

  setBreadcrumbs(events: Event[]) {
    this._breadcrumbsSubject.next(events);
  }

  setSubpathwaysColors(colorMap: Map<number, string> | undefined) {
    this._subpathwaysColors.next(colorMap);
  }


  fetchTlpsBySpecies(taxId: string): Observable<Event[]> {
    let url = `${this._TOP_LEVEL_PATHWAYS}${taxId}`;
    return this.http.get<Event[]>(url);
  }


  fetchEventAncestors(stId: string): Observable<Event[][]> {
    let url = `${this._ANCESTORS}${stId}/ancestors`;
    return this.http.get<Event[][]>(url).pipe(map(ancestorsOptions => ancestorsOptions.map(ancestorsOption => ancestorsOption.reverse())))
  }


  fetchEnhancedEventData(stId: string): Observable<Event> {
    let url = `${this._ENHANCED_QUERY}${stId}?includeRef=true`;
    return this.http.get<Event>(url).pipe(
      map((response: Event) => {
        const deserializer = new JSOGDeserializer();
        const resolvedResponse = deserializer.deserialize(response);
        return resolvedResponse as unknown as Event;
      })
    )
  }

  fetchEventData(stId: string): Observable<Event> {
    let url = `${this._DATA_QUERY}${stId}`;
    return this.http.get<Event>(url).pipe(
      map((response: Event) => {
        const deserializer = new JSOGDeserializer();
        const resolvedResponse = deserializer.deserialize(response);
        return resolvedResponse as unknown as Event;
      })
    )
  }

  loadEventChildren(event: Event) {
    this.fetchChildrenEvents(event).pipe(
      switchMap(enhancedResult => {
        // If hasDiagram is true, wait for the latest color map from subpathwaysColors$
        if (enhancedResult.hasDiagram && !enhancedResult.hasEHLD) {
          return this.subpathwaysColors$.pipe(
            take(1),
            map(colors => ({event: enhancedResult, treeData: event, colors}))
          );
        } else {
          // If hasDiagram is false, color is undefined. for instance: /R-HSA-9612973/R-HSA-1632852
          return of({event: enhancedResult, treeData: event, colors: undefined});
        }
      })
    ).subscribe(({event: enhancedResult, treeData, colors}) => {
      if (colors && colors.size > 0) {
        this.setSubtreeColors(treeData, colors);
      }
      this.setCurrentEventAndObj(treeData, enhancedResult);
      this.setTreeData(this.treeData$.value);
    });
  }


  fetchChildrenEvents(tree: Event): Observable<Event> {
    return this.fetchEnhancedEventData(tree.stId).pipe(
      switchMap(result => {
        if (result.hasEvent) {
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
  adjustTreeFromDiagramSelection(enhancedEvent: Event, diagramId: string, subpathwayColors: Map<number, string> | undefined, tree: MatTree<Event, string>, treeNodes: Event[]): Observable<Event[]> {
    // All visible tree nodes
    const allVisibleTreeNodes = this.getAllVisibleTreeNodes(tree, treeNodes);
    if (this.isEntity(enhancedEvent)) {
      return this.handleEntitySelectionFromDiagram(enhancedEvent, diagramId, allVisibleTreeNodes, tree);
    } else if (this.isReaction(enhancedEvent)) {
      return this.handleReactionSelectionFromDiagram(enhancedEvent, diagramId, allVisibleTreeNodes, tree, subpathwayColors);
    } else if (this.isPathwayWithDiagram(enhancedEvent)) {
      // tree.collapseAll(); //todo: should we collapse all?
      return this.handlePathwaySelectionFromDiagram(enhancedEvent, diagramId, allVisibleTreeNodes, tree, subpathwayColors, allVisibleTreeNodes);
    } else {
      return of(this.treeData$.value)
    }
  }


  private handleEntitySelectionFromDiagram(event: Event, diagramId: string, allVisibleTreeNodes: Event[], tree: MatTree<Event, string>): Observable<Event[]> {
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

  private handleReactionSelectionFromDiagram(event: Event, diagramId: string, allVisibleTreeNodes: Event[], tree: MatTree<Event, string>, subpathwayColors: Map<number, string> | undefined): Observable<Event[]> {
    const treeNode = allVisibleTreeNodes.find(node => node.stId === event.stId);
    if (treeNode !== undefined) {
      return this.handleExistingEventSelection(treeNode, tree, allVisibleTreeNodes).pipe(
        map(([treeData, event]) => {
          this.setCurrentEventAndObj(treeNode, event);
          return treeData;
        })
      );
    } else {
      return this.buildTreeWithSelectedEvent(event, diagramId, true, tree, subpathwayColors).pipe(
        map((treeData) => {
          this.setCurrentEventAndObj(event, event);
          return treeData;
        })
      );
    }
  }

  // Subpathway and interacting pathway
  private handlePathwaySelectionFromDiagram(event: Event, diagramId: string, allVisibleTreeNodes: Event[], tree: MatTree<Event, string>, subpathwayColors: Map<number, string> | undefined, treeNodes: Event[]): Observable<Event[]> {
    const treeNode = allVisibleTreeNodes.find(node => node.stId === event.stId);
    if (treeNode !== undefined) {
      // Subpathway, already in the tree view
      return this.handleExistingEventSelection(treeNode, tree, allVisibleTreeNodes).pipe(
        map(([treeData, event]) => {
          this.setCurrentEventAndObj(event, event);
          this.loadEventChildren(treeNode)//todo: this.setCurrentEventAndObj(treeEvent, event)?
          return treeData;
        })
      );
    } else {
      // Interacting pathway, not visible in the tree view
      this.clearAllSelectedEvents(treeNodes);
      return this.buildTreeWithSelectedEvent(event, diagramId, true, tree, subpathwayColors).pipe(
        map(treeData => {
          return treeData;
        })
      );
    }
  }

  isPathwayWithDiagram(event: Event): boolean {
    return this.eventHasChild(event) && event.hasDiagram && ['TopLevelPathway', 'Pathway', 'CellLineagePath'].includes(event.schemaClass);
  }

  clearAllSelectedEvents(events: Event[]) {
    events.forEach(event => {
      event.isSelected = false;
      if (event.hasEvent) {
        this.clearAllSelectedEvents(event.hasEvent);
      }
    });
  }

  buildTree(event: Event, diagramId: string, tree: MatTree<Event, string>, subpathwayColors: Map<number, string> | undefined, hasEHLD: boolean | undefined): Observable<Event[]> {
    if (this.isEntity(event)) {
      return this.buildTreeWithSelectedEntity(event, diagramId, tree, subpathwayColors);
    } else {
      if (hasEHLD) {
        return this.buildTreeWithSelectedEvent(event, diagramId, true, tree, subpathwayColors);
      } else {
        return this.buildTreeWithSelectedEvent(event, diagramId, false, tree, subpathwayColors);
      }
    }
  }

  // Build tree with diagram event ancestors
  private buildTreeWithSelectedEntity(event: Event, diagramId: string, tree: MatTree<Event, string>, subpathwayColors: Map<number, string> | undefined): Observable<Event[]> {
    this.setCurrentObj(event);
    return this.fetchEnhancedEventData(diagramId).pipe(
      switchMap(() => this.fetchEventAncestors(diagramId)),
      map(ancestors => this.getFinalAncestor(ancestors)),
      switchMap(ancestors => this.buildNestedTree(this.treeData$.value, ancestors, diagramId, event.stId, subpathwayColors, tree)),
      map((tree) => {
        this.setTreeData(tree);
        return tree
      })
    )
  }


  /**?
   * Build tree with event ancestors
   * @param event
   * @param diagramId
   * @param isFromDiagram  Behaves differently based on the calling method, avoid the check for isPathwayWithDiagram(event) when calling it from handlePathwaySelectionFromDiagram,
   *                       we want to open the ancestors in the tree view when select an interacting pathway in diagram, but not when first load for an interacting pathway from URL.
   */
  private buildTreeWithSelectedEvent(event: Event, diagramId: string, isFromDiagram: boolean, tree: MatTree<Event, string>, subpathwayColors: Map<number, string> | undefined): Observable<Event[]> {
    // When selected event is a subpathway or interacting pathway
    const idToBuild = isFromDiagram ? event.stId : (this.isPathwayWithDiagram(event) && event.stId != diagramId ? diagramId : event.stId);
    this.setCurrentObj(event);
    return this.fetchEventAncestors(idToBuild).pipe(
      map(ancestors => this.getFinalAncestor(ancestors)),
      switchMap(ancestors => this.buildNestedTree(this.treeData$.value,ancestors, diagramId, event.stId, subpathwayColors, tree)),
      map((tree) => {
        this.setTreeData(tree);
        return tree
      })
    );
  }

  // Select any reaction, subpathway and interacting pathway from diagram
  private handleExistingEventSelection(event: Event, tree: MatTree<Event, string>, flatTreeNodes: Event[]): Observable<[Event[], Event]> {
    return this.fetchEventAncestors(event.stId).pipe(
      map(ancestors => {
        const finalAncestor = this.getFinalAncestor(ancestors);
        // Create a Set to store the stIds from ancestors for quick lookup
        const ancestorStIds = new Set(finalAncestor.map(ancestor => ancestor.stId));
        // Loop through the treeNodes and check if the stId exists in the Set
        flatTreeNodes.forEach(treeNode => {
          treeNode.isSelected = ancestorStIds.has(treeNode.stId);
        });
        event.ancestors = finalAncestor;
        event.parent = finalAncestor[finalAncestor.length - 2];
        this.setTreeData(this.treeData$.value);
        this.setBreadcrumbs(finalAncestor);
        this.expandAllAncestors(finalAncestor, tree)

        return [this.treeData$.value, event];
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
  buildNestedTree(roots: Event[], ancestors: Event[], diagramId: string, selectedIdFromUrl: string, subpathwayColors: Map<number, string> | undefined, matTree: MatTree<Event, string>): Observable<Event[]> {
    const tree = [...roots];
    // Add tlp itself as ancestor to tlp
    tree.map(tlp => tlp.ancestors = [tlp])

    this.lastMatchedEvent = null; // Reset at start

    return from(ancestors).pipe(
      concatMap((ancestor, index) => {
        // Search in last matched event's children or full tree
        const treeEventResources = this.lastMatchedEvent?.hasEvent || tree;
        const targetTreeEvent = this.findTreeEvent(treeEventResources, ancestor.stId);

        if (!targetTreeEvent) return EMPTY;

        return this.fetchEnhancedEventData(ancestor.stId).pipe(
          tap(data => {
            this.processHasEventData(data, targetTreeEvent, selectedIdFromUrl, diagramId, subpathwayColors, matTree, index, ancestors.length);
          })
        );
      }),
      map(() => tree)
    );
  }

  /**
   * Processes the API response data for an event and updates its properties.
   *
   * This method enriches the event with child events (`hasEvent`), establishes
   * hierarchical relationships, and updates UI properties such as selection state
   * and colors.
   *
   * @param data - The API response containing full data includes hasEvent.
   * @param treeEvent - The parent Event being updated.
   * @param selectedIdFromUrl - The ID of the selected event for highlighting.
   * @param diagramId - ID used for applying specific color schemes.
   * @param subpathwayColors - A map of colors keyed by database IDs.
   * @param matTree - The Material Tree component for UI interactions.
   * @param index - The index of the current ancestor being processed.
   * @param totalAncestors - Total number of ancestors in the list.
   */
  private processHasEventData(data: Event, treeEvent: Event, selectedIdFromUrl: string, diagramId: string, subpathwayColors: Map<number, string> | undefined, matTree: MatTree<Event, string>, index: number, totalAncestors: number) {
    if (data.hasEvent) {
      treeEvent.hasEvent = data.hasEvent.map((child: Event) => {
        const ancestors = treeEvent.ancestors || [];
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

    // Entity - false, Event = true
    const isEvent = selectedIdFromUrl === treeEvent.stId;
    const breadcrumbs = isEvent && treeEvent.schemaClass === "TopLevelPathway"
      ? [treeEvent]
      : [...treeEvent.ancestors];
    this.setBreadcrumbs(breadcrumbs);


    if (index === totalAncestors - 1) {
      this.setCurrentTreeEvent(treeEvent);
    }
  }

  findTreeEvent(events: Event[], targetId: string): Event | null {
    for (const event of events) {
      if (event.stId === targetId) {
        return event;
      }
      if (event.hasEvent) {
        const found = this.findTreeEvent(event.hasEvent, targetId);
        if (found) return found;
      }
    }
    return null;
  }


  setSubtreeColors(event: Event, colors: Map<number, string> | undefined) {
    if (colors && event.hasEvent) {
      event.hasEvent.forEach(e => {
        if (e.schemaClass === 'Pathway' && !e.hasDiagram) {
          e.color = colors.get(e.dbId);
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
  getAllVisibleTreeNodes(tree: MatTree<Event, string>, treeNodes: Event[]): Event[] {
    const visibleTreeNodes: Event[] = [];
    const addVisibleNodes = (node: Event) => {
      // Add the current node to the visible nodes
      visibleTreeNodes.push(node);
      // If the node is expanded, recursively check its children
      if (tree.isExpanded(node) && node.hasEvent) {
        node.hasEvent.forEach(child => addVisibleNodes(child));
      }
    };
    // Start from the root nodes
    treeNodes.forEach(rootNode => addVisibleNodes(rootNode));

    return visibleTreeNodes;
  }

  // A collection of all expanded tree node and its children
  getExpandedTreeWithChildrenNodes(tree: MatTree<Event, string>, treeNodes: Event[]) {
    const expandedTreeNodes: Event[] = [];
    const tlpStId = tree._getExpansionModel().selected[0];
    const addVisibleNodes = (node: Event) => {
      expandedTreeNodes.push(node);
      if (tree.isExpanded(node) && node.hasEvent) {
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
        if (node.hasEvent) {
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

  hasChild = (_: number, event: Event) => !!event.hasEvent && event.hasEvent.length > 0 || ['TopLevelPathway', 'Pathway', 'CellLineagePath'].includes(event.schemaClass);

  eventHasChild(event: Event): boolean {
    return this.hasChild(0, event);
  }


  isEntity(event: Event) {
    return (!this.eventHasChild(event) && !this.isReaction(event));
  }

  isReaction(event: Event) {
    return (['Reaction', 'BlackBoxEvent', 'CellDevelopmentStep'].includes(event.schemaClass));
  }

  getPathwayWithDiagram(event: Event): Event | undefined {
    const parents = [...event.ancestors].reverse();
    return parents.find(p => p.stId !== event.stId && p.hasDiagram);
  }

  collapseSiblingEvent(event: Event, matTree: MatTree<Event, string>) {
    if (!event.ancestors) return;
    // Get 1st parent
    const eventParent = event.parent;
    if (!eventParent) return;
    // Loop through the parent's children to collapse any expanded siblings
    eventParent.hasEvent?.forEach(childEvent => {
      if (childEvent !== event && matTree.isExpanded(childEvent)) {
        matTree.collapse(childEvent);
        matTree.collapseDescendants(childEvent);
        childEvent.isSelected = false;
      }
    })
  }

}
