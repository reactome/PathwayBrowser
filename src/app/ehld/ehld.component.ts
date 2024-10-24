import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {Observable, tap} from "rxjs";
import {EhldService} from "../services/ehld.service";
import {DomSanitizer} from "@angular/platform-browser";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {DiagramStateService} from "../services/diagram-state.service";
import {Router} from "@angular/router";
import SvgPanZoom from 'svg-pan-zoom';


@Component({
  selector: 'cr-ehld',
  templateUrl: './ehld.component.html',
  styleUrls: ['./ehld.component.scss']
})

@UntilDestroy()
export class EhldComponent implements AfterViewInit {

  @ViewChild('ehld') ehldContainer?: ElementRef<HTMLDivElement>;
  @Input('id') diagramId: string = '';

  hasEHLD: boolean = false;
  svgContent: string = '';
  selectedElement: SVGGElement | undefined = undefined;
  selectedIdFromUrl = '';
  flaggedIdFromUrl: string[] = [];
  flaggedElements: (SVGGElement | undefined)[] = [];
  stIdToSVGGElement: Map<string, SVGGElement> = new Map<string, SVGGElement>();
  panZoom?: SvgPanZoom.Instance;

  constructor(private ehldService: EhldService,
              private sanitizer: DomSanitizer,
              private cdr: ChangeDetectorRef,
              private stateService: DiagramStateService,
              private router: Router,) {
  }

  selecting = this.stateService.onChange.select$.pipe(
    tap(value => this.selectedIdFromUrl = value))
    .subscribe();

  flagging = this.stateService.onChange.flag$.pipe(
    tap(value => this.flaggedIdFromUrl = value))
    .subscribe();

  ngAfterViewInit(): void {

    this.ehldService.hasEHLD$.pipe(untilDestroyed(this)).subscribe((hasEHLD) => {
      this.hasEHLD = hasEHLD;
      if (this.diagramId && this.hasEHLD) {
        this.loadEhldSvg().subscribe({
          next: () => {
            this.initializePanAndZoom();
          },
          error: () => {
            console.error('Error loading EHLD SVG');
          }
        })
      }
    });

  }

  // Example of zooming: https://stackblitz.com/edit/svg-pan-zoom?file=src%2Fapp%2Fapp.component.html,src%2Fapp%2Fapp.component.ts,src%2Fapp%2Fapp.module.ts
  // SVG pan zoom documentation: https://github.com/bumbu/svg-pan-zoom?tab=readme-ov-file
  initializePanAndZoom() {
    const svgElement = this.ehldContainer!.nativeElement.querySelector('svg');
    if (svgElement) {
      // Disable default tooltips to be shown when hovering on svg element
      svgElement.querySelectorAll('title').forEach(item => {
        item.innerHTML = '';
      });
      svgElement.setAttribute('width', '100%');
      svgElement.setAttribute('height', '100%');
      this.panZoom = SvgPanZoom(svgElement, {
        zoomEnabled: true,
        controlIconsEnabled: false,
        maxZoom: 1000,
        dblClickZoomEnabled: false
      });
    }
  }


  private loadEhldSvg(): Observable<string> {
    return this.ehldService.getEHLDSvg(this.diagramId).pipe(
      tap(svgContent => {
        if (svgContent) {
          const sanitizedSvg = this.sanitizer.bypassSecurityTrustHtml(svgContent);
          this.svgContent = sanitizedSvg as string;
          if (this.svgContent) {
            this.cdr.detectChanges();
            this.stIdToSVGGElement = this.ehldService.setStIdToSVGGElementMap(this.ehldContainer);
            this.setInitailSelection();
            this.setInitialFlag();
            this.addEventListenerToSvg();
          }
        } else {
          throw new Error('Error loading EHLD SVG');
        }
      })
    )
  }

  private setInitailSelection() {
    this.selectedElement = this.stIdToSVGGElement.get(this.selectedIdFromUrl)
    if (this.selectedElement) {
      this.ehldService.applyOutline(this.selectedElement, this.flaggedElements);
    }
  }

  private setInitialFlag() {
    this.flaggedElements = this.flaggedIdFromUrl
      .map(e => this.stIdToSVGGElement.get(e))
      .filter(e => e !== undefined);

    this.flaggedElements?.forEach(element => {
      if (element) {
        this.ehldService.applyFlagOutline(element)
      }
    });
  }

  private addEventListenerToSvg(): void {
    const svgElement = this.ehldContainer!.nativeElement.querySelectorAll('g[id^="REGION"]') as NodeListOf<SVGGElement>;

    svgElement.forEach((element: SVGGElement) => {
      element.addEventListener('mouseover', () => {
        if (element !== this.selectedElement) {
          this.ehldService.applyShadow(element);
        }
      })

      element.addEventListener('mouseout', () => {
        if (element !== this.selectedElement) {
          this.ehldService.removeShadow(element, this.flaggedElements);
        }
      })

      element.addEventListener('click', () => {
        if (this.selectedElement) {
          this.ehldService.removeOutline(this.selectedElement, this.flaggedElements);
        }
        this.selectedElement = element;

        const idAttr = this.selectedElement?.getAttribute('id');
        if (idAttr) {
          const stId = this.ehldService.getStableId(idAttr);
          if (stId) this.stateService.set('select', stId);
        }

        this.ehldService.applyOutline(element, this.flaggedElements);
      });

      element.addEventListener('dblclick', () => {
        console.log('SVG double clicked detected');
        const idAttr = this.selectedElement?.getAttribute('id');
        if (idAttr) {
          const stId = this.ehldService.getStableId(idAttr);
          if (stId) {
            this.diagramId = stId;
            this.router.navigate(['PathwayBrowser', this.diagramId], {
              queryParamsHandling: "preserve"
            }).then(() => {
              this.stateService.set('select', '');
            });
          }
        }
      })
    })
  }

}
