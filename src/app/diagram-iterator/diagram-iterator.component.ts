import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import { HttpClient } from "@angular/common/http";
import {DiagramComponent} from "../diagram/diagram.component";
import {combineLatest} from "rxjs";

@Component({
    selector: 'cr-diagram-iterator',
    templateUrl: './diagram-iterator.component.html',
    styleUrls: ['./diagram-iterator.component.scss'],
    standalone: false
})
export class DiagramIteratorComponent implements AfterViewInit {

  @ViewChild('diagram')
  diagram!: DiagramComponent;

  diagramId: string = '';

  diagramIndex: number = 0;
  diagramIds: string[] = [];

  constructor(private route: ActivatedRoute, private client: HttpClient, private router: Router) {
  }

  ngAfterViewInit(): void {
    combineLatest([
      this.route.params,
      this.client.get('/assets/data/diagrams-dev-no-ehld.txt', {responseType: "text"})
    ]).subscribe(([params, diagrams]) => {
      this.diagramIds = diagrams.split('\n').filter(s => s.length !== 0);
      this.diagramId = this.diagramIds[0];
    })
  }

  next() {
    this.diagramIndex++;
    if (this.diagramIndex > this.diagramIds.length - 1) this.diagramIndex = 0;
    this.diagramId = this.diagramIds[this.diagramIndex];
  }
  previous() {
    this.diagramIndex--;
    if (this.diagramIndex < 0) this.diagramIndex = this.diagramIds.length - 1;
    this.diagramId = this.diagramIds[this.diagramIndex];
  }

}
