import {Component, computed, effect, input, model, signal, ViewChild} from '@angular/core';
import {isEvent} from "../../../services/utils";
import {MatTree, MatTreeNestedDataSource} from "@angular/material/tree";
import {rxResource} from "@angular/core/rxjs-interop";
import {forkJoin, map, of} from "rxjs";
import {SelectableObject} from "../../../services/event.service";
import {DatabaseObject} from "../../../model/graph/database-object.model";
import {SchemaClasses} from "../../../constants/constants";
import {IconService} from "../../../services/icon.service";
import {EntitiesService} from "../../../services/entities.service";
import {DataStateService} from "../../../services/data-state.service";
import {Relationship} from "../../../model/graph/relationship.model";
import {cloneDeep} from "lodash";
import {UrlStateService} from "../../../services/url-state.service";


@Component({
  selector: 'cr-entity-tree',
  standalone: false,
  templateUrl: './entity-tree.component.html',
  styleUrl: './entity-tree.component.scss'
})
export class EntityTreeComponent<E extends DatabaseObject, R extends Relationship.Has<E>> {

  hasDepthControl = input<boolean>(false);
  depthIndex = model<number | undefined>();
  depthChangeSource = model<'controller' | 'tree' | undefined>(undefined);
  treeLength = model<number | undefined>(undefined);

  _selectedTreeNode = signal<E | undefined>(undefined);
  selectedTreeNode = computed(() => this._selectedTreeNode());
  //todo: not used for now, delete it in future
  fullTreeCache: R[] = [];
  initialData: R[] = [];

  @ViewChild(MatTree) tree!: MatTree<R>;

  readonly type = input.required<string>()
  readonly data = input.required<R[], (E | R)[]>({
    transform: (data: (E | R)[]): R[] => {
      if (!data || data.length === 0) return [];
      if (data[0].stoichiometry) return data.map((r, index) => ({
        ...r,
        element: {...r.element, composedOf: r.element.composedOf || []},
        index: index,
      })) as R[];
      return (data as E[]).map(e => ({
        element: {...e, composedOf: e.composedOf || []},
        order: 0,
        stoichiometry: 1,
        type: this.type(),
        index: 0
      }) as R); // Wrap in fake relationship to keep stoichiometry and global structure
    }
  });

  dataSource = new MatTreeNestedDataSource<R>();
  maxStringLength = 27; // Use Molluscum contagiosum virus's length

  constructor(private iconService: IconService,
              private entitiesService: EntitiesService,
              private dataStateService: DataStateService,
  ) {

    // Initial tree data
    effect(() => {
      if (this.data().length > 0) {
        this.initialData = cloneDeep(this.data());
        this.dataSource.data = this.data();
      }
    });

    // Updating tree based on user interaction
    effect(() => {
      const result = this._selectedTreeNodeData.value();
      if (!result) return;
      this.updateMatTreeDataSource(result);

    });

    // Updating entire tree when user click depth controller
    effect(() => {
      // TODO evaluate with CHuq if that's alright
      const index = this.depthIndex();
      const source = this.depthChangeSource();

      if (index === 1 && this.tree) {
        this.tree.collapseAll();
        return;
      }

      if (index && index > 1 && source == 'controller') {
        const treeData = this._treeSource.value();
        if (treeData && treeData.length > 0) {
          this.dataSource.data = [];
          this.dataSource.data = treeData;
          // tree.expandAll() will expand all tree nodes include protein
          this.expandNestedTreeNodes(treeData);
        }
      }
    });

    // Fetch full tree to get maxLevel when fist load
    effect(() => {

      const fullTree = this._fullTreeSource.value();
      if (!fullTree || fullTree.length === 0) return;
      const maxLevel = this.getTreeDepth(fullTree, 0);
      this.treeLength.set(maxLevel);
      this.fullTreeCache = fullTree;
    });

  }

  _treeSource = rxResource({
    request: () => ({depth: this.depthIndex()}),
    loader: ({request}) => {

      // Skip updating the tree when index changes is from the tree
      if (this.depthChangeSource() === 'tree') {
        return of(this.dataSource.data);
      }

      const depth = request.depth;

      if (!depth) {
        return of(this.dataSource.data);
      }

      //todo: this cause issue right now, revisit to use cached data

      // Use cached tree data when depth is the tree length
      // if (depth === this.treeLength()) {
      //   return of(this.fullTreeCache);
      // }

      const depthInQuery = depth === this.treeLength() ? -1 : depth - 1; // Ignore the default depth 1
      const results = [...this.data()].map((node) => this.fetchTreeAtDepth(node, depthInQuery));

      return forkJoin(results).pipe();
    }
  });

