import {AfterViewInit, Component, Input} from '@angular/core';
import {LiteratureReference, Summation} from "../../../model/event.model";
import {MatTreeNestedDataSource} from "@angular/material/tree";


@Component({
  selector: 'cr-summation-refs-tree',
  templateUrl: './summation-refs-tree.html',
  styleUrl: './summation-refs-tree.scss'
})
export class SummationRefsTreeComponent implements AfterViewInit {


  @Input('summation') summation?: Summation;
  title?: string;

  dataSource = new MatTreeNestedDataSource<Summation>();

  childrenAccessor = (summation: Summation): LiteratureReference[] => summation.literatureReference ?? [];

  hasChild = (_: number, summation: Summation) => !!summation.literatureReference && summation.literatureReference.length > 0;

  ngAfterViewInit(): void {

    if (this.summation) {
      this.dataSource.data = [this.summation];
      this.title = `${this.summation.literatureReference.length} references`
    }
  }

}
