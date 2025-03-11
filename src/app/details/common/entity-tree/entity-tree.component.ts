import {Component, computed, effect, input, signal} from '@angular/core';
import {PhysicalEntity} from "../../../model/graph/physical-entity/physical-entity.model";
import {MatTreeNestedDataSource} from "@angular/material/tree";
import {map, of} from "rxjs";
import {rxResource} from "@angular/core/rxjs-interop";
import {DatabaseObject} from "../../../model/graph/database-object.model";
import {IconService} from "../../../services/icon.service";
import {EntitiesService} from "../../../services/entities.service";
import {DataStateService} from "../../../services/data-state.service";
import {isEWAS} from "../../../services/utils";
import {Relationship} from "../../../model/graph/relationship.model";
import {SchemaClasses} from "../../../constants/constants";


@Component({
  selector: 'cr-component-tree',
  templateUrl: './entity-tree.component.html',
  styleUrl: './entity-tree.component.scss',
  standalone: false
})
export class EntityTreeComponent<E extends DatabaseObject, R extends Relationship.Has<E>> {

  readonly type = input.required<string>()
  readonly data = input.required<R[], (E | R)[]>({
    transform: (data: (E | R)[]): R[] => {
      if (!data || data.length === 0) return [];
      if (data[0].stoichiometry) return data.map(r => ({
        ...r,
        element: {...r.element, composedOf: r.element.composedOf || []}
      })) as R[];
      return (data as E[]).map(e => ({
        element: {...e, composedOf: e.composedOf || []},
        order: 0,
        stoichiometry: 1,
        type: this.type()
      }) as R); // Wrap in fake relationship to keep stoichiometry and global structure
    }
  });

  dataSource = new MatTreeNestedDataSource<R>();

  _selectedNode = signal<E | null>(null);
  selectedNode = computed(() => this._selectedNode());


  _enhancedSelectedNode = rxResource({
    request: () => this.selectedNode()?.stId,
    loader: (param) => {
      if (!param.request) return of();

      // Check the condition to determine which method to call
      if (this.selectedNode()?.schemaClass === SchemaClasses.EWAS) {
        return this.dataStateService.fetchEnhancedData<PhysicalEntity>(param.request);
      } else {
        return this.entitiesService.getEntityInDepth(param.request)
          .pipe(
            map(enhancedData => {
              if (enhancedData && enhancedData.composedOf) {
                enhancedData.composedOf = enhancedData.composedOf.map((composed, index, array) => ({
                  ...composed,
                  element: {
                    ...composed.element,
                    composedOf: [], // Add an empty composedOf array to ensure the node is expandable
                  }
                }));
              }
              return {
                ...enhancedData
              };
            })
          );
      }
    }
  });

  referenceEntity = computed(() => {
    const data = this._enhancedSelectedNode.value();
    if (!data || !isEWAS(data)) return undefined;
    return data.referenceEntity;
  });


  length = 8; // Total pages
  depthIndex = 1; // Start from Page 1

  constructor(private iconService: IconService,
              private entitiesService: EntitiesService,
              private dataStateService: DataStateService,
  ) {
    effect(() => {
      if (this.data().length > 0) {
        this.dataSource.data = this.data();
      }
    });


    effect(() => {

      const enhancedData = this._enhancedSelectedNode.value();
      if (!enhancedData) return;

      const updatedTree = this.updateTree(this.dataSource.data, enhancedData! as unknown as E);

      this.dataSource.data = [];
      this.dataSource.data = updatedTree

    });


  }


  childrenAccessor = (node: R): R[] => {
    if (!node || !node.element.composedOf) {
      return []; // Return an empty array when composedOf is undefined
    }
    return node.element.composedOf as R[];
  };


  hasChild = (_: number, node: R) => {
    return node.element.composedOf !== undefined;
  }

  loadChildren(node: R) {
    this._selectedNode.set(node.element);
    this.depthIndex++;
  }

  private updateTree(existingTreeData: R[], enhancedData: E): R[] {

    const tree = [...existingTreeData];
    const flatTree = this.flattenTree(tree);
    const targetTreeNode = flatTree.find(node => node.element.stId === enhancedData.stId);

    if (targetTreeNode) {
      // Merge changes from enhancedData into targetTree
      Object.assign(targetTreeNode.element, enhancedData);
    }

    return tree;
  }

  private flattenTree(nodes: R[]): R[] {
    return nodes.flatMap(node => [
      node,
      ...(node.element.composedOf ?
        this.flattenTree(node.element.composedOf as R[]) :
        [])
    ]);
  }