  // Get max level when first load
  _fullTreeSource = rxResource({
    request: () => (this.data()),
    loader: (params) => {
      if (this.hasDepthControl()) {
        const nodeResults = params.request.map((node) => this.fetchTreeAtDepth(node, -1));
        return forkJoin(nodeResults);
      }

      return of(this.data());
    }
  })


  _selectedTreeNodeData = rxResource({
    request: () => this.selectedTreeNode()?.stId,
    loader: (param) => {
      const selectedNode = this.selectedTreeNode();
      // Check the condition to determine which method to call
      // Protein
      if (!this.isNestedView(selectedNode)) {
        return this.dataStateService.fetchEnhancedData<SelectableObject>(param.request).pipe(map(result => result as unknown as E));
      } else {
        // PE -> Complex and Set
        return this.entitiesService.getEntityInDepth<E>(param.request, 1) // This is from user interaction on the tree itself, so the depth is always 1
          .pipe(
            map(entityResult => {
              if (entityResult && entityResult.composedOf) {
                entityResult.composedOf = entityResult.composedOf.map((composed, index, array) => ({
                  ...composed,
                  element: {
                    ...composed.element,
                    composedOf: [], // Add an empty composedOf array to ensure the node is expandable
                  },
                  index: index,
                }));
              }
              return {
                ...entityResult,
                isLoaded: true,
              };
            })
          );
      }
    }
  });

  childrenAccessor = (node: R): R[] => {
    if (!node || !node.element.composedOf) {
      return []; // Return an empty array when composedOf is undefined
    }
    return node.element.composedOf as R[];
  };


  hasChild = (_: number, node: R) => {
    return node.element.composedOf !== undefined;
  }


  // Fetch children data when user click to expand, no need to send API call when tree node already exists
  loadChildren(node: R) {

    const isExpanded = this.tree.isExpanded(node);

    // Expand
    if (isExpanded) {
      const alreadyLoaded = node.element.isLoaded;
      const hasNoChildren = alreadyLoaded && node.element.composedOf?.length === 0; // For nested entity which already exists but no children data
      if (!alreadyLoaded || hasNoChildren) {
        // No children data — sending API call to fetch children data
        this._selectedTreeNode.set(node.element);
      } else {
        console.log('Children already loaded — skipping API call');
      }
    }


    // Handle both expand and collapse with one timeout to get depthIndex
    // Defer so the tree has time to update its expansion state
    setTimeout(() => {
      const depth = this.getTreeDepth(this.dataSource.data, 1, true);
      if (this.depthIndex() !== depth) {
        this.depthIndex.set(depth);
        this.depthChangeSource.set('tree');
      }
    }, 500);
  }

  fetchTreeAtDepth(node: R, depth: number) {
    const element = node.element as E;
    const id = element.stId || element.dbId;

    if (!this.isNestedView(element)) {
      // Return node with composedOf when element is protein
      const normalElement = {
        ...element,
        composedOf: element.composedOf ?? [],
      };
      return of({...node, element: normalElement});
    }

    return this.entitiesService.getEntityInDepth<E>(id, depth).pipe(
      map((entityResult) => {
        const composedOf = entityResult.composedOf || [];
        const nestedElement = {
          ...element,
          ...entityResult,
          composedOf: this.getComposedOfRecursively(composedOf),
          isLoaded: true,
        };
        return {
          ...node,
          element: nestedElement
        };
      })
    );
  }

  // Recursively tracks the deepest level of the tree
  getTreeDepth(nodes: R[], level = 1, respectExpansion = false): number {
    if (!nodes || nodes.length === 0) return level;

    return Math.max(
      ...nodes.map(node => {
        const children = node.element?.composedOf || [];

        const isExpanded = this.tree?.isExpanded(node);
        const isNested = this.isNestedView(node.element);

        // Stop if not expanded or not nested
        if (respectExpansion && (!isExpanded || !isNested)) {
          return level;
        }

        return this.getTreeDepth(children as R[], level + 1, respectExpansion);
      })
    );
  }


