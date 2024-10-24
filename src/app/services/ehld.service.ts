import {ElementRef, Injectable, Renderer2, RendererFactory2} from '@angular/core';
import {BehaviorSubject, catchError, Observable, of} from "rxjs";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";


@Injectable({
  providedIn: 'root'
})
export class EhldService {

  private readonly _HAS_EHLD = `${environment.host}/ContentService/data/query/`;
  private readonly _SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

  public renderer: Renderer2;

  // https://codepen.io/brucebentley/pen/orGPRg
  // Copy this color from diagram GWT
  filterColour = {
    YELLOW:
      "1 0 0 1 0 " +
      "0 1 0 1 0 " +
      "0 0 0 0 0 " +
      "0 0 0 1 0 ",
    //#0000ff
    BLUE:
      "0 0 0 0 0 " +
      "0 0 0 0 0 " +
      "0 0 1 1 0 " +
      "0 0 0 1 0 ",

    CYAN:
      "1 0 0 1 0 " +
      "0 0 0 0 0 " +
      "0 0 1 1 0 " +
      "0 0 0 1 0 ",
    //#6eb3e4
    SELECT:
      "0.4 0 0 0 0 " +
      "0 0.7 0 0 0 " +
      "0 0 0.89 0 0 " +
      "0 0 0 1 0 "
  };

  private _hasEHLD = new BehaviorSubject<boolean>(false);
  hasEHLD$ = this._hasEHLD.asObservable();

