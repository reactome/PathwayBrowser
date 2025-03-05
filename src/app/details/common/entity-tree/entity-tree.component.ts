import {Component, computed, effect, input, signal} from '@angular/core';
import {PhysicalEntity} from "../../../model/graph/physical-entity/physical-entity.model";
import {MatTreeNestedDataSource} from "@angular/material/tree";
import {DatabaseObjectService} from "../../../services/database-object.service";
import {forkJoin, map, Observable, of} from "rxjs";
import {rxResource} from "@angular/core/rxjs-interop";
import {DatabaseObject} from "../../../model/graph/database-object.model";
import {IconService} from "../../../services/icon.service";
import {EntitiesService} from "../../../services/entities.service";
import {ComposedOf} from "../../../model/graph/composed-of.model";


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

  _enhancedData = rxResource({
    request: () => this.selectedNode()?.stId,
    loader: (param) => param.request ? this.entitiesService.getEntityInDepth(param.request).pipe(
      map(enhancedData => {
        if (enhancedData && enhancedData.composedOf) {
          enhancedData.composedOf = enhancedData.composedOf.map(composed => ({
            ...composed,
            element: {
              ...composed.element,
              composedOf: [], // Add an empty composedOf array to ensure the node is expandable
              // Add below to PE to avoid lose these data because we are retuning PE not composedOf in childrenAccessor
              type: composed.type,
              stoichiometry: composed.stoichiometry,
              order: composed.order
            }
          }));

        }
        return enhancedData;
      })
    ) : of(null)
  });


  length = 8; // Total pages
  depthIndex = 1; // Start from Page 1

  constructor(private databaseObjectService: DatabaseObjectService,
              private iconService: IconService,
              private entitiesService: EntitiesService
  ) {
    effect(() => {
      if (this.data().length > 0) {
        this.dataSource.data = this.data();
      }
    });


    effect(() => {

      const enhancedData = this._enhancedData.value();
      if (!enhancedData) return;

      const updatedData = this.updateTargetNode(this.dataSource.data, enhancedData!);

      this.dataSource.data = [];
      this.dataSource.data = updatedData

    });


  }


  childrenAccessor = (node: PhysicalEntity): PhysicalEntity[] => {
    return node.composedOf?.flatMap(composed => composed.element) ?? [];
  };


  hasChild = (_: number, node: PhysicalEntity) => {
    return node.composedOf !== undefined;
  }

  loadChildren(node: PhysicalEntity) {
    console.log("node ", node)
    this._selectedNode.set(node);
    this.depthIndex++;
  }

  private updateTargetNode(existingData: PhysicalEntity[], enhancedData: PhysicalEntity): PhysicalEntity[] {
    const updatedData = [...existingData];

    const flatTree = this.flattenTree(updatedData);

    const targetTree = flatTree.find(node => node.stId === enhancedData.stId);
    if (targetTree) {
      // Merge changes from enhancedData into targetTree
      Object.assign(targetTree, enhancedData);
    }

    return updatedData;
  }

  private updatedEntity(existingData: PhysicalEntity[], enhancedData: PhysicalEntity): PhysicalEntity[] {

    const tree = this.flattenTree(existingData);
    const targetTree = tree.find(node => node.stId === enhancedData.stId);
    if (targetTree) {
      // Merge changes from enhancedData into targetTree
      Object.assign(targetTree, enhancedData);
    }

    return existingData;
  }


  loadExtraData(data: PhysicalEntity[]): Observable<PhysicalEntity[]> {
    if (!data?.length) return of(data);

    const requests = data.map(d => this.databaseObjectService.fetchEnhancedEntry(d.stId));

    return forkJoin(requests).pipe(
      map(responses => {
        const responseMap = new Map(responses.map(item => [item.stId, item]));
        return data.map(entity => ({
          ...entity,
          ...responseMap.get(entity.stId)
        }));
      })
    );
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
      return 'dottedConnector';
    }

    if (node.type === 'candidate') {
      return 'dashedConnector';
    }

    return 'solidConnector';
  }

}