  expandNestedTreeNodes(nodes: R[]) {
    for (const node of nodes) {
      if (!node.element.composedOf) return;
      if (node.element.composedOf.length > 0) {
        this.tree.expand(node);
        this.expandNestedTreeNodes(node.element.composedOf as R[]);
      }
    }
  }


  getComposedOfRecursively(composedArray: Relationship.Has<DatabaseObject>[]): Relationship.Has<DatabaseObject>[] {
    if (!Array.isArray(composedArray)) return [];

    return composedArray.map((composed, index) => {
      const element = composed?.element ?? [];
      const nestedComposedOf = Array.isArray(element.composedOf) ? this.getComposedOfRecursively(element.composedOf) : [];
      return {
        ...composed,
        element: {
          ...element,
          composedOf: nestedComposedOf,
          isLoaded: true
        },
        index,
      };
    });
  }


  isNestedView(selectedNode: E | undefined): boolean {
    if (!selectedNode) return true;

    const nonNestedClasses: Set<string> = new Set([
      SchemaClasses.EWAS,
      SchemaClasses.SIMPLE_ENTITY,
      SchemaClasses.CHEMICAL_DRUG
    ])

    return !(nonNestedClasses.has(selectedNode.schemaClass) || isEvent(selectedNode));
  }

  isEllipsisActive(e: HTMLElement): boolean {
    return e ? (e.offsetWidth < e.scrollWidth) : false;
  }


  updateMatTreeDataSource(node: E) {
    const updatedTree = this.updateTree(this.dataSource.data, node);

    this.dataSource.data = [];
    this.dataSource.data = updatedTree;
  }

  updateTree(existingTreeData: R[], result: E): R[] {

    const tree = [...existingTreeData];
    const flatTree = this.flattenTree(tree);
    const targetTreeNode = flatTree.find(node => node.element.stId === result.stId);

    if (targetTreeNode) {
      // Merge all properties from result directly into the element
      Object.assign(targetTreeNode.element, result); // MUTATES ORIGINAL ELEMENT
    }

    return tree;
  }

  flattenTree(nodes: R[]): R[] {
    return nodes.flatMap(node => [
      node,
      ...(node.element.composedOf ?
        this.flattenTree(node.element.composedOf as R[]) :
        [])
    ]);
  }

  getSymbol(obj: DatabaseObject) {
    return this.iconService.getIconDetails(obj);
  }

  // The method below are all helper methods for creating branch lines for the nested tree view, open to any better strategy in future
  // Dynamic get the size of the connector container
  getLevel(element: HTMLElement, isDetailContent: boolean) {
    let depth = Number(element.getAttribute('aria-level'));
    // If it's a protein content node, count it; otherwise, exclude root from level calculation
    return !isDetailContent ? depth - 1 : depth;
  }


  getCurrentNodeConnector(element: HTMLElement, node: R): string {

    if (!element || !node) return '';

    const index = node.index;
    // Size of all children nodes
    const size = Number(element.getAttribute('aria-setsize'));

    // Member
    if (node.type === 'member') {
      if (index === 0 && size === 1) return 'dashedLConnector'; // Single child → Last item
      if (index === 0) return 'dashedTConnector'; // First item
      if (index === size - 1) return 'dashedLConnector'; // Last item
      return 'dashedTConnector'; // middle items
    }

    // Default class for other node types
    if (node.type === 'component' || node.type === 'repeatedUnit') {
      if (index === 0 && size === 1) return 'solidLConnector';
      if (index === 0) return 'solidTConnector';
      if (index === size - 1) return 'solidLConnector';
      return 'solidTConnector';
    }

    if (node.type === 'candidate') {
      if (index === 0 && size === 1) return 'miniDashedLConnector';
      if (index === 0) return 'miniDashedTConnector';
      if (index === size - 1) return 'miniDashedLConnector';
      return 'miniDashedTConnector';
    }

    // if (node.type === 'regulatedBy' || node.type === 'catalystActivity') {
    //   return ' '
    // }

    return 'otherConnector';
  }

  // To create an array of a specific level for indexing connector class
  getArray(level: string | null, isDetailContent: boolean): number[] {
    // Exclude root for normal tree node and include it when tree node is a protein content node
    let size = !isDetailContent ? Number(level ?? 0) - 1 : Number(level ?? 0);
    let result = [];
    for (let i = 0; i < size; i++) {
      result.push(i);
    }
    return result;
  }

