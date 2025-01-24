import {AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Analysis} from "../../../model/analysis.model";
import {environment} from "../../../../environments/environment";
import {DomSanitizer} from "@angular/platform-browser";
import {IconService} from "../../../services/icon.service";
import {Router} from "@angular/router";
import {getProperty, sortByYearDescending} from "../../../services/utils";
import {DatabaseObject} from "../../../model/graph/database-object.model";
import {InstanceEdit} from "../../../model/graph/instance-edit.model";
import {LiteratureReference} from "../../../model/graph/publication/literature-reference.model";
import {ReferenceEntity} from "../../../model/graph/reference-entity.model";


@Component({
  selector: 'cr-description',
  templateUrl: './description.component.html',
  styleUrl: './description.component.scss'
})
export class DescriptionComponent implements AfterViewInit, OnChanges {

  @Input('obj') obj?: DatabaseObject;
  @Input('analysisResult') analysisResult?: Analysis.Result;
  @Input('tabWidth') tabWidth?: number;

  iconContent: string = '';
  currentUrl!: string;
  authorship: { label: string, data: InstanceEdit[] | undefined }[] = []
  refs?: LiteratureReference[];
  referenceEntity?: ReferenceEntity;

  authored?: InstanceEdit[];
  reviewed?: InstanceEdit[];


  elements = [
    {key: 'input', label: 'Inputs'},
    {key: 'output', label: 'Outputs'},
    {key: 'catalystActivity', label: 'Catalyst Activity'},
    {key: 'inferredFrom', label: 'Inferred From'}
  ]

  constructor(private iconService: IconService,
              private sanitizer: DomSanitizer,
              private cdr: ChangeDetectorRef,
              private router: Router
  ) {
  }


  openDetailsPage(stId: string) {
    const url = `${environment.host}/content/detail/${stId}`;
    window.open(url, '_blank');
  }

  ngAfterViewInit(): void {

    if (!this.obj) return;

    this.currentUrl = this.router.url

    this.setIcon(this.obj);
    this.getRefs(this.obj);
    this.getAuthorship(this.obj)

  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['obj'] && changes['obj'].currentValue && this.obj) {
      this.setIcon(this.obj);
      this.getRefs(this.obj)
      this.getAuthorship(this.obj);
    }
  }

  setIcon(obj: DatabaseObject) {

    this.referenceEntity = getProperty(obj, 'referenceEntity');

    if (this.referenceEntity) {
      const identifier = this.referenceEntity.identifier;
      this.iconService.fetchIcon(identifier).subscribe(icon => {
        if (icon && this.obj) {
          const sanitizedSvg = this.sanitizer.bypassSecurityTrustHtml(icon);
          this.iconContent = sanitizedSvg as string;
          this.obj.hasIcon = true;
          this.cdr.detectChanges();
        }
      });
    }
  }

  getAuthorship(obj: DatabaseObject) {
    this.authored = getProperty(obj, 'authored');
    this.reviewed = getProperty(obj, 'reviewed');

    this.authorship = [
      ...((this.authored || []).length > 0 ? [{label: 'Author', data: this.authored}] : []),
      ...((this.reviewed || []).length > 0 ? [{label: 'Reviewer', data: this.reviewed}] : []),
    ];
  }

  getRefs(obj: DatabaseObject) {
    const refs = getProperty(obj, 'literatureReference');
    // Sort by year
    if (refs) {
      this.refs = sortByYearDescending(refs);
    }
  }

  getIcon(obj: DatabaseObject) {
    return this.iconService.getIconDetails(obj);
  }

  scrollToSection(sectionId: string) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({behavior: 'smooth'});
    }
  }

}
