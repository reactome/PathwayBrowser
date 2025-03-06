import {Component, computed, effect, input, signal} from '@angular/core';
import {PhysicalEntity} from "../../../model/graph/physical-entity/physical-entity.model";
import {MatTreeNestedDataSource} from "@angular/material/tree";
import {DatabaseObjectService} from "../../../services/database-object.service";
import {map, of} from "rxjs";
import {rxResource} from "@angular/core/rxjs-interop";
import {DatabaseObject} from "../../../model/graph/database-object.model";
import {IconService} from "../../../services/icon.service";
import {EntitiesService} from "../../../services/entities.service";
import {ComposedOf} from "../../../model/graph/composed-of.model";
import {DataStateService} from "../../../services/data-state.service";
import {isEWAS} from "../../../services/utils";


@Component({
  selector: 'cr-component-tree',
  templateUrl: './entity-tree.component.html',
  styleUrl: './entity-tree.component.scss',
  standalone: false
})
export class EntityTreeComponent {

  readonly data = input.required({
    alias: "data",
    transform: (pes: PhysicalEntity[]): PhysicalEntity[] => {
      return pes.map(node => ({
        ...node,
        composedOf: node.composedOf ?? [], // Initialized to an empty array for making the root expandable
      }));
    }
  });

  dataSource = new MatTreeNestedDataSource<PhysicalEntity>();

  _selectedNode = signal<PhysicalEntity | null>(null);
  selectedNode = computed(() => this._selectedNode());


  _enhancedSelectedNode = rxResource({
    request: () => this.selectedNode()?.stId,
    loader: (param) => {
      if (!param.request) {
        return of(null);
      }

      // Check the condition to determine which method to call
      if (this.selectedNode()?.schemaClass === 'EntityWithAccessionedSequence') {
        return this.dataStateService.fetchEnhancedData<PhysicalEntity>(param.request);
      } else {
        return this.entitiesService.getEntityInDepth(param.request).pipe(
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

  constructor(private databaseObjectService: DatabaseObjectService,
              private iconService: IconService,
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

      const updatedTree = this.updateTree(this.dataSource.data, enhancedData!);

      this.dataSource.data = [];
      this.dataSource.data = updatedTree

    });


  }


  childrenAccessor = (node: PhysicalEntity): PhysicalEntity[] => {
    if (!node || !node.composedOf) {
      return []; // Return an empty array when composedOf is undefined
    }
    return node.composedOf.flatMap(composed => composed.element);
  };


  hasChild = (_: number, node: PhysicalEntity) => {
    return node.composedOf !== undefined;
  }

  loadChildren(node: PhysicalEntity) {
    console.log("node ", node)
    this._selectedNode.set(node);
    this.depthIndex++;
  }

  private updateTree(existingTreeData: PhysicalEntity[], enhancedData: PhysicalEntity): PhysicalEntity[] {

    const tree = [...existingTreeData];
    const flatTree = this.flattenTree(tree);
    const targetTreeNode = flatTree.find(node => node.stId === enhancedData.stId);

    if (targetTreeNode) {
      // Merge changes from enhancedData into targetTree
      Object.assign(targetTreeNode, enhancedData);
    }

    return tree;
  }


  private flattenTree(nodes: PhysicalEntity[]): PhysicalEntity[] {
    return nodes.flatMap(node => [
      node,
      ...(node.composedOf ? this.flattenTree(node.composedOf.flatMap(composed => composed.element)) : [])
    ]);
  }

  transformComposedOf(composedOfList: ComposedOf[]): ComposedOf[] {
    return composedOfList.map(composed => ({
      ...composed,
      element: {
        ...composed.element, // Preserve the original PhysicalEntity properties
        type: composed.type,
        stoichiometry: composed.stoichiometry,
        order: composed.order
      }
    }));
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