  constructor(private http: HttpClient, private rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  setHasEHLD(value: boolean): void {
    this._hasEHLD.next(value);
  }

  hasEHLD(diagramId: string): Observable<boolean> {
    let url = `${this._HAS_EHLD}${diagramId}/hasEHLD`;
    return this.http.get<boolean>(url).pipe(
      catchError(() => of(false))
    );
  }

  getEHLDSvg(id: string): Observable<string> {
    return this.http.get(`${environment.host}/download/current/ehld/${id}.svg`, {responseType: 'text'});
  }

  // Hover an element
  applyShadow(svgElement: SVGGElement,) {
    // const filterId = 'hoveringFilter';
    // // Check if the filter already exists; if not, create it
    // let existingFilter = document.getElementById(filterId);
    // if (!existingFilter) {
    //   // Create the filter element
    //   const filter = this.renderer.createElement('filter', this._SVG_NAMESPACE);
    //   filter.setAttribute('id', filterId);
    //   filter.setAttribute('x', '0');
    //   filter.setAttribute('y', '0');
    //
    //   // Create the feDropShadow element
    //   const dropShadow = this.renderer.createElement('feDropShadow', this._SVG_NAMESPACE);
    //   dropShadow.setAttribute('dx', '0'); // X offset
    //   dropShadow.setAttribute('dy', '0'); // Y offset
    //   dropShadow.setAttribute('stdDeviation', '7'); // Blur amount
    //   dropShadow.setAttribute('flood-color', '#006782'); // Shadow color, primary
    //   dropShadow.setAttribute('flood-opacity', '0.8');
    //
    //   // Append the feDropShadow to the filter
    //   this.renderer.appendChild(filter, dropShadow);
    //
    //   // Append the filter to the SVG element
    //   const svgParent = svgElement.closest('svg');
    //   const defs = svgParent!.querySelector('defs')
    //   if (defs) {
    //     this.renderer.appendChild(defs, filter);
    //   }
    // }
    // // Apply the filter to the SVG element
    // svgElement.style.filter = `url(#${filterId})`;
    const hoveringShadow = `drop-shadow(0 0 7px var(--select-edge))`;
    svgElement.style.filter = hoveringShadow;
  }

  removeShadow(svgElement: SVGGElement, flaggedElement: (SVGGElement | undefined)[]): void {
    svgElement.style.filter = 'none';

    if (this.isFlagged(svgElement, flaggedElement)) {
      this.applyFlagOutline(svgElement);
    }
  }

  // Select an element
  applyOutline(svgElement: SVGGElement, flaggedElement: (SVGGElement | undefined)[]) {
    // const filterId = 'selectionFilter';
    // let existingFilter = document.getElementById(filterId);
    // if (!existingFilter) {
    //
    //
    //   // Create the filter element
    //   const filter = this.renderer.createElement('filter', this._SVG_NAMESPACE);
    //   filter.setAttribute('id', filterId);
    //   filter.setAttribute('x', '-25%');
    //   filter.setAttribute('y', '-25%');
    //   filter.setAttribute('width', '150%');
    //   filter.setAttribute('height', '150%');
    //   filter.setAttribute('color-interpolation-filters', 'sRGB');
    //
    //   // Create morphology element for thick outline
    //   const morphology = this.renderer.createElement('feMorphology', this._SVG_NAMESPACE);
    //   morphology.setAttribute('in', 'SourceAlpha');
    //   morphology.setAttribute('operator', 'dilate');
    //   morphology.setAttribute('radius', '4'); // Set outline thickness here
    //   morphology.setAttribute('result', 'dilated');
    //
    //   // Create color matrix element to convert to blue
    //   const colorMatrix = this.renderer.createElement('feFlood', this._SVG_NAMESPACE);
    //   colorMatrix.setAttribute('flood-color', 'var(--select-edge)');
    //   colorMatrix.setAttribute('result', 'outlineColor');
    //
    //   const composite = this.renderer.createElement('feComposite', this._SVG_NAMESPACE);
    //   composite.setAttribute('in', 'outlineColor');
    //   composite.setAttribute('in2', 'dilated');
    //   composite.setAttribute('operator', 'in');
    //   composite.setAttribute('result', 'outline');
    //
    //
    //   // Merge element
    //   const merge = this.renderer.createElement('feMerge', this._SVG_NAMESPACE);
    //
    //   // Merge node (the outline)
    //   const mergeNode1 = this.renderer.createElement('feMergeNode', this._SVG_NAMESPACE);
    //   mergeNode1.setAttribute('in', 'outline');
    //   // Second merge node (the original graphic)
    //   const mergeNode2 = this.renderer.createElement('feMergeNode', this._SVG_NAMESPACE);
    //   mergeNode2.setAttribute('in', 'SourceGraphic');
    //   // Append the nodes to the merge
    //   this.renderer.appendChild(merge, mergeNode1);
    //   this.renderer.appendChild(merge, mergeNode2);
    //
    //   // Append the filter components
    //   this.renderer.appendChild(filter, morphology);
    //   this.renderer.appendChild(filter, colorMatrix);
    //   this.renderer.appendChild(filter, composite);
    //   this.renderer.appendChild(filter, merge);
    //
    //   const svgParent = svgElement.closest('svg');
    //   const defs = svgParent!.querySelector('defs');
    //   if (defs) {
    //     this.renderer.appendChild(defs, filter);
    //   }
    // }

    // svgElement.style.filter = `url(#${filterId})`;
    // svgElement.classList.add('selected')
    // @ts-ignore
    // for (let e of svgElement?.parentElement?.children) {
    //   console.log(e)
    //   if (e.id !== 'BG' && e.id !== 'FG') {
    //     for (let child of e.children) {
    //       if (child.id !== 'ARROWS') {
    //         child.style.filter= 'grayscale(1)'
    //       }
    //     }
    //   // } else {
    //     e.style.filter = 'grayscale(1)'
    //   }
    // }
    // svgElement.style.filter = 'none';
    //  svgElement.style.filter = `drop-shadow(2px 4px 6px black )`
    // var(--select-edge))`
    //svgElement.style.filter = `drop-shadow(0 0 0 var(--select-edge)) drop-shadow(0 0 0 var(--select-edge))  drop-shadow(0 0 0 var(--select-edge))`;

    const selectionOutline = `drop-shadow(0 0 4px var(--select-edge)) drop-shadow(0 0 4px var(--select-edge)) drop-shadow(0 0 4px var(--select-edge))  drop-shadow(0 0 4px var(--select-edge))`;

    if (this.isFlagged(svgElement, flaggedElement)) {
      const flagOutline = `drop-shadow(0 0 7px var(--flag))`;
      svgElement.style.filter = `${flagOutline} ${selectionOutline}`;
    } else {
      svgElement.style.filter = selectionOutline;
    }
  }

  removeOutline(svgElement: SVGGElement, flaggedElement: (SVGGElement | undefined)[]) {
    svgElement.style.filter = 'none';
    if (this.isFlagged(svgElement, flaggedElement)) {
      this.applyFlagOutline(svgElement);
    }
  }


  applyFlagOutline(svgElement: SVGGElement) {
    svgElement.style.filter = `drop-shadow(0 0 4px var(--flag)) drop-shadow(0 0 4px var(--flag)) drop-shadow(0 0 4px var(--flag))  drop-shadow(0 0 4px var(--flag))`;
  }

  removeFlagOutline(svgElement: SVGGElement) {
    svgElement.style.filter = 'none'
  }


  isFlagged(element: SVGGElement, flaggedElement: (SVGGElement | undefined)[]): boolean {
    return flaggedElement?.includes(element) ?? false;
  }


  /***
   * Takes as input a string like "OVERVIEW-R-SSS-NNNNNNN"
   * or "REGION-R-SSS-NNNNNN, filters out the first part and
   * keeps only the stable identifier.
   *
   * @param identifier the id of the SVG element
   * @return the stable identifier
   */
  getStableId(identifier: string) {
    const STID_PATTERN_LITE = /R-[A-Z]{3}-[0-9]{3,}/;

    if (identifier && identifier.trim()) {
      const result = STID_PATTERN_LITE.exec(identifier);

      if (result && result.length > 0) {
        return result[0]; // First match
      }
    }
    return null;
  }


  setStIdToSVGGElementMap(container: ElementRef<HTMLDivElement> | undefined) {
    const map = new Map<string, SVGGElement>();
    const svgElement = container!.nativeElement.querySelectorAll('g[id^="REGION"]') as NodeListOf<SVGGElement>;
    svgElement.forEach(svgElement => {
      const idAttr = svgElement.getAttribute('id');
      if (idAttr) {
        const stId = this.getStableId(idAttr);
        if (stId) {
          map.set(stId, svgElement);
        }
      }
    })
    return map
  }


}
