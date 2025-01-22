import {AfterViewInit, Component, input} from '@angular/core';
import {LiteratureReference, Summation} from "../../../model/event.model";
import {MatTreeNestedDataSource} from "@angular/material/tree";
import {sortByYearDescending} from "../../../services/utils";


@Component({
    selector: 'cr-summation-refs-tree',
    templateUrl: './summation-refs-tree.html',
    styleUrl: './summation-refs-tree.scss',
    standalone: false
})
export class SummationRefsTreeComponent implements AfterViewInit {


  readonly summation = input<Summation>();
  title?: string;

  dataSource = new MatTreeNestedDataSource<Summation>();

  //@ts-ignore
  childrenAccessor = (summation: Summation): Summation[] => summation.literatureReference ?? [];

  hasChild = (_: number, summation: Summation) => !!summation.literatureReference && summation.literatureReference.length > 0;

  ngAfterViewInit(): void {

    const summation = this.summation();
    if (summation) {

      summation.literatureReference = sortByYearDescending(summation.literatureReference);

      this.dataSource.data = [summation];
      this.title = `${summation.literatureReference.length} references`
    }
  }

}