  firstPage() {
    this.depthIndex = 1;
  }

  previousPage() {
    if (this.depthIndex > 1) {
      this.depthIndex--;
    }
  }

  nextPage() {
    if (this.depthIndex < this.length) {
      this.depthIndex++;
    }
  }

  lastPage() {
    this.depthIndex = this.length;
  }


  getSymbol(obj: DatabaseObject) {
    return this.iconService.getIconDetails(obj);
  }

  // The method below are all helper methods for creating branch lines for the nested tree view, open to any better strategy in future
  // Dynamic get the size of the connector container
  getConnectorStyles(element: HTMLElement, isProteinContent: boolean) {

    const level = Number(element.getAttribute('aria-level'));
    // if the node is a protein content node, then include it otherwise exclude root
    const connectorNumber = !isProteinContent ? level - 1 : level;

    const width = 24;
    const left = -24;
    if (connectorNumber > 0) {
      const width = connectorNumber * 24;
      const left = -connectorNumber * 24;
      return {
        'width': `${width}px`,
        'left': `${left}px`
      };
    }

    return {
      'width': `${width}px`,
      'left': `${left}px`
    };
  }

  getCurrentNodeConnector(element: HTMLElement, node: R): string {

    if (!element || !node) return '';

    const posinset = Number(element.getAttribute('aria-posinset'));
    const setsize = Number(element.getAttribute('aria-setsize'));

    // Member
    if (node.type === 'member') {
      if (posinset === 1 && setsize === 1) return 'dashedLConnector'; // Single child → Last item
      if (posinset === 1) return 'dashedTConnector'; // First item
      if (posinset === setsize) return 'dashedLConnector'; // Last item
      return 'dashedTConnector'; // middle items
    }

    // Default class for other node types
    if (node.type === 'component' || node.type === 'repeatedUnit') {
      if (posinset === 1 && setsize === 1) return 'solidLConnector';
      if (posinset === 1) return 'solidTConnector';
      if (posinset === setsize) return 'solidLConnector';
      return 'solidTConnector';
    }

    if (node.type === 'candidate') {
      if (posinset === 1 && setsize === 1) return 'miniDashedLConnector';
      if (posinset === 1) return 'miniDashedTConnector';
      if (posinset === setsize) return 'miniDashedLConnector';
      return 'miniDashedTConnector';
    }

    return 'solidIConnector';
  }

  // To create an array of a specific level for indexing connector class
  getArray(level: string | null, isProteinContent: boolean): number[] {
    // Exclude root for normal tree node and include it when tree node is a protein content node
    let size = !isProteinContent ? Number(level ?? 0) - 1 : Number(level ?? 0);
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

  getParentsConnector(node: R, isProteinContent: boolean) {

    const ancestors = this.findAncestors(node, this.dataSource.data);
    // Get all parents excepted the last one, ancestors include the node itself, the last one is processing with getCurrentNodeConnector(node)
    // if the parent is the protein, then include it in the list as the parent and kid(protein content node) is the same node
    const parents = !isProteinContent ? [...ancestors].slice(0, -1) : ancestors;
    // const parents =  [...ancestors].slice(0, -1)

    const connectorClasses: string[] = [];
    // Start from index 1 to exclude the root
    for (let i = 1; i < parents.length; i++) {
      const parent = parents[i];
      const grandParent = i > 0 ? parents[i - 1] : null;

      const grandParentChildCount = grandParent?.element.composedOf && grandParent.element.composedOf.length ? grandParent.element.composedOf.length : null;
      // Compare the order of current parent with the size of previous parent composedOf to determine if the parent is the last kid, adding empty string as connector
      if (grandParentChildCount && parent.order === grandParentChildCount - 1) {
        connectorClasses.push('');
      } else {
        connectorClasses.push(this.getParentConnector(grandParent!));
      }
    }


    return connectorClasses;
  }

  getParentConnector(node: R) {
    // Use the first child to know the connector type, because the parent could be input or output type
    const firstChild = node.element.composedOf && node.element.composedOf.length > 0 ? node.element.composedOf[0] : null;
    if (!firstChild) return '';

    if (firstChild.type === 'member') return 'dashedIConnector';
    if (firstChild.type === 'component' || node.type === 'repeatedUnit') return 'solidIConnector';
    if (firstChild.type === 'candidate') return 'miniDashedIConnector';
    return 'solidIConnector';
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


  protected readonly Number = Number;
}
