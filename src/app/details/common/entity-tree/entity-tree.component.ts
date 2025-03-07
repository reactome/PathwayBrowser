import {Component, computed, effect, input, signal} from '@angular/core';
import {PhysicalEntity} from "../../../model/graph/physical-entity/physical-entity.model";
import {MatTreeNestedDataSource} from "@angular/material/tree";
import {DatabaseObjectService} from "../../../services/database-object.service";
import {map, of} from "rxjs";
import {rxResource} from "@angular/core/rxjs-interop";
import {DatabaseObject} from "../../../model/graph/database-object.model";
import {IconService} from "../../../services/icon.service";
import {EntitiesService} from "../../../services/entities.service";
import {DataStateService} from "../../../services/data-state.service";
import {isEWAS} from "../../../services/utils";
import {Relationship} from "../../../model/graph/relationship.model";


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
      if (data[0].stoichiometry) return data.map(r => ({...r, element: {...r.element, composedOf: r.element.composedOf || []}})) as R[];
      return (data as E[]).map(e => ({element: {...e, composedOf: e.composedOf || []}, order: 0, stoichiometry: 1, type: this.type()}) as R); // Wrap in fake relationship to keep stoichiometry and global structure
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
      if (this.selectedNode()?.schemaClass === 'EntityWithAccessionedSequence') {
        return this.dataStateService.fetchEnhancedData<PhysicalEntity>(param.request);
      } else {
        return this.entitiesService.getEntityInDepth(param.request)
          .pipe(
            map(enhancedData => {
              if (enhancedData && enhancedData.composedOf) {
                enhancedData.composedOf = enhancedData.composedOf.map(composed => ({
                  ...composed,
                  element: {
                    ...composed.element,
                    composedOf: [], // Add an empty composedOf array to ensure the node is expandable
                    // Add below to PE to avoid losing these data because we are returning PE not composedOf in childrenAccessor
                    type: composed.type,
                    stoichiometry: composed.stoichiometry,
                    order: composed.order
                  }
                }));
              }
              return enhancedData;
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
      if (!enhancedData) return;+

      console.log(this.dataSource.data, enhancedData);
      const updatedTree = this.updateTree(this.dataSource.data, enhancedData! as unknown as E);

      this.dataSource.data = [];
      this.dataSource.data = updatedTree

    });


  }


  childrenAccessor = (node: R): R[] => {
    console.log(node)
    if (!node || !node.element.composedOf) {
      return []; // Return an empty array when composedOf is undefined
    }
    return node.element.composedOf as R[];
  };


  hasChild = (_: number, node: R) => {
    return node.element.composedOf !== undefined;
  }

  loadChildren(node: R) {
    console.log("node ", node)
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

  // transformComposedOf(composedOfList: Relationship.Has<DatabaseObject, string>[]): ComposedOf[] {
  //   return composedOfList.map(composed => ({
  //     ...composed,
  //     element: {
  //       ...composed.element, // Preserve the original PhysicalEntity properties
  //       type: composed.type,
  //       stoichiometry: composed.stoichiometry,
  //       order: composed.order
  //     }
  //   }));
  // }


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

  getNodeConnector(node: PhysicalEntity): string {
    if (node.type === 'component' || node.type === 'repeatedUnit') {
      return 'solidConnector';
    }

    if (node.type === 'member') {
      return 'dashedConnector';
    }

    if (node.type === 'candidate') {
      return 'smallDashedConnector';
    }

    return 'solidConnector';
  }

}
