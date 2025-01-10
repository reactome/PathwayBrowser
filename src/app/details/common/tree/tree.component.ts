import {AfterViewInit, Component, Input} from '@angular/core';
import {LiteratureReference} from "../../../model/event.model";
import {
  MatTree,
  MatTreeNestedDataSource,
  MatTreeNode, MatTreeNodeDef,
  MatTreeNodePadding,
  MatTreeNodeToggle
} from "@angular/material/tree";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";


@Component({
  selector: 'cr-tree',
  standalone: true,
  imports: [
    MatTree,
    MatTreeNode,
    MatIcon,
    MatTreeNodePadding,
    MatIconButton,
    MatTreeNodeToggle,
    MatTreeNodeDef
  ],
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.scss'
})
export class TreeComponent implements AfterViewInit {


  @Input('ref') refs?: LiteratureReference[];

  dataSource = new MatTreeNestedDataSource<LiteratureReference>();

  childrenAccessor = (node: LiteratureReference): LiteratureReference[] => node.children ?? [];


  hasChild = (_: number, node: LiteratureReference) => !!node.children && node.children.length > 0;

  ngAfterViewInit(): void {
    this.initializeTree();
  }


  initializeTree(): void {
    const sortedRefs = [...this.refs!].sort((a, b) => {
      if (a.year === undefined && b.year === undefined) return 0;
      if (a.year === undefined) return 1;
      if (b.year === undefined) return -1;
      return b.year - a.year;
    });

    // Transform the literatureReference into a tree structure
    const treeData: LiteratureReference = {
      name: `${this.refs?.length || 0} references`,
      children: this.refs?.map(ref => ({
        ...ref,
        children: [],
      })),
    };

    this.dataSource.data = [treeData];
  }


}