  /**
   *
   * @param element HTML element
   * @param node Tree node
   * @param index Index of connector starts from 0
   * @param _level Level of the tree view starts from 1
   *
   * return a list of connector classes
   */
  getAllConnectors(element: HTMLElement, node: R, index: number, _level: string | null) {

    if (!_level) return [];
    const connectors = []
    const level = Number(_level);
    // Only get all parents connectors, given false value here to indicate that the current node is not protein content node
    const parentConnectors = this.getParentsConnector(node, false);
    connectors.push(...parentConnectors);

    // target the last connector
    // index starts from 0 and level starts from 1
    if (index === level - 2) {
      const lastConnector = this.getCurrentNodeConnector(element, node);
      connectors.push(lastConnector);
    }

    return connectors
  }

  getParentsConnector(node: R, isDetailContent: boolean) {

    const ancestors = this.findAncestors(node, this.dataSource.data);
    // Get all parents excepted the last one, ancestors include the node itself, the last one is processing with getCurrentNodeConnector(node)
    // if the parent is the protein, then include it in the list as the parent and kid(protein content node) is the same node
    const parents = !isDetailContent ? [...ancestors].slice(0, -1) : ancestors;
    // const parents =  [...ancestors].slice(0, -1)

    const connectorClasses: string[] = [];
    // Start from index 1 to exclude the root
    for (let i = 1; i < parents.length; i++) {
      const parent = parents[i];
      const grandParent = i > 0 ? parents[i - 1] : null;

      const grandParentChildCount = grandParent?.element.composedOf && grandParent.element.composedOf.length ? grandParent.element.composedOf.length : null;
      // Compare the order of current parent with the size of previous parent composedOf to determine if the parent is the last kid, adding empty string as connector
      if (grandParentChildCount && parent.index === grandParentChildCount - 1) {
        connectorClasses.push('');
      } else {
        connectorClasses.push(this.getParentConnector(grandParent!, node));
      }
    }

    return connectorClasses;
  }

  getParentConnector(parentNode: R, node: R) {

    if (!parentNode.element.composedOf || parentNode.element.composedOf.length === 0) return '';

    // Find a child with the same type as the clicked node
    const matchedChild = parentNode.element.composedOf.find(child => child.type === node.type);
    // Fallback to the first child if no match is found and use the first child to know the connector type, because the parent could be input or output type
    // Cannot use the composedOf[0] directly is because the elements in composedOf could have different types, for instance, member and candidate, composedOf[0] will always
    // return member type not candidate
    const typeReference = matchedChild || parentNode.element.composedOf[0];

    if (typeReference.type === 'member') return 'dashedIConnector';
    if (typeReference.type === 'component' || parentNode.type === 'repeatedUnit') return 'solidIConnector';
    if (typeReference.type === 'candidate') return 'miniDashedIConnector';
    // if (firstChild.type === 'regulatedBy' || node.type === 'catalystActivity') return ' ';
    return 'otherConnector';
  }

  findAncestors(node: R, treeData: R[]): R[] {
    return this.traverseAndCollectAncestors(treeData, node);
  }

  // Helper function to traverse the tree and collect ancestors
  traverseAndCollectAncestors(currentNode: R[], targetNode: R): R[] {
    // Iterate through each node
    for (const node of currentNode) {
      // If the target node is found, return an array with this node
      if (node === targetNode) {
        return [node];  // This node itself is the ancestor
      }
      // Check if the node has children
      if (node.element.composedOf && node.element.composedOf.length > 0) {
        // Recursively find ancestors in the children and merge results
        const ancestors = this.traverseAndCollectAncestors(node.element.composedOf as R[], targetNode);

        if (ancestors.length > 0) {
          // If ancestors were found, prepend the current node to the result list
          return [node, ...ancestors];  // Add current node as part of ancestors list
        }
      }
    }
    return [];
  }

  getShortest(arr: string[]) {
    return arr.reduce((a, b) => (a.length <= b.length ? a : b));
  }


  protected readonly isEvent = isEvent;
  protected readonly Array = Array;


  onSelectClick(event: MouseEvent, node: E) {
    event.stopPropagation();
    if (!node.stId) return;
    this.urlState.select.set(node.stId);
  }
}
